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
  let s = (value ?? '').toString();
  // Block spreadsheet formula injection (CWE-1236): a cell starting with
  // = + - @ (or a tab/CR) executes as a formula in Excel/Sheets. Child names
  // are user-entered, so prefix a tab to force the cell to text.
  if (/^[=+\-@\t\r]/.test(s)) s = '\t' + s;
  return /[",\n\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// "MM/DD/YYYY HH:MM AM/PM" in center time, or '' when there is no instant.
export function dcyfDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${dcyfDateFmt.format(d)} ${dcyfTimeFmt.format(d)}`.trim();
}

// The DCYF Provider Hub rejects any DOB that is not EXACTLY MM/DD/YYYY (it
// rejected "6/28/21"). The roster stores a bare date (YYYY-MM-DD), but a bulk
// import or hand edit can leave a loose value, so accept the common shapes
// (ISO, M/D/YY, M/D/YYYY) and always emit zero-padded MM/DD/YYYY with a 4-digit
// year. No timezone math (reformat the parts) so the day can never shift. Returns
// '' on an empty/unparseable value (better an empty REQUIRED field the importer
// flags than an invalid date that fails the whole upload).
const DOB_YEAR_PIVOT = 26; // 2-digit year <= 26 -> 20xx, else 19xx (kids are 2000s)
export function dcyfDob(value: string | null | undefined): string {
  const s = (value || '').toString().trim();
  if (!s) return '';
  let mo: string, da: string, yr: string;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); // ISO YYYY-MM-DD
  if (m) {
    yr = m[1]; mo = m[2]; da = m[3];
  } else {
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(s); // US M/D/YY or M/D/YYYY
    if (!m) return '';
    mo = m[1]; da = m[2];
    yr = m[3].length === 4 ? m[3] : String(Number(m[3]) <= DOB_YEAR_PIVOT ? 2000 + Number(m[3]) : 1900 + Number(m[3]));
  }
  const MM = mo.padStart(2, '0');
  const DD = da.padStart(2, '0');
  if (+MM < 1 || +MM > 12 || +DD < 1 || +DD > 31) return '';
  return `${MM}/${DD}/${yr}`;
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
