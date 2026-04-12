import { supabaseSelect, supabaseUpsert } from '@/lib/supabase/service';

const STORAGE_KEY = 'site-content';

interface SiteContentRow {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}

function getLocalContent(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setLocalContent(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    const data = getLocalContent();
    data[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full
  }
}

export async function getContent<T = unknown>(key: string, fallback?: T): Promise<T> {
  // Try Supabase first
  const cloudData = await supabaseSelect<SiteContentRow>('site_content', {
    filters: { key },
  });

  if (cloudData && cloudData.length > 0) {
    return cloudData[0].value as T;
  }

  // Fallback to localStorage
  const local = getLocalContent();
  if (local[key] !== undefined) {
    return local[key] as T;
  }

  return (fallback ?? null) as T;
}

export async function getAllContent(): Promise<Record<string, unknown>> {
  const cloudData = await supabaseSelect<SiteContentRow>('site_content');
  if (cloudData && cloudData.length > 0) {
    const result: Record<string, unknown> = {};
    for (const row of cloudData) {
      result[row.key] = row.value;
    }
    return result;
  }
  return getLocalContent();
}

export async function setContent(key: string, value: unknown, userId?: string): Promise<void> {
  const record = {
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: userId || null,
  };

  await supabaseUpsert<SiteContentRow>('site_content', record, 'key');
  setLocalContent(key, value);
}

// Default content values (used as fallbacks when nothing is in DB yet)
export const DEFAULT_CONTENT: Record<string, unknown> = {
  'center.name': "Christina's Child Care Center",
  'center.address': '6501 Lakeland Ave N, Brooklyn Park, MN 55428',
  'center.phone': '(763) 555-0123',
  'center.email': 'info@christinaschildcare.com',
  'center.license': 'MN-DHS-2024-001',
  'center.hours': {
    monday: { open: '6:00 AM', close: '6:00 PM' },
    tuesday: { open: '6:00 AM', close: '6:00 PM' },
    wednesday: { open: '6:00 AM', close: '6:00 PM' },
    thursday: { open: '6:00 AM', close: '6:00 PM' },
    friday: { open: '6:00 AM', close: '6:00 PM' },
    saturday: { open: 'Closed', close: 'Closed' },
    sunday: { open: 'Closed', close: 'Closed' },
  },
  'about.mission': 'Providing a safe, nurturing, and stimulating environment where every child can grow, learn, and thrive.',
  'about.vision': 'To be the most trusted childcare provider in our community, known for excellence in early childhood education and family partnership.',
  'about.values': ['Safety First', 'Family Partnership', 'Quality Education', 'Inclusive Community', 'Professional Growth'],
  'programs.infant': {
    name: 'Infant Program',
    ageRange: '6 weeks - 16 months',
    description: 'A warm, responsive environment focused on building secure attachments and supporting early development milestones.',
  },
  'programs.toddler': {
    name: 'Toddler Program',
    ageRange: '16 months - 33 months',
    description: 'Active exploration and discovery with age-appropriate activities that build language, motor skills, and social connections.',
  },
  'programs.preschool': {
    name: 'Preschool Program',
    ageRange: '33 months - 5 years',
    description: 'School readiness through structured learning, creative play, and guided social development.',
  },
  'programs.schoolAge': {
    name: 'School Age Program',
    ageRange: '5 - 12 years',
    description: 'Before and after school care with homework support, enrichment activities, and full-day programming during breaks.',
  },
};
