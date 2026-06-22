export const runtime = 'nodejs';

// Admin/teacher check-in + check-out for the back-office attendance page.
// The attendance table is RLS-locked to anon, so the page's old client-side
// writes silently failed — these go through the service role here instead.
// Center-scoped: a center-bound staffer can only check a child in/out at their
// own center; an owner/superadmin is cross-center. The child's center is taken
// from the roster (never trusted from the client).

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  let body: { action?: string; childId?: string; attendanceId?: string };
  try { body = await request.json(); } catch { return fail('Invalid body', 400); }

  // Center scope: an owner/superadmin (or a session with no home center) is
  // cross-center and may check a child in/out at ANY center — this matches the
  // read side (/api/portal/center-data), so an owner who can SEE Crystal can
  // also act there. A center-bound teacher/admin is limited to their own center.
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = !myCenter || role === 'owner' || role === 'superadmin';
  const canTouch = (centerId: string | null) => crossCenter || centerId === myCenter;

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  try {
    if (body.action === 'checkin') {
      if (!body.childId) return fail('childId required', 400);
      const { data: child } = await supabase.from('family_children').select('name, center_id').eq('id', body.childId).maybeSingle();
      if (!child) return fail('Child not found', 404);
      if (!canTouch(child.center_id as string | null)) return fail('Not your center', 403);
      // don't open a second check-in if one is already open today
      const { data: open } = await supabase
        .from('attendance')
        .select('id')
        .eq('child_id', body.childId)
        .eq('date', today)
        .is('check_out', null)
        .limit(1);
      if (open && open.length) return NextResponse.json({ ok: true, id: open[0].id, already: true });
      const { data, error } = await supabase
        .from('attendance')
        .insert({ child_id: body.childId, child_name: child.name, date: today, check_in: now, center_id: child.center_id })
        .select('id')
        .single();
      if (error) return fail('Could not record check-in', 500);
      return NextResponse.json({ ok: true, id: data?.id });
    }

    if (body.action === 'checkout') {
      if (!body.attendanceId) return fail('attendanceId required', 400);
      const { data: rec } = await supabase.from('attendance').select('center_id').eq('id', body.attendanceId).maybeSingle();
      if (!rec) return fail('Record not found', 404);
      if (!canTouch(rec.center_id as string | null)) return fail('Not your center', 403);
      const { error } = await supabase.from('attendance').update({ check_out: now }).eq('id', body.attendanceId);
      if (error) return fail('Could not record check-out', 500);
      return NextResponse.json({ ok: true });
    }

    return fail('Unknown action', 400);
  } catch {
    return fail('Attendance update failed', 500);
  }
}
