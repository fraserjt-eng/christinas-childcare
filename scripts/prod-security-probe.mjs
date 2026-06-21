// Read-only prod security probe (SOC must-verify #6 + #7):
//  1. With the PUBLIC anon key, attempt to read PII tables -> MUST be denied/empty.
//  2. With the service role, confirm Crystal's center id is the canonical one.
// Never prints secrets. Usage: ANON=<anon key> node scripts/prod-security-probe.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync('.env.prod.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.SUPA_URL, svc = env.SUPA_SERVICE_ROLE, anon = process.env.ANON;
if (!url || !svc) { console.error('missing prod url/service'); process.exit(1); }

const CANON_CRYSTAL = 'b2000000-0000-0000-0000-000000000002';
const PII = ['families', 'family_parents', 'family_children', 'employees', 'attendance', 'child_daily_entries', 'parent_conversations', 'parent_messages', 'training_progress', 'authorizations', 'comms'];

console.log('=== #6 ANON read attempts on PII (expect 0 rows or error = LOCKED) ===');
if (!anon) {
  console.log('  (no ANON key provided; skipping anon probe)');
} else {
  const a = createClient(url, anon, { auth: { persistSession: false } });
  let leaked = 0;
  for (const t of PII) {
    const { data, error } = await a.from(t).select('*').limit(1);
    const n = data ? data.length : 0;
    const locked = !!error || n === 0;
    if (!locked) leaked++;
    console.log(`  ${t.padEnd(22)} ${locked ? 'LOCKED' : 'LEAK! rows=' + n}${error ? '  (' + error.code + ')' : ''}`);
  }
  console.log(leaked === 0 ? '  => ALL PII LOCKED to anon ✓' : `  => ${leaked} TABLE(S) LEAK TO ANON — must fix`);
}

console.log('\n=== #7 centers (service role) — confirm Crystal id ===');
const s = createClient(url, svc, { auth: { persistSession: false } });
const { data: centers } = await s.from('centers').select('id, name').limit(20);
for (const c of centers || []) {
  const tag = c.id === CANON_CRYSTAL ? '  <- canonical Crystal ✓' : /crystal/i.test(c.name) ? '  <- CRYSTAL but WRONG id!' : '';
  console.log(`  ${c.id}  ${c.name}${tag}`);
}
const crystal = (centers || []).find((c) => /crystal/i.test(c.name));
console.log(crystal && crystal.id === CANON_CRYSTAL ? '  => Crystal id correct ✓' : '  => Crystal id MISMATCH or missing');
