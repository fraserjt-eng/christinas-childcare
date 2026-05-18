export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// Roster for staff capture: every active child so a teacher can pick the
// one they are logging for. Staff only (rank >= teacher); service role.
export async function GET() {
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data: kids } = await supabase
    .from('family_children')
    .select('id, name, classroom, family_id')
    .limit(5000);

  // Stable sort: classroom, then name (PostgREST .order can drop rows
  // combined with filters; sort in JS per the project rule).
  const children = (kids ?? [])
    .map((c) => ({
      id: c.id as string,
      name: (c.name as string) || 'Child',
      classroom: (c.classroom as string | null) ?? null,
    }))
    .sort((a, b) => {
      const ca = a.classroom || '';
      const cb = b.classroom || '';
      if (ca !== cb) return ca.localeCompare(cb);
      return a.name.localeCompare(b.name);
    });

  return NextResponse.json(
    { children },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
