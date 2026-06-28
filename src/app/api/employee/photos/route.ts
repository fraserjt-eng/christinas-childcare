export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { ADMIN_ROLES, CLASSROOM_SCOPING_ENABLED } from '@/lib/child-entries-policy';
import { signPhotoList } from '@/lib/photo-url';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuidOrNull(v: unknown): string | null {
  return typeof v === 'string' && UUID.test(v) ? v : null;
}

// POST: staff upload one or more photos for a classroom.
// Service-role path (the old client path uploaded via the anon key, which the
// storage + daily_photos policies deny, so nothing ever saved). Each photo is
// uploaded to child_photos and written to daily_photos as 'pending', tagged to
// the classroom's children so the owner can approve and parents can then see it.
export async function POST(request: Request): Promise<NextResponse> {
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  let classroomId = uuidOrNull(body.classroom_id);
  const classroomName =
    typeof body.classroom_name === 'string' ? body.classroom_name.slice(0, 120) : null;
  const photos = Array.isArray(body.photos) ? body.photos : [];

  if (photos.length === 0) {
    return NextResponse.json({ error: 'No photos provided' }, { status: 400 });
  }
  if (photos.length > 10) {
    return NextResponse.json({ error: 'Too many photos at once (max 10)' }, { status: 400 });
  }

  // Classroom scope (when enabled): a teacher may only post to their assigned
  // room. Admin / owner / superadmin may post to any room. Mirrors the
  // child-roster filter.
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
      return NextResponse.json(
        { error: 'You can only post photos for your own classroom.' },
        { status: 403 }
      );
    }
    classroomId = employee.classroom_id;
  }

  // Resolve the classroom's children once so every photo reaches those families.
  // Prefer the real classroom_id link; fall back to the legacy text room name.
  let childIds: string[] = [];
  if (classroomId || classroomName) {
    const { data: kids } = await supabase
      .from('family_children')
      .select('id, classroom, classroom_id')
      .limit(5000);
    if (classroomId) {
      childIds = (kids ?? [])
        .filter((k) => ((k.classroom_id as string | null) ?? null) === classroomId)
        .map((k) => k.id as string);
    }
    if (childIds.length === 0 && classroomName) {
      childIds = (kids ?? [])
        .filter((k) => ((k.classroom as string | null) ?? null) === classroomName)
        .map((k) => k.id as string);
    }
  }

  const employeeId = uuidOrNull(session.user.id);
  const employeeName = session.user.full_name || session.user.email || 'Staff';

  const videoPrefix = `gallery/${classroomId ?? 'room'}/`;
  const saved: string[] = [];
  for (const p of photos) {
    try {
      // VIDEO: already uploaded straight to storage via a server-minted signed
      // URL (/api/employee/media-upload-url). We only record the row here. The
      // path must sit under THIS classroom's gallery prefix and end in a video
      // extension, so a teacher cannot record an arbitrary object.
      if (p.media_type === 'video' && typeof p.storage_path === 'string') {
        const sp = p.storage_path;
        if (!sp.startsWith(videoPrefix) || sp.includes('..') || !/\.(mp4|webm|mov)$/i.test(sp)) {
          continue;
        }
        const { data: row, error: insErr } = await supabase
          .from('daily_photos')
          .insert({
            classroom_id: classroomId,
            classroom_name: classroomName,
            employee_id: employeeId,
            employee_name: employeeName,
            photo_url: sp,
            caption: typeof p.caption === 'string' ? p.caption.slice(0, 200) : null,
            activity_type: typeof p.activity_type === 'string' ? p.activity_type : 'other',
            status: 'pending',
            child_ids: childIds,
            media_type: 'video',
          })
          .select('id')
          .single();
        if (!insErr && row) saved.push(row.id as string);
        continue;
      }

      // PHOTO: small data URL uploaded here (downscaled client-side).
      const dataUrl = typeof p.photo_data === 'string' ? p.photo_data : '';
      if (!dataUrl.startsWith('data:')) continue;
      const commaIdx = dataUrl.indexOf(',');
      const meta = dataUrl.slice(5, commaIdx); // after "data:"
      const contentType = (meta.split(';')[0] || 'image/jpeg').trim();
      const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      const buffer = Buffer.from(dataUrl.slice(commaIdx + 1), 'base64');
      const path = `gallery/${classroomId ?? 'room'}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('child_photos')
        .upload(path, buffer, { contentType, upsert: false });
      if (upErr) continue;

      // Store the object path, not a public URL. The GET below and the parent
      // and admin reads sign it on the way out, so the bucket can be private.
      const { data: row, error: insErr } = await supabase
        .from('daily_photos')
        .insert({
          classroom_id: classroomId,
          classroom_name: classroomName,
          employee_id: employeeId,
          employee_name: employeeName,
          photo_url: path,
          caption: typeof p.caption === 'string' ? p.caption.slice(0, 200) : null,
          activity_type: typeof p.activity_type === 'string' ? p.activity_type : 'other',
          status: 'pending',
          child_ids: childIds,
          media_type: 'photo',
        })
        .select('id')
        .single();

      if (!insErr && row) saved.push(row.id as string);
    } catch {
      /* skip this one, keep going with the rest */
    }
  }

  if (saved.length === 0) {
    return NextResponse.json(
      { error: 'No photos could be saved. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { ok: true, count: saved.length, taggedChildren: childIds.length },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

// GET: the most recent photos, so staff can confirm what they just posted shows up.
export async function GET(): Promise<NextResponse> {
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data } = await supabase
    .from('daily_photos')
    .select('id, photo_url, caption, activity_type, status, classroom_name, created_at, media_type')
    .order('created_at', { ascending: false })
    .limit(30);

  const rows = data ?? [];
  const signed = await signPhotoList(supabase, rows.map((p) => p.photo_url as string));
  const photos = rows.map((p, i) => ({ ...p, photo_url: signed[i] }));

  return NextResponse.json(
    { photos },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
