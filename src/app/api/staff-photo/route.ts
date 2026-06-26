export const runtime = 'nodejs';

// Sets a STAFF member's profile photo (avatar) and persists it to the cloud so
// it syncs across every device. The office People page used to keep staff
// avatars as data URLs in the browser store only: a photo set on one device
// never appeared on another and vanished on reset. Now the image is uploaded to
// the private child_photos bucket (under a staff/ prefix) and the object path is
// stored on employees.photo_url; center-data signs it back for display.
//
// Admin-gated and center-scoped exactly like /api/child-photo: an owner/
// superadmin (or a no-home-center session) may set any center's staff; a
// center-bound admin is limited to their own center. The employee's center is
// read from the roster, never trusted from the client.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Only real raster image types are accepted, mapped to a fixed extension (keeps
// the storage path off client input and blocks an SVG / non-image write).
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);
  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  let body: { employee_id?: string; employeeId?: string; image_data?: string; imageData?: string };
  try { body = await request.json(); } catch { return fail('Invalid body', 400); }
  const employeeId = (body.employee_id || body.employeeId || '').trim();
  const imageData = body.image_data || body.imageData || '';
  if (!employeeId) return fail('employee_id required', 400);
  if (typeof imageData !== 'string' || !imageData.startsWith('data:')) {
    return fail('image_data must be a data URL', 400);
  }

  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = !myCenter || role === 'owner' || role === 'superadmin';
  const canTouch = (centerId: string | null) => crossCenter || centerId === myCenter;

  const { data: emp } = await supabase
    .from('employees')
    .select('center_id')
    .eq('id', employeeId)
    .maybeSingle();
  if (!emp) return fail('Staff member not found', 404);
  if (!canTouch(emp.center_id as string | null)) return fail('Not your center', 403);

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
    // One stable object per staff member; switching the photo overwrites it.
    const path = `staff/${employeeId}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('child_photos')
      .upload(path, buffer, { contentType, upsert: true });
    if (upErr) return fail('The photo could not be uploaded. Try again.', 502);

    const { error: dbErr } = await supabase
      .from('employees')
      .update({ photo_url: path })
      .eq('id', employeeId);
    if (dbErr) return fail('The photo was uploaded but could not be saved.', 500);

    await logAudit({
      actor: session.user,
      action: 'staff.photo.update',
      targetType: 'employees',
      targetId: employeeId,
      centerId: (emp.center_id as string | null) ?? session.user.center_id ?? null,
      detail: { content_type: contentType },
      ip: auditIp(request),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return fail('The photo could not be uploaded. Try again.', 502);
  }
}
