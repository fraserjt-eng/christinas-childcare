'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Download,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bell,
  Mail,
  MessageSquare,
  Printer,
} from 'lucide-react';
import {
  distributeSchedule,
  getDistributionHistory,
  getLatestDistribution,
  type ScheduleDistribution,
} from '@/lib/schedule-distribution';
import { generateWeeklySchedulePdf } from '@/lib/schedule-pdf';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(offset: number): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diff + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatWeekRange(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const start = monday.toLocaleDateString('en-US', opts);
  const end = friday.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${start} – ${end}`;
}

function formatDistributedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatWeekShort(weekStart: string): string {
  const monday = new Date(weekStart + 'T12:00:00');
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-US', opts)} – ${friday.toLocaleDateString('en-US', opts)}`;
}

type Channel = 'in_app' | 'email' | 'sms' | 'print';

const CHANNEL_CONFIG: Array<{
  id: Channel;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  alwaysOn?: boolean;
}> = [
  {
    id: 'in_app',
    label: 'In-App Notification',
    description: 'Publish to the staff portal — all employees see it immediately.',
    icon: Bell,
    alwaysOn: true,
  },
  {
    id: 'email',
    label: 'Email',
    description: "Send schedule summary to each staff member's email address.",
    icon: Mail,
  },
  {
    id: 'sms',
    label: 'SMS',
    description: "Text a shift reminder to each staff member's phone.",
    icon: MessageSquare,
  },
  {
    id: 'print',
    label: 'Print / PDF',
    description: 'Generate a printable PDF that downloads to your device.',
    icon: Printer,
  },
];

function channelBadgeColor(ch: Channel): string {
  const map: Record<Channel, string> = {
    in_app: 'bg-blue-100 text-blue-700 border-blue-200',
    email: 'bg-green-100 text-green-700 border-green-200',
    sms: 'bg-purple-100 text-purple-700 border-purple-200',
    print: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return map[ch];
}

const CHANNEL_LABELS: Record<Channel, string> = {
  in_app: 'In-App',
  email: 'Email',
  sms: 'SMS',
  print: 'Print',
};

// ─── Distribution History Item ────────────────────────────────────────────────

interface HistoryItemProps {
  dist: ScheduleDistribution;
  onResend: (dist: ScheduleDistribution) => void;
  isResending: boolean;
}

function HistoryItem({ dist, onResend, isResending }: HistoryItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{formatWeekShort(dist.week_start)}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Published {formatDistributedAt(dist.distributed_at)} by {dist.distributed_by}
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {dist.channels.map(ch => (
            <span
              key={ch}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${channelBadgeColor(ch)}`}
            >
              {CHANNEL_LABELS[ch]}
            </span>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onResend(dist)}
        disabled={isResending}
        className="flex-shrink-0 gap-1.5 text-xs h-8"
      >
        <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
        Re-send
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScheduleDistributionPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedChannels, setSelectedChannels] = useState<Set<Channel>>(new Set<Channel>(['in_app']));
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ScheduleDistribution[]>([]);
  const [latestDist, setLatestDist] = useState<ScheduleDistribution | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const monday = getMondayOfWeek(weekOffset);
  const weekStart = monday.toISOString().slice(0, 10);

  const loadData = useCallback(() => {
    setHistory(getDistributionHistory());
    setLatestDist(getLatestDistribution(weekStart));
  }, [weekStart]);

  useEffect(() => {
    if (mounted) loadData();
  }, [mounted, loadData]);

  const toggleChannel = (ch: Channel) => {
    if (ch === 'in_app') return; // always on
    setSelectedChannels(prev => {
      const next = new Set(prev);
      if (next.has(ch)) {
        next.delete(ch);
      } else {
        next.add(ch);
      }
      return next;
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setSuccessMessage(null);
    try {
      if (selectedChannels.has('print')) {
        await generateWeeklySchedulePdf(weekStart);
      }
      const channels = Array.from(selectedChannels);
      await distributeSchedule(weekStart, channels, 'Christina Fraser');
      setSuccessMessage(`Schedule published at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);
      loadData();
    } catch (err) {
      console.error('Publish failed:', err);
      setSuccessMessage('Something went wrong. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await generateWeeklySchedulePdf(weekStart);
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResend = async (dist: ScheduleDistribution) => {
    setResendingId(dist.id);
    try {
      if (dist.channels.includes('print')) {
        await generateWeeklySchedulePdf(dist.week_start);
      }
      await distributeSchedule(dist.week_start, dist.channels, 'Christina Fraser');
      loadData();
    } catch (err) {
      console.error('Re-send failed:', err);
    } finally {
      setResendingId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christina-red" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Publish Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading text-christina-red flex items-center gap-2">
            <Send className="h-5 w-5" />
            Publish &amp; Send Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Week Selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Week</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => { setWeekOffset(w => w - 1); setSuccessMessage(null); }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-gray-800 text-sm min-w-[220px] text-center">
                {formatWeekRange(monday)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => { setWeekOffset(w => w + 1); setSuccessMessage(null); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 ml-1"
                onClick={() => { setWeekOffset(0); setSuccessMessage(null); }}
              >
                This Week
              </Button>
            </div>
            {latestDist && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Last published {formatDistributedAt(latestDist.distributed_at)}
              </p>
            )}
          </div>

          <Separator />

          {/* Channel Selection */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Distribution Channels</p>
            <div className="space-y-3">
              {CHANNEL_CONFIG.map(ch => {
                const isChecked = selectedChannels.has(ch.id);
                const isDisabled = ch.alwaysOn;
                const Icon = ch.icon;
                return (
                  <div key={ch.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`ch-${ch.id}`}
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleChannel(ch.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`ch-${ch.id}`}
                        className={`flex items-center gap-2 text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}
                      >
                        <Icon className="h-4 w-4" />
                        {ch.label}
                        {isDisabled && (
                          <span className="text-xs font-normal text-gray-400">(always on)</span>
                        )}
                      </Label>
                      <p className="text-xs text-gray-400 mt-0.5">{ch.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1 bg-christina-red hover:bg-christina-red/90 text-white gap-2"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publish Schedule
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>

          {/* Success / Error Message */}
          {successMessage && (
            <div className={`
              flex items-center gap-2 text-sm px-3 py-2 rounded-lg border
              ${successMessage.includes('wrong')
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
              }
            `}>
              {successMessage.includes('wrong') ? (
                <Clock className="h-4 w-4 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{successMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Publication History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No schedules published yet. Publish your first schedule above.
            </p>
          ) : (
            <div>
              {history.slice(0, 10).map(dist => (
                <HistoryItem
                  key={dist.id}
                  dist={dist}
                  onResend={handleResend}
                  isResending={resendingId === dist.id}
                />
              ))}
              {history.length > 10 && (
                <p className="text-xs text-gray-400 text-center pt-3">
                  Showing 10 of {history.length} publications
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
