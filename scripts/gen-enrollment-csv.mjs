// Generate DCYF "Import Enrollment" cross-reference CSVs, one per center.
//
// The DCYF Import Enrollment template (Quick Start Guide, June 2026) is one row
// per child: child details + a primary guardian (G1, required) + optional
// trusted adults (G2, G3, ...) in 11-column prefixed sets. We populate what we
// have (child first/last/DOB, guardians' names/email/phone), and LEAVE BLANK the
// fields we don't store (child + adult street address, enrollment start/end).
// So this is a CROSS-REFERENCE / starting file, not a ready-to-upload one:
//   - fill the address + Child Start Date columns before a real upload
//   - siblings / children already enrolled may need the manual-add flow
//   - confirm the exact header text against the template downloaded from the Hub
//
// Usage: node scripts/gen-enrollment-csv.mjs   (reads .env.prod.local, writes to ~/Desktop)

import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.prod.local', 'utf8')
    .split('\n').filter((l) => l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sb = createClient(env.SUPA_URL, env.SUPA_SERVICE_ROLE, { auth: { persistSession: false } });

const CENTERS = [
  { id: '3104ae69-4f26-4c1e-a767-3ff45b534860', name: 'Brooklyn Park', slug: 'BrooklynPark' },
  { id: 'b2000000-0000-0000-0000-000000000002', name: 'Crystal', slug: 'Crystal' },
];
const G_SLOTS = 3; // G1 (required) + up to 2 more trusted adults

const split = (n) => { const p = (n || '').trim().split(/\s+/).filter(Boolean); return p.length <= 1 ? { f: p[0] || '', l: '' } : { f: p[0], l: p.slice(1).join(' ') }; };
const dob = (y) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((y || '').toString()); return m ? `${m[2]}/${m[3]}/${m[1]}` : ''; };
const cell = (v) => { const s = (v ?? '').toString(); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

function childHeader() {
  return [
    'Child First Name *REQUIRED*', 'Child Last Name *REQUIRED*', 'Child Date of Birth (MM/DD/YYYY) *REQUIRED*',
    'Child Start Date (MM/DD/YYYY) *REQUIRED*', 'Child End Date (MM/DD/YYYY)',
    'Child Street Address', 'Child Apartment Number', 'Child City', 'Child State', 'Child Zip Code',
  ];
}
function guardianHeader(n) {
  return [
    `G${n} First Name`, `G${n} Last Name`, `G${n} Relationship`, `G${n} Email Address`, `G${n} Phone Number`,
    `G${n} Allow Kiosk?`, `G${n} Adult Street Address`, `G${n} Adult Apartment Number`, `G${n} Adult City`, `G${n} Adult State`, `G${n} Adult Zip Code`,
  ];
}

(async () => {
  const { data: kids } = await sb.from('family_children').select('id, name, date_of_birth, family_id, center_id').limit(5000);
  const { data: parents } = await sb.from('family_parents').select('family_id, name, email, phone, relationship, is_primary').limit(5000);

  const byFamily = new Map();
  for (const p of parents || []) {
    if (!byFamily.has(p.family_id)) byFamily.set(p.family_id, []);
    byFamily.get(p.family_id).push(p);
  }
  for (const list of byFamily.values()) list.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  const header = [...childHeader(), ...Array.from({ length: G_SLOTS }, (_, i) => guardianHeader(i + 1)).flat()];

  for (const center of CENTERS) {
    const rows = [header.map(cell).join(',')];
    const centerKids = (kids || []).filter((k) => k.center_id === center.id)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    let missingDob = 0;
    for (const k of centerKids) {
      const { f, l } = split(k.name);
      if (!k.date_of_birth) missingDob++;
      const childCols = [f, l, dob(k.date_of_birth), '', '', '', '', '', '', '']; // start/end + address blank
      const guardians = (byFamily.get(k.family_id) || []).slice(0, G_SLOTS);
      const gCols = [];
      for (let i = 0; i < G_SLOTS; i++) {
        const g = guardians[i];
        if (g) {
          const gn = split(g.name);
          // DCYF relationship must be one of ParentGuardian / LegalGuardian /
          // AuthorizedAdult; our family_parents are the household guardians.
          gCols.push(gn.f, gn.l, 'ParentGuardian', g.email || '', g.phone || '', g.email ? 'Yes' : 'No', '', '', '', '', '');
        } else {
          gCols.push('', '', '', '', '', '', '', '', '', '', '');
        }
      }
      rows.push([...childCols, ...gCols].map(cell).join(','));
    }
    const csv = '﻿' + rows.join('\r\n');
    const out = join(homedir(), 'Desktop', `DCYF-Enrollment-${center.slug}.csv`);
    writeFileSync(out, csv);
    console.log(`${center.name}: ${centerKids.length} children -> ${out}  (missing DOB: ${missingDob})`);
  }
  console.log('\nNOTE: address + Child Start Date columns are blank (not stored) — fill before a real upload.');
  console.log('Siblings / already-enrolled children may need the manual Add flow. Confirm headers vs the Hub template.');
})();
