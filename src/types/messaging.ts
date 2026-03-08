// Staff Messaging + Direct Message types

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'all_staff' | 'center' | 'department' | 'custom';
  center_id?: string;
  members: string[];
  created_by: string;
  created_at: string;
  is_archived: boolean;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  reply_to?: string;
  is_pinned: boolean;
  read_by: string[];
  reactions: Record<string, string[]>; // emoji -> array of names who reacted
  created_at: string;
  updated_at: string;
}

export interface DirectMessage {
  id: string;
  sender_name: string;
  recipient_name: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export const DEFAULT_CHANNELS: Omit<ChatChannel, 'id'>[] = [
  {
    name: 'All Staff',
    description: 'Announcements and updates for the entire team',
    type: 'all_staff',
    members: [
      'Christina Fraser', 'Sarah Johnson', 'Maria Garcia', 'James Wilson',
      'Emily Chen', 'David Kim', 'Ashley Brown', 'Michael Davis',
    ],
    created_by: 'Christina Fraser',
    created_at: new Date().toISOString(),
    is_archived: false,
  },
  {
    name: 'Crystal Center',
    description: 'Crystal location staff coordination',
    type: 'center',
    center_id: 'crystal',
    members: [
      'Christina Fraser', 'Sarah Johnson', 'Maria Garcia', 'Emily Chen',
    ],
    created_by: 'Christina Fraser',
    created_at: new Date().toISOString(),
    is_archived: false,
  },
  {
    name: 'Brooklyn Park',
    description: 'Brooklyn Park location staff coordination',
    type: 'center',
    center_id: 'brooklyn_park',
    members: [
      'Christina Fraser', 'James Wilson', 'David Kim', 'Ashley Brown', 'Michael Davis',
    ],
    created_by: 'Christina Fraser',
    created_at: new Date().toISOString(),
    is_archived: false,
  },
  {
    name: 'Lead Teachers',
    description: 'Lead teacher planning and curriculum discussion',
    type: 'department',
    members: [
      'Christina Fraser', 'Sarah Johnson', 'James Wilson', 'Emily Chen',
    ],
    created_by: 'Christina Fraser',
    created_at: new Date().toISOString(),
    is_archived: false,
  },
  {
    name: 'Kitchen & CACFP',
    description: 'Meal planning, food program compliance, and kitchen operations',
    type: 'department',
    members: [
      'Christina Fraser', 'Maria Garcia', 'Ashley Brown', 'Michael Davis',
    ],
    created_by: 'Christina Fraser',
    created_at: new Date().toISOString(),
    is_archived: false,
  },
];

let channelIdCounter = 0;
export function generateChannelId(): string {
  return `ch_${Date.now()}_${++channelIdCounter}`;
}

let messageIdCounter = 0;
export function generateMessageId(): string {
  return `msg_${Date.now()}_${++messageIdCounter}`;
}

let dmIdCounter = 0;
export function generateDMId(): string {
  return `dm_${Date.now()}_${++dmIdCounter}`;
}
