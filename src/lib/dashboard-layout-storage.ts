// Dashboard layout storage for the office home (src/app/preview/office).
//
// One ordered list of tile ids per center, the owner's chosen buttons. Saved
// to the cloud so the layout survives a new browser or a teammate, with
// localStorage as the cache and fallback. Cloud-first read, cloud + cache
// write, never throws to the UI: a save failure leaves the screen as it was.
//
// Follows the dual-write idiom used across the app (see supply-inventory and
// the other *-storage modules). Scoped per center via currentCenterId().

import { supabaseSelect, supabaseUpsert } from '@/lib/supabase/service';
import { currentCenterId } from '@/lib/current-center';
import { DEFAULT_TILE_IDS, isKnownTile } from '@/lib/tile-catalog';

const TABLE = 'dashboard_layout';

// One localStorage entry per center keeps centers from overwriting each other
// on a shared browser.
function storageKey(centerId: string): string {
  return `christinas_dashboard_layout_${centerId}`;
}

// Shape of a row in the dashboard_layout table (one row per center).
interface LayoutRow {
  id: string;
  center_id: string;
  tiles: string[];
  updated_at: string;
}

// Drop any ids that are not real catalog tiles so a renamed or removed tile can
// never break the screen. Keep the saved order otherwise.
function sanitize(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (typeof id === 'string' && isKnownTile(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

function readLocal(centerId: string): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(centerId));
    if (!raw) return null;
    return sanitize(JSON.parse(raw));
  } catch (error) {
    console.error('Error reading dashboard layout from storage:', error);
    return null;
  }
}

function writeLocal(centerId: string, ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(centerId), JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving dashboard layout to storage:', error);
  }
}

/**
 * The ordered tile-id list for the current center.
 * Cloud-first, then localStorage, then DEFAULT_TILE_IDS so a center that never
 * edited sees today's layout. Never throws.
 */
export async function getLayout(): Promise<string[]> {
  const centerId = currentCenterId();

  // Cloud first.
  try {
    const rows = await supabaseSelect<LayoutRow>(TABLE, {
      filters: { center_id: centerId },
      limit: 1,
    });
    if (rows && rows.length > 0) {
      const tiles = sanitize(rows[0].tiles);
      if (tiles.length > 0) {
        writeLocal(centerId, tiles);
        return tiles;
      }
    }
  } catch (error) {
    console.error('Error loading dashboard layout from cloud:', error);
  }

  // localStorage fallback.
  const local = readLocal(centerId);
  if (local && local.length > 0) return local;

  // Nothing saved: the current default screen.
  return [...DEFAULT_TILE_IDS];
}

/**
 * Save the owner's chosen, ordered tiles for the current center.
 * Upserts the cloud row and caches locally. Never throws to the UI.
 */
export async function saveLayout(ids: string[]): Promise<void> {
  const centerId = currentCenterId();
  const tiles = sanitize(ids);

  // Cache locally first so the screen is correct even if the cloud is down.
  writeLocal(centerId, tiles);

  // Cloud upsert: one row per center, keyed by the center id.
  try {
    await supabaseUpsert<LayoutRow>(
      TABLE,
      {
        id: centerId,
        center_id: centerId,
        tiles,
        updated_at: new Date().toISOString(),
      },
      'id',
    );
  } catch (error) {
    console.error('Error saving dashboard layout to cloud:', error);
  }
}
