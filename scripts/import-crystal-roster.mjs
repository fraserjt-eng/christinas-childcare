#!/usr/bin/env node
// Import the Crystal Center student roster as kiosk-ready kids.
//
// WHY THIS EXISTS: the public repo must never contain real children's names or
// PINs. So this is CODE only. It reads the roster CSV and writes the PIN
// assignments + the printable list to paths OUTSIDE the repo (the Desktop by
// default). The database is the system of record; git stays clean.
//
// MODEL: the kiosk matches a PIN to one active family in a center, then checks
// in that family's children. We don't have guardian info yet, so each child
// becomes its own one-child "family stub" with a unique PIN. Christina merges
// siblings under one shared PIN later when she has guardian details.
//
// Each child gets:
//   families:        { id(fixed), email(unique placeholder), password_hash(unguessable),
//                      pin(unique 4-digit), status:'active', center_id, preferred_language:'en' }
//   family_children: { id(fixed), family_id, name, center_id }
// Login is impossible (the password hash is a random preimage); only the kiosk
// PIN works, which is all Monday needs.
//
// USAGE:
//   node scripts/import-crystal-roster.mjs --check     # dry run: parse, assign PINs, write the plan + list, NO db writes
//   node scripts/import-crystal-roster.mjs --apply     # insert/upsert into the DB (idempotent on fixed UUIDs)
// FLAGS:
//   --csv <path>          default: ~/Desktop/Attendance2026_6_Students.csv
//   --assignments <path>  default: ~/Desktop/crystal-roster-assignments.json  (the source of truth for PINs; reused for prod)
//   --center "<name>"     default: "Crystal Center"
//   --create-center       create the center row if it does not exist (needed for prod at cutover)
// DB TARGET (env, overridable so the SAME assignments can be applied to prod at cutover):
//   SUPA_URL + SUPA_SERVICE_ROLE   (if unset, parsed from .env.local -> test DB)

import { createClient } from '@supabase/supabase-js';
import { createHash, randomUUID, randomInt } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const HOME = homedir();

// ---- args ----
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};
const APPLY = has('--apply');
const CHECK = has('--check') || !APPLY;
const CREATE_CENTER = has('--create-center');
const CSV_PATH = val('--csv', join(HOME, 'Desktop', 'Attendance2026_6_Students.csv'));
const ASSIGN_PATH = val('--assignments', join(HOME, 'Desktop', 'crystal-roster-assignments.json'));
const CENTER_NAME = val('--center', 'Crystal Center');

// ---- env (test DB from .env.local unless SUPA_* override for prod) ----
function loadEnvLocal() {
  const p = join(REPO, '.env.local');
  const out = {};
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}
const envLocal = loadEnvLocal();
const SUPA_URL = process.env.SUPA_URL || envLocal.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_ROLE || envLocal.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !SUPA_KEY) {
  console.error('Missing DB creds. Set SUPA_URL + SUPA_SERVICE_ROLE, or have .env.local with the test keys.');
  process.exit(1);
}
const dbRef = (SUPA_URL.match(/https?:\/\/([a-z0-9]+)\.supabase/) || [])[1] || SUPA_URL;
const supa = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

// ---- helpers ----
const placeholderHash = () => createHash('sha256').update(randomUUID() + ':' + randomUUID()).digest('hex');
const slug = (name) =>
  name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'child';
const lastNameOf = (name) => {
  const toks = name.trim().split(/\s+/).filter(Boolean);
  return (toks[toks.length - 1] || '').toLowerCase();
};

function parseRoster(csvPath) {
  if (!existsSync(csvPath)) {
    console.error('CSV not found at', csvPath);
    process.exit(1);
  }
  const lines = readFileSync(csvPath, 'utf8').split(/\r?\n/);
  const names = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const name = line.split(',')[0].trim();
    if (!name) continue;
    if (i === 0 && /^students$/i.test(name)) continue; // header row
    if (/^students$/i.test(name)) continue;
    names.push(name);
  }
  // de-dupe exact duplicates defensively (keep first)
  return Array.from(new Set(names));
}

function uniquePin(used) {
  for (let tries = 0; tries < 100000; tries++) {
    const pin = String(randomInt(1000, 10000));
    if (!used.has(pin)) {
      used.add(pin);
      return pin;
    }
  }
  throw new Error('Could not find a free PIN');
}

async function existingPins() {
  // global PIN uniqueness (simpler + safer than per-center), service role bypasses RLS
  const { data, error } = await supa.from('families').select('pin').not('pin', 'is', null).limit(10000);
  if (error) throw new Error('reading existing pins: ' + error.message);
  return new Set((data || []).map((r) => String(r.pin)));
}

async function resolveCenter() {
  const { data, error } = await supa.from('centers').select('id, name').ilike('name', `${CENTER_NAME}%`).limit(5);
  if (error) throw new Error('reading centers: ' + error.message);
  if (data && data.length) return data[0];
  if (!CREATE_CENTER) {
    console.error(`Center "${CENTER_NAME}" not found. Re-run with --create-center to create it (needed for prod).`);
    process.exit(1);
  }
  const { data: created, error: e2 } = await supa
    .from('centers')
    .insert({ name: CENTER_NAME, is_active: true })
    .select('id, name')
    .single();
  if (e2) throw new Error('creating center: ' + e2.message);
  console.log('Created center', created.name, created.id);
  return created;
}

function buildAssignments(names, used) {
  // sibling grouping (by last token) for J to confirm/merge later
  const byLast = {};
  for (const n of names) (byLast[lastNameOf(n)] ||= []).push(n);
  const rows = names.map((name) => {
    const last = lastNameOf(name);
    return {
      name,
      last_name: last,
      sibling_group: byLast[last].length > 1 ? last : null,
      pin: uniquePin(used),
      family_id: randomUUID(),
      child_id: randomUUID(),
      email: `crystal.${slug(name)}.${randomInt(1000, 10000)}@roster.local`,
      password_hash: placeholderHash(),
    };
  });
  return rows;
}

function writeDeliverables(rows, centerName) {
  // CSV (Child, PIN, Likely sibling group) + branded printable HTML, both on the Desktop (outside the repo)
  const csv =
    'Child,PIN,Likely sibling group\n' +
    rows
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => `"${r.name.replace(/"/g, '""')}",${r.pin},${r.sibling_group || ''}`)
      .join('\n') +
    '\n';
  const csvPath = join(HOME, 'Desktop', 'crystal-kiosk-pins.csv');
  writeFileSync(csvPath, csv);

  const sorted = rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  const sibGroups = new Set(rows.filter((r) => r.sibling_group).map((r) => r.sibling_group));
  const tableRows = sorted
    .map(
      (r) =>
        `<tr${r.sibling_group ? ' class="sib"' : ''}><td>${r.name}</td><td class="pin">${r.pin}</td><td class="grp">${
          r.sibling_group ? '↳ ' + r.sibling_group : ''
        }</td></tr>`
    )
    .join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${centerName} — Kiosk PINs</title>
<style>
  :root{--red:#C62828;--gold:#FFD54F;--cream:#faf6f0}
  *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;background:var(--cream);color:#222}
  .wrap{max-width:820px;margin:0 auto;padding:28px}
  header{display:flex;align-items:center;gap:14px;border-bottom:4px solid var(--gold);padding-bottom:14px;margin-bottom:6px}
  .logo{width:46px;height:46px;border-radius:12px;background:var(--red);color:#fff;font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center}
  h1{color:var(--red);font-size:22px;margin:0}
  .sub{color:#555;font-size:13px;margin:2px 0 0}
  .note{background:#fff;border:1px solid #eadfce;border-radius:10px;padding:12px 14px;margin:16px 0;font-size:13px;color:#444}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden}
  th,td{text-align:left;padding:9px 12px;border-bottom:1px solid #f0e8da;font-size:14px}
  th{background:var(--red);color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
  td.pin{font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.08em}
  td.grp{color:#9a7b00;font-size:12px}
  tr.sib td{background:#fffaf0}
  .foot{margin-top:14px;font-size:12px;color:#777}
  @media print{body{background:#fff}.wrap{padding:0}.note{break-inside:avoid}}
</style></head><body><div class="wrap">
<header><div class="logo">C</div><div><h1>${centerName} — Kiosk Sign-In PINs</h1>
<p class="sub">Christina's Child Care Center · Where Learning and Growth Become One · (763) 390-5870</p></div></header>
<div class="note"><b>${rows.length} children.</b> Each child has their own 4-digit PIN for kiosk check-in / check-out.
Rows shaded cream with a "↳" share a last name and are likely siblings — once you have guardian info you can put siblings on one shared PIN. Keep this sheet at the front desk; it is not stored in any code repository.</div>
<table><thead><tr><th>Child</th><th>PIN</th><th>Likely sibling group</th></tr></thead><tbody>
${tableRows}
</tbody></table>
<p class="foot">Generated for ${centerName}. Likely sibling groups detected: ${sibGroups.size}. Source of truth: the secure database. Reprint any time from Admin → PIN Roster.</p>
</div></body></html>`;
  const htmlPath = join(HOME, 'Desktop', 'crystal-kiosk-pins.html');
  writeFileSync(htmlPath, html);
  return { csvPath, htmlPath };
}

// ---- main ----
(async () => {
  console.log(`\nCrystal roster import  [${APPLY ? 'APPLY' : 'CHECK (dry run)'}]  db=${dbRef}`);
  const names = parseRoster(CSV_PATH);
  console.log(`Parsed ${names.length} children from ${CSV_PATH}`);

  const center = await resolveCenter();
  console.log(`Center: ${center.name}  ${center.id}`);

  // assignments: reuse if present (so test and prod get identical PINs/UUIDs), else generate
  let assign;
  if (existsSync(ASSIGN_PATH)) {
    assign = JSON.parse(readFileSync(ASSIGN_PATH, 'utf8'));
    console.log(`Reusing existing assignments (${assign.rows.length}) from ${ASSIGN_PATH}`);
    // add any new names not yet assigned
    const known = new Set(assign.rows.map((r) => r.name));
    const newNames = names.filter((n) => !known.has(n));
    if (newNames.length) {
      const used = new Set(assign.rows.map((r) => String(r.pin)));
      (await existingPins()).forEach((p) => used.add(p));
      assign.rows.push(...buildAssignments(newNames, used));
      writeFileSync(ASSIGN_PATH, JSON.stringify(assign, null, 2));
      console.log(`Added ${newNames.length} new assignments.`);
    }
  } else {
    const used = await existingPins();
    const rows = buildAssignments(names, used);
    assign = { center_name: center.name, generated_for: 'kiosk PIN sign-in', rows };
    writeFileSync(ASSIGN_PATH, JSON.stringify(assign, null, 2));
    console.log(`Generated ${rows.length} assignments -> ${ASSIGN_PATH}`);
  }

  const sibGroups = new Set(assign.rows.filter((r) => r.sibling_group).map((r) => r.sibling_group));
  console.log(`Likely sibling groups: ${sibGroups.size} (${Array.from(sibGroups).slice(0, 8).join(', ')}${sibGroups.size > 8 ? '…' : ''})`);
  console.log('Sample:', assign.rows.slice(0, 3).map((r) => `${r.name}=${r.pin}`).join('  '));

  const { csvPath, htmlPath } = writeDeliverables(assign.rows, center.name);
  console.log(`PIN list written: ${htmlPath}\n               + ${csvPath}`);

  if (CHECK) {
    console.log('\nCHECK only — no database writes. Re-run with --apply to insert.\n');
    return;
  }

  // APPLY: idempotent upserts on fixed UUIDs
  let famOk = 0,
    kidOk = 0;
  for (const r of assign.rows) {
    const { error: fe } = await supa.from('families').upsert(
      {
        id: r.family_id,
        email: r.email,
        password_hash: r.password_hash,
        pin: r.pin,
        status: 'active',
        center_id: center.id,
        preferred_language: 'en',
      },
      { onConflict: 'id' }
    );
    if (fe) {
      console.error('family upsert failed for', r.name, fe.message);
      continue;
    }
    famOk++;
    const { error: ce } = await supa
      .from('family_children')
      .upsert({ id: r.child_id, family_id: r.family_id, name: r.name, center_id: center.id }, { onConflict: 'id' });
    if (ce) {
      console.error('child upsert failed for', r.name, ce.message);
      continue;
    }
    kidOk++;
  }
  console.log(`\nAPPLIED: ${famOk} family stubs, ${kidOk} children into ${center.name}.`);

  // verify
  const { count } = await supa
    .from('family_children')
    .select('id', { count: 'exact', head: true })
    .eq('center_id', center.id);
  console.log(`Verify: family_children in ${center.name} = ${count}`);
  const sample = assign.rows[0];
  const { data: look } = await supa
    .from('families')
    .select('id, pin')
    .eq('pin', sample.pin)
    .eq('center_id', center.id)
    .eq('status', 'active')
    .limit(1);
  console.log(`Verify: kiosk lookup for PIN ${sample.pin} -> ${look && look.length ? 'found family ' + look[0].id : 'NOT FOUND'}`);
  console.log('');
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
