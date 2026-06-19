// Schedule Optimizer Storage Module for Christina's Child Care Center
// localStorage persistence with cloud sync to staff_schedules (the table the
// new portal writes shifts to), so the admin drag board and the portal schedule
// share one source of truth. staff_schedules is RLS service-role-only, so cloud
// reads/writes go through the session-gated /api/staff/schedule route, never the
// anon client.

import { currentCenterId } from '@/lib/current-center';

const CRYSTAL_CENTER_ID = 'b2000000-0000-0000-0000-000000000002';

export interface ScheduleShift {
  id: string;
  employee_id: string;
  employee_name: string;
  center_id: 'crystal' | 'brooklyn_park';
  date: string; // ISO date string YYYY-MM-DD
  start_time: string; // HH:MM (24h)
  end_time: string; // HH:MM (24h)
  classroom_id?: string;
  hourly_rate?: number;
  is_overtime: boolean;
}

export interface RatioRequirement {
  classroom_id: string;
  classroom_name: string;
  min_staff: number;
  max_children: number;
  age_group: 'infant' | 'toddler' | 'preschool' | 'school_age';
}

export interface CoverageRequest {
  id: string;
  requesting_employee_id: string;
  requesting_employee_name: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  cover_employee_id?: string;
  cover_employee_name?: string;
  created_at: string;
}

// Legal ratio requirements by age group (MN state minimums)
export const RATIO_REQUIREMENTS: Record<string, { staff: number; children: number }> = {
  infant: { staff: 1, children: 4 },
  toddler: { staff: 1, children: 7 },
  preschool: { staff: 1, children: 10 },
  school_age: { staff: 1, children: 15 },
};

export const CENTER_LABELS: Record<string, string> = {
  crystal: 'Crystal',
  brooklyn_park: 'Brooklyn Park',
};

const SHIFTS_KEY = 'christinas_schedule_shifts';
const COVERAGE_KEY = 'christinas_coverage_requests';
const SEEDED_KEY = 'christinas_schedule_seeded';

// ============================================================================
// Generic Storage Helpers
// ============================================================================

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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Parse HH:MM time string into minutes since midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Format minutes to HH:MM
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Calculate shift duration in hours
export function shiftHours(shift: ScheduleShift): number {
  const start = timeToMinutes(shift.start_time);
  const end = timeToMinutes(shift.end_time);
  return Math.max(0, (end - start) / 60);
}

// ============================================================================
// Seed Data — 2 weeks of shifts for 8 staff across 2 centers
// ============================================================================

function buildSeedShifts(): ScheduleShift[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // this Monday

  function dateStr(weekOffset: number, dayOffset: number): string {
    const d = new Date(monday);
    d.setDate(monday.getDate() + weekOffset * 7 + dayOffset);
    return d.toISOString().slice(0, 10);
  }

  const staff = [
    { id: 'emp-oz', name: 'Ophelia Zeogar', center: 'crystal' as const, rate: 28, room: 'rm-infants' },
    { id: 'emp-cf', name: 'Christina Fraser', center: 'crystal' as const, rate: 24, room: 'rm-preschool' },
    { id: 'emp-ms', name: 'Maria Santos', center: 'crystal' as const, rate: 20, room: 'rm-infants' },
    { id: 'emp-jr', name: 'James Robinson', center: 'crystal' as const, rate: 20, room: 'rm-toddlers' },
    { id: 'emp-sk', name: 'Sarah Kim', center: 'brooklyn_park' as const, rate: 20, room: 'rm-preschool-bp' },
    { id: 'emp-dc', name: 'David Chen', center: 'brooklyn_park' as const, rate: 18, room: 'rm-school-age-bp' },
    { id: 'emp-lj', name: 'Lisa Johnson', center: 'brooklyn_park' as const, rate: 17, room: 'rm-toddlers-bp' },
    { id: 'emp-sz', name: 'Stephen Zeogar', center: 'crystal' as const, rate: 25, room: 'rm-preschool' },
  ];

  const shifts: ScheduleShift[] = [];

  for (let week = 0; week < 2; week++) {
    for (let day = 0; day < 5; day++) {
      const date = dateStr(week, day);

      staff.forEach((s, idx) => {
        // Vary shifts a bit for realism
        const startOffset = idx % 3 === 0 ? '07:00' : idx % 3 === 1 ? '08:00' : '09:00';
        const endOffset = idx % 3 === 0 ? '15:30' : idx % 3 === 1 ? '16:30' : '17:30';

        // Skip Stephen on some days and skip Lisa on Fridays
        if (s.id === 'emp-sz' && day > 2) return;
        if (s.id === 'emp-lj' && day === 4 && week === 1) return;

        // Maria works half days on Wednesdays week 2
        const end = s.id === 'emp-ms' && day === 2 && week === 1 ? '12:00' : endOffset;

        const hoursWorked = timeToMinutes(end) / 60 - timeToMinutes(startOffset) / 60;
        const weeklyHours = 5 * hoursWorked; // approx
        const isOvertime = weeklyHours > 40;

        shifts.push({
          id: generateId(),
          employee_id: s.id,
          employee_name: s.name,
          center_id: s.center,
          date,
          start_time: startOffset,
          end_time: end,
          classroom_id: s.room,
          hourly_rate: s.rate,
          is_overtime: isOvertime,
        });
      });
    }
  }

  return shifts;
}

function buildSeedCoverageRequests(): CoverageRequest[] {
  const today = new Date();
  const friday = new Date(today);
  friday.setDate(today.getDate() + (5 - today.getDay()));
  const nextMon = new Date(today);
  nextMon.setDate(today.getDate() + (8 - today.getDay()));

  return [
    {
      id: generateId(),
      requesting_employee_id: 'emp-lj',
      requesting_employee_name: 'Lisa Johnson',
      date: friday.toISOString().slice(0, 10),
      reason: 'Doctor appointment — need afternoon coverage',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: generateId(),
      requesting_employee_id: 'emp-ms',
      requesting_employee_name: 'Maria Santos',
      date: nextMon.toISOString().slice(0, 10),
      reason: 'Family obligation',
      status: 'pending',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: generateId(),
      requesting_employee_id: 'emp-jr',
      requesting_employee_name: 'James Robinson',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).toISOString().slice(0, 10),
      reason: 'Sick child',
      status: 'approved',
      cover_employee_id: 'emp-cf',
      cover_employee_name: 'Christina Fraser',
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ];
}

function seedIfNeeded(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  saveToStorage(SHIFTS_KEY, buildSeedShifts());
  saveToStorage(COVERAGE_KEY, buildSeedCoverageRequests());
  localStorage.setItem(SEEDED_KEY, 'true');
}

// ============================================================================
// Shift CRUD
// ============================================================================

export function getShifts(filters?: {
  employee_id?: string;
  center_id?: string;
  date?: string;
  week_start?: string; // YYYY-MM-DD Monday
}): ScheduleShift[] {
  seedIfNeeded();
  let shifts = getFromStorage<ScheduleShift>(SHIFTS_KEY);

  if (filters) {
    if (filters.employee_id) shifts = shifts.filter(s => s.employee_id === filters.employee_id);
    if (filters.center_id) shifts = shifts.filter(s => s.center_id === filters.center_id);
    if (filters.date) shifts = shifts.filter(s => s.date === filters.date);
    if (filters.week_start) {
      const start = new Date(filters.week_start);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      shifts = shifts.filter(s => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      });
    }
  }

  return shifts.sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
}

// ── Cloud sync (staff_schedules via the session-gated route) ────────────────

const CENTER_API = '/api/staff/schedule';

// A UUID so the local shift id matches the cloud row id (the route honors a
// provided UUID), so a later sync reconciles cleanly with no duplicate.
function newShiftId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return generateId();
}

// The current center as the board's label.
function currentCenterLabel(): 'crystal' | 'brooklyn_park' {
  return currentCenterId() === CRYSTAL_CENTER_ID ? 'crystal' : 'brooklyn_park';
}

// Pull THIS center's cloud shifts into the local cache so the board shows what
// the portal recorded. Cloud is authoritative for the current center; the other
// center's local shifts are left untouched. No-ops (keeps local as-is) when
// there is no session or the fetch fails, so offline edits are never lost.
export async function syncShiftsFromCloud(): Promise<void> {
  if (typeof window === 'undefined') return;
  let cloud: ScheduleShift[];
  try {
    const res = await fetch(CENTER_API);
    if (!res.ok) return;
    const json = (await res.json()) as { shifts?: Array<Record<string, unknown>> };
    const label = currentCenterLabel();
    cloud = (json.shifts ?? []).map((r) => ({
      id: r.id as string,
      employee_id: r.employee_id as string,
      employee_name: '',
      center_id: label,
      date: r.date as string,
      start_time: (r.start_time as string) || '',
      end_time: (r.end_time as string) || '',
      classroom_id: (r.classroom_id as string | null) ?? undefined,
      is_overtime: false,
    }));
  } catch {
    return;
  }
  const label = currentCenterLabel();
  const otherCenter = getFromStorage<ScheduleShift>(SHIFTS_KEY).filter(
    (s) => s.center_id !== label
  );
  saveToStorage(SHIFTS_KEY, [...cloud, ...otherCenter]);
}

function pushShiftToCloud(shift: ScheduleShift): void {
  if (typeof window === 'undefined') return;
  void fetch(CENTER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: shift.id,
      employeeId: shift.employee_id,
      date: shift.date,
      start: shift.start_time,
      end: shift.end_time,
      classroomId: shift.classroom_id ?? null,
    }),
  }).catch(() => {});
}

export function createShift(data: Omit<ScheduleShift, 'id'>): ScheduleShift {
  const shifts = getFromStorage<ScheduleShift>(SHIFTS_KEY);
  const shift: ScheduleShift = { ...data, id: newShiftId() };
  saveToStorage(SHIFTS_KEY, [...shifts, shift]);
  // Mirror to the cloud (same id) so the portal sees it. Fire-and-forget; the
  // local write already updated the board.
  pushShiftToCloud(shift);
  return shift;
}

export function updateShift(id: string, updates: Partial<ScheduleShift>): ScheduleShift | null {
  const shifts = getFromStorage<ScheduleShift>(SHIFTS_KEY);
  const idx = shifts.findIndex(s => s.id === id);
  if (idx === -1) return null;
  shifts[idx] = { ...shifts[idx], ...updates };
  saveToStorage(SHIFTS_KEY, shifts);
  if (typeof window !== 'undefined') {
    const patch: Record<string, unknown> = { id };
    if (updates.date !== undefined) patch.date = updates.date;
    if (updates.start_time !== undefined) patch.start = updates.start_time;
    if (updates.end_time !== undefined) patch.end = updates.end_time;
    if (updates.classroom_id !== undefined) patch.classroomId = updates.classroom_id;
    void fetch(CENTER_API, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {});
  }
  return shifts[idx];
}

export function deleteShift(id: string): void {
  const shifts = getFromStorage<ScheduleShift>(SHIFTS_KEY).filter(s => s.id !== id);
  saveToStorage(SHIFTS_KEY, shifts);
  if (typeof window !== 'undefined') {
    void fetch(`${CENTER_API}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }
}

// ============================================================================
// Coverage Requests
// ============================================================================

export function getCoverageRequests(status?: CoverageRequest['status']): CoverageRequest[] {
  seedIfNeeded();
  let requests = getFromStorage<CoverageRequest>(COVERAGE_KEY);
  if (status) requests = requests.filter(r => r.status === status);
  return requests.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createCoverageRequest(data: Omit<CoverageRequest, 'id' | 'created_at' | 'status'>): CoverageRequest {
  const requests = getFromStorage<CoverageRequest>(COVERAGE_KEY);
  const request: CoverageRequest = {
    ...data,
    id: generateId(),
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  saveToStorage(COVERAGE_KEY, [...requests, request]);
  return request;
}

export function approveCoverage(id: string, coverEmployeeId: string, coverEmployeeName: string): CoverageRequest | null {
  const requests = getFromStorage<CoverageRequest>(COVERAGE_KEY);
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return null;
  requests[idx] = {
    ...requests[idx],
    status: 'approved',
    cover_employee_id: coverEmployeeId,
    cover_employee_name: coverEmployeeName,
  };
  saveToStorage(COVERAGE_KEY, requests);
  return requests[idx];
}

export function denyCoverage(id: string): CoverageRequest | null {
  const requests = getFromStorage<CoverageRequest>(COVERAGE_KEY);
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return null;
  requests[idx] = { ...requests[idx], status: 'denied' };
  saveToStorage(COVERAGE_KEY, requests);
  return requests[idx];
}

// ============================================================================
// Ratio Compliance
// ============================================================================

// Static classroom definitions with enrolled counts (demo data)
export const CLASSROOMS: RatioRequirement[] = [
  { classroom_id: 'rm-infants', classroom_name: 'Infant Room (Crystal)', min_staff: 2, max_children: 8, age_group: 'infant' },
  { classroom_id: 'rm-toddlers', classroom_name: 'Toddler Room (Crystal)', min_staff: 2, max_children: 14, age_group: 'toddler' },
  { classroom_id: 'rm-preschool', classroom_name: 'Preschool (Crystal)', min_staff: 2, max_children: 20, age_group: 'preschool' },
  { classroom_id: 'rm-preschool-bp', classroom_name: 'Preschool (Brooklyn Park)', min_staff: 2, max_children: 20, age_group: 'preschool' },
  { classroom_id: 'rm-toddlers-bp', classroom_name: 'Toddler Room (Brooklyn Park)', min_staff: 2, max_children: 14, age_group: 'toddler' },
  { classroom_id: 'rm-school-age-bp', classroom_name: 'School Age (Brooklyn Park)', min_staff: 1, max_children: 15, age_group: 'school_age' },
];

export interface RatioComplianceResult {
  classroom: RatioRequirement;
  enrolled: number;
  scheduled_staff: number;
  required_staff: number;
  compliant: boolean;
  ratio_string: string; // e.g. "1:6"
}

export function getRatioCompliance(date: string): RatioComplianceResult[] {
  const shifts = getShifts({ date });

  // Simulated enrolled counts (in production these come from attendance)
  const enrolledCounts: Record<string, number> = {
    'rm-infants': 7,
    'rm-toddlers': 11,
    'rm-preschool': 17,
    'rm-preschool-bp': 15,
    'rm-toddlers-bp': 10,
    'rm-school-age-bp': 12,
  };

  return CLASSROOMS.map(classroom => {
    // Count UNIQUE staff in the room, not shifts. Same person on two shifts
    // is still one body in the room for ratio compliance purposes.
    const staffInRoom = new Set(
      shifts
        .filter(s => s.classroom_id === classroom.classroom_id)
        .map(s => s.employee_id)
    );
    const staffCount = staffInRoom.size;
    const enrolled = enrolledCounts[classroom.classroom_id] || 0;
    const req = RATIO_REQUIREMENTS[classroom.age_group];
    // Honor both the per-classroom min_staff floor and the age-ratio requirement.
    const ratioRequired = Math.ceil(enrolled / req.children);
    const requiredStaff = Math.max(classroom.min_staff, ratioRequired);

    return {
      classroom,
      enrolled,
      scheduled_staff: staffCount,
      required_staff: requiredStaff,
      compliant: staffCount >= requiredStaff,
      ratio_string: staffCount > 0 ? `1:${Math.round(enrolled / staffCount)}` : 'No staff',
    };
  });
}

// One-time backfill: classroom_id became required for ratio compliance.
// Older seeded shifts may have undefined classroom_id; fall back to a
// hardcoded employee→room map. Defensively wrapped so a corrupt storage
// row never crashes the optimizer page.
const EMPLOYEE_ROOM_FALLBACK: Record<string, string> = {
  'emp-oz': 'rm-infants',
  'emp-cf': 'rm-preschool',
  'emp-ms': 'rm-infants',
  'emp-jr': 'rm-toddlers',
  'emp-sk': 'rm-preschool-bp',
  'emp-dc': 'rm-school-age-bp',
  'emp-lj': 'rm-toddlers-bp',
  'emp-sz': 'rm-preschool',
};

export function backfillShiftClassrooms(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const shifts = getFromStorage<ScheduleShift>(SHIFTS_KEY);
    let updated = 0;
    const next = shifts.map(s => {
      if (s.classroom_id) return s;
      const room = EMPLOYEE_ROOM_FALLBACK[s.employee_id];
      if (!room) return s;
      updated += 1;
      return { ...s, classroom_id: room };
    });
    if (updated > 0) saveToStorage(SHIFTS_KEY, next);
    return updated;
  } catch (err) {
    console.warn('backfillShiftClassrooms failed (non-fatal):', err);
    return 0;
  }
}

// ============================================================================
// Labor Cost Projection
// ============================================================================

export interface LaborCostDay {
  date: string;
  day_label: string;
  cost: number;
  hours: number;
}

export interface EmployeeCostSummary {
  employee_id: string;
  employee_name: string;
  total_hours: number;
  overtime_hours: number;
  total_cost: number;
  daily_hours: Record<string, number>;
}

export function getLaborCost(startDate: string, endDate: string): {
  daily: LaborCostDay[];
  by_employee: EmployeeCostSummary[];
  total_cost: number;
  total_hours: number;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const allShifts: ScheduleShift[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const d = cur.toISOString().slice(0, 10);
    allShifts.push(...getShifts({ date: d }));
    cur.setDate(cur.getDate() + 1);
  }

  const daily: LaborCostDay[] = [];
  const cur2 = new Date(start);
  while (cur2 <= end) {
    const d = cur2.toISOString().slice(0, 10);
    const dayShifts = allShifts.filter(s => s.date === d);
    const cost = dayShifts.reduce((sum, s) => sum + shiftHours(s) * (s.hourly_rate || 0), 0);
    const hours = dayShifts.reduce((sum, s) => sum + shiftHours(s), 0);
    daily.push({
      date: d,
      day_label: new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      cost,
      hours,
    });
    cur2.setDate(cur2.getDate() + 1);
  }

  // Group by employee
  const empMap = new Map<string, EmployeeCostSummary>();
  for (const shift of allShifts) {
    if (!empMap.has(shift.employee_id)) {
      empMap.set(shift.employee_id, {
        employee_id: shift.employee_id,
        employee_name: shift.employee_name,
        total_hours: 0,
        overtime_hours: 0,
        total_cost: 0,
        daily_hours: {},
      });
    }
    const emp = empMap.get(shift.employee_id)!;
    const h = shiftHours(shift);
    emp.total_hours += h;
    emp.total_cost += h * (shift.hourly_rate || 0);
    if (shift.is_overtime) emp.overtime_hours += h;
    emp.daily_hours[shift.date] = (emp.daily_hours[shift.date] || 0) + h;
  }

  const by_employee = Array.from(empMap.values()).sort((a, b) => b.total_cost - a.total_cost);
  const total_cost = by_employee.reduce((s, e) => s + e.total_cost, 0);
  const total_hours = by_employee.reduce((s, e) => s + e.total_hours, 0);

  return { daily, by_employee, total_cost, total_hours };
}

// ============================================================================
// Overtime Alerts
// ============================================================================

export interface OvertimeAlert {
  employee_id: string;
  employee_name: string;
  weekly_hours: number;
  threshold: number;
  severity: 'warning' | 'critical';
}

export function getOvertimeAlerts(weekStart?: string): OvertimeAlert[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const start = weekStart || monday.toISOString().slice(0, 10);
  const end = new Date(start);
  end.setDate(new Date(start).getDate() + 6);
  const endStr = end.toISOString().slice(0, 10);

  const { by_employee } = getLaborCost(start, endStr);
  const alerts: OvertimeAlert[] = [];

  for (const emp of by_employee) {
    if (emp.total_hours >= 40) {
      alerts.push({
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        weekly_hours: emp.total_hours,
        threshold: 40,
        severity: emp.total_hours >= 44 ? 'critical' : 'warning',
      });
    } else if (emp.total_hours >= 36) {
      alerts.push({
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        weekly_hours: emp.total_hours,
        threshold: 40,
        severity: 'warning',
      });
    }
  }

  return alerts;
}
