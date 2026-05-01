// Newsletter Storage Module for Christina's Child Care Center
// Dual-write: Supabase + localStorage via createDualWrite.

import { createDualWrite } from '@/lib/supabase/dual-write';

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
  // Bulk send + analytics (added by migration 016).
  recipient_count?: number;
  open_count?: number;
  click_count?: number;
  bounce_count?: number;
  unsubscribe_count?: number;
  resend_message_ids?: string[];
  from_name?: string;
  from_email?: string;
  dispatch_lock?: string | null;
  last_error?: string | null;
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

const store = createDualWrite<Newsletter>({
  table: 'newsletters',
  localKey: NEWSLETTERS_KEY,
});

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Normalize newsletters (handles both old and new data formats)
function normalizeNewsletter(raw: Record<string, unknown>): Newsletter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n = raw as any;

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
  const raw = await store.getAll();
  let newsletters = raw.map((n) => normalizeNewsletter(n as unknown as Record<string, unknown>));

  if (filters?.status) {
    newsletters = newsletters.filter((n) => n.status === filters.status);
  }

  newsletters.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return newsletters;
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  const raw = await store.getById(id);
  if (!raw) return null;
  return normalizeNewsletter(raw as unknown as Record<string, unknown>);
}

export async function createNewsletter(
  data: Omit<Newsletter, 'id' | 'created_at' | 'updated_at'>
): Promise<Newsletter> {
  const now = new Date().toISOString();
  const newsletter: Newsletter = {
    ...data,
    id: generateId('news'),
    created_at: now,
    updated_at: now,
  };
  await store.save(newsletter);
  return newsletter;
}

export async function updateNewsletter(
  id: string,
  updates: Partial<Newsletter>
): Promise<Newsletter | null> {
  const existing = await getNewsletter(id);
  if (!existing) return null;

  const merged: Newsletter = {
    ...existing,
    ...updates,
    id: existing.id,
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };

  await store.save(merged);
  return merged;
}

export async function deleteNewsletter(id: string): Promise<boolean> {
  const existing = await store.getById(id);
  if (!existing) return false;
  await store.remove(id);
  return true;
}

export async function sendNewsletter(id: string): Promise<Newsletter | null> {
  return updateNewsletter(id, {
    status: 'sent',
    sent_at: new Date().toISOString(),
  });
}

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
