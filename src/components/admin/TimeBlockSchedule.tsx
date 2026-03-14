'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Building2, Moon, User } from 'lucide-react';
import { Task, DEFAULT_TIME_BLOCKS } from '@/types/tasks';

const STORAGE_KEY = 'christinas_tasks';

// Time range: 6 AM to 6 PM in 30-minute slots
const START_HOUR = 6;
const END_HOUR = 18;
const SLOT_HEIGHT = 48; // px per 30-min slot

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Care Duties':          { bg: 'bg-green-100',  border: 'border-green-400',  text: 'text-green-800' },
  'Admin/Paperwork':      { bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-800' },
  'Communication':        { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800' },
  'Compliance/Licensing': { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800' },
  'Curriculum/Teaching':  { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-800' },
  'Food Program':         { bg: 'bg-red-100',    border: 'border-red-400',    text: 'text-red-800' },
  'Facilities/Supplies':  { bg: 'bg-gray-100',   border: 'border-gray-400',   text: 'text-gray-700' },
};

const DEFAULT_COLORS = { bg: 'bg-muted', border: 'border-muted-foreground', text: 'text-foreground' };

// Convert "HH:MM" to minutes from midnight
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(hour: number, minute: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMin = minute === 0 ? '' : `:${String(minute).padStart(2, '0')}`;
  return `${displayHour}${displayMin} ${suffix}`;
}

// Generate time slots
function generateTimeSlots(): { label: string; hour: number; minute: number }[] {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push({ label: formatTime(h, 0), hour: h, minute: 0 });
    slots.push({ label: formatTime(h, 30), hour: h, minute: 30 });
  }
  return slots;
}

const TIME_BLOCKS_WITH_IDS = DEFAULT_TIME_BLOCKS.map((tb, i) => ({ ...tb, id: `tb_${i}` }));

function getBlockForTask(task: Task): { start_time: string; end_time: string } | null {
  if (!task.time_block_id) return null;
  return TIME_BLOCKS_WITH_IDS.find((tb) => tb.id === task.time_block_id) ?? null;
}

interface ScheduledTask {
  task: Task;
  topPx: number;
  heightPx: number;
  column: number;
  totalColumns: number;
}

// Lay out tasks at the same time slot in parallel columns
function layoutTasks(tasks: Task[]): ScheduledTask[] {
  interface Slot {
    task: Task;
    startMin: number;
    endMin: number;
  }

  const startOf = START_HOUR * 60;
  const slots: Slot[] = [];

  for (const task of tasks) {
    const block = getBlockForTask(task);
    if (!block) continue;
    const s = toMinutes(block.start_time);
    const e = toMinutes(block.end_time);
    if (e <= startOf || s >= END_HOUR * 60) continue;
    slots.push({ task, startMin: s, endMin: e });
  }

  // Assign columns using sweep-line
  const columns: number[] = [];
  const assigned: ScheduledTask[] = [];

  for (const slot of slots) {
    let col = 0;
    // Find lowest free column
    for (let c = 0; ; c++) {
      const isOccupied = assigned.some((a) => a.column === c && a.topPx + a.heightPx > ((slot.startMin - startOf) / 30) * SLOT_HEIGHT);
      if (!isOccupied) { col = c; break; }
    }
    columns.push(col);
    assigned.push({
      task: slot.task,
      topPx: ((slot.startMin - startOf) / 30) * SLOT_HEIGHT,
      heightPx: Math.max(SLOT_HEIGHT, ((slot.endMin - slot.startMin) / 30) * SLOT_HEIGHT),
      column: col,
      totalColumns: 1, // updated below
    });
  }

  // Recalculate totalColumns for overlapping groups
  for (let i = 0; i < assigned.length; i++) {
    const a = assigned[i];
    let maxCol = a.column;
    for (let j = 0; j < assigned.length; j++) {
      const b = assigned[j];
      const aEnd = a.topPx + a.heightPx;
      const bEnd = b.topPx + b.heightPx;
      if (a.topPx < bEnd && aEnd > b.topPx) {
        maxCol = Math.max(maxCol, b.column);
      }
    }
    assigned[i] = { ...a, totalColumns: maxCol + 1 };
  }

  return assigned;
}

export function TimeBlockSchedule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw) as Task[]);
    } catch { /* ignore */ }
  }, []);

  // Update current-time indicator every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const kanbanStatuses = ['today', 'in_progress', 'blocked', 'backlog'];
  const relevantTasks = useMemo(
    () => tasks.filter((t) => kanbanStatuses.includes(t.status)),
    [tasks]
  );

  const { scheduledLayouts, unscheduled } = useMemo(() => {
    const withBlock = relevantTasks.filter((t) => t.time_block_id);
    const withoutBlock = relevantTasks.filter((t) => !t.time_block_id);
    return {
      scheduledLayouts: layoutTasks(withBlock),
      unscheduled: withoutBlock,
    };
  }, [relevantTasks]);

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const totalHeight = timeSlots.length * SLOT_HEIGHT;

  // Current time indicator
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = START_HOUR * 60;
  const endMinutes = END_HOUR * 60;
  const nowTopPx =
    nowMinutes >= startMinutes && nowMinutes <= endMinutes
      ? ((nowMinutes - startMinutes) / 30) * SLOT_HEIGHT
      : null;

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-christina-blue" />
            Daily Timeline
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <div className="overflow-x-auto">
            <div className="flex min-w-[560px]">
              {/* Time axis */}
              <div className="w-16 flex-shrink-0 border-r">
                <div style={{ height: totalHeight }} className="relative">
                  {timeSlots.map((slot, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 flex items-start justify-end pr-2"
                      style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                    >
                      {slot.minute === 0 ? (
                        <span className="text-xs text-muted-foreground -mt-2 font-medium">
                          {slot.label}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50 -mt-2">
                          {slot.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid + tasks */}
              <div className="flex-1 relative ml-2 mr-4">
                {/* Grid lines */}
                <div style={{ height: totalHeight }} className="absolute inset-0 pointer-events-none">
                  {timeSlots.map((slot, i) => (
                    <div
                      key={i}
                      className={`absolute left-0 right-0 border-t ${
                        slot.minute === 0
                          ? 'border-border/60'
                          : 'border-border/20 border-dashed'
                      }`}
                      style={{ top: i * SLOT_HEIGHT }}
                    />
                  ))}
                </div>

                {/* Current time line */}
                {nowTopPx !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: nowTopPx }}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 -ml-1" />
                      <div className="flex-1 border-t-2 border-red-500" />
                    </div>
                  </div>
                )}

                {/* Task blocks */}
                <div style={{ height: totalHeight }} className="relative">
                  {scheduledLayouts.map((sl, i) => {
                    const colors = sl.task.category_name
                      ? (CATEGORY_COLORS[sl.task.category_name] ?? DEFAULT_COLORS)
                      : DEFAULT_COLORS;
                    const width = `${100 / sl.totalColumns}%`;
                    const left = `${(sl.column / sl.totalColumns) * 100}%`;

                    return (
                      <div
                        key={i}
                        className={`absolute rounded border-l-4 px-2 py-1 overflow-hidden ${colors.bg} ${colors.border} ${colors.text}`}
                        style={{
                          top: sl.topPx + 2,
                          height: Math.max(sl.heightPx - 4, SLOT_HEIGHT - 4),
                          left,
                          width,
                          paddingLeft: '8px',
                        }}
                      >
                        <p className="text-xs font-semibold leading-tight line-clamp-2">{sl.task.title}</p>
                        {sl.heightPx >= SLOT_HEIGHT * 2 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sl.task.assigned_to_name && (
                              <span className="text-[10px] flex items-center gap-0.5 opacity-80">
                                <User className="h-2.5 w-2.5" />
                                {sl.task.assigned_to_name.split(' ')[0]}
                              </span>
                            )}
                            {sl.task.center_id && (
                              <span className="text-[10px] flex items-center gap-0.5 opacity-80">
                                <Building2 className="h-2.5 w-2.5" />
                                {sl.task.center_id === 'center_1' ? 'Crystal' : 'BKP'}
                              </span>
                            )}
                          </div>
                        )}
                        {sl.task.estimated_minutes && sl.heightPx >= SLOT_HEIGHT && (
                          <span className="text-[10px] opacity-70 block mt-0.5">
                            ~{sl.task.estimated_minutes}m
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unscheduled tasks */}
      {unscheduled.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">
              Unscheduled ({unscheduled.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {unscheduled.map((task) => {
                const colors = task.category_name
                  ? (CATEGORY_COLORS[task.category_name] ?? DEFAULT_COLORS)
                  : DEFAULT_COLORS;
                return (
                  <div
                    key={task.id}
                    className={`rounded-lg border-l-4 p-2 ${colors.bg} ${colors.border}`}
                  >
                    <p className={`text-xs font-medium line-clamp-1 ${colors.text}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.assigned_to_name && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <User className="h-2.5 w-2.5" />
                          {task.assigned_to_name.split(' ')[0]}
                        </span>
                      )}
                      {task.is_nap_time_task && (
                        <span className="text-[10px] text-indigo-600 flex items-center gap-0.5">
                          <Moon className="h-2.5 w-2.5" /> Nap
                        </span>
                      )}
                      {task.center_id && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Building2 className="h-2.5 w-2.5" />
                          {task.center_id === 'center_1' ? 'Crystal' : 'BKP'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {relevantTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No active tasks to display.</p>
            <p className="text-xs mt-1">Tasks with status Today, In Progress, or Blocked will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
