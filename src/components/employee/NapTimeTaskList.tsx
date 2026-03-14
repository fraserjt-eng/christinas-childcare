'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Moon, Clock, Play, CheckCircle2, Timer } from 'lucide-react';
import { getCurrentEmployee } from '@/lib/employee-storage';
import type { Task } from '@/types/tasks';

const TASKS_KEY = 'christinas_tasks';

const NAP_START_HOUR = 12;
const NAP_START_MIN = 30;
const NAP_END_HOUR = 14;
const NAP_END_MIN = 30;
const NAP_WINDOW_MINUTES = 90;

function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function getNapStatus(): { isActive: boolean; minutesRemaining: number; minutesUntilStart: number } {
  const now = new Date();
  const total = now.getHours() * 60 + now.getMinutes();
  const start = NAP_START_HOUR * 60 + NAP_START_MIN;
  const end = NAP_END_HOUR * 60 + NAP_END_MIN;

  if (total >= start && total < end) {
    return { isActive: true, minutesRemaining: end - total, minutesUntilStart: 0 };
  }
  if (total < start) {
    return { isActive: false, minutesRemaining: 0, minutesUntilStart: start - total };
  }
  return { isActive: false, minutesRemaining: 0, minutesUntilStart: 0 };
}

// Track started_at per task in localStorage
const STARTED_KEY = 'christinas_nap_task_started';

function getStartedMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STARTED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStarted(taskId: string): void {
  if (typeof window === 'undefined') return;
  const map = getStartedMap();
  map[taskId] = new Date().toISOString();
  localStorage.setItem(STARTED_KEY, JSON.stringify(map));
}

export function NapTimeTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [napStatus, setNapStatus] = useState(getNapStatus());
  const [startedMap, setStartedMap] = useState<Record<string, string>>({});
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [currentEmployeeName, setCurrentEmployeeName] = useState<string | null>(null);

  const load = useCallback(() => {
    setTasks(getTasks());
    setStartedMap(getStartedMap());
    const emp = getCurrentEmployee();
    if (emp) {
      setCurrentEmployeeId(emp.id);
      setCurrentEmployeeName(`${emp.first_name} ${emp.last_name}`);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      setNapStatus(getNapStatus());
    }, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const today = new Date().toISOString().split('T')[0];

  // Show tasks assigned to current employee or unassigned
  const myNapTasks = tasks
    .filter((t) => {
      if (!t.is_nap_time_task) return false;
      if (currentEmployeeId) {
        return !t.assigned_to || t.assigned_to === currentEmployeeId;
      }
      return true;
    })
    .sort((a, b) => (a.estimated_minutes ?? 999) - (b.estimated_minutes ?? 999));

  const completedToday = myNapTasks.filter(
    (t) => t.status === 'done' && t.completed_at && t.completed_at.startsWith(today)
  );
  const remainingTasks = myNapTasks.filter((t) => t.status !== 'done');
  const completedMinutes = completedToday.reduce((s, t) => s + (t.estimated_minutes ?? 0), 0);
  const progressPct = Math.min((completedMinutes / NAP_WINDOW_MINUTES) * 100, 100);

  function handleStart(taskId: string) {
    setStarted(taskId);
    setStartedMap(getStartedMap());

    const all = getTasks();
    const idx = all.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    all[idx] = {
      ...all[idx],
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    };
    saveTasks(all);
    setTasks(all);
  }

  function handleDone(taskId: string) {
    const all = getTasks();
    const idx = all.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    all[idx] = {
      ...all[idx],
      status: 'done',
      completed_at: new Date().toISOString(),
      completed_by: currentEmployeeName || undefined,
      updated_at: new Date().toISOString(),
    };
    saveTasks(all);
    setTasks(all);
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {!napStatus.isActive ? (
        <Card className="border-l-4 border-l-muted bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <div>
                {napStatus.minutesUntilStart > 0 ? (
                  <>
                    <p className="font-semibold">Nap time starts at 12:30 PM</p>
                    <p className="text-sm text-muted-foreground">
                      {napStatus.minutesUntilStart} minutes away. Review your tasks now so you&apos;re ready.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Nap window has closed for today.</p>
                    <p className="text-sm text-muted-foreground">Great work — check back tomorrow at 12:30.</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-christina-blue bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-christina-blue" />
                <div>
                  <p className="font-semibold text-christina-blue">Nap time is active</p>
                  <p className="text-sm text-muted-foreground">
                    {napStatus.minutesRemaining} minutes left in the window.
                  </p>
                </div>
              </div>
              <Badge className="bg-christina-blue text-white flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {napStatus.minutesRemaining} min
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">YOUR PROGRESS TODAY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressPct} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{completedToday.length} done, {remainingTasks.length} remaining</span>
            <span className="font-medium">{completedMinutes} / {NAP_WINDOW_MINUTES} min</span>
          </div>
        </CardContent>
      </Card>

      {/* Task list */}
      {myNapTasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Moon className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No nap-time tasks assigned to you.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myNapTasks.map((task) => {
            const isDone = task.status === 'done';
            const isStarted = task.status === 'in_progress';
            const startedAt = startedMap[task.id];

            return (
              <Card
                key={task.id}
                className={`transition-opacity ${isDone ? 'opacity-50' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={`font-medium ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                        {task.estimated_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_minutes} min
                          </span>
                        )}
                        {startedAt && !isDone && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Timer className="h-3 w-3" />
                            Started {new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {isDone ? (
                      <Badge className="bg-green-100 text-green-800 shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    ) : isStarted ? (
                      <Button
                        size="sm"
                        className="bg-christina-green hover:bg-green-700 shrink-0"
                        onClick={() => handleDone(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-christina-blue text-christina-blue hover:bg-blue-50 shrink-0"
                        onClick={() => handleStart(task.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
