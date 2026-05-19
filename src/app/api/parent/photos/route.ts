export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionFamily } from '@/lib/parent-server';

// The signed-in parent's photo gallery: only photos tagged to THEIR
// children (daily_photos.child_ids overlaps the family's children). This
// includes photos staff attach on the Daily Report. Scoped server-side;
// a parent never sees another family's or a whole classroom's photos.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const family = await resolveSessionFamily(session);
  const childIds = (family?.children ?? []).map((c) => c.id);
  if (childIds.length === 0) {
    return NextResponse.json(
      { photos: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('daily_photos')
    .select('id, photo_url, caption, created_at, classroom_name, activity_type, child_ids')
    .overlaps('child_ids', childIds)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json(
      { error: 'Could not load photos' },
      { status: 500 }
    );
  }

  // Defensive: only keep rows that really overlap this family's children.
  const photos = (data ?? [])
    .filter((p) =>
      Array.isArray(p.child_ids)
        ? p.child_ids.some((id: string) => childIds.includes(id))
        : false
    )
    .map((p) => ({
      id: p.id as string,
      photo_url: (p.photo_url as string) || '',
      caption: (p.caption as string | null) || '',
      created_at: (p.created_at as string) || new Date().toISOString(),
      classroom_name: (p.classroom_name as string | null) || '',
      activity_type: (p.activity_type as string | null) || 'other',
    }));

  return NextResponse.json(
    { photos },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
