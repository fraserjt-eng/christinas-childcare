// App Notification types and configuration

export type NotificationType =
  | 'task_assigned'
  | 'task_updated'
  | 'task_overdue'
  | 'message'
  | 'dm'
  | 'mention'
  | 'meeting_reminder'
  | 'incident_filed'
  | 'training_due'
  | 'hr_document'
  | 'drift_alert'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link_to?: string;
  sender_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  task_notifications: boolean;
  message_notifications: boolean;
  meeting_reminders: boolean;
  incident_alerts: boolean;
  hr_notifications: boolean;
  push_enabled: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  task_notifications: true,
  message_notifications: true,
  meeting_reminders: true,
  incident_alerts: true,
  hr_notifications: true,
  push_enabled: false,
};

let notificationIdCounter = 0;
export function generateNotificationId(): string {
  return `notif_${Date.now()}_${++notificationIdCounter}`;
}

export interface NotificationTypeConfig {
  label: string;
  icon_name: string;
  color: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  task_assigned: {
    label: 'Task Assigned',
    icon_name: 'ClipboardList',
    color: '#2196F3', // blue
  },
  task_updated: {
    label: 'Task Updated',
    icon_name: 'RefreshCw',
    color: '#4CAF50', // green
  },
  task_overdue: {
    label: 'Task Overdue',
    icon_name: 'AlertTriangle',
    color: '#F44336', // red
  },
  message: {
    label: 'Channel Message',
    icon_name: 'MessageSquare',
    color: '#2196F3', // blue
  },
  dm: {
    label: 'Direct Message',
    icon_name: 'Mail',
    color: '#2196F3', // blue
  },
  mention: {
    label: 'Mention',
    icon_name: 'AtSign',
    color: '#FF9800', // orange
  },
  meeting_reminder: {
    label: 'Meeting Reminder',
    icon_name: 'Calendar',
    color: '#9C27B0', // purple
  },
  incident_filed: {
    label: 'Incident Filed',
    icon_name: 'AlertCircle',
    color: '#F44336', // red
  },
  training_due: {
    label: 'Training Due',
    icon_name: 'GraduationCap',
    color: '#FF9800', // orange
  },
  hr_document: {
    label: 'HR Document',
    icon_name: 'FileText',
    color: '#607D8B', // gray
  },
  drift_alert: {
    label: 'Drift Alert',
    icon_name: 'TrendingDown',
    color: '#F44336', // red
  },
  system: {
    label: 'System',
    icon_name: 'Info',
    color: '#607D8B', // gray
  },
};
