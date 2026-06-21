// Tour Experience Standardizer
// Supabase-first with localStorage as fallback cache

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
} from '@/lib/supabase/service';
import { isDemoSeedEnabled } from '@/lib/demo-mode';

export interface TourChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  order: number;
}

export type TourStatus = 'scheduled' | 'completed' | 'no_show' | 'cancelled';

export interface Tour {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM (24h)
  center_id: string;
  center_name: string;
  status: TourStatus;
  checklist_completed: boolean;
  checklist_items?: TourChecklistItem[];
  follow_up_sent_at?: string;
  feedback_score?: number; // 1-5
  feedback_notes?: string;
  created_at: string;
}

export interface TourSlot {
  day_of_week: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  time: string; // HH:MM (24h)
  center_id: string;
}

export interface TourStats {
  total: number;
  scheduled: number;
  completed: number;
  no_show: number;
  cancelled: number;
  follow_up_pending: number;
  conversion_rate: number; // completed / (completed + no_show + cancelled) * 100
  avg_feedback_score: number;
}

const TOURS_KEY = 'christinas_tours';
const SLOTS_KEY = 'christinas_tour_slots';

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

export function getDefaultChecklist(): TourChecklistItem[] {
  const items = [
    'Warm greeting and introductions',
    'Introduce self and explain your role',
    'Safety overview and emergency procedures',
    'Classroom tour — Infants',
    'Classroom tour — Toddlers',
    'Classroom tour — Preschool',
    'Outdoor area and playground tour',
    'Q&A and next steps discussion',
  ];
  return items.map((label, i) => ({
    id: generateId('item'),
    label,
    completed: false,
    order: i,
  }));
}

// Default tour slots (Mon–Fri, 10am and 1pm)
function getDefaultSlots(): TourSlot[] {
  const slots: TourSlot[] = [];
  const centers = [
    { id: 'crystal', name: 'Crystal Location' },
    { id: 'brooklyn-park', name: 'Brooklyn Park Location' },
  ];
  const times = ['10:00', '13:00'];
  const weekdays = [1, 2, 3, 4, 5]; // Mon–Fri

  for (const center of centers) {
    for (const day of weekdays) {
      for (const time of times) {
        slots.push({ day_of_week: day, time, center_id: center.id });
      }
    }
  }
  return slots;
}

// Seed data — realistic mix of tour statuses across the past two months and upcoming
function seedTours(): Tour[] {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return fmt(d);
  };
  const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return fmt(d);
  };

  return [
    {
      id: 'tour_001',
      parent_name: 'Jennifer & Mark Thompson',
      parent_email: 'jennifer.thompson@email.com',
      parent_phone: '(763) 555-0142',
      scheduled_date: daysFromNow(3),
      scheduled_time: '10:00',
      center_id: 'crystal',
      center_name: 'Crystal Location',
      status: 'scheduled',
      checklist_completed: false,
      created_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_002',
      parent_name: 'Robert & Ana Garcia',
      parent_email: 'rgarcia@email.com',
      parent_phone: '(763) 555-0198',
      scheduled_date: daysFromNow(5),
      scheduled_time: '13:00',
      center_id: 'brooklyn-park',
      center_name: 'Brooklyn Park Location',
      status: 'scheduled',
      checklist_completed: false,
      created_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_003',
      parent_name: 'Michelle & David Davis',
      parent_email: 'mdavis@email.com',
      parent_phone: '(612) 555-0234',
      scheduled_date: daysFromNow(7),
      scheduled_time: '10:00',
      center_id: 'crystal',
      center_name: 'Crystal Location',
      status: 'scheduled',
      checklist_completed: false,
      created_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_004',
      parent_name: 'Kevin & Priya Patel',
      parent_email: 'kpatel@email.com',
      parent_phone: '(763) 555-0301',
      scheduled_date: daysAgo(5),
      scheduled_time: '10:00',
      center_id: 'crystal',
      center_name: 'Crystal Location',
      status: 'completed',
      checklist_completed: true,
      checklist_items: getDefaultChecklist().map(item => ({ ...item, completed: true })),
      follow_up_sent_at: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      feedback_score: 5,
      feedback_notes: 'Family was very impressed with the infant room. Likely to enroll.',
      created_at: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_005',
      parent_name: 'Sarah & Tom Wilson',
      parent_email: 'twilson@email.com',
      parent_phone: '(952) 555-0412',
      scheduled_date: daysAgo(8),
      scheduled_time: '13:00',
      center_id: 'brooklyn-park',
      center_name: 'Brooklyn Park Location',
      status: 'completed',
      checklist_completed: true,
      checklist_items: getDefaultChecklist().map(item => ({ ...item, completed: true })),
      feedback_score: 4,
      feedback_notes: 'Had questions about outdoor time policy. Director followed up.',
      created_at: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_006',
      parent_name: 'Laura Kim',
      parent_email: 'lkim@email.com',
      parent_phone: '(763) 555-0567',
      scheduled_date: daysAgo(12),
      scheduled_time: '10:00',
      center_id: 'crystal',
      center_name: 'Crystal Location',
      status: 'completed',
      checklist_completed: true,
      checklist_items: getDefaultChecklist().map(item => ({ ...item, completed: true })),
      // No follow-up yet — should appear in follow-up queue
      feedback_score: 5,
      feedback_notes: 'Loved the curriculum. Asked about waitlist for infant room.',
      created_at: new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_007',
      parent_name: 'Amanda Brown',
      parent_email: 'abrown@email.com',
      parent_phone: '(612) 555-0628',
      scheduled_date: daysAgo(15),
      scheduled_time: '13:00',
      center_id: 'brooklyn-park',
      center_name: 'Brooklyn Park Location',
      status: 'completed',
      checklist_completed: true,
      checklist_items: getDefaultChecklist().map(item => ({ ...item, completed: true })),
      // No follow-up sent
      feedback_score: 3,
      feedback_notes: 'Parent had concerns about price. Shared CCAP subsidy info.',
      created_at: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_008',
      parent_name: 'James & Rachel Nguyen',
      parent_email: 'jnguyen@email.com',
      parent_phone: '(763) 555-0789',
      scheduled_date: daysAgo(20),
      scheduled_time: '10:00',
      center_id: 'crystal',
      center_name: 'Crystal Location',
      status: 'no_show',
      checklist_completed: false,
      created_at: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_009',
      parent_name: 'Jessica & Matt Lee',
      parent_email: 'jlee@email.com',
      parent_phone: '(952) 555-0890',
      scheduled_date: daysAgo(25),
      scheduled_time: '13:00',
      center_id: 'brooklyn-park',
      center_name: 'Brooklyn Park Location',
      status: 'cancelled',
      checklist_completed: false,
      created_at: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'tour_010',
      parent_name: 'Chris & Nicole Martinez',
      parent_email: 'nmartinez@email.com',
      parent_phone: '(763) 555-0901',
      scheduled_date: daysFromNow(10),
      scheduled_time: '10:00',
      center_id: 'crystal',
      center_name: 'Crystal Location',
      status: 'scheduled',
      checklist_completed: false,
      created_at: new Date().toISOString(),
    },
  ];
}

function ensureSeeded(): void {
  if (typeof window === 'undefined') return;
  // Tour records are real people. Only seed fabricated tours in a throwaway
  // demo environment; the live app shows the real (possibly empty) list.
  if (isDemoSeedEnabled()) {
    const existing = getFromStorage<Tour>(TOURS_KEY);
    if (existing.length === 0) {
      saveToStorage(TOURS_KEY, seedTours());
    }
  }
  const existingSlots = getFromStorage<TourSlot>(SLOTS_KEY);
  if (existingSlots.length === 0) {
    saveToStorage(SLOTS_KEY, getDefaultSlots());
  }
}

export async function getTours(filters?: {
  status?: TourStatus;
  center_id?: string;
  date?: string;
}): Promise<Tour[]> {
  ensureSeeded();
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<Tour>('tour_requests');
  let tours = cloudData !== null
    ? cloudData
    : getFromStorage<Tour>(TOURS_KEY);

  if (filters) {
    if (filters.status) {
      tours = tours.filter(t => t.status === filters.status);
    }
    if (filters.center_id) {
      tours = tours.filter(t => t.center_id === filters.center_id);
    }
    if (filters.date) {
      tours = tours.filter(t => t.scheduled_date === filters.date);
    }
  }

  tours.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  return tours;
}

export async function createTour(
  data: Omit<Tour, 'id' | 'created_at' | 'status' | 'checklist_completed'>
): Promise<Tour> {
  ensureSeeded();
  const tour: Tour = {
    ...data,
    id: generateId('tour'),
    status: 'scheduled',
    checklist_completed: false,
    checklist_items: getDefaultChecklist(),
    created_at: new Date().toISOString(),
  };
  // Write to Supabase first, then cache locally
  await supabaseInsert<Tour>('tour_requests', tour as unknown as Record<string, unknown>);
  const tours = getFromStorage<Tour>(TOURS_KEY);
  tours.push(tour);
  saveToStorage(TOURS_KEY, tours);
  return tour;
}

export async function updateTour(
  id: string,
  updates: Partial<Tour>
): Promise<Tour | null> {
  ensureSeeded();

  // Write to Supabase first
  await supabaseUpdate<Tour>('tour_requests', id, updates as Record<string, unknown>);

  const tours = getFromStorage<Tour>(TOURS_KEY);
  const index = tours.findIndex(t => t.id === id);
  if (index === -1) return null;
  tours[index] = { ...tours[index], ...updates, id: tours[index].id };
  saveToStorage(TOURS_KEY, tours);
  return tours[index];
}

export async function completeTour(
  id: string,
  checklistItems: TourChecklistItem[]
): Promise<Tour | null> {
  return updateTour(id, {
    status: 'completed',
    checklist_completed: true,
    checklist_items: checklistItems,
  });
}

export async function cancelTour(id: string): Promise<Tour | null> {
  return updateTour(id, { status: 'cancelled' });
}

export async function getAvailableSlots(
  date: string,
  centerId: string
): Promise<string[]> {
  ensureSeeded();
  const slots = getFromStorage<TourSlot>(SLOTS_KEY);
  const day = new Date(date + 'T12:00:00').getDay();
  const centerSlots = slots.filter(
    s => s.center_id === centerId && s.day_of_week === day
  );

  // Filter out already-booked times
  const allTours = await getTours({ center_id: centerId, date });
  const booked = allTours
    .filter(t => t.status === 'scheduled')
    .map(t => t.scheduled_time);

  return centerSlots
    .filter(s => !booked.includes(s.time))
    .map(s => s.time);
}

export async function getTourStats(): Promise<TourStats> {
  ensureSeeded();
  const cloudData = await supabaseSelect<Tour>('tour_requests');
  const tours = cloudData !== null ? cloudData : getFromStorage<Tour>(TOURS_KEY);

  const completed = tours.filter(t => t.status === 'completed');
  const noShow = tours.filter(t => t.status === 'no_show');
  const cancelled = tours.filter(t => t.status === 'cancelled');
  const concluded = completed.length + noShow.length + cancelled.length;

  const followUpPending = completed.filter(t => !t.follow_up_sent_at).length;

  const scoredTours = completed.filter(t => t.feedback_score !== undefined);
  const avgScore =
    scoredTours.length > 0
      ? scoredTours.reduce((sum, t) => sum + (t.feedback_score ?? 0), 0) / scoredTours.length
      : 0;

  return {
    total: tours.length,
    scheduled: tours.filter(t => t.status === 'scheduled').length,
    completed: completed.length,
    no_show: noShow.length,
    cancelled: cancelled.length,
    follow_up_pending: followUpPending,
    conversion_rate: concluded > 0 ? Math.round((completed.length / concluded) * 100) : 0,
    avg_feedback_score: Math.round(avgScore * 10) / 10,
  };
}
