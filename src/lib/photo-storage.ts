// Photo Storage Module for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache
// Photos: uploaded to Supabase Storage bucket 'child_photos'; metadata in 'daily_photos' table

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
  isSupabaseConfigured,
} from '@/lib/supabase/service';
import { getSupabase } from '@/lib/supabase/client';

export type ActivityType = 'art' | 'outdoor' | 'circle_time' | 'free_play' | 'meals' | 'nap_prep' | 'special_event' | 'other';
export type PhotoStatus = 'pending' | 'approved' | 'rejected';

export interface DailyPhoto {
  id: string;
  center_id?: string;
  classroom_id: string;
  classroom_name: string;
  employee_id?: string;
  employee_name?: string;
  photo_url: string; // base64 data URL in demo mode, Supabase Storage URL in production
  caption?: string;
  activity_type: ActivityType;
  status: PhotoStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PhotoReaction {
  id: string;
  photo_id: string;
  parent_id: string;
  reaction_type: 'heart';
  created_at: string;
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  art: 'Art',
  outdoor: 'Outdoor Play',
  circle_time: 'Circle Time',
  free_play: 'Free Play',
  meals: 'Meals',
  nap_prep: 'Nap Prep',
  special_event: 'Special Event',
  other: 'Other',
};

const PHOTOS_KEY = 'christinas_daily_photos';
const REACTIONS_KEY = 'christinas_photo_reactions';

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

// ============================================================================
// Supabase Storage Upload Helper
// ============================================================================

async function uploadPhotoToStorage(photoData: string, filename: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Handle both base64 data URLs and plain base64
    const isDataUrl = photoData.startsWith('data:');
    const base64 = isDataUrl ? photoData.split(',')[1] : photoData;
    if (!base64) return null;

    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    const path = `photos/${Date.now()}-${filename}`;
    const { error } = await supabase.storage.from('child_photos').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

    if (error) {
      console.error('Photo upload error:', error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('child_photos').getPublicUrl(path);
    return publicUrl;
  } catch (err) {
    console.error('Error uploading photo to storage:', err);
    return null;
  }
}

// ============================================================================
// CRUD operations
// ============================================================================

export async function getPhotos(filters?: {
  date?: string;
  classroom_id?: string;
  status?: PhotoStatus;
  employee_id?: string;
}): Promise<DailyPhoto[]> {
  const cloudData = await supabaseSelect<DailyPhoto>('daily_photos', {
    orderBy: { column: 'created_at', ascending: false },
  });

  let photos: DailyPhoto[];
  if (cloudData !== null) {
    saveToStorage(PHOTOS_KEY, cloudData);
    photos = cloudData;
  } else {
    photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
  }

  if (filters) {
    if (filters.date) {
      photos = photos.filter(p => p.created_at.startsWith(filters.date!));
    }
    if (filters.classroom_id) {
      photos = photos.filter(p => p.classroom_id === filters.classroom_id);
    }
    if (filters.status) {
      photos = photos.filter(p => p.status === filters.status);
    }
    if (filters.employee_id) {
      photos = photos.filter(p => p.employee_id === filters.employee_id);
    }
  }

  // Sort client-side to avoid PostgREST ordering issues
  photos.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return photos;
}

export async function createPhoto(data: Omit<DailyPhoto, 'id' | 'created_at' | 'status'>): Promise<DailyPhoto> {
  const now = new Date().toISOString();
  const localId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Try to upload photo to Supabase Storage if photo_url is a base64 data URL
  let resolvedPhotoUrl = data.photo_url;
  if (isSupabaseConfigured && data.photo_url.startsWith('data:')) {
    const uploadedUrl = await uploadPhotoToStorage(data.photo_url, `${localId}.jpg`);
    if (uploadedUrl) {
      resolvedPhotoUrl = uploadedUrl;
    }
  }

  if (isSupabaseConfigured) {
    const record: Record<string, unknown> = {
      photo_url: resolvedPhotoUrl,
      caption: data.caption || null,
      activity_type: data.activity_type,
      status: 'pending',
      created_at: now,
    };

    // Only add UUID foreign keys if they look like valid UUIDs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (data.center_id && uuidPattern.test(data.center_id)) {
      record.center_id = data.center_id;
    }
    if (data.classroom_id && uuidPattern.test(data.classroom_id)) {
      record.classroom_id = data.classroom_id;
    }
    if (data.employee_id && uuidPattern.test(data.employee_id)) {
      record.employee_id = data.employee_id;
    }

    const inserted = await supabaseInsert<DailyPhoto>('daily_photos', record);
    if (inserted) {
      const photo: DailyPhoto = {
        ...data,
        ...inserted,
        photo_url: resolvedPhotoUrl,
        classroom_name: data.classroom_name,
        employee_name: data.employee_name,
      };

      const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
      photos.push(photo);
      saveToStorage(PHOTOS_KEY, photos);
      return photo;
    }
  }

  // localStorage fallback
  const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
  const photo: DailyPhoto = {
    ...data,
    photo_url: resolvedPhotoUrl,
    id: localId,
    status: 'pending',
    created_at: now,
  };

  photos.push(photo);
  saveToStorage(PHOTOS_KEY, photos);
  return photo;
}

export async function updatePhotoStatus(
  id: string,
  status: PhotoStatus,
  reviewedBy?: string
): Promise<DailyPhoto | null> {
  if (isSupabaseConfigured) {
    const updated = await supabaseUpdate<DailyPhoto>('daily_photos', id, {
      status,
      reviewed_by: reviewedBy || null,
      reviewed_at: new Date().toISOString(),
    });

    if (updated) {
      const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
      const idx = photos.findIndex(p => p.id === id);
      if (idx >= 0) {
        photos[idx] = { ...photos[idx], status, reviewed_by: reviewedBy, reviewed_at: updated.reviewed_at };
        saveToStorage(PHOTOS_KEY, photos);
      }
      return updated;
    }
  }

  // localStorage fallback
  const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
  const index = photos.findIndex(p => p.id === id);
  if (index === -1) return null;

  photos[index] = {
    ...photos[index],
    status,
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
  };

  saveToStorage(PHOTOS_KEY, photos);
  return photos[index];
}

export async function bulkUpdateStatus(
  ids: string[],
  status: PhotoStatus,
  reviewedBy?: string
): Promise<number> {
  // For bulk updates, fall through to localStorage approach after attempting Supabase per-item
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('daily_photos')
          .update({
            status,
            reviewed_by: reviewedBy || null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in('id', ids);

        if (!error) {
          const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
          let count = 0;
          for (const photo of photos) {
            if (ids.includes(photo.id)) {
              photo.status = status;
              photo.reviewed_by = reviewedBy;
              photo.reviewed_at = new Date().toISOString();
              count++;
            }
          }
          saveToStorage(PHOTOS_KEY, photos);
          return count;
        }
      } catch (err) {
        console.error('Error bulk updating photo status in Supabase:', err);
      }
    }
  }

  // localStorage fallback
  const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
  let count = 0;

  for (const photo of photos) {
    if (ids.includes(photo.id)) {
      photo.status = status;
      photo.reviewed_by = reviewedBy;
      photo.reviewed_at = new Date().toISOString();
      count++;
    }
  }

  saveToStorage(PHOTOS_KEY, photos);
  return count;
}

export async function deletePhoto(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const result = await supabaseDelete('daily_photos', id);
    if (result) {
      const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
      saveToStorage(PHOTOS_KEY, photos.filter(p => p.id !== id));
      return true;
    }
  }

  // localStorage fallback
  const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
  const filtered = photos.filter(p => p.id !== id);
  if (filtered.length === photos.length) return false;
  saveToStorage(PHOTOS_KEY, filtered);
  return true;
}

// ============================================================================
// Reactions
// ============================================================================

export async function getReactions(photoId: string): Promise<PhotoReaction[]> {
  const cloudData = await supabaseSelect<PhotoReaction>('photo_reactions', {
    filters: { photo_id: photoId },
  });

  if (cloudData !== null) {
    // Merge into localStorage cache
    const allReactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
    const otherReactions = allReactions.filter(r => r.photo_id !== photoId);
    saveToStorage(REACTIONS_KEY, [...otherReactions, ...cloudData]);
    return cloudData;
  }

  const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
  return reactions.filter(r => r.photo_id === photoId);
}

export async function getReactionCounts(photoIds: string[]): Promise<Record<string, number>> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('photo_reactions')
          .select('photo_id')
          .in('photo_id', photoIds);

        if (!error && data) {
          const counts: Record<string, number> = {};
          for (const id of photoIds) counts[id] = 0;
          for (const row of data) {
            counts[row.photo_id] = (counts[row.photo_id] || 0) + 1;
          }
          return counts;
        }
      } catch (err) {
        console.error('Error fetching reaction counts from Supabase:', err);
      }
    }
  }

  // localStorage fallback
  const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
  const counts: Record<string, number> = {};
  for (const id of photoIds) {
    counts[id] = reactions.filter(r => r.photo_id === id).length;
  }
  return counts;
}

export async function toggleReaction(photoId: string, parentId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Check if reaction exists
        const { data: existing } = await supabase
          .from('photo_reactions')
          .select('id')
          .eq('photo_id', photoId)
          .eq('parent_id', parentId)
          .single();

        if (existing) {
          await supabase.from('photo_reactions').delete().eq('id', existing.id);
          // Remove from cache
          const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
          saveToStorage(REACTIONS_KEY, reactions.filter(r => !(r.photo_id === photoId && r.parent_id === parentId)));
          return false;
        } else {
          const { data: inserted } = await supabase
            .from('photo_reactions')
            .insert({ photo_id: photoId, parent_id: parentId, reaction_type: 'heart' })
            .select()
            .single();

          if (inserted) {
            const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
            reactions.push(inserted as PhotoReaction);
            saveToStorage(REACTIONS_KEY, reactions);
          }
          return true;
        }
      } catch (err) {
        console.error('Error toggling reaction in Supabase:', err);
      }
    }
  }

  // localStorage fallback
  const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
  const existingIndex = reactions.findIndex(
    r => r.photo_id === photoId && r.parent_id === parentId
  );

  if (existingIndex !== -1) {
    reactions.splice(existingIndex, 1);
    saveToStorage(REACTIONS_KEY, reactions);
    return false;
  }

  reactions.push({
    id: `rxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    photo_id: photoId,
    parent_id: parentId,
    reaction_type: 'heart',
    created_at: new Date().toISOString(),
  });
  saveToStorage(REACTIONS_KEY, reactions);
  return true;
}

// ============================================================================
// Stats
// ============================================================================

export async function getPhotoStats(date?: string): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byClassroom: Record<string, number>;
}> {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const photos = await getPhotos({ date: targetDate });

  const byClassroom: Record<string, number> = {};
  for (const photo of photos) {
    byClassroom[photo.classroom_name] = (byClassroom[photo.classroom_name] || 0) + 1;
  }

  return {
    total: photos.length,
    pending: photos.filter(p => p.status === 'pending').length,
    approved: photos.filter(p => p.status === 'approved').length,
    rejected: photos.filter(p => p.status === 'rejected').length,
    byClassroom,
  };
}
