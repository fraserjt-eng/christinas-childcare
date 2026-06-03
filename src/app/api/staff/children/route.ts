export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { ADMIN_ROLES } from '@/lib/child-entries-policy';

// Roster for staff capture: the children a teacher may log for. A teacher is
// scoped to their assigned classroom (employees.classroom_id); admin / owner /
// superadmin see everyone. Prevents logging the wrong thing on the wrong child.
// Staff only (rank >= teacher); service role.
export async function GET() {
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // requireSession promotes the configured owner email to superadmin, so the
  // session role is the trustworthy admin signal. Fall back to the DB record.
  const employee = await resolveSessionEmployee(session);
  const role = String(session.user.role || employee?.role || '').toLowerCase();
  const isAdmin = ADMIN_ROLES.includes(role);
  const myClassroom = employee?.classroom_id ?? null;

  const { data: kids } = await supabase
    .from('family_children')
    .select('id, name, classroom, family_id, classroom_id')
    .limit(5000);

  let rows = kids ?? [];
  if (!isAdmin) {
    // Scoped teacher: only their room. No room assigned -> empty roster, never
    // a silent all-children fallback (the whole point of the feature).
    rows = myClassroom
      ? rows.filter((c) => (c.classroom_id as string | null) === myClassroom)
      : [];
  }

  // Stable sort: classroom, then name (PostgREST .order can drop rows
  // combined with filters; sort in JS per the project rule).
  const children = rows
    .map((c) => ({
      id: c.id as string,
      name: (c.name as string) || 'Child',
      classroom: (c.classroom as string | null) ?? null,
      classroom_id: (c.classroom_id as string | null) ?? null,
    }))
    .sort((a, b) => {
      const ca = a.classroom || '';
      const cb = b.classroom || '';
      if (ca !== cb) return ca.localeCompare(cb);
      return a.name.localeCompare(b.name);
    });

  return NextResponse.json(
    { children, scoped: !isAdmin, classroom_id: myClassroom },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
