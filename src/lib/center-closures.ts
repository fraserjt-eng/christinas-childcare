// Upcoming days the center is closed, with a self-expiring heads-up notice.
//
// Each closure shows a reminder in the lead-up days and then stops on its own the
// day after the closure, so a "closed Friday" message can never linger stale into
// the following month. Add a new holiday by appending one row; nothing else to
// touch. Dates are center-local (America/Chicago) YYYY-MM-DD.

import { centerDate, shiftCenterDate } from './center-time';

export interface CenterClosure {
  /** The day the center is closed, center-local YYYY-MM-DD. */
  date: string;
  /** Human label for the closed day, e.g. "Friday, July 3". */
  weekdayLabel: string;
  /** Why it's closed, e.g. "Independence Day". */
  reason: string;
  /** Start surfacing the heads-up this many days before the closure. */
  showFromDaysBefore: number;
}

// July 4, 2026 falls on a Saturday, so the center observes the holiday by closing
// Friday, July 3.
const CLOSURES: CenterClosure[] = [
  {
    date: '2026-07-03',
    weekdayLabel: 'Friday, July 3',
    reason: 'Independence Day',
    showFromDaysBefore: 10,
  },
];

// The closure notice to surface today (center-local), or null if none is active.
// Shows from (date - showFromDaysBefore) through the closure date, inclusive.
export function activeClosureNotice(now: Date = new Date()): CenterClosure | null {
  const today = centerDate(now); // YYYY-MM-DD, lexicographically comparable
  for (const c of CLOSURES) {
    const start = shiftCenterDate(c.date, -c.showFromDaysBefore);
    if (today >= start && today <= c.date) return c;
  }
  return null;
}
