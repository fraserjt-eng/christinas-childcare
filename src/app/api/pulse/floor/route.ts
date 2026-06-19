export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { centerDate } from '@/lib/center-time';

// THE PULSE: who is actually on the floor right now, from the real spine
// (open time_entries), not an estimate. The ratio monitor is a licensing
// screen; it must show the real number of clocked-in staff, never a fabricated
// "1 per room" guess. A staff member is "on duty" when they have a
// time_entries row for today with no clock_out.
//
// classroom_id is only known once staff pick a room at sign-in (the room
// station, a later phase). Until then clocked-in staff are real but
// unassigned ("floats"); we report that honestly rather than pretend a
// per-room assignment we do not have.

function todayDate(): string {
  return centerDate();
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Scope the floor to the signed-in user's center. A center-bound admin sees
  // only their center's clocked-in staff (the ratio monitor is a licensing
  // screen and must never mix centers); the cross-center owner/superadmin
  // (null center) sees everyone.
  const centerId = session.user.center_id ?? null;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const date = todayDate();

  // Everyone currently clocked in: a time_entries row today, not yet closed.
  let openQuery = supabase
    .from('time_entries')
    .select('employee_id, clock_in, classroom_id')
    .eq('date', date)
    .is('clock_out', null)
    .limit(5000);
  if (centerId) openQuery = openQuery.eq('center_id', centerId);
  const { data: open, error } = await openQuery;

  if (error) {
    return NextResponse.json(
      { error: 'Could not read the floor' },
      { status: 500 }
    );
  }

  const rows = open ?? [];

  // Distinct staff (a person clocked in twice still counts once).
  const byEmployee = new Map<string, { clock_in: string; classroom_id: string | null }>();
  for (const r of rows) {
    const id = r.employee_id as string;
    if (!byEmployee.has(id)) {
      byEmployee.set(id, {
        clock_in: r.clock_in as string,
        classroom_id: (r.classroom_id as string | null) ?? null,
      });
    }
  }
  const ids = Array.from(byEmployee.keys());

  // Names for display. Filter the lookup in JS (PostgREST .in can drop rows).
  const names = new Map<string, string>();
  if (ids.length > 0) {
    let empQuery = supabase
      .from('employees')
      .select('id, first_name, last_name')
      .limit(5000);
    if (centerId) empQuery = empQuery.eq('center_id', centerId);
    const { data: emps } = await empQuery;
    for (const e of emps ?? []) {
      if (ids.includes(e.id as string)) {
        names.set(
          e.id as string,
          `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim() || 'Staff'
        );
      }
    }
  }

  // Total active staff = the honest denominator ("N of M on duty").
  let countQuery = supabase
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('employment_status', 'active');
  if (centerId) countQuery = countQuery.eq('center_id', centerId);
  const { count: totalActiveStaff } = await countQuery;

  const staff = ids.map((id) => {
    const v = byEmployee.get(id)!;
    return {
      employee_id: id,
      name: names.get(id) || 'Staff',
      clock_in: v.clock_in,
      classroom_id: v.classroom_id,
    };
  });

  const byClassroom: Record<string, number> = {};
  let unassigned = 0;
  for (const s of staff) {
    if (s.classroom_id) {
      byClassroom[s.classroom_id] = (byClassroom[s.classroom_id] || 0) + 1;
    } else {
      unassigned += 1;
    }
  }

  return NextResponse.json(
    {
      date,
      staffOnDuty: staff.length,
      totalActiveStaff: totalActiveStaff ?? 0,
      roomAssignmentTracked: unassigned === 0 && staff.length > 0,
      unassigned,
      byClassroom,
      staff,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
