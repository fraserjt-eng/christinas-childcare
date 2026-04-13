import type {
  AppNotification,
  NotificationType,
  AdminNotificationPrefs,
  UrgencyTier,
} from '@/types/notifications';
import { generateNotificationId, DEFAULT_ADMIN_NOTIFICATION_PREFS } from '@/types/notifications';
import { getTierForEvent, getNotificationDeliveryChannels } from './notification-tiers';

const STORAGE_KEY = 'christinas_admin_notifications';
const PREFS_KEY = 'christinas_admin_notification_prefs';
const QUEUE_KEY = 'christinas_notification_delivery_queue';

export interface NotificationMetadata {
  dueAt?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  link_to?: string;
  sender_name?: string;
}

export interface DeliveryQueueEntry {
  id: string;
  notification_id: string;
  channel: 'text' | 'email';
  tier: UrgencyTier;
  recipient_hint: string;
  payload: { title: string; body: string };
  status: 'queued' | 'sent' | 'failed';
  queued_at: string;
}

function readList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to persist', key, err);
  }
}

export function getAdminNotificationPrefs(): AdminNotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_NOTIFICATION_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_ADMIN_NOTIFICATION_PREFS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADMIN_NOTIFICATION_PREFS,
      ...parsed,
      tiers: { ...DEFAULT_ADMIN_NOTIFICATION_PREFS.tiers, ...(parsed.tiers || {}) },
    };
  } catch {
    return DEFAULT_ADMIN_NOTIFICATION_PREFS;
  }
}

export function saveAdminNotificationPrefs(prefs: AdminNotificationPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  metadata?: NotificationMetadata;
}

export function createNotification(input: CreateNotificationInput): AppNotification {
  const { type, title, body, metadata } = input;
  const tier = getTierForEvent(type, metadata);
  const prefs = getAdminNotificationPrefs();
  const delivery = getNotificationDeliveryChannels(tier, prefs);

  const notification: AppNotification = {
    id: generateNotificationId(),
    type,
    title,
    body,
    link_to: metadata?.link_to,
    sender_name: metadata?.sender_name,
    is_read: false,
    created_at: new Date().toISOString(),
    urgency_tier: tier,
  };

  if (delivery.in_app) {
    const list = readList<AppNotification>(STORAGE_KEY);
    list.unshift(notification);
    writeList(STORAGE_KEY, list.slice(0, 500));
  }

  const queueEntries: DeliveryQueueEntry[] = [];
  if (delivery.text) {
    queueEntries.push({
      id: `dq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      notification_id: notification.id,
      channel: 'text',
      tier,
      recipient_hint: 'admin',
      payload: { title, body },
      status: 'queued',
      queued_at: new Date().toISOString(),
    });
  }
  if (delivery.email) {
    queueEntries.push({
      id: `dq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      notification_id: notification.id,
      channel: 'email',
      tier,
      recipient_hint: 'admin',
      payload: { title, body },
      status: 'queued',
      queued_at: new Date().toISOString(),
    });
  }
  if (queueEntries.length > 0) {
    const queue = readList<DeliveryQueueEntry>(QUEUE_KEY);
    queue.push(...queueEntries);
    writeList(QUEUE_KEY, queue.slice(-500));
  }

  return notification;
}

export function getStoredAdminNotifications(): AppNotification[] {
  return readList<AppNotification>(STORAGE_KEY);
}

export function markNotificationRead(id: string): void {
  const list = readList<AppNotification>(STORAGE_KEY);
  const next = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
  writeList(STORAGE_KEY, next);
}

export function getDeliveryQueue(): DeliveryQueueEntry[] {
  return readList<DeliveryQueueEntry>(QUEUE_KEY);
}
