// News Storage Module for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

import { NewsUpdate, NewsUpdateCreate, generateNewsId } from '@/types/news';

// Storage key
const STORAGE_KEY = 'christinas_news_updates';

// ============================================================================
// Generic Storage Helpers
// ============================================================================

function getFromStorage(): NewsUpdate[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading news from storage:', error);
    return [];
  }
}

function saveToStorage(data: NewsUpdate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving news to storage:', error);
  }
}

// ============================================================================
// News CRUD Operations
// ============================================================================

export async function getNewsUpdates(filters?: {
  is_published?: boolean;
  is_featured?: boolean;
  type?: NewsUpdate['type'];
  limit?: number;
}): Promise<NewsUpdate[]> {
  let updates = getFromStorage();

  if (filters) {
    if (filters.is_published !== undefined) {
      updates = updates.filter((u) => u.is_published === filters.is_published);
    }
    if (filters.is_featured !== undefined) {
      updates = updates.filter((u) => u.is_featured === filters.is_featured);
    }
    if (filters.type) {
      updates = updates.filter((u) => u.type === filters.type);
    }
  }

  // Sort by published_at descending (newest first)
  updates.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  if (filters?.limit) {
    updates = updates.slice(0, filters.limit);
  }

  return updates;
}

export async function getNewsUpdate(id: string): Promise<NewsUpdate | null> {
  const updates = getFromStorage();
  return updates.find((u) => u.id === id) || null;
}

export async function createNewsUpdate(data: NewsUpdateCreate): Promise<NewsUpdate> {
  const updates = getFromStorage();
  const now = new Date().toISOString();

  const newUpdate: NewsUpdate = {
    ...data,
    id: generateNewsId(),
    created_at: now,
    updated_at: now,
  };

  updates.push(newUpdate);
  saveToStorage(updates);
  return newUpdate;
}

export async function updateNewsUpdate(
  id: string,
  data: Partial<NewsUpdate>
): Promise<NewsUpdate | null> {
  const updates = getFromStorage();
  const index = updates.findIndex((u) => u.id === id);

  if (index === -1) return null;

  const updatedNews: NewsUpdate = {
    ...updates[index],
    ...data,
    id: updates[index].id,
    created_at: updates[index].created_at,
    updated_at: new Date().toISOString(),
  };

  updates[index] = updatedNews;
  saveToStorage(updates);
  return updatedNews;
}

export async function deleteNewsUpdate(id: string): Promise<boolean> {
  const updates = getFromStorage();
  const index = updates.findIndex((u) => u.id === id);

  if (index === -1) return false;

  updates.splice(index, 1);
  saveToStorage(updates);
  return true;
}

export async function togglePublished(id: string): Promise<NewsUpdate | null> {
  const update = await getNewsUpdate(id);
  if (!update) return null;

  return updateNewsUpdate(id, { is_published: !update.is_published });
}

export async function toggleFeatured(id: string): Promise<NewsUpdate | null> {
  const update = await getNewsUpdate(id);
  if (!update) return null;

  return updateNewsUpdate(id, { is_featured: !update.is_featured });
}

// ============================================================================
// Sample Data
// ============================================================================

const SAMPLE_NEWS: NewsUpdateCreate[] = [
  {
    type: 'announcement',
    title: 'Summer Program Registration Now Open',
    content:
      'We are excited to announce that registration for our 2026 Summer Program is now open! Join us for a summer filled with learning, creativity, and outdoor adventures. Spots fill up quickly, so register early to secure your child\'s place.',
    is_published: true,
    is_featured: true,
    published_at: new Date().toISOString(),
    author: 'Christina Fraser',
  },
  {
    type: 'photo',
    title: 'Spring Art Show Highlights',
    content:
      'What an amazing Spring Art Show! Our little artists showcased their creativity with paintings, sculptures, and crafts. Thank you to all the families who attended and celebrated our children\'s artistic achievements.',
    image_url: '/images/community.png',
    is_published: true,
    is_featured: false,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Ophelia Zeogar',
  },
  {
    type: 'article',
    title: 'Tips for a Smooth Morning Drop-Off',
    content:
      'Morning routines can be challenging for both parents and children. Here are some strategies that have worked well for families at our center: 1) Prepare the night before, 2) Keep goodbyes short and positive, 3) Establish a consistent routine, 4) Trust that your child will be okay.',
    is_published: true,
    is_featured: false,
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Christina Fraser',
  },
];

export async function seedSampleNews(): Promise<number> {
  const existing = getFromStorage();
  if (existing.length > 0) {
    return 0;
  }

  let count = 0;
  for (const news of SAMPLE_NEWS) {
    await createNewsUpdate(news);
    count++;
  }
  return count;
}

export async function clearAllNews(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
