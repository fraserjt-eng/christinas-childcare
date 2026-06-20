// Guarded data helpers: same signatures as src/lib/supabase/service.ts, but
// routed through the session-gated /api/store server route (service role)
// instead of the anon publishable key. Use these in storage modules whose
// tables hold PII / roster / security data and must NOT be reachable by the
// browser's anon key. A module only swaps its import (service -> guarded).
//
// Client-only: relative fetch needs a browser. Server-side (SSR) these return
// null so the caller falls back to its localStorage cache, matching the
// dual-write contract.

async function call(op: string, payload: Record<string, unknown>): Promise<unknown> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op, ...payload }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function supabaseSelect<T>(
  table: string,
  options?: {
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<T[] | null> {
  const data = await call('select', { table, ...(options ?? {}) });
  return (data as T[] | null) ?? null;
}

export async function supabaseInsert<T>(
  table: string,
  record: Record<string, unknown>
): Promise<T | null> {
  return (await call('insert', { table, record })) as T | null;
}

export async function supabaseUpdate<T>(
  table: string,
  id: string,
  updates: Record<string, unknown>
): Promise<T | null> {
  return (await call('update', { table, id, updates })) as T | null;
}

export async function supabaseUpsert<T>(
  table: string,
  record: Record<string, unknown>,
  onConflict: string
): Promise<T | null> {
  return (await call('upsert', { table, record, onConflict })) as T | null;
}

export async function supabaseDelete(
  table: string,
  id: string
): Promise<boolean | null> {
  const ok = await call('delete', { table, id });
  return ok === null ? null : true;
}
