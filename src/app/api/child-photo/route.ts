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
import { logAudit, auditIp } from '@/lib/audit-log';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Only real raster image types are accepted, mapped to a fixed extension. This
// keeps the storage path off client-controlled input and blocks an SVG (an
// active-content vector) or any non-image from being written to the bucket.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

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
    if (commaIdx === -1) return fail('image_data must be a data URL', 400);
    const meta = imageData.slice(5, commaIdx); // after "data:"
    const contentType = (meta.split(';')[0] || '').trim().toLowerCase();
    const ext = ALLOWED_IMAGE_TYPES[contentType];
    if (!ext) {
      return fail('Photo must be a JPEG, PNG, WebP, or GIF image.', 400);
    }
    const base64 = imageData.slice(commaIdx + 1);
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0) return fail('The photo was empty. Try again.', 400);
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

    await logAudit({
      actor: session.user,
      action: 'child.photo.update',
      targetType: 'family_children',
      targetId: childId,
      centerId: (child.center_id as string | null) ?? session.user.center_id ?? null,
      detail: { content_type: contentType },
      ip: auditIp(request),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return fail('The photo could not be uploaded. Try again.', 502);
  }
}
