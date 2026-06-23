// The DCYF "Import Attendance" CSV format, defined in ONE place so the standalone
// export page and the Attendance Hub can never drift from the Provider Hub's
// template. The template (from DCYF's downloadable file) requires this EXACT
// header row and these formats:
//   - Child Date of Birth: MM/DD/YYYY
//   - Time Checked In / Out: a full date-time, MM/DD/YYYY HH:MM AM/PM
//   - no extra spaces; the Provider Hub rejects extra spaces or wrong formats
//   - max 250 data rows per file (split into multiple files past that)
// Times are rendered in the center's timezone (America/Chicago), matching how the
// rest of the app reads attendance. Stored timestamps stay UTC.

import { CENTER_TZ } from './center-time';

export interface DcyfExportRow {
  firstName: string;
  lastName: string;
  /** YYYY-MM-DD from family_children.date_of_birth. */
  dob: string | null;
  /** ISO timestamp of check-in (UTC). */
  checkIn: string | null;
  /** ISO timestamp of check-out (UTC), or null. */
  checkOut: string | null;
  signInPerson?: string | null;
  signOutPerson?: string | null;
}

// The exact template header row (byte-for-byte from DCYF's Attendance Upload Template).
export const DCYF_HEADER =
  'Child First Name *REQUIRED*,Child Last Name *REQUIRED*,Child Date of Birth (MM/DD/YYYY) *REQUIRED*,Time Checked In (MM/DD/YYYY HH:MM AM/PM) *REQUIRED*,Time Checked Out (MM/DD/YYYY HH:MM AM/PM),Sign In Person (Full Name),Sign Out Person (Full Name)';

export const DCYF_MAX_ROWS = 250;

const dcyfDateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: CENTER_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}); // MM/DD/YYYY
const dcyfTimeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: CENTER_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
}); // HH:MM AM/PM

function csvCell(value: string): string {
  const s = (value ?? '').toString();
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// "MM/DD/YYYY HH:MM AM/PM" in center time, or '' when there is no instant.
export function dcyfDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${dcyfDateFmt.format(d)} ${dcyfTimeFmt.format(d)}`.trim();
}

// DOB is stored as a bare date (YYYY-MM-DD) with no time; reformat to MM/DD/YYYY
// directly from the parts so no timezone math can shift it a day.
export function dcyfDob(ymd: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((ymd || '').toString());
  return m ? `${m[2]}/${m[3]}/${m[1]}` : '';
}

// Build one or more DCYF CSV files (chunked at DCYF_MAX_ROWS data rows). Each
// file carries the header and a UTF-8 BOM (Excel reads accented names). Returns
// at least one file (header-only when there are no rows).
export function buildDcyfCsv(rows: DcyfExportRow[]): { csv: string; rowCount: number }[] {
  const body = rows.map((r) =>
    [
      csvCell(r.firstName || ''),
      csvCell(r.lastName || ''),
      csvCell(dcyfDob(r.dob)),
      csvCell(dcyfDateTime(r.checkIn)),
      csvCell(dcyfDateTime(r.checkOut)),
      csvCell((r.signInPerson || '').trim()),
      csvCell((r.signOutPerson || '').trim()),
    ].join(',')
  );

  const files: { csv: string; rowCount: number }[] = [];
  if (body.length === 0) {
    files.push({ csv: '﻿' + DCYF_HEADER, rowCount: 0 });
    return files;
  }
  for (let i = 0; i < body.length; i += DCYF_MAX_ROWS) {
    const chunk = body.slice(i, i + DCYF_MAX_ROWS);
    files.push({ csv: '﻿' + [DCYF_HEADER, ...chunk].join('\r\n'), rowCount: chunk.length });
  }
  return files;
}
