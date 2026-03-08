'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  ListTodo,
  MessageSquare,
  Calendar,
  AlertTriangle,
  UserPlus,
  Activity,
  Settings,
  Trash2,
  Eye,
  ChevronRight,
  Clock,
  Flame,
  Shield,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────
const STORAGE_KEY = 'christinas_notifications';
const PREFS_STORAGE_KEY = 'christinas_notification_prefs';
const CHRISTINA_RED = '#C62828';

// ─── Types ──────────────────────────────────────────────────────────
type NotificationType =
  | 'task'
  | 'message'
  | 'meeting'
  | 'incident'
  | 'hr'
  | 'drift'
  | 'training'
  | 'system';

type FilterTab = 'all' | 'unread' | 'tasks' | 'messages' | 'meetings' | 'incidents' | 'hr';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string; // ISO string
  read: boolean;
  link_to: string;
}

interface NotificationPrefs {
  tasks: boolean;
  messages: boolean;
  meetings: boolean;
  incidents: boolean;
  hr: boolean;
  push: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────

function getRelativeTime(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'task':
      return { icon: ListTodo, color: '#1565C0', bg: '#E3F2FD' };
    case 'message':
      return { icon: MessageSquare, color: '#2E7D32', bg: '#E8F5E9' };
    case 'meeting':
      return { icon: Calendar, color: '#6A1B9A', bg: '#F3E5F5' };
    case 'incident':
      return { icon: AlertTriangle, color: '#E65100', bg: '#FFF3E0' };
    case 'hr':
      return { icon: UserPlus, color: '#00695C', bg: '#E0F2F1' };
    case 'drift':
      return { icon: Flame, color: CHRISTINA_RED, bg: '#FFEBEE' };
    case 'training':
      return { icon: Shield, color: '#F57F17', bg: '#FFFDE7' };
    case 'system':
      return { icon: Activity, color: '#546E7A', bg: '#ECEFF1' };
  }
}

function matchesFilter(notification: Notification, filter: FilterTab): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'unread':
      return !notification.read;
    case 'tasks':
      return notification.type === 'task' || notification.type === 'drift';
    case 'messages':
      return notification.type === 'message';
    case 'meetings':
      return notification.type === 'meeting';
    case 'incidents':
      return notification.type === 'incident' || notification.type === 'training';
    case 'hr':
      return notification.type === 'hr';
  }
}

// ─── Seed Data ──────────────────────────────────────────────────────

function generateSeedNotifications(): Notification[] {
  const now = Date.now();
  const min = (m: number) => new Date(now - m * 60000).toISOString();
  const hr = (h: number) => new Date(now - h * 3600000).toISOString();

  return [
    {
      id: 'n-001',
      type: 'task',
      title: 'Task Assigned to Sarah Johnson',
      body: "Sarah Johnson was assigned 'Submit CACFP Meal Counts' for this week's reporting deadline.",
      timestamp: min(2),
      read: false,
      link_to: '/admin/tasks',
    },
    {
      id: 'n-002',
      type: 'task',
      title: 'Overdue Task Alert',
      body: "Task 'Fire Drill Documentation' is overdue. Originally due yesterday.",
      timestamp: min(18),
      read: false,
      link_to: '/admin/tasks',
    },
    {
      id: 'n-003',
      type: 'message',
      title: 'New Message in #All Staff',
      body: 'Maria Garcia posted in #All Staff about the updated pickup procedures for next week.',
      timestamp: min(35),
      read: false,
      link_to: '/admin/messaging',
    },
    {
      id: 'n-004',
      type: 'message',
      title: 'Direct Message from David Kim',
      body: 'David Kim sent you a message about swapping shifts on Thursday.',
      timestamp: hr(1),
      read: false,
      link_to: '/admin/messaging',
    },
    {
      id: 'n-005',
      type: 'meeting',
      title: 'Meeting Starting Soon',
      body: 'Monthly Staff Meeting starts in 30 minutes. Conference room is reserved.',
      timestamp: min(5),
      read: false,
      link_to: '/admin/meetings',
    },
    {
      id: 'n-006',
      type: 'incident',
      title: 'New Incident Filed',
      body: 'Minor playground injury reported. Child scraped knee on outdoor equipment. First aid administered.',
      timestamp: min(45),
      read: false,
      link_to: '/admin/incidents',
    },
    {
      id: 'n-007',
      type: 'hr',
      title: 'Onboarding Checklist Ready',
      body: "Emily Chen's onboarding checklist is ready for your review. Background check cleared.",
      timestamp: hr(2),
      read: false,
      link_to: '/admin/hr',
    },
    {
      id: 'n-008',
      type: 'drift',
      title: 'Drift Alert: Repeated Missed Task',
      body: "'Update Parent Board' has been missed 3 times this week. Consider reassigning or adjusting the schedule.",
      timestamp: hr(1.5),
      read: false,
      link_to: '/admin/tasks',
    },
    {
      id: 'n-009',
      type: 'training',
      title: 'Training Module Due',
      body: "Training module 'Incident Recognition' is due by end of week for all classroom leads.",
      timestamp: hr(3),
      read: true,
      link_to: '/admin/incidents/training',
    },
    {
      id: 'n-010',
      type: 'system',
      title: 'Weekly Backup Completed',
      body: 'Weekly system backup completed successfully. All data files verified.',
      timestamp: hr(4),
      read: true,
      link_to: '/admin/notifications',
    },
    {
      id: 'n-011',
      type: 'task',
      title: 'Task Completed by James Wilson',
      body: "James Wilson marked 'Restock First Aid Kits' as complete.",
      timestamp: hr(5),
      read: true,
      link_to: '/admin/tasks',
    },
    {
      id: 'n-012',
      type: 'meeting',
      title: 'Meeting Notes Available',
      body: 'Notes from the Curriculum Planning session have been posted. Review action items.',
      timestamp: hr(6),
      read: true,
      link_to: '/admin/meetings',
    },
    {
      id: 'n-013',
      type: 'message',
      title: 'Mention in #Toddler Room',
      body: 'Sarah Johnson mentioned you in #Toddler Room regarding the new nap schedule.',
      timestamp: hr(8),
      read: true,
      link_to: '/admin/messaging',
    },
    {
      id: 'n-014',
      type: 'hr',
      title: 'Document Expiring Soon',
      body: "Maria Garcia's CPR certification expires in 14 days. Send a renewal reminder.",
      timestamp: hr(10),
      read: true,
      link_to: '/admin/hr',
    },
    {
      id: 'n-015',
      type: 'incident',
      title: 'Incident Report Updated',
      body: 'Parent signature collected for the playground injury report filed earlier today.',
      timestamp: hr(12),
      read: true,
      link_to: '/admin/incidents',
    },
    {
      id: 'n-016',
      type: 'task',
      title: 'New Recurring Task Created',
      body: "'Daily Health Screening Log' has been added as a recurring morning task.",
      timestamp: hr(18),
      read: true,
      link_to: '/admin/tasks',
    },
    {
      id: 'n-017',
      type: 'system',
      title: 'Licensing Reminder',
      body: 'Annual state licensing renewal is due in 45 days. Begin gathering documentation.',
      timestamp: hr(24),
      read: true,
      link_to: '/admin/compliance',
    },
    {
      id: 'n-018',
      type: 'drift',
      title: 'Drift Alert: Attendance Logging Gap',
      body: 'Afternoon attendance was not logged for the Preschool room on Tuesday and Wednesday.',
      timestamp: hr(28),
      read: true,
      link_to: '/admin/attendance',
    },
    {
      id: 'n-019',
      type: 'meeting',
      title: 'Parent Conference Scheduled',
      body: "Parent conference with the Thompson family is confirmed for Friday at 4:00 PM.",
      timestamp: hr(36),
      read: true,
      link_to: '/admin/meetings',
    },
    {
      id: 'n-020',
      type: 'training',
      title: 'Training Completed',
      body: "David Kim completed the 'Allergy Response Protocol' training module.",
      timestamp: hr(40),
      read: true,
      link_to: '/admin/incidents/training',
    },
  ];
}

const DEFAULT_PREFS: NotificationPrefs = {
  tasks: true,
  messages: true,
  meetings: true,
  incidents: true,
  hr: true,
  push: false,
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'messages', label: 'Messages' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'hr', label: 'HR' },
];

// ─── Main Page Component ────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotifications(JSON.parse(stored) as Notification[]);
    } else {
      const seed = generateSeedNotifications();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      setNotifications(seed);
    }

    const storedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
    if (storedPrefs) {
      setPrefs(JSON.parse(storedPrefs) as NotificationPrefs);
    }
  }, []);

  // Persist notifications
  const persist = useCallback((updated: Notification[]) => {
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Persist preferences
  const persistPrefs = useCallback((updated: NotificationPrefs) => {
    setPrefs(updated);
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Actions
  const markAsRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(updated);
    },
    [notifications, persist]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    persist(updated);
  }, [notifications, persist]);

  const clearAllRead = useCallback(() => {
    const updated = notifications.filter((n) => !n.read);
    persist(updated);
  }, [notifications, persist]);

  // Derived state
  const sortedNotifications = notifications
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredNotifications = sortedNotifications.filter((n) => matchesFilter(n, activeFilter));
  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filterCounts: Record<FilterTab, number> = {
    all: notifications.length,
    unread: unreadCount,
    tasks: notifications.filter((n) => matchesFilter(n, 'tasks')).length,
    messages: notifications.filter((n) => matchesFilter(n, 'messages')).length,
    meetings: notifications.filter((n) => matchesFilter(n, 'meetings')).length,
    incidents: notifications.filter((n) => matchesFilter(n, 'incidents')).length,
    hr: notifications.filter((n) => matchesFilter(n, 'hr')).length,
  };

  return (
    <DashboardLayout isAdmin>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-7 w-7" style={{ color: CHRISTINA_RED }} />
              Notification Center
            </h1>
            <p className="text-base text-gray-500 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up. No unread notifications.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrefs(!showPrefs)}
              className="gap-1.5"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </Button>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPrefs && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <button onClick={() => setShowPrefs(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <PreferenceRow
                label="Task notifications"
                description="Assignments, updates, and overdue alerts"
                checked={prefs.tasks}
                onToggle={(v) => persistPrefs({ ...prefs, tasks: v })}
                icon={<ListTodo className="h-4 w-4" />}
                iconColor="#1565C0"
              />
              <PreferenceRow
                label="Message notifications"
                description="New messages and mentions"
                checked={prefs.messages}
                onToggle={(v) => persistPrefs({ ...prefs, messages: v })}
                icon={<MessageSquare className="h-4 w-4" />}
                iconColor="#2E7D32"
              />
              <PreferenceRow
                label="Meeting reminders"
                description="Upcoming meetings and schedule changes"
                checked={prefs.meetings}
                onToggle={(v) => persistPrefs({ ...prefs, meetings: v })}
                icon={<Calendar className="h-4 w-4" />}
                iconColor="#6A1B9A"
              />
              <PreferenceRow
                label="Incident alerts"
                description="New incidents and report updates"
                checked={prefs.incidents}
                onToggle={(v) => persistPrefs({ ...prefs, incidents: v })}
                icon={<AlertTriangle className="h-4 w-4" />}
                iconColor="#E65100"
              />
              <PreferenceRow
                label="HR document notifications"
                description="Onboarding, certifications, and document status"
                checked={prefs.hr}
                onToggle={(v) => persistPrefs({ ...prefs, hr: v })}
                icon={<UserPlus className="h-4 w-4" />}
                iconColor="#00695C"
              />
              <div className="border-t border-gray-100 pt-4">
                <PreferenceRow
                  label="Push notifications"
                  description="Requires browser permission. Delivers alerts even when the app is in the background."
                  checked={prefs.push}
                  onToggle={(v) => persistPrefs({ ...prefs, push: v })}
                  icon={<Bell className="h-4 w-4" />}
                  iconColor="#546E7A"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => setShowPrefs(false)}
                style={{ backgroundColor: CHRISTINA_RED }}
                className="text-white hover:opacity-90"
              >
                <Check className="h-4 w-4 mr-1" />
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab.key
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={
                activeFilter === tab.key
                  ? { backgroundColor: CHRISTINA_RED }
                  : undefined
              }
            >
              {tab.label}
              {filterCounts[tab.key] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {filterCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5 min-h-[44px]">
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
            {readCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllRead} className="gap-1.5 min-h-[44px]">
                <Trash2 className="h-4 w-4" />
                Clear all read
              </Button>
            )}
          </div>
        )}

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            filteredNotifications.map((n) => {
              const typeInfo = getTypeIcon(n.type);
              const IconComponent = typeInfo.icon;
              const isHovered = hoveredId === n.id;

              return (
                <div
                  key={n.id}
                  className={`group relative bg-white rounded-xl border transition-all ${
                    !n.read
                      ? 'border-blue-200 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Link
                    href={n.link_to}
                    onClick={() => markAsRead(n.id)}
                    className="flex items-start gap-4 p-5"
                  >
                    {/* Type icon */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: typeInfo.bg }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: typeInfo.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        <p
                          className={`${
                            !n.read ? 'text-base font-semibold text-gray-900' : 'text-sm font-medium text-gray-700'
                          }`}
                        >
                          {n.title}
                        </p>
                      </div>
                      <p className="text-base text-gray-500 mt-1 line-clamp-2">{n.body}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {getRelativeTime(n.timestamp)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 capitalize"
                        >
                          {n.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0 mt-2 group-hover:text-gray-500 transition-colors" />
                  </Link>

                  {/* Mark as read button (hover) */}
                  {!n.read && isHovered && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 min-h-[44px] rounded-md bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors z-10"
                    >
                      <Eye className="h-3 w-3" />
                      Mark read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function PreferenceRow({
  label,
  description,
  checked,
  onToggle,
  icon,
  iconColor,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

function EmptyState({ filter }: { filter: FilterTab }) {
  const messages: Record<FilterTab, { icon: React.ReactNode; text: string }> = {
    all: {
      icon: <BellOff className="h-10 w-10 text-gray-300" />,
      text: 'No notifications yet. Activity across the center will show up here.',
    },
    unread: {
      icon: <CheckCheck className="h-10 w-10 text-green-300" />,
      text: 'All caught up. No unread notifications right now.',
    },
    tasks: {
      icon: <ListTodo className="h-10 w-10 text-gray-300" />,
      text: 'No task notifications. Assignments and updates will appear here.',
    },
    messages: {
      icon: <MessageSquare className="h-10 w-10 text-gray-300" />,
      text: 'No message notifications. Channel posts and DMs will show up here.',
    },
    meetings: {
      icon: <Calendar className="h-10 w-10 text-gray-300" />,
      text: 'No meeting notifications. Reminders and schedule changes will appear here.',
    },
    incidents: {
      icon: <AlertTriangle className="h-10 w-10 text-gray-300" />,
      text: 'No incident notifications. Reports and training alerts will appear here.',
    },
    hr: {
      icon: <UserPlus className="h-10 w-10 text-gray-300" />,
      text: 'No HR notifications. Onboarding and document alerts will appear here.',
    },
  };

  const { icon: emptyIcon, text } = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {emptyIcon}
      <p className="text-sm text-gray-500 mt-3 max-w-xs">{text}</p>
    </div>
  );
}
