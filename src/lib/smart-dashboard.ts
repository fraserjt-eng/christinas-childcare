// Smart Dashboard: time-aware data aggregation for Christina's admin home screen
// Reads from localStorage to build alerts, snapshots, and contextual quick actions.

import type { Task } from '@/types/tasks';
import type { Incident } from '@/types/incidents';

// ─── Types ──────────────────────────────────────────────────────────

export type TimeZone = 'opening' | 'core' | 'closing';
export type AlertSeverity = 'urgent' | 'warning' | 'info';
export type AlertType =
  | 'overdue_task'
  | 'food_count'
  | 'missed_meal_count'
  | 'incident'
  | 'message'
  | 'staffing'
  | 'inventory'
  | 'compliance'
  | 'cacfp_compliance'
  | 'drift'
  | 'training';

export interface DashboardAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  linkTo: string;
  zoneRelevance: TimeZone[];
}

export interface TodaySnapshot {
  childrenPresent: number;
  totalEnrolled: number;
  staffOnDuty: number;
  totalStaff: number;
  ratioCompliant: boolean;
  mealsServed: number;
  tasksComplete: number;
  totalTasks: number;
}

export interface QuickAction {
  label: string;
  href: string;
  iconName: string;
  color: string;
}

// ─── Storage Keys ───────────────────────────────────────────────────

const KEYS = {
  tasks: 'christinas_tasks',
  notifications: 'christinas_notifications',
  messages: 'christinas_messages',
  incidents: 'christinas_incidents',
} as const;

// ─── Helpers ────────────────────────────────────────────────────────

function safeParseJSON<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  urgent: 0,
  warning: 1,
  info: 2,
};

function sortBySeverity(a: DashboardAlert, b: DashboardAlert): number {
  return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
}

// ─── getTimeZone ────────────────────────────────────────────────────

export function getTimeZone(): TimeZone {
  const hour = new Date().getHours();

  // Opening: 6 AM to 9 AM
  if (hour >= 6 && hour < 9) return 'opening';
  // Core: 9 AM to 3 PM (15:00)
  if (hour >= 9 && hour < 15) return 'core';
  // Closing: 3 PM to 6 PM (18:00)
  if (hour >= 15 && hour < 18) return 'closing';

  // Outside operating hours: return closest zone
  // Before 6 AM: closest to opening
  if (hour < 6) return 'opening';
  // After 6 PM: closest to closing
  return 'closing';
}

// ─── getGreeting ────────────────────────────────────────────────────

export function getGreeting(name: string): string {
  const hour = new Date().getHours();

  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

// ─── getDashboardAlerts ─────────────────────────────────────────────

interface StoredNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  link_to: string;
}

interface StoredMessage {
  id: string;
  channelId: string | null;
  dmThreadId: string | null;
  senderId: string;
  content: string;
  timestamp: string;
  replyToId: string | null;
  reactions: { emoji: string; users: string[] }[];
  isPinned: boolean;
  readReceipts: { userId: string; readAt: string }[];
}

export function getDashboardAlerts(): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  // ── Tasks: drift alerts and urgent/high tasks ──
  const tasks = safeParseJSON<Task[]>(KEYS.tasks);
  if (tasks) {
    // Drift alerts: tasks with drift_count > 2 that are not done
    const driftTasks = tasks.filter(
      (t) => t.status !== 'done' && t.drift_count > 2
    );
    for (const task of driftTasks) {
      alerts.push({
        id: `drift_${task.id}`,
        type: 'drift',
        severity: 'warning',
        title: `Pattern drift: ${task.title}`,
        description: `Missed standard ${task.drift_count} times. Needs a recovery conversation.`,
        linkTo: '/admin/tasks',
        zoneRelevance: ['core', 'closing'],
      });
    }

    // Urgent or high priority tasks that are in "today" status
    const urgentTasks = tasks.filter(
      (t) =>
        (t.priority === 'urgent' || t.priority === 'high') &&
        t.status === 'today'
    );
    for (const task of urgentTasks) {
      alerts.push({
        id: `task_${task.id}`,
        type: 'overdue_task',
        severity: task.priority === 'urgent' ? 'urgent' : 'warning',
        title: task.title,
        description: task.assigned_to
          ? `Assigned to ${task.assigned_to}, not yet started`
          : 'Not yet started today',
        linkTo: '/admin/tasks',
        zoneRelevance: ['core', 'closing'],
      });
    }
  }

  // ── Notifications: unread count ──
  const notifications = safeParseJSON<StoredNotification[]>(KEYS.notifications);
  if (notifications) {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length > 0) {
      alerts.push({
        id: 'unread_notifications',
        type: 'message',
        severity: unread.length >= 5 ? 'warning' : 'info',
        title: `${unread.length} unread notification${unread.length === 1 ? '' : 's'}`,
        description: 'Tap to review and clear your notification queue.',
        linkTo: '/admin/notifications',
        zoneRelevance: ['opening', 'core', 'closing'],
      });
    }
  }

  // ── Messages: unread by Christina Fraser ──
  const messages = safeParseJSON<StoredMessage[]>(KEYS.messages);
  if (messages) {
    const christinaUserId = 'staff-1'; // Christina Fraser's user ID
    const unreadMessages = messages.filter((m) => {
      // Skip messages Christina sent
      if (m.senderId === christinaUserId) return false;
      // Check if Christina has a read receipt
      return !m.readReceipts.some((rr) => rr.userId === christinaUserId);
    });
    if (unreadMessages.length > 0) {
      alerts.push({
        id: 'unread_messages',
        type: 'message',
        severity: unreadMessages.length >= 10 ? 'warning' : 'info',
        title: `${unreadMessages.length} unread staff message${unreadMessages.length === 1 ? '' : 's'}`,
        description: 'New messages in staff chat channels.',
        linkTo: '/admin/messaging',
        zoneRelevance: ['opening', 'core', 'closing'],
      });
    }
  }

  // ── Meal counts: check for missing counts past deadline ──
  const foodCounts = safeParseJSON<Array<{ date: string; classroom_id: string; meal_type: string; child_count: number }>>(
    'christinas_food_counts'
  );
  if (foodCounts) {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const currentMinutes = hour * 60 + minute;

    // Meal deadlines + 30 min grace period
    const mealChecks = [
      { type: 'breakfast', deadlineMin: 9 * 60 + 30 }, // 9:30 AM (deadline 9:00 + 30 grace)
      { type: 'am_snack', deadlineMin: 11 * 60 }, // 11:00 AM
      { type: 'lunch', deadlineMin: 13 * 60 + 30 }, // 1:30 PM
      { type: 'pm_snack', deadlineMin: 16 * 60 }, // 4:00 PM
    ];

    for (const check of mealChecks) {
      if (currentMinutes >= check.deadlineMin) {
        const todayCounts = foodCounts.filter(
          (c) => c.date === today && c.meal_type === check.type && c.child_count > 0
        );
        if (todayCounts.length === 0) {
          const mealLabels: Record<string, string> = {
            breakfast: 'Breakfast',
            am_snack: 'AM Snack',
            lunch: 'Lunch',
            pm_snack: 'PM Snack',
          };
          alerts.push({
            id: `missed_meal_${check.type}`,
            type: 'missed_meal_count',
            severity: 'urgent',
            title: `Missing ${mealLabels[check.type]} counts`,
            description: `No ${mealLabels[check.type].toLowerCase()} counts submitted today. This affects CACFP reimbursement.`,
            linkTo: '/admin/food-counts',
            zoneRelevance: ['opening', 'core', 'closing'],
          });
        }
      }
    }
  }

  // ── Certification expiry alerts ──
  const certs = safeParseJSON<Array<{ employee_name: string; cert_name: string; expiry_date: string; status: string }>>(
    'christinas_certifications'
  );
  if (certs) {
    const expiring = certs.filter(c => c.status === 'expiring_soon' || c.status === 'expired');
    if (expiring.length > 0) {
      const expired = expiring.filter(c => c.status === 'expired');
      const soonCount = expiring.length - expired.length;
      if (expired.length > 0) {
        alerts.push({
          id: 'certs_expired',
          type: 'training',
          severity: 'urgent',
          title: `${expired.length} expired certification${expired.length !== 1 ? 's' : ''}`,
          description: `${expired.map(c => `${c.employee_name}: ${c.cert_name}`).slice(0, 2).join(', ')}${expired.length > 2 ? ` +${expired.length - 2} more` : ''}`,
          linkTo: '/admin/staff/development',
          zoneRelevance: ['opening', 'core'],
        });
      }
      if (soonCount > 0) {
        alerts.push({
          id: 'certs_expiring',
          type: 'training',
          severity: 'warning',
          title: `${soonCount} certification${soonCount !== 1 ? 's' : ''} expiring soon`,
          description: 'Review staff certifications to avoid compliance gaps.',
          linkTo: '/admin/staff/development',
          zoneRelevance: ['core'],
        });
      }
    }
  }

  // ── Nap time reminder (12:15-12:30 PM) ──
  const napHour = new Date().getHours();
  const napMinute = new Date().getMinutes();
  if (napHour === 12 && napMinute >= 15 && napMinute <= 45) {
    const tasks = safeParseJSON<Task[]>(KEYS.tasks);
    if (tasks) {
      const napTasks = tasks.filter(t => t.is_nap_time_task && t.status !== 'done');
      if (napTasks.length > 0) {
        alerts.push({
          id: 'nap_time_reminder',
          type: 'food_count',
          severity: 'info',
          title: `${napTasks.length} nap time task${napTasks.length !== 1 ? 's' : ''} ready`,
          description: 'Nap time window is starting. Check your task queue.',
          linkTo: '/admin/tasks',
          zoneRelevance: ['core'],
        });
      }
    }
  }

  // ── CACFP compliance: check for incomplete required items ──
  const complianceData = safeParseJSON<Record<string, { checklist: Array<{ required: boolean; completed: boolean }>; audit_score: number }>>(
    'cacfp-compliance'
  );
  if (complianceData) {
    const currentMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
    const monthRecord = complianceData[currentMonth];
    if (monthRecord && monthRecord.audit_score < 70) {
      const missingRequired = monthRecord.checklist.filter(
        (item) => item.required && !item.completed
      ).length;
      if (missingRequired > 0) {
        alerts.push({
          id: 'cacfp_compliance_low',
          type: 'cacfp_compliance',
          severity: monthRecord.audit_score < 50 ? 'urgent' : 'warning',
          title: `CACFP audit readiness: ${monthRecord.audit_score}%`,
          description: `${missingRequired} required compliance item${missingRequired !== 1 ? 's' : ''} incomplete this month.`,
          linkTo: '/admin/food-counts',
          zoneRelevance: ['core', 'closing'],
        });
      }
    }
  }

  // ── Incidents: open or investigating ──
  const incidents = safeParseJSON<Incident[]>(KEYS.incidents);
  if (incidents) {
    const openIncidents = incidents.filter(
      (inc) => inc.status === 'open' || inc.status === 'investigating'
    );
    for (const inc of openIncidents) {
      const isCritical =
        inc.severity === 'critical' || inc.severity === 'serious';
      alerts.push({
        id: `incident_${inc.id}`,
        type: 'incident',
        severity: isCritical ? 'urgent' : 'warning',
        title: `${inc.severity === 'critical' ? 'CRITICAL' : inc.severity === 'serious' ? 'Serious' : 'Open'} incident: ${inc.incident_number}`,
        description: inc.description.length > 80
          ? inc.description.slice(0, 77) + '...'
          : inc.description,
        linkTo: '/admin/incidents',
        zoneRelevance: ['opening', 'core', 'closing'],
      });
    }
  }

  return alerts.sort(sortBySeverity);
}

// ─── getTodaySnapshot ───────────────────────────────────────────────

export function getTodaySnapshot(): TodaySnapshot {
  // Reasonable defaults for when localStorage is empty
  const defaults: TodaySnapshot = {
    childrenPresent: 52,
    totalEnrolled: 65,
    staffOnDuty: 7,
    totalStaff: 8,
    ratioCompliant: true,
    mealsServed: 186,
    tasksComplete: 0,
    totalTasks: 0,
  };

  // Try to compute task stats from localStorage
  const tasks = safeParseJSON<Task[]>(KEYS.tasks);
  if (tasks) {
    const todayTasks = tasks.filter((t) => t.status !== 'backlog');
    defaults.totalTasks = todayTasks.length;
    defaults.tasksComplete = todayTasks.filter(
      (t) => t.status === 'done'
    ).length;
  }

  return defaults;
}

// ─── getQuickActions ────────────────────────────────────────────────

const OPENING_ACTIONS: QuickAction[] = [
  {
    label: 'Check Attendance',
    href: '/admin/attendance',
    iconName: 'ClipboardCheck',
    color: 'bg-blue-600',
  },
  {
    label: 'Food Counts',
    href: '/admin/food-counts',
    iconName: 'UtensilsCrossed',
    color: 'bg-amber-600',
  },
  {
    label: 'Ratio Check',
    href: '/admin/ratios',
    iconName: 'BarChart3',
    color: 'bg-emerald-600',
  },
  {
    label: 'Staff Status',
    href: '/admin/staff',
    iconName: 'Users',
    color: 'bg-purple-600',
  },
];

const CORE_ACTIONS: QuickAction[] = [
  {
    label: 'Task Board',
    href: '/admin/tasks',
    iconName: 'ListTodo',
    color: 'bg-blue-600',
  },
  {
    label: 'Staff Chat',
    href: '/admin/messaging',
    iconName: 'MessageSquare',
    color: 'bg-emerald-600',
  },
  {
    label: 'Incidents',
    href: '/admin/incidents',
    iconName: 'AlertTriangle',
    color: 'bg-red-600',
  },
  {
    label: 'Daily Reports',
    href: '/admin/reports',
    iconName: 'FileText',
    color: 'bg-amber-600',
  },
];

const CLOSING_ACTIONS: QuickAction[] = [
  {
    label: "Today's Tasks",
    href: '/admin/tasks',
    iconName: 'ListTodo',
    color: 'bg-blue-600',
  },
  {
    label: 'Food Counts',
    href: '/admin/food-counts',
    iconName: 'UtensilsCrossed',
    color: 'bg-amber-600',
  },
  {
    label: 'Communications',
    href: '/admin/communications',
    iconName: 'Mail',
    color: 'bg-purple-600',
  },
  {
    label: 'Tomorrow Prep',
    href: '/admin/scheduling',
    iconName: 'CalendarDays',
    color: 'bg-emerald-600',
  },
];

export function getQuickActions(zone: TimeZone): QuickAction[] {
  switch (zone) {
    case 'opening':
      return OPENING_ACTIONS;
    case 'core':
      return CORE_ACTIONS;
    case 'closing':
      return CLOSING_ACTIONS;
  }
}

// ─── Zone Display Helpers ───────────────────────────────────────────

export function getZoneLabel(zone: TimeZone): string {
  switch (zone) {
    case 'opening':
      return 'Opening (6-9 AM)';
    case 'core':
      return 'Core Hours (9 AM-3 PM)';
    case 'closing':
      return 'Closing (3-6 PM)';
  }
}

export function getNextZone(zone: TimeZone): TimeZone | null {
  switch (zone) {
    case 'opening':
      return 'core';
    case 'core':
      return 'closing';
    case 'closing':
      return null;
  }
}

export function getNextZoneLabel(zone: TimeZone): string {
  switch (zone) {
    case 'opening':
      return 'Core Hours';
    case 'core':
      return 'Closing';
    case 'closing':
      return "Tomorrow's Priorities";
  }
}
