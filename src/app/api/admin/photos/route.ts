export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { signPhotoList } from '@/lib/photo-url';
import { logAudit, auditIp } from '@/lib/audit-log';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuidOrNull(v: unknown): string | null {
  return typeof v === 'string' && UUID.test(v) ? v : null;
}

// GET ?date=YYYY-MM-DD : photos for the owner's review queue. Admin only.
// Reads via the service role (the old grid read through the anon key, which the
// daily_photos authenticated-only SELECT policy denies, so the grid was empty).
export async function GET(request: Request): Promise<NextResponse> {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Scope the review queue to the signed-in admin's center. A center-bound
  // admin sees only their center's photos; the cross-center owner/superadmin
  // (null center) sees everyone's.
  const centerId = session.user.center_id ?? null;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let q = supabase
    .from('daily_photos')
    .select(
      'id, photo_url, caption, activity_type, status, classroom_name, employee_name, created_at, child_ids'
    )
    .order('created_at', { ascending: false })
    .limit(5000);

  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    q = q.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59.999`);
  }
  if (centerId) q = q.eq('center_id', centerId);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: 'Could not load photos' }, { status: 500 });
  }

  const rows = data ?? [];
  const signed = await signPhotoList(supabase, rows.map((p) => p.photo_url as string));
  const photos = rows.map((p, i) => ({ ...p, photo_url: signed[i] }));

  return NextResponse.json(
    { photos },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

// PATCH { ids: string[], status: 'approved'|'rejected'|'pending' } : review action.
// Admin only. reviewed_by is a uuid column, so the reviewer id is uuid-guarded
// (the old client wrote the literal string 'admin', which would fail).
export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const centerId = session.user.center_id ?? null;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((x: unknown): x is string => typeof x === 'string')
    : [];
  const status = body.status;
  if (ids.length === 0 || !['approved', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  // Center-membership authz: the ids come from the now center-scoped GET, but a
  // forged payload could name another center's photo. For a center-bound admin,
  // verify every targeted row belongs to their center before mutating. Fetch the
  // target rows and check center_id in JS (never trust PostgREST .in to return
  // all rows). The cross-center owner/superadmin (null center) skips this check.
  if (centerId) {
    const { data: targets, error: targetErr } = await supabase
      .from('daily_photos')
      .select('id, center_id')
      .in('id', ids)
      .limit(5000);
    if (targetErr) {
      return NextResponse.json({ error: 'Could not update photos' }, { status: 500 });
    }
    const foreign = (targets ?? []).some((row) => row.center_id !== centerId);
    if (foreign) {
      return NextResponse.json({ error: 'Not your center' }, { status: 403 });
    }
  }

  let updateQuery = supabase
    .from('daily_photos')
    .update({
      status,
      reviewed_by: uuidOrNull(session.user.id),
      reviewed_at: new Date().toISOString(),
    })
    .in('id', ids);
  if (centerId) updateQuery = updateQuery.eq('center_id', centerId);
  const { error } = await updateQuery;

  if (error) {
    return NextResponse.json({ error: 'Could not update photos' }, { status: 500 });
  }

  for (const id of ids) {
    await logAudit({
      actor: session.user,
      action: 'photo.moderate',
      targetType: 'daily_photo',
      targetId: id,
      centerId: session.user.center_id ?? null,
      detail: { status },
      ip: auditIp(request as NextRequest),
    });
  }

  return NextResponse.json(
    { ok: true, count: ids.length },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
