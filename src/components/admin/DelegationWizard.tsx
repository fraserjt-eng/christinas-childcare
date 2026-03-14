'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Users, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
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

function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

interface StaffSuggestion {
  name: string;
  id?: string;
  completedInCategory: number;
  totalInCategory: number;
  successRate: number;
  activeTasks: number;
  confidence: 'high' | 'medium' | 'low';
}

const CONFIDENCE_CONFIG = {
  high: { label: 'High confidence', className: 'bg-green-100 text-green-800', minCompleted: 3 },
  medium: { label: 'Medium confidence', className: 'bg-yellow-100 text-yellow-800', minCompleted: 1 },
  low: { label: 'Low confidence', className: 'bg-red-100 text-red-800', minCompleted: 0 },
};

interface DelegationWizardProps {
  task: Task;
  onDelegated?: (taskId: string, assignedTo: string, assignedToName: string) => void;
}

export function DelegationWizard({ task, onDelegated }: DelegationWizardProps) {
  const [suggestions, setSuggestions] = useState<StaffSuggestion[]>([]);
  const [delegated, setDelegated] = useState(false);
  const [keptForChristina, setKeptForChristina] = useState(false);

  const analyze = useCallback(() => {
    const allTasks = getTasks();

    // Build staff competency map from historical completions
    const staffCompletions: Record<string, { completed: number; total: number; id?: string }> = {};
    const staffActive: Record<string, number> = {};

    for (const t of allTasks) {
      if (!t.assigned_to_name) continue;
      const name = t.assigned_to_name;

      // Count active tasks per staff
      if (t.status !== 'done') {
        staffActive[name] = (staffActive[name] ?? 0) + 1;
      }

      // Count category-specific completions
      if (t.category_name === task.category_name && t.completed_by) {
        const completedByName = t.completed_by;
        if (!staffCompletions[completedByName]) {
          staffCompletions[completedByName] = { completed: 0, total: 0, id: t.assigned_to };
        }
        staffCompletions[completedByName].completed++;
        staffCompletions[completedByName].total++;
      } else if (t.category_name === task.category_name) {
        if (!staffCompletions[name]) {
          staffCompletions[name] = { completed: 0, total: 0, id: t.assigned_to };
        }
        staffCompletions[name].total++;
      }
    }

    // Build suggestions list
    const result: StaffSuggestion[] = Object.entries(staffCompletions)
      .filter(([name]) => name !== 'Christina Fraser' && name !== 'Ophelia Zeogar')
      .map(([name, stats]) => {
        const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        const confidence: 'high' | 'medium' | 'low' =
          stats.completed >= 3 ? 'high' : stats.completed >= 1 ? 'medium' : 'low';
        return {
          name,
          id: stats.id,
          completedInCategory: stats.completed,
          totalInCategory: stats.total,
          successRate,
          activeTasks: staffActive[name] ?? 0,
          confidence,
        };
      })
      .sort((a, b) => b.completedInCategory - a.completedInCategory);

    setSuggestions(result);
  }, [task.category_name]);

  useEffect(() => {
    analyze();
  }, [analyze]);

  function delegate(suggestion: StaffSuggestion) {
    const allTasks = getTasks();
    const idx = allTasks.findIndex((t) => t.id === task.id);
    if (idx === -1) return;
    allTasks[idx] = {
      ...allTasks[idx],
      assigned_to: suggestion.id,
      assigned_to_name: suggestion.name,
      delegated_by: 'Christina Fraser',
      updated_at: new Date().toISOString(),
    };
    saveTasks(allTasks);
    setDelegated(true);
    onDelegated?.(task.id, suggestion.id ?? suggestion.name, suggestion.name);
  }

  function keepForChristina() {
    const allTasks = getTasks();
    const idx = allTasks.findIndex((t) => t.id === task.id);
    if (idx === -1) return;
    allTasks[idx] = {
      ...allTasks[idx],
      assigned_to: 'christina',
      assigned_to_name: 'Christina Fraser',
      delegated_by: undefined,
      updated_at: new Date().toISOString(),
    };
    saveTasks(allTasks);
    setKeptForChristina(true);
  }

  if (delegated) {
    return (
      <Card className="border-green-200">
        <CardContent className="py-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">Task delegated successfully.</p>
        </CardContent>
      </Card>
    );
  }

  if (keptForChristina) {
    return (
      <Card className="border-blue-200">
        <CardContent className="py-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-christina-blue shrink-0" />
          <p className="text-sm font-medium text-christina-blue">Kept for Christina.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-christina-blue">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-christina-blue" />
          Delegation Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.category_name && (
          <p className="text-sm text-muted-foreground">
            This is a <span className="font-medium text-foreground">{task.category_name}</span> task.
            {suggestions.length > 0
              ? ` ${suggestions[0].name} has handled similar tasks before.`
              : ' No historical data for this category yet.'}
          </p>
        )}

        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No staff match found for this category. Assign manually.
          </p>
        ) : (
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{s.name}</span>
                    <Badge className={CONFIDENCE_CONFIG[s.confidence].className + ' text-xs'}>
                      {CONFIDENCE_CONFIG[s.confidence].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {s.completedInCategory} completed in this category
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {s.activeTasks} active task{s.activeTasks !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-christina-blue text-christina-blue hover:bg-blue-50"
                  onClick={() => delegate(s)}
                >
                  Delegate
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-1 border-t">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            onClick={keepForChristina}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Keep for Christina
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
