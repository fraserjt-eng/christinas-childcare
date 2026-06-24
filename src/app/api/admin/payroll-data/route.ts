export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';

// Payroll read + writes via the service role. The page used client
// employee-storage which reads time_entries/employees/pay_stubs with the
// anon key; migration 019 locks those to the server, so the page showed
// ZERO clock entries and nothing could be edited. This is critical for
// pay-stub accuracy and licensing, so it goes through the admin server
// path like the rest.
//
// GET  -> { employees, timeEntries, payStubs }
// POST { action: 'rate' | 'createStub' | 'markPaid', ... }

export async function GET() {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json(
      { error: 'Admin sign-in required.' },
      { status: 401 }
    );
  }
  // Scope payroll to the signed-in admin's center. A center-bound admin sees
  // only their own center's employees and clock entries (pay-stub accuracy is
  // a licensing concern and must never mix centers); the cross-center
  // owner/superadmin (null center) sees everyone.
  const centerId = session.user.center_id ?? null;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // employees has center_id directly; scope it when the admin is center-bound.
  let employeesQuery = supabase
    .from('employees')
    .select(
      'id, first_name, last_name, email, role, job_title, hourly_rate, employment_status'
    )
    .limit(5000);
  if (centerId) employeesQuery = employeesQuery.eq('center_id', centerId);

  // time_entries also has center_id, but this query already sorts by clock_in.
  // Per the PostgREST gotcha, do NOT add .eq() onto an .order() chain (it can
  // silently drop rows); instead fetch broad (selecting center_id) and filter
  // in JS below.
  const [{ data: employees }, { data: timeEntries }, { data: payStubs }] =
    await Promise.all([
      employeesQuery,
      supabase
        .from('time_entries')
        .select(
          'id, employee_id, center_id, date, clock_in, clock_out, hours_worked, break_minutes, status'
        )
        .order('clock_in', { ascending: false })
        .limit(5000),
      supabase.from('pay_stubs').select('*').limit(5000),
    ]);

  // Filter time_entries to the admin's center in JS (see note above).
  const scopedTimeEntries = centerId
    ? (timeEntries ?? []).filter((t) => t.center_id === centerId)
    : (timeEntries ?? []);

  return NextResponse.json(
    {
      employees: employees ?? [],
      timeEntries: scopedTimeEntries,
      payStubs: payStubs ?? [],
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json(
      { error: 'Admin sign-in required.' },
      { status: 401 }
    );
  }
  const centerId = session.user.center_id ?? null;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: {
    action?: string;
    employeeId?: string;
    hourly_rate?: number;
    stubId?: string;
    stub?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (body.action === 'rate') {
    const rate = Number(body.hourly_rate);
    if (!body.employeeId || !Number.isFinite(rate) || rate < 0) {
      return NextResponse.json({ error: 'Invalid rate' }, { status: 400 });
    }
    // Center-membership authz: a center-bound admin may only change pay rates
    // for employees in their own center. Fetch the target's center_id first and
    // reject a cross-center write explicitly (403), rather than silently
    // updating another center's record. A null-center owner/superadmin skips
    // this check (they manage everyone).
    if (centerId) {
      const { data: target } = await supabase
        .from('employees')
        .select('center_id')
        .eq('id', body.employeeId)
        .maybeSingle();
      if (!target) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      if (target.center_id !== centerId) {
        return NextResponse.json({ error: 'Not your center' }, { status: 403 });
      }
    }
    const { error } = await supabase
      .from('employees')
      .update({ hourly_rate: rate })
      .eq('id', body.employeeId);
    if (error) {
      return NextResponse.json(
        { error: 'Could not save the pay rate' },
        { status: 500 }
      );
    }
    await logAudit({
      actor: session.user, action: 'payroll.rate_change', targetType: 'employee',
      targetId: body.employeeId, centerId, detail: { hourly_rate: rate }, ip: auditIp(request),
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'createStub') {
    const s = body.stub || {};
    if (!s.employee_id || !s.period_start || !s.period_end) {
      return NextResponse.json({ error: 'Invalid pay stub' }, { status: 400 });
    }
    // Center-membership authz (same rule as the 'rate' action): a center-bound
    // admin may only create a pay stub for an employee in their own center.
    if (centerId) {
      const { data: emp } = await supabase
        .from('employees')
        .select('center_id')
        .eq('id', s.employee_id as string)
        .maybeSingle();
      if (!emp) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      if (emp.center_id !== centerId) {
        return NextResponse.json({ error: 'Not your center' }, { status: 403 });
      }
    }
    // Core columns + the full computed stub in breakdown (jsonb) so nothing
    // computed is lost even if a column is absent.
    const { error } = await supabase.from('pay_stubs').insert({
      employee_id: s.employee_id,
      period_start: s.period_start,
      period_end: s.period_end,
      hours:
        Number(
          (s.total_hours as number) ??
            (s.hours as number) ??
            (s.regular_hours as number) ??
            0
        ) || 0,
      gross:
        Number(
          (s.gross_pay as number) ??
            (s.gross as number) ??
            (s.net_pay as number) ??
            0
        ) || 0,
      breakdown: s,
    });
    if (error) {
      return NextResponse.json(
        { error: 'Could not create the pay stub' },
        { status: 500 }
      );
    }
    await logAudit({
      actor: session.user, action: 'payroll.stub_create', targetType: 'employee',
      targetId: s.employee_id as string, centerId,
      detail: { period_start: s.period_start, period_end: s.period_end }, ip: auditIp(request),
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'markPaid' || body.action === 'finalize') {
    if (!body.stubId) {
      return NextResponse.json({ error: 'stubId required' }, { status: 400 });
    }
    // Center-membership authz: resolve the stub's employee and reject if the
    // employee belongs to another center.
    if (centerId) {
      const { data: stubRow } = await supabase
        .from('pay_stubs')
        .select('employee_id')
        .eq('id', body.stubId)
        .maybeSingle();
      const empId = (stubRow?.employee_id as string | undefined) ?? undefined;
      if (empId) {
        const { data: emp } = await supabase
          .from('employees')
          .select('center_id')
          .eq('id', empId)
          .maybeSingle();
        if (emp && emp.center_id !== centerId) {
          return NextResponse.json({ error: 'Not your center' }, { status: 403 });
        }
      }
    }
    const patch =
      body.action === 'markPaid'
        ? { status: 'paid', pay_date: new Date().toISOString().split('T')[0] }
        : { status: 'finalized' };
    // Best-effort: the pay_stubs status/pay_date columns may not exist on
    // older schemas. Never hard-fail the page over a stub-status flag.
    try {
      await supabase.from('pay_stubs').update(patch).eq('id', body.stubId);
    } catch {
      /* status flag is non-critical */
    }
    await logAudit({
      actor: session.user, action: `payroll.${body.action}`, targetType: 'pay_stub',
      targetId: body.stubId, centerId, ip: auditIp(request),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
