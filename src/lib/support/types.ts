export type TicketStatus = 'new' | 'in_progress' | 'resolved';
export type SubmitterRole = 'owner' | 'staff' | 'parent';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string | null;
  audio_path: string | null;
  image_path: string | null;
  page_url: string | null;
  user_agent: string | null;
  viewport: string | null;
  submitter_id: string;
  submitter_name: string | null;
  submitter_role: SubmitterRole;
  submitter_email: string | null;
  status: TicketStatus;
  created_at: string;
  resolved_at: string | null;
}

// Shape returned to a submitter's own "my tickets" list (never other people's data).
export type MyTicket = Pick<
  SupportTicket,
  'id' | 'subject' | 'status' | 'created_at' | 'resolved_at'
>;

// Maps the app's real role set onto the three stored buckets.
export function normalizeRole(role: string): SubmitterRole {
  if (role === 'admin' || role === 'owner' || role === 'superadmin') return 'owner';
  if (role === 'teacher' || role === 'employee') return 'staff';
  return 'parent';
}
