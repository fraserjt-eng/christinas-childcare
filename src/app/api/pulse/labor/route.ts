export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// THE LABOR PULSE: real labor cost and hours from the spine (closed
// time_entries x employees.hourly_rate), never from scheduled shifts or
// hardcoded SEED numbers. One source so budget, the schedule optimizer, and
// the owner dashboard all agree.
//
// ?start=YYYY-MM-DD&end=YYYY-MM-DD scopes daily/by_employee/overtime to that
// range (the optimizer asks for one work week). byMonth always covers the
// current calendar year so the budget can show real Payroll actuals.

function dayLabel(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
  });
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Scope the labor pulse to the signed-in user's center. A center-bound admin
  // sees only their center's rates, hours, and open clocks (payroll actuals
  // must never mix centers); the cross-center owner/superadmin (null center)
  // sees everyone.
  const centerId = session.user.center_id ?? null;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const today = new Date().toISOString().split('T')[0];
  const start = searchParams.get('start') || today;
  const end = searchParams.get('end') || today;
  const yearStart = `${new Date().getFullYear()}-01-01`;

  // Real hourly rates.
  let empQuery = supabase
    .from('employees')
    .select('id, first_name, last_name, hourly_rate')
    .limit(5000);
  if (centerId) empQuery = empQuery.eq('center_id', centerId);
  const { data: emps } = await empQuery;
  const rate = new Map<string, number>();
  const name = new Map<string, string>();
  for (const e of emps ?? []) {
    rate.set(e.id as string, Number(e.hourly_rate) || 0);
    name.set(
      e.id as string,
      `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim() || 'Staff'
    );
  }

  // Every closed entry from the start of the year (covers byMonth + range).
  let entriesQuery = supabase
    .from('time_entries')
    .select('employee_id, date, hours_worked, clock_out')
    .gte('date', yearStart < start ? yearStart : start)
    .not('hours_worked', 'is', null)
    .limit(5000);
  if (centerId) entriesQuery = entriesQuery.eq('center_id', centerId);
  const { data: entries, error } = await entriesQuery;
  if (error) {
    return NextResponse.json(
      { error: 'Could not read labor' },
      { status: 500 }
    );
  }
  const rows = (entries ?? []).filter((r) => r.clock_out);

  // byMonth: real labor for every month this year.
  const byMonth: Record<string, number> = {};
  for (const r of rows) {
    const d = String(r.date);
    if (d < yearStart) continue;
    const month = d.slice(0, 7);
    byMonth[month] =
      (byMonth[month] || 0) +
      (Number(r.hours_worked) || 0) * (rate.get(r.employee_id as string) || 0);
  }

  // Range slice for daily / by_employee / overtime.
  const inRange = rows.filter((r) => {
    const d = String(r.date);
    return d >= start && d <= end;
  });

  const dailyMap = new Map<string, { cost: number; hours: number }>();
  const empMap = new Map<
    string,
    { employee_id: string; employee_name: string; total_hours: number; overtime_hours: number; total_cost: number }
  >();
  for (const r of inRange) {
    const d = String(r.date);
    const h = Number(r.hours_worked) || 0;
    const c = h * (rate.get(r.employee_id as string) || 0);

    const dm = dailyMap.get(d) || { cost: 0, hours: 0 };
    dm.cost += c;
    dm.hours += h;
    dailyMap.set(d, dm);

    const id = r.employee_id as string;
    const em =
      empMap.get(id) || {
        employee_id: id,
        employee_name: name.get(id) || 'Staff',
        total_hours: 0,
        overtime_hours: 0,
        total_cost: 0,
      };
    em.total_hours += h;
    em.total_cost += c;
    empMap.set(id, em);
  }

  const daily = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({
      date,
      day_label: dayLabel(date),
      cost: Math.round(v.cost * 100) / 100,
      hours: Math.round(v.hours * 100) / 100,
    }));

  // Overtime past 40h in the range (a Mon-Fri week from the optimizer).
  const by_employee = Array.from(empMap.values())
    .map((em) => ({ ...em, overtime_hours: Math.max(0, em.total_hours - 40) }))
    .sort((a, b) => b.total_cost - a.total_cost);
  const overtime = by_employee
    .filter((e) => e.total_hours >= 36)
    .map((e) => ({
      employee_id: e.employee_id,
      employee_name: e.employee_name,
      weekly_hours: Math.round(e.total_hours * 100) / 100,
      threshold: 40,
      severity: e.total_hours >= 44 ? 'critical' : 'warning',
    }));

  const total_cost =
    Math.round(by_employee.reduce((s, e) => s + e.total_cost, 0) * 100) / 100;
  const total_hours =
    Math.round(by_employee.reduce((s, e) => s + e.total_hours, 0) * 100) / 100;

  // Stale: still clocked in from a day before today (forgot to clock out).
  let staleQuery = supabase
    .from('time_entries')
    .select('employee_id, date')
    .is('clock_out', null)
    .lt('date', today)
    .limit(5000);
  if (centerId) staleQuery = staleQuery.eq('center_id', centerId);
  const { data: stale } = await staleQuery;
  const staleOpen = (stale ?? []).map((s) => ({
    employee_id: s.employee_id as string,
    employee_name: name.get(s.employee_id as string) || 'Staff',
    date: String(s.date),
  }));

  return NextResponse.json(
    {
      start,
      end,
      daily,
      by_employee,
      total_cost,
      total_hours,
      overtime,
      byMonth,
      staleOpen,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
