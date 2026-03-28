// Data snapshot and restore system for Christina's Child Care Center.
// Snapshots collect all christinas_* localStorage keys, bundle them as JSON,
// and upload to Supabase Storage. Restore downloads a snapshot and writes
// each key back to localStorage.
//
// If Supabase is not configured, all functions return null/empty and log a
// console warning so callers degrade gracefully.

import { getSupabase, isSupabaseConfigured } from './supabase/client';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET = 'data-snapshots';
const MAX_SNAPSHOTS = 8;

// These keys are skipped: too large, not recoverable operational data.
const SKIP_KEYS = ['christinas_daily_photos', 'christinas_photo_reactions'];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SnapshotMeta {
  id: string;          // filename in bucket, e.g. "snapshot-2026-03-28-143022.json"
  created_at: string;  // ISO timestamp parsed from filename
  key_count: number;   // number of localStorage keys in the snapshot
  byte_size: number;   // approximate JSON byte size
}

interface SnapshotFile {
  meta: {
    created_at: string;
    key_count: number;
    byte_size: number;
  };
  data: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}-${hh}${min}${ss}`;
}

function parseTimestampFromFilename(filename: string): string {
  // filename: snapshot-YYYY-MM-DD-HHmmss.json
  const match = filename.match(/snapshot-(\d{4}-\d{2}-\d{2})-(\d{6})\.json/);
  if (!match) return new Date(0).toISOString();
  const [, datePart, timePart] = match;
  const hh = timePart.slice(0, 2);
  const min = timePart.slice(2, 4);
  const ss = timePart.slice(4, 6);
  return new Date(`${datePart}T${hh}:${min}:${ss}`).toISOString();
}

function collectLocalStorageData(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const data: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith('christinas_')) continue;
    if (SKIP_KEYS.includes(key)) continue;

    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }

  return data;
}

function warnNotConfigured(fn: string): void {
  console.warn(`data-snapshot: Supabase is not configured. ${fn}() is a no-op.`);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reads all christinas_* localStorage keys (except SKIP_KEYS), bundles them
 * into a JSON file, and uploads to Supabase Storage. Returns snapshot metadata
 * on success. Returns null if Supabase is not configured or the upload fails.
 *
 * After a successful upload, old snapshots beyond MAX_SNAPSHOTS are pruned.
 */
export async function createSnapshot(): Promise<SnapshotMeta | null> {
  if (!isSupabaseConfigured) {
    warnNotConfigured('createSnapshot');
    return null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const data = collectLocalStorageData();
  const createdAt = new Date().toISOString();
  const keyCount = Object.keys(data).length;

  const snapshotFile: SnapshotFile = {
    meta: {
      created_at: createdAt,
      key_count: keyCount,
      byte_size: 0, // filled in after serialization
    },
    data,
  };

  const json = JSON.stringify(snapshotFile);
  snapshotFile.meta.byte_size = new TextEncoder().encode(json).length;

  // Re-serialize with the correct byte_size
  const finalJson = JSON.stringify(snapshotFile);
  const byteSize = new TextEncoder().encode(finalJson).length;

  const filename = `snapshot-${buildTimestamp()}.json`;
  const blob = new Blob([finalJson], { type: 'application/json' });

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, {
      contentType: 'application/json',
      upsert: false,
    });

  if (error) {
    console.error('data-snapshot: upload failed:', error.message);
    return null;
  }

  const meta: SnapshotMeta = {
    id: filename,
    created_at: createdAt,
    key_count: keyCount,
    byte_size: byteSize,
  };

  // Prune old snapshots after a successful upload (fire and forget)
  pruneOldSnapshots().catch((err) =>
    console.warn('data-snapshot: prune failed silently:', err)
  );

  return meta;
}

/**
 * Returns all snapshots in the bucket, sorted newest first.
 * Returns an empty array if Supabase is not configured or the list fails.
 */
export async function listSnapshots(): Promise<SnapshotMeta[]> {
  if (!isSupabaseConfigured) {
    warnNotConfigured('listSnapshots');
    return [];
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    console.error('data-snapshot: list failed:', error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  return data
    .filter((f) => f.name.startsWith('snapshot-') && f.name.endsWith('.json'))
    .map((f) => ({
      id: f.name,
      created_at: parseTimestampFromFilename(f.name),
      key_count: 0,   // not available from list; populated on demand if needed
      byte_size: f.metadata?.size ?? 0,
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

/**
 * Downloads a snapshot file and writes each key back to localStorage.
 * Returns the number of keys restored, or 0 on failure.
 */
export async function restoreFromSnapshot(snapshotId: string): Promise<number> {
  if (!isSupabaseConfigured) {
    warnNotConfigured('restoreFromSnapshot');
    return 0;
  }

  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(snapshotId);

  if (error || !data) {
    console.error('data-snapshot: download failed:', error?.message);
    return 0;
  }

  let snapshotFile: SnapshotFile;
  try {
    const text = await data.text();
    snapshotFile = JSON.parse(text) as SnapshotFile;
  } catch (parseError) {
    console.error('data-snapshot: failed to parse snapshot JSON:', parseError);
    return 0;
  }

  if (!snapshotFile.data || typeof snapshotFile.data !== 'object') {
    console.error('data-snapshot: snapshot file has no data field');
    return 0;
  }

  let count = 0;
  for (const [key, value] of Object.entries(snapshotFile.data)) {
    try {
      localStorage.setItem(key, value);
      count++;
    } catch (storageError) {
      console.warn(`data-snapshot: failed to restore key "${key}":`, storageError);
    }
  }

  return count;
}

/**
 * Keeps only the MAX_SNAPSHOTS most recent snapshots and deletes the rest.
 * Returns the number of files deleted, or 0 if nothing needed pruning.
 */
export async function pruneOldSnapshots(): Promise<number> {
  if (!isSupabaseConfigured) {
    warnNotConfigured('pruneOldSnapshots');
    return 0;
  }

  const supabase = getSupabase();
  if (!supabase) return 0;

  const snapshots = await listSnapshots();

  if (snapshots.length <= MAX_SNAPSHOTS) return 0;

  const toDelete = snapshots.slice(MAX_SNAPSHOTS).map((s) => s.id);

  const { error } = await supabase.storage.from(BUCKET).remove(toDelete);

  if (error) {
    console.error('data-snapshot: prune failed:', error.message);
    return 0;
  }

  return toDelete.length;
}

/**
 * Returns the ISO timestamp of the most recent snapshot, or null if none exist.
 * Used by the reminder banner to show "last backed up X days ago".
 */
export async function getLastSnapshotDate(): Promise<string | null> {
  const snapshots = await listSnapshots();
  if (snapshots.length === 0) return null;
  return snapshots[0].created_at;
}

/**
 * Downloads a snapshot file and returns its parsed data object.
 * Used by the backup page to export a snapshot as CSV.
 * Returns null on failure.
 */
export async function getSnapshotData(
  snapshotId: string
): Promise<Record<string, string> | null> {
  if (!isSupabaseConfigured) {
    warnNotConfigured('getSnapshotData');
    return null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(snapshotId);

  if (error || !data) {
    console.error('data-snapshot: download failed:', error?.message);
    return null;
  }

  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as SnapshotFile;
    return parsed.data ?? null;
  } catch {
    console.error('data-snapshot: failed to parse snapshot JSON');
    return null;
  }
}

/**
 * Deletes a single snapshot from the bucket.
 * Returns true on success, false on failure.
 */
export async function deleteSnapshot(snapshotId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    warnNotConfigured('deleteSnapshot');
    return false;
  }

  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([snapshotId]);

  if (error) {
    console.error('data-snapshot: delete failed:', error.message);
    return false;
  }

  return true;
}
