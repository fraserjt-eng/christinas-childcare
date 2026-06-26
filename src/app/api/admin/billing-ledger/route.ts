export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';

// Billing ledger (pilot phase 2): a family's charges + payments + running
// balance. Admin only, service role, center-scoped, and PILOT-GATED — entries
// are only allowed for a family whose contract has is_pilot = true, so the
// running tab never turns on for a family still billed through Brightwheel.
//
// GET    ?family_id=  -> { charges, payments, chargeTotal, paymentTotal, balance }
// POST   { family_id, type:'charge'|'payment'|'generate_tuition', ... }
// DELETE ?id=&type=charge|payment  -> remove one entry (admin correction)

const CHARGE_KINDS = ['tuition', 'registration', 'late_fee', 'supply_fee', 'adjustment', 'credit', 'other'];
const PAYMENT_METHODS = ['cash', 'check', 'transfer', 'card', 'ccap_subsidy', 'adjustment', 'other'];

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function num(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}
function text(v: unknown, max: number): string | null {
  const s = v ? String(v).trim() : '';
  return s ? s.slice(0, max) : null;
}
function ymd(v: unknown): string | null {
  const s = v ? String(v).slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

// Resolve the family, enforce center scope, and require the pilot flag. Returns
// the family's center_id + contract on success, or an error response.
async function gateFamily(
  request: NextRequest,
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  session: { user: { role?: string | null; center_id?: string | null } },
  familyId: string
): Promise<
  | { ok: true; centerId: string | null; contract: Record<string, unknown> | null }
  | { ok: false; res: NextResponse }
> {
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !myCenter;

  const { data: fam } = await supabase
    .from('families')
    .select('center_id')
    .eq('id', familyId)
    .maybeSingle();
  if (!fam) return { ok: false, res: fail('Family not found', 404) };
  const famCenter = (fam.center_id as string | null) ?? null;
  if (!crossCenter && famCenter !== myCenter) {
    return { ok: false, res: fail('Not your center', 403) };
  }

  // Only the fields the ledger needs. Do NOT pull the whole contract row here:
  // it carries the CCAP case number, which the ledger response never needs.
  const { data: contract } = await supabase
    .from('family_billing_contracts')
    .select('id, rate_amount, rate_unit, is_pilot')
    .eq('family_id', familyId)
    .maybeSingle();
  if (!contract || contract.is_pilot !== true) {
    return { ok: false, res: fail('This family is not in the billing pilot. Turn on the pilot on their contract first.', 409) };
  }
  return { ok: true, centerId: famCenter, contract };
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const familyId = (request.nextUrl.searchParams.get('family_id') || '').trim();
  if (!familyId) return fail('family_id required', 400);
  const gate = await gateFamily(request, supabase, session, familyId);
  if (!gate.ok) return gate.res;

  const [{ data: charges }, { data: payments }, { data: parents }] = await Promise.all([
    supabase.from('billing_charges').select('*').eq('family_id', familyId).order('charge_date', { ascending: false }).limit(5000),
    supabase.from('billing_payments').select('*').eq('family_id', familyId).order('paid_on', { ascending: false }).limit(5000),
    supabase.from('family_parents').select('name, is_primary').eq('family_id', familyId),
  ]);

  const primary = (parents ?? []).find((p) => p.is_primary) || (parents ?? [])[0];
  const familyName = (primary?.name as string) || 'Family';
  const chargeTotal = (charges ?? []).reduce((s, c) => s + Number(c.amount || 0), 0);
  const paymentTotal = (payments ?? []).reduce((s, p) => s + Number(p.amount || 0), 0);
  const balance = Math.round((chargeTotal - paymentTotal) * 100) / 100;

  return NextResponse.json(
    { familyName, charges: charges ?? [], payments: payments ?? [], chargeTotal, paymentTotal, balance, contract: gate.contract },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail('Invalid request body', 400); }
  const familyId = String(body.family_id || '').trim();
  if (!familyId) return fail('family_id required', 400);
  const type = String(body.type || '').trim();

  const gate = await gateFamily(request, supabase, session, familyId);
  if (!gate.ok) return gate.res;
  const centerId = gate.centerId;
  let auditAmount: number | null = null;

  if (type === 'charge') {
    const kind = CHARGE_KINDS.includes(String(body.kind)) ? String(body.kind) : 'other';
    let amount = num(body.amount);
    if (amount === null) return fail('A charge amount is required', 400);
    // A credit subtracts: store it negative regardless of the sign sent.
    if (kind === 'credit') amount = -Math.abs(amount);
    auditAmount = amount;
    const { error } = await supabase.from('billing_charges').insert({
      family_id: familyId,
      center_id: centerId,
      contract_id: (gate.contract?.id as string) ?? null,
      kind,
      description: text(body.description, 200),
      amount,
      period_start: ymd(body.period_start),
      period_end: ymd(body.period_end),
      charge_date: ymd(body.charge_date) || undefined,
    });
    if (error) return fail('Could not add the charge', 500);
  } else if (type === 'payment') {
    const method = PAYMENT_METHODS.includes(String(body.method)) ? String(body.method) : 'other';
    const amount = num(body.amount);
    if (amount === null || amount <= 0) return fail('A payment amount greater than zero is required', 400);
    auditAmount = amount;
    const { error } = await supabase.from('billing_payments').insert({
      family_id: familyId,
      center_id: centerId,
      amount,
      method,
      reference: text(body.reference, 100),
      paid_on: ymd(body.paid_on) || undefined,
      note: text(body.note, 200),
    });
    if (error) return fail('Could not record the payment', 500);
  } else if (type === 'generate_tuition') {
    // One click instead of manual entry: create this period's tuition charge
    // straight from the contract rate. The friction the owners feel on Saturday.
    const rate = num(gate.contract?.rate_amount);
    if (!rate || rate <= 0) return fail('Set a rate on the contract first', 409);
    auditAmount = rate;
    const unit = String(gate.contract?.rate_unit || 'weekly');
    const start = ymd(body.period_start);
    const end = ymd(body.period_end);
    const { error } = await supabase.from('billing_charges').insert({
      family_id: familyId,
      center_id: centerId,
      contract_id: (gate.contract?.id as string) ?? null,
      kind: 'tuition',
      description: `Tuition (${unit})`,
      amount: rate,
      period_start: start,
      period_end: end,
      charge_date: start || undefined,
    });
    if (error) return fail('Could not generate the tuition charge', 500);
  } else {
    return fail('Unknown entry type', 400);
  }

  await logAudit({
    actor: session.user,
    action: `billing.${type}.add`,
    targetType: 'family',
    targetId: familyId,
    centerId: centerId ?? session.user.center_id ?? null,
    detail: { type, amount: auditAmount },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const id = (request.nextUrl.searchParams.get('id') || '').trim();
  const type = (request.nextUrl.searchParams.get('type') || '').trim();
  if (!id || (type !== 'charge' && type !== 'payment')) {
    return fail('id and a valid type are required', 400);
  }
  const table = type === 'charge' ? 'billing_charges' : 'billing_payments';

  // Read the row's family to enforce the same center + pilot gate before delete.
  const { data: row } = await supabase.from(table).select('family_id').eq('id', id).maybeSingle();
  if (!row) return fail('Entry not found', 404);
  const gate = await gateFamily(request, supabase, session, row.family_id as string);
  if (!gate.ok) return gate.res;

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return fail('Could not delete the entry', 500);

  await logAudit({
    actor: session.user,
    action: `billing.${type}.delete`,
    targetType: 'family',
    targetId: row.family_id as string,
    centerId: gate.centerId ?? session.user.center_id ?? null,
    detail: { id, type },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true });
}
