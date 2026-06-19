export const runtime = 'nodejs';

// The center's staff roster. employees is RLS service-role-only, so the browser
// cannot read it with the anon key; getEmployees() reads this route instead.
// Session-gated (teacher minimum). Center-scoped exactly like the schedule
// route: a director (admin/owner/superadmin) may pick a center via the
// cc_center cookie or ?center; a center-bound user is locked to their own
// session center. The pin and any password hash are never returned.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

function deriveCenterId(
  request: NextRequest,
  session: AuthedSession
): string | null {
  const role = (session.user.role || '').toLowerCase();
  const isDirector =
    role === 'admin' || role === 'owner' || role === 'superadmin';
  const sessionCenter = session.user.center_id ?? null;
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;

  if (isDirector && picked) return picked;
  if (sessionCenter) return sessionCenter;
  if (picked) return picked;
  return null;
}

export async function GET(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const centerId = deriveCenterId(request, session);

  let query = supabase.from('employees').select('*').limit(5000);
  if (centerId) query = query.eq('center_id', centerId);
  const { data } = await query;

  // Strip the login pin and any password hash: this is a roster, not a
  // credential store, and it is readable by any signed-in staff member.
  const employees = (data ?? []).map((row) => {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
      if (key === 'pin' || key.includes('password') || key.endsWith('_hash')) {
        continue;
      }
      clean[key] = value;
    }
    return clean;
  });

  return NextResponse.json(
    { employees },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
