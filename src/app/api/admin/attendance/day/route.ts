export const runtime = 'nodejs';

// "Enter a day" back-office attendance entry. Lets staff key a whole day of a
// center's roster (a paper sheet) straight into the attendance table, the same
// rows a kiosk tap would write. GET returns the roster for a date (grouped by
// room) prefilled with any existing rows; POST upserts the day.
//
// Security mirrors the rest of /api/admin/attendance: admin/teacher session,
// service role only (the attendance + roster tables deny anon), and center
// derived from the session. Only a cross-center director (owner/superadmin, or
// no home center) may pick another center; a center-bound staffer is locked to
// their own. Each child's center is re-checked from the roster on write, never
// trusted from the client.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { centerClock24, centerWallTimeToUtc } from '@/lib/center-time';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function deriveCenterId(request: NextRequest, session: AuthedSession): { centerId: string | null; crossCenter: boolean } {
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  const crossCenter = !sessionCenter || role === 'owner' || role === 'superadmin';
  const picked = request.cookies.get('cc_center')?.value || request.nextUrl.searchParams.get('center') || null;
  if (crossCenter && picked) return { centerId: picked, crossCenter };
  if (sessionCenter) return { centerId: sessionCenter, crossCenter };
  if (picked) return { centerId: picked, crossCenter };
  return { centerId: null, crossCenter };
}

interface ChildEntry {
  id: string;
  name: string;
  parents: string[];
  arrival: string; // "HH:MM" center 24h, or ''
  departure: string;
  signedInBy: string;
  signedOutBy: string;
  attendanceId: string | null;
  absent: boolean;
}

export async function GET(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const date = (request.nextUrl.searchParams.get('date') || '').trim();
  if (!DATE_RE.test(date)) return fail('date (YYYY-MM-DD) required', 400);

  const { centerId, crossCenter } = deriveCenterId(request, session);
  const { data: centers } = await supabase.from('centers').select('id, name').limit(50);

  // A cross-center director with no home center must pick one first; hand back the
  // center list so the page can show the picker instead of erroring.
  if (!centerId) {
    if (crossCenter) {
      return NextResponse.json(
        { needCenter: true, crossCenter, centers: (centers ?? []).map((c) => ({ id: c.id, name: c.name })) },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }
    return fail('No center selected', 404);
  }
  const centerName = (centers ?? []).find((c) => c.id === centerId)?.name || 'Center';

  // roster for the center (broad fetch, filter/group in JS per the PostgREST notes)
  const { data: kids } = await supabase
    .from('family_children')
    .select('id, name, classroom, family_id, center_id')
    .eq('center_id', centerId)
    .limit(5000);
  const { data: parents } = await supabase
    .from('family_parents')
    .select('family_id, name, is_primary')
    .limit(10000);
  const { data: att } = await supabase
    .from('attendance')
    .select('id, child_id, check_in, check_out, signed_in_by_name, signed_out_by_name')
    .eq('date', date)
    .eq('center_id', centerId)
    .limit(5000);

  const parentsByFamily = new Map<string, string[]>();
  for (const p of parents ?? []) {
    const fid = p.family_id as string;
    if (!parentsByFamily.has(fid)) parentsByFamily.set(fid, []);
    if (p.name) parentsByFamily.get(fid)!.push(p.name as string);
  }
  const attByChild = new Map<string, NonNullable<typeof att>[number]>();
  for (const a of att ?? []) if (a.child_id) attByChild.set(a.child_id as string, a);

  const roomsMap = new Map<string, ChildEntry[]>();
  for (const k of kids ?? []) {
    const a = attByChild.get(k.id as string);
    const entry: ChildEntry = {
      id: k.id as string,
      name: (k.name as string) || 'Child',
      parents: parentsByFamily.get(k.family_id as string) ?? [],
      arrival: centerClock24(a?.check_in as string | null),
      departure: centerClock24(a?.check_out as string | null),
      signedInBy: (a?.signed_in_by_name as string) || '',
      signedOutBy: (a?.signed_out_by_name as string) || '',
      attendanceId: (a?.id as string) || null,
      absent: false,
    };
    const room = (k.classroom as string) || 'Unassigned';
    if (!roomsMap.has(room)) roomsMap.set(room, []);
    roomsMap.get(room)!.push(entry);
  }

  const rooms = Array.from(roomsMap.entries())
    .map(([room, children]) => ({ room, children: children.sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.room.localeCompare(b.room));

  return NextResponse.json(
    {
      date,
      centerId,
      centerName,
      crossCenter,
      centers: crossCenter ? (centers ?? []).map((c) => ({ id: c.id, name: c.name })) : [],
      rooms,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

interface PostEntry {
  childId: string;
  arrival?: string;
  departure?: string;
  signedInBy?: string;
  signedOutBy?: string;
  absent?: boolean;
}

export async function POST(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  let body: { date?: string; centerId?: string; entries?: PostEntry[] };
  try { body = await request.json(); } catch { return fail('Invalid body', 400); }

  const date = (body.date || '').trim();
  if (!DATE_RE.test(date)) return fail('date (YYYY-MM-DD) required', 400);
  const entries = Array.isArray(body.entries) ? body.entries : [];
  if (entries.length === 0) return fail('No entries to save', 400);

  const { centerId } = deriveCenterId(request, session);
  if (!centerId) return fail('No center selected', 404);

  // Center scope: a center-bound staffer can only write to their own center.
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = !myCenter || role === 'owner' || role === 'superadmin';
  if (!crossCenter && centerId !== myCenter) return fail('Not your center', 403);

  // Re-check every child belongs to this center (never trust the client).
  const ids = entries.map((e) => e.childId).filter(Boolean);
  const { data: kids } = await supabase
    .from('family_children')
    .select('id, name, center_id')
    .in('id', ids)
    .limit(5000);
  const childById = new Map<string, { name: string; center_id: string | null }>();
  for (const k of kids ?? []) childById.set(k.id as string, { name: (k.name as string) || 'Child', center_id: (k.center_id as string) || null });

  // Existing rows for this child set on this date+center (to upsert in place).
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, child_id')
    .eq('date', date)
    .eq('center_id', centerId)
    .in('child_id', ids)
    .limit(5000);
  const rowIdByChild = new Map<string, string>();
  for (const r of existing ?? []) if (r.child_id) rowIdByChild.set(r.child_id as string, r.id as string);

  let inserted = 0, updated = 0, deleted = 0, skipped = 0;
  const problems: string[] = [];

  for (const e of entries) {
    const child = childById.get(e.childId);
    if (!child) { skipped++; continue; }
    if (child.center_id && child.center_id !== centerId) { problems.push(`${child.name}: not in this center`); continue; }
    const rowId = rowIdByChild.get(e.childId) || null;

    // Absent (or fully blank): remove any existing row for the day; don't create one.
    const blank = !e.arrival && !e.departure;
    if (e.absent || blank) {
      if (rowId) { await supabase.from('attendance').delete().eq('id', rowId); deleted++; }
      else skipped++;
      continue;
    }

    const checkIn = e.arrival ? centerWallTimeToUtc(date, e.arrival) : null;
    const checkOut = e.departure ? centerWallTimeToUtc(date, e.departure) : null;
    if (e.arrival && !checkIn) { problems.push(`${child.name}: could not read arrival "${e.arrival}"`); continue; }
    if (e.departure && !checkOut) { problems.push(`${child.name}: could not read departure "${e.departure}"`); continue; }

    const fields = {
      check_in: checkIn,
      check_out: checkOut,
      signed_in_by_name: (e.signedInBy || '').trim() || null,
      signed_out_by_name: (e.signedOutBy || '').trim() || null,
    };

    if (rowId) {
      const { error } = await supabase.from('attendance').update(fields).eq('id', rowId);
      if (error) problems.push(`${child.name}: save failed`); else updated++;
    } else {
      const { error } = await supabase
        .from('attendance')
        .insert({ child_id: e.childId, child_name: child.name, date, center_id: centerId, ...fields });
      if (error) problems.push(`${child.name}: save failed`); else inserted++;
    }
  }

  return NextResponse.json({ ok: true, inserted, updated, deleted, skipped, problems });
}
