export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';

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

  // Fetch broad, join in JS (PostgREST .in() can silently drop rows).
  const [{ data: fams }, { data: parents }, { data: stmts }] = await Promise.all([
    supabase.from('families').select('id, email, status, copay_default_amount').limit(5000),
    supabase.from('family_parents').select('family_id, name, email, is_primary').limit(5000),
    supabase
      .from('family_statements')
      .select('id, family_id, period_label, period_start, period_end, amount, note, status, created_at, sent_at')
      .limit(5000),
  ]);

  const families = (fams ?? [])
    .filter((f) => (f.status as string) !== 'inactive')
    .map((f) => {
      const ps = (parents ?? []).filter((p) => p.family_id === f.id);
      const primary = ps.find((p) => p.is_primary) || ps[0];
      return {
        id: f.id as string,
        email: (f.email as string) || '',
        parentName: (primary?.name as string) || '',
        copay_default_amount:
          f.copay_default_amount != null ? Number(f.copay_default_amount) : null,
      };
    })
    .sort((a, b) => a.parentName.localeCompare(b.parentName));

  const statements = (stmts ?? [])
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

  // Confirm the family exists + grab its center for the record.
  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('id', familyId)
    .maybeSingle();
  if (!family) {
    return NextResponse.json({ error: 'Unknown family' }, { status: 404 });
  }
  // The center for the record: any center (single-center business today).
  const { data: anyCenter } = await supabase
    .from('centers')
    .select('id')
    .limit(1)
    .maybeSingle();

  const employee = await resolveSessionEmployee(session);

  const { data: created, error } = await supabase
    .from('family_statements')
    .insert({
      family_id: familyId,
      center_id: anyCenter?.id ?? null,
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

  return NextResponse.json({ ok: true, statement: created });
}
