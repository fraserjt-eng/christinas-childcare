// Lesson Storage Module for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
} from '@/lib/supabase/service';
import {
  Lesson,
  LessonFilters,
  LessonAnalytics,
  AgeGroup,
  LearningDomain,
  LEARNING_DOMAINS,
  AGE_GROUPS,
  generateLessonId,
} from '@/types/curriculum';
import { currentCenterId } from '@/lib/current-center';

const STORAGE_KEY = 'christinas_lessons';

// Supabase table backing the lesson records. Single-kind table: each row's
// typed fields live in a JSONB `data` column (see migration 036).
const LESSONS_TABLE = 'lessons';

// ============================================================================
// Storage Interface (Database-ready)
// ============================================================================

export interface LessonStorage {
  getLessons(filters?: LessonFilters): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | null>;
  saveLesson(lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson>;
  updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | null>;
  deleteLesson(id: string): Promise<boolean>;
  searchLessons(query: string): Promise<Lesson[]>;
  getAnalytics(): Promise<LessonAnalytics>;
  toggleFavorite(id: string): Promise<Lesson | null>;
}

// ============================================================================
// Cloud Row Helpers
// ============================================================================

// Shape of a row in the `lessons` table.
interface LessonRow {
  id: string;
  center_id: string | null;
  data: Record<string, unknown>;
}

// Drop the id key so it lives only as the row's primary-key column, not inside data.
function stripId(lesson: Lesson): Record<string, unknown> {
  const { id: _id, ...rest } = lesson;
  return rest as Record<string, unknown>;
}

// Build the cloud row payload for an insert from a typed lesson object.
function toRow(lesson: Lesson): Record<string, unknown> {
  return {
    id: lesson.id,
    center_id: currentCenterId(),
    data: stripId(lesson),
  };
}

// Unwrap a cloud row back into the typed lesson object.
function fromRow(row: LessonRow): Lesson {
  return { id: row.id, ...(row.data as object) } as Lesson;
}

// Fetch all lesson rows from the cloud; null when not configured/on error.
async function cloudFetch(): Promise<Lesson[] | null> {
  const rows = await supabaseSelect<LessonRow>(LESSONS_TABLE, {
    filters: { center_id: currentCenterId() },
  });
  if (rows === null) return null;
  return rows.map((r) => fromRow(r));
}

// ============================================================================
// localStorage Cache Helpers
// ============================================================================

function getAllLessonsFromStorage(): Lesson[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading lessons from storage:', error);
    return [];
  }
}

function saveLessonsToStorage(lessons: Lesson[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  } catch (error) {
    console.error('Error saving lessons to storage:', error);
  }
}

// Raw read with no seeding: cloud-first, localStorage fallback. Used to check
// existence (so seeding cannot recurse) and as the base for readAllLessons.
async function readAllLessonsRaw(): Promise<Lesson[]> {
  const cloudData = await cloudFetch();
  return cloudData !== null ? cloudData : getAllLessonsFromStorage();
}

// Read all lessons: cloud-first, with a localStorage fallback + seed-on-empty.
async function readAllLessons(): Promise<Lesson[]> {
  let lessons = await readAllLessonsRaw();

  if (lessons.length === 0) {
    await seedSampleLessons();
    lessons = await readAllLessonsRaw();
  }

  return lessons;
}

// ============================================================================
// CRUD Operations
// ============================================================================

export async function getLessons(filters?: LessonFilters): Promise<Lesson[]> {
  let lessons = await readAllLessons();

  // Apply filters
  if (filters) {
    if (filters.ageGroup) {
      lessons = lessons.filter((l) => l.ageGroup === filters.ageGroup);
    }
    if (filters.domain) {
      lessons = lessons.filter((l) => l.domain === filters.domain);
    }
    if (filters.isFavorite !== undefined) {
      lessons = lessons.filter((l) => l.isFavorite === filters.isFavorite);
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      lessons = lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.objectives.some((o) => o.toLowerCase().includes(query)) ||
          l.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        lessons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        lessons.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        lessons.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'duration':
        lessons.sort((a, b) => a.duration - b.duration);
        break;
      default:
        lessons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } else {
    // Default: newest first
    lessons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return lessons;
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const lessons = await readAllLessons();
  return lessons.find((l) => l.id === id) || null;
}

export async function saveLesson(
  lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Lesson> {
  const now = new Date().toISOString();

  const newLesson: Lesson = {
    ...lessonData,
    id: generateLessonId(),
    createdAt: now,
    updatedAt: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<LessonRow>(LESSONS_TABLE, toRow(newLesson));

  const lessons = getAllLessonsFromStorage();
  lessons.push(newLesson);
  saveLessonsToStorage(lessons);

  return newLesson;
}

export async function updateLesson(
  id: string,
  updates: Partial<Lesson>
): Promise<Lesson | null> {
  const lessons = await readAllLessons();
  const existing = lessons.find((l) => l.id === id);

  if (!existing) return null;

  const updatedLesson: Lesson = {
    ...existing,
    ...updates,
    id: existing.id, // Prevent id from being changed
    createdAt: existing.createdAt, // Preserve original creation date
    updatedAt: new Date().toISOString(),
  };

  // Write to Supabase first, then cache locally
  await supabaseUpdate<LessonRow>(LESSONS_TABLE, id, {
    center_id: currentCenterId(),
    data: stripId(updatedLesson),
  });

  const cache = getAllLessonsFromStorage();
  const index = cache.findIndex((l) => l.id === id);
  if (index === -1) {
    cache.push(updatedLesson);
  } else {
    cache[index] = updatedLesson;
  }
  saveLessonsToStorage(cache);

  return updatedLesson;
}

export async function deleteLesson(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete(LESSONS_TABLE, id);

  const lessons = getAllLessonsFromStorage();
  const index = lessons.findIndex((l) => l.id === id);

  if (index !== -1) {
    lessons.splice(index, 1);
    saveLessonsToStorage(lessons);
  }

  return true;
}

export async function searchLessons(query: string): Promise<Lesson[]> {
  return getLessons({ searchQuery: query });
}

export async function toggleFavorite(id: string): Promise<Lesson | null> {
  const lesson = await getLesson(id);
  if (!lesson) return null;

  return updateLesson(id, { isFavorite: !lesson.isFavorite });
}

// ============================================================================
// Analytics
// ============================================================================

export async function getAnalytics(): Promise<LessonAnalytics> {
  const lessons = await readAllLessons();
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const lessonsThisMonth = lessons.filter(
    (l) => new Date(l.createdAt) >= thisMonth
  ).length;

  const byDomain = LEARNING_DOMAINS.reduce((acc, domain) => {
    acc[domain] = lessons.filter((l) => l.domain === domain).length;
    return acc;
  }, {} as Record<LearningDomain, number>);

  const byAgeGroup = AGE_GROUPS.reduce((acc, age) => {
    acc[age] = lessons.filter((l) => l.ageGroup === age).length;
    return acc;
  }, {} as Record<AgeGroup, number>);

  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);
  const avgDuration = lessons.length > 0 ? Math.round(totalDuration / lessons.length) : 0;

  return {
    totalLessons: lessons.length,
    lessonsThisMonth,
    byDomain,
    byAgeGroup,
    avgDuration,
    favoritesCount: lessons.filter((l) => l.isFavorite).length,
  };
}

// ============================================================================
// Bulk Operations
// ============================================================================

export async function importLessons(lessons: Lesson[]): Promise<number> {
  const existing = await readAllLessons();
  const existingIds = new Set(existing.map((l) => l.id));

  // Filter out duplicates
  const newLessons = lessons.filter((l) => !existingIds.has(l.id));

  // Write to Supabase first, then cache locally
  for (const lesson of newLessons) {
    await supabaseInsert<LessonRow>(LESSONS_TABLE, toRow(lesson));
  }

  const cache = getAllLessonsFromStorage();
  saveLessonsToStorage([...cache, ...newLessons]);
  return newLessons.length;
}

export async function exportLessons(): Promise<Lesson[]> {
  return readAllLessons();
}

export async function clearAllLessons(): Promise<void> {
  const lessons = await readAllLessons();
  for (const lesson of lessons) {
    await supabaseDelete(LESSONS_TABLE, lesson.id);
  }
  saveLessonsToStorage([]);
}

// ============================================================================
// Sample Data (for development/demo)
// ============================================================================

export const SAMPLE_LESSONS: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Rainbow Counting Adventure',
    ageGroup: 'preschool',
    domain: 'math',
    duration: 25,
    objectives: ['Count objects 1-10 with one-to-one correspondence', 'Identify and name colors', 'Practice fine motor skills through sorting'],
    materials: ['Colored counting bears', 'Number cards 1-10', 'Sorting trays', 'Rainbow poster'],
    segments: [
      {
        segment: 'INTRO',
        title: 'Rainbow Welcome',
        duration: 4,
        description: 'Gather children and introduce the rainbow counting theme',
        teacherActions: 'Show rainbow poster, sing rainbow song, introduce counting bears',
        childActions: 'Sit in circle, respond to questions about colors, get excited about materials',
        materials: ['Rainbow poster'],
        adaptations: { simplify: 'Focus on 3 colors only', extend: 'Add color mixing discussion' },
      },
      {
        segment: 'EXPLORE',
        title: 'Discover the Bears',
        duration: 6,
        description: 'Children explore counting bears through free play',
        teacherActions: 'Distribute bears, ask open questions, observe and document',
        childActions: 'Handle bears, sort spontaneously, discuss with peers',
        materials: ['Colored counting bears', 'Sorting trays'],
        adaptations: { simplify: 'Provide fewer bears per child', extend: 'Encourage pattern creation' },
      },
      {
        segment: 'PRACTICE',
        title: 'Count & Sort',
        duration: 8,
        description: 'Guided counting and sorting activity',
        teacherActions: 'Model counting, guide sorting by color, use number cards',
        childActions: 'Count bears aloud, sort into color groups, match to number cards',
        materials: ['Counting bears', 'Number cards 1-10', 'Sorting trays'],
        adaptations: { simplify: 'Count to 5 only', extend: 'Count by 2s, create addition problems' },
        assessmentOpportunity: 'Observe one-to-one correspondence and number recognition',
      },
      {
        segment: 'REFLECT',
        title: 'Share Our Discoveries',
        duration: 4,
        description: 'Children share what they learned and noticed',
        teacherActions: 'Ask reflection questions, celebrate observations, photograph work',
        childActions: 'Share counting strategies, describe patterns, show sorted trays',
        materials: [],
        adaptations: { simplify: 'Use yes/no questions', extend: 'Write dictated observations' },
      },
      {
        segment: 'CLOSE',
        title: 'Rainbow Goodbye',
        duration: 3,
        description: 'Wrap up and transition',
        teacherActions: 'Sing cleanup song, preview next activity, guide material return',
        childActions: 'Return bears to bins, sing along, prepare for next activity',
        materials: [],
        adaptations: { simplify: 'Hand-over-hand cleanup help', extend: 'Children lead cleanup song' },
      },
    ],
    createdBy: 'teacher',
    isFavorite: true,
    tags: ['math', 'colors', 'counting', 'hands-on'],
    theme: 'Colors and Numbers',
  },
  {
    title: 'Feelings Faces',
    ageGroup: 'toddler',
    domain: 'social-emotional',
    duration: 15,
    objectives: ['Identify basic emotions (happy, sad, angry)', 'Practice empathy through role play', 'Use words to express feelings'],
    materials: ['Emotion picture cards', 'Mirror', 'Crayons', 'Paper plates'],
    segments: [
      {
        segment: 'INTRO',
        title: 'Hello Feelings!',
        duration: 2,
        description: 'Introduce emotions with a simple song',
        teacherActions: 'Sing feelings song with gestures, show emotion cards',
        childActions: 'Watch, listen, copy facial expressions',
        materials: ['Emotion picture cards'],
        adaptations: { simplify: 'Focus on happy/sad only', extend: 'Add surprised and scared' },
      },
      {
        segment: 'EXPLORE',
        title: 'Mirror Faces',
        duration: 3,
        description: 'Children explore making faces in mirrors',
        teacherActions: 'Provide mirrors, name emotions as children show them',
        childActions: 'Make faces in mirror, point to emotion cards that match',
        materials: ['Mirror', 'Emotion picture cards'],
        adaptations: { simplify: 'Teacher models first', extend: 'Peer partner practice' },
      },
      {
        segment: 'PRACTICE',
        title: 'Create a Feeling',
        duration: 5,
        description: 'Make paper plate emotion faces',
        teacherActions: 'Provide materials, guide drawing, label emotions',
        childActions: 'Draw faces on plates, choose emotion to show',
        materials: ['Paper plates', 'Crayons'],
        adaptations: { simplify: 'Pre-draw face outlines', extend: 'Add body poses to faces' },
        assessmentOpportunity: 'Note which emotions children can identify and express',
      },
      {
        segment: 'REFLECT',
        title: 'Show and Tell',
        duration: 3,
        description: 'Share created faces with group',
        teacherActions: 'Ask each child about their face, validate responses',
        childActions: 'Hold up face, name feeling, share when they felt that way',
        materials: ['Created paper plate faces'],
        adaptations: { simplify: 'Point only, no verbal required', extend: 'Tell story about that feeling' },
      },
      {
        segment: 'CLOSE',
        title: 'Feelings Goodbye',
        duration: 2,
        description: 'Calm transition activity',
        teacherActions: 'Sing soft goodbye song, help transition',
        childActions: 'Take faces to cubbies, wave goodbye',
        materials: [],
        adaptations: { simplify: 'One-on-one transitions', extend: 'Children lead song' },
      },
    ],
    createdBy: 'teacher',
    isFavorite: false,
    tags: ['emotions', 'social-emotional', 'art', 'toddler'],
  },
];

export async function seedSampleLessons(): Promise<number> {
  // Use the raw (non-seeding) read so this check cannot recurse back into seed.
  const existing = await readAllLessonsRaw();
  if (existing.length > 0) {
    return 0; // Don't seed if lessons already exist
  }

  let count = 0;
  const now = new Date().toISOString();
  for (const lesson of SAMPLE_LESSONS) {
    const newLesson: Lesson = {
      ...lesson,
      id: generateLessonId(),
      createdAt: now,
      updatedAt: now,
    };

    // Write to Supabase first, then cache locally
    await supabaseInsert<LessonRow>(LESSONS_TABLE, toRow(newLesson));

    const cache = getAllLessonsFromStorage();
    cache.push(newLesson);
    saveLessonsToStorage(cache);
    count++;
  }
  return count;
}
