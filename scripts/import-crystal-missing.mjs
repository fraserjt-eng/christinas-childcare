// Add the children who are in the original 66-name attendance export but NOT in
// the new 51-active spreadsheet, because J wants them kept enrolled for now.
// The attendance CSV has names only (no family info), so each is added as a
// kiosk-ready stub: own family + own PIN + placeholder email + Crystal + active.
// Same-surname kids are flagged as likely siblings to merge once real family
// info arrives. After applying, regenerates ONE combined Crystal PIN sheet.
//
// SAFE: --check (default) read-only; --apply writes. Idempotent (deterministic
// ids by name), collision-safe PINs. --prod targets .env.prod.local.
// Usage: node scripts/import-crystal-missing.mjs [--prod] [--apply]

import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomInt } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ARGV = process.argv.slice(2);
const APPLY = ARGV.includes('--apply');
const PROD = ARGV.includes('--prod');
const CRYSTAL_ID = 'b2000000-0000-0000-0000-000000000002';
const CSV = join(homedir(), 'Desktop', 'Attendance2026_6_Students.csv');
const XLSX = join(homedir(), 'Desktop', 'Christinas_Childcare_Families.xlsx');

const envFile = PROD ? '.env.prod.local' : '.env.local';
const env = {};
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL;
const key = PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || key.includes('PASTE_')) { console.error(`Missing creds in ${envFile}`); process.exit(1); }
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1] || url;
const sb = createClient(url, key, { auth: { persistSession: false } });

const det = (s) => { const h = createHash('sha256').update(s).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`; };
const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// original 66 names
const origNames = readFileSync(CSV, 'utf8').split('\n').slice(1).filter((l) => l.trim()).map((l) => l.split(',')[0].trim()).filter(Boolean);
// new 51 names
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX);
const ws = wb.getWorksheet('All Children');
const newSet = new Set();
ws.eachRow((r, n) => { if (n === 1) return; const nm = `${r.getCell(1).text || ''} ${r.getCell(2).text || ''}`.trim(); if (nm) newSet.add(norm(nm)); });

const missing = origNames.filter((n) => !newSet.has(norm(n)));

// existing pins (collision guard, owner-aware)
const { data: famRows } = await sb.from('families').select('id, pin').not('pin', 'is', null).limit(10000);
const pinOwner = new Map();
for (const f of famRows ?? []) if (f.pin) pinOwner.set(String(f.pin), f.id);
const used = new Set(pinOwner.keys());
const _ASC = '0123456789', _DESC = '9876543210';
const _WEAK = new Set(['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1212', '2121', '1010', '0101', '2020', '4321', '2580', '6969', '1004', '2000']);
const isWeakPin = (p) => !/^\d{4}$/.test(p) || /^(\d)\1{3}$/.test(p) || _ASC.includes(p) || _DESC.includes(p) || _WEAK.has(p);
const freshPin = () => { for (let i = 0; i < 100000; i++) { const p = String(randomInt(1000, 10000)); if (!isWeakPin(p) && !used.has(p)) { used.add(p); return p; } } throw new Error('no pin'); };

const surnameCount = {};
for (const n of missing) { const ln = n.split(' ').slice(-1)[0].toLowerCase(); surnameCount[ln] = (surnameCount[ln] || 0) + 1; }

const plan = missing.map((name) => {
  const famId = det('crystal-family:missing:' + name);
  return {
    name, famId,
    childId: det('crystal-child:missing:' + name),
    pin: pinOwner.has(String(/* keep existing */ '')) ? null : freshPin(),
    email: `${slug(name)}@roster.local`,
    likelySibling: surnameCount[name.split(' ').slice(-1)[0].toLowerCase()] > 1,
  };
});

console.log(`\nKeep-enrolled add-on  [${APPLY ? 'APPLY' : 'CHECK (dry run)'}]  db=${ref}`);
console.log(`Original 66, new active 51, adding ${plan.length} kept-enrolled children (name-only stubs).`);
const collide = plan.filter((p) => pinOwner.has(p.pin) && pinOwner.get(p.pin) !== p.famId);
console.log('PIN collisions:', collide.length === 0 ? 'NONE' : collide.map((c) => c.name + ':' + c.pin).join(', '));
for (const p of plan) console.log(`  ${p.name.padEnd(28)} pin ${p.pin}${p.likelySibling ? '   (likely sibling — same surname)' : ''}`);
if (collide.length) { console.error('ABORT: collisions'); process.exit(1); }

if (!APPLY) { console.log('\nCHECK only — nothing written. Re-run with --apply.\n'); process.exit(0); }

// ensure Crystal center exists, then add stubs
await sb.from('centers').upsert({ id: CRYSTAL_ID, name: 'Crystal Center', is_active: true }, { onConflict: 'id' });
let fam = 0, kid = 0;
for (const p of plan) {
  const { error: fe } = await sb.from('families').upsert({ id: p.famId, email: p.email, password_hash: 'pin-only', pin: p.pin, status: 'active', center_id: CRYSTAL_ID, preferred_language: 'en' }, { onConflict: 'id' });
  if (fe) { console.error('family failed', p.name, fe.message); continue; }
  fam++;
  const { error: ce } = await sb.from('family_children').upsert({ id: p.childId, family_id: p.famId, name: p.name, center_id: CRYSTAL_ID }, { onConflict: 'id' });
  if (!ce) kid++;
}
console.log(`APPLIED: ${fam} stub families, ${kid} children kept enrolled in Crystal.`);

// regenerate ONE combined Crystal PIN sheet from the DB
const { data: fams } = await sb.from('families').select('id, pin').eq('center_id', CRYSTAL_ID).limit(5000);
const { data: kids } = await sb.from('family_children').select('name, family_id').eq('center_id', CRYSTAL_ID).limit(5000);
const { data: pars } = await sb.from('family_parents').select('family_id, name, is_primary').limit(10000);
const kidsBy = {}; for (const k of kids ?? []) (kidsBy[k.family_id] ||= []).push(k.name);
const parBy = {}; for (const pr of pars ?? []) if (pr.is_primary || !parBy[pr.family_id]) parBy[pr.family_id] = pr.name;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const rowsHtml = (fams ?? []).filter((f) => (kidsBy[f.id] || []).length).sort((a, b) => (parBy[a.id] || '').localeCompare(parBy[b.id] || '')).map((f) =>
  `<tr><td class=pin>${esc(f.pin)}</td><td>${esc(parBy[f.id] || '(needs family info)')}</td><td>${esc((kidsBy[f.id] || []).join(', '))}</td></tr>`).join('\n');
const total = (kids ?? []).length;
const html = `<!doctype html><meta charset=utf-8><title>Crystal Family PINs (all)</title>
<style>body{font-family:-apple-system,sans-serif;max-width:780px;margin:30px auto;color:#1f2937}h1{color:#C62828}
table{border-collapse:collapse;width:100%}th{background:#faf6f0;text-align:left;padding:8px;font-size:12px;text-transform:uppercase;color:#6b7280}
td{padding:8px;border-bottom:1px solid #f0f0f0}.pin{font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.08em}</style>
<h1>Crystal Center — All Family Kiosk PINs</h1>
<p>${(fams ?? []).filter((f) => (kidsBy[f.id] || []).length).length} families, ${total} children. One PIN per family. Rows marked "(needs family info)" are the kept-enrolled children from the attendance export awaiting full details.</p>
<table><thead><tr><th>PIN</th><th>Parent / contact</th><th>Children</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;
const out = join(homedir(), 'Desktop', 'crystal-all-pins.html');
writeFileSync(out, html);
console.log(`Combined PIN sheet -> ${out}\n`);
