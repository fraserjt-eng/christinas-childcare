export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { centerDateOf } from '@/lib/center-time';

// Batch daily entry: log the same kind of entry (a note/activity/nap/meal/etc.)
// for many children in a classroom at once, with optional per-child overrides.
// Writes child_daily_entries via the service role (the table is RLS
// service-role-only). Mirrors the single POST /api/child-entries contract.
// Sensitive types (photo, incident, medication) are intentionally excluded from
// batch entry: those must be logged per child, deliberately.
const BATCH_TYPES = ['note', 'activity', 'nap', 'meal', 'bathroom', 'diaper'] as const;
type BatchType = (typeof BATCH_TYPES)[number];

interface EntryInput {
  child_id?: string;
  note?: string;
}

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
  const type = String(body.type || '').trim() as BatchType;
  if (!BATCH_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid entry type for batch' }, { status: 400 });
  }

  const sharedNote = typeof body.note === 'string' ? body.note.trim() : '';
  const classroomName =
    typeof body.classroom_name === 'string' ? body.classroom_name.trim() : '';
  const entries: EntryInput[] = Array.isArray(body.entries) ? body.entries : [];

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No children selected' }, { status: 400 });
  }
  if (entries.length > 100) {
    return NextResponse.json({ error: 'Too many children at once (max 100)' }, { status: 400 });
  }

  // Resolve classroom_id from the name for metadata (nullable; never blocks).
  let classroomId: string | null = null;
  if (classroomName) {
    const { data: room } = await supabase
      .from('classrooms')
      .select('id')
      .eq('name', classroomName)
      .maybeSingle();
    classroomId = (room?.id as string) ?? null;
  }

  const employee = await resolveSessionEmployee(session);
  const occurredAt = new Date().toISOString();
  const date = centerDateOf(occurredAt);

  // Build one row per included child. A per-child note overrides the shared note.
  // Rows with no note at all are skipped (nothing to record).
  const rows = entries
    .filter((e) => typeof e.child_id === 'string' && e.child_id)
    .map((e) => {
      const note =
        typeof e.note === 'string' && e.note.trim() ? e.note.trim() : sharedNote;
      return {
        child_id: e.child_id as string,
        date,
        type,
        detail: { note } as Record<string, unknown>,
        occurred_at: occurredAt,
        recorded_by: employee?.id ?? null,
        classroom_id: classroomId,
      };
    })
    .filter((r) => (r.detail.note as string));

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Nothing to log. Add a note for the class or per child.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('child_daily_entries')
    .insert(rows)
    .select('id');

  if (error) {
    return NextResponse.json({ error: 'Could not save the entries' }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, count: data?.length ?? rows.length },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
