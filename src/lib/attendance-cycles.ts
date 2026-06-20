// DCYF electronic-attendance billing cycles for CCAP Import Attendance.
//
// The state runs two-week billing cycles. The first cycle is June 22 to July 5,
// 2026; attendance for a cycle must be submitted within 10 days after the cycle
// ends (so the first deadline is July 15, 2026). Cycles repeat every 14 days.
//
// This is pure date math (no DB, no new tables): every cycle is derived from the
// anchor, so the hub can show the current cycle, recent cycles, and deadlines,
// and the reminders can fire, without persisting anything. Dates are center-day
// strings (YYYY-MM-DD); a noon anchor keeps DST from flipping a day.

export const CYCLE_ANCHOR = '2026-06-22'; // first cycle start
export const CYCLE_LENGTH_DAYS = 14;
export const SUBMIT_GRACE_DAYS = 10; // submit within 10 days after the cycle ends

export interface AttendanceCycle {
  index: number; // 0 = the first cycle (Jun 22 – Jul 5)
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (inclusive, start + 13)
  deadline: string; // YYYY-MM-DD (end + 10)
  label: string; // "Jun 22 – Jul 5"
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T12:00:00`).getTime();
  const db = new Date(`${b}T12:00:00`).getTime();
  return Math.floor((db - da) / 86400000);
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function pretty(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
}

export function cycleByIndex(index: number): AttendanceCycle {
  const start = addDays(CYCLE_ANCHOR, index * CYCLE_LENGTH_DAYS);
  const end = addDays(start, CYCLE_LENGTH_DAYS - 1);
  const deadline = addDays(end, SUBMIT_GRACE_DAYS);
  return { index, start, end, deadline, label: `${pretty(start)} – ${pretty(end)}` };
}

// The cycle that contains a given date (clamped to >= 0). Dates before the
// anchor return the first cycle.
export function cycleForDate(dateStr: string): AttendanceCycle {
  const offset = daysBetween(CYCLE_ANCHOR, dateStr);
  const index = offset < 0 ? 0 : Math.floor(offset / CYCLE_LENGTH_DAYS);
  return cycleByIndex(index);
}

// The current cycle plus the previous (count-1) cycles, newest first.
export function recentCycles(today: string, count = 4): AttendanceCycle[] {
  const cur = cycleForDate(today);
  const out: AttendanceCycle[] = [];
  for (let i = cur.index; i >= 0 && out.length < count; i--) out.push(cycleByIndex(i));
  return out;
}

// Days until a cycle's submission deadline (negative = overdue).
export function daysUntilDeadline(cycle: AttendanceCycle, today: string): number {
  return daysBetween(today, cycle.deadline);
}
