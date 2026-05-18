'use client';

import { useState, useEffect, useCallback } from 'react';
// DashboardLayout provided by employee/layout.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check, CheckCircle2, Circle, Clock, AlertTriangle,
  ChevronDown, ChevronRight, User, Bell, MessageSquare,
  Flag, HelpCircle, Flame, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Task, DEFAULT_TIME_BLOCKS } from '@/types/tasks';
import { getSessionEmployee } from '@/lib/session-employee';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmployeeNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface TimeBlockGroup {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
  tasks: Task[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TASKS_KEY = 'christinas_tasks';
const NOTIFICATIONS_KEY = 'christinas_employee_notifications';

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

const PRIORITY_CONFIG: Record<Task['priority'], { label: string; color: string; icon: typeof Flame }> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200', icon: Flame },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: ArrowUp },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Minus },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: ArrowDown },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStoredNotifications(): EmployeeNotification[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!raw) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
    return SEED_NOTIFICATIONS;
  }
  try {
    return JSON.parse(raw) as EmployeeNotification[];
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

function getStoredTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function saveNotifications(notifications: EmployeeNotification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

async function getCurrentEmployeeName(): Promise<string> {
  const me = await getSessionEmployee();
  return me ? me.full_name : 'Sarah Johnson';
}

// ─── Components ──────────────────────────────────────────────────────────────

function NotificationsPanel({
  notifications,
  onDismiss,
}: {
  notifications: EmployeeNotification[];
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <Bell className="h-4 w-4 text-amber-600" />
        <span className="font-semibold text-amber-900 text-sm">
          Notifications
        </span>
        {unreadCount > 0 && (
          <Badge className="bg-amber-600 text-white text-xs px-1.5 py-0">
            {unreadCount}
          </Badge>
        )}
        <span className="ml-auto">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-amber-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-amber-600" />
          )}
        </span>
      </button>
      {expanded && (
        <ul className="mt-3 space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-2 text-sm rounded-lg p-2 ${
                n.read ? 'text-amber-700/70' : 'text-amber-900 bg-amber-100/50'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{n.message}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(n.id);
                }}
                className="text-amber-500 hover:text-amber-700 text-xs flex-shrink-0"
                title="Dismiss"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProgressHeader({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Today&apos;s Progress
        </h2>
        <span className="text-sm font-medium text-gray-600">
          {completed} of {total} tasks completed
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: pct === 100 ? '#16a34a' : '#C62828',
          }}
        />
      </div>
      {pct === 100 && total > 0 && (
        <p className="text-green-700 text-sm font-medium mt-1">
          All tasks completed. Great work today!
        </p>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={`${config.color} text-xs gap-1 font-medium`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function TaskCard({
  task,
  onComplete,
  onFlag,
}: {
  task: Task;
  onComplete: (taskId: string, note: string) => void;
  onFlag: (taskId: string, flagType: 'blocked' | 'help') => void;
}) {
  const [showNoteField, setShowNoteField] = useState(false);
  const [note, setNote] = useState('');
  const isDone = task.status === 'done' && !!task.completed_at && isToday(task.completed_at);
  const isBlocked = task.status === 'blocked';

  function handleComplete() {
    if (showNoteField) {
      onComplete(task.id, note);
      setShowNoteField(false);
      setNote('');
    } else {
      setShowNoteField(true);
    }
  }

  function handleCompleteSkipNote() {
    onComplete(task.id, '');
    setShowNoteField(false);
    setNote('');
  }

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        isDone
          ? 'bg-green-50/50 border-green-200'
          : isBlocked
          ? 'bg-red-50/50 border-red-200'
          : 'bg-white border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox area */}
        <button
          onClick={isDone ? undefined : handleCompleteSkipNote}
          className={`mt-0.5 flex-shrink-0 ${isDone ? '' : 'cursor-pointer'}`}
          disabled={isDone}
          title={isDone ? 'Completed' : 'Mark complete'}
        >
          {isDone ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <Circle className="h-6 w-6 text-gray-300 hover:text-[#C62828] transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3
              className={`font-medium text-base ${
                isDone ? 'line-through text-gray-400' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
            {task.category_name && (
              <Badge variant="outline" className="text-xs font-normal">
                {task.category_name}
              </Badge>
            )}
          </div>

          {/* Done Standard */}
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              Done Standard
            </p>
            <p
              className={`text-base ${
                isDone ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              {task.done_standard}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {task.delegated_by && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Delegated by {task.delegated_by}
              </span>
            )}
            {task.estimated_minutes != null && task.estimated_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{task.estimated_minutes} min
              </span>
            )}
            {isDone && task.completed_at && (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-3 w-3" />
                Done at {formatTime(task.completed_at)}
              </span>
            )}
            {isBlocked && (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <AlertTriangle className="h-3 w-3" />
                Blocked
              </span>
            )}
          </div>

          {/* Notes from completion */}
          {isDone && task.notes && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Note: {task.notes}
            </p>
          )}

          {/* Note input when completing */}
          {showNoteField && !isDone && (
            <div className="mt-3 space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an optional note about completion..."
                className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/30 focus:border-[#C62828] resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNoteField(false);
                    setNote('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isDone && !showNoteField && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNoteField(true)}
              className="text-xs border-[#C62828]/30 text-[#C62828] hover:bg-[#C62828]/10 min-h-[44px]"
            >
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Button>
            {!isBlocked && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFlag(task.id, 'blocked')}
                className="text-xs text-gray-500 hover:text-red-600 min-h-[44px]"
              >
                <Flag className="h-3 w-3 mr-1" />
                Blocked
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onFlag(task.id, 'help')}
              className="text-xs text-gray-500 hover:text-amber-600 min-h-[44px]"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Need Help
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBlockSection({
  block,
  onComplete,
  onFlag,
}: {
  block: TimeBlockGroup;
  onComplete: (taskId: string, note: string) => void;
  onFlag: (taskId: string, flagType: 'blocked' | 'help') => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = block.tasks.filter(
    (t) => t.status === 'done' && t.completed_at && isToday(t.completed_at)
  ).length;
  const allDone = completedCount === block.tasks.length && block.tasks.length > 0;

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left mb-3 group"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        )}
        <Clock className="h-4 w-4 text-[#C62828]" />
        <span className="text-base font-semibold text-gray-900">
          {block.name}
        </span>
        <span className="text-sm text-gray-500">
          ({block.startTime} - {block.endTime})
        </span>
        <span className="ml-auto text-xs text-gray-500">
          {completedCount}/{block.tasks.length}
        </span>
        {allDone && (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
      </button>
      {expanded && (
        <div className="space-y-4 ml-6">
          {block.tasks.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No tasks in this block.</p>
          ) : (
            block.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onFlag={onFlag}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([]);
  const [employeeName, setEmployeeName] = useState('Sarah Johnson');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTasks(getStoredTasks());
    setNotifications(getStoredNotifications());
    (async () => {
      setEmployeeName(await getCurrentEmployeeName());
    })();
  }, []);

  const myTasks = tasks.filter(
    (t) =>
      t.assigned_to_name === employeeName ||
      t.assigned_to === employeeName
  );

  const todayTasks = myTasks.filter(
    (t) => t.status !== 'backlog'
  );

  const completedToday = todayTasks.filter(
    (t) => t.status === 'done' && t.completed_at && isToday(t.completed_at)
  ).length;

  const groupedByBlock: TimeBlockGroup[] = buildTimeBlockGroups(todayTasks);

  const handleComplete = useCallback(
    (taskId: string, note: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: 'done' as const,
            completed_at: new Date().toISOString(),
            completed_by: employeeName,
            notes: note || t.notes,
            updated_at: new Date().toISOString(),
          };
        });
        saveTasks(updated);
        return updated;
      });
    },
    [employeeName]
  );

  const handleFlag = useCallback(
    (taskId: string, flagType: 'blocked' | 'help') => {
      if (flagType === 'blocked') {
        setTasks((prev) => {
          const updated = prev.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              status: 'blocked' as const,
              updated_at: new Date().toISOString(),
            };
          });
          saveTasks(updated);
          return updated;
        });
      }
      // For "help," add a notification to signal the request
      if (flagType === 'help') {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          const newNotif: EmployeeNotification = {
            id: `notif_${Date.now()}`,
            message: `You requested help on "${task.title}". Your lead has been notified.`,
            timestamp: new Date().toISOString(),
            read: false,
          };
          setNotifications((prev) => {
            const updated = [newNotif, ...prev];
            saveNotifications(updated);
            return updated;
          });
        }
      }
    },
    [tasks]
  );

  const handleDismissNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, []);

  if (!mounted) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-gray-400">Loading tasks...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-base text-gray-500 mt-1">
            Hi, {employeeName.split(' ')[0]}. Here is everything on your plate today.
          </p>
        </div>

        {/* Notifications */}
        <NotificationsPanel
          notifications={notifications}
          onDismiss={handleDismissNotification}
        />

        {/* Progress */}
        <ProgressHeader completed={completedToday} total={todayTasks.length} />

        {/* Task groups */}
        {todayTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks assigned to you right now.</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back later or ask your lead if you are expecting assignments.
            </p>
          </div>
        ) : (
          groupedByBlock.map((block) => (
            <TimeBlockSection
              key={block.id}
              block={block}
              onComplete={handleComplete}
              onFlag={handleFlag}
            />
          ))
        )}
      </div>
    </>
  );
}

// ─── Grouping helper ─────────────────────────────────────────────────────────

function buildTimeBlockGroups(tasks: Task[]): TimeBlockGroup[] {
  const blockMap = new Map<string, TimeBlockGroup>();

  // Initialize from default blocks
  for (const block of DEFAULT_TIME_BLOCKS) {
    blockMap.set(block.name, {
      id: block.name.toLowerCase().replace(/\s+/g, '_'),
      name: block.name,
      startTime: formatBlockTime(block.start_time),
      endTime: formatBlockTime(block.end_time),
      sortOrder: block.sort_order,
      tasks: [],
    });
  }

  // Add an "Unscheduled" bucket for tasks without a time block
  blockMap.set('__unscheduled', {
    id: 'unscheduled',
    name: 'Unscheduled',
    startTime: '',
    endTime: '',
    sortOrder: 99,
    tasks: [],
  });

  for (const task of tasks) {
    const blockName = task.time_block_name || '';
    const bucket = blockMap.get(blockName) || blockMap.get('__unscheduled');
    if (bucket) {
      bucket.tasks.push(task);
    }
  }

  // Filter out empty blocks, sort by sort_order
  return Array.from(blockMap.values())
    .filter((b) => b.tasks.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function formatBlockTime(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${suffix}`;
}
