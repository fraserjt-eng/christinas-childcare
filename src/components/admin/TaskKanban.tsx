'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Circle,
  Loader2,
  CheckCircle2,
  Clock,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Building2,
  User,
  Tag,
  Moon,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types/tasks';

const STORAGE_KEY = 'christinas_tasks';

const KANBAN_COLUMNS: { key: TaskStatus; label: string; color: string; headerColor: string }[] = [
  { key: 'today',       label: 'To Do',       color: 'border-blue-200',   headerColor: 'bg-blue-50 text-blue-700' },
  { key: 'in_progress', label: 'In Progress',  color: 'border-amber-200',  headerColor: 'bg-amber-50 text-amber-700' },
  { key: 'done',        label: 'Done',         color: 'border-green-200',  headerColor: 'bg-green-50 text-green-700' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Care Duties':         'bg-green-100 text-green-700',
  'Admin/Paperwork':     'bg-blue-100 text-blue-700',
  'Communication':       'bg-purple-100 text-purple-700',
  'Compliance/Licensing':'bg-orange-100 text-orange-700',
  'Curriculum/Teaching': 'bg-violet-100 text-violet-700',
  'Food Program':        'bg-red-100 text-red-700',
  'Facilities/Supplies': 'bg-gray-100 text-gray-700',
  'Operations':          'bg-blue-100 text-blue-700',
  'Compliance':          'bg-orange-100 text-orange-700',
  'Parent Comms':        'bg-purple-100 text-purple-700',
  'Staff':               'bg-green-100 text-green-700',
  'Admin':               'bg-gray-100 text-gray-700',
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string; icon: React.ReactNode }> = {
  urgent: { label: 'Urgent', className: 'text-red-600',    icon: <Flame className="h-3 w-3" /> },
  high:   { label: 'High',   className: 'text-orange-500', icon: <ArrowUp className="h-3 w-3" /> },
  normal: { label: 'Normal', className: 'text-gray-400',   icon: <Minus className="h-3 w-3" /> },
  low:    { label: 'Low',    className: 'text-gray-300',   icon: <ArrowDown className="h-3 w-3" /> },
};

// ─── Audio + haptic feedback helpers ────────────────────────────────
// Synthesized via Web Audio API. No external sound files.

let sharedAudioContext: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedAudioContext) return sharedAudioContext;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    sharedAudioContext = new Ctx();
    return sharedAudioContext;
  } catch {
    return null;
  }
}

function playTone(frequency: number, durationMs: number, type: OscillatorType = 'sine'): void {
  if (typeof window === 'undefined') return;
  // Respect user preference to disable sounds
  try {
    if (localStorage.getItem('christinas_kanban_sound') === 'off') return;
  } catch {
    // ignore
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    // Short fade-out to avoid clicks
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    console.debug('Audio tone failed:', e);
  }
}

function playLift(): void {
  playTone(180, 40, 'sine');
}

function playDrop(): void {
  playTone(440, 50, 'triangle');
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return;
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDueDate(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `Due in ${diff}d`;
}

// ─── Task Card ───────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const categoryColor = task.category_name
    ? (CATEGORY_COLORS[task.category_name] ?? 'bg-gray-100 text-gray-700')
    : 'bg-gray-100 text-gray-700';

  const dueInfo = task.due_date ? formatDueDate(task.due_date) : null;
  const isOverdue = dueInfo?.includes('overdue');

  return (
    <div
      className={`bg-white rounded-lg border p-3 space-y-2 shadow-sm transition-shadow ${
        isDragging ? 'shadow-lg rotate-1 opacity-90' : 'hover:shadow-md'
      }`}
    >
      {/* Priority + title */}
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 flex-shrink-0 ${priority.className}`}>{priority.icon}</span>
        <p className="text-sm font-medium leading-snug flex-1 line-clamp-2">{task.title}</p>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1">
        {task.category_name && (
          <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${categoryColor}`}>
            <Tag className="h-2.5 w-2.5 mr-1" />
            {task.category_name}
          </Badge>
        )}
        {task.is_nap_time_task && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-indigo-100 text-indigo-700">
            <Moon className="h-2.5 w-2.5 mr-1" />
            Nap
          </Badge>
        )}
        {task.estimated_minutes && (
          <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground">
            <Clock className="h-2.5 w-2.5 mr-1" />
            {formatMinutes(task.estimated_minutes)}
          </Badge>
        )}
      </div>

      {/* Footer: assignee + due date */}
      <div className="flex items-center justify-between">
        {task.assigned_to_name ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assigned_to_name.split(' ')[0]}
          </span>
        ) : (
          <span />
        )}
        {dueInfo && (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
            {dueInfo}
          </span>
        )}
      </div>

      {/* Center badge */}
      {task.center_id && (
        <div className="pt-0.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {task.center_id === 'center_1' ? 'Crystal' : task.center_id === 'center_2' ? 'Brooklyn Park' : task.center_id}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Sortable Task Card ───────────────────────────────────────────────────────

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <TaskCard task={task} />
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  columnKey,
  label,
  tasks,
  headerColor,
  borderColor,
}: {
  columnKey: TaskStatus;
  label: string;
  tasks: Task[];
  headerColor: string;
  borderColor: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    today:       <Circle className="h-4 w-4" />,
    in_progress: <Loader2 className="h-4 w-4" />,
    done:        <CheckCircle2 className="h-4 w-4" />,
  };

  // Make the whole column a droppable target so dropping on empty space works
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-2 ${borderColor} bg-muted/30 min-h-[400px] transition-all duration-200 ${
        isOver ? 'ring-4 ring-christina-red/60 scale-[1.01] bg-christina-red/5' : ''
      }`}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${headerColor}`}>
        <div className="flex items-center gap-2 font-semibold text-sm">
          {icons[columnKey]}
          {label}
        </div>
        <Badge variant="secondary" className={`text-xs font-bold ${headerColor} border-0`}>
          {tasks.length}
        </Badge>
      </div>

      {/* Drop zone */}
      <div className="flex-1 p-3 space-y-2 min-h-[60px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div
            className={`flex items-center justify-center h-16 rounded-lg border-2 border-dashed transition-colors ${
              isOver ? 'border-christina-red bg-christina-red/10' : 'border-muted-foreground/20'
            }`}
          >
            <p className="text-xs text-muted-foreground">
              {isOver ? 'Release to drop here' : 'Drop tasks here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TaskKanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterCenter, setFilterCenter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        setTasks(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveTasks = useCallback((updated: Task[]) => {
    setTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  // Derive filter options
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => { if (t.category_name) set.add(t.category_name); });
    return Array.from(set).sort();
  }, [tasks]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => { if (t.assigned_to_name) set.add(t.assigned_to_name); });
    return Array.from(set).sort();
  }, [tasks]);

  const centers = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => { if (t.center_id) set.add(t.center_id); });
    return Array.from(set).sort();
  }, [tasks]);

  // Filtered tasks (only kanban-visible statuses)
  const kanbanTasks = useMemo(() => {
    const visible: TaskStatus[] = ['today', 'in_progress', 'done'];
    return tasks.filter((t) => {
      if (!visible.includes(t.status)) return false;
      if (filterCategory !== 'all' && t.category_name !== filterCategory) return false;
      if (filterAssignee !== 'all' && t.assigned_to_name !== filterAssignee) return false;
      if (filterCenter !== 'all' && t.center_id !== filterCenter) return false;
      return true;
    });
  }, [tasks, filterCategory, filterAssignee, filterCenter]);

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = { today: [], in_progress: [], done: [] };
    kanbanTasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [kanbanTasks]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
    // Lift feedback: short tone + brief vibrate
    playLift();
    vibrate(10);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    const columnKeys = KANBAN_COLUMNS.map((c) => c.key);
    let targetStatus: TaskStatus | null = null;

    if (columnKeys.includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && columnKeys.includes(overTask.status)) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;

    // Only play confirm feedback if the card actually changed column
    const sourceTask = tasks.find((t) => t.id === activeId);
    if (sourceTask && sourceTask.status !== targetStatus) {
      playDrop();
      vibrate(30);
    }

    const updated = tasks.map((t) => {
      if (t.id !== activeId) return t;
      const now = new Date().toISOString();
      return {
        ...t,
        status: targetStatus!,
        updated_at: now,
        completed_at: targetStatus === 'done' ? now : t.completed_at,
      };
    });

    saveTasks(updated);
  };

  const hasFilters = filterCategory !== 'all' || filterAssignee !== 'all' || filterCenter !== 'all';

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter:</span>
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {centers.length > 0 && (
              <Select value={filterCenter} onValueChange={setFilterCenter}>
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue placeholder="Center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Centers</SelectItem>
                  {centers.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === 'center_1' ? 'Crystal' : c === 'center_2' ? 'Brooklyn Park' : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => {
                  setFilterCategory('all');
                  setFilterAssignee('all');
                  setFilterCenter('all');
                }}
              >
                Clear filters
              </Button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              {kanbanTasks.length} tasks shown
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              columnKey={col.key}
              label={col.label}
              tasks={tasksByColumn[col.key] ?? []}
              headerColor={col.headerColor}
              borderColor={col.color}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {kanbanTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No tasks match the current filters.</p>
            <p className="text-xs mt-1">Add tasks from the Task Board or adjust filters above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
