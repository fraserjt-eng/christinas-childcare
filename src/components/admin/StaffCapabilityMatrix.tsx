'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Grid3X3, AlertTriangle, X } from 'lucide-react';
import type { Task } from '@/types/tasks';

const TASKS_KEY = 'christinas_tasks';

const CATEGORIES = [
  'Admin/Paperwork',
  'Care Duties',
  'Communication',
  'Compliance/Licensing',
  'Curriculum/Teaching',
  'Food Program',
  'Facilities/Supplies',
];

function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface CellData {
  completed: number;
  total: number;
  tasks: Task[];
}

type MatrixData = Record<string, Record<string, CellData>>;

function getCellStyle(completed: number): {
  bg: string;
  text: string;
  label: string;
} {
  if (completed >= 3) return { bg: 'bg-green-100 hover:bg-green-200', text: 'text-green-800', label: 'Strong' };
  if (completed >= 1) return { bg: 'bg-yellow-100 hover:bg-yellow-200', text: 'text-yellow-800', label: 'Some' };
  return { bg: 'bg-muted/50 hover:bg-muted', text: 'text-muted-foreground', label: 'None' };
}

export function StaffCapabilityMatrix() {
  const [matrix, setMatrix] = useState<MatrixData>({});
  const [staffNames, setStaffNames] = useState<string[]>([]);
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ staff: string; category: string; tasks: Task[] } | null>(null);

  const build = useCallback(() => {
    const tasks = getTasks();

    // Extract unique staff from assigned_to_name
    const namesSet = new Set<string>();
    for (const t of tasks) {
      if (t.assigned_to_name) namesSet.add(t.assigned_to_name);
      if (t.completed_by) namesSet.add(t.completed_by);
    }
    const names = Array.from(namesSet).sort();
    setStaffNames(names);

    // Build matrix: staff x category -> completed count
    const data: MatrixData = {};
    for (const name of names) {
      data[name] = {};
      for (const cat of CATEGORIES) {
        data[name][cat] = { completed: 0, total: 0, tasks: [] };
      }
    }

    for (const t of tasks) {
      if (!t.category_name) continue;
      const cat = t.category_name;
      if (!CATEGORIES.includes(cat)) continue;

      // Count by assigned_to_name
      if (t.assigned_to_name) {
        const name = t.assigned_to_name;
        if (!data[name]) continue;
        if (!data[name][cat]) data[name][cat] = { completed: 0, total: 0, tasks: [] };
        data[name][cat].total++;
        data[name][cat].tasks.push(t);

        if (t.status === 'done') {
          data[name][cat].completed++;
        }
      }

      // Also credit completed_by
      if (t.completed_by && t.completed_by !== t.assigned_to_name) {
        const name = t.completed_by;
        if (!data[name]) {
          data[name] = {};
          for (const c of CATEGORIES) data[name][c] = { completed: 0, total: 0, tasks: [] };
        }
        if (!data[name][cat]) data[name][cat] = { completed: 0, total: 0, tasks: [] };
        data[name][cat].completed++;
        if (!data[name][cat].tasks.find((tsk) => tsk.id === t.id)) {
          data[name][cat].tasks.push(t);
        }
      }
    }

    setMatrix(data);

    // Find bottlenecks: categories where only 1-2 staff have completed tasks
    const found: string[] = [];
    for (const cat of CATEGORIES) {
      const capable = names.filter((n) => (data[n]?.[cat]?.completed ?? 0) >= 1);
      if (capable.length <= 2 && capable.length > 0) {
        found.push(`Only ${capable.join(' and ')} can handle ${cat} tasks`);
      }
    }
    setBottlenecks(found);
  }, []);

  useEffect(() => { build(); }, [build]);

  const shortCat = (cat: string) => {
    const map: Record<string, string> = {
      'Admin/Paperwork': 'Admin',
      'Care Duties': 'Care',
      'Communication': 'Comms',
      'Compliance/Licensing': 'Compliance',
      'Curriculum/Teaching': 'Curriculum',
      'Food Program': 'Food',
      'Facilities/Supplies': 'Facilities',
    };
    return map[cat] ?? cat;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-christina-red" />
            Staff Capability Matrix
          </CardTitle>
          <CardDescription>
            Based on historical task completions. Green = 3+ completed, Yellow = 1-2, Gray = none.
            Click any cell to see the tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staffNames.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No task data yet. Complete tasks to build the capability matrix.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-semibold text-muted-foreground min-w-32 sticky left-0 bg-background">
                      Staff
                    </th>
                    {CATEGORIES.map((cat) => (
                      <th
                        key={cat}
                        className="text-center py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap text-xs"
                        title={cat}
                      >
                        {shortCat(cat)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staffNames.map((name) => (
                    <tr key={name} className="border-t border-border/50">
                      <td className="py-2 pr-4 font-medium text-sm sticky left-0 bg-background whitespace-nowrap">
                        {name}
                      </td>
                      {CATEGORIES.map((cat) => {
                        const cell = matrix[name]?.[cat] ?? { completed: 0, total: 0, tasks: [] };
                        const style = getCellStyle(cell.completed);
                        return (
                          <td key={cat} className="py-1.5 px-2 text-center">
                            <button
                              onClick={() => setSelectedCell({ staff: name, category: cat, tasks: cell.tasks })}
                              className={`w-full min-w-10 py-1.5 rounded-md transition-colors font-semibold text-xs ${style.bg} ${style.text}`}
                              title={`${name} / ${cat}: ${cell.completed} completed`}
                            >
                              {cell.completed > 0 ? cell.completed : '-'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-green-100" />
              <span className="text-muted-foreground">Strong (3+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-yellow-100" />
              <span className="text-muted-foreground">Some (1-2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-muted" />
              <span className="text-muted-foreground">None</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck warnings */}
      {bottlenecks.length > 0 && (
        <Card className="border-l-4 border-l-christina-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Capability Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {bottlenecks.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cell detail dialog */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedCell?.staff} — {selectedCell?.category}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedCell && (
            <div className="space-y-3">
              {selectedCell.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks in this category for this staff member.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedCell.tasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start justify-between gap-2 p-2.5 rounded-md bg-muted/50 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {t.title}
                        </p>
                        {t.completed_at && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Completed {new Date(t.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={
                          t.status === 'done'
                            ? 'bg-green-100 text-green-800 shrink-0'
                            : 'bg-muted text-muted-foreground shrink-0'
                        }
                      >
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedCell(null)}
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
