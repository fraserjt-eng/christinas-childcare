// Employee Storage Module for Christina's Child Care Center
// Supabase-first with localStorage as fallback cache
import { isDemoSeedEnabled } from '@/lib/demo-mode';

import {
  supabaseSelect,
  supabaseInsert,
  supabaseUpdate,
  supabaseUpsert,
  supabaseDelete,
} from '@/lib/supabase/service';

import {
  Employee,
  EmployeeCreate,
  TimeEntry,
  TimeEntryCreate,
  PayStub,
  PayStubCreate,
  TimeOffRequest,
  TimeOffRequestCreate,
  ScheduleEntry,
  ScheduleEntryCreate,
  TrainingModule,
  EmployeeTraining,
  ScheduleRequest,
  ScheduleRequestCreate,
  SalariedAllocation,
  SalariedAllocationCreate,
  Notification,
  NotificationCreate,
  Building,
  BUILDINGS,
  generateEmployeeId,
  generateTimeEntryId,
  generatePayStubId,
  generateTimeOffId,
  generateScheduleId,
  generateTrainingId,
  generateScheduleRequestId,
  generateSalariedAllocationId,
  generateNotificationId,
  calculateHoursWorked,
} from '@/types/employee';

// Storage keys
const STORAGE_KEYS = {
  employees: 'christinas_employees',
  timeEntries: 'christinas_time_entries',
  payStubs: 'christinas_pay_stubs',
  timeOffRequests: 'christinas_time_off_requests',
  schedules: 'christinas_schedules',
  trainingModules: 'christinas_training_modules',
  employeeTraining: 'christinas_employee_training',
  currentEmployee: 'christinas_current_employee',
  scheduleRequests: 'christinas_schedule_requests',
  salariedAllocations: 'christinas_salaried_allocations',
  notifications: 'christinas_notifications',
};

// ============================================================================
// Generic Storage Helpers
// ============================================================================

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// ============================================================================
// Employee CRUD
// ============================================================================

export async function getEmployees(): Promise<Employee[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<Employee>('employees');
  if (cloudData !== null && cloudData.length > 0) return cloudData;
  // If Supabase returns empty or null, use localStorage (needed for demo mode seeded data)
  const localData = getFromStorage<Employee>(STORAGE_KEYS.employees);
  if (localData.length > 0) return localData;
  return cloudData ?? [];
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const employees = await getEmployees();
  return employees.find((e) => e.id === id) || null;
}

export async function getEmployeeByEmail(email: string): Promise<Employee | null> {
  const employees = await getEmployees();
  return employees.find((e) => e.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getEmployeeByPin(pin: string): Promise<Employee | null> {
  const employees = await getEmployees();
  return employees.find((e) => e.pin === pin) || null;
}

export async function createEmployee(data: EmployeeCreate): Promise<Employee> {
  const now = new Date().toISOString();
  const newEmployee: Employee = {
    ...data,
    id: generateEmployeeId(),
    created_at: now,
    updated_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<Employee>('employees', newEmployee as unknown as Record<string, unknown>);
  const employees = getFromStorage<Employee>(STORAGE_KEYS.employees);
  employees.push(newEmployee);
  saveToStorage(STORAGE_KEYS.employees, employees);
  return newEmployee;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
  // Write to Supabase first
  await supabaseUpdate<Employee>('employees', id, updates as Record<string, unknown>);

  const employees = await getEmployees();
  const index = employees.findIndex((e) => e.id === id);

  if (index === -1) return null;

  const updatedEmployee: Employee = {
    ...employees[index],
    ...updates,
    id: employees[index].id,
    created_at: employees[index].created_at,
    updated_at: new Date().toISOString(),
  };

  employees[index] = updatedEmployee;
  saveToStorage(STORAGE_KEYS.employees, employees);
  return updatedEmployee;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete('employees', id);

  const employees = await getEmployees();
  const index = employees.findIndex((e) => e.id === id);

  if (index === -1) return false;

  employees.splice(index, 1);
  saveToStorage(STORAGE_KEYS.employees, employees);
  return true;
}

// ============================================================================
// Time Entry CRUD
// ============================================================================

export async function getTimeEntries(filters?: {
  employee_id?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<TimeEntry[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<TimeEntry>('time_entries');
  let entries = cloudData !== null
    ? cloudData
    : getFromStorage<TimeEntry>(STORAGE_KEYS.timeEntries);

  if (filters) {
    if (filters.employee_id) {
      entries = entries.filter((e) => e.employee_id === filters.employee_id);
    }
    if (filters.date) {
      entries = entries.filter((e) => e.date === filters.date);
    }
    if (filters.startDate) {
      entries = entries.filter((e) => e.date >= filters.startDate!);
    }
    if (filters.endDate) {
      entries = entries.filter((e) => e.date <= filters.endDate!);
    }
  }

  // Sort by date, then clock_in
  entries.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.clock_in.localeCompare(a.clock_in);
  });

  return entries;
}

export async function getTimeEntry(id: string): Promise<TimeEntry | null> {
  const cloudData = await supabaseSelect<TimeEntry>('time_entries', { filters: { id } });
  if (cloudData !== null) return cloudData[0] || null;
  const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.timeEntries);
  return entries.find((e) => e.id === id) || null;
}

export async function getActiveTimeEntry(employeeId: string): Promise<TimeEntry | null> {
  const entries = await getTimeEntries({ employee_id: employeeId });
  return entries.find((e) => !e.clock_out) || null;
}

export async function clockIn(employeeId: string): Promise<TimeEntry> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const newEntry: TimeEntry = {
    id: generateTimeEntryId(),
    employee_id: employeeId,
    date: today,
    clock_in: now.toISOString(),
    created_at: now.toISOString(),
  };

  // Write to Supabase first for multi-device visibility, then cache locally
  await supabaseInsert<TimeEntry>('time_entries', newEntry as unknown as Record<string, unknown>);
  const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.timeEntries);
  entries.push(newEntry);
  saveToStorage(STORAGE_KEYS.timeEntries, entries);
  return newEntry;
}

export async function clockOut(entryId: string, breakMinutes: number = 0): Promise<TimeEntry | null> {
  const now = new Date().toISOString();
  const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.timeEntries);
  const index = entries.findIndex((e) => e.id === entryId);

  if (index === -1) return null;

  const hoursWorked = calculateHoursWorked(entries[index].clock_in, now, breakMinutes);
  const clockOutUpdates = {
    clock_out: now,
    hours_worked: hoursWorked,
    break_minutes: breakMinutes,
  };

  // Write to Supabase first for multi-device visibility, then cache locally
  await supabaseUpdate<TimeEntry>('time_entries', entryId, clockOutUpdates);

  entries[index] = {
    ...entries[index],
    ...clockOutUpdates,
  };

  saveToStorage(STORAGE_KEYS.timeEntries, entries);
  return entries[index];
}

export async function createTimeEntry(data: TimeEntryCreate): Promise<TimeEntry> {
  const newEntry: TimeEntry = {
    ...data,
    id: generateTimeEntryId(),
    created_at: new Date().toISOString(),
  };

  // Calculate hours if both clock in and out are provided
  if (newEntry.clock_in && newEntry.clock_out) {
    newEntry.hours_worked = calculateHoursWorked(
      newEntry.clock_in,
      newEntry.clock_out,
      newEntry.break_minutes || 0
    );
  }

  // Write to Supabase first for multi-device visibility, then cache locally
  await supabaseInsert<TimeEntry>('time_entries', newEntry as unknown as Record<string, unknown>);
  const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.timeEntries);
  entries.push(newEntry);
  saveToStorage(STORAGE_KEYS.timeEntries, entries);
  return newEntry;
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry | null> {
  // Write to Supabase first
  await supabaseUpdate<TimeEntry>('time_entries', id, updates as Record<string, unknown>);

  const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.timeEntries);
  const index = entries.findIndex((e) => e.id === id);

  if (index === -1) return null;

  const updatedEntry = {
    ...entries[index],
    ...updates,
    id: entries[index].id,
    created_at: entries[index].created_at,
    edited_at: new Date().toISOString(),
  };

  // Recalculate hours if times changed
  if (updatedEntry.clock_in && updatedEntry.clock_out) {
    updatedEntry.hours_worked = calculateHoursWorked(
      updatedEntry.clock_in,
      updatedEntry.clock_out,
      updatedEntry.break_minutes || 0
    );
  }

  entries[index] = updatedEntry;
  saveToStorage(STORAGE_KEYS.timeEntries, entries);
  return updatedEntry;
}

export async function deleteTimeEntry(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete('time_entries', id);

  const entries = getFromStorage<TimeEntry>(STORAGE_KEYS.timeEntries);
  const index = entries.findIndex((e) => e.id === id);

  if (index === -1) return false;

  entries.splice(index, 1);
  saveToStorage(STORAGE_KEYS.timeEntries, entries);
  return true;
}

// ============================================================================
// Pay Stub CRUD
// ============================================================================

export async function getPayStubs(filters?: {
  employee_id?: string;
  status?: PayStub['status'];
  periodStart?: string;
  periodEnd?: string;
}): Promise<PayStub[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<PayStub>('pay_stubs');
  let stubs = cloudData !== null
    ? cloudData
    : getFromStorage<PayStub>(STORAGE_KEYS.payStubs);

  if (filters) {
    if (filters.employee_id) {
      stubs = stubs.filter((s) => s.employee_id === filters.employee_id);
    }
    if (filters.status) {
      stubs = stubs.filter((s) => s.status === filters.status);
    }
    if (filters.periodStart) {
      stubs = stubs.filter((s) => s.period_start >= filters.periodStart!);
    }
    if (filters.periodEnd) {
      stubs = stubs.filter((s) => s.period_end <= filters.periodEnd!);
    }
  }

  // Sort by period_end descending
  stubs.sort((a, b) => b.period_end.localeCompare(a.period_end));

  return stubs;
}

export async function getPayStub(id: string): Promise<PayStub | null> {
  const cloudData = await supabaseSelect<PayStub>('pay_stubs', { filters: { id } });
  if (cloudData !== null) return cloudData[0] || null;
  const stubs = getFromStorage<PayStub>(STORAGE_KEYS.payStubs);
  return stubs.find((s) => s.id === id) || null;
}

export async function createPayStub(data: PayStubCreate): Promise<PayStub> {
  const now = new Date().toISOString();
  const newStub: PayStub = {
    ...data,
    id: generatePayStubId(),
    created_at: now,
    updated_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<PayStub>('pay_stubs', newStub as unknown as Record<string, unknown>);
  const stubs = getFromStorage<PayStub>(STORAGE_KEYS.payStubs);
  stubs.push(newStub);
  saveToStorage(STORAGE_KEYS.payStubs, stubs);
  return newStub;
}

export async function updatePayStub(id: string, updates: Partial<PayStub>): Promise<PayStub | null> {
  // Write to Supabase first
  await supabaseUpdate<PayStub>('pay_stubs', id, updates as Record<string, unknown>);

  const stubs = getFromStorage<PayStub>(STORAGE_KEYS.payStubs);
  const index = stubs.findIndex((s) => s.id === id);

  if (index === -1) return null;

  const updatedStub: PayStub = {
    ...stubs[index],
    ...updates,
    id: stubs[index].id,
    created_at: stubs[index].created_at,
    updated_at: new Date().toISOString(),
  };

  stubs[index] = updatedStub;
  saveToStorage(STORAGE_KEYS.payStubs, stubs);
  return updatedStub;
}

export async function deletePayStub(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete('pay_stubs', id);

  const stubs = getFromStorage<PayStub>(STORAGE_KEYS.payStubs);
  const index = stubs.findIndex((s) => s.id === id);

  if (index === -1) return false;

  stubs.splice(index, 1);
  saveToStorage(STORAGE_KEYS.payStubs, stubs);
  return true;
}

// ============================================================================
// Time Off Request CRUD
// ============================================================================

export async function getTimeOffRequests(filters?: {
  employee_id?: string;
  status?: TimeOffRequest['status'];
}): Promise<TimeOffRequest[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<TimeOffRequest>('time_off_requests');
  let requests = cloudData !== null
    ? cloudData
    : getFromStorage<TimeOffRequest>(STORAGE_KEYS.timeOffRequests);

  if (filters) {
    if (filters.employee_id) {
      requests = requests.filter((r) => r.employee_id === filters.employee_id);
    }
    if (filters.status) {
      requests = requests.filter((r) => r.status === filters.status);
    }
  }

  // Sort by start_date descending
  requests.sort((a, b) => b.start_date.localeCompare(a.start_date));

  return requests;
}

export async function getTimeOffRequest(id: string): Promise<TimeOffRequest | null> {
  const cloudData = await supabaseSelect<TimeOffRequest>('time_off_requests', { filters: { id } });
  if (cloudData !== null) return cloudData[0] || null;
  const requests = getFromStorage<TimeOffRequest>(STORAGE_KEYS.timeOffRequests);
  return requests.find((r) => r.id === id) || null;
}

export async function createTimeOffRequest(data: TimeOffRequestCreate): Promise<TimeOffRequest> {
  const now = new Date().toISOString();
  const newRequest: TimeOffRequest = {
    ...data,
    id: generateTimeOffId(),
    status: 'pending',
    created_at: now,
    updated_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<TimeOffRequest>('time_off_requests', newRequest as unknown as Record<string, unknown>);
  const requests = getFromStorage<TimeOffRequest>(STORAGE_KEYS.timeOffRequests);
  requests.push(newRequest);
  saveToStorage(STORAGE_KEYS.timeOffRequests, requests);
  return newRequest;
}

export async function updateTimeOffRequest(
  id: string,
  updates: Partial<TimeOffRequest>
): Promise<TimeOffRequest | null> {
  // Write to Supabase first
  await supabaseUpdate<TimeOffRequest>('time_off_requests', id, updates as Record<string, unknown>);

  const requests = getFromStorage<TimeOffRequest>(STORAGE_KEYS.timeOffRequests);
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) return null;

  const updatedRequest: TimeOffRequest = {
    ...requests[index],
    ...updates,
    id: requests[index].id,
    created_at: requests[index].created_at,
    updated_at: new Date().toISOString(),
  };

  requests[index] = updatedRequest;
  saveToStorage(STORAGE_KEYS.timeOffRequests, requests);
  return updatedRequest;
}

export async function approveTimeOffRequest(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<TimeOffRequest | null> {
  return updateTimeOffRequest(id, {
    status: 'approved',
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_notes: notes,
  });
}

export async function denyTimeOffRequest(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<TimeOffRequest | null> {
  return updateTimeOffRequest(id, {
    status: 'denied',
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_notes: notes,
  });
}

// ============================================================================
// Schedule CRUD
// ============================================================================

export async function getScheduleEntries(filters?: {
  employee_id?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ScheduleEntry[]> {
  // staff_schedules (the table the new portal writes shifts to) is RLS
  // service-role-only, so the browser cannot read it with the anon key. Read it
  // through the session-gated server route, which derives the current center
  // server-side, so the admin's schedule-driven tools (labor, ratios, reports)
  // correspond with what the portal recorded instead of only seeing this
  // browser's local shifts. Cloud rows win on id dedup. Falls back to local
  // cleanly when there is no session or this runs server-side.
  let cloudEntries: ScheduleEntry[] = [];
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/staff/schedule');
      if (res.ok) {
        const json = (await res.json()) as {
          shifts?: Array<Record<string, unknown>>;
        };
        cloudEntries = (json.shifts ?? []).map((r) => ({
          id: r.id as string,
          employee_id: r.employee_id as string,
          date: r.date as string,
          start_time: (r.start_time as string) || '',
          end_time: (r.end_time as string) || '',
          classroom_id: (r.classroom_id as string | null) ?? undefined,
          created_at: (r.created_at as string) || new Date().toISOString(),
          updated_at: (r.updated_at as string) || new Date().toISOString(),
        }));
      }
    } catch {
      /* fall back to local cache */
    }
  }

  // Read from the original schedule storage
  const originalEntries = getFromStorage<ScheduleEntry>(STORAGE_KEYS.schedules);

  // Also read from the schedule-optimizer shifts (drag board data)
  // and convert them to ScheduleEntry format so all components see the same data
  const optimizerShifts = getFromStorage<{
    id: string;
    employee_id: string;
    date: string;
    start_time: string;
    end_time: string;
    classroom_id?: string;
    created_at?: string;
    updated_at?: string;
  }>('christinas_schedule_shifts');

  const convertedShifts: ScheduleEntry[] = optimizerShifts.map(s => ({
    id: s.id,
    employee_id: s.employee_id,
    date: s.date,
    start_time: s.start_time,
    end_time: s.end_time,
    classroom_id: s.classroom_id,
    created_at: s.created_at || new Date().toISOString(),
    updated_at: s.updated_at || new Date().toISOString(),
  }));

  // Merge both sources, dedup by id
  const idsSeen = new Set<string>();
  let entries: ScheduleEntry[] = [];
  for (const entry of [...cloudEntries, ...originalEntries, ...convertedShifts]) {
    if (!idsSeen.has(entry.id)) {
      idsSeen.add(entry.id);
      entries.push(entry);
    }
  }

  if (filters) {
    if (filters.employee_id) {
      entries = entries.filter((e) => e.employee_id === filters.employee_id);
    }
    if (filters.startDate) {
      entries = entries.filter((e) => e.date >= filters.startDate!);
    }
    if (filters.endDate) {
      entries = entries.filter((e) => e.date <= filters.endDate!);
    }
  }

  // Sort by date, then start_time
  entries.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  return entries;
}

export async function createScheduleEntry(data: ScheduleEntryCreate): Promise<ScheduleEntry> {
  const now = new Date().toISOString();
  const newEntry: ScheduleEntry = {
    ...data,
    id: generateScheduleId(),
    created_at: now,
    updated_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<ScheduleEntry>('staff_schedules', newEntry as unknown as Record<string, unknown>);
  const entries = getFromStorage<ScheduleEntry>(STORAGE_KEYS.schedules);
  entries.push(newEntry);
  saveToStorage(STORAGE_KEYS.schedules, entries);

  // Also write to schedule-optimizer storage so the drag board sees it
  const optimizerShifts = getFromStorage<Record<string, unknown>>('christinas_schedule_shifts');
  optimizerShifts.push({
    ...newEntry,
    employee_name: '',
    center_id: 'crystal',
    is_overtime: false,
  });
  saveToStorage('christinas_schedule_shifts', optimizerShifts);

  return newEntry;
}

export async function updateScheduleEntry(
  id: string,
  updates: Partial<ScheduleEntry>
): Promise<ScheduleEntry | null> {
  // Write to Supabase first
  await supabaseUpdate<ScheduleEntry>('staff_schedules', id, updates as Record<string, unknown>);

  // Try original store first
  const entries = getFromStorage<ScheduleEntry>(STORAGE_KEYS.schedules);
  const index = entries.findIndex((e) => e.id === id);

  if (index !== -1) {
    const updatedEntry: ScheduleEntry = {
      ...entries[index],
      ...updates,
      id: entries[index].id,
      created_at: entries[index].created_at,
      updated_at: new Date().toISOString(),
    };
    entries[index] = updatedEntry;
    saveToStorage(STORAGE_KEYS.schedules, entries);
    return updatedEntry;
  }

  // Also try optimizer store
  const shifts = getFromStorage<ScheduleEntry & Record<string, unknown>>('christinas_schedule_shifts');
  const shiftIndex = shifts.findIndex((s) => s.id === id);
  if (shiftIndex !== -1) {
    shifts[shiftIndex] = { ...shifts[shiftIndex], ...updates, updated_at: new Date().toISOString() };
    saveToStorage('christinas_schedule_shifts', shifts);
    return shifts[shiftIndex] as ScheduleEntry;
  }

  return null;
}

export async function deleteScheduleEntry(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete('staff_schedules', id);

  // Delete from original store
  const entries = getFromStorage<ScheduleEntry>(STORAGE_KEYS.schedules);
  const origIndex = entries.findIndex((e) => e.id === id);
  if (origIndex !== -1) {
    entries.splice(origIndex, 1);
    saveToStorage(STORAGE_KEYS.schedules, entries);
  }

  // Also delete from optimizer store
  const shifts = getFromStorage<ScheduleEntry>('christinas_schedule_shifts');
  const shiftIndex = shifts.findIndex((s) => s.id === id);
  if (shiftIndex !== -1) {
    shifts.splice(shiftIndex, 1);
    saveToStorage('christinas_schedule_shifts', shifts);
  }

  return origIndex !== -1 || shiftIndex !== -1;
}

// ============================================================================
// Schedule Request CRUD
// ============================================================================

export async function getScheduleRequests(filters?: {
  employee_id?: string;
  status?: ScheduleRequest['status'];
}): Promise<ScheduleRequest[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<ScheduleRequest>('schedule_requests');
  let requests = cloudData !== null
    ? cloudData
    : getFromStorage<ScheduleRequest>(STORAGE_KEYS.scheduleRequests);

  if (filters) {
    if (filters.employee_id) {
      requests = requests.filter((r) => r.employee_id === filters.employee_id);
    }
    if (filters.status) {
      requests = requests.filter((r) => r.status === filters.status);
    }
  }

  // Sort by created_at descending
  requests.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return requests;
}

export async function getScheduleRequest(id: string): Promise<ScheduleRequest | null> {
  const cloudData = await supabaseSelect<ScheduleRequest>('schedule_requests', { filters: { id } });
  if (cloudData !== null) return cloudData[0] || null;
  const requests = getFromStorage<ScheduleRequest>(STORAGE_KEYS.scheduleRequests);
  return requests.find((r) => r.id === id) || null;
}

export async function createScheduleRequest(data: ScheduleRequestCreate): Promise<ScheduleRequest> {
  const now = new Date().toISOString();
  const newRequest: ScheduleRequest = {
    ...data,
    id: generateScheduleRequestId(),
    status: 'pending',
    created_at: now,
    updated_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<ScheduleRequest>('schedule_requests', newRequest as unknown as Record<string, unknown>);
  const requests = getFromStorage<ScheduleRequest>(STORAGE_KEYS.scheduleRequests);
  requests.push(newRequest);
  saveToStorage(STORAGE_KEYS.scheduleRequests, requests);
  return newRequest;
}

export async function updateScheduleRequest(
  id: string,
  updates: Partial<ScheduleRequest>
): Promise<ScheduleRequest | null> {
  // Write to Supabase first
  await supabaseUpdate<ScheduleRequest>('schedule_requests', id, updates as Record<string, unknown>);

  const requests = getFromStorage<ScheduleRequest>(STORAGE_KEYS.scheduleRequests);
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) return null;

  const updatedRequest: ScheduleRequest = {
    ...requests[index],
    ...updates,
    id: requests[index].id,
    created_at: requests[index].created_at,
    updated_at: new Date().toISOString(),
  };

  requests[index] = updatedRequest;
  saveToStorage(STORAGE_KEYS.scheduleRequests, requests);
  return updatedRequest;
}

export async function approveScheduleRequest(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<ScheduleRequest | null> {
  return updateScheduleRequest(id, {
    status: 'approved',
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_notes: notes,
  });
}

export async function denyScheduleRequest(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<ScheduleRequest | null> {
  return updateScheduleRequest(id, {
    status: 'denied',
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_notes: notes,
  });
}

export async function deleteScheduleRequest(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete('schedule_requests', id);

  const requests = getFromStorage<ScheduleRequest>(STORAGE_KEYS.scheduleRequests);
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) return false;

  requests.splice(index, 1);
  saveToStorage(STORAGE_KEYS.scheduleRequests, requests);
  return true;
}

// ============================================================================
// Salaried Allocation CRUD
// ============================================================================

export async function getSalariedAllocations(filters?: {
  employee_id?: string;
  week_start?: string;
  building_id?: string;
}): Promise<SalariedAllocation[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<SalariedAllocation>('salaried_allocations');
  let allocations = cloudData !== null
    ? cloudData
    : getFromStorage<SalariedAllocation>(STORAGE_KEYS.salariedAllocations);

  if (filters) {
    if (filters.employee_id) {
      allocations = allocations.filter((a) => a.employee_id === filters.employee_id);
    }
    if (filters.week_start) {
      allocations = allocations.filter((a) => a.week_start === filters.week_start);
    }
    if (filters.building_id) {
      allocations = allocations.filter((a) => a.building_id === filters.building_id);
    }
  }

  // Sort by week_start descending
  allocations.sort((a, b) => b.week_start.localeCompare(a.week_start));

  return allocations;
}

export async function getSalariedAllocation(id: string): Promise<SalariedAllocation | null> {
  const cloudData = await supabaseSelect<SalariedAllocation>('salaried_allocations', { filters: { id } });
  if (cloudData !== null) return cloudData[0] || null;
  const allocations = getFromStorage<SalariedAllocation>(STORAGE_KEYS.salariedAllocations);
  return allocations.find((a) => a.id === id) || null;
}

export async function createSalariedAllocation(data: SalariedAllocationCreate): Promise<SalariedAllocation> {
  const now = new Date().toISOString();
  const newAllocation: SalariedAllocation = {
    ...data,
    id: generateSalariedAllocationId(),
    created_at: now,
    updated_at: now,
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<SalariedAllocation>('salaried_allocations', newAllocation as unknown as Record<string, unknown>);
  const allocations = getFromStorage<SalariedAllocation>(STORAGE_KEYS.salariedAllocations);
  allocations.push(newAllocation);
  saveToStorage(STORAGE_KEYS.salariedAllocations, allocations);
  return newAllocation;
}

export async function updateSalariedAllocation(
  id: string,
  updates: Partial<SalariedAllocation>
): Promise<SalariedAllocation | null> {
  // Write to Supabase first
  await supabaseUpdate<SalariedAllocation>('salaried_allocations', id, updates as Record<string, unknown>);

  const allocations = getFromStorage<SalariedAllocation>(STORAGE_KEYS.salariedAllocations);
  const index = allocations.findIndex((a) => a.id === id);

  if (index === -1) return null;

  const updatedAllocation: SalariedAllocation = {
    ...allocations[index],
    ...updates,
    id: allocations[index].id,
    created_at: allocations[index].created_at,
    updated_at: new Date().toISOString(),
  };

  allocations[index] = updatedAllocation;
  saveToStorage(STORAGE_KEYS.salariedAllocations, allocations);
  return updatedAllocation;
}

export async function deleteSalariedAllocation(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete('salaried_allocations', id);

  const allocations = getFromStorage<SalariedAllocation>(STORAGE_KEYS.salariedAllocations);
  const index = allocations.findIndex((a) => a.id === id);

  if (index === -1) return false;

  allocations.splice(index, 1);
  saveToStorage(STORAGE_KEYS.salariedAllocations, allocations);
  return true;
}

// Upsert salaried allocation for employee/week/building
export async function upsertSalariedAllocation(data: SalariedAllocationCreate): Promise<SalariedAllocation> {
  const allocations = getFromStorage<SalariedAllocation>(STORAGE_KEYS.salariedAllocations);
  const index = allocations.findIndex(
    (a) =>
      a.employee_id === data.employee_id &&
      a.week_start === data.week_start &&
      a.building_id === data.building_id
  );

  const now = new Date().toISOString();

  if (index !== -1) {
    const updatedAllocation: SalariedAllocation = {
      ...allocations[index],
      ...data,
      id: allocations[index].id,
      created_at: allocations[index].created_at,
      updated_at: now,
    };
    // Write to Supabase first, then cache locally
    await supabaseUpsert<SalariedAllocation>('salaried_allocations', updatedAllocation as unknown as Record<string, unknown>, 'id');
    allocations[index] = updatedAllocation;
    saveToStorage(STORAGE_KEYS.salariedAllocations, allocations);
    return updatedAllocation;
  } else {
    const newAllocation: SalariedAllocation = {
      ...data,
      id: generateSalariedAllocationId(),
      created_at: now,
      updated_at: now,
    };
    // Write to Supabase first, then cache locally
    await supabaseInsert<SalariedAllocation>('salaried_allocations', newAllocation as unknown as Record<string, unknown>);
    allocations.push(newAllocation);
    saveToStorage(STORAGE_KEYS.salariedAllocations, allocations);
    return newAllocation;
  }
}

// ============================================================================
// Notification CRUD
// ============================================================================

export async function getNotifications(filters?: {
  employee_id?: string;
  unread_only?: boolean;
}): Promise<Notification[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudNotifications = await supabaseSelect<Notification>('notifications');
  let notifications = cloudNotifications !== null
    ? cloudNotifications
    : getFromStorage<Notification>(STORAGE_KEYS.notifications);

  if (filters) {
    if (filters.employee_id) {
      notifications = notifications.filter((n) => n.employee_id === filters.employee_id);
    }
    if (filters.unread_only) {
      notifications = notifications.filter((n) => !n.read);
    }
  }

  // Sort by created_at descending
  notifications.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return notifications;
}

export async function getNotification(id: string): Promise<Notification | null> {
  const cloudData = await supabaseSelect<Notification>('notifications', { filters: { id } });
  if (cloudData !== null) return cloudData[0] || null;
  const notifications = getFromStorage<Notification>(STORAGE_KEYS.notifications);
  return notifications.find((n) => n.id === id) || null;
}

export async function createNotification(data: NotificationCreate): Promise<Notification> {
  const newNotification: Notification = {
    ...data,
    id: generateNotificationId(),
    read: false,
    created_at: new Date().toISOString(),
  };

  // Write to Supabase first, then cache locally
  await supabaseInsert<Notification>('notifications', newNotification as unknown as Record<string, unknown>);
  const notifications = getFromStorage<Notification>(STORAGE_KEYS.notifications);
  notifications.push(newNotification);
  saveToStorage(STORAGE_KEYS.notifications, notifications);
  return newNotification;
}

export async function markNotificationRead(id: string): Promise<Notification | null> {
  // Write to Supabase first
  await supabaseUpdate<Notification>('notifications', id, { read: true });

  const notifications = getFromStorage<Notification>(STORAGE_KEYS.notifications);
  const index = notifications.findIndex((n) => n.id === id);

  if (index === -1) return null;

  notifications[index] = {
    ...notifications[index],
    read: true,
  };

  saveToStorage(STORAGE_KEYS.notifications, notifications);
  return notifications[index];
}

export async function markAllNotificationsRead(employeeId: string): Promise<void> {
  const notifications = getFromStorage<Notification>(STORAGE_KEYS.notifications);

  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].employee_id === employeeId) {
      notifications[i] = { ...notifications[i], read: true };
    }
  }

  saveToStorage(STORAGE_KEYS.notifications, notifications);
}

export async function deleteNotification(id: string): Promise<boolean> {
  // Delete from Supabase first
  await supabaseDelete('notifications', id);

  const notifications = getFromStorage<Notification>(STORAGE_KEYS.notifications);
  const index = notifications.findIndex((n) => n.id === id);

  if (index === -1) return false;

  notifications.splice(index, 1);
  saveToStorage(STORAGE_KEYS.notifications, notifications);
  return true;
}

export async function getUnreadNotificationCount(employeeId: string): Promise<number> {
  const notifications = await getNotifications({ employee_id: employeeId, unread_only: true });
  return notifications.length;
}

// ============================================================================
// Building CRUD (mostly read-only for now)
// ============================================================================

export function getBuildings(): Building[] {
  return BUILDINGS;
}

export function getBuilding(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

export function getPrimaryBuilding(): Building | undefined {
  return BUILDINGS.find((b) => b.is_primary);
}

// ============================================================================
// Training CRUD
// ============================================================================

export async function getTrainingModules(): Promise<TrainingModule[]> {
  // Try Supabase first; fall back to localStorage if not configured or on error
  const cloudData = await supabaseSelect<TrainingModule>('training_modules');
  if (cloudData !== null) return cloudData;
  return getFromStorage<TrainingModule>(STORAGE_KEYS.trainingModules);
}

export async function getEmployeeTraining(employeeId: string): Promise<EmployeeTraining[]> {
  const cloudData = await supabaseSelect<EmployeeTraining>('employee_training', { filters: { employee_id: employeeId } });
  if (cloudData !== null) return cloudData;
  const training = getFromStorage<EmployeeTraining>(STORAGE_KEYS.employeeTraining);
  return training.filter((t) => t.employee_id === employeeId);
}

export async function updateEmployeeTraining(
  id: string,
  updates: Partial<EmployeeTraining>
): Promise<EmployeeTraining | null> {
  // Write to Supabase first
  await supabaseUpdate<EmployeeTraining>('employee_training', id, updates as Record<string, unknown>);

  const training = getFromStorage<EmployeeTraining>(STORAGE_KEYS.employeeTraining);
  const index = training.findIndex((t) => t.id === id);

  if (index === -1) return null;

  const updatedTraining: EmployeeTraining = {
    ...training[index],
    ...updates,
    id: training[index].id,
    created_at: training[index].created_at,
    updated_at: new Date().toISOString(),
  };

  training[index] = updatedTraining;
  saveToStorage(STORAGE_KEYS.employeeTraining, training);
  return updatedTraining;
}

// ============================================================================
// Session Management
// ============================================================================

export function setCurrentEmployee(employee: Employee): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.currentEmployee, JSON.stringify(employee));
}

export function getCurrentEmployee(): Employee | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.currentEmployee);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearCurrentEmployee(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.currentEmployee);
}

// ============================================================================
// Authentication
// ============================================================================

export async function authenticateByPin(pin: string): Promise<Employee | null> {
  const employee = await getEmployeeByPin(pin);
  if (employee && employee.employment_status === 'active') {
    setCurrentEmployee(employee);
    return employee;
  }
  return null;
}

export async function authenticateByEmail(
  email: string,
  password: string
): Promise<Employee | null> {
  const employee = await getEmployeeByEmail(email);
  // For demo, password is just the PIN
  if (employee && employee.pin === password && employee.employment_status === 'active') {
    setCurrentEmployee(employee);
    return employee;
  }
  return null;
}

export function logout(): void {
  clearCurrentEmployee();
}

// ============================================================================
// Sample Data
// ============================================================================

const SAMPLE_EMPLOYEES: EmployeeCreate[] = [
  {
    email: 'ophelia@christinaschildcare.com',
    pin: '1234',
    first_name: 'Ophelia',
    last_name: 'Zeogar',
    phone: '(555) 123-4567',
    role: 'owner',
    job_title: 'Owner/Director',
    hire_date: '2015-01-15',
    hourly_rate: 35,
    employment_status: 'active',
    certifications: ['CPR/First Aid', 'Director Certification', 'Early Childhood Education'],
  },
  {
    email: 'stephen@christinaschildcare.com',
    pin: '2345',
    first_name: 'Stephen',
    last_name: 'Zeogar',
    phone: '(555) 234-5678',
    role: 'owner',
    job_title: 'Owner',
    hire_date: '2015-01-15',
    hourly_rate: 35,
    employment_status: 'active',
    certifications: ['CPR/First Aid', 'Business Administration'],
  },
  {
    email: 'christina@christinaschildcare.com',
    pin: '3456',
    first_name: 'Christina',
    last_name: 'Fraser',
    phone: '(555) 345-6789',
    role: 'admin',
    job_title: 'Assistant Director',
    hire_date: '2018-03-20',
    hourly_rate: 28,
    employment_status: 'active',
    certifications: ['CPR/First Aid', 'CDA Credential', 'Early Childhood Education'],
  },
  {
    email: 'maria@christinaschildcare.com',
    pin: '4567',
    first_name: 'Maria',
    last_name: 'Santos',
    phone: '(555) 456-7890',
    role: 'teacher',
    job_title: 'Lead Teacher',
    hire_date: '2019-08-15',
    hourly_rate: 22,
    employment_status: 'active',
    certifications: ['CPR/First Aid', 'CDA Credential'],
  },
  {
    email: 'james@christinaschildcare.com',
    pin: '5678',
    first_name: 'James',
    last_name: 'Robinson',
    phone: '(555) 567-8901',
    role: 'teacher',
    job_title: 'Lead Teacher',
    hire_date: '2020-01-10',
    hourly_rate: 22,
    employment_status: 'active',
    certifications: ['CPR/First Aid', 'CDA Credential'],
  },
  {
    email: 'sarah@christinaschildcare.com',
    pin: '6789',
    first_name: 'Sarah',
    last_name: 'Kim',
    phone: '(555) 678-9012',
    role: 'teacher',
    job_title: 'Teacher',
    hire_date: '2021-06-01',
    hourly_rate: 18,
    employment_status: 'active',
    certifications: ['CPR/First Aid'],
  },
  {
    email: 'david@christinaschildcare.com',
    pin: '7890',
    first_name: 'David',
    last_name: 'Chen',
    phone: '(555) 789-0123',
    role: 'teacher',
    job_title: 'Teacher',
    hire_date: '2022-02-14',
    hourly_rate: 18,
    employment_status: 'active',
    certifications: ['CPR/First Aid'],
  },
  {
    email: 'lisa@christinaschildcare.com',
    pin: '8901',
    first_name: 'Lisa',
    last_name: 'Johnson',
    phone: '(555) 890-1234',
    role: 'teacher',
    job_title: 'Aide',
    hire_date: '2023-04-10',
    hourly_rate: 15,
    employment_status: 'active',
    certifications: ['CPR/First Aid'],
  },
];

const SAMPLE_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'train_mod_1',
    title: 'CPR & First Aid Certification',
    description: 'American Red Cross CPR and First Aid certification course',
    category: 'required',
    duration_hours: 8,
    expiration_months: 24,
  },
  {
    id: 'train_mod_2',
    title: 'Child Abuse Recognition & Reporting',
    description: 'Mandatory reporter training for recognizing and reporting child abuse',
    category: 'required',
    duration_hours: 2,
    expiration_months: 12,
  },
  {
    id: 'train_mod_3',
    title: 'Health & Safety Standards',
    description: 'Virginia childcare health and safety requirements',
    category: 'required',
    duration_hours: 4,
    expiration_months: 12,
  },
  {
    id: 'train_mod_4',
    title: 'Positive Behavior Guidance',
    description: 'Techniques for positive discipline and behavior management',
    category: 'recommended',
    duration_hours: 3,
  },
  {
    id: 'train_mod_5',
    title: 'Infant Care Basics',
    description: 'Specialized training for infant classroom teachers',
    category: 'optional',
    duration_hours: 4,
  },
  {
    id: 'train_mod_6',
    title: 'Curriculum Planning',
    description: 'Developmentally appropriate curriculum design',
    category: 'recommended',
    duration_hours: 6,
  },
];

function generateSampleSchedule(employeeId: string, dayOffset: number = 0): ScheduleEntryCreate[] {
  const schedules: ScheduleEntryCreate[] = [];
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);

  // Generate schedule for the current week (Mon-Fri)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday

  for (let i = 0; i < 5; i++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);

    schedules.push({
      employee_id: employeeId,
      date: date.toISOString().split('T')[0],
      start_time: '08:00',
      end_time: '16:00',
    });
  }

  return schedules;
}

function generateSampleTimeEntries(employeeId: string): TimeEntryCreate[] {
  const entries: TimeEntryCreate[] = [];
  const today = new Date();

  // Generate time entries for the past 2 weeks
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const clockIn = new Date(date);
    clockIn.setHours(8, 0 + Math.floor(Math.random() * 10), 0);

    const clockOut = new Date(date);
    clockOut.setHours(16, 0 + Math.floor(Math.random() * 15), 0);

    const breakMinutes = 30;
    const hoursWorked = calculateHoursWorked(
      clockIn.toISOString(),
      clockOut.toISOString(),
      breakMinutes
    );

    entries.push({
      employee_id: employeeId,
      date: date.toISOString().split('T')[0],
      clock_in: clockIn.toISOString(),
      clock_out: clockOut.toISOString(),
      hours_worked: hoursWorked,
      break_minutes: breakMinutes,
    });
  }

  return entries;
}

export async function seedSampleData(): Promise<{
  employees: number;
  timeEntries: number;
  schedules: number;
  training: number;
}> {
  if (!isDemoSeedEnabled()) {
    return { employees: 0, timeEntries: 0, schedules: 0, training: 0 };
  }
  let employeeCount = 0;
  let timeEntryCount = 0;
  let scheduleCount = 0;
  let trainingCount = 0;

  // Check if employees already exist
  const existingEmployees = await getEmployees();
  const employeesToUse: Employee[] = [...existingEmployees];

  // Create employees only if none exist
  if (existingEmployees.length === 0) {
    for (const empData of SAMPLE_EMPLOYEES) {
      const employee = await createEmployee(empData);
      employeesToUse.push(employee);
      employeeCount++;
    }

    // Create time entries for each new employee
    for (const employee of employeesToUse) {
      const timeEntries = generateSampleTimeEntries(employee.id);
      for (const entry of timeEntries) {
        await createTimeEntry(entry);
        timeEntryCount++;
      }
    }

    // Create schedules for each new employee
    for (const employee of employeesToUse) {
      const schedules = generateSampleSchedule(employee.id);
      for (const schedule of schedules) {
        await createScheduleEntry(schedule);
        scheduleCount++;
      }
    }
  }

  // Always ensure training modules exist
  const existingModules = await getTrainingModules();
  if (existingModules.length === 0) {
    saveToStorage(STORAGE_KEYS.trainingModules, SAMPLE_TRAINING_MODULES);
  }

  // Ensure employee training records exist for all employees
  const existingTraining = getFromStorage<EmployeeTraining>(STORAGE_KEYS.employeeTraining);
  if (existingTraining.length === 0 && employeesToUse.length > 0) {
    const employeeTraining: EmployeeTraining[] = [];
    for (const employee of employeesToUse) {
      for (const trainingModule of SAMPLE_TRAINING_MODULES) {
        const now = new Date();
        const completedAt = new Date(now);
        completedAt.setMonth(completedAt.getMonth() - Math.floor(Math.random() * 6));

        const expiresAt = trainingModule.expiration_months
          ? new Date(completedAt.getTime() + trainingModule.expiration_months * 30 * 24 * 60 * 60 * 1000)
          : undefined;

        const isExpired = expiresAt && expiresAt < now;
        const status = isExpired ? 'expired' : 'completed';

        employeeTraining.push({
          id: generateTrainingId(),
          employee_id: employee.id,
          module_id: trainingModule.id,
          status,
          started_at: completedAt.toISOString(),
          completed_at: completedAt.toISOString(),
          expires_at: expiresAt?.toISOString(),
          score: 85 + Math.floor(Math.random() * 15),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        });
        trainingCount++;
      }
    }
    saveToStorage(STORAGE_KEYS.employeeTraining, employeeTraining);
  }

  return {
    employees: employeeCount,
    timeEntries: timeEntryCount,
    schedules: scheduleCount,
    training: trainingCount,
  };
}

// Clear all employee-related data (for testing)
export async function clearAllEmployeeData(): Promise<void> {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  });
}
