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

    // Recent in-app kiosk alerts (wrong-PIN throttle approaching/hit) in the last
    // 24h, scoped to the centers this session may see. Best-effort: if migration
    // 056 (kiosk_alerts) is not applied yet, this yields an empty list rather
    // than failing the whole report.
    let recentAlerts: Array<{
      id: string;
      centerId: string | null;
      centerName: string;
      level: string;
      wrongCount: number;
      limitCount: number;
      at: string;
    }> = [];
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      let aq = supabase
        .from('kiosk_alerts')
        .select('id, center_id, level, wrong_count, limit_count, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50);
      if (scope) aq = aq.in('center_id', scope);
      const { data: alerts } = await aq;
      if (alerts && alerts.length) {
        const { data: centers } = await supabase.from('centers').select('id, name').limit(50);
        const nameById = new Map((centers ?? []).map((c) => [c.id as string, (c.name as string) || 'Center']));
        recentAlerts = alerts.map((a) => ({
          id: a.id as string,
          centerId: (a.center_id as string | null) ?? null,
          centerName: nameById.get(a.center_id as string) || 'Center',
          level: (a.level as string) || '',
          wrongCount: (a.wrong_count as number) ?? 0,
          limitCount: (a.limit_count as number) ?? 0,
          at: (a.created_at as string) || '',
        }));
      }
    } catch {
      /* kiosk_alerts not present yet; report still returns */
    }

    return NextResponse.json({ ...report, recentAlerts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not build the report' }, { status: 500 });
  }
}
