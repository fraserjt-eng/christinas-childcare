#!/usr/bin/env node
// READ-ONLY audit of staff PIN collisions. Changes nothing — only SELECTs.
//
// Why: the staff login (/api/auth/staff-pin) finds an employee by PIN alone and
// is NOT center-scoped, so employees.pin is one global pool across both centers.
// Two active employees sharing a PIN means a login can resolve to the wrong
// person/center. This lists any existing duplicates and (optionally) checks a
// set of PINs you plan to assign to Crystal staff against everyone already in.
//
// USAGE (test DB from .env.local):
//   node scripts/check-staff-pin-collisions.mjs
// Against PROD at cutover (creds via env, never in the repo):
//   SUPA_URL=... SUPA_SERVICE_ROLE=... node scripts/check-staff-pin-collisions.mjs
// Check specific planned PINs too:
//   ... node scripts/check-staff-pin-collisions.mjs --pins 2001,2002,2003

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (f, d = '') => {
  const i = process.argv.indexOf(f);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
function envLocal() {
  const p = join(REPO, '.env.local');
  const out = {};
  if (existsSync(p)) {
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}
const env = envLocal();
const URL = process.env.SUPA_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPA_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing DB creds (SUPA_URL + SUPA_SERVICE_ROLE, or .env.local).');
  process.exit(1);
}
const supa = createClient(URL, KEY, { auth: { persistSession: false } });
const plannedPins = arg('--pins')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

(async () => {
  const { data: emps, error } = await supa
    .from('employees')
    .select('first_name, last_name, role, pin, employment_status, center_id')
    .eq('employment_status', 'active');
  if (error) {
    console.error('query failed:', error.message);
    process.exit(1);
  }
  const active = (emps || []).filter((e) => e.pin && String(e.pin).trim());
  const byPin = new Map();
  for (const e of active) {
    const k = String(e.pin).trim();
    if (!byPin.has(k)) byPin.set(k, []);
    byPin.get(k).push(e);
  }

  console.log(`Active employees with a PIN: ${active.length}   Distinct PINs: ${byPin.size}`);

  // 1) Existing duplicates among active staff (the live risk).
  const dupes = [...byPin.entries()].filter(([, list]) => list.length > 1);
  if (dupes.length === 0) {
    console.log('\nOK — no two active employees share a PIN.');
  } else {
    console.log(`\nFOUND ${dupes.length} duplicate PIN(s) among active staff — RESOLVE before go-live:`);
    for (const [pin, list] of dupes) {
      console.log(`  PIN ${pin}:`);
      for (const e of list) console.log(`    - ${e.first_name} ${e.last_name} [${e.role || '?'}] center=${e.center_id || 'none'}`);
    }
  }

  // 2) Planned Crystal PINs vs everyone already in.
  if (plannedPins.length) {
    console.log(`\nChecking ${plannedPins.length} planned PIN(s) against active staff:`);
    let clash = 0;
    for (const p of plannedPins) {
      const owner = byPin.get(p);
      if (owner) {
        clash++;
        console.log(`  ✗ ${p} is TAKEN by ${owner.map((e) => `${e.first_name} ${e.last_name}`).join(', ')} — pick another.`);
      } else {
        console.log(`  ✓ ${p} is free.`);
      }
    }
    console.log(clash ? `\n${clash} planned PIN(s) collide. Fix those before seeding.` : '\nAll planned PINs are free.');
  }

  process.exit(dupes.length || plannedPins.some((p) => byPin.get(p)) ? 2 : 0);
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
