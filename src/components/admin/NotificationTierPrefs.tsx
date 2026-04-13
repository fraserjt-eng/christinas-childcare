'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Flame, ArrowUp, Clock, Info } from 'lucide-react';
import {
  URGENCY_TIER_LABELS,
  URGENCY_TIER_ORDER,
  type AdminNotificationPrefs,
  type UrgencyTier,
} from '@/types/notifications';
import { getAdminNotificationPrefs, saveAdminNotificationPrefs } from '@/lib/create-notification';

const TIER_META: Record<
  UrgencyTier,
  { icon: React.ReactNode; color: string; description: string }
> = {
  urgent_0_24h: {
    icon: <Flame className="h-4 w-4" />,
    color: 'border-christina-red bg-christina-red/5',
    description: 'Staff call-outs today, ratio alerts, incidents, parent messages, overdue tasks',
  },
  important_24_48h: {
    icon: <ArrowUp className="h-4 w-4" />,
    color: 'border-christina-yellow bg-christina-yellow/10',
    description: 'Time-off requests, scheduled tours, certs expiring soon, cost alerts',
  },
  upcoming_48h_1wk: {
    icon: <Clock className="h-4 w-4" />,
    color: 'border-christina-blue bg-christina-blue/5',
    description: 'Newsletters, meetings, certs expiring this week, payroll approaching',
  },
  informational: {
    icon: <Info className="h-4 w-4" />,
    color: 'border-muted-foreground/30 bg-muted/30',
    description: 'System updates, tips, completed task summaries',
  },
};

export function NotificationTierPrefs() {
  const [prefs, setPrefs] = useState<AdminNotificationPrefs | null>(null);

  useEffect(() => {
    setPrefs(getAdminNotificationPrefs());
  }, []);

  if (!prefs) return null;

  function toggle(tier: UrgencyTier, channel: 'text' | 'email' | 'in_app', value: boolean) {
    if (!prefs) return;
    const next: AdminNotificationPrefs = {
      ...prefs,
      tiers: {
        ...prefs.tiers,
        [tier]: { ...prefs.tiers[tier], [channel]: value },
      },
    };
    setPrefs(next);
    saveAdminNotificationPrefs(next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Urgency Tiers</CardTitle>
        <CardDescription>
          Route notifications by urgency. Urgent items always deliver — quiet hours only apply to
          lower tiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {URGENCY_TIER_ORDER.map((tier) => {
          const meta = TIER_META[tier];
          const tierPrefs = prefs.tiers[tier];
          return (
            <div key={tier} className={`rounded-lg border-2 p-4 ${meta.color}`}>
              <div className="flex items-center gap-2 mb-1">
                {meta.icon}
                <h3 className="font-semibold">{URGENCY_TIER_LABELS[tier]}</h3>
                {tier === 'urgent_0_24h' && (
                  <Badge variant="destructive" className="text-xs">
                    Always delivers
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{meta.description}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm" htmlFor={`${tier}-text`}>
                    Text
                  </Label>
                  <Switch
                    id={`${tier}-text`}
                    checked={tierPrefs.text}
                    onCheckedChange={(v) => toggle(tier, 'text', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm" htmlFor={`${tier}-email`}>
                    Email
                  </Label>
                  <Switch
                    id={`${tier}-email`}
                    checked={tierPrefs.email}
                    onCheckedChange={(v) => toggle(tier, 'email', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm" htmlFor={`${tier}-inapp`}>
                    In-app
                  </Label>
                  <Switch
                    id={`${tier}-inapp`}
                    checked={tierPrefs.in_app}
                    onCheckedChange={(v) => toggle(tier, 'in_app', v)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
