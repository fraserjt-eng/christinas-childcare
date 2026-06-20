export const runtime = 'nodejs';

// Submission history + cycle status for the Attendance Hub.
//
// Each CCAP export records a kiosk_attestations row (attestation_type
// 'import_attendance') with the period + row count. This route reads that
// durable history (no new table needed) and lines it up against the DCYF
// two-week billing cycles so the hub can show, per cycle: submitted or due, the
// deadline, and how many days remain. Admin-gated, service role, center-derived
// (same scope as the export route).

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { centerDate } from '@/lib/center-time';
import { recentCycles, daysUntilDeadline } from '@/lib/attendance-cycles';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function deriveCenterId(request: NextRequest, session: AuthedSession): string | null {
  const role = (session.user.role || '').toLowerCase();
  const isDirector = role === 'admin' || role === 'owner' || role === 'superadmin';
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

// Two date ranges overlap if each starts on or before the other ends.
function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const centerId = deriveCenterId(request, session);
  if (!centerId) return fail('No center selected', 404);

  const { data, error } = await supabase
    .from('kiosk_attestations')
    .select('agreed_at, agreed_name, detail')
    .eq('center_id', centerId)
    .eq('attestation_type', 'import_attendance')
    .order('agreed_at', { ascending: false })
    .limit(500);
  if (error) return fail('Could not read submission history', 500);

  const submissions = (data ?? []).map((r) => {
    const detail = (r.detail || {}) as { period_start?: string; period_end?: string; row_count?: number };
    return {
      submittedAt: (r.agreed_at as string) || '',
      by: (r.agreed_name as string) || '',
      periodStart: detail.period_start || '',
      periodEnd: detail.period_end || '',
      rowCount: typeof detail.row_count === 'number' ? detail.row_count : null,
    };
  });

  const today = centerDate();
  const cycles = recentCycles(today, 5).map((c) => {
    const matched = submissions.filter(
      (s) => s.periodStart && s.periodEnd && overlaps(s.periodStart, s.periodEnd, c.start, c.end)
    );
    return {
      ...c,
      submitted: matched.length > 0,
      submissionCount: matched.length,
      lastSubmittedAt: matched[0]?.submittedAt || null,
      daysUntilDeadline: daysUntilDeadline(c, today),
      isCurrent: today >= c.start && today <= c.end,
    };
  });

  return NextResponse.json({ centerId, today, submissions, cycles }, { headers: { 'Cache-Control': 'no-store' } });
}
