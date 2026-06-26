export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';

// Family billing contracts (Billing pilot, phase 1). The structured per-family
// rate + CCAP subsidy/co-pay split + pilot flag that replaces the owners'
// spreadsheet. Admin only, service role (the families/contracts tables deny the
// anon key), center-scoped so a center-bound admin never sees or edits another
// center's families.
//
// GET  -> families (center-scoped) each with their billing contract (or null).
// PUT  -> upsert one family's contract (keyed on family_id). Bills no one; this
//         is the contract record only.

const RATE_UNITS = ['weekly', 'biweekly', 'monthly', 'daily'];
const CCAP_STATUSES = ['none', 'pending', 'active'];

// Center derivation: a center-bound admin is locked to their own center; a
// cross-center director (owner/superadmin, or no home center) follows the
// cc_center cookie, else all centers. Mirrors /api/admin/families GET.
function derive(request: NextRequest, role: string, sessionCenter: string | null) {
  const crossCenter = role === 'owner' || role === 'superadmin' || !sessionCenter;
  const picked = request.cookies.get('cc_center')?.value || null;
  return { crossCenter, centerId: crossCenter ? picked : sessionCenter };
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  const role = (session.user.role || '').toLowerCase();
  const { centerId } = derive(request, role, session.user.center_id ?? null);

  let famQ = supabase
    .from('families')
    .select('id, email, status, center_id')
    .eq('status', 'active')
    .limit(5000);
  if (centerId) famQ = famQ.eq('center_id', centerId);

  // Fetch broad, join in JS (PostgREST .in() can silently drop rows). The
  // contracts carry CCAP case numbers, so scope that query to the active center
  // too (defense in depth on top of the families filter below).
  let contractQ = supabase.from('family_billing_contracts').select('*').limit(5000);
  if (centerId) contractQ = contractQ.eq('center_id', centerId);
  const [{ data: fams }, { data: parents }, { data: contracts }] = await Promise.all([
    famQ,
    supabase
      .from('family_parents')
      .select('family_id, name, is_primary')
      .limit(5000),
    contractQ,
  ]);

  const contractByFamily = new Map<string, Record<string, unknown>>();
  for (const c of contracts ?? []) contractByFamily.set(c.family_id as string, c);

  const families = (fams || [])
    .map((f) => {
      const ps = (parents || []).filter((p) => p.family_id === f.id);
      const primary = ps.find((p) => p.is_primary) || ps[0];
      return {
        id: f.id as string,
        name: (primary?.name as string) || (f.email as string) || 'Family',
        email: (f.email as string) || '',
        contract: contractByFamily.get(f.id as string) ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ families }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const familyId = String(body.family_id || '').trim();
  if (!familyId) return NextResponse.json({ error: 'family_id is required' }, { status: 400 });

  // Center scope: a center-bound admin may only set a contract for a family at
  // their own center. The family's center is read server-side, never trusted.
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !myCenter;
  const { data: fam } = await supabase
    .from('families')
    .select('center_id')
    .eq('id', familyId)
    .maybeSingle();
  if (!fam) return NextResponse.json({ error: 'Family not found' }, { status: 404 });
  const famCenter = (fam.center_id as string | null) ?? null;
  if (!crossCenter && famCenter !== myCenter) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  // Validate the small enums; clamp numbers; everything else is optional text.
  const rateUnit = RATE_UNITS.includes(String(body.rate_unit)) ? String(body.rate_unit) : 'weekly';
  const ccapStatus = CCAP_STATUSES.includes(String(body.ccap_status)) ? String(body.ccap_status) : 'none';
  const copayFreq = RATE_UNITS.includes(String(body.copay_frequency)) ? String(body.copay_frequency) : 'weekly';
  const num = (v: unknown): number | null => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
  };
  // Cap free text so a runaway paste can't bloat the row (admin-only, but tidy).
  const text = (v: unknown, max: number): string | null => {
    const s = v ? String(v).trim() : '';
    return s ? s.slice(0, max) : null;
  };

  const row = {
    family_id: familyId,
    center_id: famCenter,
    rate_amount: num(body.rate_amount) ?? 0,
    rate_unit: rateUnit,
    schedule_note: text(body.schedule_note, 200),
    ccap_status: ccapStatus,
    ccap_case_number: text(body.ccap_case_number, 100),
    ccap_subsidy_amount: num(body.ccap_subsidy_amount),
    copay_amount: num(body.copay_amount),
    copay_frequency: copayFreq,
    is_pilot: body.is_pilot === true,
    effective_date: body.effective_date ? String(body.effective_date).slice(0, 10) : null,
    notes: text(body.notes, 1000),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('family_billing_contracts')
    .upsert(row, { onConflict: 'family_id' });
  if (error) {
    return NextResponse.json({ error: 'Could not save the contract' }, { status: 500 });
  }

  await logAudit({
    actor: session.user,
    action: 'billing.contract.update',
    targetType: 'family_billing_contracts',
    targetId: familyId,
    centerId: famCenter ?? myCenter,
    detail: { is_pilot: row.is_pilot, ccap_status: row.ccap_status },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true });
}
