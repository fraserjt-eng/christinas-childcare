// Add the real owners that are missing from the staff table, each with a strong
// (non-weak) collision-safe kiosk PIN, role=owner, Brooklyn Park center, active.
// Email left blank for J to fill. Idempotent (deterministic id by name).
// Prints copy-paste rows matching the Staff-tab column layout.
//
// SAFE: --check (default) shows the plan; --apply writes. --prod -> .env.prod.local.
// Usage: node scripts/add-owners.mjs [--prod] [--apply]

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { createHash, randomInt } from 'node:crypto';

const APPLY = process.argv.includes('--apply');
const PROD = process.argv.includes('--prod');
const BP = '3104ae69-4f26-4c1e-a767-3ff45b534860';
const OWNERS = ['Ophelia Zeogar', 'Stephan Zeogar', 'Garjuhan Zeogar']; // Christina Fraser already present

const env = {};
for (const l of readFileSync(PROD ? '.env.prod.local' : '.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL, PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ref = ((PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL).match(/https:\/\/([a-z0-9]+)\./) || [])[1];
const det = (s) => { const h = createHash('sha256').update(s).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`; };
const ASC = '0123456789', DESC = '9876543210';
const WEAK = new Set(['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1212', '4321', '2580', '6969', '1004', '2000']);
const isWeak = (p) => !/^\d{4}$/.test(p) || /^(\d)\1{3}$/.test(p) || ASC.includes(p) || DESC.includes(p) || WEAK.has(p);

// collision set: every existing pin (families + employees)
const [{ data: fams }, { data: emps }] = await Promise.all([
  sb.from('families').select('pin').not('pin', 'is', null).limit(10000),
  sb.from('employees').select('id, first_name, last_name, pin, email').limit(500),
]);
const used = new Set([...(fams || []), ...(emps || [])].map((r) => String(r.pin)).filter(Boolean));
const existingByName = new Map((emps || []).map((e) => [`${e.first_name} ${e.last_name}`.toLowerCase().trim(), e]));
const strongPin = () => { for (let i = 0; i < 100000; i++) { const p = String(randomInt(1000, 10000)); if (!isWeak(p) && !used.has(p)) { used.add(p); return p; } } throw new Error('no pin'); };

const plan = OWNERS.map((name) => {
  const existing = existingByName.get(name.toLowerCase());
  const [first, ...rest] = name.split(' ');
  return { name, first, last: rest.join(' '), id: existing?.id || det('owner:' + name), pin: existing?.pin || strongPin(), existed: !!existing };
});

console.log(`\nAdd owners  [${APPLY ? 'APPLY' : 'CHECK'}]  db=${ref}\n`);
console.log('Copy-paste rows (Name,Role,Center,PIN,Login (email),Status) — matches Christina Fraser,owner,Brooklyn Park,0509,c.fraser@chriskids2.org,active');
console.log('---');
for (const p of plan) console.log(`${p.name},owner,Brooklyn Park,${p.pin},,active${p.existed ? '   (already in system)' : ''}`);
console.log('---');

if (!APPLY) { console.log('\nCHECK only — nothing written. Re-run with --apply.\n'); process.exit(0); }

let n = 0;
for (const p of plan) {
  const { error } = await sb.from('employees').upsert(
    { id: p.id, first_name: p.first, last_name: p.last, role: 'owner', center_id: BP, pin: p.pin, employment_status: 'active' },
    { onConflict: 'id' }
  );
  if (error) { console.error(`add ${p.name} failed:`, error.message); continue; }
  n++;
}
console.log(`\nADDED/UPDATED ${n} owner(s).`);
const { data: owners } = await sb.from('employees').select('first_name,last_name,role,pin,email,employment_status').eq('role', 'owner');
console.log('Owners now:');
for (const o of owners || []) console.log(`  ${o.first_name} ${o.last_name}  pin ${o.pin}  ${o.email || '(no email)'}  [${o.employment_status}]`);
