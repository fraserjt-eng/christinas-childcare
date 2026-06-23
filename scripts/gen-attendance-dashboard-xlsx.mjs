// Branded attendance dashboard workbook (both centers) for sharing as a file —
// the "spreadsheet snapshot" alongside the in-app Attendance Hub. Tabs: Summary,
// By Day, By Room, By Child. In-cell data bars stand in for charts (exceljs
// renders them reliably; native charts do not). Also writes one DCYF Import
// Attendance CSV per center for the same range, so this one command produces both
// the human dashboard and the state-upload files.
//
// Usage:
//   node scripts/gen-attendance-dashboard-xlsx.mjs --prod [--from YYYY-MM-DD] [--to YYYY-MM-DD]
// Defaults: the last 30 days ending today, all centers.

import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const PROD = args.includes('--prod');
const argVal = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };

const env = {};
for (const l of readFileSync(PROD ? '.env.prod.local' : '.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL;
const key = PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

const today = new Date().toISOString().slice(0, 10);
const ago = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const FROM = argVal('--from') || ago;
const TO = argVal('--to') || today;

const RED = 'FFC62828', BLUE = 'FF2196F3', YELLOW = 'FFFFD54F', CREAM = 'FFFAF6F0', GREY = 'FF6B7280';
const CENTER_TZ = 'America/Chicago';

// --- canonical room bucket (mirrors src/app/api/admin/attendance/summary) ---
const ROOM_ORDER = ['Infant', 'Toddler', 'Preschool', 'Kindergarten Prep', 'School Age'];
function canonicalRoom(raw) {
  const s = (raw || '').toLowerCase().trim();
  if (!s) return 'Unassigned';
  if (s.includes('infant')) return 'Infant';
  if (s.includes('toddler')) return 'Toddler';
  if (s.includes('school age') || s.includes('school aged') || s.includes('trailblazer') || s.includes('summer')) return 'School Age';
  if (s.includes('kinder')) return 'Kindergarten Prep';
  if (s.includes('pre')) return 'Preschool';
  return (raw || '').trim();
}
const roomRank = (n) => { const i = ROOM_ORDER.indexOf(n); return i >= 0 ? i : (n === 'Unassigned' ? 999 : 500); };

// --- DCYF datetime helpers (mirror src/lib/dcyf-export) ---
const dFmt = new Intl.DateTimeFormat('en-US', { timeZone: CENTER_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const tFmt = new Intl.DateTimeFormat('en-US', { timeZone: CENTER_TZ, hour: '2-digit', minute: '2-digit', hour12: true });
const dcyfDateTime = (iso) => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? '' : `${dFmt.format(d)} ${tFmt.format(d)}`.trim(); };
const dcyfDob = (ymd) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || ''); return m ? `${m[2]}/${m[3]}/${m[1]}` : ''; };
const DCYF_HEADER = 'Child First Name *REQUIRED*,Child Last Name *REQUIRED*,Child Date of Birth (MM/DD/YYYY) *REQUIRED*,Time Checked In (MM/DD/YYYY HH:MM AM/PM) *REQUIRED*,Time Checked Out (MM/DD/YYYY HH:MM AM/PM),Sign In Person (Full Name),Sign Out Person (Full Name)';
const csvCell = (v) => /[",\n\r]/.test(v ?? '') ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? '');

// --- fetch ---
const { data: centers } = await sb.from('centers').select('id, name').limit(50);
const { data: fams } = await sb.from('families').select('id, center_id').limit(10000);
const { data: kids } = await sb.from('family_children').select('id, name, classroom, date_of_birth, family_id').limit(10000);
const att = [];
for (let off = 0; ; off += 1000) {
  const { data, error } = await sb
    .from('attendance')
    .select('child_id, child_name, center_id, date, check_in, check_out, signed_in_by_name, signed_out_by_name')
    .gte('date', FROM).lte('date', TO).order('date', { ascending: true }).range(off, off + 999);
  if (error) { console.error(error.message); process.exit(1); }
  att.push(...(data || []));
  if (!data || data.length < 1000) break;
}

const centerName = (id) => (centers || []).find((c) => c.id === id)?.name || 'Unassigned';
const centerOfFam = new Map((fams || []).map((f) => [f.id, f.center_id]));
const childMeta = new Map(); // id -> {name, room, dob, center}
for (const k of kids || []) childMeta.set(k.id, { name: k.name || '', room: canonicalRoom(k.classroom), dob: k.date_of_birth || null, center: centerOfFam.get(k.family_id) || null });

const hoursOf = (r) => { if (!r.check_in || !r.check_out) return 0; const h = (new Date(r.check_out) - new Date(r.check_in)) / 3600000; return h > 0 && h < 24 ? h : 0; };
const r1 = (n) => Math.round(n * 10) / 10;

// --- aggregate (per center) ---
const C = new Map(); // center_id -> aggregates
function bucket(cid) {
  if (!C.has(cid)) C.set(cid, { byDay: new Map(), byRoom: new Map(), byChild: new Map(), present: new Set(), childDays: 0, hours: 0, daysOpen: new Set() });
  return C.get(cid);
}
for (const r of att) {
  const cid = r.center_id || 'unknown';
  const a = bucket(cid);
  const key = r.child_id || `name:${r.child_name || 'unknown'}`;
  const meta = childMeta.get(r.child_id) || {};
  const name = meta.name || r.child_name || 'Child';
  const room = meta.room || 'Unassigned';
  const h = hoursOf(r);
  a.present.add(key); a.childDays += 1; a.hours += h; if (r.check_in) a.daysOpen.add(r.date);
  // by day
  if (!a.byDay.has(r.date)) a.byDay.set(r.date, { present: new Set(), childDays: 0, hours: 0 });
  const d = a.byDay.get(r.date); d.present.add(key); d.childDays += 1; d.hours += h;
  // by room
  if (!a.byRoom.has(room)) a.byRoom.set(room, { present: new Set(), childDays: 0, hours: 0 });
  const rm = a.byRoom.get(room); rm.present.add(key); rm.childDays += 1; rm.hours += h;
  // by child
  if (!a.byChild.has(key)) a.byChild.set(key, { name, room, days: new Set(), hours: 0, last: '' });
  const ch = a.byChild.get(key); ch.days.add(r.date); ch.hours += h; if (r.date > ch.last) ch.last = r.date;
}

// --- workbook ---
const wb = new ExcelJS.Workbook();
wb.creator = "Christina's Child Care Center";
let logoId = null;
const logoPath = 'public/images/icon-192.png';
if (existsSync(logoPath)) logoId = wb.addImage({ filename: logoPath, extension: 'png' });

function band(ws, span, title) {
  ws.mergeCells(`A1:${span}3`);
  const c = ws.getCell('A1');
  c.value = `  Christina's Child Care Center  ·  ${title}  ·  ${FROM} to ${TO}`;
  c.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  c.alignment = { vertical: 'middle', horizontal: 'left', indent: 3 };
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED } };
  ws.getRow(1).height = 20; ws.getRow(2).height = 20; ws.getRow(3).height = 20;
}
function headerRow(ws, labels) {
  const hdr = ws.getRow(4);
  hdr.values = labels;
  hdr.eachCell((c) => {
    c.font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW } };
    c.alignment = { vertical: 'middle' };
    c.border = { bottom: { style: 'thin', color: { argb: RED } } };
  });
  hdr.height = 18;
}
function dataBar(ws, colLetter, firstRow, lastRow, argb) {
  if (lastRow < firstRow) return;
  ws.addConditionalFormatting({
    ref: `${colLetter}${firstRow}:${colLetter}${lastRow}`,
    rules: [{ type: 'dataBar', cfvo: [{ type: 'min' }, { type: 'max' }], color: { argb }, gradient: false }],
  });
}
const orderedCenters = Array.from(C.keys()).sort((a, b) => centerName(a).localeCompare(centerName(b)));

// ---- Summary tab ----
{
  const ws = wb.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 4 }] });
  ws.columns = [{ width: 26 }, { width: 16 }, { width: 14 }, { width: 12 }, { width: 12 }];
  band(ws, 'E', 'Attendance Summary');
  if (logoId !== null) ws.addImage(logoId, { tl: { col: 4.2, row: 0.2 }, ext: { width: 52, height: 52 } });
  headerRow(ws, ['Center', 'Children', 'Child-days', 'Hours', 'Days open']);
  let r = 5;
  for (const cid of orderedCenters) {
    const a = C.get(cid);
    ws.getRow(r).values = [centerName(cid), a.present.size, a.childDays, r1(a.hours), a.daysOpen.size];
    r++;
  }
  // overall
  const tot = ws.getRow(r);
  tot.values = ['All centers', sum(orderedCenters, (c) => C.get(c).present.size), sum(orderedCenters, (c) => C.get(c).childDays), r1(sum(orderedCenters, (c) => C.get(c).hours)), sum(orderedCenters, (c) => C.get(c).daysOpen.size)];
  tot.eachCell((c) => { c.font = { bold: true }; c.border = { top: { style: 'thin', color: { argb: GREY } } }; });
  dataBar(ws, 'B', 5, r - 1, BLUE);
}
function sum(arr, f) { return arr.reduce((s, x) => s + f(x), 0); }

// ---- By Day ----
{
  const ws = wb.addWorksheet('By Day', { views: [{ state: 'frozen', ySplit: 4 }] });
  ws.columns = [{ width: 22 }, { width: 14 }, { width: 18 }, { width: 14 }, { width: 12 }];
  band(ws, 'E', 'Attendance by Day');
  headerRow(ws, ['Center', 'Date', 'Children present', 'Child-days', 'Hours']);
  let r = 5;
  for (const cid of orderedCenters) {
    const a = C.get(cid);
    for (const date of Array.from(a.byDay.keys()).sort()) {
      const d = a.byDay.get(date);
      ws.getRow(r).values = [centerName(cid), date, d.present.size, d.childDays, r1(d.hours)];
      r++;
    }
  }
  dataBar(ws, 'C', 5, r - 1, BLUE);
}

// ---- By Room ----
{
  const ws = wb.addWorksheet('By Room', { views: [{ state: 'frozen', ySplit: 4 }] });
  ws.columns = [{ width: 22 }, { width: 22 }, { width: 18 }, { width: 14 }, { width: 12 }];
  band(ws, 'E', 'Attendance by Room');
  headerRow(ws, ['Center', 'Room', 'Children present', 'Child-days', 'Hours']);
  let r = 5;
  for (const cid of orderedCenters) {
    const a = C.get(cid);
    const rooms = Array.from(a.byRoom.keys()).sort((x, y) => roomRank(x) - roomRank(y) || x.localeCompare(y));
    for (const room of rooms) {
      const rm = a.byRoom.get(room);
      ws.getRow(r).values = [centerName(cid), room, rm.present.size, rm.childDays, r1(rm.hours)];
      r++;
    }
  }
  dataBar(ws, 'C', 5, r - 1, RED);
}

// ---- By Child ----
{
  const ws = wb.addWorksheet('By Child', { views: [{ state: 'frozen', ySplit: 4 }] });
  ws.columns = [{ width: 22 }, { width: 26 }, { width: 18 }, { width: 14 }, { width: 12 }, { width: 14 }];
  band(ws, 'F', 'Attendance by Child');
  headerRow(ws, ['Center', 'Child', 'Room', 'Days present', 'Hours', 'Last seen']);
  let r = 5;
  for (const cid of orderedCenters) {
    const a = C.get(cid);
    const children = Array.from(a.byChild.values()).sort((x, y) => x.name.localeCompare(y.name));
    for (const c of children) {
      ws.getRow(r).values = [centerName(cid), c.name, c.room, c.days.size, r1(c.hours), c.last];
      r++;
    }
  }
  dataBar(ws, 'D', 5, r - 1, BLUE);
}

const desktop = join(homedir(), 'Desktop');
const xlsxPath = join(desktop, `Christinas-Attendance-Dashboard-${FROM}-to-${TO}.xlsx`);
await wb.xlsx.writeFile(xlsxPath);

// ---- per-center DCYF CSVs for the same range ----
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const csvPaths = [];
for (const cid of orderedCenters) {
  const a = C.get(cid);
  // one row per attendance record (not per child) for the DCYF file
  const rows = att.filter((r) => (r.center_id || 'unknown') === cid).map((r) => {
    const meta = childMeta.get(r.child_id) || {};
    const full = (meta.name || r.child_name || '').trim();
    const parts = full.split(/\s+/);
    return [parts[0] || '', parts.slice(1).join(' '), dcyfDob(meta.dob), dcyfDateTime(r.check_in), dcyfDateTime(r.check_out), (r.signed_in_by_name || '').trim(), (r.signed_out_by_name || '').trim()];
  });
  const csv = '﻿' + [DCYF_HEADER, ...rows.map((row) => row.map(csvCell).join(','))].join('\r\n');
  const p = join(desktop, `DCYF-attendance-${slug(centerName(cid))}-${FROM}-to-${TO}.csv`);
  writeFileSync(p, csv);
  csvPaths.push(`${p}  (${rows.length} rows)`);
}

console.log('Wrote dashboard:', xlsxPath);
console.log('Wrote DCYF CSVs:');
for (const p of csvPaths) console.log('  ' + p);
console.log(`\nRange ${FROM} to ${TO} · centers: ${orderedCenters.map(centerName).join(', ')} · ${att.length} attendance rows`);
