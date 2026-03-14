// Newsletter Storage Module for Christina's Child Care Center
// localStorage for demo mode, designed for Supabase migration

export type NewsletterStatus = 'draft' | 'scheduled' | 'sent';

export interface NewsletterSection {
  id: string;
  type: 'photos' | 'events' | 'menu' | 'classroom_spotlight' | 'milestones' | 'announcements' | 'custom';
  title: string;
  content_html: string;
  order: number;
}

export interface Newsletter {
  id: string;
  center_id?: string;
  subject: string;
  body_html?: string;
  sections: NewsletterSection[];
  status: NewsletterStatus;
  scheduled_for?: string;
  sent_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Compatibility: existing admin comms page uses these fields
  title?: string; // maps to subject
  audience?: 'parent' | 'staff';
  week_of?: string;
  content_sections?: { id: string; heading: string; body: string; sort_order?: number }[];
}

export const SECTION_TYPE_LABELS: Record<string, string> = {
  photos: 'Photo Highlights',
  events: 'Upcoming Events',
  menu: 'Menu Highlights',
  classroom_spotlight: 'Classroom Spotlight',
  milestones: 'Milestones & Achievements',
  announcements: 'Announcements',
  custom: 'Custom Section',
};

const NEWSLETTERS_KEY = 'christinas_newsletters';

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Normalize newsletters from localStorage (handles both old and new data formats)
function normalizeNewsletter(raw: Record<string, unknown>): Newsletter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n = raw as any;

  // Map content_sections (old format) to sections (new format) if needed
  let sections = n.sections || [];
  if ((!sections || sections.length === 0) && n.content_sections && n.content_sections.length > 0) {
    sections = n.content_sections.map((cs: { id: string; heading: string; body: string; sort_order?: number }) => ({
      id: cs.id,
      type: 'custom' as const,
      title: cs.heading,
      content_html: cs.body,
      order: cs.sort_order || 0,
    }));
  }

  return {
    ...n,
    subject: n.subject || n.title || 'Untitled',
    sections,
    status: n.status || 'draft',
    created_at: n.created_at || new Date().toISOString(),
    updated_at: n.updated_at || new Date().toISOString(),
  };
}

export async function getNewsletters(filters?: {
  status?: NewsletterStatus;
}): Promise<Newsletter[]> {
  const raw = getFromStorage<Record<string, unknown>>(NEWSLETTERS_KEY);
  let newsletters = raw.map(normalizeNewsletter);

  if (filters?.status) {
    newsletters = newsletters.filter(n => n.status === filters.status);
  }

  newsletters.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return newsletters;
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  const newsletters = getFromStorage<Newsletter>(NEWSLETTERS_KEY);
  return newsletters.find(n => n.id === id) || null;
}

export async function createNewsletter(
  data: Omit<Newsletter, 'id' | 'created_at' | 'updated_at'>
): Promise<Newsletter> {
  const newsletters = getFromStorage<Newsletter>(NEWSLETTERS_KEY);
  const now = new Date().toISOString();

  const newsletter: Newsletter = {
    ...data,
    id: generateId('news'),
    created_at: now,
    updated_at: now,
  };

  newsletters.push(newsletter);
  saveToStorage(NEWSLETTERS_KEY, newsletters);
  return newsletter;
}

export async function updateNewsletter(
  id: string,
  updates: Partial<Newsletter>
): Promise<Newsletter | null> {
  const newsletters = getFromStorage<Newsletter>(NEWSLETTERS_KEY);
  const index = newsletters.findIndex(n => n.id === id);
  if (index === -1) return null;

  newsletters[index] = {
    ...newsletters[index],
    ...updates,
    id: newsletters[index].id,
    created_at: newsletters[index].created_at,
    updated_at: new Date().toISOString(),
  };

  saveToStorage(NEWSLETTERS_KEY, newsletters);
  return newsletters[index];
}

export async function deleteNewsletter(id: string): Promise<boolean> {
  const newsletters = getFromStorage<Newsletter>(NEWSLETTERS_KEY);
  const filtered = newsletters.filter(n => n.id !== id);
  if (filtered.length === newsletters.length) return false;
  saveToStorage(NEWSLETTERS_KEY, filtered);
  return true;
}

export async function sendNewsletter(id: string): Promise<Newsletter | null> {
  return updateNewsletter(id, {
    status: 'sent',
    sent_at: new Date().toISOString(),
  });
}

// Get sent newsletters for parent archive
export async function getSentNewsletters(): Promise<Newsletter[]> {
  return getNewsletters({ status: 'sent' });
}

// Generate default sections for a new newsletter
export function generateDefaultSections(): NewsletterSection[] {
  return [
    {
      id: generateId('sec'),
      type: 'photos',
      title: 'This Week in Photos',
      content_html: '<p>Check out what our little learners have been up to this week!</p>',
      order: 0,
    },
    {
      id: generateId('sec'),
      type: 'events',
      title: 'Upcoming Events',
      content_html: '<ul><li>Add events here</li></ul>',
      order: 1,
    },
    {
      id: generateId('sec'),
      type: 'classroom_spotlight',
      title: 'Classroom Spotlight',
      content_html: '<p>Share highlights from a classroom this week.</p>',
      order: 2,
    },
    {
      id: generateId('sec'),
      type: 'announcements',
      title: 'Announcements',
      content_html: '<p>Important reminders and updates for families.</p>',
      order: 3,
    },
  ];
}
