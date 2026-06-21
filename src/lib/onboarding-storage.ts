// Onboarding Storage Module for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
} from '@/lib/supabase/service';
import { currentCenterId } from '@/lib/current-center';

export type OnboardingPhaseKey = 'pre_start' | 'day_1' | 'week_1' | 'month_1';

export const PHASE_LABELS: Record<OnboardingPhaseKey, string> = {
  pre_start: 'Pre-Start',
  day_1: 'Day 1',
  week_1: 'Week 1',
  month_1: 'Month 1',
};

export type VerificationMethod = 'self_check' | 'supervisor_signoff' | 'quiz';

export const VERIFICATION_LABELS: Record<VerificationMethod, string> = {
  self_check: 'Self Check',
  supervisor_signoff: 'Supervisor Sign-off',
  quiz: 'Quiz',
};

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  responsible: string;
  due_offset_days: number;
  verification: VerificationMethod;
  knowledge_entry_id?: string;
}

export interface OnboardingPhase {
  name: OnboardingPhaseKey;
  tasks: OnboardingTask[];
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  phases: OnboardingPhase[];
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  completed_at: string;
  verified_by?: string;
}

export interface OnboardingAssignment {
  id: string;
  employee_id: string;
  employee_name: string;
  template_id: string;
  start_date: string;
  task_completions: Record<string, TaskCompletion>;
  status: 'active' | 'completed';
  created_at: string;
}

export interface AssignmentProgress {
  total_tasks: number;
  completed_tasks: number;
  percent_complete: number;
  current_phase: OnboardingPhaseKey;
  days_elapsed: number;
  behind_tasks: string[];
}

const TEMPLATES_KEY = 'christinas_onboarding_templates';
const ASSIGNMENTS_KEY = 'christinas_onboarding_assignments';

// Supabase table backing both onboarding record kinds. Each row carries a
// `record_type` discriminator and a JSONB `data` payload (see migration 039).
const ONBOARDING_TABLE = 'onboarding';
type OnboardingRecordType = 'template' | 'assignment';

// Shape of a row in the `onboarding` table.
interface OnboardingRow {
  id: string;
  center_id: string | null;
  record_type: OnboardingRecordType;
  data: Record<string, unknown>;
}

// Build the cloud row payload for an insert from a typed onboarding object.
function toRow<T extends { id: string }>(
  record: T,
  recordType: OnboardingRecordType
): Record<string, unknown> {
  const { id, ...rest } = record;
  return {
    id,
    center_id: currentCenterId(),
    record_type: recordType,
    data: rest as Record<string, unknown>,
  };
}

// Unwrap a cloud row back into the typed onboarding object.
function fromRow<T>(row: OnboardingRow): T {
  return { id: row.id, ...(row.data as object) } as T;
}

// Drop the id key so it lives only as the row's primary-key column, not inside data.
function stripId<T extends { id: string }>(record: T): Record<string, unknown> {
  const { id: _id, ...rest } = record;
  return rest as Record<string, unknown>;
}

// Fetch all rows of one record type from the cloud; null when not configured/error.
async function cloudFetch<T>(recordType: OnboardingRecordType): Promise<T[] | null> {
  const rows = await supabaseSelect<OnboardingRow>(ONBOARDING_TABLE, {
    filters: { record_type: recordType, center_id: currentCenterId() },
  });
  if (rows === null) return null;
  return rows.map((r) => fromRow<T>(r));
}

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultTemplate(): OnboardingTemplate {
  const now = new Date().toISOString();
  return {
    id: 'tmpl_default',
    name: 'Standard New Staff Onboarding',
    created_at: now,
    updated_at: now,
    phases: [
      {
        name: 'pre_start',
        tasks: [
          {
            id: 'task_ps_1',
            title: 'Complete employment paperwork',
            description: 'W-4, I-9, direct deposit authorization, emergency contacts, and handbook acknowledgment.',
            responsible: 'HR / Director',
            due_offset_days: -3,
            verification: 'supervisor_signoff',
          },
          {
            id: 'task_ps_2',
            title: 'Background check cleared',
            description: 'DHS background study complete and approved before first day.',
            responsible: 'Director',
            due_offset_days: -1,
            verification: 'supervisor_signoff',
          },
          {
            id: 'task_ps_3',
            title: 'Review employee handbook',
            description: 'Read the full employee handbook and sign the acknowledgment form.',
            responsible: 'New Staff',
            due_offset_days: 0,
            verification: 'self_check',
          },
        ],
      },
      {
        name: 'day_1',
        tasks: [
          {
            id: 'task_d1_1',
            title: 'Facility tour and introductions',
            description: 'Tour all classrooms, outdoor areas, kitchen, and office. Meet all team members.',
            responsible: 'Director',
            due_offset_days: 1,
            verification: 'self_check',
          },
          {
            id: 'task_d1_2',
            title: 'Review emergency procedures',
            description: 'Walk through fire evacuation routes, shelter-in-place, and lockdown procedures.',
            responsible: 'Director',
            due_offset_days: 1,
            verification: 'supervisor_signoff',
            knowledge_entry_id: 'kb_seed_2',
          },
          {
            id: 'task_d1_3',
            title: 'Shadow a lead teacher',
            description: 'Spend the full day observing and assisting in your assigned classroom.',
            responsible: 'Lead Teacher',
            due_offset_days: 1,
            verification: 'self_check',
          },
          {
            id: 'task_d1_4',
            title: 'Set up classroom login and attendance access',
            description: 'Get your PIN set up in the attendance system and confirm you can check children in/out.',
            responsible: 'Director',
            due_offset_days: 1,
            verification: 'supervisor_signoff',
          },
        ],
      },
      {
        name: 'week_1',
        tasks: [
          {
            id: 'task_w1_1',
            title: 'Complete CPR/First Aid certification',
            description: 'Must be certified before working independently with children. Register for the next available class if not already certified.',
            responsible: 'New Staff',
            due_offset_days: 7,
            verification: 'supervisor_signoff',
          },
          {
            id: 'task_w1_2',
            title: 'Read and acknowledge CACFP meal count procedures',
            description: 'Review how to correctly count and record meals for CACFP reimbursement.',
            responsible: 'New Staff',
            due_offset_days: 5,
            verification: 'self_check',
          },
          {
            id: 'task_w1_3',
            title: 'Review classroom routine for your room',
            description: 'Read through the daily schedule, nap procedures, and developmental expectations for your age group.',
            responsible: 'New Staff',
            due_offset_days: 5,
            verification: 'self_check',
            knowledge_entry_id: 'kb_seed_3',
          },
          {
            id: 'task_w1_4',
            title: 'First 1-on-1 check-in with director',
            description: 'Scheduled 30-minute meeting to discuss how the first week went, answer questions, and set goals.',
            responsible: 'Director',
            due_offset_days: 7,
            verification: 'supervisor_signoff',
          },
          {
            id: 'task_w1_5',
            title: 'Complete mandated reporter training',
            description: 'Complete MN DHS mandated reporter online training and submit certificate.',
            responsible: 'New Staff',
            due_offset_days: 7,
            verification: 'supervisor_signoff',
          },
        ],
      },
      {
        name: 'month_1',
        tasks: [
          {
            id: 'task_m1_1',
            title: 'Complete 4-hour orientation training',
            description: 'Attend or watch the recorded orientation covering child development, program philosophy, and center policies.',
            responsible: 'New Staff',
            due_offset_days: 30,
            verification: 'supervisor_signoff',
          },
          {
            id: 'task_m1_2',
            title: '30-day performance check-in',
            description: 'Formal review of first month: strengths, growth areas, and 90-day goals.',
            responsible: 'Director',
            due_offset_days: 30,
            verification: 'supervisor_signoff',
          },
          {
            id: 'task_m1_3',
            title: 'Set up direct deposit',
            description: 'Confirm direct deposit is active and first paycheck was received correctly.',
            responsible: 'New Staff',
            due_offset_days: 14,
            verification: 'self_check',
          },
        ],
      },
    ],
  };
}

async function seedIfEmpty(): Promise<void> {
  const existing = getFromStorage<OnboardingTemplate>(TEMPLATES_KEY);
  if (existing.length > 0) return;

  const template = getDefaultTemplate();
  // Write the seed to the cloud first, then cache locally.
  await supabaseInsert<OnboardingRow>(ONBOARDING_TABLE, toRow(template, 'template'));
  saveToStorage(TEMPLATES_KEY, [template]);
}

async function seedAssignmentsIfEmpty(): Promise<void> {
  // No-op. A fabricated demo assignment (e.g. "Alex Rivera") must never appear
  // in the live app. Real onboarding assignments come from createAssignment.
  // The empty result is handled by the page's existing empty state.
  return;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<OnboardingTemplate[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await cloudFetch<OnboardingTemplate>('template');
  let templates = cloudData !== null
    ? cloudData
    : getFromStorage<OnboardingTemplate>(TEMPLATES_KEY);

  if (templates.length === 0) {
    await seedIfEmpty();
    templates = getFromStorage<OnboardingTemplate>(TEMPLATES_KEY);
  } else {
    // Keep the local cache in sync with the cloud read.
    saveToStorage(TEMPLATES_KEY, templates);
  }

  return templates;
}

export async function createTemplate(
  data: Omit<OnboardingTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<OnboardingTemplate> {
  await seedIfEmpty();
  const now = new Date().toISOString();

  const template: OnboardingTemplate = {
    ...data,
    id: generateId('tmpl'),
    created_at: now,
    updated_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<OnboardingRow>(ONBOARDING_TABLE, toRow(template, 'template'));

  const templates = getFromStorage<OnboardingTemplate>(TEMPLATES_KEY);
  templates.push(template);
  saveToStorage(TEMPLATES_KEY, templates);
  return template;
}

export async function updateTemplate(
  id: string,
  updates: Partial<OnboardingTemplate>
): Promise<OnboardingTemplate | null> {
  const templates = getFromStorage<OnboardingTemplate>(TEMPLATES_KEY);
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;

  const updated: OnboardingTemplate = {
    ...templates[index],
    ...updates,
    id: templates[index].id,
    created_at: templates[index].created_at,
    updated_at: new Date().toISOString(),
  };

  // Write to Supabase first, then cache locally
  await supabaseUpdate<OnboardingRow>(ONBOARDING_TABLE, id, {
    center_id: currentCenterId(),
    record_type: 'template',
    data: stripId(updated),
  });

  templates[index] = updated;
  saveToStorage(TEMPLATES_KEY, templates);
  return templates[index];
}

export async function deleteTemplate(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete(ONBOARDING_TABLE, id);

  const templates = getFromStorage<OnboardingTemplate>(TEMPLATES_KEY);
  const filtered = templates.filter(t => t.id !== id);
  if (filtered.length === templates.length) return false;
  saveToStorage(TEMPLATES_KEY, filtered);
  return true;
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function getAssignments(filters?: {
  status?: 'active' | 'completed';
}): Promise<OnboardingAssignment[]> {
  await seedIfEmpty();

  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await cloudFetch<OnboardingAssignment>('assignment');
  let assignments = cloudData !== null
    ? cloudData
    : getFromStorage<OnboardingAssignment>(ASSIGNMENTS_KEY);

  if (assignments.length === 0) {
    await seedAssignmentsIfEmpty();
    assignments = getFromStorage<OnboardingAssignment>(ASSIGNMENTS_KEY);
  } else {
    // Keep the local cache in sync with the cloud read.
    saveToStorage(ASSIGNMENTS_KEY, assignments);
  }

  if (filters?.status) {
    assignments = assignments.filter(a => a.status === filters.status);
  }

  assignments.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return assignments;
}

export async function createAssignment(
  data: Omit<OnboardingAssignment, 'id' | 'task_completions' | 'status' | 'created_at'>
): Promise<OnboardingAssignment> {
  const now = new Date().toISOString();

  const assignment: OnboardingAssignment = {
    ...data,
    id: generateId('assign'),
    task_completions: {},
    status: 'active',
    created_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<OnboardingRow>(ONBOARDING_TABLE, toRow(assignment, 'assignment'));

  const assignments = getFromStorage<OnboardingAssignment>(ASSIGNMENTS_KEY);
  assignments.push(assignment);
  saveToStorage(ASSIGNMENTS_KEY, assignments);
  return assignment;
}

export async function completeTask(
  assignmentId: string,
  taskId: string,
  verified_by?: string
): Promise<OnboardingAssignment | null> {
  const assignments = getFromStorage<OnboardingAssignment>(ASSIGNMENTS_KEY);
  const index = assignments.findIndex(a => a.id === assignmentId);
  if (index === -1) return null;

  const completion: TaskCompletion = {
    completed_at: new Date().toISOString(),
  };
  if (verified_by) completion.verified_by = verified_by;

  const updated: OnboardingAssignment = {
    ...assignments[index],
    task_completions: {
      ...assignments[index].task_completions,
      [taskId]: completion,
    },
  };

  // Write to Supabase first, then cache locally
  await supabaseUpdate<OnboardingRow>(ONBOARDING_TABLE, assignmentId, {
    record_type: 'assignment',
    data: stripId(updated),
  });

  assignments[index] = updated;
  saveToStorage(ASSIGNMENTS_KEY, assignments);
  return assignments[index];
}

export async function uncompleteTask(
  assignmentId: string,
  taskId: string
): Promise<OnboardingAssignment | null> {
  const assignments = getFromStorage<OnboardingAssignment>(ASSIGNMENTS_KEY);
  const index = assignments.findIndex(a => a.id === assignmentId);
  if (index === -1) return null;

  const completions = { ...assignments[index].task_completions };
  delete completions[taskId];

  const updated: OnboardingAssignment = {
    ...assignments[index],
    task_completions: completions,
  };

  // Write to Supabase first, then cache locally
  await supabaseUpdate<OnboardingRow>(ONBOARDING_TABLE, assignmentId, {
    record_type: 'assignment',
    data: stripId(updated),
  });

  assignments[index] = updated;
  saveToStorage(ASSIGNMENTS_KEY, assignments);
  return assignments[index];
}

export async function requestSignoff(
  assignmentId: string,
  taskId: string
): Promise<void> {
  // In production this would create a notification for the supervisor.
  // For demo mode, just log it.
  console.log(`Sign-off requested for task ${taskId} in assignment ${assignmentId}`);
}

export async function markAssignmentComplete(
  assignmentId: string
): Promise<OnboardingAssignment | null> {
  const assignments = getFromStorage<OnboardingAssignment>(ASSIGNMENTS_KEY);
  const index = assignments.findIndex(a => a.id === assignmentId);
  if (index === -1) return null;

  const updated: OnboardingAssignment = { ...assignments[index], status: 'completed' };

  // Write to Supabase first, then cache locally
  await supabaseUpdate<OnboardingRow>(ONBOARDING_TABLE, assignmentId, {
    record_type: 'assignment',
    data: stripId(updated),
  });

  assignments[index] = updated;
  saveToStorage(ASSIGNMENTS_KEY, assignments);
  return assignments[index];
}

// ─── Progress calculation ─────────────────────────────────────────────────────

export function getAssignmentProgress(
  assignment: OnboardingAssignment,
  template: OnboardingTemplate
): AssignmentProgress {
  const allTasks = template.phases.flatMap(p => p.tasks);
  const total = allTasks.length;
  const completed = Object.keys(assignment.task_completions).length;

  const startDate = new Date(assignment.start_date);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / 86400000);

  // Determine current phase based on days elapsed
  let currentPhase: OnboardingPhaseKey = 'pre_start';
  if (daysElapsed >= 1) currentPhase = 'day_1';
  if (daysElapsed >= 7) currentPhase = 'week_1';
  if (daysElapsed >= 30) currentPhase = 'month_1';

  // Find tasks that are due but not completed
  const behindTasks = allTasks
    .filter(task => {
      const dueDay = task.due_offset_days;
      const isDue = daysElapsed >= Math.max(0, dueDay);
      const isComplete = !!assignment.task_completions[task.id];
      return isDue && !isComplete;
    })
    .map(t => t.id);

  return {
    total_tasks: total,
    completed_tasks: completed,
    percent_complete: total > 0 ? Math.round((completed / total) * 100) : 0,
    current_phase: currentPhase,
    days_elapsed: daysElapsed,
    behind_tasks: behindTasks,
  };
}
