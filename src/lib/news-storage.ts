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
  // Sample news is empty by default - admin will add real content
  // Uncomment below for testing:
  /*
  {
    type: 'announcement',
    title: 'Welcome to Christina\'s Child Care Center',
    content: 'We are excited to share news and updates with our families through this new section!',
    is_published: true,
    is_featured: true,
    published_at: new Date().toISOString(),
    author: 'Christina Fraser',
  },
  */
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
