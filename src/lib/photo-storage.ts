// Photo Storage Module for Christina's Child Care Center
// localStorage for demo mode, designed for Supabase migration

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

// CRUD operations

export async function getPhotos(filters?: {
  date?: string;
  classroom_id?: string;
  status?: PhotoStatus;
  employee_id?: string;
}): Promise<DailyPhoto[]> {
  let photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);

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

  photos.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return photos;
}

export async function createPhoto(data: Omit<DailyPhoto, 'id' | 'created_at' | 'status'>): Promise<DailyPhoto> {
  const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
  const photo: DailyPhoto = {
    ...data,
    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    created_at: new Date().toISOString(),
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
  const photos = getFromStorage<DailyPhoto>(PHOTOS_KEY);
  const filtered = photos.filter(p => p.id !== id);
  if (filtered.length === photos.length) return false;
  saveToStorage(PHOTOS_KEY, filtered);
  return true;
}

// Reactions

export async function getReactions(photoId: string): Promise<PhotoReaction[]> {
  const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
  return reactions.filter(r => r.photo_id === photoId);
}

export async function getReactionCounts(photoIds: string[]): Promise<Record<string, number>> {
  const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
  const counts: Record<string, number> = {};
  for (const id of photoIds) {
    counts[id] = reactions.filter(r => r.photo_id === id).length;
  }
  return counts;
}

export async function toggleReaction(photoId: string, parentId: string): Promise<boolean> {
  const reactions = getFromStorage<PhotoReaction>(REACTIONS_KEY);
  const existingIndex = reactions.findIndex(
    r => r.photo_id === photoId && r.parent_id === parentId
  );

  if (existingIndex !== -1) {
    reactions.splice(existingIndex, 1);
    saveToStorage(REACTIONS_KEY, reactions);
    return false; // removed
  }

  reactions.push({
    id: `rxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    photo_id: photoId,
    parent_id: parentId,
    reaction_type: 'heart',
    created_at: new Date().toISOString(),
  });
  saveToStorage(REACTIONS_KEY, reactions);
  return true; // added
}

// Stats

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
