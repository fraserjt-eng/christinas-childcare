'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Clock, CheckCircle2, User, Tag, Timer } from 'lucide-react';
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

function getNapWindowInfo(): { isActive: boolean; minutesRemaining: number; minutesUntilStart: number } {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = NAP_START_HOUR * 60 + NAP_START_MIN;
  const endMinutes = NAP_END_HOUR * 60 + NAP_END_MIN;

  if (totalMinutes >= startMinutes && totalMinutes < endMinutes) {
    return { isActive: true, minutesRemaining: endMinutes - totalMinutes, minutesUntilStart: 0 };
  }
  if (totalMinutes < startMinutes) {
    return { isActive: false, minutesRemaining: 0, minutesUntilStart: startMinutes - totalMinutes };
  }
  return { isActive: false, minutesRemaining: 0, minutesUntilStart: 0 };
}

const PRIORITY_ORDER: Record<Task['priority'], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-700',
};

export function NapTimeOptimizer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [napInfo, setNapInfo] = useState(getNapWindowInfo());
  const [now, setNow] = useState(new Date());

  const loadTasks = useCallback(() => {
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(() => {
      setNapInfo(getNapWindowInfo());
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  const napTasks = tasks
    .filter((t) => t.is_nap_time_task)
    .sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return (a.estimated_minutes ?? 999) - (b.estimated_minutes ?? 999);
    });

  const timeFilterNum = timeFilter === 'all' ? null : parseInt(timeFilter, 10);
  const visibleTasks = timeFilterNum
    ? napTasks.filter((t) => (t.estimated_minutes ?? 0) <= timeFilterNum)
    : napTasks;

  const today = now.toISOString().split('T')[0];
  const completedToday = napTasks.filter(
    (t) => t.status === 'done' && t.completed_at && t.completed_at.startsWith(today)
  );
  const completedMinutes = completedToday.reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0);
  const progressPct = Math.min((completedMinutes / NAP_WINDOW_MINUTES) * 100, 100);

  function completeTask(taskId: string) {
    const all = getTasks();
    const idx = all.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    all[idx] = {
      ...all[idx],
      status: 'done',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveTasks(all);
    setTasks(all);
  }

  return (
    <div className="space-y-4">
      {/* Header card with countdown */}
      <Card className={napInfo.isActive ? 'border-l-4 border-l-christina-blue' : 'border-l-4 border-l-muted'}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-christina-blue" />
              Nap Time Window
              <span className="text-sm text-muted-foreground font-normal">(12:30 - 2:30 PM)</span>
            </CardTitle>
            {napInfo.isActive ? (
              <Badge className="bg-christina-blue text-white flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {napInfo.minutesRemaining} min remaining
              </Badge>
            ) : napInfo.minutesUntilStart > 0 ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Starts in {napInfo.minutesUntilStart} min
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Window closed for today
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Nap time used</span>
              <span className="font-medium">{completedMinutes} / {NAP_WINDOW_MINUTES} min</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
          <p className="text-sm text-muted-foreground">
            {completedToday.length} of {napTasks.length} nap-time tasks completed today
          </p>
        </CardContent>
      </Card>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">What can I finish in:</span>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Showing {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task list */}
      {visibleTasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Moon className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="font-medium">No nap-time tasks match this filter.</p>
            <p className="text-sm mt-1">Try a longer time window or add tasks with the nap-time flag.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleTasks.map((task) => {
            const isDone = task.status === 'done';
            return (
              <Card
                key={task.id}
                className={`transition-opacity ${isDone ? 'opacity-50' : 'hover:shadow-sm'}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className={`font-medium text-sm ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        <Badge className={PRIORITY_COLORS[task.priority]}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                        {task.estimated_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_minutes} min
                          </span>
                        )}
                        {task.assigned_to_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assigned_to_name}
                          </span>
                        )}
                        {task.category_name && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {task.category_name}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isDone ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-christina-green text-christina-green hover:bg-green-50"
                        onClick={() => completeTask(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
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
