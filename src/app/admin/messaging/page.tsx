'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getEmployees } from '@/lib/employee-storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Send,
  Paperclip,
  Pin,
  PinOff,
  Reply,
  Plus,
  X,
  Hash,
  Lock,
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCheck,
  Smile,
  Info,
  UserPlus,
  AtSign,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
}

interface Reaction {
  emoji: string;
  users: string[]; // user IDs
}

interface ReadReceipt {
  userId: string;
  readAt: string;
}

interface Message {
  id: string;
  channelId: string | null;
  dmThreadId: string | null;
  senderId: string;
  content: string;
  timestamp: string;
  replyToId: string | null;
  reactions: Reaction[];
  isPinned: boolean;
  readReceipts: ReadReceipt[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  memberIds: string[];
  createdAt: string;
}

interface DMThread {
  id: string;
  participantIds: string[]; // always 2 users
  lastMessageAt: string;
}

type ActiveView =
  | { kind: 'channel'; channelId: string }
  | { kind: 'dm'; threadId: string };

type RightPanelView = 'none' | 'channel-info' | 'dm-info';

// ─── Constants ──────────────────────────────────────────────────────

const STORAGE_KEYS = {
  channels: 'christinas_channels',
  messages: 'christinas_messages',
  dms: 'christinas_dms',
};

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '👏', '🔥'];

// Live staff roster, populated from the real employee store (getEmployees).
// No fabricated people: starts empty and is filled at runtime by the component.
// Module-level so the existing module-scoped helpers (getStaff, etc.) can read it.
let STAFF: StaffMember[] = [];

// Deterministic avatar color from an id so each staff member is visually stable.
const AVATAR_COLORS = ['#C62828', '#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F', '#4E342E', '#37474F'];
function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Current signed-in user; set when the real roster loads. Empty until then.
let CURRENT_USER_ID = '';

// ─── Helpers ────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const UNKNOWN_STAFF: StaffMember = {
  id: 'unknown',
  name: 'Unknown',
  initials: '?',
  color: '#9E9E9E',
  role: '',
};

function getStaff(id: string): StaffMember {
  return STAFF.find((s) => s.id === id) || UNKNOWN_STAFF;
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (msgDate.getTime() === today.getTime()) {
    return `Today ${timeStr}`;
  }
  if (msgDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  }
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr} ${timeStr}`;
}

function getDMOtherParticipant(thread: DMThread): StaffMember {
  const otherId = thread.participantIds.find((id) => id !== CURRENT_USER_ID) || thread.participantIds[0];
  return getStaff(otherId);
}

// ─── Storage ────────────────────────────────────────────────────────

function loadChannels(): Channel[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.channels);
  if (stored) return JSON.parse(stored) as Channel[];
  // No seed-on-empty: a fresh inbox starts empty, never with fabricated channels.
  return [];
}

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.messages);
  if (stored) return JSON.parse(stored) as Message[];
  // No seed-on-empty: never inject fabricated messages.
  return [];
}

function loadDMs(): DMThread[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.dms);
  if (stored) return JSON.parse(stored) as DMThread[];
  // No seed-on-empty: never inject fabricated DM threads.
  return [];
}

function saveChannels(channels: Channel[]) {
  localStorage.setItem(STORAGE_KEYS.channels, JSON.stringify(channels));
}

function saveMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
}

function saveDMs(dms: DMThread[]) {
  localStorage.setItem(STORAGE_KEYS.dms, JSON.stringify(dms));
}

// ─── Component ──────────────────────────────────────────────────────

export default function MessagingPage() {
  // Core state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dmThreads, setDmThreads] = useState<DMThread[]>([]);
  const [mounted, setMounted] = useState(false);
  // Bumped after the real staff roster loads so render reflects it.
  const [, setStaffVersion] = useState(0);

  // Navigation state
  const [activeView, setActiveView] = useState<ActiveView>({ kind: 'channel', channelId: 'ch-all-staff' });
  const [rightPanel, setRightPanel] = useState<RightPanelView>('none');

  // Input state
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Hover/action state
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [emojiPickerMessageId, setEmojiPickerMessageId] = useState<string | null>(null);

  // Sidebar sections
  const [channelsSectionOpen, setChannelsSectionOpen] = useState(true);
  const [dmsSectionOpen, setDmsSectionOpen] = useState(true);

  // Dialogs
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');
  const [newChannelMembers, setNewChannelMembers] = useState<string[]>([CURRENT_USER_ID]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Init ───────────────────────────────────────────────────────

  useEffect(() => {
    setChannels(loadChannels());
    setMessages(loadMessages());
    setDmThreads(loadDMs());
    setMounted(true);

    // Populate the staff roster from the real employee store. No fabricated
    // people: if there are no employees, the roster stays empty and the page
    // renders its empty states.
    let cancelled = false;
    (async () => {
      try {
        const employees = await getEmployees();
        if (cancelled) return;
        STAFF = employees.map((e) => {
          const name = `${e.first_name} ${e.last_name}`.trim() || e.email;
          return {
            id: e.id,
            name,
            initials: initialsFor(name),
            color: colorForId(e.id),
            role: e.job_title || '',
          };
        });
        // First staff member (or owner/director) acts as the signed-in user.
        const self =
          STAFF.find((s) => /owner|director/i.test(s.role)) || STAFF[0];
        CURRENT_USER_ID = self ? self.id : '';
        setStaffVersion((v) => v + 1);
      } catch {
        /* leave roster empty; the page renders its empty state */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Persist ────────────────────────────────────────────────────

  useEffect(() => {
    if (mounted) saveChannels(channels);
  }, [channels, mounted]);

  useEffect(() => {
    if (mounted) saveMessages(messages);
  }, [messages, mounted]);

  useEffect(() => {
    if (mounted) saveDMs(dmThreads);
  }, [dmThreads, mounted]);

  // ─── Scroll to bottom ──────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [activeView, mounted, scrollToBottom]);

  // ─── Derived data ─────────────────────────────────────────────

  const activeChannel = activeView.kind === 'channel'
    ? channels.find((c) => c.id === activeView.channelId) || null
    : null;

  const activeDMThread = activeView.kind === 'dm'
    ? dmThreads.find((t) => t.id === activeView.threadId) || null
    : null;

  const currentMessages = messages
    .filter((m) => {
      if (activeView.kind === 'channel') return m.channelId === activeView.channelId;
      return m.dmThreadId === activeView.threadId;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const filteredMessages = searchQuery
    ? currentMessages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getStaff(m.senderId).name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentMessages;

  const pinnedMessages = currentMessages.filter((m) => m.isPinned);

  // Unread counts per channel (messages without current user in readReceipts)
  const getUnreadCount = useCallback(
    (channelId: string): number => {
      return messages.filter(
        (m) =>
          m.channelId === channelId &&
          !m.readReceipts.some((r) => r.userId === CURRENT_USER_ID)
      ).length;
    },
    [messages]
  );

  const getDMUnreadCount = useCallback(
    (threadId: string): number => {
      return messages.filter(
        (m) =>
          m.dmThreadId === threadId &&
          m.senderId !== CURRENT_USER_ID &&
          !m.readReceipts.some((r) => r.userId === CURRENT_USER_ID)
      ).length;
    },
    [messages]
  );

  const getLastDMMessage = useCallback(
    (threadId: string): Message | undefined => {
      return messages
        .filter((m) => m.dmThreadId === threadId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    },
    [messages]
  );

  // ─── Actions ──────────────────────────────────────────────────

  const markAsRead = useCallback(
    (view: ActiveView) => {
      setMessages((prev) =>
        prev.map((m) => {
          const inView =
            view.kind === 'channel'
              ? m.channelId === view.channelId
              : m.dmThreadId === view.threadId;
          if (!inView) return m;
          if (m.readReceipts.some((r) => r.userId === CURRENT_USER_ID)) return m;
          return {
            ...m,
            readReceipts: [
              ...m.readReceipts,
              { userId: CURRENT_USER_ID, readAt: new Date().toISOString() },
            ],
          };
        })
      );
    },
    []
  );

  useEffect(() => {
    if (mounted) markAsRead(activeView);
  }, [activeView, mounted, markAsRead]);

  const sendMessage = () => {
    const text = messageInput.trim();
    if (!text) return;

    const newMsg: Message = {
      id: generateId(),
      channelId: activeView.kind === 'channel' ? activeView.channelId : null,
      dmThreadId: activeView.kind === 'dm' ? activeView.threadId : null,
      senderId: CURRENT_USER_ID,
      content: text,
      timestamp: new Date().toISOString(),
      replyToId: replyingTo,
      reactions: [],
      isPinned: false,
      readReceipts: [{ userId: CURRENT_USER_ID, readAt: new Date().toISOString() }],
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
    setReplyingTo(null);

    // Update DM thread lastMessageAt
    if (activeView.kind === 'dm') {
      setDmThreads((prev) =>
        prev.map((t) =>
          t.id === activeView.threadId
            ? { ...t, lastMessageAt: new Date().toISOString() }
            : t
        )
      );
    }

    setTimeout(scrollToBottom, 50);
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existingReaction = m.reactions.find((r) => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(CURRENT_USER_ID)) {
            // Remove user from this reaction
            const updatedUsers = existingReaction.users.filter((u) => u !== CURRENT_USER_ID);
            if (updatedUsers.length === 0) {
              return { ...m, reactions: m.reactions.filter((r) => r.emoji !== emoji) };
            }
            return {
              ...m,
              reactions: m.reactions.map((r) =>
                r.emoji === emoji ? { ...r, users: updatedUsers } : r
              ),
            };
          } else {
            // Add user to this reaction
            return {
              ...m,
              reactions: m.reactions.map((r) =>
                r.emoji === emoji ? { ...r, users: [...r.users, CURRENT_USER_ID] } : r
              ),
            };
          }
        }
        // New reaction
        return {
          ...m,
          reactions: [...m.reactions, { emoji, users: [CURRENT_USER_ID] }],
        };
      })
    );
    setEmojiPickerMessageId(null);
  };

  const togglePin = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isPinned: !m.isPinned } : m))
    );
  };

  const createChannel = () => {
    if (!newChannelName.trim()) return;
    // Always include the live current user; drop any stale empty placeholder.
    const memberIds = Array.from(
      new Set([CURRENT_USER_ID, ...newChannelMembers].filter(Boolean))
    );
    const newChannel: Channel = {
      id: generateId(),
      name: newChannelName.trim(),
      description: newChannelDesc.trim(),
      type: newChannelType,
      memberIds,
      createdAt: new Date().toISOString(),
    };
    setChannels((prev) => [...prev, newChannel]);
    setActiveView({ kind: 'channel', channelId: newChannel.id });
    setShowCreateChannel(false);
    setNewChannelName('');
    setNewChannelDesc('');
    setNewChannelType('public');
    setNewChannelMembers([CURRENT_USER_ID]);
  };

  const startDM = (staffId: string) => {
    // Check if DM thread already exists
    const existing = dmThreads.find(
      (t) => t.participantIds.includes(staffId) && t.participantIds.includes(CURRENT_USER_ID)
    );
    if (existing) {
      setActiveView({ kind: 'dm', threadId: existing.id });
      setShowNewDM(false);
      return;
    }
    const newThread: DMThread = {
      id: generateId(),
      participantIds: [CURRENT_USER_ID, staffId],
      lastMessageAt: new Date().toISOString(),
    };
    setDmThreads((prev) => [...prev, newThread]);
    setActiveView({ kind: 'dm', threadId: newThread.id });
    setShowNewDM(false);
  };

  const addMemberToChannel = (channelId: string, staffId: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        if (c.memberIds.includes(staffId)) return c;
        return { ...c, memberIds: [...c.memberIds, staffId] };
      })
    );
  };

  const removeMemberFromChannel = (channelId: string, staffId: string) => {
    if (staffId === CURRENT_USER_ID) return; // Cannot remove self
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        return { ...c, memberIds: c.memberIds.filter((id) => id !== staffId) };
      })
    );
  };

  // ─── Auto-resize textarea ────────────────────────────────────

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 150)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Render helpers ───────────────────────────────────────────

  const renderAvatar = (staff: StaffMember, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-6 h-6 text-[10px]',
      md: 'w-8 h-8 text-xs',
      lg: 'w-10 h-10 text-sm',
    };
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
        style={{ backgroundColor: staff.color }}
      >
        {staff.initials}
      </div>
    );
  };

  const renderReadReceipt = (msg: Message) => {
    if (activeView.kind === 'dm') {
      // For DMs, show Read/Delivered
      if (msg.senderId !== CURRENT_USER_ID) return null;
      const otherParticipant = activeDMThread
        ? activeDMThread.participantIds.find((id) => id !== CURRENT_USER_ID)
        : null;
      const isRead = otherParticipant
        ? msg.readReceipts.some((r) => r.userId === otherParticipant)
        : false;
      return (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
          {isRead ? (
            <>
              <CheckCheck className="w-3 h-3 text-blue-400" />
              <span>Read</span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3" />
              <span>Delivered</span>
            </>
          )}
        </div>
      );
    }
    // For channels, show "Read by X of Y"
    if (msg.senderId !== CURRENT_USER_ID) return null;
    const channel = channels.find((c) => c.id === msg.channelId);
    if (!channel) return null;
    const readCount = msg.readReceipts.length;
    const totalMembers = channel.memberIds.length;
    return (
      <div className="text-[11px] text-gray-400 mt-0.5">
        Read by {readCount} of {totalMembers}
      </div>
    );
  };

  if (!mounted) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-gray-400">Loading messages...</div>
        </div>
      </>
    );
  }

  // ─── Sidebar: Channel List ───────────────────────────────────

  const renderSidebar = () => (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C62828]" />
            Messaging
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="h-8 w-8"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        {showSearch && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 focus:border-[#C62828]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Channels Section */}
        <div className="py-2">
          <button
            onClick={() => setChannelsSectionOpen(!channelsSectionOpen)}
            className="flex items-center gap-1 px-4 py-1.5 w-full text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
          >
            {channelsSectionOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Channels
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateChannel(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </button>
          {channelsSectionOpen &&
            channels.map((channel) => {
              const unread = getUnreadCount(channel.id);
              const isActive = activeView.kind === 'channel' && activeView.channelId === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveView({ kind: 'channel', channelId: channel.id });
                    setReplyingTo(null);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-[#C62828]/10 text-[#C62828] font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {channel.type === 'private' ? (
                    <Lock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  ) : (
                    <Hash className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  )}
                  <span className="truncate">{channel.name}</span>
                  {unread > 0 && (
                    <Badge className="ml-auto bg-[#C62828] text-white text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center">
                      {unread}
                    </Badge>
                  )}
                </button>
              );
            })}
        </div>

        {/* DMs Section */}
        <div className="py-2 border-t border-gray-200">
          <button
            onClick={() => setDmsSectionOpen(!dmsSectionOpen)}
            className="flex items-center gap-1 px-4 py-1.5 w-full text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
          >
            {dmsSectionOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Direct Messages
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewDM(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </button>
          {dmsSectionOpen &&
            dmThreads
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
              .map((thread) => {
                const otherPerson = getDMOtherParticipant(thread);
                const unread = getDMUnreadCount(thread.id);
                const isActive = activeView.kind === 'dm' && activeView.threadId === thread.id;
                const lastMsg = getLastDMMessage(thread.id);
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setActiveView({ kind: 'dm', threadId: thread.id });
                      setReplyingTo(null);
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#C62828]/10 text-[#C62828]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {renderAvatar(otherPerson, 'sm')}
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`truncate ${unread > 0 ? 'font-semibold' : ''}`}>
                        {otherPerson.name}
                      </div>
                      {lastMsg && (
                        <div className="text-sm text-gray-400 truncate">
                          {lastMsg.senderId === CURRENT_USER_ID ? 'You: ' : ''}
                          {lastMsg.content}
                        </div>
                      )}
                    </div>
                    {unread > 0 && (
                      <Badge className="bg-[#C62828] text-white text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center">
                        {unread}
                      </Badge>
                    )}
                  </button>
                );
              })}
        </div>
      </div>
    </div>
  );

  // ─── Main Chat Area ───────────────────────────────────────────

  const renderChatHeader = () => {
    if (activeView.kind === 'channel' && activeChannel) {
      return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            {activeChannel.type === 'private' ? (
              <Lock className="w-4 h-4 text-gray-500" />
            ) : (
              <Hash className="w-4 h-4 text-gray-500" />
            )}
            <h3 className="font-semibold text-gray-900">{activeChannel.name}</h3>
            <span className="text-sm text-gray-400">
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {activeChannel.memberIds.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {pinnedMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 gap-1"
                onClick={() => setRightPanel(rightPanel === 'channel-info' ? 'none' : 'channel-info')}
              >
                <Pin className="w-4 h-4" />
                <span className="text-xs">{pinnedMessages.length}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              onClick={() => setRightPanel(rightPanel === 'channel-info' ? 'none' : 'channel-info')}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    if (activeView.kind === 'dm' && activeDMThread) {
      const otherPerson = getDMOtherParticipant(activeDMThread);
      return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            {renderAvatar(otherPerson, 'sm')}
            <div>
              <h3 className="font-semibold text-gray-900">{otherPerson.name}</h3>
              <span className="text-sm text-gray-400">{otherPerson.role}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700"
            onClick={() => setRightPanel(rightPanel === 'dm-info' ? 'none' : 'dm-info')}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderMessage = (msg: Message) => {
    const sender = getStaff(msg.senderId);
    const isHovered = hoveredMessageId === msg.id;
    const replyParent = msg.replyToId
      ? messages.find((m) => m.id === msg.replyToId)
      : null;

    return (
      <div
        key={msg.id}
        className={`group relative px-4 py-2 hover:bg-gray-50 transition-colors ${
          msg.isPinned ? 'border-l-2 border-amber-400 bg-amber-50/30' : ''
        }`}
        onMouseEnter={() => setHoveredMessageId(msg.id)}
        onMouseLeave={() => {
          setHoveredMessageId(null);
          if (emojiPickerMessageId === msg.id) setEmojiPickerMessageId(null);
        }}
      >
        {/* Reply indicator */}
        {replyParent && (
          <div className="flex items-center gap-2 mb-1 ml-10 text-xs text-gray-400">
            <Reply className="w-3 h-3 rotate-180" />
            <span className="font-medium text-gray-500">
              {getStaff(replyParent.senderId).name}
            </span>
            <span className="truncate max-w-[300px]">{replyParent.content}</span>
          </div>
        )}

        {/* Pin indicator */}
        {msg.isPinned && (
          <div className="flex items-center gap-1 mb-1 ml-10 text-xs text-amber-600">
            <Pin className="w-3 h-3" />
            <span>Pinned</span>
          </div>
        )}

        <div className="flex gap-4">
          {renderAvatar(sender)}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base text-gray-900">{sender.name}</span>
              <span className="text-sm text-gray-400">{formatMessageTime(msg.timestamp)}</span>
            </div>
            <p className="text-base text-gray-700 mt-0.5 whitespace-pre-wrap break-words">
              {msg.content}
            </p>

            {/* Reactions */}
            {msg.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {msg.reactions.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    onClick={() => toggleReaction(msg.id, reaction.emoji)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                      reaction.users.includes(CURRENT_USER_ID)
                        ? 'bg-[#C62828]/10 border-[#C62828]/30 text-[#C62828]'
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.users.length}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Read receipts */}
            {renderReadReceipt(msg)}
          </div>
        </div>

        {/* Hover actions */}
        {isHovered && (
          <div className="absolute right-4 top-1 flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => setEmojiPickerMessageId(emojiPickerMessageId === msg.id ? null : msg.id)}
              className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
              title="React"
            >
              <Smile className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => {
                setReplyingTo(msg.id);
                textareaRef.current?.focus();
              }}
              className="p-1.5 hover:bg-gray-100 transition-colors"
              title="Reply"
            >
              <Reply className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => togglePin(msg.id)}
              className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
              title={msg.isPinned ? 'Unpin' : 'Pin'}
            >
              {msg.isPinned ? (
                <PinOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Pin className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        )}

        {/* Emoji picker dropdown */}
        {emojiPickerMessageId === msg.id && (
          <div className="absolute right-4 top-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(msg.id, emoji)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMessageInput = () => {
    const replyParent = replyingTo ? messages.find((m) => m.id === replyingTo) : null;

    return (
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Reply preview */}
        {replyParent && (
          <div className="flex items-center justify-between mb-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
              <Reply className="w-4 h-4 flex-shrink-0 rotate-180" />
              <span className="font-medium">Replying to {getStaff(replyParent.senderId).name}</span>
              <span className="truncate text-gray-400">{replyParent.content}</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600 flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                activeView.kind === 'channel' && activeChannel
                  ? `Message #${activeChannel.name}`
                  : activeView.kind === 'dm' && activeDMThread
                    ? `Message ${getDMOtherParticipant(activeDMThread).name}`
                    : 'Type a message...'
              }
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-base min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 focus:border-[#C62828] max-h-[150px]"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!messageInput.trim()}
            className="h-9 w-9 min-h-[44px] min-w-[44px] flex-shrink-0 bg-[#C62828] hover:bg-[#B71C1C] disabled:opacity-40"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderMainArea = () => (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {renderChatHeader()}
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm">
              {searchQuery ? 'No messages match your search.' : 'No messages yet. Start the conversation!'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredMessages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {renderMessageInput()}
    </div>
  );

  // ─── Right Panel ──────────────────────────────────────────────

  const renderRightPanel = () => {
    if (rightPanel === 'none') return null;

    if (rightPanel === 'channel-info' && activeChannel) {
      const members = activeChannel.memberIds.map(getStaff);
      const nonMembers = STAFF.filter((s) => !activeChannel.memberIds.includes(s.id));
      return (
        <div className="w-72 border-l border-gray-200 bg-white flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-sm">Channel Info</h4>
            <button onClick={() => setRightPanel('none')} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</h5>
              <p className="text-sm text-gray-700">
                {activeChannel.description || 'No description.'}
              </p>
            </div>

            {/* Pinned messages */}
            {pinnedMessages.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Pinned Messages ({pinnedMessages.length})
                </h5>
                <div className="space-y-2">
                  {pinnedMessages.map((pm) => {
                    const pmSender = getStaff(pm.senderId);
                    return (
                      <div key={pm.id} className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          {renderAvatar(pmSender, 'sm')}
                          <span className="font-medium text-xs">{pmSender.name}</span>
                        </div>
                        <p className="text-gray-700 text-xs line-clamp-3">{pm.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Members ({members.length})
              </h5>
              <div className="space-y-1">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-1.5 group/member"
                  >
                    <div className="flex items-center gap-2">
                      {renderAvatar(member, 'sm')}
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {member.name}
                          {member.id === CURRENT_USER_ID && (
                            <span className="text-xs text-gray-400 ml-1">(you)</span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">{member.role}</div>
                      </div>
                    </div>
                    {member.id !== CURRENT_USER_ID && (
                      <button
                        onClick={() => removeMemberFromChannel(activeChannel.id, member.id)}
                        className="opacity-0 group-hover/member:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all"
                        title="Remove from channel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add members */}
            {nonMembers.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Add Members</h5>
                <div className="space-y-1">
                  {nonMembers.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => addMemberToChannel(activeChannel.id, person.id)}
                      className="flex items-center gap-2 w-full py-1.5 px-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      {renderAvatar(person, 'sm')}
                      <span className="text-sm text-gray-600">{person.name}</span>
                      <UserPlus className="w-3.5 h-3.5 ml-auto text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (rightPanel === 'dm-info' && activeDMThread) {
      const otherPerson = getDMOtherParticipant(activeDMThread);
      return (
        <div className="w-72 border-l border-gray-200 bg-white flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-sm">Contact Info</h4>
            <button onClick={() => setRightPanel('none')} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col items-center text-center mb-6">
              {renderAvatar(otherPerson, 'lg')}
              <h4 className="font-semibold text-gray-900 mt-2">{otherPerson.name}</h4>
              <p className="text-sm text-gray-500">{otherPerson.role}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base text-gray-600">
                <AtSign className="w-4 h-4 text-gray-400" />
                <span>{otherPerson.name.toLowerCase().replace(' ', '.')}</span>
              </div>
              <div className="flex items-center gap-2 text-base text-gray-600">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span>
                  {messages.filter((m) => m.dmThreadId === activeDMThread.id).length} messages in conversation
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ─── Dialogs ──────────────────────────────────────────────────

  const renderCreateChannelDialog = () => (
    <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create a new channel for your team to collaborate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-base font-medium text-gray-700 block mb-1">Channel Name</label>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="e.g., Toddler Room"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 focus:border-[#C62828]"
            />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              value={newChannelDesc}
              onChange={(e) => setNewChannelDesc(e.target.value)}
              placeholder="What is this channel for?"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 focus:border-[#C62828] resize-none"
            />
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 block mb-1">Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setNewChannelType('public')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  newChannelType === 'public'
                    ? 'border-[#C62828] bg-[#C62828]/5 text-[#C62828]'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Hash className="w-4 h-4" />
                Public
              </button>
              <button
                onClick={() => setNewChannelType('private')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  newChannelType === 'private'
                    ? 'border-[#C62828] bg-[#C62828]/5 text-[#C62828]'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-4 h-4" />
                Private
              </button>
            </div>
          </div>
          <div>
            <label className="text-base font-medium text-gray-700 block mb-2">Members</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {STAFF.map((person) => {
                const isSelected = newChannelMembers.includes(person.id);
                const isSelf = person.id === CURRENT_USER_ID;
                return (
                  <button
                    key={person.id}
                    onClick={() => {
                      if (isSelf) return;
                      setNewChannelMembers((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== person.id)
                          : [...prev, person.id]
                      );
                    }}
                    disabled={isSelf}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-[#C62828]/5 text-[#C62828]'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isSelf ? 'opacity-60 cursor-default' : ''}`}
                  >
                    {renderAvatar(person, 'sm')}
                    <span className="flex-1 text-left">{person.name}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateChannel(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createChannel}
              disabled={!newChannelName.trim()}
              className="bg-[#C62828] hover:bg-[#B71C1C] text-white"
            >
              Create Channel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderNewDMDialog = () => {
    const availableStaff = STAFF.filter((s) => s.id !== CURRENT_USER_ID);
    return (
      <Dialog open={showNewDM} onOpenChange={setShowNewDM}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Start a direct message conversation with a staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 mt-2 max-h-80 overflow-y-auto">
            {availableStaff.map((person) => {
              const existingThread = dmThreads.find(
                (t) => t.participantIds.includes(person.id) && t.participantIds.includes(CURRENT_USER_ID)
              );
              return (
                <button
                  key={person.id}
                  onClick={() => startDM(person.id)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {renderAvatar(person)}
                  <div className="text-left">
                    <div className="text-base font-medium text-gray-800">{person.name}</div>
                    <div className="text-sm text-gray-400">{person.role}</div>
                  </div>
                  {existingThread && (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      Active
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {renderSidebar()}
        {renderMainArea()}
        {renderRightPanel()}
      </div>

      {renderCreateChannelDialog()}
      {renderNewDMDialog()}
    </>
  );
}
