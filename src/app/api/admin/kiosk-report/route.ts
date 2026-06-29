export const runtime = 'nodejs';

// Live kiosk attendance-vs-enrollment report for the admin page. Admin-gated,
// service-role only (attendance + roster are RLS-locked). A cross-center director
// (owner/superadmin) sees all active centers; a center-bound admin sees only their
// own center. Same engine the every-2-hours email cron uses.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { buildKioskReport } from '@/lib/kiosk-report';

export async function GET(request: NextRequest) {
  void request;
  const session = await requireSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  const role = (session.user.role || '').toLowerCase();
  const crossCenter = role === 'owner' || role === 'superadmin' || !session.user.center_id;
  const scope = crossCenter ? null : [session.user.center_id as string];

  try {
    const report = await buildKioskReport(supabase, scope);
    return NextResponse.json(report, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not build the report' }, { status: 500 });
  }
}
