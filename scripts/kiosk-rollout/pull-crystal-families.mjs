// READ-ONLY. Pulls active Crystal families from prod for the kiosk rollout kit.
// Never prints the service key. Writes a local JSON (with PINs/emails) to the
// Desktop rollout folder, never into the repo.
//
//   node scripts/kiosk-rollout/pull-crystal-families.mjs
//
// Source of truth: families(center_id, status, email, pin, preferred_language)
// joined in JS to family_parents (primary) + family_children. We fetch broad and
// join in JS on purpose (PostgREST drops rows on some .eq/.in/.order combos).

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CRYSTAL_ID = 'b2000000-0000-0000-0000-000000000002'; // app's canonical Crystal center id
const OUT_DIR = join(homedir(), 'Desktop', 'christina-kiosk-rollout');
const OUT = join(OUT_DIR, 'crystal-families.json');

// --- prod creds (same pattern as scripts/prod-ping.mjs) ---
const env = {};
for (const line of readFileSync('.env.prod.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.SUPA_URL;
const key = env.SUPA_SERVICE_ROLE;
if (!url || !key || key.includes('PASTE_')) { console.error('Prod key not set in .env.prod.local'); process.exit(1); }
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1] || '?';
const sb = createClient(url, key, { auth: { persistSession: false } });

const firstName = (full) => String(full || '').trim().split(/\s+/)[0] || '';
const lastName = (full) => {
  const parts = String(full || '').trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : (parts[0] || '');
};
const emailUsable = (e) => Boolean(e) && e.includes('@') && !/@roster\.local$/i.test(e) && !/@example\./i.test(e);
const pinUsable = (p) => /^\d{4}$/.test(String(p || ''));
// "Mason", "Mason & Ava", "Mason, Ava & Noah"
function joinNames(names) {
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

const [{ data: fams, error: fe }, { data: parents, error: pe }, { data: kids, error: ke }] = await Promise.all([
  sb.from('families').select('id, email, pin, status, center_id, preferred_language').eq('center_id', CRYSTAL_ID).limit(5000),
  sb.from('family_parents').select('family_id, name, email, phone, is_primary').limit(5000),
  sb.from('family_children').select('family_id, name, classroom').limit(5000),
]);
if (fe || pe || ke) { console.error('Query error:', (fe || pe || ke).message); process.exit(1); }

const parentsByFam = new Map();
for (const p of parents ?? []) {
  if (!parentsByFam.has(p.family_id)) parentsByFam.set(p.family_id, []);
  parentsByFam.get(p.family_id).push(p);
}
const kidsByFam = new Map();
for (const k of kids ?? []) {
  if (!kidsByFam.has(k.family_id)) kidsByFam.set(k.family_id, []);
  kidsByFam.get(k.family_id).push(k);
}

const families = [];
for (const f of (fams ?? []).filter((x) => x.status === 'active')) {
  const fp = (parentsByFam.get(f.id) ?? []).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const primary = fp[0] || { name: '', phone: '', email: '' };
  const ch = (kidsByFam.get(f.id) ?? []).map((k) => ({ name: k.name, first: firstName(k.name), classroom: k.classroom || '' }))
    .sort((a, b) => a.first.localeCompare(b.first));
  const surname = lastName(ch[0]?.name) || lastName(primary.name) || 'Family';
  families.push({
    familyId: f.id,
    surname,
    familyLabel: `The ${surname} Family`,
    childFirsts: joinNames(ch.map((c) => c.first)),
    children: ch,
    classrooms: [...new Set(ch.map((c) => c.classroom).filter(Boolean))],
    primaryName: primary.name || '',
    primaryPhone: primary.phone || '',
    email: f.email || '',
    emailUsable: emailUsable(f.email),
    pin: f.pin || '',
    pinUsable: pinUsable(f.pin),
    preferredLanguage: f.preferred_language || 'en',
  });
}
families.sort((a, b) => a.surname.localeCompare(b.surname) || a.familyId.localeCompare(b.familyId));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), centerId: CRYSTAL_ID, families }, null, 2));

const childCount = families.reduce((n, f) => n + f.children.length, 0);
const noPin = families.filter((f) => !f.pinUsable);
const noEmail = families.filter((f) => !f.emailUsable);
console.log(`\nCrystal rollout pull   db=${ref}`);
console.log(`Active families: ${families.length}   Children: ${childCount}`);
console.log(`Held out of EMAIL batch (no usable email): ${noEmail.length}${noEmail.length ? '  -> ' + noEmail.map((f) => f.familyLabel).join(', ') : ''}`);
console.log(`Missing a valid PIN (flag for J): ${noPin.length}${noPin.length ? '  -> ' + noPin.map((f) => f.familyLabel).join(', ') : ''}`);
console.log('\nSample:');
for (const f of families.slice(0, 5)) {
  console.log(`  ${f.familyLabel} — ${f.childFirsts}  | pin ${f.pinUsable ? f.pin : 'MISSING'}  | ${f.emailUsable ? f.email : '(' + (f.email || 'no email') + ' — held)'}`);
}
console.log(`\nJSON -> ${OUT}\n`);
