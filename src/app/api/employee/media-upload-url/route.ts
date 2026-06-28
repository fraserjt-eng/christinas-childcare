export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { ADMIN_ROLES, CLASSROOM_SCOPING_ENABLED } from '@/lib/child-entries-policy';

// Direct-to-storage upload for staff VIDEO. A video is far too large to ride in
// a JSON body (the photo path), so the client uploads it straight to Supabase
// Storage using a server-minted signed upload URL, then records the row via
// /api/employee/photos with the returned path. This route only mints the signed
// URL for a server-chosen path under the caller's classroom; the bucket enforces
// the 50MB / video-mime limits, and the client enforces the <=60s duration.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuidOrNull(v: unknown): string | null {
  return typeof v === 'string' && UUID.test(v) ? v : null;
}

// Allowed video types -> fixed extension. The path extension is never taken
// from client input; it comes from this map so a crafted type can't shape it.
const VIDEO_EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export async function POST(request: Request): Promise<NextResponse> {
  const session = await requireSession('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  let classroomId = uuidOrNull(body.classroom_id);
  const contentType = String(body.content_type || '').trim().toLowerCase();
  const ext = VIDEO_EXT[contentType];
  if (!ext) {
    return NextResponse.json({ error: 'Video must be MP4, WebM, or MOV.' }, { status: 400 });
  }

  // Classroom scope: a teacher is locked to their assigned room (admins/owners
  // may target any). Mirrors /api/employee/photos.
  const employee = await resolveSessionEmployee(session);
  const role = String(session.user.role || employee?.role || '').toLowerCase();
  const isAdmin = ADMIN_ROLES.includes(role);
  if (CLASSROOM_SCOPING_ENABLED && !isAdmin) {
    if (!employee?.classroom_id) {
      return NextResponse.json(
        { error: 'No classroom assigned. Ask your admin to assign your classroom.' },
        { status: 403 }
      );
    }
    if (classroomId && classroomId !== employee.classroom_id) {
      return NextResponse.json({ error: 'You can only post for your own classroom.' }, { status: 403 });
    }
    classroomId = employee.classroom_id;
  }

  // Server-minted path under the classroom. The signed token below is bound to
  // exactly this path, so the client cannot upload anywhere else.
  const path = `gallery/${classroomId ?? 'room'}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from('child_photos')
    .createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: 'Could not start the upload. Try again.' }, { status: 502 });
  }

  return NextResponse.json(
    { path: data.path, token: data.token, classroom_id: classroomId },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
