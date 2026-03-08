// Meeting types for Christina's Child Care Center

export interface MeetingTemplate {
  id: string;
  name: string;
  agenda_items: string[];
  default_duration_minutes: number;
  created_at: string;
}

export interface Meeting {
  id: string;
  center_id?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  title: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  template_id?: string;
  facilitator_id?: string;
  facilitator_name?: string;
  created_at: string;
}

export interface MeetingAgendaItem {
  id: string;
  meeting_id: string;
  order_index: number;
  title: string;
  notes: string;
  duration_minutes?: number;
  completed: boolean;
  created_at: string;
}

export interface MeetingAttendance {
  id: string;
  meeting_id: string;
  employee_id: string;
  employee_name: string;
  present: boolean;
}

export interface MeetingActionItem {
  id: string;
  meeting_id?: string;
  agenda_item_id?: string;
  description: string;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  status: 'open' | 'in_progress' | 'completed';
  carried_forward_from?: string;
  completed_at?: string;
  created_at: string;
}

export type MeetingCreate = Omit<Meeting, 'id' | 'created_at'>;

// Default templates for childcare meetings
export const DEFAULT_TEMPLATES: Omit<MeetingTemplate, 'id' | 'created_at'>[] = [
  {
    name: 'Monthly Staff Meeting',
    default_duration_minutes: 60,
    agenda_items: [
      'Welcome & Attendance',
      'Review Action Items from Last Meeting',
      'Center Updates & Announcements',
      'Classroom Updates',
      'Scheduling & Coverage',
      'Compliance & Safety',
      'Open Discussion',
    ],
  },
  {
    name: 'Leadership Meeting',
    default_duration_minutes: 45,
    agenda_items: [
      'Review Action Items',
      'Enrollment & Revenue Update',
      'Staffing & Coverage',
      'Strategic Priorities',
      'New Business',
    ],
  },
  {
    name: 'Quick Huddle',
    default_duration_minutes: 15,
    agenda_items: [
      'Today\'s Priorities',
      'Coverage Gaps',
      'Quick Announcements',
    ],
  },
];

let meetingIdCounter = 0;
export function generateMeetingId(): string {
  return `mtg_${Date.now()}_${++meetingIdCounter}`;
}

export function generateAgendaItemId(): string {
  return `agi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateActionItemId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateAttendanceId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
