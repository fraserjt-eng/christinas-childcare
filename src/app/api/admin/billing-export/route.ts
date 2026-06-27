export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';
import type { BillingExportRow } from '@/lib/billing-export';

// Billing export rows for PILOT families over a period. Admin only, service
// role, center-scoped. The client builds the CSV (CCAP draft or summary) from
// this safe payload — no PII via the anon client, same pattern as the DCYF
// attendance export. Reads only; bills no one.
//
// GET ?period_start=YYYY-MM-DD&period_end=YYYY-MM-DD -> { rows, period }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  const sp = request.nextUrl.searchParams;
  const periodStart = sp.get('period_start') || '';
  const periodEnd = sp.get('period_end') || '';
  if (!DATE_RE.test(periodStart) || !DATE_RE.test(periodEnd) || periodStart > periodEnd) {
    return NextResponse.json({ error: 'A valid period_start and period_end are required' }, { status: 400 });
  }

  // Center scope: center-bound admin locked to own center; owner/superadmin
  // follows the cc_center cookie (mirrors /api/admin/families GET).
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !sessionCenter;
  const picked = request.cookies.get('cc_center')?.value || null;
  const centerId = crossCenter ? picked : sessionCenter;

  // Pilot contracts (center-scoped) define who is in the export.
  let contractQ = supabase
    .from('family_billing_contracts')
    .select('family_id, ccap_status, ccap_case_number, ccap_subsidy_amount, copay_amount, is_pilot, center_id')
    .eq('is_pilot', true)
    .limit(5000);
  if (centerId) contractQ = contractQ.eq('center_id', centerId);

  const [{ data: contracts }, { data: fams }, { data: parents }, { data: kids }, { data: charges }, { data: payments }] =
    await Promise.all([
      contractQ,
      supabase.from('families').select('id, email').limit(5000),
      supabase.from('family_parents').select('family_id, name, is_primary').limit(5000),
      supabase.from('family_children').select('family_id, name').limit(5000),
      supabase.from('billing_charges').select('family_id, amount, charge_date').limit(5000),
      supabase.from('billing_payments').select('family_id, amount, paid_on').limit(5000),
    ]);

  const inPeriod = (d: string | null | undefined) => {
    const s = (d || '').slice(0, 10);
    return DATE_RE.test(s) && s >= periodStart && s <= periodEnd;
  };

  const rows: BillingExportRow[] = (contracts ?? [])
    .map((c) => {
      const fid = c.family_id as string;
      const fam = (fams ?? []).find((f) => f.id === fid);
      const ps = (parents ?? []).filter((p) => p.family_id === fid);
      const primary = ps.find((p) => p.is_primary) || ps[0];
      const childNames = (kids ?? [])
        .filter((k) => k.family_id === fid)
        .map((k) => (k.name as string) || '')
        .filter(Boolean)
        .join('; ');
      const famCharges = (charges ?? []).filter((x) => x.family_id === fid);
      const famPayments = (payments ?? []).filter((x) => x.family_id === fid);
      const periodCharges = famCharges
        .filter((x) => inPeriod(x.charge_date as string))
        .reduce((s, x) => s + Number(x.amount || 0), 0);
      const periodPayments = famPayments
        .filter((x) => inPeriod(x.paid_on as string))
        .reduce((s, x) => s + Number(x.amount || 0), 0);
      const allCharges = famCharges.reduce((s, x) => s + Number(x.amount || 0), 0);
      const allPayments = famPayments.reduce((s, x) => s + Number(x.amount || 0), 0);
      const round = (n: number) => Math.round(n * 100) / 100;
      return {
        familyName: (primary?.name as string) || (fam?.email as string) || 'Family',
        email: (fam?.email as string) || '',
        childNames,
        ccapStatus: (c.ccap_status as string) || 'none',
        ccapCaseNumber: (c.ccap_case_number as string) || '',
        ccapSubsidyAmount: c.ccap_subsidy_amount != null ? Number(c.ccap_subsidy_amount) : null,
        copayAmount: c.copay_amount != null ? Number(c.copay_amount) : null,
        periodCharges: round(periodCharges),
        periodPayments: round(periodPayments),
        balance: round(allCharges - allPayments),
      };
    })
    .sort((a, b) => a.familyName.localeCompare(b.familyName));

  await logAudit({
    actor: session.user,
    action: 'billing.export',
    targetType: 'billing',
    targetId: centerId ?? 'all',
    centerId: centerId ?? session.user.center_id ?? null,
    detail: { period_start: periodStart, period_end: periodEnd, row_count: rows.length },
    ip: auditIp(request),
  });

  return NextResponse.json(
    { rows, period: { start: periodStart, end: periodEnd } },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
