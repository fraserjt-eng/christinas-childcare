export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { resolveSessionFamily } from '@/lib/parent-server';

// The Tadpoles per-child timeline. Staff write entries stamped to the
// verified session employee + classroom + time. Parents read ONLY their own
// child's entries (scoped server-side, never trusting a client child_id).
// child_daily_entries is RLS service-role-only by design.

const ENTRY_TYPES = [
  'note',
  'nap',
  'meal',
  'bathroom',
  'diaper',
  'medication',
  'activity',
  'photo',
  'incident',
] as const;
type EntryType = (typeof ENTRY_TYPES)[number];

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
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
  }

  const { data, error } = await supabase
    .from('child_daily_entries')
    .select('id, child_id, date, type, detail, occurred_at, recorded_by, classroom_id')
    .eq('child_id', childId)
    .eq('date', date)
    .order('occurred_at', { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json(
      { error: 'Could not read the report' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { child_id: childId, date, entries: data ?? [] },
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
    .select('id, classroom')
    .eq('id', childId)
    .maybeSingle();
  if (!child) {
    return NextResponse.json({ error: 'Unknown child' }, { status: 404 });
  }

  // Stamp to the real session employee where we can resolve one.
  const employee = await resolveSessionEmployee(session);
  const occurredAt = body.occurred_at || new Date().toISOString();
  const date = occurredAt.split('T')[0];

  const detail: Record<string, unknown> =
    body.detail && typeof body.detail === 'object' ? { ...body.detail } : {};

  // A photo for THIS child goes straight onto their report (Tadpoles model).
  // Upload to the existing child_photos bucket via service role; store the
  // public URL on the entry. Also tag the child on daily_photos for the
  // classroom gallery so the two stay consistent.
  if (type === 'photo' && typeof body.photo_data === 'string' && body.photo_data.startsWith('data:')) {
    try {
      const base64 = body.photo_data.split(',')[1] || '';
      const buffer = Buffer.from(base64, 'base64');
      const path = `daily-report/${childId}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from('child_photos')
        .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
      if (!upErr) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('child_photos').getPublicUrl(path);
        detail.photo_url = publicUrl;
        await supabase.from('daily_photos').insert({
          classroom_id: body.classroom_id || null,
          photo_url: publicUrl,
          caption: typeof detail.note === 'string' ? detail.note : null,
          child_ids: [childId],
        });
      }
    } catch {
      /* if the upload fails the note still saves; staff can retry the photo */
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
      classroom_id: body.classroom_id || null,
    })
    .select('id, child_id, date, type, detail, occurred_at, recorded_by, classroom_id')
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: 'Could not save the entry' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, entry: created });
}
