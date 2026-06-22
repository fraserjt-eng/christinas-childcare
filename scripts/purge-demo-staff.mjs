// Remove leftover/demo staff from the live site. Demo marker: inactive employees
// on the placeholder domain @christinas-childcare.com with sequential seed PINs.
// Also sets Josh Fraser's role to 'admin' (full access, not owner) per J.
// Deletes dependent rows first so FK constraints can't block.
//
// SAFE: --check (default) lists; --apply deletes. --prod targets .env.prod.local.
// Usage: node scripts/purge-demo-staff.mjs [--prod] [--apply]

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const PROD = process.argv.includes('--prod');
const env = {};
for (const l of readFileSync(PROD ? '.env.prod.local' : '.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL, PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ref = ((PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL).match(/https:\/\/([a-z0-9]+)\./) || [])[1];

const { data: emps } = await sb.from('employees').select('id, first_name, last_name, role, pin, email, employment_status').limit(500);
// demo marker: placeholder domain + inactive
const isDemo = (e) => /@christinas-childcare\.com$/i.test(e.email || '') && (e.employment_status || '') === 'inactive';
const demo = (emps || []).filter(isDemo);
const keep = (emps || []).filter((e) => !isDemo(e));

console.log(`\nDemo-staff purge  [${APPLY ? 'APPLY' : 'CHECK'}]  db=${ref}`);
console.log(`\nTO DELETE (${demo.length}):`);
for (const e of demo) console.log(`  ${(`${e.first_name} ${e.last_name}`).padEnd(22)} ${String(e.role).padEnd(8)} pin ${e.pin || '—'}  ${e.email}  [${e.employment_status}]`);
console.log(`\nKEEP (${keep.length}):`);
for (const e of keep) console.log(`  ${(`${e.first_name} ${e.last_name}`).padEnd(22)} ${String(e.role).padEnd(8)} pin ${e.pin || '—'}  ${e.email || '(no email)'}  [${e.employment_status}]`);

if (!APPLY) { console.log('\nCHECK only — nothing deleted. Re-run with --apply.\n'); process.exit(0); }

const ids = demo.map((e) => e.id);
// clear dependents first (these seed staff likely have none, but be safe)
for (const t of ['time_entries', 'staff_schedules', 'pay_stubs', 'training_records', 'hr_documents', 'onboarding']) {
  const { error } = await sb.from(t).delete().in('employee_id', ids);
  if (error) console.log(`  (note: ${t} cleanup: ${error.message})`);
}
for (const t of ['training_progress', 'training_knowledge_checks', 'training_gate_assessments', 'training_gate_overrides']) {
  const { error } = await sb.from(t).delete().in('user_id', ids);
  if (error) console.log(`  (note: ${t} cleanup: ${error.message})`);
}
// Nullify "actor" references so deleting the staff keeps the underlying records.
for (const [t, col] of [['food_counts', 'recorded_by'], ['classrooms', 'lead_teacher_id'], ['daily_photos', 'uploaded_by'], ['child_daily_entries', 'recorded_by'], ['child_daily_entries', 'created_by'], ['incident_reports', 'reported_by'], ['communications', 'created_by']]) {
  const { error } = await sb.from(t).update({ [col]: null }).in(col, ids);
  if (error && !/does not exist/i.test(error.message)) console.log(`  (note: nullify ${t}.${col}: ${error.message})`);
}
let de = (await sb.from('employees').delete().in('id', ids)).error;
// If another FK still blocks, surface which one so it can be added above.
if (de) { console.error('employee delete failed:', de.message); process.exit(1); }
console.log(`\nDELETED ${ids.length} demo staff.`);

// Josh Fraser -> admin (full access, not owner)
const { error: je } = await sb.from('employees').update({ role: 'admin' }).ilike('email', 'fraserjt@gmail.com');
if (!je) console.log('Set Josh Fraser role -> admin.');

const { data: after } = await sb.from('employees').select('first_name,last_name,role,employment_status').order('role');
console.log(`\nRemaining staff (${(after || []).length}):`);
for (const e of after || []) console.log(`  ${(`${e.first_name} ${e.last_name}`).padEnd(22)} ${e.role}  [${e.employment_status}]`);
