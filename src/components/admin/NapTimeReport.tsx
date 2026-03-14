'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Lightbulb, Moon } from 'lucide-react';
import type { Task } from '@/types/tasks';

const TASKS_KEY = 'christinas_tasks';

function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getWeekStart(offsetWeeks = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 - offsetWeeks * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(startDate: Date): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

interface StaffStat {
  name: string;
  count: number;
  minutes: number;
}

interface DayStat {
  label: string;
  count: number;
}

export function NapTimeReport() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(() => setTasks(getTasks()), []);
  useEffect(() => { load(); }, [load]);

  const thisWeekStart = getWeekStart(0);
  const thisWeekEnd = getWeekEnd(thisWeekStart);

  const napTasks = tasks.filter((t) => t.is_nap_time_task);

  // Tasks completed this week during nap time
  const completedThisWeek = napTasks.filter((t) => {
    if (t.status !== 'done' || !t.completed_at) return false;
    const d = new Date(t.completed_at);
    return d >= thisWeekStart && d <= thisWeekEnd;
  });

  const totalMinutesUsed = completedThisWeek.reduce((s, t) => s + (t.estimated_minutes ?? 0), 0);
  const napWindowTotal = 5 * 90; // 5 days * 90 min
  const efficiencyRate = napWindowTotal > 0 ? Math.round((totalMinutesUsed / napWindowTotal) * 100) : 0;

  // By staff member
  const staffMap: Record<string, StaffStat> = {};
  for (const t of completedThisWeek) {
    const name = t.completed_by || t.assigned_to_name || 'Unassigned';
    if (!staffMap[name]) staffMap[name] = { name, count: 0, minutes: 0 };
    staffMap[name].count++;
    staffMap[name].minutes += t.estimated_minutes ?? 0;
  }
  const staffStats = Object.values(staffMap).sort((a, b) => b.count - a.count);

  // By day this week (Mon-Fri)
  const dayMap: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    dayMap[key] = 0;
  }
  for (const t of completedThisWeek) {
    if (!t.completed_at) continue;
    const key = t.completed_at.split('T')[0];
    if (key in dayMap) dayMap[key]++;
  }
  const dayStats: DayStat[] = Object.entries(dayMap).map(([k, v]) => ({
    label: getDayLabel(k),
    count: v,
  }));
  const maxDayCount = Math.max(...dayStats.map((d) => d.count), 1);

  // Identify tasks that consistently don't fit nap time (always still undone at nap end)
  const overflowTasks = napTasks.filter((t) => {
    const overFits = (t.estimated_minutes ?? 0) > 90;
    return overFits;
  });

  // Trend: last 4 weeks
  const weekTrends = [1, 2, 3, 4].map((offset) => {
    const start = getWeekStart(offset);
    const end = getWeekEnd(start);
    const count = napTasks.filter(
      (t) => t.status === 'done' && t.completed_at && new Date(t.completed_at) >= start && new Date(t.completed_at) <= end
    ).length;
    return { label: `${offset}w ago`, count };
  }).reverse();
  const maxWeekCount = Math.max(...weekTrends.map((w) => w.count), completedThisWeek.length, 1);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-christina-blue/10">
                <Moon className="h-5 w-5 text-christina-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedThisWeek.length}</p>
                <p className="text-sm text-muted-foreground">Tasks completed this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-christina-green/10">
                <BarChart3 className="h-5 w-5 text-christina-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMinutesUsed} min</p>
                <p className="text-sm text-muted-foreground">Total nap time used</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-christina-yellow/20">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{efficiencyRate}%</p>
                <p className="text-sm text-muted-foreground">Efficiency rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-christina-blue" />
              Tasks per Day This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-28">
              {dayStats.map((day) => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">{day.count}</span>
                  <div className="w-full bg-muted rounded-t-sm relative" style={{ height: '72px' }}>
                    <div
                      className="w-full bg-christina-blue rounded-t-sm absolute bottom-0 transition-all"
                      style={{ height: `${(day.count / maxDayCount) * 72}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend (last 4 weeks + this week) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-christina-green" />
              4-Week Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...weekTrends, { label: 'This week', count: completedThisWeek.length }].map((w) => (
                <div key={w.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{w.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2.5">
                    <div
                      className="bg-christina-green h-2.5 rounded-full transition-all"
                      style={{ width: `${(w.count / maxWeekCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{w.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By staff member */}
      {staffStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-christina-red" />
              By Staff Member
            </CardTitle>
            <CardDescription>Who completed what during nap time this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staffStats.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-christina-red/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-christina-red">
                      {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.minutes} min of work</p>
                  </div>
                  <Badge variant="secondary">{s.count} task{s.count !== 1 ? 's' : ''}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {overflowTasks.length > 0 && (
        <Card className="border-l-4 border-l-christina-yellow">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {overflowTasks.length} nap-time task{overflowTasks.length !== 1 ? 's' : ''} are estimated over 90 minutes and won&apos;t fit in the nap window. Consider reassigning these to a morning or afternoon block.
              </p>
              <div className="space-y-1 mt-2">
                {overflowTasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{t.title}</span>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {t.estimated_minutes} min
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
