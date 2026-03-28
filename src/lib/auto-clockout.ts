// Auto-clockout utility for Christina's Child Care Center
// Finds open time entries from previous days and closes them at 6 PM.

import type { TimeEntry } from '@/types/employee';

const TIME_ENTRIES_KEY = 'christinas_time_entries';

// The default auto-clockout time (6 PM, end of operating hours)
const AUTO_CLOCKOUT_TIME = '18:00';

// ─── Helpers ──────────────────────────────────────────────────────────

function safeParseEntries(): TimeEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TIME_ENTRIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TimeEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: TimeEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('auto-clockout: failed to save entries', err);
  }
}

// Builds an ISO datetime string for a given date at HH:MM (local midnight base)
// e.g. buildDateTimeAt('2026-03-27', '18:00') => '2026-03-27T18:00:00.000Z' (local)
function buildDateTimeAt(date: string, time: string): string {
  // Construct as local time by using the date string + time component
  const [hours, minutes] = time.split(':').map(Number);
  const dt = new Date(date);
  dt.setHours(hours, minutes, 0, 0);
  return dt.toISOString();
}

// Calculates hours between two ISO datetime strings, rounded to 2 decimal places
function calculateHours(clockIn: string, clockOut: string): number {
  const start = new Date(clockIn).getTime();
  const end = new Date(clockOut).getTime();
  const diffHours = (end - start) / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
}

// ─── autoClockOutOpenEntries ──────────────────────────────────────────

export interface AutoClockOutResult {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  hours_worked: number;
}

/**
 * Finds all time entries where clock_out is missing and the date is before
 * today. Closes each entry at AUTO_CLOCKOUT_TIME (18:00) on its own date.
 * Returns an array of the auto-closed entries so callers can report them.
 */
export function autoClockOutOpenEntries(): AutoClockOutResult[] {
  const today = new Date().toISOString().split('T')[0];
  const entries = safeParseEntries();
  const closed: AutoClockOutResult[] = [];

  const updated = entries.map((entry) => {
    // Only touch entries that are open (no clock_out) and from before today
    if (entry.clock_out || entry.date >= today) {
      return entry;
    }

    const autoClockOut = buildDateTimeAt(entry.date, AUTO_CLOCKOUT_TIME);
    const hoursWorked = calculateHours(entry.clock_in, autoClockOut);

    const patched: TimeEntry = {
      ...entry,
      clock_out: autoClockOut,
      hours_worked: hoursWorked,
      notes: entry.notes
        ? `${entry.notes} [Auto-clocked out at 6 PM]`
        : 'Auto-clocked out at 6 PM',
      edited_at: new Date().toISOString(),
      edited_by: 'system',
    };

    closed.push({
      id: patched.id,
      employee_id: patched.employee_id,
      date: patched.date,
      clock_in: patched.clock_in,
      clock_out: autoClockOut,
      hours_worked: hoursWorked,
    });

    return patched;
  });

  if (closed.length > 0) {
    saveEntries(updated);
  }

  return closed;
}
