export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { resolveSessionFamily } from '@/lib/parent-server';
import { centerDate, centerDateOf } from '@/lib/center-time';
import { ADMIN_ROLES, CLASSROOM_SCOPING_ENABLED } from '@/lib/child-entries-policy';
import { signEntryPhoto } from '@/lib/photo-url';

// The Tadpoles per-child timeline. Staff write entries stamped to the
// verified session employee + classroom + time. Parents read ONLY their own
// child's entries (scoped server-side, never trusting a client child_id).
// child_daily_entries is RLS service-role-only by design.

const ENTRY_TYPES = [
  'note',
  'nap',
  'meal',
  'bottle',
  'bathroom',
  'diaper',
  'toileting',
  'accident',
  'medication',
  'activity',
  'photo',
  'incident',
] as const;
type EntryType = (typeof ENTRY_TYPES)[number];

function todayDate(): string {
  return centerDate();
}

// GET ?child_id=&date= : a child's timeline for a day. Parents are scoped to
// their own children; staff/admin can read any child.
export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const childId = (searchParams.get('child_id') || '').trim();
  const date = searchParams.get('date') || todayDate();
  if (!childId) {
    return NextResponse.json({ error: 'child_id required' }, { status: 400 });
  }

  if (session.user.role === 'parent') {
    const family = await resolveSessionFamily(session);
    const owns = family?.children.some((c) => c.id === childId);
    if (!owns) {
      // Never confirm or leak another family's child.
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else {
    // Staff: when scoping is on, a teacher may only read children in their
    // assigned room; admin / owner / superadmin read any child. Same scope as
    // the roster + write path, so a guessed child_id cannot leak another
    // room's timeline.
    const role = String(session.user.role || '').toLowerCase();
    if (CLASSROOM_SCOPING_ENABLED && !ADMIN_ROLES.includes(role)) {
      const employee = await resolveSessionEmployee(session);
      const { data: child } = await supabase
        .from('family_children')
        .select('classroom_id')
        .eq('id', childId)
        .maybeSingle();
      const childRoom = (child?.classroom_id as string | null) ?? null;
      const myRoom = employee?.classroom_id ?? null;
      if (!myRoom || childRoom !== myRoom) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const { data, error } = await supabase
    .from('child_daily_entries')
    .select('id, child_id, date, type, detail, occurred_at, recorded_by, classroom_id, updated_at')
    .eq('child_id', childId)
    .eq('date', date)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json(
      { error: 'Could not read the report' },
      { status: 500 }
    );
  }

  const entries = await Promise.all(
    (data ?? []).map((e) => signEntryPhoto(supabase, e))
  );
  return NextResponse.json(
    { child_id: childId, date, entries },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

// POST { child_id, type, detail?, occurred_at?, classroom_id? } : staff only.
export async function POST(request: NextRequest) {
  // Rank >= teacher (parents are rank 1, excluded).
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: {
    child_id?: string;
    type?: string;
    detail?: Record<string, unknown>;
    occurred_at?: string;
    classroom_id?: string;
    photo_data?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const childId = (body.child_id || '').trim();
  const type = (body.type || '').trim() as EntryType;
  if (!childId) {
    return NextResponse.json({ error: 'child_id required' }, { status: 400 });
  }
  if (!ENTRY_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid entry type' }, { status: 400 });
  }

  // Confirm the child exists (clean FK error -> friendly message).
  const { data: child } = await supabase
    .from('family_children')
    .select('id, classroom, classroom_id, center_id')
    .eq('id', childId)
    .maybeSingle();
  if (!child) {
    return NextResponse.json({ error: 'Unknown child' }, { status: 404 });
  }

  // Stamp to the real session employee where we can resolve one.
  const employee = await resolveSessionEmployee(session);

  // Classroom write guard (defense in depth behind the roster filter): a
  // teacher may only log for children in their assigned room. Admin / owner /
  // superadmin bypass. Stops a crafted request from logging to the wrong child
  // even if the UI is bypassed.
  const role = String(session.user.role || employee?.role || '').toLowerCase();
  const isAdmin = ADMIN_ROLES.includes(role);
  if (CLASSROOM_SCOPING_ENABLED && !isAdmin) {
    const childRoom = (child.classroom_id as string | null) ?? null;
    const myRoom = employee?.classroom_id ?? null;
    if (!myRoom || childRoom !== myRoom) {
      return NextResponse.json(
        { error: 'This child is not in your classroom.' },
        { status: 403 }
      );
    }
  }
  // The authoritative room for the entry is the child's, never a client value.
  const entryClassroomId =
    (child.classroom_id as string | null) ?? body.classroom_id ?? null;
  // The entry's center is the child's, never a client value (a cross-center
  // owner may be logging). Drives the portal feed + reporting scope.
  const entryCenterId = (child.center_id as string | null) ?? null;
  const occurredAt = body.occurred_at || new Date().toISOString();
  const date = centerDateOf(occurredAt);

  const detail: Record<string, unknown> =
    body.detail && typeof body.detail === 'object' ? { ...body.detail } : {};
  const noteText = typeof detail.note === 'string' ? detail.note : '';

  // Idempotency: if the same staff just logged the same thing for the same
  // child seconds ago (double tap, or a retry after a flaky network), return
  // that entry instead of creating a duplicate. This is what produced the
  // "three reports for the same child" problem.
  {
    const since = new Date(Date.now() - 20000).toISOString();
    const { data: recent } = await supabase
      .from('child_daily_entries')
      .select('id, child_id, date, type, detail, occurred_at, recorded_by, classroom_id, created_at')
      .eq('child_id', childId)
      .eq('type', type)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5);
    const dup = (recent ?? []).find(
      (r) =>
        ((r.detail as Record<string, unknown>)?.note ?? '') === noteText
    );
    if (dup) {
      return NextResponse.json({ ok: true, entry: await signEntryPhoto(supabase, dup), deduped: true });
    }
  }

  // A photo for THIS child goes straight onto their report (Tadpoles model).
  // Upload to the public child_photos bucket via service role; store the
  // public URL on the entry. If a photo was attached but the upload fails,
  // fail the whole request (no ghost photo entry the parent can never see).
  if (type === 'photo' && typeof body.photo_data === 'string' && body.photo_data.startsWith('data:')) {
    try {
      const commaIdx = body.photo_data.indexOf(',');
      const meta = body.photo_data.slice(5, commaIdx); // after "data:"
      const contentType = (meta.split(';')[0] || 'image/jpeg').trim();
      const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      const base64 = body.photo_data.slice(commaIdx + 1);
      const buffer = Buffer.from(base64, 'base64');
      const path = `daily-report/${childId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('child_photos')
        .upload(path, buffer, { contentType, upsert: false });
      if (upErr) {
        return NextResponse.json(
          { error: 'The photo could not be uploaded. Try again.' },
          { status: 502 }
        );
      }
      // Store the object path, not a public URL. Reads sign it on the way out
      // and the bucket can be private.
      detail.photo_url = path;
      // Secondary: classroom gallery. Best-effort; never blocks the report.
      try {
        await supabase.from('daily_photos').insert({
          center_id: entryCenterId,
          classroom_id: entryClassroomId,
          photo_url: path,
          caption: noteText || null,
          child_ids: [childId],
        });
      } catch {
        /* gallery sync is non-critical */
      }
    } catch {
      return NextResponse.json(
        { error: 'The photo could not be uploaded. Try again.' },
        { status: 502 }
      );
    }
  }

  const { data: created, error } = await supabase
    .from('child_daily_entries')
    .insert({
      child_id: childId,
      date,
      type,
      detail,
      occurred_at: occurredAt,
      recorded_by: employee?.id ?? null,
      classroom_id: entryClassroomId,
      center_id: entryCenterId,
    })
    .select('id, child_id, date, type, detail, occurred_at, recorded_by, classroom_id')
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: 'Could not save the entry' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, entry: await signEntryPhoto(supabase, created) });
}
