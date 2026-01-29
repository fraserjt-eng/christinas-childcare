// Curriculum and Lesson Types for Christina's Child Care Center

// ============================================================================
// Constants
// ============================================================================

export const LESSON_SEGMENTS = ['INTRO', 'EXPLORE', 'PRACTICE', 'REFLECT', 'CLOSE'] as const;
export type LessonSegment = typeof LESSON_SEGMENTS[number];

export const AGE_GROUPS = ['infant', 'toddler', 'preschool', 'school-age'] as const;
export type AgeGroup = typeof AGE_GROUPS[number];

export const LEARNING_DOMAINS = [
  'cognitive',
  'language',
  'physical',
  'social-emotional',
  'creative',
  'literacy',
  'math',
  'science',
] as const;
export type LearningDomain = typeof LEARNING_DOMAINS[number];

// Labels for display
export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  'infant': 'Infant (0-12 mo)',
  'toddler': 'Toddler (1-3 yr)',
  'preschool': 'Preschool (3-5 yr)',
  'school-age': 'School Age (5+ yr)',
};

export const DOMAIN_LABELS: Record<LearningDomain, string> = {
  'cognitive': 'Cognitive Development',
  'language': 'Language & Communication',
  'physical': 'Physical Development',
  'social-emotional': 'Social-Emotional',
  'creative': 'Creative Arts',
  'literacy': 'Literacy & Reading',
  'math': 'Math & Numbers',
  'science': 'Science & Discovery',
};

export const SEGMENT_LABELS: Record<LessonSegment, string> = {
  'INTRO': 'Introduction',
  'EXPLORE': 'Explore & Discover',
  'PRACTICE': 'Practice & Apply',
  'REFLECT': 'Reflect & Share',
  'CLOSE': 'Closing & Transition',
};

export const SEGMENT_DESCRIPTIONS: Record<LessonSegment, string> = {
  'INTRO': 'Hook attention, preview learning, gather materials',
  'EXPLORE': 'Guided discovery and hands-on exploration',
  'PRACTICE': 'Apply new skills through structured activities',
  'REFLECT': 'Discussion, sharing, and meaning-making',
  'CLOSE': 'Summarize, celebrate, and prepare for transition',
};

// Domain colors for UI
export const DOMAIN_COLORS: Record<LearningDomain, string> = {
  'cognitive': 'bg-christina-blue text-white',
  'language': 'bg-purple-500 text-white',
  'physical': 'bg-christina-green text-white',
  'social-emotional': 'bg-christina-coral text-white',
  'creative': 'bg-pink-500 text-white',
  'literacy': 'bg-amber-500 text-white',
  'math': 'bg-indigo-500 text-white',
  'science': 'bg-teal-500 text-white',
};

// ============================================================================
// Lesson Segment Item
// ============================================================================

export interface LessonSegmentItem {
  segment: LessonSegment;
  title: string;
  duration: number; // minutes
  description: string;
  teacherActions: string;
  childActions: string;
  materials: string[];
  adaptations: {
    simplify: string;
    extend: string;
  };
  assessmentOpportunity?: string;
}

// ============================================================================
// Main Lesson Interface
// ============================================================================

export interface Lesson {
  id: string;
  title: string;
  ageGroup: AgeGroup;
  domain: LearningDomain;
  duration: number; // total minutes
  objectives: string[];
  materials: string[];

  // 5 Segments
  segments: LessonSegmentItem[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isFavorite: boolean;
  tags: string[];

  // Optional fields
  theme?: string;
  notes?: string;

  // Remix tracking
  remixedFrom?: string;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface LessonFormInput {
  title: string;
  ageGroup: AgeGroup;
  domain: LearningDomain;
  duration: number;
  objectives: string[];
  materials: string[];
  tags?: string[];
  theme?: string;
  notes?: string;
}

export interface GenerateLessonInput {
  topic: string;
  ageGroup: AgeGroup;
  domain: LearningDomain;
  duration: number;
  additionalContext?: string;
}

export interface RemixLessonInput {
  baseLessonId: string;
  newAgeGroup: AgeGroup;
  newDuration?: number;
  newDomain?: LearningDomain;
  adaptationNotes?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface LessonAPIResponse {
  success: boolean;
  lesson?: Lesson;
  error?: string;
}

export interface LessonsListResponse {
  success: boolean;
  lessons: Lesson[];
  total: number;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface LessonFilters {
  ageGroup?: AgeGroup;
  domain?: LearningDomain;
  isFavorite?: boolean;
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'title' | 'duration';
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface LessonAnalytics {
  totalLessons: number;
  lessonsThisMonth: number;
  byDomain: Record<LearningDomain, number>;
  byAgeGroup: Record<AgeGroup, number>;
  avgDuration: number;
  favoritesCount: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyLesson(): Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    ageGroup: 'preschool',
    domain: 'cognitive',
    duration: 30,
    objectives: [],
    materials: [],
    segments: LESSON_SEGMENTS.map((segment) => ({
      segment,
      title: SEGMENT_LABELS[segment],
      duration: 6, // 30min / 5 segments
      description: '',
      teacherActions: '',
      childActions: '',
      materials: [],
      adaptations: {
        simplify: '',
        extend: '',
      },
    })),
    createdBy: 'teacher',
    isFavorite: false,
    tags: [],
  };
}

export function generateLessonId(): string {
  return `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateTotalDuration(segments: LessonSegmentItem[]): number {
  return segments.reduce((sum, s) => sum + s.duration, 0);
}

export function getSegmentColor(segment: LessonSegment): string {
  const colors: Record<LessonSegment, string> = {
    'INTRO': 'bg-christina-yellow',
    'EXPLORE': 'bg-christina-blue',
    'PRACTICE': 'bg-christina-green',
    'REFLECT': 'bg-purple-400',
    'CLOSE': 'bg-christina-coral',
  };
  return colors[segment];
}
