'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, AlertTriangle, TrendingUp, Users } from 'lucide-react';
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

function getDelegationScore(delegated: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((delegated / total) * 100);
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-700';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-green-100';
  if (score >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
}

export function DelegationDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(() => setTasks(getTasks()), []);
  useEffect(() => { load(); }, [load]);

  const thisWeekStart = getWeekStart(0);
  const thisWeekEnd = getWeekEnd(thisWeekStart);

  const thisWeekTasks = tasks.filter((t) => {
    const d = new Date(t.created_at);
    return d >= thisWeekStart && d <= thisWeekEnd;
  });

  const christinaTasks = thisWeekTasks.filter(
    (t) => !t.delegated_by && (!t.assigned_to_name || t.assigned_to_name === 'Christina Fraser' || t.assigned_to_name === 'Ophelia Zeogar')
  );
  const delegatedTasks = thisWeekTasks.filter((t) => !!t.delegated_by);

  const total = thisWeekTasks.length;
  const delegatedCount = delegatedTasks.length;
  const christinaCount = christinaTasks.length;
  const delegationScore = getDelegationScore(delegatedCount, total);

  // Pie chart via CSS
  const delegatedPct = total > 0 ? (delegatedCount / total) * 100 : 0;
  const christinaPct = total > 0 ? (christinaCount / total) * 100 : 0;

  // Delegation wins: completed delegated tasks
  const delegationWins = tasks.filter(
    (t) => t.status === 'done' && t.delegated_by && t.completed_at
  );
  const timeSaved = delegationWins.reduce((s, t) => s + (t.estimated_minutes ?? 0), 0);

  // Stuck delegations: assigned to others, not done, created > 3 days ago
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const stuckDelegations = tasks.filter((t) => {
    const isAssignedToOther =
      t.assigned_to_name &&
      t.assigned_to_name !== 'Christina Fraser' &&
      t.assigned_to_name !== 'Ophelia Zeogar';
    return (
      isAssignedToOther &&
      t.status !== 'done' &&
      new Date(t.created_at) < threeDaysAgo
    );
  });

  // Week trend (last 4 weeks)
  const weekTrends = [3, 2, 1, 0].map((offset) => {
    const start = getWeekStart(offset);
    const end = getWeekEnd(start);
    const weekTotal = tasks.filter((t) => {
      const d = new Date(t.created_at);
      return d >= start && d <= end;
    }).length;
    const weekDelegated = tasks.filter((t) => {
      const d = new Date(t.created_at);
      return d >= start && d <= end && !!t.delegated_by;
    }).length;
    const score = getDelegationScore(weekDelegated, weekTotal);
    return {
      label: offset === 0 ? 'This week' : `${offset}w ago`,
      score,
      delegated: weekDelegated,
      total: weekTotal,
    };
  });

  return (
    <div className="space-y-4">
      {/* Score + Pie */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Delegation score */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getScoreBg(delegationScore)} ${getScoreColor(delegationScore)}`}
              >
                {delegationScore}
              </div>
              <div>
                <p className="font-semibold">Delegation Score</p>
                <p className="text-sm text-muted-foreground">
                  {delegatedCount} of {total} tasks delegated this week
                </p>
                <Badge
                  className={
                    delegationScore >= 70
                      ? 'bg-green-100 text-green-800 mt-1'
                      : delegationScore >= 40
                      ? 'bg-yellow-100 text-amber-700 mt-1'
                      : 'bg-red-100 text-red-800 mt-1'
                  }
                >
                  {delegationScore >= 70 ? 'Strong' : delegationScore >= 40 ? 'Building' : 'Low'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSS pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">TASK OWNERSHIP THIS WEEK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {total > 0 ? (
                <div
                  className="w-14 h-14 rounded-full shrink-0"
                  style={{
                    background: `conic-gradient(
                      #4CAF50 0% ${delegatedPct}%,
                      #C62828 ${delegatedPct}% ${delegatedPct + christinaPct}%,
                      #e5e7eb ${delegatedPct + christinaPct}% 100%
                    )`,
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted shrink-0" />
              )}
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-christina-green shrink-0" />
                  <span>Delegated: {delegatedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-christina-red shrink-0" />
                  <span>Christina: {christinaCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30 shrink-0" />
                  <span>Other: {total - delegatedCount - christinaCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delegation trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-christina-blue" />
            Delegation Ratio Trend
          </CardTitle>
          <CardDescription>Score = delegated / total tasks per week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weekTrends.map((w) => (
              <div key={w.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{w.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${w.score >= 70 ? 'bg-christina-green' : w.score >= 40 ? 'bg-yellow-400' : 'bg-christina-red'}`}
                    style={{ width: `${w.score}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-10 text-right">{w.score}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delegation wins */}
      <Card className="border-l-4 border-l-christina-green">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-christina-green" />
            Delegation Wins
          </CardTitle>
          <CardDescription>
            {delegationWins.length} delegated tasks completed — {timeSaved} min of Christina&apos;s time saved
          </CardDescription>
        </CardHeader>
        {delegationWins.length > 0 && (
          <CardContent>
            <div className="space-y-2">
              {delegationWins.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{t.assigned_to_name}</span>
                    {t.estimated_minutes && (
                      <Badge variant="secondary" className="text-xs">
                        {t.estimated_minutes} min
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {delegationWins.length > 6 && (
                <p className="text-xs text-muted-foreground">+{delegationWins.length - 6} more</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stuck delegations */}
      {stuckDelegations.length > 0 && (
        <Card className="border-l-4 border-l-christina-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Stuck Delegations
            </CardTitle>
            <CardDescription>
              {stuckDelegations.length} task{stuckDelegations.length !== 1 ? 's' : ''} assigned to others with no progress after 3+ days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stuckDelegations.map((t) => {
                const daysOld = Math.floor(
                  (Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={t.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.assigned_to_name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        {daysOld}d old
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
