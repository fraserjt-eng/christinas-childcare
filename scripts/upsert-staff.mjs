#!/usr/bin/env node
// Generic staff upsert for the test DB (admins, owners, teachers). Args-driven
// so NO credentials live in this public repo; pass values on the command line.
//
// USAGE:
//   node scripts/upsert-staff.mjs --pin 2000 --email you@x.com --role owner \
//        --first J --last Fraser --center "Brooklyn Park" [--status active]
//
// Matches an existing employee by PIN (updates it) or inserts a new one. The
// center is resolved by name (prefix) or id. DB creds come from .env.local
// (test DB) unless SUPA_URL / SUPA_SERVICE_ROLE are set (prod at cutover).

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
  console.error('Missing DB creds (SUPA_URL + SUPA_SERVICE_ROLE or .env.local).');
  process.exit(1);
}
const supa = createClient(URL, KEY, { auth: { persistSession: false } });

const pin = arg('--pin');
const email = arg('--email').toLowerCase();
const role = arg('--role', 'admin');
const first = arg('--first', 'Admin');
const last = arg('--last', '');
const status = arg('--status', 'active');
const centerArg = arg('--center');
if (!pin || !email) {
  console.error('Required: --pin and --email');
  process.exit(1);
}

(async () => {
  let centerId = null;
  if (centerArg) {
    if (/^[0-9a-f-]{36}$/i.test(centerArg)) centerId = centerArg;
    else {
      const { data } = await supa.from('centers').select('id, name').ilike('name', `${centerArg}%`).limit(1);
      centerId = data?.[0]?.id || null;
      if (!centerId) console.warn(`Center "${centerArg}" not found; leaving center_id null.`);
    }
  }

  const fields = {
    pin,
    email,
    role,
    first_name: first,
    last_name: last,
    employment_status: status,
    center_id: centerId,
  };

  // Update existing (by pin) or insert.
  const { data: existing } = await supa.from('employees').select('id').eq('pin', pin).limit(1);
  if (existing && existing.length) {
    const { error } = await supa.from('employees').update(fields).eq('id', existing[0].id);
    if (error) {
      console.error('update failed:', error.message);
      process.exit(1);
    }
    console.log(`Updated employee pin=${pin} (${email}) role=${role} center=${centerArg || 'none'}`);
  } else {
    const { error } = await supa.from('employees').insert(fields);
    if (error) {
      console.error('insert failed:', error.message);
      process.exit(1);
    }
    console.log(`Inserted employee pin=${pin} (${email}) role=${role} center=${centerArg || 'none'}`);
  }

  // Verify it resolves the way the login route will (active + by pin).
  const { data: check } = await supa
    .from('employees')
    .select('first_name, last_name, role, pin, employment_status, center_id')
    .eq('pin', pin)
    .eq('employment_status', 'active')
    .maybeSingle();
  console.log('Login lookup ->', check ? `${check.first_name} ${check.last_name} (${check.role})` : 'NOT FOUND (check status)');
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
