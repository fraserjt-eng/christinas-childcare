'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  AlertTriangle,
  Moon,
  Users,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { Task } from '@/types/tasks';

const STORAGE_KEY = 'christinas_tasks';
const CHRISTINA_NAME = 'Christina Fraser';

function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function isThisWeek(dateStr: string): boolean {
  const { start, end } = getThisWeekRange();
  const d = new Date(dateStr);
  return d >= start && d < end;
}

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = (minutes / 60).toFixed(1).replace(/\.0$/, '');
  return `${h}h`;
}

interface InsightCard {
  id: string;
  icon: React.ReactNode;
  label: string;
  headline: string;
  detail: string;
  variant: 'info' | 'warning' | 'success' | 'neutral';
}

const VARIANT_STYLES: Record<InsightCard['variant'], { card: string; icon: string; badge: string }> = {
  info:    { card: 'border-blue-200 bg-blue-50/50',   icon: 'text-christina-blue',  badge: 'bg-blue-100 text-blue-700' },
  warning: { card: 'border-amber-200 bg-amber-50/50', icon: 'text-amber-600',        badge: 'bg-amber-100 text-amber-700' },
  success: { card: 'border-green-200 bg-green-50/50', icon: 'text-christina-green',  badge: 'bg-green-100 text-green-700' },
  neutral: { card: 'border-border bg-muted/20',       icon: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
};

export function TimeInsights() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw) as Task[]);
    } catch { /* ignore */ }
  }, []);

  const insights = useMemo<InsightCard[]>(() => {
    if (tasks.length === 0) return [];

    const weekTasks = tasks.filter((t) => isThisWeek(t.created_at));
    const allActive = tasks.filter((t) => t.status !== 'backlog');
    const cards: InsightCard[] = [];

    // ── Insight 1: Hours by category this week ─────────────────────────
    const categoryMinutes: Record<string, number> = {};
    weekTasks.forEach((t) => {
      const cat = t.category_name ?? 'Uncategorized';
      categoryMinutes[cat] = (categoryMinutes[cat] ?? 0) + (t.estimated_minutes ?? 30);
    });
    const topCategory = Object.entries(categoryMinutes).sort(([, a], [, b]) => b - a)[0];
    const secondCategory = Object.entries(categoryMinutes).sort(([, a], [, b]) => b - a)[1];
    const totalWeekMinutes = Object.values(categoryMinutes).reduce((s, v) => s + v, 0);

    if (topCategory) {
      const ratio = secondCategory
        ? (topCategory[1] / secondCategory[1]).toFixed(0)
        : null;
      cards.push({
        id: 'category-time',
        icon: <Clock className="h-5 w-5" />,
        label: 'Top Category',
        headline: `${formatHours(topCategory[1])} on ${topCategory[0]} this week`,
        detail: ratio && secondCategory
          ? `${ratio}x more than ${secondCategory[0]} (${formatHours(secondCategory[1])}).`
          : `That is ${totalWeekMinutes > 0 ? Math.round((topCategory[1] / totalWeekMinutes) * 100) : 0}% of your week.`,
        variant: topCategory[0] === 'Compliance/Licensing' ? 'warning' : 'info',
      });
    }

    // ── Insight 2: Delegatable tasks still done by Christina ────────────
    const delegatableCategories = new Set(['Care Duties', 'Food Program', 'Facilities/Supplies', 'Communication']);
    const christinaOwned = weekTasks.filter(
      (t) => (!t.assigned_to_name || t.assigned_to_name === CHRISTINA_NAME)
        && t.category_name
        && delegatableCategories.has(t.category_name)
    );
    if (christinaOwned.length > 0) {
      cards.push({
        id: 'delegation-gap',
        icon: <Users className="h-5 w-5" />,
        label: 'Delegation Gap',
        headline: `${christinaOwned.length} task${christinaOwned.length > 1 ? 's' : ''} you could delegate`,
        detail: `${christinaOwned.slice(0, 2).map((t) => t.title).join(', ')}${christinaOwned.length > 2 ? ` and ${christinaOwned.length - 2} more` : ''} — all assignable to staff.`,
        variant: christinaOwned.length >= 5 ? 'warning' : 'neutral',
      });
    }

    // ── Insight 3: Nap-time task completion ──────────────────────────────
    const napTasks = tasks.filter((t) => t.is_nap_time_task);
    const napDone = napTasks.filter((t) => t.status === 'done');
    if (napTasks.length > 0) {
      const pct = Math.round((napDone.length / napTasks.length) * 100);
      cards.push({
        id: 'nap-time',
        icon: <Moon className="h-5 w-5" />,
        label: 'Nap Time',
        headline: `${napDone.length} of ${napTasks.length} nap-time tasks done`,
        detail: pct >= 75
          ? `${pct}% completion rate — nap time is working well for you.`
          : `${pct}% completion. ${napTasks.length - napDone.length} nap-time tasks still open.`,
        variant: pct >= 75 ? 'success' : 'warning',
      });
    }

    // ── Insight 4: Drift risk (high drift_count) ──────────────────────
    const highDrift = allActive.filter((t) => t.drift_count >= 3);
    if (highDrift.length > 0) {
      cards.push({
        id: 'drift-risk',
        icon: <AlertTriangle className="h-5 w-5" />,
        label: 'Drift Risk',
        headline: `${highDrift.length} task${highDrift.length > 1 ? 's' : ''} missing standard repeatedly`,
        detail: `"${highDrift[0].title}" has drifted ${highDrift[0].drift_count} times${highDrift.length > 1 ? `. Plus ${highDrift.length - 1} more.` : '.'}`,
        variant: 'warning',
      });
    }

    // ── Insight 5: Completion rate this week ──────────────────────────
    const weekDone = weekTasks.filter((t) => t.status === 'done');
    if (weekTasks.length >= 3) {
      const rate = Math.round((weekDone.length / weekTasks.length) * 100);
      cards.push({
        id: 'completion',
        icon: <CheckCircle2 className="h-5 w-5" />,
        label: 'Completion Rate',
        headline: `${rate}% of this week's tasks done`,
        detail: rate >= 70
          ? `${weekDone.length} of ${weekTasks.length} tasks completed — solid week.`
          : `${weekTasks.length - weekDone.length} tasks still open. ${weekTasks.filter((t) => t.status === 'blocked').length} blocked.`,
        variant: rate >= 70 ? 'success' : rate >= 40 ? 'neutral' : 'warning',
      });
    }

    // ── Insight 6: Busiest time block ─────────────────────────────────
    const blockCounts: Record<string, number> = {};
    allActive.forEach((t) => {
      if (t.time_block_name) {
        blockCounts[t.time_block_name] = (blockCounts[t.time_block_name] ?? 0) + 1;
      }
    });
    const busiestBlock = Object.entries(blockCounts).sort(([, a], [, b]) => b - a)[0];
    if (busiestBlock && busiestBlock[1] >= 3) {
      cards.push({
        id: 'busiest-block',
        icon: <TrendingUp className="h-5 w-5" />,
        label: 'Busiest Block',
        headline: `${busiestBlock[0]} has the most tasks`,
        detail: `${busiestBlock[1]} active tasks clustered in this time block. Consider spreading workload.`,
        variant: busiestBlock[1] >= 6 ? 'warning' : 'info',
      });
    }

    return cards.slice(0, 4);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No task data yet.</p>
          <p className="text-xs mt-1">Add tasks to see time and delegation insights here.</p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-christina-green opacity-70" />
          <p className="text-sm">Not enough data for insights this week.</p>
          <p className="text-xs mt-1">Check back once more tasks are active.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {insights.map((insight) => {
        const styles = VARIANT_STYLES[insight.variant];
        return (
          <Card key={insight.id} className={`border ${styles.card}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${styles.icon}`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs px-1.5 py-0 ${styles.badge} border-0`}>
                      {insight.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold leading-snug">{insight.headline}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.detail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
