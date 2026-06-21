// Read-only KEEP-LIST audit. Connects to whatever NEXT_PUBLIC_SUPABASE_URL in
// .env.local points at (the TEST db today), runs SELECTs only, classifies every
// staff / student / family row as REAL (stays) or DEMO (cut), and writes a clean
// HTML keep-list to the Desktop for J to approve. Nothing is ever written or
// deleted. Same classification runs on prod at cutover.
//
// Usage: node scripts/keep-list-audit.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// --- load .env.local (KEY=VALUE, tolerate quotes) ---
const env = {};
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('missing url/key in .env.local'); process.exit(1); }
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1] || '?';
const sb = createClient(url, key, { auth: { persistSession: false } });

// --- demo markers (mirror docs/cutover/REAL-DATA-PURGE.md) ---
const DEMO_EMAIL = /@demo\.com$|@family\.test$|@example\.com$/i;
const DEMO_CHILDREN = new Set(['Noah Brown', 'Ava Brown', 'Sofia Garcia']);
const DEMO_STAFF = new Set([
  'Maria Lopez', 'Aaliyah Johnson', 'Ben Carter', 'Priya Patel', 'Sam Nguyen',
  'Grace Kim', 'Dana Reed', 'Ophelia Zeogar', 'Stephen Zeogar', 'Maria Santos',
  'James Robinson', 'Sarah Kim', 'David Chen', 'Lisa Johnson',
].map((s) => s.toLowerCase()));

async function all(table, cols) {
  const { data, error } = await sb.from(table).select(cols).limit(5000);
  if (error) { console.error(`${table}: ${error.message}`); return []; }
  return data || [];
}

const centers = await all('centers', 'id, name');
const centerName = (id) => centers.find((c) => c.id === id)?.name || 'Unassigned';

const employees = await all('employees', 'id, first_name, last_name, role, employment_status, center_id, email');
const children = await all('family_children', 'id, name, center_id, family_id');
const families = await all('families', 'id, email, status, center_id');

const staffRows = employees.map((e) => {
  const name = `${e.first_name || ''} ${e.last_name || ''}`.trim();
  const demo = DEMO_STAFF.has(name.toLowerCase());
  return { name, role: e.role || '', status: e.employment_status || '', center: centerName(e.center_id), keep: !demo, why: demo ? 'demo name (review)' : '' };
});
// A family is demo if its login email is a placeholder; remember those ids so a
// demo family's children are cut too (not just the 3 hardcoded names).
const demoFamilyIds = new Set(families.filter((f) => DEMO_EMAIL.test(f.email || '')).map((f) => f.id));
const childRows = children.map((c) => {
  const byName = DEMO_CHILDREN.has((c.name || '').trim());
  const byFamily = demoFamilyIds.has(c.family_id);
  const demo = byName || byFamily;
  return { name: c.name || '', center: centerName(c.center_id), keep: !demo, why: byName ? 'demo child' : byFamily ? 'demo family' : '' };
});
const famRows = families.map((f) => {
  const demo = DEMO_EMAIL.test(f.email || '');
  const roster = /@roster\.local$/i.test(f.email || '');
  return { email: f.email || '(none)', status: f.status || '', center: centerName(f.center_id), keep: !demo, why: demo ? 'demo email' : roster ? 'kiosk roster stub (real Crystal kid)' : '' };
});

const keep = {
  staff: staffRows.filter((r) => r.keep),
  students: childRows.filter((r) => r.keep),
  families: famRows.filter((r) => r.keep),
};
const cut = {
  staff: staffRows.filter((r) => !r.keep),
  students: childRows.filter((r) => !r.keep),
  families: famRows.filter((r) => !r.keep),
};

// group keep rows by center for readability
function byCenter(rows) {
  const m = {};
  for (const r of rows) (m[r.center] ||= []).push(r);
  return m;
}

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function section(title, rows, cols) {
  const grouped = byCenter(rows);
  let html = `<h2>${esc(title)} <span class="count">${rows.length} stay</span></h2>`;
  for (const center of Object.keys(grouped).sort()) {
    html += `<h3>${esc(center)} <span class="sub">${grouped[center].length}</span></h3><table><thead><tr>`;
    for (const c of cols) html += `<th>${esc(c.label)}</th>`;
    html += `<th>note</th></tr></thead><tbody>`;
    for (const r of grouped[center].sort((a, b) => (a[cols[0].key] || '').localeCompare(b[cols[0].key] || ''))) {
      html += '<tr>';
      for (const c of cols) html += `<td>${esc(r[c.key] || '')}</td>`;
      html += `<td class="why">${esc(r.why || '')}</td></tr>`;
    }
    html += '</tbody></table>';
  }
  return html;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Christina's — Keep List (what stays)</title>
<style>
 body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:920px;margin:32px auto;padding:0 20px;color:#1f2937}
 h1{color:#C62828;margin-bottom:4px} .meta{color:#6b7280;font-size:13px;margin-bottom:24px}
 h2{margin-top:34px;border-bottom:2px solid #C62828;padding-bottom:6px}
 h3{margin:18px 0 6px;color:#374151;font-size:15px}
 .count{background:#C62828;color:#fff;font-size:12px;padding:2px 10px;border-radius:999px;vertical-align:middle;margin-left:8px}
 .sub{color:#9ca3af;font-weight:400;font-size:13px}
 table{border-collapse:collapse;width:100%;margin:4px 0 8px;font-size:14px}
 th{text-align:left;background:#faf6f0;padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;text-transform:uppercase;color:#6b7280}
 td{padding:7px 10px;border-bottom:1px solid #f1f1f1} .why{color:#15803d;font-size:12px}
 .banner{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin:18px 0}
 .cut{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin:26px 0;color:#991b1b;font-size:14px}
</style></head><body>
<h1>What stays — the keep list</h1>
<div class="meta">Source DB: <b>${esc(ref)}</b> (read-only) · generated for J's approval · real Brooklyn Park data + the real Crystal roster. Nothing here is deleted; this is the list to KEEP.</div>
<div class="banner"><b>${keep.staff.length} staff</b>, <b>${keep.students.length} students</b>, <b>${keep.families.length} families</b> stay. Approve this list and only the demo rows below get cut.</div>
${section('Staff (who stays)', keep.staff, [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'status', label: 'Status' }])}
${section('Students (who stays)', keep.students, [{ key: 'name', label: 'Child' }])}
${section('Families (who stays)', keep.families, [{ key: 'email', label: 'Family login' }, { key: 'status', label: 'Status' }])}
<div class="cut"><b>For reference, what gets cut (NOT in the keep list):</b> ${cut.staff.length} demo staff, ${cut.students.length} demo students, ${cut.families.length} demo families. Demo staff names flagged "review" are only cut after you confirm each.</div>
</body></html>`;

const out = join(homedir(), 'Desktop', 'cc-keep-list.html');
writeFileSync(out, html);
writeFileSync(join(homedir(), 'Desktop', 'cc-keep-list.json'), JSON.stringify({ ref, keep, cut }, null, 2));

console.log(`DB ${ref}`);
console.log(`KEEP  staff=${keep.staff.length} students=${keep.students.length} families=${keep.families.length}`);
console.log(`CUT   staff=${cut.staff.length} students=${cut.students.length} families=${cut.families.length}`);
console.log(`keep list → ${out}`);
