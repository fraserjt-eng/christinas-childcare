// Communications types

export interface Newsletter {
  id: string;
  title: string;
  audience: 'parent' | 'staff';
  status: 'draft' | 'scheduled' | 'sent';
  week_of: string;
  content_sections: NewsletterSection[];
  // Parent-specific
  menu_summary?: string;
  classroom_highlights?: string[];
  upcoming_events?: { title: string; date: string }[];
  // Staff-specific
  teaching_focus?: string;
  policy_reminders?: string[];
  announcements?: string[];
  ai_generated: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSection {
  id: string;
  heading: string;
  body: string;
  sort_order: number;
}

let newsletterCounter = 0;
export function generateNewsletterId(): string {
  return `nl_${Date.now()}_${++newsletterCounter}`;
}

export function generateSectionId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
