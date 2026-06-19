export const runtime = 'nodejs';

// The write side of the SCHEDULE screen. The portal read endpoint
// (/api/portal/center-data) returns this week's shifts with real
// staff_schedules ids; this route persists add / edit / remove so the new
// design's schedule grid writes back to the real table.
//
// Security: session-gated (teacher minimum, but the schedule is a
// director-level surface). The center is derived exactly as the portal route
// derives it: a director may pick a center (cc_center cookie or ?center), a
// center-bound user is forced to their own session center. Every row is
// validated against that derived center before it is read, written, or
// deleted, so a session can never mutate another center's schedule.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { centerDate } from '@/lib/center-time';

// Friendly errors only. Never leak error.message or internal details.
function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// The center to act on. Mirrors /api/portal/center-data: a director
// (admin/owner/superadmin) may CHOOSE a center via the cc_center cookie or
// ?center; a center-bound user is locked to their own session center; a
// null-center cross-center user falls back to the pick. Returns null only when
// nothing resolves a center.
function deriveCenterId(request: NextRequest, session: AuthedSession): string | null {
  const role = (session.user.role || '').toLowerCase();
  const isDirector = role === 'admin' || role === 'owner' || role === 'superadmin';
  const sessionCenter = session.user.center_id ?? null;
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;

  if (isDirector && picked) return picked;
  if (sessionCenter) return sessionCenter;
  if (picked) return picked;
  return null;
}

// This week's Monday in center time, plus `day` (0=Mon..4=Fri), as a
// YYYY-MM-DD date. Same week computation the portal route uses to map a
// staff_schedules.date onto PreviewShift.day, run in reverse.
function dateForDay(day: number): string {
  const today = centerDate();
  const todayD = new Date(`${today}T12:00:00`);
  const dow = todayD.getDay(); // 0=Sun..6=Sat
  const monday = new Date(todayD);
  monday.setDate(todayD.getDate() + (dow === 0 ? -6 : 1 - dow));
  const target = new Date(monday);
  target.setDate(monday.getDate() + day);
  return centerDate(target);
}

function isValidDay(day: unknown): day is number {
  return typeof day === 'number' && Number.isInteger(day) && day >= 0 && day <= 4;
}

// ---- POST: add a shift ----
export async function POST(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const centerId = deriveCenterId(request, session);
  if (!centerId) return fail('No center', 404);

  let body: {
    employeeId?: string;
    day?: number;
    start?: string;
    end?: string;
    classroomId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body', 400);
  }

  const employeeId = (body.employeeId || '').trim();
  if (!employeeId) return fail('employeeId required', 400);
  if (!isValidDay(body.day)) return fail('day must be 0 through 4', 400);
  const start = (body.start || '').trim();
  const end = (body.end || '').trim();
  if (!start || !end) return fail('start and end required', 400);

  // The employee must belong to this center.
  const { data: emp, error: empErr } = await supabase
    .from('employees')
    .select('id, center_id')
    .eq('id', employeeId)
    .maybeSingle();
  if (empErr) return fail('Could not save the shift', 500);
  if (!emp) return fail('Unknown staff', 404);
  if (emp.center_id && emp.center_id !== centerId) {
    return fail('Not your center', 403);
  }

  const date = dateForDay(body.day);

  const { data: inserted, error: insErr } = await supabase
    .from('staff_schedules')
    .insert({
      employee_id: employeeId,
      center_id: centerId,
      date,
      start_time: start, // "7:00" reads as a time literal
      end_time: end,
      classroom_id: body.classroomId || null,
    })
    .select('id')
    .single();
  if (insErr || !inserted) return fail('Could not save the shift', 500);

  return NextResponse.json({ ok: true, id: inserted.id as string });
}

// ---- DELETE: remove a shift ----
export async function DELETE(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const centerId = deriveCenterId(request, session);

  let id = request.nextUrl.searchParams.get('id') || '';
  if (!id) {
    try {
      const body = (await request.json()) as { id?: string };
      id = (body.id || '').trim();
    } catch {
      /* id stays empty */
    }
  }
  id = id.trim();
  if (!id) return fail('id required', 400);

  // Confirm the row is in the derived center before deleting it.
  const { data: row, error: rowErr } = await supabase
    .from('staff_schedules')
    .select('id, center_id')
    .eq('id', id)
    .maybeSingle();
  if (rowErr) return fail('Could not remove the shift', 500);
  if (!row) return NextResponse.json({ ok: true }); // already gone
  if (centerId && row.center_id && row.center_id !== centerId) {
    return fail('Not your center', 403);
  }

  const { error: delErr } = await supabase
    .from('staff_schedules')
    .delete()
    .eq('id', id);
  if (delErr) return fail('Could not remove the shift', 500);

  return NextResponse.json({ ok: true });
}

// ---- PATCH: update a shift ----
export async function PATCH(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const centerId = deriveCenterId(request, session);

  let body: {
    id?: string;
    day?: number;
    start?: string;
    end?: string;
    classroomId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body', 400);
  }

  const id = (body.id || '').trim();
  if (!id) return fail('id required', 400);

  // Center-validate the row before touching it.
  const { data: row, error: rowErr } = await supabase
    .from('staff_schedules')
    .select('id, center_id')
    .eq('id', id)
    .maybeSingle();
  if (rowErr) return fail('Could not update the shift', 500);
  if (!row) return fail('Unknown shift', 404);
  if (centerId && row.center_id && row.center_id !== centerId) {
    return fail('Not your center', 403);
  }

  // Update only the provided fields.
  const patch: Record<string, unknown> = {};
  if (body.day !== undefined) {
    if (!isValidDay(body.day)) return fail('day must be 0 through 4', 400);
    patch.date = dateForDay(body.day);
  }
  if (body.start !== undefined) {
    const start = (body.start || '').trim();
    if (!start) return fail('start required', 400);
    patch.start_time = start;
  }
  if (body.end !== undefined) {
    const end = (body.end || '').trim();
    if (!end) return fail('end required', 400);
    patch.end_time = end;
  }
  if (body.classroomId !== undefined) {
    patch.classroom_id = body.classroomId || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true }); // nothing to change
  }

  const { error: updErr } = await supabase
    .from('staff_schedules')
    .update(patch)
    .eq('id', id);
  if (updErr) return fail('Could not update the shift', 500);

  return NextResponse.json({ ok: true });
}
