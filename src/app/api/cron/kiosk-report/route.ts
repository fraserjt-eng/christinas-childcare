export const runtime = 'nodejs';

// Every-2-hours kiosk attendance email (Vercel Cron). Builds the all-centers
// report and emails it from J's Gmail to himself. Secured by CRON_SECRET (Vercel
// sends it as a Bearer header). Week-guarded to Mon Jun 29 - Fri Jul 3, 2026, so a
// leftover cron is a no-op after the week. `?force=1` (with the secret) bypasses
// the guard for a manual test. Sends nothing if Gmail is not configured.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { buildKioskReport } from '@/lib/kiosk-report';
import { kioskReportEmailHtml, kioskReportSubject } from '@/lib/kiosk-report-html';
import { sendGmail, isGmailConfigured } from '@/lib/gmail-send';
import { centerDate } from '@/lib/center-time';

// Inclusive business-day window for this week's first-week monitoring.
const WEEK_START = '2026-06-29';
const WEEK_END = '2026-07-03';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const force = request.nextUrl.searchParams.get('force') === '1';
  const today = centerDate();
  if (!force && (today < WEEK_START || today > WEEK_END)) {
    return NextResponse.json({ ok: true, skipped: 'outside the report week', today });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: 'Unavailable' }, { status: 503 });

  if (!isGmailConfigured()) {
    return NextResponse.json({ ok: true, skipped: 'gmail not configured', today });
  }

  try {
    const report = await buildKioskReport(supabase, null); // all active centers
    const to = process.env.GMAIL_SENDER as string; // J sends to himself
    const result = await sendGmail({
      to,
      subject: kioskReportSubject(report),
      html: kioskReportEmailHtml(report),
    });
    return NextResponse.json({ ok: result.ok, reason: result.reason, today, asOf: report.asOfCentral });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not build or send the report' }, { status: 500 });
  }
}
