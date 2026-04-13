import type {
  NotificationType,
  UrgencyTier,
  AdminNotificationPrefs,
  TierDeliveryPrefs,
} from '@/types/notifications';

// Map notification types to default urgency tier.
const TYPE_TO_TIER: Record<NotificationType, UrgencyTier> = {
  task_assigned: 'important_24_48h',
  task_updated: 'informational',
  task_overdue: 'urgent_0_24h',
  message: 'important_24_48h',
  dm: 'urgent_0_24h',
  mention: 'important_24_48h',
  meeting_reminder: 'upcoming_48h_1wk',
  incident_filed: 'urgent_0_24h',
  training_due: 'upcoming_48h_1wk',
  hr_document: 'upcoming_48h_1wk',
  drift_alert: 'urgent_0_24h',
  system: 'informational',
};

export function getTierForEvent(
  type: NotificationType,
  metadata?: { dueAt?: string; severity?: 'low' | 'medium' | 'high' | 'critical' }
): UrgencyTier {
  // Severity override
  if (metadata?.severity === 'critical' || metadata?.severity === 'high') {
    return 'urgent_0_24h';
  }
  // Due date override
  if (metadata?.dueAt) {
    const due = new Date(metadata.dueAt).getTime();
    const now = Date.now();
    const hours = (due - now) / (1000 * 60 * 60);
    if (hours <= 24) return 'urgent_0_24h';
    if (hours <= 48) return 'important_24_48h';
    if (hours <= 24 * 7) return 'upcoming_48h_1wk';
    return 'informational';
  }
  return TYPE_TO_TIER[type] ?? 'informational';
}

export interface DeliveryDecision {
  text: boolean;
  email: boolean;
  in_app: boolean;
  reason?: string;
}

function isInQuietHours(prefs: AdminNotificationPrefs, now: Date = new Date()): boolean {
  if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) return false;
  const [sh, sm] = prefs.quiet_hours_start.split(':').map(Number);
  const [eh, em] = prefs.quiet_hours_end.split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (startMin < endMin) {
    return nowMin >= startMin && nowMin < endMin;
  }
  // Crosses midnight
  return nowMin >= startMin || nowMin < endMin;
}

export function getNotificationDeliveryChannels(
  tier: UrgencyTier,
  prefs: AdminNotificationPrefs,
  now: Date = new Date()
): DeliveryDecision {
  const tierPrefs: TierDeliveryPrefs = prefs.tiers[tier];
  // Urgent always delivers regardless of quiet hours
  if (tier === 'urgent_0_24h') {
    return { ...tierPrefs, reason: 'urgent override' };
  }
  if (isInQuietHours(prefs, now)) {
    return {
      text: false,
      email: false,
      in_app: tierPrefs.in_app,
      reason: 'quiet hours',
    };
  }
  return { ...tierPrefs };
}
