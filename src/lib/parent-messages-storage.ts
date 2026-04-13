// Parent Messages Storage
// Dual-write: Supabase (table: parent_conversations) + localStorage.
// Sync API preserved; cloud writes fire-and-forget, cloud reads hydrate once.

import { createDualWrite } from '@/lib/supabase/dual-write';

export interface ParentMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  fromParent: boolean;
  read: boolean;
}

export interface ParentConversation {
  id: string;
  parentEmail: string;
  parentName: string;
  parentInitials: string;
  staffName: string;
  staffInitials: string;
  staffRole: string;
  messages: ParentMessage[];
  lastMessage: string;
  lastTimestamp: string;
  unreadForParent: boolean;
  unreadForAdmin: boolean;
}

const STORAGE_KEY = 'christinas_parent_messages';

const store = createDualWrite<ParentConversation>({
  table: 'parent_conversations',
  localKey: STORAGE_KEY,
});

let hydrated = false;
function hydrateOnce(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  void store.getAll().catch(() => {
    /* background sync */
  });
}

function now(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getAllLocal(): ParentConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return [];
}

function saveLocal(conversations: ParentConversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save parent messages:', e);
  }
}

function persist(conversation: ParentConversation): void {
  // Local save is already performed by caller (via saveLocal of full list).
  // Mirror to cloud.
  void store.save(conversation);
}

const SEED_CONVERSATIONS: Omit<ParentConversation, 'parentEmail' | 'parentName' | 'parentInitials'>[] = [
  {
    id: 'conv-ophelia',
    staffName: 'Ophelia Zeogar',
    staffInitials: 'OZ',
    staffRole: 'Director',
    messages: [
      {
        id: 'm-oph-1',
        sender: 'Ophelia Zeogar',
        content: "Good morning! Announcing our Spring Family Event on March 21st with games, potluck, and art showcase.",
        timestamp: '10:30 AM',
        fromParent: false,
        read: false,
      },
      {
        id: 'm-oph-2',
        sender: 'Ophelia Zeogar',
        content: 'Please RSVP by March 7th. Looking forward to seeing everyone!',
        timestamp: '10:31 AM',
        fromParent: false,
        read: false,
      },
    ],
    lastMessage: 'Please RSVP by March 7th. Looking forward to seeing everyone!',
    lastTimestamp: '10:31 AM',
    unreadForParent: true,
    unreadForAdmin: false,
  },
  {
    id: 'conv-maria',
    staffName: 'Maria Santos',
    staffInitials: 'MS',
    staffRole: 'Lead Teacher - Infants',
    messages: [
      {
        id: 'm-mar-1',
        sender: 'Maria Santos',
        content: 'Sofia pulled herself up to standing today! She was so proud with the biggest smile.',
        timestamp: '2:15 PM',
        fromParent: false,
        read: false,
      },
      {
        id: 'm-mar-2',
        sender: 'Maria Santos',
        content: 'I took a video if you want to see it. She has been working hard on balance.',
        timestamp: '2:16 PM',
        fromParent: false,
        read: false,
      },
    ],
    lastMessage: 'I took a video if you want to see it. She has been working hard on balance.',
    lastTimestamp: '2:16 PM',
    unreadForParent: true,
    unreadForAdmin: false,
  },
  {
    id: 'conv-james',
    staffName: 'James Robinson',
    staffInitials: 'JR',
    staffRole: 'Lead Teacher - Toddlers',
    messages: [
      {
        id: 'm-jam-1',
        sender: 'James Robinson',
        content: 'Reminder: permission slip for Children Museum trip Feb 5th due Friday Jan 30th.',
        timestamp: 'Yesterday 9:00 AM',
        fromParent: false,
        read: true,
      },
    ],
    lastMessage: 'Reminder: permission slip for Children Museum trip Feb 5th due Friday Jan 30th.',
    lastTimestamp: 'Yesterday 9:00 AM',
    unreadForParent: false,
    unreadForAdmin: false,
  },
];

export function seedParentConversations(parentEmail: string, parentName: string): void {
  hydrateOnce();
  const all = getAllLocal();
  const hasParent = all.some((c) => c.parentEmail === parentEmail);
  if (hasParent) return;

  const initials = parentName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const seeded: ParentConversation[] = SEED_CONVERSATIONS.map((c) => ({
    ...c,
    id: `${c.id}-${parentEmail}`,
    parentEmail,
    parentName,
    parentInitials: initials,
    messages: c.messages.map((m) => ({ ...m, id: `${m.id}-${parentEmail}` })),
  }));

  saveLocal([...all, ...seeded]);
  void store.saveMany(seeded);
}

export function getConversationsForParent(parentEmail: string): ParentConversation[] {
  hydrateOnce();
  return getAllLocal().filter((c) => c.parentEmail === parentEmail);
}

export function getAllConversations(): ParentConversation[] {
  hydrateOnce();
  return getAllLocal();
}

export function sendMessageFromParent(
  conversationId: string,
  content: string,
  parentName: string
): void {
  const all = getAllLocal();
  const idx = all.findIndex((c) => c.id === conversationId);
  if (idx === -1) return;

  const timestamp = now();
  const msg: ParentMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender: parentName,
    content,
    timestamp,
    fromParent: true,
    read: false,
  };

  all[idx] = {
    ...all[idx],
    messages: [...all[idx].messages, msg],
    lastMessage: content,
    lastTimestamp: timestamp,
    unreadForAdmin: true,
  };

  saveLocal(all);
  persist(all[idx]);
}

export function sendMessageFromAdmin(
  conversationId: string,
  content: string,
  staffName: string
): void {
  const all = getAllLocal();
  const idx = all.findIndex((c) => c.id === conversationId);
  if (idx === -1) return;

  const timestamp = now();
  const msg: ParentMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender: staffName,
    content,
    timestamp,
    fromParent: false,
    read: false,
  };

  all[idx] = {
    ...all[idx],
    messages: [...all[idx].messages, msg],
    lastMessage: content,
    lastTimestamp: timestamp,
    unreadForParent: true,
  };

  saveLocal(all);
  persist(all[idx]);
}

export function markReadForParent(conversationId: string): void {
  const all = getAllLocal();
  const idx = all.findIndex((c) => c.id === conversationId);
  if (idx === -1) return;

  all[idx] = {
    ...all[idx],
    unreadForParent: false,
    messages: all[idx].messages.map((m) =>
      m.fromParent ? m : { ...m, read: true }
    ),
  };

  saveLocal(all);
  persist(all[idx]);
}

export function markReadForAdmin(conversationId: string): void {
  const all = getAllLocal();
  const idx = all.findIndex((c) => c.id === conversationId);
  if (idx === -1) return;

  all[idx] = {
    ...all[idx],
    unreadForAdmin: false,
    messages: all[idx].messages.map((m) =>
      m.fromParent ? { ...m, read: true } : m
    ),
  };

  saveLocal(all);
  persist(all[idx]);
}

export function getUnreadCountForParent(parentEmail: string): number {
  return getAllLocal().filter((c) => c.parentEmail === parentEmail && c.unreadForParent).length;
}

export function getUnreadCountForAdmin(): number {
  return getAllLocal().filter((c) => c.unreadForAdmin).length;
}
