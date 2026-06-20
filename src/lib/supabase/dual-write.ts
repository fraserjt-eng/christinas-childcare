// Dual-write helper: Supabase first, localStorage fallback, merge on read.
// Used by storage modules that need cross-device sync.

import { getSupabase } from './client';
import {
  supabaseSelect as guardedSelect,
  supabaseUpsert as guardedUpsert,
  supabaseDelete as guardedDelete,
} from './guarded';

export interface DualWriteItem {
  id: string;
}

export interface DualWriteAdapter<T extends DualWriteItem> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  saveMany(items: T[]): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

interface DualWriteConfig {
  table: string;
  localKey: string;
  // Route cloud reads/writes through the session-gated /api/store (service role)
  // instead of the anon key. Set for PII tables the browser key must not reach.
  guarded?: boolean;
}

function getFromLocal<T>(localKey: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(localKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToLocal<T>(localKey: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(localKey, JSON.stringify(items));
  } catch (e) {
    console.error(`dual-write saveToLocal(${localKey}):`, e);
  }
}

/**
 * Create a dual-write adapter for a given table + localStorage key.
 * Shape: `data` column in the table holds the full JSON object keyed by `id`.
 */
export function createDualWrite<T extends DualWriteItem>(
  config: DualWriteConfig
): DualWriteAdapter<T> {
  const { table, localKey, guarded } = config;

  async function readCloud(): Promise<T[] | null> {
    if (guarded) {
      const rows = await guardedSelect<{ id: string; data: unknown }>(table, {
        orderBy: { column: 'updated_at', ascending: false },
        limit: 2000,
      });
      if (rows === null) return null;
      return rows.map(
        (row) => ({ ...((row.data as T) || ({} as T)), id: row.id } as T)
      );
    }
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id, data')
        .order('updated_at', { ascending: false })
        .limit(2000);
      if (error) {
        console.error(`dual-write readCloud(${table}):`, error.message);
        return null;
      }
      return (data || []).map((row: { id: string; data: unknown }) => {
        const item = (row.data as T) || ({} as T);
        return { ...item, id: row.id } as T;
      });
    } catch (e) {
      console.error(`dual-write readCloud exception(${table}):`, e);
      return null;
    }
  }

  async function writeCloud(item: T): Promise<boolean> {
    if (guarded) {
      const res = await guardedUpsert(
        table,
        { id: item.id, data: item, updated_at: new Date().toISOString() },
        'id'
      );
      return res !== null;
    }
    const supabase = getSupabase();
    if (!supabase) return false;
    try {
      const { error } = await supabase.from(table).upsert(
        {
          id: item.id,
          data: item,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.error(`dual-write writeCloud(${table}):`, error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error(`dual-write writeCloud exception(${table}):`, e);
      return false;
    }
  }

  async function deleteCloud(id: string): Promise<void> {
    if (guarded) {
      await guardedDelete(table, id);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (e) {
      console.error(`dual-write deleteCloud(${table}):`, e);
    }
  }

  return {
    async getAll(): Promise<T[]> {
      const cloud = await readCloud();
      const local = getFromLocal<T>(localKey);

      if (cloud && cloud.length > 0) {
        // Merge: cloud is authoritative, local-only items are kept
        const cloudIds = new Set(cloud.map((i) => i.id));
        const localOnly = local.filter((i) => !cloudIds.has(i.id));
        const merged = [...cloud, ...localOnly];
        // Sync local cache
        saveToLocal(localKey, merged);
        return merged;
      }

      // No cloud data — return local
      return local;
    },

    async getById(id: string): Promise<T | null> {
      const all = await this.getAll();
      return all.find((item) => item.id === id) || null;
    },

    async save(item: T): Promise<void> {
      // Update local cache
      const local = getFromLocal<T>(localKey);
      const idx = local.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        local[idx] = item;
      } else {
        local.unshift(item);
      }
      saveToLocal(localKey, local);

      // Write cloud
      await writeCloud(item);
    },

    async saveMany(items: T[]): Promise<void> {
      if (items.length === 0) return;

      // Merge into local cache
      const local = getFromLocal<T>(localKey);
      const byId = new Map(local.map((i) => [i.id, i]));
      for (const item of items) byId.set(item.id, item);
      saveToLocal(localKey, Array.from(byId.values()));

      // Write cloud in parallel (limit concurrency)
      for (const item of items) {
        await writeCloud(item);
      }
    },

    async remove(id: string): Promise<void> {
      const local = getFromLocal<T>(localKey);
      const filtered = local.filter((i) => i.id !== id);
      saveToLocal(localKey, filtered);
      await deleteCloud(id);
    },

    async clear(): Promise<void> {
      saveToLocal(localKey, []);
      // Note: no clear on cloud to prevent accidental data loss
    },
  };
}
