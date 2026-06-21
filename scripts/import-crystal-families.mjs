// Full-family Crystal importer from Christinas_Childcare_Families.xlsx ("All
// Children" sheet). Groups siblings by the Family Group column into ONE family
// with ONE shared PIN, loads every contact as a parent, stores DOB + classroom
// per child, and creates the Crystal center if missing.
//
// SAFE: --check (default) is read-only and prints the plan. --apply writes.
// Idempotent: family/child ids are derived deterministically from the family
// group + child name, so a re-run upserts the same rows (no duplicates).
// Collision-safe: family PINs never reuse a PIN already held by another family
// on the target DB (there is no DB unique constraint on families.pin).
//
// Target DB: --prod reads .env.prod.local (prod), else .env.local (test).
// Usage: node scripts/import-crystal-families.mjs [--prod] [--apply]

import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomInt } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ARGV = process.argv.slice(2);
const has = (f) => ARGV.includes(f);
const APPLY = has('--apply');
const PROD = has('--prod');
const XLSX = ARGV.find((a) => a.endsWith('.xlsx')) || join(homedir(), 'Desktop', 'Christinas_Childcare_Families.xlsx');
const CRYSTAL_ID = 'b2000000-0000-0000-0000-000000000002'; // app's canonical Crystal center id
const CRYSTAL_NAME = 'Crystal Center';

// --- creds ---
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

function det(s) {
  const h = createHash('sha256').update(s).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}
const clean = (v) => (v == null ? '' : String(v).trim());

// --- parse the spreadsheet ("All Children") ---
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX);
const ws = wb.getWorksheet('All Children');
if (!ws) { console.error('No "All Children" sheet'); process.exit(1); }

const rows = [];
ws.eachRow((row, n) => {
  if (n === 1) return; // header
  const c = (i) => clean(row.getCell(i).text);
  const first = c(1), last = c(2);
  if (!first && !last) return;
  rows.push({
    first, last, nickname: c(3), dob: c(4), classroom: c(6), program: c(7), familyGroup: c(8) || `NOGRP-${first}-${last}`,
    contacts: [
      { name: c(10), rel: c(11), mobile: c(12), email: c(13) },
      { name: c(14), rel: c(15), mobile: c(16), email: c(17) },
      { name: c(18), rel: c(19), mobile: c(20), email: c(21) },
    ].filter((x) => x.name),
  });
});

// --- group by family ---
const groups = new Map();
for (const r of rows) {
  if (!groups.has(r.familyGroup)) groups.set(r.familyGroup, { fg: r.familyGroup, kids: [], contacts: [] });
  const g = groups.get(r.familyGroup);
  g.kids.push(r);
  for (const ct of r.contacts) {
    if (!g.contacts.some((x) => x.name === ct.name && x.email === ct.email)) g.contacts.push(ct);
  }
}

// --- existing PINs + emails on target (collision + email-unique guards) ---
const { data: famRows } = await sb.from('families').select('id, pin, email').limit(10000);
const pinOwner = new Map();   // pin -> family id
const emailOwner = new Map(); // email -> family id
const existingPinById = new Map();
for (const f of famRows ?? []) {
  if (f.pin) pinOwner.set(String(f.pin), f.id);
  if (f.email) emailOwner.set(String(f.email).toLowerCase(), f.id);
  existingPinById.set(f.id, f.pin ? String(f.pin) : null);
}

const _ASC = '0123456789', _DESC = '9876543210';
const _WEAK = new Set(['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1212', '2121', '1010', '0101', '2020', '4321', '2580', '6969', '1004', '2000']);
const isWeakPin = (p) => !/^\d{4}$/.test(p) || /^(\d)\1{3}$/.test(p) || _ASC.includes(p) || _DESC.includes(p) || _WEAK.has(p);
function freshPin(used) {
  for (let i = 0; i < 100000; i++) {
    const p = String(randomInt(1000, 10000));
    if (!isWeakPin(p) && !used.has(p)) { used.add(p); return p; }
  }
  throw new Error('could not allocate a unique PIN');
}

// --- build the plan ---
const usedPins = new Set(pinOwner.keys());
const plan = [];
for (const g of groups.values()) {
  const famId = det(`crystal-family:${g.fg}`);
  const primary = g.contacts[0] || { name: '', email: '', mobile: '', rel: 'guardian' };
  let email = clean(primary.email).toLowerCase();
  // email must be unique + present; fall back to a roster placeholder
  if (!email || (emailOwner.has(email) && emailOwner.get(email) !== famId)) {
    email = `${g.fg.toLowerCase()}@roster.local`;
  }
  emailOwner.set(email, famId);
  // reuse this family's existing PIN if it already exists (idempotent); else fresh
  const pin = existingPinById.get(famId) || freshPin(usedPins);
  plan.push({
    fg: g.fg, famId, email, pin,
    primaryName: primary.name,
    contacts: g.contacts,
    kids: g.kids.map((k) => ({
      id: det(`crystal-child:${clean(k.first)} ${clean(k.last)}|${g.fg}`),
      name: `${clean(k.first)} ${clean(k.last)}`.trim(),
      dob: /^\d{4}-\d{2}-\d{2}$/.test(k.dob) ? k.dob : null,
      classroom: k.classroom,
    })),
  });
}

const totalKids = plan.reduce((n, p) => n + p.kids.length, 0);
const rooms = Array.from(new Set(rows.map((r) => r.classroom).filter(Boolean)));
const collisions = plan.filter((p) => pinOwner.has(p.pin) && pinOwner.get(p.pin) !== p.famId);

console.log(`\nCrystal full-family import  [${APPLY ? 'APPLY' : 'CHECK (dry run)'}]  db=${ref}`);
console.log(`Spreadsheet: ${XLSX}`);
console.log(`Families: ${plan.length}   Children: ${totalKids}   Rooms: ${rooms.length}`);
console.log(`Rooms: ${rooms.join('  |  ')}`);
const sibs = plan.filter((p) => p.kids.length > 1);
console.log(`Multi-child families: ${sibs.length}  (e.g. ${sibs.slice(0, 4).map((p) => p.primaryName + '=' + p.kids.length).join(', ')})`);
console.log('PIN collisions with other families:', collisions.length === 0 ? 'NONE' : collisions.map((c) => c.fg + ':' + c.pin).join(', '));
console.log('\nSample families:');
for (const p of plan.slice(0, 5)) {
  console.log(`  ${p.fg}  pin ${p.pin}  ${p.primaryName || '(no contact)'}  <${p.email}>  kids: ${p.kids.map((k) => k.name).join(', ')}`);
}

if (collisions.length) { console.error('\nABORT: PIN collisions with existing families. No writes.'); process.exit(1); }

if (!APPLY) {
  console.log('\nCHECK only — nothing written. Re-run with --apply to load.\n');
  process.exit(0);
}

// --- APPLY ---
// 1) Crystal center
{
  const { error } = await sb.from('centers').upsert({ id: CRYSTAL_ID, name: CRYSTAL_NAME, is_active: true }, { onConflict: 'id' });
  if (error) { console.error('center upsert failed:', error.message); process.exit(1); }
  console.log(`\nCrystal center ready (${CRYSTAL_ID}).`);
}
let fam = 0, par = 0, kid = 0;
for (const p of plan) {
  const { error: fe } = await sb.from('families').upsert(
    { id: p.famId, email: p.email, password_hash: 'pin-only', pin: p.pin, status: 'active', center_id: CRYSTAL_ID, preferred_language: 'en' },
    { onConflict: 'id' }
  );
  if (fe) { console.error(`family ${p.fg} failed:`, fe.message); continue; }
  fam++;
  // parents: fully derived -> clear + reinsert so a re-run never duplicates
  await sb.from('family_parents').delete().eq('family_id', p.famId);
  if (p.contacts.length) {
    const prows = p.contacts.map((c, i) => ({ family_id: p.famId, name: c.name, phone: c.mobile || null, email: c.email || null, relationship: c.rel || 'guardian', is_primary: i === 0 }));
    const { error: pe } = await sb.from('family_parents').insert(prows);
    if (!pe) par += prows.length;
  }
  for (const k of p.kids) {
    const { error: ce } = await sb.from('family_children').upsert(
      { id: k.id, family_id: p.famId, name: k.name, date_of_birth: k.dob, classroom: k.classroom, center_id: CRYSTAL_ID },
      { onConflict: 'id' }
    );
    if (!ce) kid++;
  }
}
console.log(`APPLIED: ${fam} families, ${par} parents, ${kid} children into ${CRYSTAL_NAME}.`);

// --- per-family PIN list for printing ---
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const trows = plan.sort((a, b) => a.fg.localeCompare(b.fg)).map((p) =>
  `<tr><td class=pin>${esc(p.pin)}</td><td>${esc(p.primaryName)}</td><td>${esc(p.kids.map((k) => k.name).join(', '))}</td></tr>`
).join('\n');
const html = `<!doctype html><meta charset=utf-8><title>Crystal Family PINs</title>
<style>body{font-family:-apple-system,sans-serif;max-width:760px;margin:30px auto;color:#1f2937}
h1{color:#C62828}table{border-collapse:collapse;width:100%}th{background:#faf6f0;text-align:left;padding:8px;font-size:12px;text-transform:uppercase;color:#6b7280}
td{padding:8px;border-bottom:1px solid #f0f0f0}.pin{font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.08em}</style>
<h1>Crystal Center — Family Kiosk PINs</h1>
<p>${plan.length} families, ${totalKids} children. One PIN per family (siblings share). Keep at the front desk; not stored in code.</p>
<table><thead><tr><th>PIN</th><th>Parent</th><th>Children</th></tr></thead><tbody>${trows}</tbody></table>`;
const out = join(homedir(), 'Desktop', 'crystal-family-pins.html');
writeFileSync(out, html);
console.log(`PIN list -> ${out}\n`);
