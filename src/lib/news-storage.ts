// News Storage Module for Christina's Child Care Center
// Dual-write: Supabase + localStorage fallback via createDualWrite.

import { NewsUpdate, NewsUpdateCreate, generateNewsId } from '@/types/news';
import { createDualWrite } from '@/lib/supabase/dual-write';

const STORAGE_KEY = 'christinas_news_updates';

const store = createDualWrite<NewsUpdate>({
  table: 'news_updates',
  localKey: STORAGE_KEY,
});

// ============================================================================
// News CRUD Operations
// ============================================================================

export async function getNewsUpdates(filters?: {
  is_published?: boolean;
  is_featured?: boolean;
  type?: NewsUpdate['type'];
  limit?: number;
}): Promise<NewsUpdate[]> {
  let updates = await store.getAll();

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

  updates.sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  if (filters?.limit) {
    updates = updates.slice(0, filters.limit);
  }

  return updates;
}

export async function getNewsUpdate(id: string): Promise<NewsUpdate | null> {
  return store.getById(id);
}

export async function createNewsUpdate(data: NewsUpdateCreate): Promise<NewsUpdate> {
  const now = new Date().toISOString();
  const newUpdate: NewsUpdate = {
    ...data,
    id: generateNewsId(),
    created_at: now,
    updated_at: now,
  };
  await store.save(newUpdate);
  return newUpdate;
}

export async function updateNewsUpdate(
  id: string,
  data: Partial<NewsUpdate>
): Promise<NewsUpdate | null> {
  const existing = await store.getById(id);
  if (!existing) return null;

  const updatedNews: NewsUpdate = {
    ...existing,
    ...data,
    id: existing.id,
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };

  await store.save(updatedNews);
  return updatedNews;
}

export async function deleteNewsUpdate(id: string): Promise<boolean> {
  const existing = await store.getById(id);
  if (!existing) return false;
  await store.remove(id);
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
];

export async function seedSampleNews(): Promise<number> {
  const existing = await store.getAll();
  if (existing.length > 0) return 0;

  let count = 0;
  for (const news of SAMPLE_NEWS) {
    await createNewsUpdate(news);
    count++;
  }
  return count;
}

export async function clearAllNews(): Promise<void> {
  await store.clear();
}
