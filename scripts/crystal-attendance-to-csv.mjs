#!/usr/bin/env node
// Crystal paper attendance -> DCYF "Import Attendance" CSV.
//
// Crystal signs kids in/out on paper (handwritten daily sheets, one page per
// classroom). Brooklyn Park's attendance is in the app and exports to the DCYF
// template automatically; Crystal's is not, so this turns a transcription of the
// paper sheets into the SAME DCYF CSV, byte-for-byte, for the state upload.
//
// The hard part (reading handwriting) is done by hand into a transcription JSON;
// this script does the deterministic part: match each name to the Crystal roster
// for the canonical spelling + DOB, format the times, and emit the CSV + a
// verification report (unmatched names, missing DOB, time flags) to check against
// the paper BEFORE uploading.
//
// Usage:
//   node scripts/crystal-attendance-to-csv.mjs <transcription.json> <roster.csv> <out-basename>
//
// transcription.json shape:
//   [ { "date": "06/22/2026", "classroom": "Infant",
//       "rows": [ { "name": "Flores, Leilani", "in": "7:30 AM", "out": "2:40 PM",
//                   "dropoff": "Liz", "pickup": "Brian Ortiz" } ] } ]
//   - "in" of "OFF"/""/"absent" => the child was absent that day; row skipped.
//   - times are wall-clock with AM/PM as read off the sheet (no timezone math).

import { readFileSync, writeFileSync } from 'node:fs';

// ---- DCYF format (must match src/lib/dcyf-export.ts byte-for-byte) ----
const DCYF_HEADER =
  'Child First Name *REQUIRED*,Child Last Name *REQUIRED*,Child Date of Birth (MM/DD/YYYY) *REQUIRED*,Time Checked In (MM/DD/YYYY HH:MM AM/PM) *REQUIRED*,Time Checked Out (MM/DD/YYYY HH:MM AM/PM),Sign In Person (Full Name),Sign Out Person (Full Name)';
const DCYF_MAX_ROWS = 250;

function csvCell(value) {
  let s = (value ?? '').toString();
  // Block spreadsheet formula injection (CWE-1236); same guard as dcyf-export.
  if (/^[=+\-@\t\r]/.test(s)) s = '\t' + s;
  return /[",\n\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Force a DOB to strict MM/DD/YYYY (the state rejects anything else). Accepts
// ISO or US shapes; '' if unparseable. Mirrors dcyfDob in src/lib/dcyf-export.ts.
function normDob(value) {
  const s = (value || '').toString().trim();
  if (!s) return '';
  let mo, da, yr;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) { yr = m[1]; mo = m[2]; da = m[3]; }
  else {
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(s);
    if (!m) return '';
    mo = m[1]; da = m[2];
    yr = m[3].length === 4 ? m[3] : String(Number(m[3]) <= 26 ? 2000 + Number(m[3]) : 1900 + Number(m[3]));
  }
  const MM = mo.padStart(2, '0'), DD = da.padStart(2, '0');
  if (+MM < 1 || +MM > 12 || +DD < 1 || +DD > 31) return '';
  return `${MM}/${DD}/${yr}`;
}

// Normalize a name for matching: lowercase, drop punctuation/whitespace.
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z]/g, '');
}

// "Flores, Leilani" or "Leilani Flores" -> { first, last } best guess.
function splitSheetName(name) {
  const n = (name || '').trim();
  if (n.includes(',')) {
    const [last, first] = n.split(',');
    return { first: (first || '').trim(), last: (last || '').trim() };
  }
  const parts = n.split(/\s+/);
  return { first: parts[0] || '', last: parts.slice(1).join(' ') };
}

// Parse a wall-clock time like "9:14 AM" -> "HH:MM AM/PM" (normalized), or null.
function parseTime(t) {
  if (!t) return { value: null, flag: null };
  const s = t.toString().trim();
  if (/^(off|absent|n\/?a|-)$/i.test(s)) return { value: null, flag: 'absent' };
  const m = /^(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?$/i.exec(s);
  if (!m) return { value: null, flag: `unparsed time "${s}"` };
  let hh = parseInt(m[1], 10);
  const mm = m[2];
  let ap = (m[3] || '').replace(/\./g, '').toUpperCase();
  let flag = null;
  if (!ap) {
    flag = `missing AM/PM on "${s}"`;
    ap = hh < 7 || hh === 12 ? 'PM' : 'AM'; // weak default; flagged for review
  }
  if (hh === 0) hh = 12;
  if (hh > 12) { hh -= 12; ap = 'PM'; }
  return { value: `${hh}:${mm} ${ap}`, flag };
}

function loadRoster(csvPath) {
  const text = readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const byKey = new Map(); // normalized "firstlast" + "lastfirst" -> {first,last,dob}
  for (let i = 1; i < lines.length; i++) {
    // First three columns only; they have no embedded commas in this roster.
    const cols = lines[i].split(',');
    const first = (cols[0] || '').trim();
    const last = (cols[1] || '').trim();
    const dob = (cols[2] || '').trim();
    if (!first && !last) continue;
    const rec = { first, last, dob };
    byKey.set(norm(first) + '|' + norm(last), rec);
  }
  return byKey;
}

function matchRoster(roster, sheetName) {
  const { first, last } = splitSheetName(sheetName);
  // Try first|last, then last|first (sheets vary), then last-name-only unique.
  return (
    roster.get(norm(first) + '|' + norm(last)) ||
    roster.get(norm(last) + '|' + norm(first)) ||
    null
  );
}

function main() {
  const [, , jsonPath, rosterPath, outBase] = process.argv;
  if (!jsonPath || !rosterPath || !outBase) {
    console.error('Usage: crystal-attendance-to-csv.mjs <transcription.json> <roster.csv> <out-basename>');
    process.exit(1);
  }
  const days = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const roster = loadRoster(rosterPath);

  const rows = [];
  const issues = { unmatched: [], missingDob: [], timeFlags: [], absent: 0, byDay: {} };

  for (const day of days) {
    const date = day.date;
    issues.byDay[date] = issues.byDay[date] || 0;
    for (const r of day.rows || []) {
      const inT = parseTime(r.in);
      if (inT.flag === 'absent' || !inT.value) {
        if (inT.flag === 'absent') issues.absent++;
        else if (inT.flag) issues.timeFlags.push(`${date} ${r.name}: ${inT.flag}`);
        continue; // no arrival => not present that day
      }
      const outT = parseTime(r.out);
      if (outT.flag && outT.flag !== 'absent') issues.timeFlags.push(`${date} ${r.name}: ${outT.flag}`);

      const rec = matchRoster(roster, r.name);
      if (!rec) {
        issues.unmatched.push(`${date} [${day.classroom}] "${r.name}"`);
        continue; // cannot emit a DCYF row without a roster match (DOB required)
      }
      const dob = normDob(rec.dob);
      if (!dob) issues.missingDob.push(`${rec.first} ${rec.last}`);

      rows.push([
        csvCell(rec.first),
        csvCell(rec.last),
        csvCell(dob),
        csvCell(`${date} ${inT.value}`),
        csvCell(outT.value ? `${date} ${outT.value}` : ''),
        csvCell(r.dropoff || ''),
        csvCell(r.pickup || ''),
      ].join(','));
      issues.byDay[date]++;
    }
  }

  // Write CSV file(s), chunked at 250 data rows like the DCYF template requires.
  const files = [];
  if (rows.length === 0) {
    files.push(`${outBase}.csv`);
    writeFileSync(`${outBase}.csv`, '﻿' + DCYF_HEADER);
  } else {
    for (let i = 0; i < rows.length; i += DCYF_MAX_ROWS) {
      const chunk = rows.slice(i, i + DCYF_MAX_ROWS);
      const name = i === 0 ? `${outBase}.csv` : `${outBase}_part${Math.floor(i / DCYF_MAX_ROWS) + 1}.csv`;
      writeFileSync(name, '﻿' + [DCYF_HEADER, ...chunk].join('\r\n'));
      files.push(name);
    }
  }

  // Verification report.
  const uniqMissingDob = Array.from(new Set(issues.missingDob));
  const report = [
    `Crystal DCYF attendance — verification report`,
    `Generated from: ${jsonPath}`,
    ``,
    `Rows produced: ${rows.length}  (files: ${files.map((f) => f.split('/').pop()).join(', ')})`,
    `Absent ("OFF") skipped: ${issues.absent}`,
    ``,
    `Rows per day:`,
    ...Object.entries(issues.byDay).map(([d, n]) => `  ${d}: ${n}`),
    ``,
    `UNMATCHED names (not in the roster — fix the spelling or add to enrollment): ${issues.unmatched.length}`,
    ...issues.unmatched.map((u) => `  - ${u}`),
    ``,
    `MISSING DOB (state REQUIRES it — add to the roster before upload): ${uniqMissingDob.length}`,
    ...uniqMissingDob.map((u) => `  - ${u}`),
    ``,
    `TIME flags (verify AM/PM or unreadable against the paper): ${issues.timeFlags.length}`,
    ...issues.timeFlags.map((t) => `  - ${t}`),
    ``,
  ].join('\n');
  writeFileSync(`${outBase}-REPORT.txt`, report);
  console.log(report);
}

main();
