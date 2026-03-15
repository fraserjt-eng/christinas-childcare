'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ListTodo,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Calendar,
} from 'lucide-react';
import {
  getAllActionItems,
  completeActionItemGlobal,
  getMeetingStats,
  type ActionItem,
  type MeetingStats,
} from '@/lib/meeting-storage';

type FilterMode = 'all' | 'pending' | 'overdue' | 'completed';

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
];

export function ActionItemTracker() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const today = new Date().toISOString().split('T')[0];

  function refresh() {
    setItems(getAllActionItems());
    setStats(getMeetingStats());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleComplete(item: ActionItem) {
    completeActionItemGlobal(item.id);
    refresh();
  }

  const filtered = items.filter(item => {
    const isOverdue = item.status === 'pending' && item.due_date < today;
    switch (filter) {
      case 'pending': return item.status === 'pending' && !isOverdue;
      case 'overdue': return isOverdue;
      case 'completed': return item.status === 'completed';
      default: return true;
    }
  });

  const overdueCount = items.filter(i => i.status === 'pending' && i.due_date < today).length;
  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Action Item Tracker</h2>
        <p className="text-sm text-muted-foreground">All action items across every meeting, sorted by due date</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ListTodo className="h-4 w-4 text-christina-blue" />
                <span className="text-xs text-muted-foreground">Total Pending</span>
              </div>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className={overdueCount > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`h-4 w-4 ${overdueCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground">Overdue</span>
              </div>
              <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : ''}`}>{overdueCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-christina-green" />
                <span className="text-xs text-muted-foreground">Completion Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.completion_rate}%</p>
              <Progress value={stats.completion_rate} className="h-1.5 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Items</span>
              </div>
              <p className="text-2xl font-bold">{stats.total_action_items}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === opt.value
                ? 'bg-christina-red text-white border-christina-red'
                : 'bg-muted text-muted-foreground border-muted hover:border-christina-red hover:text-christina-red'
            }`}
          >
            {opt.label}
            {opt.value === 'overdue' && overdueCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">{overdueCount}</span>
            )}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-1">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              {filter === 'overdue' ? 'No overdue items. Great work!' :
               filter === 'completed' ? 'No completed items yet.' :
               filter === 'pending' ? 'No pending items.' :
               'No action items yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const isOverdue = item.status === 'pending' && item.due_date < today;
            const daysUntilDue = Math.ceil((new Date(item.due_date).getTime() - new Date(today).getTime()) / 86400000);

            return (
              <Card
                key={item.id}
                className={`transition-colors ${
                  isOverdue ? 'border-red-200 bg-red-50/50' :
                  item.status === 'completed' ? 'opacity-70' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-christina-green" />
                      ) : isOverdue ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <ListTodo className="h-5 w-5 text-christina-blue" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {item.task}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="font-medium text-foreground">{item.owner}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {item.due_date}
                          {item.status === 'pending' && (
                            <span className={`ml-0.5 ${isOverdue ? 'text-red-600 font-medium' : daysUntilDue <= 2 ? 'text-yellow-600' : ''}`}>
                              {isOverdue ? `(${Math.abs(daysUntilDue)}d overdue)` :
                               daysUntilDue === 0 ? '(today)' :
                               daysUntilDue === 1 ? '(tomorrow)' :
                               `(in ${daysUntilDue}d)`}
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground/70">from: {item.meeting_title}</span>
                      </div>
                      {item.status === 'completed' && item.completed_at && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Completed {new Date(item.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Right side badges + action */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {isOverdue && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Overdue</Badge>
                      )}
                      {item.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Done</Badge>
                      )}
                      {item.status === 'pending' && !isOverdue && daysUntilDue <= 2 && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">Due soon</Badge>
                      )}
                      {item.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(item)}
                          className="gap-1.5 h-7 text-xs hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </Button>
                      )}
                    </div>
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
