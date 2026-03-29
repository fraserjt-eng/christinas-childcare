'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import {
  Baby,
  Users,
  CheckCircle2,
  ListTodo,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  UtensilsCrossed,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  FileText,
  Mail,
  CalendarDays,
  ShieldCheck,
  Circle,
} from 'lucide-react';
import {
  getTimeZone,
  getGreeting,
  getDashboardAlerts,
  getTodaySnapshot,
  getQuickActions,
  getZoneLabel,
  getNextZone,
  getNextZoneLabel,
  type TimeZone,
  type DashboardAlert,
  type TodaySnapshot,
  type QuickAction,
  type AlertSeverity,
} from '@/lib/smart-dashboard';
import {
  requestNotificationPermission,
  showNotification,
} from '@/lib/push-notifications';

// ─── Icon Resolver ──────────────────────────────────────────────────
// Maps iconName strings from QuickAction to actual Lucide components.

type IconComponent = React.ComponentType<{ className?: string }>;

const ICON_MAP: Record<string, IconComponent> = {
  ClipboardCheck,
  UtensilsCrossed,
  BarChart3,
  Users,
  ListTodo,
  MessageSquare,
  AlertTriangle,
  FileText,
  Mail,
  CalendarDays,
};

function resolveIcon(name: string): IconComponent {
  return ICON_MAP[name] || Circle;
}

// ─── Severity Styles ────────────────────────────────────────────────

function severityDotColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'urgent':
      return 'bg-red-500';
    case 'warning':
      return 'bg-amber-500';
    case 'info':
      return 'bg-blue-500';
  }
}

function severityBgColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'urgent':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
  }
}

function severityIconBg(severity: AlertSeverity): string {
  switch (severity) {
    case 'urgent':
      return 'bg-red-100 text-red-600';
    case 'warning':
      return 'bg-amber-100 text-amber-600';
    case 'info':
      return 'bg-blue-100 text-blue-600';
  }
}

// ─── Date Formatting ────────────────────────────────────────────────

function formatTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Alert Icon ─────────────────────────────────────────────────────

function alertIcon(alert: DashboardAlert): IconComponent {
  switch (alert.type) {
    case 'overdue_task':
    case 'drift':
      return ListTodo;
    case 'incident':
      return AlertTriangle;
    case 'message':
      return MessageSquare;
    case 'food_count':
      return UtensilsCrossed;
    case 'staffing':
      return Users;
    case 'compliance':
      return ShieldCheck;
    default:
      return Circle;
  }
}

// ─── Alert Card ─────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: DashboardAlert }) {
  const Icon = alertIcon(alert);

  return (
    <Link
      href={alert.linkTo}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-[0.98] ${severityBgColor(alert.severity)}`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${severityIconBg(alert.severity)}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {alert.title}
        </p>
        <p className="text-xs text-gray-600 line-clamp-1">
          {alert.description}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </Link>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────

interface StatCardProps {
  icon: IconComponent;
  iconColor: string;
  value: string;
  label: string;
  subtitle: string;
  accentClass?: string;
}

function StatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  subtitle,
  accentClass,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border p-5 flex flex-col items-center text-center gap-2">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColor}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <p className={`text-3xl font-bold ${accentClass || 'text-gray-900'}`}>
        {value}
      </p>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

// ─── Quick Action Button ────────────────────────────────────────────

function QuickActionButton({ action }: { action: QuickAction }) {
  const Icon = resolveIcon(action.iconName);

  return (
    <Link
      href={action.href}
      className={`${action.color} text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90 min-h-[90px]`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-semibold text-center leading-tight">
        {action.label}
      </span>
    </Link>
  );
}

// ─── Coming Up Section ──────────────────────────────────────────────

function ComingUpSection({
  currentZone,
  allAlerts,
}: {
  currentZone: TimeZone;
  allAlerts: DashboardAlert[];
}) {
  const [expanded, setExpanded] = useState(false);
  const nextZone = getNextZone(currentZone);
  const nextLabel = getNextZoneLabel(currentZone);

  // Filter alerts relevant to next zone, or show all for "Tomorrow"
  const nextAlerts = useMemo(() => {
    if (!nextZone) {
      // Closing zone: show all alerts as tomorrow's priorities
      return allAlerts.slice(0, 5);
    }
    return allAlerts
      .filter((a) => a.zoneRelevance.includes(nextZone))
      .slice(0, 5);
  }, [nextZone, allAlerts]);

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            Next: {nextLabel}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            expanded ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {nextAlerts.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">
              Nothing flagged yet. Looking clear.
            </p>
          ) : (
            nextAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 opacity-60"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDotColor(alert.severity)}`}
                />
                <p className="text-xs text-gray-600 truncate">{alert.title}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [zone, setZone] = useState<TimeZone>('core');
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [snapshot, setSnapshot] = useState<TodaySnapshot>({
    childrenPresent: 52,
    totalEnrolled: 65,
    staffOnDuty: 7,
    totalStaff: 8,
    ratioCompliant: true,
    mealsServed: 186,
    tasksComplete: 0,
    totalTasks: 0,
  });
  const [actions, setActions] = useState<QuickAction[]>([]);

  useEffect(() => {
    const currentZone = getTimeZone();
    setZone(currentZone);
    setAlerts(getDashboardAlerts());
    setSnapshot(getTodaySnapshot());
    setActions(getQuickActions(currentZone));

    // Request browser notification permission so Christina receives
    // push alerts when new enrollment inquiries arrive.
    requestNotificationPermission().then((granted) => {
      if (!granted) return;

      // Check localStorage for new inquiries submitted today
      try {
        const today = new Date().toISOString().split('T')[0];
        const raw = localStorage.getItem('christinas_inquiries');
        if (!raw) return;
        const inquiries: Array<{
          status: string;
          created_at: string;
          parent_name?: string;
          parentName?: string;
          program?: string;
        }> = JSON.parse(raw);

        const newToday = inquiries.filter((inq) => {
          const isNew = inq.status === 'new';
          const createdToday = (inq.created_at || '').startsWith(today);
          return isNew && createdToday;
        });

        if (newToday.length > 0) {
          const first = newToday[0];
          const parentName = first.parent_name || first.parentName || 'A parent';
          const program = first.program || 'a program';
          showNotification(
            `New Enrollment Inquiry (${newToday.length})`,
            `${parentName} is asking about ${program}`,
            '/admin/inquiries'
          );
        }
      } catch {
        // localStorage read failure must not crash the dashboard
      }
    });
  }, []);

  // Filter alerts by current zone
  const zoneAlerts = useMemo(
    () => alerts.filter((a) => a.zoneRelevance.includes(zone)),
    [alerts, zone]
  );

  const displayAlerts = zoneAlerts.slice(0, 5);
  const hasMore = zoneAlerts.length > 5;
  const attentionCount = zoneAlerts.length;

  const greeting = getGreeting('Christina');

  // Backup reminder: check when the last snapshot was taken
  const backupDaysAgo = (() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('christinas_last_snapshot');
    if (!raw) return null;
    const last = new Date(raw);
    if (isNaN(last.getTime())) return null;
    return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
  })();
  const showBackupBanner = backupDaysAgo === null || backupDaysAgo > 3;

  return (
    <DashboardLayout isAdmin>
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        {/* ── Greeting Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {greeting}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{formatTodayDate()}</p>
          </div>
          <Badge
            variant="outline"
            className="gap-1.5 text-emerald-700 border-emerald-300 bg-emerald-50 px-3 py-1.5 flex-shrink-0"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Center Open
          </Badge>
        </div>

        {/* ── Backup Reminder ── */}
        {showBackupBanner && (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Weekly backup is due.</p>
              <p className="text-xs text-gray-600">
                {backupDaysAgo === null
                  ? 'Your last backup was never recorded.'
                  : `Your last backup was ${backupDaysAgo} day${backupDaysAgo === 1 ? '' : 's'} ago.`}
              </p>
            </div>
            <Link
              href="/admin/settings/backup"
              className="flex-shrink-0 text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap"
            >
              Back Up Now
            </Link>
          </div>
        )}

        {/* ── Attention Now ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            {attentionCount > 0 ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <h2 className="text-base font-semibold text-gray-900">
                  {attentionCount} item{attentionCount === 1 ? '' : 's'} need
                  {attentionCount === 1 ? 's' : ''} attention
                </h2>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  All clear
                </h2>
              </>
            )}
          </div>

          {displayAlerts.length > 0 && (
            <div className="space-y-2">
              {displayAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
              {hasMore && (
                <Link
                  href="/admin/notifications"
                  className="block text-center text-sm font-medium text-[#C62828] py-2 hover:underline"
                >
                  View all {zoneAlerts.length} alerts
                </Link>
              )}
            </div>
          )}

          {attentionCount === 0 && (
            <p className="text-sm text-gray-500">
              No items need your attention right now. Nice work.
            </p>
          )}
        </section>

        {/* ── Today's Snapshot ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Today&apos;s Snapshot
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Baby}
              iconColor="bg-blue-100 text-blue-600"
              value={String(snapshot.childrenPresent)}
              label="Children Present"
              subtitle={`of ${snapshot.totalEnrolled} enrolled`}
            />
            <StatCard
              icon={Users}
              iconColor="bg-purple-100 text-purple-600"
              value={String(snapshot.staffOnDuty)}
              label="Staff On Duty"
              subtitle={`of ${snapshot.totalStaff} total`}
            />
            <StatCard
              icon={ShieldCheck}
              iconColor={
                snapshot.ratioCompliant
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-red-100 text-red-600'
              }
              value={snapshot.ratioCompliant ? 'Compliant' : 'Alert'}
              label="Ratio Status"
              subtitle={
                snapshot.ratioCompliant
                  ? 'All classrooms within ratio'
                  : 'One or more classrooms need coverage'
              }
              accentClass={
                snapshot.ratioCompliant ? 'text-emerald-600' : 'text-red-600'
              }
            />
            <StatCard
              icon={CheckCircle2}
              iconColor="bg-amber-100 text-amber-600"
              value={
                snapshot.totalTasks > 0
                  ? `${snapshot.tasksComplete}`
                  : '0'
              }
              label="Tasks Done"
              subtitle={
                snapshot.totalTasks > 0
                  ? `of ${snapshot.totalTasks} today`
                  : 'No tasks tracked yet'
              }
            />
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Quick Actions
            </h2>
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-gray-100 text-gray-600"
            >
              {getZoneLabel(zone)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((action) => (
              <QuickActionButton key={action.href} action={action} />
            ))}
          </div>
        </section>

        {/* ── Coming Up ── */}
        <section>
          <ComingUpSection currentZone={zone} allAlerts={alerts} />
        </section>
      </div>
    </DashboardLayout>
  );
}
