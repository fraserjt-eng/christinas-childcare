// Communications Types for Christina's Child Care Center
// Used by the admin communications/newsletter system

export interface NewsletterSection {
  id: string;
  heading: string;
  body: string;
  sort_order?: number;
}

export interface Newsletter {
  id: string;
  title: string;
  audience: 'parent' | 'staff';
  status: 'draft' | 'scheduled' | 'sent';
  week_of: string; // ISO date (YYYY-MM-DD) for the week this newsletter covers
  content_sections: NewsletterSection[];
  // Parent newsletter fields
  menu_summary?: string;
  classroom_highlights?: string[];
  upcoming_events?: { title: string; date: string }[];
  // Staff newsletter fields
  teaching_focus?: string;
  policy_reminders?: string[];
  announcements?: string[];
  // Metadata
  ai_generated?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function generateNewsletterId(): string {
  return `nl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSectionId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
