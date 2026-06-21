// Branded family directory spreadsheet (both centers) with kiosk PINs, for the
// admin data center. Christina's red header + logo "bub", one row per family
// (children grouped), PIN + primary contact + phone + email + rooms + DOBs.
// A sheet per center + an "All Families" sheet. Saves to the Desktop.
// Usage: node scripts/gen-family-directory-xlsx.mjs [--prod]

import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PROD = process.argv.includes('--prod');
const env = {};
for (const l of readFileSync(PROD ? '.env.prod.local' : '.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL;
const key = PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

const RED = 'FFC62828', YELLOW = 'FFFFD54F', CREAM = 'FFFAF6F0', GREY = 'FF6B7280';

const [{ data: centers }, { data: fams }, { data: kids }, { data: pars }] = await Promise.all([
  sb.from('centers').select('id, name').limit(50),
  sb.from('families').select('id, pin, email, status, center_id').limit(10000),
  sb.from('family_children').select('name, date_of_birth, classroom, family_id, center_id').limit(10000),
  sb.from('family_parents').select('family_id, name, phone, email, relationship, is_primary').limit(10000),
]);
const centerName = (id) => (centers || []).find((c) => c.id === id)?.name || 'Unassigned';
const kidsBy = {}; for (const k of kids || []) (kidsBy[k.family_id] ||= []).push(k);
const parsBy = {}; for (const p of pars || []) (parsBy[p.family_id] ||= []).push(p);

const wb = new ExcelJS.Workbook();
wb.creator = "Christina's Child Care Center";
let logoId = null;
const logoPath = 'public/images/icon-192.png';
if (existsSync(logoPath)) logoId = wb.addImage({ filename: logoPath, extension: 'png' });

function buildSheet(title, families) {
  const ws = wb.addWorksheet(title, { views: [{ state: 'frozen', ySplit: 4 }] });
  ws.columns = [
    { key: 'pin', width: 10 }, { key: 'children', width: 30 }, { key: 'parent', width: 22 },
    { key: 'phone', width: 16 }, { key: 'email', width: 30 }, { key: 'rooms', width: 26 },
    { key: 'dobs', width: 24 }, { key: 'status', width: 10 },
  ];
  // brand band (rows 1-3) with logo + title
  ws.mergeCells('A1:H3');
  const band = ws.getCell('A1');
  band.value = `  Christina's Child Care Center  ·  ${title}  ·  Kiosk PIN Directory`;
  band.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  band.alignment = { vertical: 'middle', horizontal: 'left', indent: 4 };
  band.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED } };
  ws.getRow(1).height = 22; ws.getRow(2).height = 22; ws.getRow(3).height = 22;
  if (logoId !== null) ws.addImage(logoId, { tl: { col: 7.15, row: 0.25 }, ext: { width: 56, height: 56 } });
  // header row (row 4)
  const hdr = ws.getRow(4);
  hdr.values = ['PIN', 'Children', 'Parent / contact', 'Phone', 'Email', 'Room(s)', 'Date(s) of birth', 'Status'];
  hdr.eachCell((c) => {
    c.font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW } };
    c.alignment = { vertical: 'middle' };
    c.border = { bottom: { style: 'thin', color: { argb: RED } } };
  });
  hdr.height = 18;
  // data rows
  let r = 5;
  for (const f of families.sort((a, b) => (primaryName(a.id) || '').localeCompare(primaryName(b.id) || ''))) {
    const ks = kidsBy[f.id] || [];
    const row = ws.getRow(r);
    row.values = [
      String(f.pin || ''),
      ks.map((k) => k.name).join(', '),
      primaryName(f.id) || (String(f.email || '').endsWith('@roster.local') ? '(needs family info)' : ''),
      (parsBy[f.id]?.find((p) => p.is_primary) || parsBy[f.id]?.[0])?.phone || '',
      String(f.email || '').endsWith('@roster.local') ? '' : f.email || '',
      Array.from(new Set(ks.map((k) => k.classroom).filter(Boolean))).join(' / '),
      ks.map((k) => k.date_of_birth).filter(Boolean).join(', '),
      f.status || '',
    ];
    row.getCell(1).font = { name: 'Menlo', bold: true, size: 12 };
    if (r % 2 === 1) row.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }; });
    row.alignment = { vertical: 'middle' };
    r++;
  }
  const foot = ws.getRow(r + 1);
  foot.getCell(1).value = `${families.length} families · ${families.reduce((n, f) => n + (kidsBy[f.id] || []).length, 0)} children · generated ${PROD ? 'from production' : 'from test'}. Confidential — front desk only.`;
  foot.getCell(1).font = { italic: true, size: 9, color: { argb: GREY } };
  ws.mergeCells(`A${r + 1}:H${r + 1}`);
}
function primaryName(fid) {
  const ps = parsBy[fid] || [];
  return (ps.find((p) => p.is_primary) || ps[0])?.name || '';
}

// one sheet per center that has families, plus an All sheet
const withKids = (families) => families.filter((f) => (kidsBy[f.id] || []).length > 0);
const byCenter = {};
for (const f of fams || []) (byCenter[f.center_id] ||= []).push(f);
for (const cid of Object.keys(byCenter)) {
  const fams2 = withKids(byCenter[cid]);
  if (fams2.length) buildSheet(centerName(cid), fams2);
}
buildSheet('All Families', withKids(fams || []));

const out = join(homedir(), 'Desktop', 'Christinas_Family_Directory_PINs.xlsx');
await wb.xlsx.writeFile(out);
const tot = withKids(fams || []).length;
console.log(`Branded directory written: ${out}`);
console.log(`Sheets: ${Object.keys(byCenter).map(centerName).join(', ')} + All Families  (${tot} families)`);
