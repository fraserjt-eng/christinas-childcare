export const runtime = 'nodejs';

// Every-5-minutes database health probe (Vercel Cron). Runs a lightweight
// query against the `centers` table with an 8-second timeout. If the probe
// fails or times out, it emails J an alert from his own Gmail so a kiosk
// outage is known in minutes, not hours.
//
// NOTE: alert DELIVERY depends on the Gmail env being set (GOOGLE_CLIENT_ID,
// GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER). Until those are
// configured in Vercel, an unhealthy probe is logged and returned in the JSON
// but no email goes out. Secured by CRON_SECRET (Vercel sends it as a Bearer
// header). `?force=1` (with the secret) runs the same probe for a manual test.
// This route never throws; it always returns JSON.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendGmail, isGmailConfigured } from '@/lib/gmail-send';
import { centerTime, centerDate } from '@/lib/center-time';
import { restartIfWedged, isAutoRestartConfigured, type RestartOutcome } from '@/lib/supabase-admin-restart';

const PROBE_TIMEOUT_MS = 8000;
// Re-probe before acting, so a single transient blip never triggers a restart.
const CONFIRM_PROBES = 3;
const CONFIRM_GAP_MS = 2000;

type ProbeResult = { healthy: boolean; detail: string };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeDatabase(): Promise<ProbeResult> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return { healthy: false, detail: 'Supabase env not configured on the server.' };
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<ProbeResult>((resolve) => {
    timer = setTimeout(
      () => resolve({ healthy: false, detail: `Probe timed out after ${PROBE_TIMEOUT_MS / 1000}s.` }),
      PROBE_TIMEOUT_MS
    );
  });

  const query: Promise<ProbeResult> = (async () => {
    try {
      const { error } = await supabase.from('centers').select('id').limit(1);
      if (error) return { healthy: false, detail: `Query error: ${error.message}` };
      return { healthy: true, detail: 'ok' };
    } catch {
      return { healthy: false, detail: 'Query threw (network or provider error).' };
    }
  })();

  try {
    return await Promise.race([query, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Probe up to CONFIRM_PROBES times; healthy on the first success. Only a run
// where EVERY probe fails is treated as a real outage worth self-healing.
async function confirmDatabaseDown(first: ProbeResult): Promise<ProbeResult> {
  let last = first;
  for (let i = 1; i < CONFIRM_PROBES && !last.healthy; i++) {
    await delay(CONFIRM_GAP_MS);
    last = await probeDatabase();
  }
  return last;
}

function restartLine(r: RestartOutcome): string {
  if (!r.attempted) return `Auto-restart: not triggered (${r.reason}).`;
  return r.ok
    ? 'Auto-restart: <strong>triggered</strong> — the project is rebooting; the kiosk should recover within ~2 minutes.'
    : `Auto-restart: attempted but FAILED (${r.detail}). Restart manually from the Supabase dashboard now.`;
}

function alertHtml(detail: string, whenCentral: string, restart: RestartOutcome): string {
  return [
    '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">',
    '<h2 style="color: #C62828; margin: 0 0 8px;">Kiosk database is not responding</h2>',
    `<p>The health probe against Christina&#39;s kiosk database failed at <strong>${whenCentral} Central</strong>.</p>`,
    `<p>Detail: ${detail}</p>`,
    `<p>${restartLine(restart)}</p>`,
    '<p>The kiosk, parent portal, and attendance all depend on this database. If it does not recover shortly, restart the project in the Supabase dashboard and switch the front desk to the paper sign-in sheet.</p>',
    '</div>',
  ].join('');
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  // `?force=1` is accepted for a manual test; the probe runs either way.
  const force = request.nextUrl.searchParams.get('force') === '1';

  const first = await probeDatabase();
  const today = centerDate();
  const nowCentral = `${centerTime()} on ${today}`;

  if (first.healthy) {
    return NextResponse.json({ ok: true, healthy: true, today, forced: force });
  }

  // First probe failed — confirm it's a real outage, not a one-off blip,
  // before self-healing.
  const probe = await confirmDatabaseDown(first);
  if (probe.healthy) {
    return NextResponse.json({ ok: true, healthy: true, recoveredOnRetry: true, today, forced: force });
  }

  console.error(`[kiosk-health] Database probe FAILED at ${nowCentral}: ${probe.detail}`);

  // SELF-HEAL: this is the exact "PostgREST wedged" failure mode from
  // 2026-07-02 and 2026-07-16. If auto-restart is configured, reboot the
  // project automatically (turns a ~44-minute human-in-the-loop outage into a
  // ~2-minute self-heal). No-op + alert-only if the mgmt token isn't set yet.
  const restart: RestartOutcome = await restartIfWedged();
  if (restart.attempted && restart.ok) {
    console.error(`[kiosk-health] Auto-restart triggered at ${nowCentral}.`);
  }

  // Alert best-effort. If Gmail is not configured yet, log and return ok so
  // Vercel does not mark the cron itself as failing.
  if (!isGmailConfigured()) {
    return NextResponse.json({
      ok: true,
      healthy: false,
      detail: probe.detail,
      alerted: false,
      reason: 'gmail not configured',
      autoRestart: restart,
      autoRestartConfigured: isAutoRestartConfigured(),
      today,
    });
  }

  const to = process.env.GMAIL_SENDER || 'fraserjt@gmail.com';
  const subject = restart.attempted && restart.ok
    ? 'ALERT: Christina kiosk DB down — auto-restart triggered'
    : 'ALERT: Christina kiosk database is not responding';
  const result = await sendGmail({
    to,
    subject,
    html: alertHtml(probe.detail, nowCentral, restart),
  });

  return NextResponse.json({
    ok: true,
    healthy: false,
    detail: probe.detail,
    alerted: result.ok,
    reason: result.reason,
    autoRestart: restart,
    autoRestartConfigured: isAutoRestartConfigured(),
    today,
  });
}
