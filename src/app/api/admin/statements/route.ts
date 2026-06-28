export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { logAudit, auditIp } from '@/lib/audit-log';

// Co-payment statements (send-only, no payment processing). Admin enters the
// amount per period; the client renders a PDF for download. Emailing is wired
// on later. Service role; admin only.

// GET: the families (with a primary parent + co-pay default) plus the
// statements already issued, so the admin page can list and create.
export async function GET() {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Fetch broad, join in JS (PostgREST .in() can silently drop rows). The
  // contracts + charges + payments let us compute each PILOT family's live
  // ledger balance, so a statement amount comes from the running tab instead of
  // being hand-keyed (Phase 4). Non-pilot families have no ledger -> null.
  const [
    { data: fams },
    { data: parents },
    { data: stmts },
    { data: contracts },
    { data: charges },
    { data: payments },
  ] = await Promise.all([
    supabase.from('families').select('id, email, status, copay_default_amount, center_id').limit(5000),
    supabase.from('family_parents').select('family_id, name, email, is_primary').limit(5000),
    supabase
      .from('family_statements')
      .select('id, family_id, period_label, period_start, period_end, amount, note, status, created_at, sent_at')
      .limit(5000),
    supabase.from('family_billing_contracts').select('family_id, is_pilot').limit(5000),
    supabase.from('billing_charges').select('family_id, amount').limit(5000),
    supabase.from('billing_payments').select('family_id, amount').limit(5000),
  ]);

  // Per-pilot-family ledger balance (charges - payments), rounded to cents.
  const pilotFamilies = new Set(
    (contracts ?? []).filter((c) => c.is_pilot === true).map((c) => c.family_id as string)
  );
  const chargeByFamily = new Map<string, number>();
  for (const c of charges ?? []) {
    const k = c.family_id as string;
    chargeByFamily.set(k, (chargeByFamily.get(k) || 0) + Number(c.amount || 0));
  }
  const payByFamily = new Map<string, number>();
  for (const p of payments ?? []) {
    const k = p.family_id as string;
    payByFamily.set(k, (payByFamily.get(k) || 0) + Number(p.amount || 0));
  }

  // Center scope (mirror the POST handler): a center-bound admin sees only
  // their own center's families and statements. An owner/superadmin, or a
  // director with no center binding, sees all (cross-center). Defense-in-depth
  // for multi-center; with a single center today this is a no-op for everyone.
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !myCenter;
  const centerByFamily = new Map<string, string | null>();
  for (const f of fams ?? []) {
    centerByFamily.set(f.id as string, (f.center_id as string | null) ?? null);
  }
  const inScope = (familyId: string) =>
    crossCenter || centerByFamily.get(familyId) === myCenter;

  const families = (fams ?? [])
    .filter((f) => (f.status as string) !== 'inactive')
    .filter((f) => inScope(f.id as string))
    .map((f) => {
      const id = f.id as string;
      const ps = (parents ?? []).filter((p) => p.family_id === id);
      const primary = ps.find((p) => p.is_primary) || ps[0];
      const ledgerBalance = pilotFamilies.has(id)
        ? Math.round(((chargeByFamily.get(id) || 0) - (payByFamily.get(id) || 0)) * 100) / 100
        : null;
      return {
        id,
        email: (f.email as string) || '',
        parentName: (primary?.name as string) || '',
        copay_default_amount:
          f.copay_default_amount != null ? Number(f.copay_default_amount) : null,
        ledger_balance: ledgerBalance,
      };
    })
    .sort((a, b) => a.parentName.localeCompare(b.parentName));

  const statements = (stmts ?? [])
    .filter((s) => inScope(s.family_id as string))
    .map((s) => ({
      id: s.id as string,
      family_id: s.family_id as string,
      period_label: (s.period_label as string) || '',
      period_start: (s.period_start as string | null) ?? null,
      period_end: (s.period_end as string | null) ?? null,
      amount: s.amount != null ? Number(s.amount) : 0,
      note: (s.note as string | null) ?? '',
      status: (s.status as string) || 'generated',
      created_at: (s.created_at as string) || '',
      sent_at: (s.sent_at as string | null) ?? null,
    }))
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  return NextResponse.json(
    { families, statements },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

// POST { family_id, period_label, period_start?, period_end?, amount, note? }
// Records a statement. Does NOT send anything.
export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: {
    family_id?: string;
    period_label?: string;
    period_start?: string;
    period_end?: string;
    amount?: number;
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const familyId = (body.family_id || '').trim();
  const periodLabel = (body.period_label || '').trim();
  const amount = Number(body.amount);
  if (!familyId) {
    return NextResponse.json({ error: 'Choose a family' }, { status: 400 });
  }
  if (!periodLabel) {
    return NextResponse.json({ error: 'A statement period is required' }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: 'Enter a valid amount' }, { status: 400 });
  }

  // Confirm the family exists + read its center.
  const { data: family } = await supabase
    .from('families')
    .select('id, center_id')
    .eq('id', familyId)
    .maybeSingle();
  if (!family) {
    return NextResponse.json({ error: 'Unknown family' }, { status: 404 });
  }
  // Center scope: a center-bound admin may only issue a statement for a family at
  // their own center, and the statement is recorded under the FAMILY's center
  // (not an arbitrary "any center", which mislabeled records in multi-center).
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !myCenter;
  const familyCenter = (family.center_id as string | null) ?? null;
  if (!crossCenter && familyCenter !== myCenter) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  const employee = await resolveSessionEmployee(session);

  const { data: created, error } = await supabase
    .from('family_statements')
    .insert({
      family_id: familyId,
      center_id: familyCenter,
      period_label: periodLabel,
      period_start: body.period_start || null,
      period_end: body.period_end || null,
      amount,
      note: body.note?.trim() || null,
      status: 'generated',
      created_by: employee?.id ?? null,
    })
    .select('id, family_id, period_label, period_start, period_end, amount, note, status, created_at, sent_at')
    .single();

  if (error || !created) {
    return NextResponse.json({ error: 'Could not save the statement' }, { status: 500 });
  }

  await logAudit({
    actor: session.user,
    action: 'statement.create',
    targetType: 'family_statement',
    targetId: created.id as string,
    centerId: familyCenter,
    detail: { family_id: familyId, amount, period_label: periodLabel },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true, statement: created });
}
