// Multi-tab workbook: a tab per ROOM per SITE (children + family info), plus a
// STAFF tab (PINs + logins). Branded headers. Drag into Drive -> multi-tab
// Google Sheet. Usage: node scripts/gen-rooms-staff-xlsx.mjs [--prod]
import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PROD = process.argv.includes('--prod');
const env = {};
for (const l of readFileSync(PROD ? '.env.prod.local' : '.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL, PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const RED = 'FFC62828', YELLOW = 'FFFFD54F', CREAM = 'FFFAF6F0';

const [{ data: centers }, { data: fams }, { data: kids }, { data: pars }, { data: emps }] = await Promise.all([
  sb.from('centers').select('id, name').limit(50),
  sb.from('families').select('id, pin, email, center_id').limit(10000),
  sb.from('family_children').select('name, date_of_birth, classroom, family_id, center_id').limit(10000),
  sb.from('family_parents').select('family_id, name, phone, email, is_primary').limit(10000),
  sb.from('employees').select('first_name, last_name, role, pin, email, employment_status, center_id').limit(500),
]);
const cn = (id) => (centers || []).find((c) => c.id === id)?.name || 'Unassigned';
const cShort = (id) => { const n = cn(id); return /crystal/i.test(n) ? 'Crystal' : /brooklyn/i.test(n) ? 'BP' : n.slice(0, 8); };
const famById = {}; for (const f of fams || []) famById[f.id] = f;
const parsBy = {}; for (const p of pars || []) (parsBy[p.family_id] ||= []).push(p);
const prim = (fid) => { const ps = parsBy[fid] || []; return ps.find((p) => p.is_primary) || ps[0] || {}; };
const roomShort = (txt) => {
  if (!txt) return 'Unassigned';
  const m = txt.match(/\(([^)]+)\)/);
  const raw = (m ? m[1] : txt).slice(0, 18).trim();
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case so "toddler" and "Toddler" merge
};

const wb = new ExcelJS.Workbook();
wb.creator = "Christina's Child Care Center";
const usedTab = new Set();
function tabName(base) {
  const s = base.replace(/[\\/?*[\]:]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 31);
  let t = s, i = 2;
  while (usedTab.has(t.toLowerCase())) { t = (s.slice(0, 28) + ' ' + i).slice(0, 31); i++; } // exceljs is case-insensitive
  usedTab.add(t.toLowerCase());
  return t;
}

function headerBand(ws, title, cols) {
  ws.columns = cols.map((c) => ({ width: c.w }));
  const span = String.fromCharCode(64 + cols.length);
  ws.mergeCells(`A1:${span}2`);
  const b = ws.getCell('A1');
  b.value = `  Christina's Child Care Center  ·  ${title}`;
  b.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  b.alignment = { vertical: 'middle', indent: 2 };
  b.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED } };
  ws.getRow(1).height = 20; ws.getRow(2).height = 20;
  const hdr = ws.getRow(3);
  hdr.values = cols.map((c) => c.h);
  hdr.eachCell((c) => { c.font = { bold: true, size: 10 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW } }; c.border = { bottom: { style: 'thin', color: { argb: RED } } }; });
}

// --- room tabs: group children by (center, room) ---
const groups = new Map();
for (const k of kids || []) {
  const key = `${k.center_id}||${roomShort(k.classroom)}`;
  if (!groups.has(key)) groups.set(key, { center_id: k.center_id, room: roomShort(k.classroom), rows: [] });
  groups.get(key).rows.push(k);
}
const ordered = Array.from(groups.values()).sort((a, b) => cShort(a.center_id).localeCompare(cShort(b.center_id)) || a.room.localeCompare(b.room));
for (const g of ordered) {
  const ws = wb.addWorksheet(tabName(`${cShort(g.center_id)} - ${g.room}`), { views: [{ state: 'frozen', ySplit: 3 }] });
  headerBand(ws, `${cn(g.center_id)} — ${g.room}`, [
    { h: 'Child', w: 26 }, { h: 'PIN', w: 9 }, { h: 'Parent / contact', w: 22 }, { h: 'Phone', w: 16 }, { h: 'Email', w: 30 }, { h: 'Date of birth', w: 14 },
  ]);
  let r = 4;
  for (const k of g.rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''))) {
    const f = famById[k.family_id] || {};
    const p = prim(k.family_id);
    const stub = String(f.email || '').endsWith('@roster.local');
    const row = ws.getRow(r);
    row.values = [k.name, String(f.pin || ''), p.name || (stub ? '(needs family info)' : ''), p.phone || '', stub ? '' : (f.email || ''), k.date_of_birth || ''];
    row.getCell(2).font = { name: 'Menlo', bold: true };
    if (r % 2 === 1) row.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }; });
    r++;
  }
  ws.getCell(`A${r + 1}`).value = `${g.rows.length} children`;
  ws.getCell(`A${r + 1}`).font = { italic: true, size: 9, color: { argb: 'FF6B7280' } };
}

// --- staff tab ---
const ws = wb.addWorksheet(tabName('Staff — PINs & Logins'), { views: [{ state: 'frozen', ySplit: 3 }] });
headerBand(ws, 'Staff — PINs & Logins', [
  { h: 'Name', w: 24 }, { h: 'Role', w: 14 }, { h: 'Center', w: 16 }, { h: 'PIN', w: 9 }, { h: 'Login (email)', w: 32 }, { h: 'Status', w: 12 },
]);
let r = 4;
for (const e of (emps || []).sort((a, b) => cShort(a.center_id).localeCompare(cShort(b.center_id)) || `${a.last_name}`.localeCompare(`${b.last_name}`))) {
  const row = ws.getRow(r);
  row.values = [`${e.first_name || ''} ${e.last_name || ''}`.trim(), e.role || '', cn(e.center_id), String(e.pin || ''), e.email || '', e.employment_status || ''];
  row.getCell(4).font = { name: 'Menlo', bold: true };
  if (r % 2 === 1) row.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }; });
  r++;
}
ws.getCell(`A${r + 1}`).value = `${(emps || []).length} staff. PINs are kiosk/office sign-in codes. Confidential.`;
ws.getCell(`A${r + 1}`).font = { italic: true, size: 9, color: { argb: 'FF6B7280' } };

const out = join(homedir(), 'Desktop', 'Christinas_Rooms_and_Staff.xlsx');
await wb.xlsx.writeFile(out);
console.log(`Workbook: ${out}`);
console.log(`Room tabs: ${ordered.length} (${ordered.map((g) => cShort(g.center_id) + '/' + g.room).join(', ')})`);
console.log(`Staff tab: ${(emps || []).length} staff`);
