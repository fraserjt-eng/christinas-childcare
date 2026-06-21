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
  guarded: true,
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

export function seedParentConversations(_parentEmail: string, _parentName: string): void {
  // Hydrate real conversations from the cloud only. Fabricated staff->parent
  // threads are never injected into a real parent's inbox.
  hydrateOnce();
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
