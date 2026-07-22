// Enrollment end dates: the single place that decides whether a child is still
// enrolled on a given day. The kiosk roster, the admin roster, and the DHS /
// CCAP attendance export all read this, so "ended" means exactly one thing.
//
// SEMANTICS (migration 053): end_date is the child's LAST day of care, and it
// is INCLUSIVE. A child with end_date 2026-07-17 may still be checked in ON
// 07/17 and disappears from the kiosk on 07/18. Attendance already recorded is
// never touched or hidden -- a closed period exports exactly as it did before,
// which is what DHS's six-year retention rule requires.
//
// A family-level end date is the whole household leaving. A child-level end
// date is one child leaving while siblings stay. When both are set, the EARLIER
// one wins: whichever ended first is the day care actually stopped.

import { centerDate } from './center-time';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// The reasons Christina actually writes on the roster sheet. Free text is still
// allowed (the column is text, not an enum) -- these just make the common cases
// one tap instead of typing, so the export reads consistently.
export const END_REASONS = [
  'Moved',
  'Auth End',
  'Withdrawn',
  'Aged out',
  'Duplicate account',
  'Other',
] as const;

// Accept a date from a form or an API body. Returns a clean YYYY-MM-DD, or null
// for "no end date" (empty means still enrolled). Returns undefined when the
// value is present but unparseable, so callers can reject instead of silently
// clearing an end date -- a swallowed parse error here would put a departed
// child back on the live kiosk roster.
export function normalizeEndDate(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (!ISO_DATE_RE.test(s)) return undefined;
  // Reject calendar-impossible dates (2026-02-31) that pass the shape test.
  const [y, m, d] = s.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    return undefined;
  }
  return s;
}

// The day care actually stopped for this child: the earlier of their own end
// date and their family's. Null when neither is set.
export function effectiveEndDate(
  childEnd: string | null | undefined,
  familyEnd: string | null | undefined
): string | null {
  const c = childEnd || null;
  const f = familyEnd || null;
  if (c && f) return c < f ? c : f;
  return c || f;
}

// Is this child off the roster on `onDate` (a center-local YYYY-MM-DD)?
// Inclusive end date: false ON the end date, true the day after.
export function isEnded(
  endDate: string | null | undefined,
  onDate: string = centerDate()
): boolean {
  if (!endDate) return false;
  return onDate > endDate;
}

// Convenience for roster reads: still enrolled today (center time)?
export function isEnrolledOn(
  child: { end_date?: string | null },
  family: { end_date?: string | null } | null | undefined,
  onDate: string = centerDate()
): boolean {
  return !isEnded(effectiveEndDate(child.end_date, family?.end_date), onDate);
}

// Human label for admin lists and CSV columns. Empty string when still
// enrolled, so a blank cell reads as "no end date" rather than "unknown".
export function endLabel(
  endDate: string | null | undefined,
  reason?: string | null
): string {
  if (!endDate) return '';
  return reason ? `${endDate} (${reason})` : endDate;
}
