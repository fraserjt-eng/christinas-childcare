export const runtime = 'nodejs';

// The new front-facing portal's read endpoint. Returns ONE center's live data,
// already shaped to the /preview store contract (PreviewRoom/Kid/Staff/Family +
// today's check-ins/clock-ins + the recent feed), so the new design can hydrate
// from real data instead of fixtures with no per-screen query plumbing.
//
// Security: session-gated. A center-bound user is FORCED to their own center
// (the ?center param is ignored for them, so they cannot peek at another
// center). Only a cross-center owner/superadmin (null session center) may pass
// ?center to choose which center to view. Service-role read, center-scoped.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { centerDate } from '@/lib/center-time';

// age_group -> the new design's room styling + licensing ratio limit.
const ROOM_STYLE: Record<string, { emoji: string; color: string; ratioLimit: number }> = {
  infant: { emoji: '🍼', color: '#1f7fd4', ratioLimit: 4 },
  toddler: { emoji: '🧸', color: '#2e9e4f', ratioLimit: 7 },
  preschool: { emoji: '🎨', color: '#ff7043', ratioLimit: 10 },
  school_age: { emoji: '🎒', color: '#f4a720', ratioLimit: 10 },
};
const ROOM_FALLBACK = { emoji: '🏫', color: '#6b6b6b', ratioLimit: 10 };

function displayTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function splitName(full: string): { first: string; last: string } {
  const parts = (full || '').trim().split(/\s+/);
  return { first: parts[0] || full || '', last: parts.slice(1).join(' ') };
}

// A childcare entry type -> the feed kind the new design renders.
const FEED_KIND: Record<string, string> = {
  meal: 'meal', bottle: 'bottle', diaper: 'diaper', nap: 'nap',
  activity: 'activity', photo: 'photo', note: 'note',
  bathroom: 'note', medication: 'note', incident: 'note',
};

export async function GET(request: NextRequest) {
  // Staff-only. Parents have their own scoped endpoints (/api/parent/*); this
  // route carries the whole center (rooms, kids, staff, families) and must never
  // be reachable by a parent session.
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Which center to show. ONLY a cross-center role (owner/superadmin) may CHOOSE
  // a center via the picker (cc_center cookie or ?center). A center-bound user
  // (admin/teacher) is locked to their own session center and cannot read
  // another center by passing a center id. This is the anti-cross-center-leak
  // guarantee: the requested center is never trusted from a center-bound caller.
  const role = (session.user.role || '').toLowerCase();
  const isCrossCenter = role === 'owner' || role === 'superadmin';
  const sessionCenter = session.user.center_id ?? null;
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;

  let centerId: string | null;
  if (isCrossCenter) {
    centerId = picked || sessionCenter;
    if (!centerId) {
      const { data: first } = await supabase
        .from('centers').select('id').order('name').limit(1).maybeSingle();
      centerId = (first?.id as string) ?? null;
    }
  } else {
    // admin / teacher: their own center only, never a picked one.
    centerId = sessionCenter;
  }
  if (!centerId) {
    return NextResponse.json({ error: 'No center' }, { status: 403 });
  }

  const today = centerDate();
  // This week's Monday..Sunday in center time, for the schedule grid.
  const todayD = new Date(`${today}T12:00:00`);
  const dow = todayD.getDay(); // 0=Sun..6=Sat
  const monday = new Date(todayD);
  monday.setDate(todayD.getDate() + (dow === 0 ? -6 : 1 - dow));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = centerDate(monday);
  const weekEnd = centerDate(sunday);

  // Pull each slice broad + center-scoped, then shape in JS (PostgREST gotchas).
  const [centersRes, roomsRes, kidsRes, staffRes, famRes, parentsRes, attRes, teRes, feedRes, shiftsRes] =
    await Promise.all([
      supabase.from('centers').select('id, name').limit(5000),
      supabase.from('classrooms').select('id, name, age_group, capacity').eq('center_id', centerId).limit(5000),
      supabase.from('family_children').select('id, name, classroom_id, family_id, allergies, medical_notes').eq('center_id', centerId).limit(5000),
      supabase.from('employees').select('id, first_name, last_name, role, classroom_id, employment_status').eq('center_id', centerId).limit(5000),
      supabase.from('families').select('id, email, copay_default_amount').eq('center_id', centerId).limit(5000),
      supabase.from('family_parents').select('family_id, name, phone, relationship, is_primary').limit(5000),
      supabase.from('attendance').select('id, child_id, child_name, check_in, check_out').eq('center_id', centerId).eq('date', today).limit(5000),
      supabase.from('time_entries').select('employee_id, clock_in, clock_out').eq('center_id', centerId).eq('date', today).limit(5000),
      supabase.from('child_daily_entries').select('id, child_id, classroom_id, type, detail, occurred_at').eq('center_id', centerId).order('occurred_at', { ascending: false }).limit(200),
      supabase.from('staff_schedules').select('id, employee_id, date, start_time, end_time, classroom_id').eq('center_id', centerId).gte('date', weekStart).lte('date', weekEnd).limit(5000),
    ]);

  const centers = (centersRes.data ?? []).map((c) => ({ id: c.id as string, name: c.name as string }));

  const rooms = (roomsRes.data ?? []).map((r) => {
    const style = ROOM_STYLE[(r.age_group as string) ?? ''] ?? ROOM_FALLBACK;
    return {
      id: r.id as string,
      name: r.name as string,
      // The licensing age-group slug (infant/toddler/preschool/school_age).
      // The admin ratio monitor buckets children by this; it is additive and
      // ignored by the preview hydrator, which reads only id/name/emoji/etc.
      ageGroup: (r.age_group as string) ?? '',
      emoji: style.emoji,
      color: style.color,
      capacity: (r.capacity as number) ?? 10,
      ratioLimit: style.ratioLimit,
    };
  });

  const kids = (kidsRes.data ?? []).map((k) => {
    const { first, last } = splitName(k.name as string);
    const allergies = (k.allergies as string[] | null) ?? [];
    return {
      id: k.id as string,
      firstName: first,
      lastName: last,
      roomId: (k.classroom_id as string | null) ?? '',
      familyId: (k.family_id as string | null) ?? '',
      avatar: '🧒🏽',
      allergy: allergies.length ? allergies[0] : null,
      note: (k.medical_notes as string | null) ?? null,
    };
  });

  const staff = (staffRes.data ?? [])
    .filter((s) => (s.employment_status as string) === 'active')
    .map((s) => {
      const role = (s.role as string)?.toLowerCase();
      return {
        id: s.id as string,
        firstName: (s.first_name as string) ?? '',
        lastName: (s.last_name as string) ?? '',
        role: role === 'owner' || role === 'admin' || role === 'director' ? 'owner' : 'teacher',
        roomId: (s.classroom_id as string | null) ?? null,
        // Never return staff login PINs to the client (they are real
        // credentials). The kiosk validates clock-in server-side.
        pin: '',
        avatar: '🧑🏽‍🏫',
        color: '#4a90d9',
      };
    });

  // Parents grouped by family (only the families in this center).
  const familyIds = new Set((famRes.data ?? []).map((f) => f.id as string));
  const parentsByFamily = new Map<string, Array<{ name: string; phone: string | null; relationship: string | null; is_primary: boolean }>>();
  for (const p of parentsRes.data ?? []) {
    const fid = p.family_id as string;
    if (!familyIds.has(fid)) continue;
    if (!parentsByFamily.has(fid)) parentsByFamily.set(fid, []);
    parentsByFamily.get(fid)!.push({
      name: p.name as string,
      phone: (p.phone as string | null) ?? null,
      relationship: (p.relationship as string | null) ?? null,
      is_primary: Boolean(p.is_primary),
    });
  }

  const kidsByFamily = new Map<string, string[]>();
  for (const k of kids) {
    if (!k.familyId) continue;
    if (!kidsByFamily.has(k.familyId)) kidsByFamily.set(k.familyId, []);
    kidsByFamily.get(k.familyId)!.push(k.id);
  }

  const families = (famRes.data ?? []).map((f) => {
    const fid = f.id as string;
    const parents = parentsByFamily.get(fid) ?? [];
    const primary = parents.find((p) => p.is_primary) ?? parents[0];
    const lastName = primary ? splitName(primary.name).last : '';
    const balance = (f.copay_default_amount as number | null) ?? 0;
    return {
      id: fid,
      name: lastName ? `${lastName} family` : ((f.email as string) ?? 'Family'),
      pin: '',
      avatar: '👪🏽',
      kidIds: kidsByFamily.get(fid) ?? [],
      parentName: primary?.name ?? ((f.email as string) ?? ''),
      email: (f.email as string) ?? '',
      emergencyContact: { name: '', relationship: '', phone: primary?.phone ?? '' },
      approvedPickups: parents.map((p) => ({ name: p.name, relationship: p.relationship ?? 'Guardian' })),
      balanceOwed: balance,
      balanceDueLabel: balance > 0 ? 'balance due' : 'no balance',
      formsToSign: [],
    };
  });

  // Today's presence. Checked in = a row today with no check_out.
  const checkedIn: Record<string, string | null> = {};
  for (const a of attRes.data ?? []) {
    const cid = a.child_id as string;
    if (!cid) continue;
    checkedIn[cid] = a.check_out ? null : displayTime(a.check_in as string | null);
  }
  // Raw today-attendance rows (with their db ids + ISO times) so the admin
  // attendance page can drive check-out / edit / delete actions by id. The
  // preview hydrator ignores this key.
  const todayAttendance = (attRes.data ?? []).map((a) => ({
    id: a.id as string,
    child_id: (a.child_id as string | null) ?? null,
    child_name: (a.child_name as string | null) ?? null,
    check_in: (a.check_in as string | null) ?? null,
    check_out: (a.check_out as string | null) ?? null,
  }));
  const clockedIn: Record<string, string | null> = {};
  for (const t of teRes.data ?? []) {
    const eid = t.employee_id as string;
    if (!eid) continue;
    clockedIn[eid] = t.clock_out ? null : displayTime(t.clock_in as string | null);
  }

  // Recent feed -> the new design's FeedEvent shape.
  const feed = (feedRes.data ?? []).map((e) => {
    const detail = (e.detail as Record<string, unknown> | null) ?? {};
    const text = (detail.text as string) || (detail.note as string) || (detail.summary as string) || '';
    const type = (e.type as string) ?? 'note';
    return {
      id: e.id as string,
      kind: FEED_KIND[type] ?? 'note',
      roomId: (e.classroom_id as string | null) ?? '',
      kidIds: [e.child_id as string].filter(Boolean),
      title: type.charAt(0).toUpperCase() + type.slice(1),
      detail: text,
      time: displayTime(e.occurred_at as string | null),
      dayLabel: 'Today',
      photoId: null as string | null,
      photoUrl: (detail.photoUrl as string) ?? null,
    };
  });

  // This week's shifts -> the weekly grid (day 0=Mon..4=Fri). Real DB ids so
  // the schedule screen can edit/remove a shift by id.
  const fmtTime = (t: string | null): string => {
    if (!t) return '';
    const [h, m] = t.split(':');
    return `${parseInt(h, 10)}:${m ?? '00'}`;
  };
  const shifts = (shiftsRes.data ?? []).map((s) => {
    const wd = new Date(`${s.date as string}T12:00:00`).getDay(); // 0=Sun..6=Sat
    return {
      id: s.id as string,
      staffId: (s.employee_id as string) ?? '',
      day: (wd + 6) % 7, // Mon=0..Sun=6
      start: fmtTime(s.start_time as string | null),
      end: fmtTime(s.end_time as string | null),
      roomId: (s.classroom_id as string | null) ?? null,
    };
  });

  const centerName = centers.find((c) => c.id === centerId)?.name ?? null;

  return NextResponse.json(
    { centerId, centerName, centers, rooms, kids, staff, families, checkedIn, clockedIn, todayAttendance, feed, shifts },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
