export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// The list of real classrooms, for the admin assignment dropdowns (assign a
// teacher to a room, assign a child to a room). Admin only; service role.
export async function GET() {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Scope the dropdown to the signed-in admin's center so they only assign
  // teachers/children to their own rooms. The cross-center owner/superadmin
  // (null center) sees every center's rooms.
  const centerId = session.user.center_id ?? null;
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let roomsQuery = supabase
    .from('classrooms')
    .select('id, name, age_group, center_id, is_active')
    .limit(5000);
  if (centerId) roomsQuery = roomsQuery.eq('center_id', centerId);
  const { data } = await roomsQuery;

  // Active rooms first, then by name. Sort in JS per the project's PostgREST rule.
  const classrooms = (data ?? [])
    .filter((c) => c.is_active !== false)
    .map((c) => ({
      id: c.id as string,
      name: (c.name as string) || 'Room',
      age_group: (c.age_group as string | null) ?? null,
      center_id: (c.center_id as string | null) ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(
    { classrooms },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
