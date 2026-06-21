// Rotate weak/guessable family PINs (1234, 0000, 1111, sequential, etc.) to
// strong random ones, collision-safe. Scoped to the Crystal center I imported
// (won't touch Brooklyn Park's established PINs; it only REPORTS any weak ones
// there for J to decide). Regenerates the combined PIN sheet after.
//
// SAFE: --check (default) lists weak PINs; --apply rotates them. --prod targets
// .env.prod.local. Usage: node scripts/rotate-weak-pins.mjs [--prod] [--apply]

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const PROD = process.argv.includes('--prod');
const CRYSTAL_ID = 'b2000000-0000-0000-0000-000000000002';

const env = {};
for (const l of readFileSync(PROD ? '.env.prod.local' : '.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL;
const key = PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || key.includes('PASTE_')) { console.error('missing creds'); process.exit(1); }
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1] || url;
const sb = createClient(url, key, { auth: { persistSession: false } });

// --- weak PIN detection (shared definition) ---
const ASC = '0123456789', DESC = '9876543210';
const COMMON = new Set(['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
  '1212', '2121', '1010', '0101', '2020', '1004', '2000', '2580', '1342', '6969', '4321', '1122', '1313', '1230', '0007', '1313', '1004', '1313']);
export function isWeakPin(p) {
  if (!/^\d{4}$/.test(p)) return true;
  if (/^(\d)\1{3}$/.test(p)) return true;            // all same digit
  if (ASC.includes(p) || DESC.includes(p)) return true; // sequential up/down
  if (COMMON.has(p)) return true;
  return false;
}

// existing pins across the whole DB (collision avoidance) + Crystal families
const { data: all } = await sb.from('families').select('id, pin, email, center_id').limit(10000);
const used = new Set((all || []).filter((f) => f.pin).map((f) => String(f.pin)));
const strongPin = () => { for (let i = 0; i < 100000; i++) { const p = String(randomInt(1000, 10000)); if (!isWeakPin(p) && !used.has(p)) { used.add(p); return p; } } throw new Error('no pin'); };

const crystalWeak = (all || []).filter((f) => f.center_id === CRYSTAL_ID && f.pin && isWeakPin(String(f.pin)));
const bpWeak = (all || []).filter((f) => f.center_id !== CRYSTAL_ID && f.pin && isWeakPin(String(f.pin)));

console.log(`\nWeak-PIN rotation  [${APPLY ? 'APPLY' : 'CHECK'}]  db=${ref}`);
console.log(`Crystal weak PINs: ${crystalWeak.length}`);
for (const f of crystalWeak) console.log(`  ${String(f.pin)}  ${f.email}`);
if (bpWeak.length) {
  console.log(`\nBrooklyn Park weak PINs (NOT auto-changed — your call): ${bpWeak.length}`);
  for (const f of bpWeak) console.log(`  ${String(f.pin)}  ${f.email}`);
}

if (!APPLY) { console.log('\nCHECK only. Re-run with --apply to rotate the Crystal weak PINs.\n'); process.exit(0); }

let rotated = 0;
for (const f of crystalWeak) {
  const np = strongPin();
  const { error } = await sb.from('families').update({ pin: np }).eq('id', f.id);
  if (!error) { rotated++; console.log(`  ${f.email}: ${f.pin} -> ${np}`); }
}
console.log(`\nROTATED ${rotated} Crystal PIN(s).`);

// regenerate the combined Crystal PIN sheet
const { data: fams } = await sb.from('families').select('id, pin').eq('center_id', CRYSTAL_ID).limit(5000);
const { data: kids } = await sb.from('family_children').select('name, family_id').eq('center_id', CRYSTAL_ID).limit(5000);
const { data: pars } = await sb.from('family_parents').select('family_id, name, is_primary').limit(10000);
const kidsBy = {}; for (const k of kids ?? []) (kidsBy[k.family_id] ||= []).push(k.name);
const parBy = {}; for (const pr of pars ?? []) if (pr.is_primary || !parBy[pr.family_id]) parBy[pr.family_id] = pr.name;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const rows = (fams ?? []).filter((f) => (kidsBy[f.id] || []).length).sort((a, b) => (parBy[a.id] || '').localeCompare(parBy[b.id] || ''))
  .map((f) => `<tr><td class=pin>${esc(f.pin)}</td><td>${esc(parBy[f.id] || '(needs family info)')}</td><td>${esc((kidsBy[f.id] || []).join(', '))}</td></tr>`).join('\n');
const html = `<!doctype html><meta charset=utf-8><title>Crystal Family PINs</title><style>body{font-family:-apple-system,sans-serif;max-width:780px;margin:30px auto;color:#1f2937}h1{color:#C62828}table{border-collapse:collapse;width:100%}th{background:#faf6f0;text-align:left;padding:8px;font-size:12px;text-transform:uppercase;color:#6b7280}td{padding:8px;border-bottom:1px solid #f0f0f0}.pin{font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:16px;letter-spacing:.08em}</style><h1>Crystal Center — All Family Kiosk PINs</h1><p>${(kids ?? []).length} children. One PIN per family. No weak/sequential PINs.</p><table><thead><tr><th>PIN</th><th>Parent / contact</th><th>Children</th></tr></thead><tbody>${rows}</tbody></table>`;
writeFileSync(join(homedir(), 'Desktop', 'crystal-all-pins.html'), html);
console.log('Regenerated PIN sheet -> ~/Desktop/crystal-all-pins.html\n');
