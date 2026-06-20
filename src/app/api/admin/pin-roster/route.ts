export const runtime = 'nodejs';

// PIN ROSTER read endpoint. Returns family name + child names + kiosk PIN +
// email, grouped by center, for the branded printable roster admins hand to
// staff on Monday.
//
// Security: admin-gated (requireSession('admin')), service-role read ONLY. The
// family `pin` is a real credential: it is RLS-locked off the anon key, so it
// can never be read by a parent session or the browser's anon client. This
// route is the single guarded door to it for staff. Center scoping mirrors
// /api/staff/schedule:
//   - a cross-center director (owner/superadmin, or a director with no session
//     center) sees EVERY center, each as its own group, so one print covers the
//     whole organization for Monday;
//   - a center-bound admin is forced to their own session center and can never
//     read another center's PINs by passing ?center.
// A director may still narrow to one center with the cc_center cookie or
// ?center param (the picker pattern) when they only want one location's slips.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export interface PinRosterRow {
  center: string;
  familyName: string;
  children: string;
  pin: string;
  email: string;
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  // Which centers may this session read? A center-bound admin is locked to their
  // own center. A cross-center director sees all, unless they narrow to one via
  // the picker (cc_center cookie / ?center). The requested center is never
  // trusted from a center-bound caller, so PINs cannot leak across centers.
  const role = (session.user.role || '').toLowerCase();
  const isCrossCenter =
    role === 'owner' || role === 'superadmin' || !session.user.center_id;
  const sessionCenter = session.user.center_id ?? null;
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;

  // The set of center ids this caller is allowed to see. Empty = all centers.
  let allowedCenterIds: Set<string> | null = null;
  if (isCrossCenter) {
    if (picked) allowedCenterIds = new Set([picked]);
    // else: all centers
  } else {
    if (!sessionCenter) return fail('No center', 403);
    allowedCenterIds = new Set([sessionCenter]);
  }

  // Fetch broad + filter in JS (PostgREST silently drops rows on .in()/filters).
  const [centersRes, famRes, parentsRes, childrenRes] = await Promise.all([
    supabase.from('centers').select('id, name').limit(5000),
    supabase
      .from('families')
      .select('id, email, pin, status, center_id')
      .limit(5000),
    supabase
      .from('family_parents')
      .select('family_id, name, is_primary')
      .limit(5000),
    supabase.from('family_children').select('family_id, name').limit(10000),
  ]);

  const centerNameById = new Map<string, string>();
  for (const c of centersRes.data ?? []) {
    centerNameById.set(c.id as string, (c.name as string) || 'Center');
  }

  // Primary parent (or first listed) name per family, for the human label.
  const parentsByFamily = new Map<
    string,
    Array<{ name: string; is_primary: boolean }>
  >();
  for (const p of parentsRes.data ?? []) {
    const fid = p.family_id as string;
    if (!parentsByFamily.has(fid)) parentsByFamily.set(fid, []);
    parentsByFamily.get(fid)!.push({
      name: (p.name as string) || '',
      is_primary: Boolean(p.is_primary),
    });
  }

  // Child names per family (used for the Children column, and as the family
  // label for kiosk-only student stubs that have no guardian record yet).
  const childrenByFamily = new Map<string, string[]>();
  for (const c of childrenRes.data ?? []) {
    const fid = c.family_id as string;
    const nm = (c.name as string) || '';
    if (!nm) continue;
    if (!childrenByFamily.has(fid)) childrenByFamily.set(fid, []);
    childrenByFamily.get(fid)!.push(nm);
  }

  function childrenLabel(familyId: string): string {
    return (childrenByFamily.get(familyId) ?? []).join(', ');
  }

  function familyLabel(email: string, familyId: string): string {
    const parents = parentsByFamily.get(familyId) ?? [];
    const primary = parents.find((p) => p.is_primary) ?? parents[0];
    const name = primary?.name?.trim();
    if (name) {
      // "Last family" reads cleanest on a roster; fall back to the full name.
      const last = name.split(/\s+/).slice(-1)[0];
      return last ? `${last} family` : name;
    }
    // No guardian yet (a kiosk-only student stub): label by the child name(s).
    const kids = childrenLabel(familyId);
    if (kids) return kids;
    // Never print a placeholder roster email on a sheet.
    if (email && !/@roster\.local$/i.test(email)) return email;
    return 'Student';
  }

  const rows: PinRosterRow[] = [];
  for (const f of famRes.data ?? []) {
    const centerId = (f.center_id as string | null) ?? '';
    if (allowedCenterIds && !allowedCenterIds.has(centerId)) continue;
    // Only families that actually have a kiosk PIN belong on the roster.
    const pin = (f.pin as string | null) ?? '';
    if (!pin) continue;
    // Skip inactive/archived families so staff print only the current roster.
    const status = (f.status as string | null) ?? '';
    if (status && status !== 'active' && status !== 'approved') continue;

    const rawEmail = (f.email as string) ?? '';
    rows.push({
      center: centerNameById.get(centerId) || 'Center',
      familyName: familyLabel(rawEmail, f.id as string),
      children: childrenLabel(f.id as string),
      pin,
      // Hide placeholder roster emails (kiosk-only stubs); show real ones.
      email: /@roster\.local$/i.test(rawEmail) ? '' : rawEmail,
    });
  }

  // Sort by center, then family name, so each printed group reads alphabetically.
  rows.sort(
    (a, b) =>
      a.center.localeCompare(b.center) ||
      a.familyName.localeCompare(b.familyName)
  );

  return NextResponse.json(
    { rows },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
