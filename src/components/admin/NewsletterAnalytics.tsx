'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Users,
  MailOpen,
  MousePointerClick,
  Smartphone,
  Monitor,
  Trophy,
  Clock,
  RefreshCw,
  BarChart2,
  FlaskConical,
} from 'lucide-react';
import {
  getAnalytics,
  getOpenEvents,
  getClickEvents,
  seedDemoAnalytics,
  type NewsletterAnalytics,
  type NewsletterOpenEvent,
  type NewsletterClickEvent,
} from '@/lib/newsletter-analytics-storage';

// ============================================================================
// Props
// ============================================================================

interface NewsletterAnalyticsProps {
  newsletterId: string;
}

// ============================================================================
// Color palette aligned with christina tokens
// ============================================================================

const CHART_COLORS = [
  '#C62828', // christina-red
  '#2196F3', // christina-blue
  '#4CAF50', // christina-green
  '#FF7043', // christina-coral
  '#FFD54F', // christina-yellow
];

// ============================================================================
// Sub-components
// ============================================================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

function StatCard({ icon: Icon, label, value, subtext, color = 'text-christina-red' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted shrink-0">
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-tight">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Custom tooltip for bar chart
// ============================================================================

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background p-2 text-xs shadow-md">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value} click{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ============================================================================
// Family engagement row
// ============================================================================

interface EngagementRowProps {
  familyId: string;
  openEvent: NewsletterOpenEvent | undefined;
  clickEvents: NewsletterClickEvent[];
}

function EngagementRow({ familyId, openEvent, clickEvents }: EngagementRowProps) {
  const displayName = familyId.startsWith('family-')
    ? `Family ${familyId.replace('family-', '')}`
    : familyId;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        {openEvent && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            Opened {formatTime(openEvent.opened_at)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {openEvent && (
          <Badge
            variant="outline"
            className="text-xs border-christina-green/40 bg-christina-green/10 text-christina-green"
          >
            <MailOpen className="h-3 w-3 mr-1" />
            Opened
          </Badge>
        )}
        {clickEvents.length > 0 && (
          <Badge
            variant="outline"
            className="text-xs border-christina-blue/40 bg-christina-blue/10 text-christina-blue"
          >
            <MousePointerClick className="h-3 w-3 mr-1" />
            {clickEvents.length} click{clickEvents.length !== 1 ? 's' : ''}
          </Badge>
        )}
        {openEvent && (
          <Badge variant="outline" className="text-xs">
            {openEvent.device_type === 'mobile' ? (
              <Smartphone className="h-3 w-3" />
            ) : (
              <Monitor className="h-3 w-3" />
            )}
          </Badge>
        )}
        {!openEvent && !clickEvents.length && (
          <span className="text-xs text-muted-foreground">No engagement</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Empty state
// ============================================================================

function EmptyState({ onSeedDemo }: { onSeedDemo: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BarChart2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <h3 className="font-semibold text-lg mb-1">No data yet</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        Analytics will appear here once families start opening and clicking this newsletter.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onSeedDemo}
        className="flex items-center gap-2"
      >
        <FlaskConical className="h-4 w-4" />
        Load demo data
      </Button>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export function NewsletterAnalytics({ newsletterId }: NewsletterAnalyticsProps) {
  const [analytics, setAnalytics] = useState<NewsletterAnalytics | null>(null);
  const [openEvents, setOpenEvents] = useState<NewsletterOpenEvent[]>([]);
  const [clickEvents, setClickEvents] = useState<NewsletterClickEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const data = getAnalytics(newsletterId);
      const opens = getOpenEvents(newsletterId);
      const clicks = getClickEvents(newsletterId);
      setAnalytics(data);
      setOpenEvents(opens);
      setClickEvents(clicks);
    } finally {
      setLoading(false);
    }
  }, [newsletterId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeedDemo = useCallback(() => {
    seedDemoAnalytics(newsletterId);
    loadData();
  }, [newsletterId, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red" />
      </div>
    );
  }

  const isEmpty =
    !analytics || (analytics.unique_opens === 0 && analytics.total_clicks === 0);

  if (isEmpty) {
    return <EmptyState onSeedDemo={handleSeedDemo} />;
  }

  // Chart data: clicks by section
  const chartData = analytics.top_sections.map((s, i) => ({
    name: s.section_title.length > 16 ? s.section_title.slice(0, 15) + '…' : s.section_title,
    fullName: s.section_title,
    clicks: s.clicks,
    colorIndex: i,
  }));

  // Unique families who engaged (opened or clicked)
  const engagedFamilyIds = Array.from(new Set([
    ...openEvents.map((o) => o.family_id),
    ...clickEvents.map((c) => c.family_id),
  ])).sort();

  const openByFamily = new Map(openEvents.map((o) => [o.family_id, o]));
  const clicksByFamily = new Map<string, NewsletterClickEvent[]>();
  for (const click of clickEvents) {
    const existing = clicksByFamily.get(click.family_id) ?? [];
    clicksByFamily.set(click.family_id, [...existing, click]);
  }

  const totalDevices = analytics.device_breakdown.mobile + analytics.device_breakdown.desktop;
  const mobilePercent =
    totalDevices > 0 ? Math.round((analytics.device_breakdown.mobile / totalDevices) * 100) : 0;
  const desktopPercent = 100 - mobilePercent;

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Newsletter ID: <span className="font-mono text-xs">{newsletterId}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          icon={Users}
          label="Recipients"
          value={analytics.total_recipients}
          color="text-muted-foreground"
        />
        <StatCard
          icon={MailOpen}
          label="Unique Opens"
          value={analytics.unique_opens}
          subtext={`${analytics.open_rate}% open rate`}
          color="text-christina-blue"
        />
        <StatCard
          icon={MousePointerClick}
          label="Total Clicks"
          value={analytics.total_clicks}
          subtext={`${analytics.click_rate}% click rate`}
          color="text-christina-green"
        />
      </div>

      {/* Clicks by section chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-christina-blue" />
              Clicks by Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -24, bottom: 4 }}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[entry.colorIndex % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Device breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Smartphone className="h-4 w-4 text-christina-blue shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Mobile</span>
                    <span className="font-medium">
                      {analytics.device_breakdown.mobile} ({mobilePercent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-christina-blue transition-all"
                      style={{ width: `${mobilePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Monitor className="h-4 w-4 text-christina-green shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Desktop</span>
                    <span className="font-medium">
                      {analytics.device_breakdown.desktop} ({desktopPercent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-christina-green transition-all"
                      style={{ width: `${desktopPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top sections */}
        {analytics.top_sections.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-christina-yellow" />
                Top Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analytics.top_sections.map((section, i) => (
                <div key={section.section_id} className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold w-4 shrink-0"
                    style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                  >
                    #{i + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{section.section_title}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {section.clicks} click{section.clicks !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Family engagement list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Family Engagement
            <Badge variant="secondary" className="ml-auto text-xs">
              {engagedFamilyIds.length} engaged
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {engagedFamilyIds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No engagement recorded yet.
            </p>
          ) : (
            <div>
              {engagedFamilyIds.map((fid) => (
                <EngagementRow
                  key={fid}
                  familyId={fid}
                  openEvent={openByFamily.get(fid)}
                  clickEvents={clicksByFamily.get(fid) ?? []}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
