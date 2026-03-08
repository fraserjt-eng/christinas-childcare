'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HomeTile } from '@/components/employee/HomeTile';
import {
  getCurrentEmployee,
  getActiveTimeEntry,
  getTimeEntries,
  clockIn,
  clockOut,
} from '@/lib/employee-storage';
import { Employee, TimeEntry, EmployeeTraining, TrainingModule, formatHours } from '@/types/employee';
import { Task, DEFAULT_TIME_BLOCKS } from '@/types/tasks';
import { NewsUpdate } from '@/types/news';
import {
  Clock,
  MessageSquare,
  CalendarDays,
  GraduationCap,
  CreditCard,
  Calendar,
  User,
  Bell,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Megaphone,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ScheduleEntry {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  position?: string;
  building?: string;
  notes?: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const TASKS_KEY = 'christinas_tasks';
const NOTIFICATIONS_KEY = 'christinas_employee_notifications';
const NEWS_KEY = 'christinas_news_updates';
const MESSAGES_KEY = 'christinas_messages';
const SCHEDULES_KEY = 'christinas_schedules';
const TRAINING_MODULES_KEY = 'christinas_training_modules';
const EMPLOYEE_TRAINING_KEY = 'christinas_employee_training';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_NOTIFICATIONS: EmployeeNotification[] = [
  {
    id: 'notif_1',
    message: 'Christina Fraser assigned you: Submit CACFP Meal Counts',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif_2',
    message: 'Reminder: Restock Bathroom Supplies due during PM Activities',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
  },
  {
    id: 'notif_3',
    message: 'Your task "Update Parent Communication Board" has a new done standard',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif_4',
    message: 'Great work! You completed 8 of 8 tasks yesterday',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: 'notif_5',
    message: 'New task added to your Nap Time block: Organize Art Supply Cabinet',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function formatElapsed(clockInIso: string): string {
  const diff = Date.now() - new Date(clockInIso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function loadFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage quota exceeded or similar
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeDashboardPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsedLabel, setElapsedLabel] = useState('');

  // Dashboard data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([]);
  const [latestNews, setLatestNews] = useState<NewsUpdate | null>(null);
  const [newsDismissed, setNewsDismissed] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [todayShift, setTodayShift] = useState<string | null>(null);
  const [incompleteTrainingCount, setIncompleteTrainingCount] = useState(0);

  // ── Load initial data ──────────────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      const emp = getCurrentEmployee();
      setEmployee(emp);

      if (!emp) return;

      const employeeName = `${emp.first_name} ${emp.last_name}`;

      // Time entries
      const active = await getActiveTimeEntry(emp.id);
      setActiveEntry(active);

      const allEntries = await getTimeEntries({ employee_id: emp.id });
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      setWeeklyEntries(
        allEntries.filter((e) => new Date(e.date) >= startOfWeek)
      );

      // Tasks for today, assigned to this employee
      const allTasks = loadFromStorage<Task>(TASKS_KEY);
      const today = getTodayString();
      const myTasks = allTasks.filter((t) => {
        const isAssigned =
          t.assigned_to === emp.id ||
          t.assigned_to_name === employeeName ||
          t.assigned_to_name === emp.first_name;
        const isToday =
          t.status === 'today' ||
          t.status === 'in_progress' ||
          t.status === 'done' ||
          (t.due_date && t.due_date.startsWith(today)) ||
          t.recurrence === 'daily';
        return isAssigned && isToday;
      });
      setTasks(myTasks);

      // Notifications
      let notifs = loadFromStorage<EmployeeNotification>(NOTIFICATIONS_KEY);
      if (notifs.length === 0) {
        notifs = SEED_NOTIFICATIONS;
        saveToStorage(NOTIFICATIONS_KEY, notifs);
      }
      setNotifications(notifs.slice(0, 5));

      // News updates
      const allNews = loadFromStorage<NewsUpdate>(NEWS_KEY);
      const published = allNews
        .filter((n) => n.is_published)
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
      if (published.length > 0) {
        setLatestNews(published[0]);
      }

      // Unread messages
      interface StoredMessage {
        id: string;
        channelId: string | null;
        senderId: string;
        content: string;
        timestamp: string;
        readReceipts: Array<{ userId: string; readAt: string }>;
      }
      const allMessages = loadFromStorage<StoredMessage>(MESSAGES_KEY);
      const unread = allMessages.filter((m) => {
        if (m.senderId === emp.id) return false;
        return !m.readReceipts?.some((r) => r.userId === emp.id);
      });
      setUnreadMessageCount(unread.length);

      // Today's schedule
      const schedules = loadFromStorage<ScheduleEntry>(SCHEDULES_KEY);
      const todaySchedule = schedules.find(
        (s) => s.employee_id === emp.id && s.date === today
      );
      if (todaySchedule) {
        setTodayShift(`${todaySchedule.start_time} - ${todaySchedule.end_time}`);
      }

      // Incomplete training
      const modules = loadFromStorage<TrainingModule>(TRAINING_MODULES_KEY);
      const trainings = loadFromStorage<EmployeeTraining>(EMPLOYEE_TRAINING_KEY);
      const myTrainings = trainings.filter((t) => t.employee_id === emp.id);
      const completedModuleIds = new Set(
        myTrainings.filter((t) => t.status === 'completed').map((t) => t.module_id)
      );
      const incomplete = modules.filter((m) => !completedModuleIds.has(m.id));
      setIncompleteTrainingCount(incomplete.length);
    }

    loadData();
  }, []);

  // ── Elapsed time ticker ────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeEntry) {
      setElapsedLabel('');
      return;
    }

    const tick = () => setElapsedLabel(formatElapsed(activeEntry.clock_in));
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  // ── Clock actions ──────────────────────────────────────────────────────────

  const handleClockIn = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    const entry = await clockIn(employee.id);
    setActiveEntry(entry);
    setLoading(false);
  }, [employee]);

  const handleClockOut = useCallback(async () => {
    if (!activeEntry || !employee) return;
    setLoading(true);
    await clockOut(activeEntry.id, 30);
    setActiveEntry(null);
    const entries = await getTimeEntries({ employee_id: employee.id });
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    setWeeklyEntries(entries.filter((e) => new Date(e.date) >= startOfWeek));
    setLoading(false);
  }, [activeEntry, employee]);

  // ── Task toggle ────────────────────────────────────────────────────────────

  const handleToggleTask = useCallback(
    (taskId: string) => {
      const allTasks = loadFromStorage<Task>(TASKS_KEY);
      const updated = allTasks.map((t) => {
        if (t.id !== taskId) return t;
        const nowDone = t.status !== 'done';
        return {
          ...t,
          status: (nowDone ? 'done' : 'today') as Task['status'],
          completed_at: nowDone ? new Date().toISOString() : undefined,
          completed_by: nowDone ? employee?.id : undefined,
          updated_at: new Date().toISOString(),
        };
      });
      saveToStorage(TASKS_KEY, updated);

      // Update local state
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const nowDone = t.status !== 'done';
          return {
            ...t,
            status: (nowDone ? 'done' : 'today') as Task['status'],
            completed_at: nowDone ? new Date().toISOString() : undefined,
            completed_by: nowDone ? employee?.id : undefined,
            updated_at: new Date().toISOString(),
          };
        })
      );
    },
    [employee]
  );

  // ── Group tasks by time block ──────────────────────────────────────────────

  const tasksByBlock = (() => {
    const blockOrder = DEFAULT_TIME_BLOCKS.map((b) => b.name);
    const groups: Record<string, Task[]> = {};

    for (const task of tasks) {
      const blockName = task.time_block_name || 'Unscheduled';
      if (!groups[blockName]) groups[blockName] = [];
      groups[blockName].push(task);
    }

    // Sort groups by DEFAULT_TIME_BLOCKS order
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const aIdx = blockOrder.indexOf(a);
      const bIdx = blockOrder.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    return sortedKeys.map((name) => ({
      name,
      tasks: groups[name],
    }));
  })();

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  // ── Weekly hours ───────────────────────────────────────────────────────────

  const weeklyHours = weeklyEntries.reduce(
    (sum, e) => sum + (e.hours_worked || 0),
    0
  );

  // ── Loading state ──────────────────────────────────────────────────────────

  if (!employee) {
    return (
      <DashboardLayout isEmployee>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout isEmployee>
      <div className="space-y-6 pb-8">
        {/* ── Greeting + Announcement ─────────────────────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {getGreeting()}, {employee.first_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {employee.job_title} &middot; {todayFormatted}
          </p>
        </div>

        {/* News Banner */}
        {latestNews && !newsDismissed && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {latestNews.title}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 line-clamp-2">
                {latestNews.content}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewsDismissed(true)}
              className="shrink-0 p-1 rounded-full hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        )}

        {/* ── Big 4 Tile Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Clock In/Out */}
          <HomeTile
            href="#"
            icon={Clock}
            label={activeEntry ? 'Clock Out' : 'Clock In'}
            bgColor={activeEntry ? 'bg-red-600' : 'bg-green-600'}
            subtitle={
              loading
                ? 'Processing...'
                : activeEntry
                  ? elapsedLabel
                  : 'Start your shift'
            }
            onClick={activeEntry ? handleClockOut : handleClockIn}
          />

          {/* Chat */}
          <HomeTile
            href="/admin/messaging"
            icon={MessageSquare}
            label="Chat"
            bgColor="bg-blue-600"
            badge={unreadMessageCount || undefined}
          />

          {/* My Schedule */}
          <HomeTile
            href="/employee/schedule"
            icon={CalendarDays}
            label="My Schedule"
            bgColor="bg-purple-600"
            subtitle={todayShift || undefined}
          />

          {/* Training */}
          <HomeTile
            href="/employee/training"
            icon={GraduationCap}
            label="Training"
            bgColor="bg-orange-600"
            badge={incompleteTrainingCount || undefined}
          />
        </div>

        {/* ── Daily Task Checklist ────────────────────────────────────── */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              Today&apos;s Tasks
            </h2>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allDone ? 'bg-green-500' : 'bg-christina-red'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {totalCount === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No tasks assigned for today. Check in with your supervisor.
            </p>
          ) : (
            <div className="space-y-4">
              {tasksByBlock.map((block) => (
                <div key={block.name}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {block.name}
                  </p>
                  <div className="space-y-1.5">
                    {block.tasks.map((task) => {
                      const isDone = task.status === 'done';
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            isDone
                              ? 'bg-green-50 dark:bg-green-950/20'
                              : 'bg-muted/40 hover:bg-muted/70'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
                          )}
                          <span
                            className={`flex-1 text-sm ${
                              isDone
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.time_block_name && (
                            <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground shrink-0 hidden sm:inline">
                              {task.time_block_name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pay Info Card ───────────────────────────────────────────── */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">This Week</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xl font-bold">{formatHours(weeklyHours)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hours worked</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xl font-bold">${employee.hourly_rate}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hourly rate</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xl font-bold">Bi-weekly</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pay period</p>
            </div>
          </div>
        </div>

        {/* ── Quick Access Row ────────────────────────────────────────── */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          <Link
            href="/employee/time-off"
            className="flex items-center gap-2 min-w-[120px] rounded-xl border bg-card px-4 py-3 hover:bg-muted/50 transition-colors shrink-0"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Time Off</span>
          </Link>
          <Link
            href="/employee/pay-stubs"
            className="flex items-center gap-2 min-w-[120px] rounded-xl border bg-card px-4 py-3 hover:bg-muted/50 transition-colors shrink-0"
          >
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pay Stubs</span>
          </Link>
          <Link
            href="/employee/profile"
            className="flex items-center gap-2 min-w-[120px] rounded-xl border bg-card px-4 py-3 hover:bg-muted/50 transition-colors shrink-0"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">My Profile</span>
          </Link>
        </div>

        {/* ── Notification Feed ───────────────────────────────────────── */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Recent Updates
            </h2>
            <Link
              href="/employee/tasks"
              className="text-sm text-christina-red hover:underline flex items-center gap-0.5"
            >
              View all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent updates.
            </p>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 py-1.5"
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                      notif.read
                        ? 'bg-gray-300 dark:bg-gray-600'
                        : 'bg-christina-red'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getRelativeTime(notif.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
