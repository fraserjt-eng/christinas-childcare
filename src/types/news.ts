// News & Updates Types for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

// ============================================================================
// News Update Types
// ============================================================================

export type NewsType = 'video' | 'article' | 'photo' | 'announcement';

export interface NewsUpdate {
  id: string;
  type: NewsType;
  title: string;
  content: string; // Main text content or description

  // Media fields
  video_url?: string; // YouTube URL or embed URL
  image_url?: string; // Photo or thumbnail URL

  // Metadata
  author?: string;
  published_at: string; // ISO datetime
  is_published: boolean;
  is_featured: boolean; // Show prominently

  // Tracking
  created_at: string;
  updated_at: string;
}

export type NewsUpdateCreate = Omit<NewsUpdate, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// Helper Functions
// ============================================================================

export function generateNewsId(): string {
  return `news_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getNewsTypeLabel(type: NewsType): string {
  const labels: Record<NewsType, string> = {
    video: 'Video',
    article: 'Article',
    photo: 'Photo',
    announcement: 'Announcement',
  };
  return labels[type];
}

export function getNewsTypeColor(type: NewsType): string {
  const colors: Record<NewsType, string> = {
    video: 'bg-red-100 text-red-800',
    article: 'bg-blue-100 text-blue-800',
    photo: 'bg-green-100 text-green-800',
    announcement: 'bg-yellow-100 text-yellow-800',
  };
  return colors[type];
}

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
