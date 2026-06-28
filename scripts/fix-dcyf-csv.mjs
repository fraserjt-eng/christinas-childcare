#!/usr/bin/env node
// Normalize a DCYF "Import Attendance" CSV so the state accepts it.
// The Provider Hub rejects any DOB or time that is not in the exact format:
//   DOB:  MM/DD/YYYY            (e.g. 06/28/2021, not 6/28/21)
//   Time: MM/DD/YYYY HH:MM AM/PM (e.g. 06/22/2026 04:30 PM, not 6/22/26 16:30)
// This takes a CSV that has the right COLUMNS but loose date/time formatting and
// rewrites columns 3 (DOB), 4 (Checked In), 5 (Checked Out) into the strict
// format. Rows with an unfixable/empty DOB are reported (the state requires it).
//
// Usage: node scripts/fix-dcyf-csv.mjs <in.csv> <out.csv>

import { readFileSync, writeFileSync } from 'node:fs';

const HEADER =
  'Child First Name *REQUIRED*,Child Last Name *REQUIRED*,Child Date of Birth (MM/DD/YYYY) *REQUIRED*,Time Checked In (MM/DD/YYYY HH:MM AM/PM) *REQUIRED*,Time Checked Out (MM/DD/YYYY HH:MM AM/PM),Sign In Person (Full Name),Sign Out Person (Full Name)';
const PIVOT = 2026; // 2-digit year <= this -> 2000s, else 1900s (kids are 2000s)

function csvCell(v) {
  let s = (v ?? '').toString();
  if (/^[=+\-@\t\r]/.test(s)) s = '\t' + s;
  return /[",\n\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Minimal CSV line parser (handles quoted cells with commas).
function parseLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function fourDigitYear(y) {
  if (y.length === 4) return y;
  const n = parseInt(y, 10);
  return String(n <= PIVOT % 100 ? 2000 + n : 1900 + n);
}

// "6/28/21" | "2021-06-28" | "06/28/2021" -> "MM/DD/YYYY", or '' if unparseable.
function normDate(s) {
  const t = (s || '').toString().trim();
  if (!t) return '';
  let mo, da, yr;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (m) { yr = m[1]; mo = m[2]; da = m[3]; }
  else {
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(t);
    if (!m) return '';
    mo = m[1]; da = m[2]; yr = fourDigitYear(m[3]);
  }
  const MM = mo.padStart(2, '0'), DD = da.padStart(2, '0');
  if (+MM < 1 || +MM > 12 || +DD < 1 || +DD > 31) return '';
  return `${MM}/${DD}/${yr}`;
}

// "6/22/26 16:30" | "06/22/2026 04:30 PM" -> "MM/DD/YYYY HH:MM AM/PM", or ''.
function normDateTime(s) {
  const t = (s || '').toString().trim();
  if (!t) return '';
  const sp = t.split(/\s+/);
  const datePart = normDate(sp[0]);
  if (!datePart) return '';
  let time = sp[1] || '';
  let ap = (sp[2] || '').toUpperCase().replace(/\./g, '');
  const tm = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!tm) return datePart; // date only
  let hh = parseInt(tm[1], 10);
  const mm = tm[2];
  if (!ap) { // 24-hour -> 12-hour
    ap = hh >= 12 ? 'PM' : 'AM';
    if (hh === 0) hh = 12; else if (hh > 12) hh -= 12;
  }
  return `${datePart} ${String(hh).padStart(2, '0')}:${mm} ${ap}`;
}

function main() {
  const [, , inPath, outPath] = process.argv;
  if (!inPath || !outPath) { console.error('Usage: fix-dcyf-csv.mjs <in.csv> <out.csv>'); process.exit(1); }
  const raw = readFileSync(inPath, 'utf8').replace(/^﻿/, '');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length);
  const issues = { fixedDob: 0, fixedTime: 0, badDob: [] };
  const outRows = [];
  for (let i = 1; i < lines.length; i++) {
    const c = parseLine(lines[i]);
    while (c.length < 7) c.push('');
    const first = c[0], last = c[1];
    const dob = normDate(c[2]);
    if (dob !== c[2]) issues.fixedDob++;
    if (!dob) issues.badDob.push(`${first} ${last} -> "${c[2]}"`);
    const cin = normDateTime(c[3]);
    const cout = normDateTime(c[4]);
    if (cin !== c[3] || cout !== c[4]) issues.fixedTime++;
    outRows.push([first, last, dob, cin, cout, c[5], c[6]].map(csvCell).join(','));
  }
  writeFileSync(outPath, '﻿' + [HEADER, ...outRows].join('\r\n'));
  console.log(`Fixed ${outRows.length} rows -> ${outPath}`);
  console.log(`  DOB reformatted: ${issues.fixedDob}   Times reformatted: ${issues.fixedTime}`);
  if (issues.badDob.length) {
    console.log(`  EMPTY/UNFIXABLE DOB (state requires it — add the birthdate): ${issues.badDob.length}`);
    for (const b of issues.badDob.slice(0, 40)) console.log(`    - ${b}`);
  }
}

main();
