// Emit the family directory (both centers, with PINs) as CSV to stdout, for
// upload to Google Sheets. Usage: node scripts/gen-directory-csv.mjs [--prod]
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const PROD = process.argv.includes('--prod');
const env = {};
for (const l of readFileSync(PROD ? '.env.prod.local' : '.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const sb = createClient(PROD ? env.SUPA_URL : env.NEXT_PUBLIC_SUPABASE_URL, PROD ? env.SUPA_SERVICE_ROLE : env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const [{ data: centers }, { data: fams }, { data: kids }, { data: pars }] = await Promise.all([
  sb.from('centers').select('id, name').limit(50),
  sb.from('families').select('id, pin, email, status, center_id').limit(10000),
  sb.from('family_children').select('name, date_of_birth, classroom, family_id').limit(10000),
  sb.from('family_parents').select('family_id, name, phone, email, is_primary').limit(10000),
]);
const cn = (id) => (centers || []).find((c) => c.id === id)?.name || 'Unassigned';
const kidsBy = {}; for (const k of kids || []) (kidsBy[k.family_id] ||= []).push(k);
const parsBy = {}; for (const p of pars || []) (parsBy[p.family_id] ||= []).push(p);
const prim = (fid) => { const ps = parsBy[fid] || []; return ps.find((p) => p.is_primary) || ps[0] || {}; };
const q = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

const header = ['Center', 'PIN', 'Children', 'Parent / contact', 'Phone', 'Email', 'Room(s)', 'Date(s) of birth', 'Status'];
const lines = [header.join(',')];
const rows = (fams || []).filter((f) => (kidsBy[f.id] || []).length > 0)
  .sort((a, b) => cn(a.center_id).localeCompare(cn(b.center_id)) || (prim(a.id).name || '').localeCompare(prim(b.id).name || ''));
for (const f of rows) {
  const ks = kidsBy[f.id] || [];
  const p = prim(f.id);
  const stub = String(f.email || '').endsWith('@roster.local');
  lines.push([
    cn(f.center_id), f.pin || '', ks.map((k) => k.name).join('; '),
    p.name || (stub ? '(needs family info)' : ''), p.phone || '',
    stub ? '' : (f.email || ''),
    Array.from(new Set(ks.map((k) => k.classroom).filter(Boolean))).join(' / '),
    ks.map((k) => k.date_of_birth).filter(Boolean).join('; '), f.status || '',
  ].map(q).join(','));
}
process.stdout.write(lines.join('\n'));
