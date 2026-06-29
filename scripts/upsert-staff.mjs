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

  // SEATBELT: the staff login looks employees up by PIN alone and is NOT
  // center-scoped, so employees.pin is one global namespace across centers. If
  // this PIN already belongs to a DIFFERENT person, reusing it would either
  // silently overwrite their account (hijacking their login/center/role) or
  // create a second active row the login resolves arbitrarily. Refuse it.
  const { data: pinRows } = await supa
    .from('employees')
    .select('id, email, first_name, last_name, role, employment_status, center_id')
    .eq('pin', pin);
  const pinOwner = (pinRows || []).find((r) => (r.email || '').toLowerCase() !== email);
  if (pinOwner) {
    console.error(
      `ABORT: PIN ${pin} already belongs to ${pinOwner.first_name} ${pinOwner.last_name} ` +
        `<${pinOwner.email}> (${pinOwner.employment_status}, role ${pinOwner.role || '?'}). ` +
        `Pick a different PIN for ${email}; reusing this one would hijack that login.`
    );
    process.exit(1);
  }

  // Upsert keyed on EMAIL (the stable identity), not on PIN, so changing a
  // person's PIN updates their row instead of creating a duplicate. The PIN is
  // already confirmed above to be free or already this same person's.
  const { data: byEmail } = await supa.from('employees').select('id').eq('email', email).limit(1);
  if (byEmail && byEmail.length) {
    const { error } = await supa.from('employees').update(fields).eq('id', byEmail[0].id);
    if (error) {
      console.error('update failed:', error.message);
      process.exit(1);
    }
    console.log(`Updated employee ${email} -> pin=${pin} role=${role} center=${centerArg || 'none'}`);
  } else {
    const { error } = await supa.from('employees').insert(fields);
    if (error) {
      console.error('insert failed:', error.message);
      process.exit(1);
    }
    console.log(`Inserted employee ${email} -> pin=${pin} role=${role} center=${centerArg || 'none'}`);
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
