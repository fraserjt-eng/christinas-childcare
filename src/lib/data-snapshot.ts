// Client-side wrapper around the server-side backup API. Returns rich Result
// objects (success + data, or success: false + human-readable error) so the
// admin page can show real failure reasons instead of generic toasts.
//
// All functions are HTTP calls to /api/backup/snapshot[/:id]. The server
// handles Supabase Storage and the metadata table via the service role key.

import { isV2, type SnapshotEnvelope } from './backup/envelope';

// ─── Public types ─────────────────────────────────────────────────────────

export interface SnapshotMeta {
  id: string;                  // uuid from backup_snapshots OR storage path for legacy v1
  storage_path: string;
  envelope_version: number;
  created_at: string;
  byte_size: number;
  local_key_count: number;
  table_count: number;
  table_row_count: number;
  tables_included: string[];
  created_by: string | null;
  notes: string | null;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Legacy alias — old callers imported this name.
export type CreateSnapshotResult = Result<SnapshotMeta>;

// ─── Helpers ──────────────────────────────────────────────────────────────

const SKIP_KEYS = new Set([
  'christinas_daily_photos',
  'christinas_photo_reactions',
]);

function collectLocalStorageData(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith('christinas_')) continue;
    if (SKIP_KEYS.has(key)) continue;
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return data;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body?.error ?? fallback;
  } catch {
    return `${fallback} (HTTP ${res.status})`;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function createSnapshot(opts?: {
  createdBy?: string | null;
  notes?: string;
}): Promise<Result<SnapshotMeta>> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Snapshots can only be created in the browser.' };
  }

  const localStorageData = collectLocalStorageData();

  let res: Response;
  try {
    res = await fetch('/api/backup/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        localStorage: localStorageData,
        createdBy: opts?.createdBy ?? null,
        notes: opts?.notes,
        source: 'admin_button',
      }),
    });
  } catch (e) {
    return { ok: false, error: `Network error: ${(e as Error).message}` };
  }

  if (!res.ok) {
    return { ok: false, error: await parseError(res, 'Snapshot failed') };
  }

  const body = (await res.json()) as { ok: boolean; snapshot: SnapshotMeta };
  return { ok: true, data: body.snapshot };
}

export async function listSnapshots(): Promise<Result<SnapshotMeta[]>> {
  let res: Response;
  try {
    res = await fetch('/api/backup/snapshot', { method: 'GET' });
  } catch (e) {
    return { ok: false, error: `Network error: ${(e as Error).message}` };
  }
  if (!res.ok) {
    return { ok: false, error: await parseError(res, 'Could not load snapshots') };
  }
  const body = (await res.json()) as { ok: boolean; snapshots: SnapshotMeta[] };
  return { ok: true, data: body.snapshots };
}

export interface RestoreOutcome {
  envelope_version: number;
  local_keys_restored: number;
  supabase_restored: { tables: number; rows: number };
  warnings: string[];
}

export async function restoreFromSnapshot(
  snapshotId: string,
  options?: { restoreSupabase?: boolean }
): Promise<Result<RestoreOutcome>> {
  let res: Response;
  try {
    res = await fetch(`/api/backup/snapshot/${encodeURIComponent(snapshotId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restoreSupabase: options?.restoreSupabase ?? true }),
    });
  } catch (e) {
    return { ok: false, error: `Network error: ${(e as Error).message}` };
  }

  if (!res.ok) {
    return { ok: false, error: await parseError(res, 'Restore failed') };
  }

  const body = (await res.json()) as {
    ok: boolean;
    envelope_version: number;
    localStorage: Record<string, string>;
    supabase_restored: { tables: number; rows: number };
    warnings: string[];
  };

  // Apply localStorage on the client side (the API route can't reach into
  // the user's browser).
  let localKeysRestored = 0;
  if (typeof window !== 'undefined') {
    for (const [key, value] of Object.entries(body.localStorage ?? {})) {
      try {
        localStorage.setItem(key, value);
        localKeysRestored += 1;
      } catch {
        body.warnings.push(`localStorage write failed for "${key}".`);
      }
    }
  }

  return {
    ok: true,
    data: {
      envelope_version: body.envelope_version,
      local_keys_restored: localKeysRestored,
      supabase_restored: body.supabase_restored,
      warnings: body.warnings,
    },
  };
}

export async function deleteSnapshot(snapshotId: string): Promise<Result<true>> {
  let res: Response;
  try {
    res = await fetch(`/api/backup/snapshot/${encodeURIComponent(snapshotId)}`, {
      method: 'DELETE',
    });
  } catch (e) {
    return { ok: false, error: `Network error: ${(e as Error).message}` };
  }
  if (!res.ok) {
    return { ok: false, error: await parseError(res, 'Delete failed') };
  }
  return { ok: true, data: true };
}

export async function getSnapshotData(
  snapshotId: string
): Promise<Result<SnapshotEnvelope>> {
  let res: Response;
  try {
    res = await fetch(`/api/backup/snapshot/${encodeURIComponent(snapshotId)}`, {
      method: 'GET',
    });
  } catch (e) {
    return { ok: false, error: `Network error: ${(e as Error).message}` };
  }
  if (!res.ok) {
    return { ok: false, error: await parseError(res, 'Could not load snapshot') };
  }
  const body = (await res.json()) as { ok: boolean; envelope: SnapshotEnvelope };
  return { ok: true, data: body.envelope };
}

export async function getLastSnapshotDate(): Promise<string | null> {
  const result = await listSnapshots();
  if (!result.ok || result.data.length === 0) return null;
  return result.data[0].created_at;
}

// Re-export so consumers can detect envelope versions.
export { isV2 };
export type { SnapshotEnvelope };
