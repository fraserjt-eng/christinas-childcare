// Substitute staff pool + assignments storage
// Dual-write to Supabase (tables: substitutes, sub_assignments) + localStorage.

import { createDualWrite } from '@/lib/supabase/dual-write';

export type SubStatus = 'active' | 'inactive';

export interface Substitute {
  id: string;
  name: string;
  phone: string;
  email: string;
  certifications: string[];
  availability: string; // free text, e.g. "Weekday mornings", "Any day"
  hourly_rate: number;
  notes: string;
  last_used_at?: string;
  status: SubStatus;
  created_at: string;
  updated_at: string;
}

export interface SubAssignment {
  id: string;
  sub_id: string;
  sub_name: string;
  classroom_id: string;
  classroom_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  covering_for?: string; // regular staff member name
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const subStore = createDualWrite<Substitute>({
  table: 'substitutes',
  localKey: 'christinas_substitutes',
});

const assignmentStore = createDualWrite<SubAssignment>({
  table: 'sub_assignments',
  localKey: 'christinas_sub_assignments',
});

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ─── Substitute pool CRUD ───────────────────────────────────────────

export async function getSubs(): Promise<Substitute[]> {
  return subStore.getAll();
}

export async function getActiveSubs(): Promise<Substitute[]> {
  const all = await subStore.getAll();
  return all.filter((s) => s.status === 'active');
}

export async function getSubById(id: string): Promise<Substitute | null> {
  return subStore.getById(id);
}

export async function createSub(
  input: Omit<Substitute, 'id' | 'created_at' | 'updated_at'>
): Promise<Substitute> {
  const sub: Substitute = {
    ...input,
    id: generateId('sub'),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  await subStore.save(sub);
  return sub;
}

export async function updateSub(
  id: string,
  patch: Partial<Omit<Substitute, 'id' | 'created_at'>>
): Promise<Substitute | null> {
  const existing = await subStore.getById(id);
  if (!existing) return null;
  const updated: Substitute = {
    ...existing,
    ...patch,
    updated_at: nowIso(),
  };
  await subStore.save(updated);
  return updated;
}

export async function deactivateSub(id: string): Promise<void> {
  await updateSub(id, { status: 'inactive' });
}

// ─── Sub assignments ────────────────────────────────────────────────

export async function getAssignments(): Promise<SubAssignment[]> {
  return assignmentStore.getAll();
}

export async function getAssignmentsForDate(date: string): Promise<SubAssignment[]> {
  const all = await assignmentStore.getAll();
  return all.filter((a) => a.date === date && a.status === 'scheduled');
}

export async function getAssignmentsForClassroomDate(
  classroomId: string,
  date: string
): Promise<SubAssignment[]> {
  const all = await assignmentStore.getAll();
  return all.filter(
    (a) => a.classroom_id === classroomId && a.date === date && a.status === 'scheduled'
  );
}

export async function assignSub(
  input: Omit<SubAssignment, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<SubAssignment> {
  const assignment: SubAssignment = {
    ...input,
    id: generateId('sa'),
    status: 'scheduled',
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  await assignmentStore.save(assignment);
  // Mark the sub as recently used
  await updateSub(input.sub_id, { last_used_at: nowIso() });
  return assignment;
}

export async function cancelAssignment(id: string): Promise<void> {
  const existing = await assignmentStore.getById(id);
  if (!existing) return;
  await assignmentStore.save({
    ...existing,
    status: 'cancelled',
    updated_at: nowIso(),
  });
}

export async function completeAssignment(id: string): Promise<void> {
  const existing = await assignmentStore.getById(id);
  if (!existing) return;
  await assignmentStore.save({
    ...existing,
    status: 'completed',
    updated_at: nowIso(),
  });
}
