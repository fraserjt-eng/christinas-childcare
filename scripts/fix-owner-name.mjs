// Correct the owner's name: Christina Vega -> Christina Fraser. Targets whatever
// NEXT_PUBLIC_SUPABASE_URL in .env.local points at (test today; same script runs
// on prod at cutover by pointing at prod creds). Reports before/after; touches
// only the matched owner row.
//
// Usage: node scripts/fix-owner-name.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1] || '?';
const sb = createClient(url, key, { auth: { persistSession: false } });

const { data: before } = await sb
  .from('employees')
  .select('id, first_name, last_name, role')
  .eq('first_name', 'Christina')
  .eq('last_name', 'Vega');

if (!before || before.length === 0) {
  console.log(`DB ${ref}: no 'Christina Vega' row found (already correct or different name).`);
  const { data: chr } = await sb.from('employees').select('first_name,last_name,role').ilike('first_name', 'christina');
  console.log('Christina rows present:', JSON.stringify(chr));
  process.exit(0);
}

console.log(`DB ${ref}: updating ${before.length} row(s): Christina Vega -> Christina Fraser`);
const { error } = await sb
  .from('employees')
  .update({ last_name: 'Fraser' })
  .eq('first_name', 'Christina')
  .eq('last_name', 'Vega');

if (error) { console.error('update failed:', error.message); process.exit(1); }

const { data: after } = await sb
  .from('employees')
  .select('first_name, last_name, role')
  .eq('first_name', 'Christina');
console.log('after:', JSON.stringify(after));
