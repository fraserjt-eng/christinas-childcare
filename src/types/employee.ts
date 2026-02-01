// Employee & Payroll Types for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

import { UserRole } from './database';

// ============================================================================
// Employee Types
// ============================================================================

export interface Employee {
  id: string;
  email: string;
  pin: string; // 4-6 digit PIN for quick clock-in
  password_hash?: string; // For full portal access (in production, use proper auth)
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  job_title: string;
  hire_date: string;
  hourly_rate: number;
  employment_status: 'active' | 'inactive' | 'on_leave';
  certifications: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export type EmployeeCreate = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// Time Entry Types
// ============================================================================

export interface TimeEntry {
  id: string;
  employee_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  clock_in: string; // ISO datetime string
  clock_out?: string; // ISO datetime string
  hours_worked?: number; // Calculated field
  break_minutes?: number;
  notes?: string;
  edited_by?: string; // Admin who edited the entry
  edited_at?: string;
  created_at: string;
}

export type TimeEntryCreate = Omit<TimeEntry, 'id' | 'created_at'>;

// ============================================================================
// Pay Stub Types
// ============================================================================

export interface PayStub {
  id: string;
  employee_id: string;
  period_start: string; // ISO date
  period_end: string; // ISO date
  pay_date?: string; // ISO date when paid

  // Hours
  regular_hours: number;
  overtime_hours: number;

  // Pay
  hourly_rate: number;
  regular_pay: number; // regular_hours * hourly_rate
  overtime_pay: number; // overtime_hours * hourly_rate * 1.5
  gross_pay: number; // regular_pay + overtime_pay

  // Deductions (approximate percentages for demo)
  federal_tax: number; // ~12% of gross
  state_tax: number; // ~5% of gross (Virginia)
  social_security: number; // 6.2% of gross
  medicare: number; // 1.45% of gross
  other_deductions: number;
  total_deductions: number;

  // Net
  net_pay: number; // gross_pay - total_deductions

  // Status
  status: 'draft' | 'finalized' | 'paid';

  created_at: string;
  updated_at: string;
}

export type PayStubCreate = Omit<PayStub, 'id' | 'created_at' | 'updated_at'>;

// Tax calculation constants (approximate for demo purposes)
export const TAX_RATES = {
  federal: 0.12, // 12% federal income tax (simplified)
  state: 0.0575, // 5.75% Virginia state tax
  social_security: 0.062, // 6.2% Social Security
  medicare: 0.0145, // 1.45% Medicare
};

// ============================================================================
// Time Off Types
// ============================================================================

export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'unpaid';
export type TimeOffStatus = 'pending' | 'approved' | 'denied';

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  type: TimeOffType;
  start_date: string; // ISO date
  end_date: string; // ISO date
  hours_requested: number;
  reason?: string;
  status: TimeOffStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export type TimeOffRequestCreate = Omit<TimeOffRequest, 'id' | 'status' | 'reviewed_by' | 'reviewed_at' | 'review_notes' | 'created_at' | 'updated_at'>;

// ============================================================================
// Schedule Types
// ============================================================================

export interface ScheduleEntry {
  id: string;
  employee_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  start_time: string; // HH:MM format (24-hour)
  end_time: string; // HH:MM format (24-hour)
  classroom_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ScheduleEntryCreate = Omit<ScheduleEntry, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// Training Types
// ============================================================================

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'required' | 'recommended' | 'optional';
  duration_hours: number;
  expiration_months?: number; // How long certification is valid
  content_url?: string;
}

export interface EmployeeTraining {
  id: string;
  employee_id: string;
  module_id: string;
  status: TrainingStatus;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;
  score?: number; // Percentage score if applicable
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Pay Period Types
// ============================================================================

export interface PayPeriod {
  start: string; // ISO date
  end: string; // ISO date
  pay_date: string; // ISO date (typically Friday after period ends)
}

// Helper to generate bi-weekly pay periods
export function generatePayPeriods(year: number): PayPeriod[] {
  const periods: PayPeriod[] = [];
  // Start from first Sunday of the year
  let startDate = new Date(year, 0, 1);
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() + 1);
  }

  while (startDate.getFullYear() === year) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13); // Two weeks minus 1 day

    const payDate = new Date(endDate);
    payDate.setDate(payDate.getDate() + 5); // Friday after period ends

    periods.push({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      pay_date: payDate.toISOString().split('T')[0],
    });

    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() + 1);
  }

  return periods;
}

// Get the current pay period
export function getCurrentPayPeriod(): PayPeriod {
  const today = new Date();
  const periods = generatePayPeriods(today.getFullYear());

  for (const period of periods) {
    const start = new Date(period.start);
    const end = new Date(period.end);
    if (today >= start && today <= end) {
      return period;
    }
  }

  // Fallback to last period if somehow outside all periods
  return periods[periods.length - 1];
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateEmployeeId(): string {
  return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTimeEntryId(): string {
  return `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePayStubId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTimeOffId(): string {
  return `pto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateScheduleId(): string {
  return `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTrainingId(): string {
  return `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate hours between two ISO datetime strings
export function calculateHoursWorked(clockIn: string, clockOut: string, breakMinutes: number = 0): number {
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const breakHours = breakMinutes / 60;
  return Math.round((diffHours - breakHours) * 100) / 100; // Round to 2 decimal places
}

// Calculate pay stub from time entries
export function calculatePayStub(
  employee: Employee,
  timeEntries: TimeEntry[],
  periodStart: string,
  periodEnd: string
): Omit<PayStub, 'id' | 'created_at' | 'updated_at'> {
  // Sum up hours worked
  let totalHours = 0;
  for (const entry of timeEntries) {
    if (entry.hours_worked) {
      totalHours += entry.hours_worked;
    }
  }

  // Calculate regular and overtime hours (overtime after 40 hours/week)
  // For bi-weekly, overtime kicks in after 80 hours
  const regularHours = Math.min(totalHours, 80);
  const overtimeHours = Math.max(0, totalHours - 80);

  // Calculate pay
  const regularPay = regularHours * employee.hourly_rate;
  const overtimePay = overtimeHours * employee.hourly_rate * 1.5;
  const grossPay = regularPay + overtimePay;

  // Calculate deductions
  const federalTax = Math.round(grossPay * TAX_RATES.federal * 100) / 100;
  const stateTax = Math.round(grossPay * TAX_RATES.state * 100) / 100;
  const socialSecurity = Math.round(grossPay * TAX_RATES.social_security * 100) / 100;
  const medicare = Math.round(grossPay * TAX_RATES.medicare * 100) / 100;
  const otherDeductions = 0;
  const totalDeductions = federalTax + stateTax + socialSecurity + medicare + otherDeductions;

  // Calculate net pay
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  return {
    employee_id: employee.id,
    period_start: periodStart,
    period_end: periodEnd,
    regular_hours: regularHours,
    overtime_hours: overtimeHours,
    hourly_rate: employee.hourly_rate,
    regular_pay: regularPay,
    overtime_pay: overtimePay,
    gross_pay: grossPay,
    federal_tax: federalTax,
    state_tax: stateTax,
    social_security: socialSecurity,
    medicare: medicare,
    other_deductions: otherDeductions,
    total_deductions: totalDeductions,
    net_pay: netPay,
    status: 'draft',
  };
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format hours (e.g., 8.5 -> "8h 30m")
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Format time for display (24h to 12h)
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Get employee full name
export function getEmployeeFullName(employee: Employee): string {
  return `${employee.first_name} ${employee.last_name}`;
}

// ============================================================================
// Schedule Request Types
// ============================================================================

export type ScheduleRequestType = 'shift_swap' | 'schedule_change' | 'time_off_coverage';
export type ScheduleRequestStatus = 'pending' | 'approved' | 'denied';

export interface ScheduleRequest {
  id: string;
  employee_id: string;
  request_type: ScheduleRequestType;
  requested_date: string; // ISO date
  current_start_time?: string; // Current shift start (for swaps/changes)
  current_end_time?: string; // Current shift end (for swaps/changes)
  requested_start_time?: string; // Requested new start time
  requested_end_time?: string; // Requested new end time
  swap_with_employee_id?: string; // For shift swaps
  reason: string;
  status: ScheduleRequestStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export type ScheduleRequestCreate = Omit<
  ScheduleRequest,
  'id' | 'status' | 'reviewed_by' | 'reviewed_at' | 'review_notes' | 'created_at' | 'updated_at'
>;

// ============================================================================
// Building Types (Multi-Location Support)
// ============================================================================

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  is_primary: boolean;
  capacity?: number;
}

// Default buildings
export const BUILDINGS: Building[] = [
  {
    id: 'bld_crystal',
    name: 'Crystal',
    address: '5510 W Broadway Ave',
    city: 'Crystal',
    state: 'MN',
    zip: '55428',
    phone: '(763) 555-0100',
    is_primary: true,
    capacity: 96,
  },
  {
    id: 'bld_brooklyn_park',
    name: 'Brooklyn Park',
    address: 'TBD',
    city: 'Brooklyn Park',
    state: 'MN',
    zip: '55443',
    is_primary: false,
    capacity: 72,
  },
];

// ============================================================================
// Salaried Allocation Types
// ============================================================================

export interface SalariedAllocation {
  id: string;
  employee_id: string;
  week_start: string; // ISO date (Monday)
  building_id: string;
  role_coverage: string; // e.g., "Morning Director", "Floater", "Admin"
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type SalariedAllocationCreate = Omit<SalariedAllocation, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// Weekly Hours Summary Types
// ============================================================================

export interface WeeklyHoursSummary {
  employee_id: string;
  employee_name: string;
  week_start: string;
  week_end: string;
  scheduled_hours: number;
  actual_hours: number;
  overtime_hours: number; // Hours over 40
  variance: number; // actual - scheduled
  by_day: {
    date: string;
    day_name: string;
    scheduled_hours: number;
    actual_hours: number;
  }[];
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | 'schedule_published'
  | 'schedule_changed'
  | 'request_approved'
  | 'request_denied'
  | 'time_off_reminder'
  | 'training_due'
  | 'general';

export interface Notification {
  id: string;
  employee_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string; // Optional link to related page
  created_at: string;
}

export type NotificationCreate = Omit<Notification, 'id' | 'read' | 'created_at'>;

// ============================================================================
// Additional ID Generators
// ============================================================================

export function generateScheduleRequestId(): string {
  return `sreq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSalariedAllocationId(): string {
  return `salloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Schedule Request Helpers
// ============================================================================

export function getScheduleRequestTypeLabel(type: ScheduleRequestType): string {
  const labels: Record<ScheduleRequestType, string> = {
    shift_swap: 'Shift Swap',
    schedule_change: 'Schedule Change',
    time_off_coverage: 'Time Off Coverage',
  };
  return labels[type];
}

export function getScheduleRequestStatusLabel(status: ScheduleRequestStatus): string {
  const labels: Record<ScheduleRequestStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    denied: 'Denied',
  };
  return labels[status];
}

// ============================================================================
// Salaried Staff Helpers
// ============================================================================

// Job titles that are considered salaried (for filtering)
export const SALARIED_JOB_TITLES = [
  'Owner',
  'Owner/Director',
  'Director',
  'Assistant Director',
  'Asst Director',
];

export function isSalariedEmployee(employee: Employee): boolean {
  return SALARIED_JOB_TITLES.some(
    (title) => employee.job_title.toLowerCase().includes(title.toLowerCase())
  );
}
