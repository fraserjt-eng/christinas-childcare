// Center-wide announcements from admin to all users (parents, staff, admins).
// Dual-write to Supabase + localStorage. Sync API preserved for existing callers;
// cloud sync happens in background via fire-and-forget promises.

import { createDualWrite } from '@/lib/supabase/dual-write';

export interface CenterAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'parents' | 'staff';
  priority: 'info' | 'important' | 'urgent';
  postedAt: string; // ISO date
  postedBy: string;
}

const STORAGE_KEY = 'christinas_center_announcements';
const DISMISSED_KEY = 'christinas_dismissed_announcements';

const store = createDualWrite<CenterAnnouncement>({
  table: 'center_announcements',
  localKey: STORAGE_KEY,
});

// Kick cloud hydration once per session. dual-write.getAll() merges cloud into
// the localStorage cache, so subsequent sync reads see the merged set.
let hydrated = false;
function hydrateOnce(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  void store.getAll().catch(() => {
    /* background sync */
  });
}

function getAllLocal(): CenterAnnouncement[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return [];
}

function getDismissed(userKey: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(`${DISMISSED_KEY}_${userKey}`);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return [];
}

function saveDismissed(userKey: string, ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${DISMISSED_KEY}_${userKey}`, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save dismissed announcements:', e);
  }
}

const SEED: CenterAnnouncement[] = [
  {
    id: 'ann-spring-event',
    title: 'Spring Family Event — March 21',
    body: 'Join us for games, a potluck, and an art showcase from the children. Please RSVP by March 7th.',
    audience: 'parents',
    priority: 'important',
    postedAt: new Date().toISOString(),
    postedBy: 'Ophelia Zeogar',
  },
  {
    id: 'ann-weather-reminder',
    title: 'Dress for the Weather',
    body: 'Please send children with weather-appropriate outerwear. We play outside daily when conditions allow.',
    audience: 'parents',
    priority: 'info',
    postedAt: new Date().toISOString(),
    postedBy: 'Ophelia Zeogar',
  },
];

export function seedAnnouncements(): void {
  hydrateOnce();
  const existing = getAllLocal();
  if (existing.length > 0) return;
  void store.saveMany(SEED);
}

export function getAnnouncementsForAudience(
  audience: 'parents' | 'staff' | 'admin'
): CenterAnnouncement[] {
  seedAnnouncements();
  return getAllLocal().filter((a) => {
    if (a.audience === 'all') return true;
    if (audience === 'parents') return a.audience === 'parents';
    if (audience === 'staff' || audience === 'admin') return a.audience === 'staff';
    return false;
  });
}

export function getUnreadAnnouncements(
  audience: 'parents' | 'staff' | 'admin',
  userKey: string
): CenterAnnouncement[] {
  const dismissed = new Set(getDismissed(userKey));
  return getAnnouncementsForAudience(audience).filter((a) => !dismissed.has(a.id));
}

export function dismissAnnouncement(userKey: string, announcementId: string): void {
  const dismissed = getDismissed(userKey);
  if (!dismissed.includes(announcementId)) {
    saveDismissed(userKey, [...dismissed, announcementId]);
  }
}

export function dismissAllAnnouncements(
  userKey: string,
  audience: 'parents' | 'staff' | 'admin'
): void {
  const all = getAnnouncementsForAudience(audience);
  saveDismissed(userKey, all.map((a) => a.id));
}

export function createAnnouncement(
  data: Omit<CenterAnnouncement, 'id' | 'postedAt'>
): CenterAnnouncement {
  const announcement: CenterAnnouncement = {
    ...data,
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    postedAt: new Date().toISOString(),
  };
  void store.save(announcement);
  return announcement;
}
