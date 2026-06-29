// Kiosk attendance-vs-enrollment report for the current business day. One engine,
// used by both the live admin page (/api/admin/kiosk-report) and the every-2-hours
// email cron (/api/cron/kiosk-report). Service-role reads only (attendance +
// roster are RLS-locked); the caller passes an already-service-role client.
//
// Per center -> room: enrolled (active children assigned there), inNow (checked in,
// not out), out (checked in and out today), notArrived (enrolled who never checked
// in today), and attendancePct = showed-up / enrolled. Plus combined-rooms (each
// room summed across centers) and a grand total across everything.

import type { SupabaseClient } from '@supabase/supabase-js';
import { canonicalRoom, roomRank } from './attendance-rooms';
import { centerDate, centerTime } from './center-time';

export interface RoomStat {
  room: string;
  enrolled: number;
  inNow: number;
  out: number;
  notArrived: number;
  attendancePct: number; // (inNow + out) / enrolled, 0 when enrolled is 0
}
export interface CenterStat {
  centerId: string;
  centerName: string;
  rooms: RoomStat[];
  total: RoomStat; // this center, all rooms
}
export interface KioskReport {
  date: string; // YYYY-MM-DD business day (America/Chicago)
  asOfCentral: string; // e.g. "1:05 PM"
  generatedAtUtc: string;
  centers: CenterStat[];
  combinedRooms: RoomStat[]; // each room summed across centers
  grandTotal: RoomStat; // everything, all centers + rooms
}

type Status = 'inNow' | 'out' | 'notArrived';

function blank(room: string): RoomStat {
  return { room, enrolled: 0, inNow: 0, out: 0, notArrived: 0, attendancePct: 0 };
}
function add(into: RoomStat, status: Status) {
  into.enrolled += 1;
  if (status === 'inNow') into.inNow += 1;
  else if (status === 'out') into.out += 1;
  else into.notArrived += 1;
}
function pct(s: RoomStat): RoomStat {
  s.attendancePct = s.enrolled > 0 ? Math.round((100 * (s.inNow + s.out)) / s.enrolled) : 0;
  return s;
}

/**
 * Build the report. `centerIds` null = all active centers (the cross-center /
 * email view); an explicit list scopes to those centers (a center-bound admin).
 */
export async function buildKioskReport(
  supabase: SupabaseClient,
  centerIds: string[] | null
): Promise<KioskReport> {
  const today = centerDate();

  // centers in scope
  const { data: centerRows } = await supabase.from('centers').select('id, name, is_active').limit(50);
  const centers = (centerRows ?? [])
    .filter((c) => c.is_active !== false)
    .filter((c) => !centerIds || centerIds.includes(c.id as string));
  const centerName = new Map<string, string>();
  for (const c of centers) centerName.set(c.id as string, (c.name as string) || 'Center');
  const scopeIds = new Set(centers.map((c) => c.id as string));

  // active families (only their children are "enrolled")
  const { data: famRows } = await supabase.from('families').select('id, status, center_id').limit(10000);
  const activeFamily = new Set((famRows ?? []).filter((f) => f.status === 'active').map((f) => f.id as string));

  // roster: children -> center + room
  const { data: kidRows } = await supabase
    .from('family_children')
    .select('id, family_id, classroom, center_id')
    .limit(10000);

  // today's attendance -> per child status
  const { data: attRows } = await supabase
    .from('attendance')
    .select('child_id, center_id, check_in, check_out')
    .eq('date', today)
    .limit(10000);
  const inNowSet = new Set<string>();
  const everSet = new Set<string>();
  for (const a of attRows ?? []) {
    const cid = a.child_id as string | null;
    if (!cid) continue;
    if (a.check_in) everSet.add(cid);
    if (a.check_in && !a.check_out) inNowSet.add(cid);
  }
  const statusOf = (childId: string): Status =>
    inNowSet.has(childId) ? 'inNow' : everSet.has(childId) ? 'out' : 'notArrived';

  // aggregate: center -> room -> stat
  const byCenter = new Map<string, Map<string, RoomStat>>();
  for (const c of centers) byCenter.set(c.id as string, new Map());

  for (const k of kidRows ?? []) {
    const childId = k.id as string;
    const cid = k.center_id as string | null;
    if (!cid || !scopeIds.has(cid)) continue; // out of scope or unassigned to a center
    if (!activeFamily.has(k.family_id as string)) continue; // not enrolled
    const room = canonicalRoom(k.classroom as string | null);
    const rooms = byCenter.get(cid)!;
    if (!rooms.has(room)) rooms.set(room, blank(room));
    add(rooms.get(room)!, statusOf(childId));
  }

  // shape per-center + center totals
  const centerStats: CenterStat[] = centers.map((c) => {
    const id = c.id as string;
    const rooms = Array.from(byCenter.get(id)!.values())
      .map(pct)
      .sort((a, b) => roomRank(a.room) - roomRank(b.room) || a.room.localeCompare(b.room));
    const total = blank('All rooms');
    for (const r of rooms) {
      total.enrolled += r.enrolled; total.inNow += r.inNow; total.out += r.out; total.notArrived += r.notArrived;
    }
    return { centerId: id, centerName: centerName.get(id) || 'Center', rooms, total: pct(total) };
  }).sort((a, b) => a.centerName.localeCompare(b.centerName));

  // combined rooms (each room summed across centers)
  const combinedMap = new Map<string, RoomStat>();
  for (const cs of centerStats) {
    for (const r of cs.rooms) {
      if (!combinedMap.has(r.room)) combinedMap.set(r.room, blank(r.room));
      const t = combinedMap.get(r.room)!;
      t.enrolled += r.enrolled; t.inNow += r.inNow; t.out += r.out; t.notArrived += r.notArrived;
    }
  }
  const combinedRooms = Array.from(combinedMap.values())
    .map(pct)
    .sort((a, b) => roomRank(a.room) - roomRank(b.room) || a.room.localeCompare(b.room));

  // grand total
  const grand = blank('Everything');
  for (const r of combinedRooms) {
    grand.enrolled += r.enrolled; grand.inNow += r.inNow; grand.out += r.out; grand.notArrived += r.notArrived;
  }

  return {
    date: today,
    asOfCentral: centerTime(),
    generatedAtUtc: new Date().toISOString(),
    centers: centerStats,
    combinedRooms,
    grandTotal: pct(grand),
  };
}
