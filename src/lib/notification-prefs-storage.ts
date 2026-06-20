// Notification Preferences Storage for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache.
//
// One record kind (per-family notification preferences), so the backing table
// `notification_prefs` has no record_type discriminator: the row id is the
// family_id and the preference fields live in a JSONB `data` column
// (see migration 038). Reads serve from the local cache and trigger a
// background cloud hydration so the public getters keep their synchronous
// signatures (callers read the return value directly); writes update the cache
// then write to the cloud. On read each row unwraps to { family_id, ...data };
// on write the typed object wraps into data and center_id is stamped.

import {
  supabaseSelect,
  supabaseUpsert,
  supabaseDelete,
} from '@/lib/supabase/guarded';
import { currentCenterId } from '@/lib/current-center';

export type NotificationChannel = 'email' | 'sms' | 'call';

export type NotificationFrequency = 'immediate' | 'daily_digest' | 'weekly';

export interface NotificationPreferences {
  family_id: string;
  channels: {
    email: { enabled: boolean; address: string };
    sms: { enabled: boolean; phone: string };
    call: { enabled: boolean; phone: string };
  };
  frequency: NotificationFrequency;
  categories: {
    newsletters: boolean;
    announcements: boolean;
    incidents: boolean;
    closures: boolean;
    billing: boolean;
    photos: boolean;
  };
  quiet_hours: { start: string; end: string }; // "HH:MM" 24-hour format
  updated_at: string;
}

const STORAGE_KEY = 'christinas_notification_prefs';

// Supabase table backing the notification preferences. One row per family; the
// row id is the family_id and the preference fields live in JSONB `data`.
const NOTIFICATION_PREFS_TABLE = 'notification_prefs';

// Shape of a row in the `notification_prefs` table. `data` holds every
// preference field except family_id (which is the primary-key column).
interface NotificationPrefsRow {
  id: string;
  center_id: string | null;
  data: Omit<NotificationPreferences, 'family_id'>;
}

// Build the cloud row payload from a typed preferences object.
function toRow(prefs: NotificationPreferences): Record<string, unknown> {
  const { family_id, ...rest } = prefs;
  return {
    id: family_id,
    center_id: currentCenterId(),
    data: rest as Record<string, unknown>,
  };
}

// Unwrap a cloud row back into the typed preferences object.
function fromRow(row: NotificationPrefsRow): NotificationPreferences {
  return { family_id: row.id, ...row.data };
}

// ============================================================================
// Internal helpers
// ============================================================================

function getAllPrefsFromStorage(): Record<string, NotificationPreferences> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading notification preferences from storage:', error);
    return {};
  }
}

function saveAllPrefsToStorage(prefs: Record<string, NotificationPreferences>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving notification preferences to storage:', error);
  }
}

// Pull all preference rows from the cloud and refresh the local cache. Runs in
// the background from the synchronous getters so the cache is warm on the next
// read; failures (not configured / offline) leave the existing cache intact.
async function hydrateFromCloud(): Promise<void> {
  const rows = await supabaseSelect<NotificationPrefsRow>(
    NOTIFICATION_PREFS_TABLE,
    { filters: { center_id: currentCenterId() } }
  );
  if (rows === null) return; // not configured or error: keep local cache
  const all: Record<string, NotificationPreferences> = {};
  for (const row of rows) {
    const prefs = fromRow(row);
    all[prefs.family_id] = prefs;
  }
  saveAllPrefsToStorage(all);
}

// ============================================================================
// Public API
// ============================================================================

export function getDefaultPreferences(familyId: string): NotificationPreferences {
  return {
    family_id: familyId,
    channels: {
      email: { enabled: true, address: '' },
      sms: { enabled: false, phone: '' },
      call: { enabled: false, phone: '' },
    },
    frequency: 'weekly',
    categories: {
      newsletters: true,
      announcements: true,
      incidents: true,
      closures: true,
      billing: true,
      photos: true,
    },
    quiet_hours: { start: '21:00', end: '07:00' },
    updated_at: new Date().toISOString(),
  };
}

/**
 * Retrieve preferences for a family. Returns defaults if none saved yet.
 *
 * Serves synchronously from the local cache and kicks off a background cloud
 * hydration so the cache is fresh on the next read; this keeps the signature
 * synchronous for existing callers while making the module Supabase-backed.
 */
export function getPreferences(familyId: string): NotificationPreferences {
  void hydrateFromCloud();
  const all = getAllPrefsFromStorage();
  return all[familyId] ?? getDefaultPreferences(familyId);
}

/**
 * Persist updated preferences for a family.
 *
 * Updates the local cache synchronously, then writes to the cloud in the
 * background (upsert on the family_id primary key).
 */
export function savePreferences(prefs: NotificationPreferences): void {
  const next: NotificationPreferences = {
    ...prefs,
    updated_at: new Date().toISOString(),
  };

  const all = getAllPrefsFromStorage();
  all[next.family_id] = next;
  saveAllPrefsToStorage(all);

  // Write to Supabase in the background; cache is already updated above.
  void supabaseUpsert<NotificationPrefsRow>(
    NOTIFICATION_PREFS_TABLE,
    toRow(next),
    'id'
  );
}

/**
 * Clear saved preferences for a family (resets to defaults on next read).
 *
 * Updates the local cache synchronously, then deletes the cloud row in the
 * background.
 */
export function clearPreferences(familyId: string): void {
  const all = getAllPrefsFromStorage();
  delete all[familyId];
  saveAllPrefsToStorage(all);

  // Delete from Supabase in the background; cache is already updated above.
  void supabaseDelete(NOTIFICATION_PREFS_TABLE, familyId);
}
