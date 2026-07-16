// Self-heal for the "PostgREST wedged" class of outage.
//
// Twice now (2026-07-02, 2026-07-16) the managed REST layer (PostgREST) in
// front of the database hung: Postgres itself stayed healthy, but every
// /rest/v1 call — including every kiosk sign-in — returned a gateway timeout.
// The only fix was a full project restart, which on 2026-07-16 meant a human
// noticing an email and clicking a dashboard button ~44 minutes later.
//
// This module lets the every-5-minutes health cron do that restart itself, in
// ~2 minutes, with no human: when the probe confirms the REST layer is down it
// calls the Supabase Management API to restart the project.
//
// SAFETY:
//  - Disabled unless BOTH env vars are set (SUPABASE_MGMT_TOKEN + SUPABASE_
//    PROJECT_REF); otherwise it is a no-op and the cron falls back to alert-only.
//  - Restarts ONLY when the project reports ACTIVE_HEALTHY. That is precisely
//    our failure mode (control plane healthy, REST layer wedged) and it also
//    prevents a restart loop: right after a restart the status is no longer
//    ACTIVE_HEALTHY, so the next cron run skips until it has recovered.
//  - SUPABASE_MGMT_TOKEN is a management-plane personal access token. Keep it in
//    Vercel server env only; it must never reach the client bundle.

const MGMT_BASE = 'https://api.supabase.com/v1';

export function isAutoRestartConfigured(): boolean {
  return Boolean(process.env.SUPABASE_MGMT_TOKEN && process.env.SUPABASE_PROJECT_REF);
}

async function mgmtFetch(
  path: string,
  init: RequestInit,
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${MGMT_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_MGMT_TOKEN as string}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// The project's control-plane status (e.g. ACTIVE_HEALTHY, RESTARTING,
// COMING_UP, PAUSED). null if it can't be read.
export async function getProjectStatus(): Promise<string | null> {
  const ref = process.env.SUPABASE_PROJECT_REF as string;
  try {
    const res = await mgmtFetch(`/projects/${ref}`, { method: 'GET' });
    if (!res.ok) return null;
    const body = (await res.json()) as { status?: string };
    return body?.status ?? null;
  } catch {
    return null;
  }
}

export type RestartOutcome =
  | { attempted: false; reason: string }
  | { attempted: true; ok: boolean; status?: number; detail: string };

// Restart the project iff it looks wedged-but-alive. Callers should only reach
// here after the health probe has already CONFIRMED the REST layer is down.
export async function restartIfWedged(): Promise<RestartOutcome> {
  if (!isAutoRestartConfigured()) {
    return { attempted: false, reason: 'auto-restart not configured' };
  }
  const ref = process.env.SUPABASE_PROJECT_REF as string;

  const status = await getProjectStatus();
  if (status == null) {
    return { attempted: false, reason: 'could not read project status' };
  }
  // Only ACTIVE_HEALTHY = "REST wedged but the project is up" -> safe to reboot.
  // Any other status (already restarting, paused, unknown) -> stand down so we
  // never restart-loop or fight the platform.
  if (status !== 'ACTIVE_HEALTHY') {
    return { attempted: false, reason: `project status is ${status}; standing down` };
  }

  try {
    const res = await mgmtFetch(`/projects/${ref}/restart`, { method: 'POST' });
    if (res.ok) {
      return { attempted: true, ok: true, status: res.status, detail: 'restart requested' };
    }
    const text = await res.text().catch(() => '');
    return { attempted: true, ok: false, status: res.status, detail: text || `HTTP ${res.status}` };
  } catch {
    return { attempted: true, ok: false, detail: 'restart request failed (network/timeout)' };
  }
}
