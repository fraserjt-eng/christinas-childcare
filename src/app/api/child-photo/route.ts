export const runtime = 'nodejs';

// Sets a child's PROFILE PHOTO (avatar) and persists it to the cloud so it
// syncs across every device. Before this, avatars were data URLs kept only in
// the browser's localStorage (kidPhotos in the preview store): a photo taken on
// one device never appeared on another, and a re-render fell back to the generic
// placeholder. Now the image is uploaded to the private child_photos bucket and
// the object path is stored on family_children.photo_url; reads sign it.
//
// Center-scoped exactly like /api/admin/attendance/checkin: an owner/superadmin
// (or a no-home-center session) may set any center's child; a center-bound
// teacher is limited to their own center. The child's center is read from the
// roster, never trusted from the client.

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

  let body: { child_id?: string; childId?: string; image_data?: string; imageData?: string };
  try { body = await request.json(); } catch { return fail('Invalid body', 400); }
  const childId = (body.child_id || body.childId || '').trim();
  const imageData = body.image_data || body.imageData || '';
  if (!childId) return fail('child_id required', 400);
  if (typeof imageData !== 'string' || !imageData.startsWith('data:')) {
    return fail('image_data must be a data URL', 400);
  }

  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = !myCenter || role === 'owner' || role === 'superadmin';
  const canTouch = (centerId: string | null) => crossCenter || centerId === myCenter;

  const { data: child } = await supabase
    .from('family_children')
    .select('center_id')
    .eq('id', childId)
    .maybeSingle();
  if (!child) return fail('Child not found', 404);
  if (!canTouch(child.center_id as string | null)) return fail('Not your center', 403);

  try {
    const commaIdx = imageData.indexOf(',');
    const meta = imageData.slice(5, commaIdx); // after "data:"
    const contentType = (meta.split(';')[0] || 'image/jpeg').trim();
    const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const base64 = imageData.slice(commaIdx + 1);
    const buffer = Buffer.from(base64, 'base64');
    // One stable object per child; switching the photo overwrites it (upsert).
    const path = `avatars/${childId}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('child_photos')
      .upload(path, buffer, { contentType, upsert: true });
    if (upErr) return fail('The photo could not be uploaded. Try again.', 502);

    const { error: dbErr } = await supabase
      .from('family_children')
      .update({ photo_url: path })
      .eq('id', childId);
    if (dbErr) return fail('The photo was uploaded but could not be saved.', 500);

    return NextResponse.json({ ok: true });
  } catch {
    return fail('The photo could not be uploaded. Try again.', 502);
  }
}
