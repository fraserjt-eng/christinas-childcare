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
  const sessionCenter = session.user.center_id ?? null;
  const isCrossCenter =
    role === 'owner' || role === 'superadmin';
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;
  if (isCrossCenter) return picked || sessionCenter;
  return sessionCenter;
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

  // Fail closed: a null center would expose every center's roster, so return
  // nothing rather than querying all centers.
  if (!centerId) {
    return NextResponse.json(
      { employees: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { data } = await supabase
    .from('employees')
    .select('*')
    .eq('center_id', centerId)
    .limit(5000);

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
