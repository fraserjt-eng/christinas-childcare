// Read-only connectivity check against prod using .env.prod.local. Never prints
// the key. Confirms the key works AND that we're pointed at the real prod DB.
// Usage: node scripts/prod-ping.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('.env.prod.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.SUPA_URL;
const key = env.SUPA_SERVICE_ROLE;
if (!url || !key || key.includes('PASTE_')) {
  console.error('Prod key not set in .env.prod.local');
  process.exit(1);
}
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1] || '?';
const sb = createClient(url, key, { auth: { persistSession: false } });

async function count(t) {
  const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
  return error ? 'ERR:' + error.message : count;
}

console.log('connected to ref:', ref);
for (const t of ['centers', 'employees', 'attendance', 'families', 'family_children']) {
  console.log(`  ${t}:`, await count(t));
}
