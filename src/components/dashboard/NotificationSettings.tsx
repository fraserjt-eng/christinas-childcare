'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Smartphone,
  Phone,
  Clock,
  Save,
  CheckCircle2,
  Newspaper,
  Megaphone,
  AlertTriangle,
  DoorClosed,
  Receipt,
  Camera,
  Zap,
  CalendarClock,
  CalendarDays,
} from 'lucide-react';
import {
  getPreferences,
  savePreferences,
  type NotificationPreferences,
  type NotificationFrequency,
} from '@/lib/notification-prefs-storage';

const DEMO_FAMILY_ID = 'demo-family-1';

// ============================================================================
// Types and constants
// ============================================================================

interface CategoryConfig {
  key: keyof NotificationPreferences['categories'];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'newsletters',
    label: 'Weekly Newsletters',
    description: 'Classroom updates and learning highlights',
    icon: Newspaper,
  },
  {
    key: 'announcements',
    label: 'Announcements',
    description: 'Center-wide news and upcoming events',
    icon: Megaphone,
  },
  {
    key: 'incidents',
    label: 'Incident Reports',
    description: 'Injuries, illness notifications, and incident forms',
    icon: AlertTriangle,
  },
  {
    key: 'closures',
    label: 'Closures and Delays',
    description: 'Snow days, emergency closures, schedule changes',
    icon: DoorClosed,
  },
  {
    key: 'billing',
    label: 'Billing and Invoices',
    description: 'Payment reminders, receipts, and balance notices',
    icon: Receipt,
  },
  {
    key: 'photos',
    label: 'Photo Updates',
    description: 'Daily photos and videos from the classroom',
    icon: Camera,
  },
];

interface FrequencyOption {
  value: NotificationFrequency;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'immediate',
    label: 'Immediate',
    description: 'Notify as soon as something is sent',
    icon: Zap,
  },
  {
    value: 'daily_digest',
    label: 'Daily Digest',
    description: 'One summary each morning',
    icon: CalendarClock,
  },
  {
    value: 'weekly',
    label: 'Weekly Summary',
    description: 'One roundup every Friday afternoon',
    icon: CalendarDays,
  },
];

// ============================================================================
// Sub-components
// ============================================================================

interface ChannelCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  contactLabel: string;
  contactPlaceholder: string;
  contactValue: string;
  onContactChange: (value: string) => void;
  inputType?: string;
}

function ChannelCard({
  icon: Icon,
  label,
  enabled,
  onToggle,
  contactLabel,
  contactPlaceholder,
  contactValue,
  onContactChange,
  inputType = 'text',
}: ChannelCardProps) {
  return (
    <Card className={`transition-all ${enabled ? 'border-christina-blue/30 shadow-sm' : 'opacity-75'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-christina-blue/10' : 'bg-muted'}`}>
              <Icon className={`h-4 w-4 ${enabled ? 'text-christina-blue' : 'text-muted-foreground'}`} />
            </div>
            <span className="font-medium text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                enabled
                  ? 'border-christina-green/40 bg-christina-green/10 text-christina-green text-xs'
                  : 'border-muted bg-muted/50 text-muted-foreground text-xs'
              }
            >
              {enabled ? 'Active' : 'Inactive'}
            </Badge>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label={`Toggle ${label} notifications`}
            />
          </div>
        </div>

        {enabled && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor={`channel-${label}`} className="text-xs text-muted-foreground">
              {contactLabel}
            </Label>
            <Input
              id={`channel-${label}`}
              type={inputType}
              placeholder={contactPlaceholder}
              value={contactValue}
              onChange={(e) => onContactChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main component
// ============================================================================

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(getPreferences(DEMO_FAMILY_ID));
  }, []);

  const handleSave = useCallback(() => {
    if (!prefs) return;
    setSaving(true);
    try {
      savePreferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [prefs]);

  const updateChannel = useCallback(
    <K extends keyof NotificationPreferences['channels']>(
      channel: K,
      updates: Partial<NotificationPreferences['channels'][K]>
    ) => {
      setPrefs((prev) =>
        prev
          ? {
              ...prev,
              channels: {
                ...prev.channels,
                [channel]: { ...prev.channels[channel], ...updates },
              },
            }
          : prev
      );
    },
    []
  );

  const updateCategory = useCallback(
    (key: keyof NotificationPreferences['categories'], value: boolean) => {
      setPrefs((prev) =>
        prev ? { ...prev, categories: { ...prev.categories, [key]: value } } : prev
      );
    },
    []
  );

  const updateFrequency = useCallback((freq: NotificationFrequency) => {
    setPrefs((prev) => (prev ? { ...prev, frequency: freq } : prev));
  }, []);

  const updateQuietHours = useCallback(
    (field: 'start' | 'end', value: string) => {
      setPrefs((prev) =>
        prev ? { ...prev, quiet_hours: { ...prev.quiet_hours, [field]: value } } : prev
      );
    },
    []
  );

  if (!prefs) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Channels */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Notification Channels</h2>
          <p className="text-sm text-muted-foreground">
            Choose where you want to receive messages from the center.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
          <ChannelCard
            icon={Mail}
            label="Email"
            enabled={prefs.channels.email.enabled}
            onToggle={(v) => updateChannel('email', { enabled: v })}
            contactLabel="Email address"
            contactPlaceholder="you@example.com"
            contactValue={prefs.channels.email.address}
            onContactChange={(v) => updateChannel('email', { address: v })}
            inputType="email"
          />
          <ChannelCard
            icon={Smartphone}
            label="Text (SMS)"
            enabled={prefs.channels.sms.enabled}
            onToggle={(v) => updateChannel('sms', { enabled: v })}
            contactLabel="Mobile number"
            contactPlaceholder="(555) 555-5555"
            contactValue={prefs.channels.sms.phone}
            onContactChange={(v) => updateChannel('sms', { phone: v })}
            inputType="tel"
          />
          <ChannelCard
            icon={Phone}
            label="Phone Call"
            enabled={prefs.channels.call.enabled}
            onToggle={(v) => updateChannel('call', { enabled: v })}
            contactLabel="Phone number"
            contactPlaceholder="(555) 555-5555"
            contactValue={prefs.channels.call.phone}
            onContactChange={(v) => updateChannel('call', { phone: v })}
            inputType="tel"
          />
        </div>
      </section>

      <Separator />

      {/* Frequency */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Delivery Frequency</h2>
          <p className="text-sm text-muted-foreground">
            How often would you like to receive non-urgent messages?
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {FREQUENCY_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const active = prefs.frequency === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateFrequency(value)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  active
                    ? 'border-christina-red bg-christina-red/5 shadow-sm'
                    : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`h-4 w-4 ${active ? 'text-christina-red' : 'text-muted-foreground'}`}
                  />
                  <span className={`text-sm font-medium ${active ? 'text-christina-red' : ''}`}>
                    {label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Categories */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Message Categories</h2>
          <p className="text-sm text-muted-foreground">
            Select which types of messages you want to receive. Incidents and closures are always
            sent regardless of frequency settings.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map(({ key, label, description, icon: Icon }) => {
            const checked = prefs.categories[key];
            const isAlwaysOn = key === 'incidents' || key === 'closures';
            return (
              <label
                key={key}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                  checked
                    ? 'border-christina-green/30 bg-christina-green/5'
                    : 'border-border hover:bg-muted/30'
                } ${isAlwaysOn ? 'opacity-80' : ''}`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => !isAlwaysOn && updateCategory(key, v === true)}
                  disabled={isAlwaysOn}
                  className="mt-0.5"
                  aria-label={label}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                    {isAlwaysOn && (
                      <Badge variant="outline" className="text-xs h-4 px-1 py-0 ml-1">
                        Always on
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Quiet hours */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quiet Hours
          </h2>
          <p className="text-sm text-muted-foreground">
            No non-urgent messages will be sent during these hours. Emergency alerts always go
            through.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <Label htmlFor="quiet-start" className="text-xs text-muted-foreground">
              Start
            </Label>
            <Input
              id="quiet-start"
              type="time"
              value={prefs.quiet_hours.start}
              onChange={(e) => updateQuietHours('start', e.target.value)}
              className="w-32 h-8 text-sm"
            />
          </div>
          <span className="text-muted-foreground text-sm mt-4">to</span>
          <div className="space-y-1">
            <Label htmlFor="quiet-end" className="text-xs text-muted-foreground">
              End
            </Label>
            <Input
              id="quiet-end"
              type="time"
              value={prefs.quiet_hours.end}
              onChange={(e) => updateQuietHours('end', e.target.value)}
              className="w-32 h-8 text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Currently set: {prefs.quiet_hours.start} to {prefs.quiet_hours.end}
        </p>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-christina-red hover:bg-christina-red/90 text-white"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </span>
          )}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-christina-green font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
