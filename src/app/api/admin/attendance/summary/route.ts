export const runtime = 'nodejs';

// Attendance summary engine for the Attendance Hub (daily / weekly / monthly /
// yearly views + downloadable datasets).
//
// Security + scope mirror /api/admin/ccap-export: admin-gated
// (requireSession('admin')), service role only (attendance + roster are read
// here, never via the anon client), and center-derived. Only a CROSS-center
// director (owner/superadmin, or no home center) may pick a center or use the
// Combined (all-centers) view; a center-bound admin is locked to their own.
//
// Returns, for [from..to]: time buckets at the requested granularity, a per-child
// summary, and totals. In Combined mode it also returns a per-center breakdown.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function deriveCenterId(request: NextRequest, session: AuthedSession): string | null {
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  // Only a cross-center director (owner/superadmin, or no home center) may pick a
  // center; a center-bound admin/teacher is locked to their own center.
  const isCrossCenter = role === 'owner' || role === 'superadmin' || !sessionCenter;
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;
  if (isCrossCenter && picked) return picked;
  if (sessionCenter) return sessionCenter;
  if (picked) return picked;
  return null;
}

// Monday (ISO week start) of a YYYY-MM-DD date, as YYYY-MM-DD. Noon anchor so
// DST never flips the day.
function weekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const dow = d.getDay(); // 0=Sun..6=Sat
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function shortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
}
function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

interface AttRow {
  child_id: string | null;
  child_name: string | null;
  center_id: string | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  // Combined (all-centers) is allowed ONLY for a cross-center director.
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  const isCrossCenter = role === 'owner' || role === 'superadmin' || !sessionCenter;
  const combined = isCrossCenter && request.cookies.get('cc_view')?.value === 'combined';

  const centerId = combined ? null : deriveCenterId(request, session);
  if (!combined && !centerId) return fail('No center selected', 404);

  const sp = request.nextUrl.searchParams;
  const from = (sp.get('from') || '').trim();
  const to = (sp.get('to') || '').trim();
  const bucket = (sp.get('bucket') || 'day').toLowerCase();
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) return fail('from and to (YYYY-MM-DD) required', 400);
  if (from > to) return fail('from must be on or before to', 400);
  if (!['day', 'week', 'month'].includes(bucket)) return fail('bucket must be day, week, or month', 400);

  // center name(s)
  let centerName = 'All centers';
  const centerNames = new Map<string, string>();
  {
    const { data: cs } = await supabase.from('centers').select('id, name').limit(50);
    for (const c of cs ?? []) centerNames.set(c.id as string, (c.name as string) || 'Center');
    if (!combined && centerId) centerName = centerNames.get(centerId) || 'Center';
  }

  // Page through attendance for the range (a year of a full center can exceed a
  // single PostgREST page; never silently truncate). Combined = all centers.
  const rows: AttRow[] = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    let q = supabase
      .from('attendance')
      .select('child_id, child_name, center_id, date, check_in, check_out')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (!combined && centerId) q = q.eq('center_id', centerId);
    const { data, error } = await q;
    if (error) return fail('Could not read attendance for that range', 500);
    const batch = (data ?? []) as AttRow[];
    rows.push(...batch);
    if (batch.length < PAGE) break;
    if (offset > 200000) break; // hard backstop
  }

  // roster names (source of truth; fall back to denormalized child_name)
  const nameById = new Map<string, string>();
  {
    let kq = supabase.from('family_children').select('id, name').limit(10000);
    if (!combined && centerId) kq = kq.eq('center_id', centerId);
    const { data: kids } = await kq;
    for (const k of kids ?? []) nameById.set(k.id as string, (k.name as string) || '');
  }

  const hoursOf = (r: AttRow): number => {
    if (!r.check_in || !r.check_out) return 0;
    const h = (new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 3600000;
    return h > 0 && h < 24 ? h : 0;
  };

  // aggregate into buckets + per-child (+ per-center when combined)
  const bucketMap = new Map<string, { label: string; start: string; end: string; present: Set<string>; childDays: number; hours: number; checkins: number }>();
  const childMap = new Map<string, { name: string; days: Set<string>; hours: number; lastDate: string }>();
  const centerAgg = new Map<string, { present: Set<string>; childDays: number; hours: number }>();
  let totalHours = 0;
  const daysOpen = new Set<string>();

  for (const r of rows) {
    if (!r.date) continue;
    const cid = (r.child_id as string) || `name:${r.child_name || 'unknown'}`;
    const name = nameById.get(r.child_id as string) || (r.child_name as string) || 'Child';
    const h = hoursOf(r);
    totalHours += h;
    if (r.check_in) daysOpen.add(r.date);

    let key: string, label: string, start: string, end: string;
    if (bucket === 'day') {
      key = r.date; label = shortDate(r.date); start = r.date; end = r.date;
    } else if (bucket === 'week') {
      start = weekStart(r.date); end = addDays(start, 6); key = start; label = `${shortDate(start)} – ${shortDate(end)}`;
    } else {
      key = r.date.slice(0, 7); start = `${key}-01`; end = key; label = monthLabel(key);
    }
    if (!bucketMap.has(key)) bucketMap.set(key, { label, start, end, present: new Set(), childDays: 0, hours: 0, checkins: 0 });
    const b = bucketMap.get(key)!;
    b.present.add(cid);
    b.childDays += 1;
    b.hours += h;
    if (r.check_in) b.checkins += 1;

    if (!childMap.has(cid)) childMap.set(cid, { name, days: new Set(), hours: 0, lastDate: '' });
    const c = childMap.get(cid)!;
    c.days.add(r.date);
    c.hours += h;
    if (r.date > c.lastDate) c.lastDate = r.date;

    if (combined) {
      const ck = (r.center_id as string) || 'unknown';
      if (!centerAgg.has(ck)) centerAgg.set(ck, { present: new Set(), childDays: 0, hours: 0 });
      const ca = centerAgg.get(ck)!;
      ca.present.add(cid);
      ca.childDays += 1;
      ca.hours += h;
    }
  }

  const buckets = Array.from(bucketMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, b]) => ({
      label: b.label,
      start: b.start,
      end: b.end,
      childrenPresent: b.present.size,
      childDays: b.childDays,
      hours: Math.round(b.hours * 10) / 10,
    }));

  const children = Array.from(childMap.values())
    .map((c) => ({ name: c.name, daysPresent: c.days.size, hours: Math.round(c.hours * 10) / 10, lastDate: c.lastDate }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const byCenter = combined
    ? Array.from(centerAgg.entries())
        .map(([id, a]) => ({ center: centerNames.get(id) || 'Center', childrenPresent: a.present.size, childDays: a.childDays, hours: Math.round(a.hours * 10) / 10 }))
        .sort((a, b) => a.center.localeCompare(b.center))
    : [];

  return NextResponse.json(
    {
      centerId: combined ? 'all' : centerId,
      centerName,
      combined,
      from,
      to,
      bucket,
      buckets,
      children,
      byCenter,
      totals: {
        uniqueChildren: childMap.size,
        childDays: rows.length,
        hours: Math.round(totalHours * 10) / 10,
        daysOpen: daysOpen.size,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
