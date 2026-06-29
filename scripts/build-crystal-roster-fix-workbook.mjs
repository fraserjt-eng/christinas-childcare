#!/usr/bin/env node
// Build the owner-facing "Crystal roster fix" workbook (.xlsx).
//
// Crystal's attendance is on paper and must be uploaded to the DCYF Provider Hub
// in the state's exact format for CCAP/DHS payment. The state rejects any row
// missing a valid birthdate or for a child it doesn't have enrolled. This builds
// a fillable spreadsheet the owners complete so the weekly Crystal file goes
// through clean: Section A = enrolled kids missing a DOB; Section B = kids who
// attended but aren't in the state enrollment yet (need first/last/DOB/start).
//
// Standalone utility (not imported by the app). Uses the project's exceljs.
// Usage: node scripts/build-crystal-roster-fix-workbook.mjs [out.xlsx]

import ExcelJS from 'exceljs';

const OUT =
  process.argv[2] ||
  '/Users/jfraser/Desktop/Crystal-roster-fix-OWNER.xlsx';

// ---- Section A: enrolled at Crystal but the record has no birthdate. ----
// "attended" = appeared on this week's (6/22-6/25) sign-in sheets, so the DOB is
// needed for THIS upload; the rest are roster-completion for future weeks.
const SECTION_A = [
  { first: 'Adedeji', last: 'Adeleye', attended: true },
  { first: 'Antonio', last: 'Thompson', attended: true },
  { first: 'Armani', last: 'Chandler', attended: true },
  { first: 'Audrey', last: 'Bolling', attended: true },
  { first: "De'Ariyah", last: 'Harris', attended: true },
  { first: 'Evelina', last: 'Saydah', attended: true },
  { first: 'Hailey', last: 'Moore', attended: true },
  { first: 'Kawhi', last: 'Denzer', attended: true },
  { first: 'Love', last: 'Williams', attended: true },
  { first: 'Mahir', last: 'Brown', attended: true },
  { first: 'MiYanni', last: 'Franklin', attended: true },
  { first: 'Nevaeh', last: 'Johnson', attended: true },
  { first: 'Royalty', last: 'Bentley', attended: true },
  { first: 'Van', last: 'Johnson', attended: true },
  { first: 'Maiaer-Georganna', last: 'Colquitte', attended: false },
  { first: "Sa'Niylah", last: 'Edwards', attended: false },
];

// ---- Section B: attended this week but NOT in the Crystal state enrollment. ----
const SECTION_B = [
  ...[
    'Barron, DeShawn', 'Chandler, Dekari', 'Craig, Armaj', 'Davis, Aiyden',
    "Davis, Ca'Naiyah", 'Davis, Carter', "Davis, Jay'ceon", 'Fraser, Joshua-James',
    'Fraser, Voynee', 'Jackson, Jada', 'Gotobah, Derrick', 'Harper, Brooklyn',
    'Harris, Kaion', 'King, Royal', 'Martin, Desmyn', 'McCoy, Curtis',
    'McCoy, Davontae', 'Moore, Lavine', 'Owatechjor, Obari', 'Smith, Divine',
    'Smith, Robert', 'Smith, Success', 'Townsel, Levarion', 'Townsel, Makaylah',
    'Ware, Kaene-Latrell', 'Ware, Promyse', "Williams, Ma'Jari", 'Zeogar, Mardayee',
  ].map((s) => ({ last: s.split(', ')[0], first: s.split(', ')[1], room: 'School-Age' })),
  ...[
    'Smith, Rylan', "Cooksey, Ei'Lonni", 'Harper, Tyrone', 'Ware, Maiaer-Devonne',
  ].map((s) => ({ last: s.split(', ')[0], first: s.split(', ')[1], room: 'Kinder Prep' })),
];

// ---- styling helpers ----
const PURPLE = 'FF5B2A86';
const PURPLE_SOFT = 'FFEDE6F5';
const FILL_CELL = 'FFFFF8E1'; // pale yellow = "type here"
const GREY = 'FF6B6B6B';

function titleCell(ws, ref, text, size = 18) {
  const c = ws.getCell(ref);
  c.value = text;
  c.font = { bold: true, size, color: { argb: PURPLE } };
  return c;
}
function bodyCell(ws, ref, text, opts = {}) {
  const c = ws.getCell(ref);
  c.value = text;
  c.alignment = { wrapText: true, vertical: 'top', ...(opts.alignment || {}) };
  c.font = { size: opts.size || 11, color: { argb: opts.color || 'FF1A1A1A' }, bold: !!opts.bold };
  return c;
}
function fillable(cell) {
  cell.numFmt = '@'; // text, so "06/28/2021" is never auto-mangled into a date
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL_CELL } };
  cell.border = thin();
  cell.alignment = { vertical: 'middle' };
}
function thin() {
  const s = { style: 'thin', color: { argb: 'FFD9D9D9' } };
  return { top: s, left: s, bottom: s, right: s };
}
function headerRow(ws, rowIdx, labels, widths) {
  const row = ws.getRow(rowIdx);
  labels.forEach((label, i) => {
    const c = row.getCell(i + 1);
    c.value = label;
    c.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PURPLE } };
    c.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    c.border = thin();
  });
  row.height = 26;
  if (widths) widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
}

const wb = new ExcelJS.Workbook();
wb.creator = "Christina's Child Care";
wb.created = new Date(2026, 5, 28);

// ============================ TAB 1 — READ ME ============================
const intro = wb.addWorksheet('Read Me First', {
  properties: { tabColor: { argb: PURPLE } },
  pageSetup: { fitToPage: true, margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } },
});
intro.getColumn(1).width = 3;
intro.getColumn(2).width = 104;

titleCell(intro, 'B2', 'Crystal Attendance — Roster Fix', 20);
bodyCell(intro, 'B3', 'What to fill in so the state accepts Crystal’s weekly attendance. Week of June 22–26, 2026.', { color: GREY, size: 11 });

const blocks = [
  ['Why this sheet exists',
    'Crystal records attendance on paper. To get paid through the state (CCAP / DHS), every week’s hours have to be ' +
    'uploaded to the DCYF Provider Hub in the state’s exact format. Brooklyn Park does this automatically from the app; ' +
    'Crystal’s paper sheets are turned into that same upload file by hand. The state checks every single row and rejects ' +
    'the file if a child is missing a valid birthdate or is not recognized as enrolled. This sheet collects exactly those ' +
    'two missing pieces so the Crystal file goes through clean the first time, with no back-and-forth and no payment delay.'],
  ['Tab “A · Add Birthdate” — why it exists',
    'These children are already enrolled at Crystal. Their record simply has no birthdate on it. The state requires a ' +
    'birthdate (MM/DD/YYYY) for every child on the attendance upload, and it will reject any row without one. Fourteen of ' +
    'these children attended this past week, so their birthdate is needed for THIS week’s submission. Two more are enrolled ' +
    'but did not attend this week; filling them in now means the roster is complete for every future week too. You only need ' +
    'to add the birthdate — everything else about these children is already on file. The “Needed this week?” column tells ' +
    'you which are urgent versus which are clean-up.'],
  ['Tab “B · Enroll Child” — why it exists',
    'These children attended this past week but are not in Crystal’s state enrollment list yet. Twenty-eight of them are the ' +
    'entire School-Age room; the other four are from Kinder Prep. The state cannot accept an attendance row for a child it ' +
    'has no record of, so none of these children can be billed until they are added. To add a child, the state needs four ' +
    'things: legal first name, legal last name, birthdate, and the date the child started care. The names here were read off ' +
    'the handwritten sign-in sheets, so please confirm each spelling, then add the birthdate and start date.'],
  ['How to fill it in',
    'Type directly into the yellow cells. Use MM/DD/YYYY for every date (for example, 06/28/2021). If a name is spelled ' +
    'wrong, just correct it in the cell. You do not need to touch anything that is not yellow.'],
  ['What happens when you’re done',
    'Send the file back. With the birthdates added and the new children enrolled, the Crystal weekly attendance file is ' +
    'rebuilt clean — every child valid — and uploaded to the state right alongside Brooklyn Park. After this one pass, ' +
    'future weeks stay smooth because the roster is whole.'],
];

let r = 5;
for (const [head, text] of blocks) {
  const h = intro.getCell(`B${r}`);
  h.value = head;
  h.font = { bold: true, size: 13, color: { argb: PURPLE } };
  h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PURPLE_SOFT } };
  h.alignment = { vertical: 'middle' };
  intro.getRow(r).height = 22;
  r += 1;
  const b = bodyCell(intro, `B${r}`, text, { size: 11 });
  // rough auto-height: ~115 chars per line at this width
  intro.getRow(r).height = Math.max(48, Math.ceil(text.length / 105) * 16 + 8);
  r += 2;
}

// ============================ TAB 2 — SECTION A ============================
const a = wb.addWorksheet('A · Add Birthdate', { properties: { tabColor: { argb: 'FF2E7D32' } } });
titleCell(a, 'A1', 'A · Add a Birthdate (already enrolled)', 15);
bodyCell(a, 'A2',
  'These children are enrolled; their record is just missing a birthdate, which the state requires on every attendance row. ' +
  'Type the birthdate in the yellow column. “Needed this week?” = Yes means it’s required for this week’s upload.',
  { color: GREY, size: 10 });
a.mergeCells('A1:E1');
a.mergeCells('A2:E2');
a.getRow(2).height = 40;
a.getCell('A2').alignment = { wrapText: true, vertical: 'top' };

headerRow(a, 4, ['#', 'First Name', 'Last Name', 'Date of Birth (MM/DD/YYYY)', 'Needed this week?'],
  [5, 22, 22, 28, 18]);

SECTION_A.forEach((k, i) => {
  const row = a.getRow(5 + i);
  row.getCell(1).value = i + 1;
  row.getCell(2).value = k.first;
  row.getCell(3).value = k.last;
  fillable(row.getCell(4)); // DOB, owner types
  row.getCell(5).value = k.attended ? 'Yes — for this week' : 'No — roster only';
  [1, 2, 3, 5].forEach((c) => {
    row.getCell(c).border = thin();
    row.getCell(c).alignment = { vertical: 'middle' };
  });
  row.getCell(5).font = { color: { argb: k.attended ? 'FF2E7D32' : GREY }, bold: k.attended };
  row.height = 22;
});

// ============================ TAB 3 — SECTION B ============================
const b = wb.addWorksheet('B · Enroll Child', { properties: { tabColor: { argb: 'FFC62828' } } });
titleCell(b, 'A1', 'B · Enroll a Child (not yet on the state roster)', 15);
bodyCell(b, 'A2',
  'These children attended this week but are not in Crystal’s state enrollment, so they cannot be billed until added. ' +
  'Confirm the spelling, then type the birthdate and start date in the yellow columns. The state needs all four fields.',
  { color: GREY, size: 10 });
b.mergeCells('A1:F1');
b.mergeCells('A2:F2');
b.getRow(2).height = 40;
b.getCell('A2').alignment = { wrapText: true, vertical: 'top' };

headerRow(b, 4,
  ['#', 'First Name', 'Last Name', 'Date of Birth (MM/DD/YYYY)', 'Start Date (MM/DD/YYYY)', 'Room'],
  [5, 22, 22, 28, 26, 14]);

SECTION_B.forEach((k, i) => {
  const row = b.getRow(5 + i);
  row.getCell(1).value = i + 1;
  row.getCell(2).value = k.first;
  row.getCell(3).value = k.last;
  fillable(row.getCell(4)); // DOB
  fillable(row.getCell(5)); // start date
  row.getCell(6).value = k.room;
  [1, 2, 3, 6].forEach((c) => {
    row.getCell(c).border = thin();
    row.getCell(c).alignment = { vertical: 'middle' };
  });
  row.getCell(6).font = { color: { argb: k.room === 'School-Age' ? 'FFC62828' : GREY } };
  row.height = 22;
});

await wb.xlsx.writeFile(OUT);
console.log(`Wrote ${OUT}`);
console.log(`  Section A (add birthdate): ${SECTION_A.length}  (${SECTION_A.filter((k) => k.attended).length} needed this week)`);
console.log(`  Section B (enroll):        ${SECTION_B.length}  (${SECTION_B.filter((k) => k.room === 'School-Age').length} School-Age, ${SECTION_B.filter((k) => k.room !== 'School-Age').length} Kinder Prep)`);
