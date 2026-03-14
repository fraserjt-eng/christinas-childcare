'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  getAssignments,
  getTemplates,
  createAssignment,
  completeTask,
  uncompleteTask,
  markAssignmentComplete,
  getAssignmentProgress,
  PHASE_LABELS,
  VERIFICATION_LABELS,
  type OnboardingAssignment,
  type OnboardingTemplate,
  type AssignmentProgress,
  type OnboardingPhaseKey,
} from '@/lib/onboarding-storage';
import {
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  Calendar,
  UserCheck,
} from 'lucide-react';

const PHASE_COLORS: Record<OnboardingPhaseKey, string> = {
  pre_start: 'bg-slate-100 text-slate-700',
  day_1: 'bg-blue-100 text-blue-700',
  week_1: 'bg-green-100 text-green-700',
  month_1: 'bg-purple-100 text-purple-700',
};

function getStatusInfo(progress: AssignmentProgress): {
  label: string;
  color: string;
  icon: React.ReactNode;
} {
  const { behind_tasks, percent_complete } = progress;
  if (percent_complete === 100) {
    return { label: 'Complete', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> };
  }
  if (behind_tasks.length > 2) {
    return { label: 'Behind', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> };
  }
  if (behind_tasks.length > 0) {
    return { label: 'Needs Attention', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> };
  }
  return { label: 'On Track', color: 'bg-green-100 text-green-800', icon: <TrendingUp className="h-3 w-3" /> };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Assignment detail ────────────────────────────────────────────────────────

interface AssignmentDetailProps {
  assignment: OnboardingAssignment;
  template: OnboardingTemplate;
  progress: AssignmentProgress;
  onUpdate: (updated: OnboardingAssignment) => void;
}

function AssignmentDetail({ assignment, template, progress, onUpdate }: AssignmentDetailProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['pre_start', 'day_1', 'week_1', 'month_1']));

  function togglePhase(phase: string) {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  }

  async function handleToggleTask(taskId: string) {
    const isComplete = !!assignment.task_completions[taskId];
    let updated: OnboardingAssignment | null;
    if (isComplete) {
      updated = await uncompleteTask(assignment.id, taskId);
      if (updated) onUpdate(updated);
    } else {
      updated = await completeTask(assignment.id, taskId);
      if (updated) onUpdate(updated);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
        <div className="flex-1">
          <p className="text-sm font-medium">{assignment.employee_name}</p>
          <p className="text-xs text-muted-foreground">
            Started {formatDate(assignment.start_date)} — Day {progress.days_elapsed}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{progress.percent_complete}%</p>
          <p className="text-xs text-muted-foreground">{progress.completed_tasks} of {progress.total_tasks}</p>
        </div>
      </div>

      <Progress value={progress.percent_complete} className="h-2" />

      {template.phases.map(phase => {
        const isExpanded = expandedPhases.has(phase.name);
        const phaseCompleted = phase.tasks.filter(t => !!assignment.task_completions[t.id]).length;
        const phaseBehind = phase.tasks.filter(t => {
          const isDue = progress.days_elapsed >= Math.max(0, t.due_offset_days);
          return isDue && !assignment.task_completions[t.id];
        }).length;

        return (
          <div key={phase.name} className="rounded-lg border">
            <button
              type="button"
              onClick={() => togglePhase(phase.name)}
              className="flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-muted/30 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                <Badge className={`text-xs ${PHASE_COLORS[phase.name]}`}>
                  {PHASE_LABELS[phase.name]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {phaseCompleted}/{phase.tasks.length}
                </span>
                {phaseBehind > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                    {phaseBehind} overdue
                  </Badge>
                )}
              </div>
            </button>
            {isExpanded && phase.tasks.length > 0 && (
              <div className="px-3 pb-3 space-y-2">
                {phase.tasks.map(task => {
                  const isComplete = !!assignment.task_completions[task.id];
                  const completion = assignment.task_completions[task.id];
                  const isDue = progress.days_elapsed >= Math.max(0, task.due_offset_days);
                  const isOverdue = isDue && !isComplete;

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                        isComplete ? 'bg-green-50/50 border-green-100' : isOverdue ? 'bg-yellow-50/30 border-yellow-100' : 'bg-background'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className="mt-0.5 shrink-0"
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isComplete ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {task.responsible}
                          </span>
                          <Badge variant="outline" className="text-xs h-5">
                            {VERIFICATION_LABELS[task.verification]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Day {task.due_offset_days}
                          </span>
                          {completion?.verified_by && (
                            <span className="text-xs text-green-600">
                              Signed off by {completion.verified_by}
                            </span>
                          )}
                          {completion?.completed_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(completion.completed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── New assignment dialog ─────────────────────────────────────────────────────

interface NewAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  templates: OnboardingTemplate[];
  onCreated: (assignment: OnboardingAssignment) => void;
}

function NewAssignmentDialog({ open, onClose, templates, onCreated }: NewAssignmentDialogProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!employeeName.trim() || !templateId || !startDate) return;
    setSaving(true);
    try {
      const assignment = await createAssignment({
        employee_id: `emp_${Date.now()}`,
        employee_name: employeeName.trim(),
        template_id: templateId,
        start_date: startDate,
      });
      onCreated(assignment);
      setEmployeeName('');
      setStartDate(new Date().toISOString().split('T')[0]);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Onboarding</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-emp-name">Employee Name</Label>
            <Input
              id="new-emp-name"
              value={employeeName}
              onChange={e => setEmployeeName(e.target.value)}
              placeholder="e.g. Alex Rivera"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-template">Onboarding Template</Label>
            <select
              id="new-template"
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-start">Start Date</Label>
            <Input
              id="new-start"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !employeeName.trim() || !templateId}
              className="flex-1 bg-christina-red hover:bg-christina-red/90 text-white"
            >
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : null}
              Start Onboarding
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function OnboardingTracker() {
  const [assignments, setAssignments] = useState<OnboardingAssignment[]>([]);
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed'>('active');

  async function load() {
    const [a, t] = await Promise.all([
      getAssignments({ status: statusFilter }),
      getTemplates(),
    ]);
    setAssignments(a);
    setTemplates(t);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function getTemplate(templateId: string): OnboardingTemplate | undefined {
    return templates.find(t => t.id === templateId);
  }

  function handleUpdate(updated: OnboardingAssignment) {
    setAssignments(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  }

  async function handleMarkComplete(assignmentId: string) {
    const updated = await markAssignmentComplete(assignmentId);
    if (updated) handleUpdate(updated);
  }

  // Summary stats
  const activeCount = assignments.length;
  const avgProgress = assignments.length > 0
    ? Math.round(assignments.reduce((sum, a) => {
        const t = getTemplate(a.template_id);
        if (!t) return sum;
        return sum + getAssignmentProgress(a, t).percent_complete;
      }, 0) / assignments.length)
    : 0;
  const behindCount = assignments.filter(a => {
    const t = getTemplate(a.template_id);
    if (!t) return false;
    return getAssignmentProgress(a, t).behind_tasks.length > 0;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red mr-3" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-christina-blue">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-christina-green">{avgProgress}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={`text-2xl font-bold ${behindCount > 0 ? 'text-yellow-600' : 'text-christina-green'}`}>
              {behindCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Need Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border p-1 bg-muted/30">
          {(['active', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button
          onClick={() => setShowNewDialog(true)}
          size="sm"
          className="bg-christina-red hover:bg-christina-red/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Onboarding
        </Button>
      </div>

      {/* Assignment list */}
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No {statusFilter} onboardings</p>
          {statusFilter === 'active' && (
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click &quot;New Onboarding&quot; when a new hire starts.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(assignment => {
            const template = getTemplate(assignment.template_id);
            if (!template) return null;
            const progress = getAssignmentProgress(assignment, template);
            const status = getStatusInfo(progress);
            const isExpanded = expandedId === assignment.id;

            return (
              <Card key={assignment.id} className="overflow-hidden">
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{assignment.employee_name}</p>
                          <Badge className={`text-xs flex items-center gap-1 ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                          <Badge className={`text-xs ${PHASE_COLORS[progress.current_phase]}`}>
                            {PHASE_LABELS[progress.current_phase]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex-1 max-w-[200px]">
                            <Progress value={progress.percent_complete} className="h-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progress.percent_complete}%
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Day {progress.days_elapsed}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t pt-4 bg-muted/10">
                      <AssignmentDetail
                        assignment={assignment}
                        template={template}
                        progress={progress}
                        onUpdate={handleUpdate}
                      />
                      {assignment.status === 'active' && progress.percent_complete === 100 && (
                        <Button
                          onClick={() => handleMarkComplete(assignment.id)}
                          size="sm"
                          className="bg-christina-green hover:bg-christina-green/90 text-white"
                        >
                          <UserCheck className="h-4 w-4 mr-1.5" />
                          Mark Onboarding Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <NewAssignmentDialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        templates={templates}
        onCreated={a => { setAssignments(prev => [a, ...prev]); }}
      />
    </div>
  );
}
