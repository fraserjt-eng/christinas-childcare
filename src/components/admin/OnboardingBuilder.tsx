'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  PHASE_LABELS,
  VERIFICATION_LABELS,
  type OnboardingTemplate,
  type OnboardingPhase,
  type OnboardingTask,
  type OnboardingPhaseKey,
  type VerificationMethod,
} from '@/lib/onboarding-storage';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  ChevronLeft,
  GripVertical,
  ClipboardList,
} from 'lucide-react';

const PHASE_ORDER: OnboardingPhaseKey[] = ['pre_start', 'day_1', 'week_1', 'month_1'];

const PHASE_COLORS: Record<OnboardingPhaseKey, string> = {
  pre_start: 'bg-slate-100 text-slate-700 border-slate-200',
  day_1: 'bg-blue-100 text-blue-700 border-blue-200',
  week_1: 'bg-green-100 text-green-700 border-green-200',
  month_1: 'bg-purple-100 text-purple-700 border-purple-200',
};

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function emptyTask(): OnboardingTask {
  return {
    id: generateTaskId(),
    title: '',
    description: '',
    responsible: '',
    due_offset_days: 1,
    verification: 'self_check',
  };
}

function emptyPhases(): OnboardingPhase[] {
  return PHASE_ORDER.map(name => ({ name, tasks: [] }));
}

// ─── Task row editor ──────────────────────────────────────────────────────────

interface TaskEditorProps {
  task: OnboardingTask;
  onChange: (task: OnboardingTask) => void;
  onDelete: () => void;
}

function TaskEditor({ task, onChange, onDelete }: TaskEditorProps) {
  return (
    <div className="rounded-lg border bg-background p-3 space-y-3">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-2 shrink-0 cursor-grab" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={task.title}
                onChange={e => onChange({ ...task, title: e.target.value })}
                placeholder="Task title"
                className="text-sm h-8"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Textarea
            value={task.description}
            onChange={e => onChange({ ...task, description: e.target.value })}
            placeholder="Description or instructions for the new hire..."
            className="text-xs min-h-[60px] leading-relaxed"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Responsible</Label>
              <Input
                value={task.responsible}
                onChange={e => onChange({ ...task, responsible: e.target.value })}
                placeholder="e.g. Director"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Due (day offset)</Label>
              <Input
                type="number"
                value={task.due_offset_days}
                onChange={e => onChange({ ...task, due_offset_days: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Verification</Label>
              <select
                value={task.verification}
                onChange={e => onChange({ ...task, verification: e.target.value as VerificationMethod })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {(Object.keys(VERIFICATION_LABELS) as VerificationMethod[]).map(v => (
                  <option key={v} value={v}>{VERIFICATION_LABELS[v]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase section ────────────────────────────────────────────────────────────

interface PhaseSectionProps {
  phase: OnboardingPhase;
  onChange: (phase: OnboardingPhase) => void;
}

function PhaseSection({ phase, onChange }: PhaseSectionProps) {
  const [expanded, setExpanded] = useState(true);

  function addTask() {
    onChange({ ...phase, tasks: [...phase.tasks, emptyTask()] });
  }

  function updateTask(index: number, updated: OnboardingTask) {
    const tasks = phase.tasks.map((t, i) => (i === index ? updated : t));
    onChange({ ...phase, tasks });
  }

  function deleteTask(index: number) {
    onChange({ ...phase, tasks: phase.tasks.filter((_, i) => i !== index) });
  }

  return (
    <Card className={`border ${PHASE_COLORS[phase.name].split(' ')[2]}`}>
      <CardHeader className="pb-0 pt-4 px-4">
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge className={`text-xs ${PHASE_COLORS[phase.name]}`}>
              {PHASE_LABELS[phase.name]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {phase.tasks.length} {phase.tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-3 space-y-2">
          {phase.tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No tasks yet in this phase.
            </p>
          ) : (
            phase.tasks.map((task, index) => (
              <TaskEditor
                key={task.id}
                task={task}
                onChange={updated => updateTask(index, updated)}
                onDelete={() => deleteTask(index)}
              />
            ))
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTask}
            className="w-full h-8 text-xs border-dashed"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Task to {PHASE_LABELS[phase.name]}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Template editor ──────────────────────────────────────────────────────────

interface TemplateEditorProps {
  initial: OnboardingTemplate | null;
  onBack: () => void;
  onSaved: () => void;
}

function TemplateEditor({ initial, onBack, onSaved }: TemplateEditorProps) {
  const isNew = initial === null;
  const [name, setName] = useState(initial?.name ?? '');
  const [phases, setPhases] = useState<OnboardingPhase[]>(
    initial?.phases ?? emptyPhases()
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function updatePhase(index: number, updated: OnboardingPhase) {
    setPhases(phases.map((p, i) => (i === index ? updated : p)));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        await createTemplate({ name: name.trim(), phases });
      } else {
        await updateTemplate(initial!.id, { name: name.trim(), phases });
      }
      onSaved();
      onBack();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm('Delete this template? Existing assignments will not be affected.')) return;
    setDeleting(true);
    try {
      await deleteTemplate(initial.id);
      onSaved();
      onBack();
    } finally {
      setDeleting(false);
    }
  }

  const totalTasks = phases.reduce((n, p) => n + p.tasks.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to templates
        </button>
        {!isNew && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="tmpl-name">Template Name</Label>
          <Input
            id="tmpl-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Standard New Staff Onboarding"
            className="text-base font-medium"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary">{totalTasks} total tasks</Badge>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-christina-red hover:bg-christina-red/90 text-white"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Template
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {phases.map((phase, index) => (
          <PhaseSection
            key={phase.name}
            phase={phase}
            onChange={updated => updatePhase(index, updated)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Template list ────────────────────────────────────────────────────────────

interface TemplateListProps {
  onSelect: (template: OnboardingTemplate) => void;
  onCreateNew: () => void;
}

function TemplateList({ onSelect, onCreateNew }: TemplateListProps) {
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTemplates().then(t => { setTemplates(t); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christina-red mr-3" />
        Loading templates...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Onboarding Templates</h3>
        <Button
          onClick={onCreateNew}
          size="sm"
          className="bg-christina-red hover:bg-christina-red/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No templates yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create your first onboarding template.</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {templates.map(template => {
            const totalTasks = template.phases.reduce((n, p) => n + p.tasks.length, 0);
            return (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="w-full text-left px-4 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm group-hover:text-christina-red transition-colors">
                      {template.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {PHASE_ORDER.map(phase => {
                        const p = template.phases.find(ph => ph.name === phase);
                        const count = p?.tasks.length ?? 0;
                        return (
                          <Badge key={phase} className={`text-xs ${PHASE_COLORS[phase]}`}>
                            {PHASE_LABELS[phase]}: {count}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{totalTasks} tasks</Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function OnboardingBuilder() {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [selected, setSelected] = useState<OnboardingTemplate | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (view === 'edit') {
    return (
      <TemplateEditor
        key={selected?.id ?? 'new'}
        initial={selected}
        onBack={() => { setView('list'); setSelected(null); }}
        onSaved={() => setRefreshKey(k => k + 1)}
      />
    );
  }

  return (
    <TemplateList
      key={refreshKey}
      onSelect={t => { setSelected(t); setView('edit'); }}
      onCreateNew={() => { setSelected(null); setView('edit'); }}
    />
  );
}
