'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Task } from '@/types/tasks';

const STORAGE_KEY = 'christinas_tasks';
const CHRISTINA_NAME = 'Christina Fraser';

// Tasks only Christina can do based on category/keywords
const DELEGATABLE_CATEGORIES = new Set([
  'Care Duties',
  'Food Program',
  'Facilities/Supplies',
  'Communication',
]);

function isDelegatable(task: Task): boolean {
  if (!task.category_name) return true;
  return DELEGATABLE_CATEGORIES.has(task.category_name);
}


function getWeekRange(weeksAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const start = new Date(startOfThisWeek);
  start.setDate(start.getDate() - weeksAgo * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function isInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d >= start && d < end;
}

const STAFF_COLORS = [
  '#2196F3', '#4CAF50', '#FF7043', '#9C27B0', '#FF9800', '#607D8B', '#E91E63', '#00BCD4',
];

type Period = 'week' | 'month';

export function DelegationTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [period, setPeriod] = useState<Period>('week');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw) as Task[]);
    } catch { /* ignore */ }
  }, []);

  // Date range for selected period
  const { periodStart, periodEnd, prevStart, prevEnd } = useMemo(() => {
    const now = new Date();
    if (period === 'week') {
      const { start, end } = getWeekRange(0);
      const { start: ps, end: pe } = getWeekRange(1);
      return { periodStart: start, periodEnd: end, prevStart: ps, prevEnd: pe };
    } else {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { periodStart: start, periodEnd: end, prevStart, prevEnd };
    }
  }, [period]);

  // All active tasks (not backlog)
  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'backlog'),
    [tasks]
  );

  // This period tasks (by created_at)
  const periodTasks = useMemo(
    () => activeTasks.filter((t) => isInRange(t.created_at, periodStart, periodEnd)),
    [activeTasks, periodStart, periodEnd]
  );

  const prevPeriodTasks = useMemo(
    () => activeTasks.filter((t) => isInRange(t.created_at, prevStart, prevEnd)),
    [activeTasks, prevStart, prevEnd]
  );

  // Delegation score: % of tasks assigned to someone other than Christina
  const delegatedThisPeriod = periodTasks.filter(
    (t) => t.assigned_to_name && t.assigned_to_name !== CHRISTINA_NAME
  );
  const delegatedPrev = prevPeriodTasks.filter(
    (t) => t.assigned_to_name && t.assigned_to_name !== CHRISTINA_NAME
  );

  const score = periodTasks.length > 0
    ? Math.round((delegatedThisPeriod.length / periodTasks.length) * 100)
    : 0;
  const prevScore = prevPeriodTasks.length > 0
    ? Math.round((delegatedPrev.length / prevPeriodTasks.length) * 100)
    : 0;
  const scoreDelta = score - prevScore;

  // Christina-only tasks
  const christinaOnlyTasks = periodTasks.filter(
    (t) => t.assigned_to_name === CHRISTINA_NAME || !t.assigned_to_name
  );

  // Delegatable-but-not-delegated
  const shouldDelegateTasks = christinaOnlyTasks.filter((t) => isDelegatable(t));

  // Staff workload bars
  const staffWorkload = useMemo(() => {
    const map: Record<string, number> = {};
    activeTasks.forEach((t) => {
      const name = t.assigned_to_name ?? 'Unassigned';
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.split(' ')[0], fullName: name, count }))
      .sort((a, b) => b.count - a.count);
  }, [activeTasks]);

  const maxWorkload = Math.max(...staffWorkload.map((s) => s.count), 1);

  // Gauge ring
  const circumference = 2 * Math.PI * 54;
  const gaugeOffset = circumference - (score / 100) * circumference;
  const gaugeColor = score >= 70 ? '#4CAF50' : score >= 40 ? '#FF9800' : '#C62828';

  return (
    <div className="space-y-4">
      {/* Header + period filter */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['week', 'month'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 text-xs capitalize ${period === p ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setPeriod(p)}
            >
              This {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delegation Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Delegation Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* SVG gauge */}
              <div className="relative flex-shrink-0">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={gaugeOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                  <text x="64" y="60" textAnchor="middle" fontSize="24" fontWeight="bold" fill={gaugeColor}>
                    {score}%
                  </text>
                  <text x="64" y="80" textAnchor="middle" fontSize="11" fill="#6b7280">
                    delegated
                  </text>
                </svg>
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-2xl font-bold">{delegatedThisPeriod.length}</p>
                  <p className="text-xs text-muted-foreground">tasks delegated this {period}</p>
                </div>
                <div className="flex items-center gap-1">
                  {scoreDelta > 0 ? (
                    <TrendingUp className="h-4 w-4 text-christina-green" />
                  ) : scoreDelta < 0 ? (
                    <TrendingDown className="h-4 w-4 text-christina-coral" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm font-medium ${
                    scoreDelta > 0 ? 'text-christina-green' : scoreDelta < 0 ? 'text-christina-coral' : 'text-muted-foreground'
                  }`}>
                    {scoreDelta > 0 ? '+' : ''}{scoreDelta}% vs last {period}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{periodTasks.length} total tasks this {period}</p>
                  <p>{christinaOnlyTasks.length} handled by Christina</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff workload */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Workload (All Active Tasks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffWorkload.length === 0 ? (
              <p className="text-sm text-muted-foreground">No task assignments yet.</p>
            ) : (
              <div className="space-y-2">
                {staffWorkload.slice(0, 6).map((s, i) => (
                  <div key={s.fullName} className="flex items-center gap-3">
                    <span className="text-xs w-20 truncate font-medium">{s.name}</span>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(s.count / maxWorkload) * 100}%`,
                          backgroundColor: STAFF_COLORS[i % STAFF_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Christina-only vs delegatable split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
              <Lock className="h-4 w-4 text-christina-red" />
              Only Christina Can Do ({christinaOnlyTasks.filter((t) => !isDelegatable(t)).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {christinaOnlyTasks.filter((t) => !isDelegatable(t)).length === 0 ? (
              <p className="text-sm text-muted-foreground">None this {period}.</p>
            ) : (
              <ul className="space-y-1.5">
                {christinaOnlyTasks
                  .filter((t) => !isDelegatable(t))
                  .slice(0, 5)
                  .map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-christina-red flex-shrink-0" />
                      <span className="text-xs line-clamp-1">{t.title}</span>
                      {t.category_name && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">
                          {t.category_name.split('/')[0]}
                        </Badge>
                      )}
                    </li>
                  ))}
                {christinaOnlyTasks.filter((t) => !isDelegatable(t)).length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{christinaOnlyTasks.filter((t) => !isDelegatable(t)).length - 5} more
                  </p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600 font-medium">
              <ArrowRight className="h-4 w-4" />
              Could Be Delegated ({shouldDelegateTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shouldDelegateTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Great work — nothing obvious to delegate right now.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {shouldDelegateTasks.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-xs line-clamp-1">{t.title}</span>
                    {t.category_name && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">
                        {t.category_name.split('/')[0]}
                      </Badge>
                    )}
                  </li>
                ))}
                {shouldDelegateTasks.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{shouldDelegateTasks.length - 5} more
                  </p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
