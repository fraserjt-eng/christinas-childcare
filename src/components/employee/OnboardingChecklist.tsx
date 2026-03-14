'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getAssignments,
  getTemplates,
  completeTask,
  uncompleteTask,
  requestSignoff,
  getAssignmentProgress,
  PHASE_LABELS,
  VERIFICATION_LABELS,
  type OnboardingAssignment,
  type OnboardingTemplate,
  type OnboardingPhaseKey,
  type VerificationMethod,
} from '@/lib/onboarding-storage';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  BookOpen,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Loader2,
  PartyPopper,
  CalendarDays,
} from 'lucide-react';

const PHASE_COLORS: Record<OnboardingPhaseKey, string> = {
  pre_start: 'bg-slate-100 text-slate-700 border-slate-200',
  day_1: 'bg-blue-100 text-blue-700 border-blue-200',
  week_1: 'bg-green-100 text-green-700 border-green-200',
  month_1: 'bg-purple-100 text-purple-700 border-purple-200',
};

const VERIFICATION_ICONS: Record<VerificationMethod, React.ReactNode> = {
  self_check: <CheckCircle2 className="h-3 w-3" />,
  supervisor_signoff: <UserCheck className="h-3 w-3" />,
  quiz: <BookOpen className="h-3 w-3" />,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── Phase progress pip ───────────────────────────────────────────────────────

interface PhasePipProps {
  phase: OnboardingPhaseKey;
  isCurrent: boolean;
  isComplete: boolean;
}

function PhasePip({ phase, isCurrent, isComplete }: PhasePipProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
          isComplete
            ? 'bg-christina-green border-christina-green text-white'
            : isCurrent
            ? 'bg-white border-christina-blue text-christina-blue'
            : 'bg-muted border-muted-foreground/30 text-muted-foreground/50'
        }`}
      >
        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : PHASE_LABELS[phase].charAt(0)}
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[56px]">
        {PHASE_LABELS[phase]}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingChecklist() {
  const [assignment, setAssignment] = useState<OnboardingAssignment | null>(null);
  const [template, setTemplate] = useState<OnboardingTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<OnboardingPhaseKey>>(
    new Set<OnboardingPhaseKey>(['pre_start', 'day_1', 'week_1', 'month_1'])
  );
  const [requestingSignoff, setRequestingSignoff] = useState<Set<string>>(new Set());
  const [signoffRequested, setSignoffRequested] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const [assignments, templates] = await Promise.all([
        getAssignments({ status: 'active' }),
        getTemplates(),
      ]);

      // In production, match to the current employee.
      // For demo, use the first active assignment.
      const a = assignments[0] ?? null;
      if (a) {
        const t = templates.find(t => t.id === a.template_id) ?? null;
        setAssignment(a);
        setTemplate(t);
      }
      setLoading(false);
    }
    load();
  }, []);

  function togglePhase(phase: OnboardingPhaseKey) {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  }

  async function handleToggleTask(taskId: string, isSelfCheck: boolean) {
    if (!assignment) return;
    const isComplete = !!assignment.task_completions[taskId];

    let updated: OnboardingAssignment | null = null;
    if (isComplete && isSelfCheck) {
      updated = await uncompleteTask(assignment.id, taskId);
    } else if (!isComplete && isSelfCheck) {
      updated = await completeTask(assignment.id, taskId);
    }

    if (updated) setAssignment(updated);
  }

  async function handleRequestSignoff(taskId: string) {
    if (!assignment) return;
    setRequestingSignoff(prev => new Set(prev).add(taskId));
    await requestSignoff(assignment.id, taskId);
    setRequestingSignoff(prev => { const n = new Set(prev); n.delete(taskId); return n; });
    setSignoffRequested(prev => new Set(prev).add(taskId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        Loading your onboarding...
      </div>
    );
  }

  if (!assignment || !template) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-muted-foreground">No active onboarding</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Ask your director to start your onboarding checklist.
          </p>
        </CardContent>
      </Card>
    );
  }

  const progress = getAssignmentProgress(assignment, template);

  // Determine phase completion
  const phaseCompletion: Record<OnboardingPhaseKey, boolean> = {
    pre_start: template.phases.find(p => p.name === 'pre_start')?.tasks.every(t => !!assignment.task_completions[t.id]) ?? true,
    day_1: template.phases.find(p => p.name === 'day_1')?.tasks.every(t => !!assignment.task_completions[t.id]) ?? true,
    week_1: template.phases.find(p => p.name === 'week_1')?.tasks.every(t => !!assignment.task_completions[t.id]) ?? true,
    month_1: template.phases.find(p => p.name === 'month_1')?.tasks.every(t => !!assignment.task_completions[t.id]) ?? true,
  };

  const isFullyComplete = progress.percent_complete === 100;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Progress header */}
      <Card className="border-l-4 border-l-christina-blue">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="font-bold text-lg">{template.name}</h2>
              <p className="text-sm text-muted-foreground">
                Started {formatDate(assignment.start_date)} — Day {progress.days_elapsed}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-christina-blue">{progress.percent_complete}%</p>
              <p className="text-xs text-muted-foreground">{progress.completed_tasks} of {progress.total_tasks} done</p>
            </div>
          </div>

          <Progress value={progress.percent_complete} className="h-2.5 mb-4" />

          {/* Phase indicators */}
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-0" />
            {(['pre_start', 'day_1', 'week_1', 'month_1'] as OnboardingPhaseKey[]).map(phase => (
              <PhasePip
                key={phase}
                phase={phase}
                isCurrent={progress.current_phase === phase}
                isComplete={phaseCompletion[phase]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {progress.behind_tasks.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">
                {progress.behind_tasks.length} overdue {progress.behind_tasks.length === 1 ? 'task' : 'tasks'} — check in with your director.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion banner */}
      {isFullyComplete && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4 pb-4 text-center">
            <PartyPopper className="h-8 w-8 text-christina-green mx-auto mb-2" />
            <p className="font-bold text-green-700">Onboarding Complete!</p>
            <p className="text-sm text-green-600 mt-1">
              Great work. Let your director know you&apos;ve finished everything.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Phase sections */}
      {template.phases.map(phase => {
        const isExpanded = expandedPhases.has(phase.name);
        const phaseCompleted = phase.tasks.filter(t => !!assignment.task_completions[t.id]).length;
        const allDone = phaseCompleted === phase.tasks.length;

        return (
          <Card key={phase.name} className={allDone ? 'opacity-80' : ''}>
            <button
              type="button"
              onClick={() => togglePhase(phase.name)}
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Badge className={`text-xs ${PHASE_COLORS[phase.name]}`}>
                  {PHASE_LABELS[phase.name]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {phaseCompleted}/{phase.tasks.length}
                </span>
                {allDone && <CheckCircle2 className="h-4 w-4 text-christina-green" />}
              </div>
            </button>

            {isExpanded && (
              <CardContent className="pt-0 pb-3 space-y-2">
                {phase.tasks.map(task => {
                  const isComplete = !!assignment.task_completions[task.id];
                  const completion = assignment.task_completions[task.id];
                  const isSelf = task.verification === 'self_check';
                  const needsSignoff = task.verification === 'supervisor_signoff';
                  const hasSignoff = !!completion?.verified_by;
                  const dueDate = addDays(assignment.start_date, Math.max(0, task.due_offset_days));
                  const today = new Date();
                  const isOverdue = today > dueDate && !isComplete;

                  return (
                    <div
                      key={task.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        isComplete
                          ? 'bg-green-50/50 border-green-100'
                          : isOverdue
                          ? 'bg-yellow-50/30 border-yellow-100'
                          : 'bg-background border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox or status icon */}
                        {isSelf ? (
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id, true)}
                            className="mt-0.5 shrink-0"
                            aria-label={isComplete ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="h-5 w-5 text-christina-green" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </button>
                        ) : (
                          <div className="mt-0.5 shrink-0">
                            {hasSignoff || isComplete ? (
                              <CheckCircle2 className="h-5 w-5 text-christina-green" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isComplete ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Knowledge base link */}
                          {task.knowledge_entry_id && (
                            <a
                              href="/employee/knowledge"
                              className="inline-flex items-center gap-1 text-xs text-christina-blue hover:underline mt-1.5"
                            >
                              <BookOpen className="h-3 w-3" />
                              View related knowledge base entry
                            </a>
                          )}

                          <div className="flex items-center flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs h-5 flex items-center gap-1">
                              {VERIFICATION_ICONS[task.verification]}
                              {VERIFICATION_LABELS[task.verification]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{task.responsible}</span>
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`}>
                              <CalendarDays className="h-3 w-3" />
                              Due {formatDate(dueDate.toISOString())}
                              {isOverdue && ' (overdue)'}
                            </span>
                          </div>

                          {/* Signoff info */}
                          {completion?.verified_by && (
                            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              Signed off by {completion.verified_by}
                            </p>
                          )}
                          {completion?.completed_at && !completion.verified_by && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed {formatDate(completion.completed_at)}
                            </p>
                          )}

                          {/* Request signoff button */}
                          {needsSignoff && !hasSignoff && !isComplete && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 h-7 text-xs"
                              disabled={requestingSignoff.has(task.id) || signoffRequested.has(task.id)}
                              onClick={() => handleRequestSignoff(task.id)}
                            >
                              {requestingSignoff.has(task.id) ? (
                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                              ) : signoffRequested.has(task.id) ? (
                                <Clock className="h-3 w-3 mr-1.5" />
                              ) : (
                                <UserCheck className="h-3 w-3 mr-1.5" />
                              )}
                              {signoffRequested.has(task.id) ? 'Sign-off Requested' : 'Request Sign-off'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
