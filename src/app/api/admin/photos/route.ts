export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

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

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: 'Could not load photos' }, { status: 500 });
  }

  return NextResponse.json(
    { photos: data ?? [] },
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

  const { error } = await supabase
    .from('daily_photos')
    .update({
      status,
      reviewed_by: uuidOrNull(session.user.id),
      reviewed_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (error) {
    return NextResponse.json({ error: 'Could not update photos' }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, count: ids.length },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
