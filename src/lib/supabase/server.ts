import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role key
// Use this in API routes where you need full access (bypasses RLS)
//
// opts.timeoutMs: hard per-request ceiling. When set, every PostgREST/Storage
// call this client makes is aborted after timeoutMs. This is how the kiosk and
// the portal read survive a PostgREST hang: instead of a request sitting open
// until the platform's 504 (or the serverless maxDuration), the fetch aborts
// quickly, the query returns an AbortError, and the route can degrade to a fast
// 503 ("system slow, use paper") rather than pinning a function for minutes.
// Left unset (the default), behaviour is unchanged — no timeout — so existing
// callers, including slow admin imports/reports, are not affected.
export function getServerSupabase(opts?: { timeoutMs?: number }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  const timeoutMs = opts?.timeoutMs;

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
    ...(timeoutMs && timeoutMs > 0
      ? {
          global: {
            // Wrap fetch so each request has its own AbortController-backed
            // timeout, while still honouring any caller-provided signal.
            fetch: (input: RequestInfo | URL, init?: RequestInit) => {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), timeoutMs);
              const upstream = init?.signal;
              if (upstream) {
                if (upstream.aborted) controller.abort();
                else upstream.addEventListener('abort', () => controller.abort(), { once: true });
              }
              return fetch(input, { ...init, signal: controller.signal }).finally(() =>
                clearTimeout(timer),
              );
            },
          },
        }
      : {}),
  });
}
