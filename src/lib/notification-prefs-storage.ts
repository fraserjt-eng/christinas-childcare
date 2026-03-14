// Notification Preferences Storage for Christina's Child Care Center
// localStorage for demo mode, designed for Supabase migration
//
// Supabase migration path:
//   Table: notification_preferences (family_id PK, channels JSONB, frequency TEXT,
//          categories JSONB, quiet_hours JSONB, updated_at TIMESTAMPTZ)
//   Replace getFromStorage/saveToStorage with Supabase client calls.

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
 */
export function getPreferences(familyId: string): NotificationPreferences {
  const all = getAllPrefsFromStorage();
  return all[familyId] ?? getDefaultPreferences(familyId);
}

/**
 * Persist updated preferences for a family.
 */
export function savePreferences(prefs: NotificationPreferences): void {
  const all = getAllPrefsFromStorage();
  all[prefs.family_id] = {
    ...prefs,
    updated_at: new Date().toISOString(),
  };
  saveAllPrefsToStorage(all);
}

/**
 * Clear saved preferences for a family (resets to defaults on next read).
 */
export function clearPreferences(familyId: string): void {
  const all = getAllPrefsFromStorage();
  delete all[familyId];
  saveAllPrefsToStorage(all);
}
