// Load a day (or several) of PAPER sign-in attendance into the attendance table,
// so it joins the kiosk data and flows into the DCYF export + the Hub dashboard.
//
// Input: a normalized CSV with this header (order-independent, case-insensitive):
//   center, child, date, check_in, check_out, signed_in_by, signed_out_by
//   - center: "BP"/"Brooklyn Park" or "Crystal"
//   - child:  the child's full name (matched to family_children at that center)
//   - date:   YYYY-MM-DD or MM/DD/YYYY
//   - check_in / check_out: a clock time like "7:30 AM" (center-local) or blank
//   - signed_in_by / signed_out_by: the adult's full name, or blank
//
// Times on paper are America/Chicago wall-clock; we convert to a UTC instant for
// storage (the app reads them back in center time). De-dupes against existing
// rows for the same child+date+center (a child already checked in via the kiosk
// is not duplicated; a missing check-out is filled).
//
// Usage:
//   node scripts/import-paper-attendance.mjs <file.csv> [--apply]
//   (no --apply = dry run: prints matches, unmatched names, and what would change)

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const FILE = process.argv[2];
const APPLY = process.argv.includes('--apply');
if (!FILE) { console.error('usage: node scripts/import-paper-attendance.mjs <file.csv> [--apply]'); process.exit(1); }

const env = Object.fromEntries(
  readFileSync('.env.prod.local', 'utf8').split('\n').filter((l) => l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sb = createClient(env.SUPA_URL, env.SUPA_SERVICE_ROLE, { auth: { persistSession: false } });

const CENTERS = {
  bp: '3104ae69-4f26-4c1e-a767-3ff45b534860', 'brooklyn park': '3104ae69-4f26-4c1e-a767-3ff45b534860',
  brooklynpark: '3104ae69-4f26-4c1e-a767-3ff45b534860', crystal: 'b2000000-0000-0000-0000-000000000002',
};

const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function toYmd(d) {
  const s = (d || '').toString().trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s); if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  return '';
}
// "7:30 AM" -> [h24, min]; accepts "7:30", "07:30 am", "3:05 PM"
function parseClock(t) {
  const s = (t || '').toString().trim(); if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(s); if (!m) return null;
  let h = +m[1]; const mi = +m[2]; const ap = (m[3] || '').toLowerCase();
  if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
  return [h, mi];
}
// minutes that America/Chicago is offset from UTC at the given instant.
function centralOffsetMin(instant) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(instant).reduce((a, x) => { a[x.type] = x.value; return a; }, {});
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return (asUtc - instant.getTime()) / 60000; // e.g. -300 for CDT
}
// A center-local wall time (YMD + clock) -> a UTC ISO string.
function centralWallToUtcIso(ymd, clock) {
  const hm = parseClock(clock); if (!ymd || !hm) return null;
  const [Y, M, D] = ymd.split('-').map(Number);
  const tentative = Date.UTC(Y, M - 1, D, hm[0], hm[1]);
  const off = centralOffsetMin(new Date(tentative)); // wall-as-UTC is close enough for the offset
  return new Date(tentative - off * 60000).toISOString();
}

function parseCsv(text) {
  // simple RFC-4180-ish parser (handles quotes)
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c === '\r') { /* skip */ }
    else cur += c;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

(async () => {
  const raw = parseCsv(readFileSync(FILE, 'utf8').replace(/^﻿/, ''));
  const header = raw[0].map((h) => norm(h));
  const idx = (name) => header.indexOf(name);
  const col = { center: idx('center'), child: idx('child'), date: idx('date'), ci: idx('check in'), co: idx('check out'), si: idx('signed in by'), so: idx('signed out by') };
  for (const k of ['center', 'child', 'date', 'ci']) if (col[k] < 0) { console.error(`missing required column for "${k}". header seen:`, header); process.exit(1); }

  // roster, per center, by normalized name
  const { data: kids } = await sb.from('family_children').select('id, name, center_id').limit(5000);
  const byCenterName = new Map(); // `${center}|${normname}` -> [ids]
  for (const k of kids || []) {
    const key = `${k.center_id}|${norm(k.name)}`;
    if (!byCenterName.has(key)) byCenterName.set(key, []);
    byCenterName.get(key).push({ id: k.id, name: k.name });
  }

  const plan = [], unmatched = [], ambiguous = [];
  for (const r of raw.slice(1)) {
    const centerId = CENTERS[norm(r[col.center]).replace(/\s+/g, '')] || CENTERS[norm(r[col.center])];
    const ymd = toYmd(r[col.date]);
    const childName = (r[col.child] || '').trim();
    if (!centerId || !ymd || !childName) { unmatched.push({ row: r, why: 'missing center/date/child' }); continue; }
    const hits = byCenterName.get(`${centerId}|${norm(childName)}`) || [];
    if (hits.length === 0) { unmatched.push({ childName, center: r[col.center], why: 'no roster match' }); continue; }
    if (hits.length > 1) { ambiguous.push({ childName, n: hits.length }); continue; }
    const checkIn = centralWallToUtcIso(ymd, r[col.ci]);
    const checkOut = col.co >= 0 ? centralWallToUtcIso(ymd, r[col.co]) : null;
    plan.push({
      child_id: hits[0].id, child_name: hits[0].name, center_id: centerId, date: ymd,
      check_in: checkIn, check_out: checkOut,
      signed_in_by_name: col.si >= 0 ? (r[col.si] || '').trim() || null : null,
      signed_out_by_name: col.so >= 0 ? (r[col.so] || '').trim() || null : null,
    });
  }

  // de-dupe against existing rows for the dates in the plan
  const dates = Array.from(new Set(plan.map((p) => p.date)));
  const { data: existing } = await sb.from('attendance').select('id, child_id, date, center_id, check_in, check_out').in('date', dates.length ? dates : ['1970-01-01']).limit(20000);
  const exKey = new Map();
  for (const e of existing || []) exKey.set(`${e.center_id}|${e.child_id}|${e.date}`, e);

  let inserts = 0, updates = 0, skips = 0;
  for (const p of plan) {
    const ex = exKey.get(`${p.center_id}|${p.child_id}|${p.date}`);
    if (!ex) { p._op = 'insert'; inserts++; }
    else if (!ex.check_out && p.check_out) { p._op = 'update'; p._id = ex.id; updates++; } // fill a missing check-out
    else { p._op = 'skip'; skips++; }
  }

  console.log(`parsed ${plan.length} matched rows | inserts ${inserts}, updates ${updates}, skips(dupe) ${skips}`);
  if (unmatched.length) { console.log(`\nUNMATCHED (${unmatched.length}) — fix names/center, will NOT import:`); unmatched.slice(0, 40).forEach((u) => console.log('  -', u.childName || JSON.stringify(u.row), `(${u.why})`)); }
  if (ambiguous.length) { console.log(`\nAMBIGUOUS (${ambiguous.length}) — multiple roster matches, resolve manually:`); ambiguous.forEach((a) => console.log('  -', a.childName, `x${a.n}`)); }

  if (!APPLY) { console.log('\nDRY RUN. Re-run with --apply to write.'); return; }

  for (const p of plan) {
    if (p._op === 'insert') {
      await sb.from('attendance').insert({ child_id: p.child_id, child_name: p.child_name, center_id: p.center_id, date: p.date, check_in: p.check_in, check_out: p.check_out, signed_in_by_name: p.signed_in_by_name, signed_out_by_name: p.signed_out_by_name, notes: 'paper-import' });
    } else if (p._op === 'update') {
      await sb.from('attendance').update({ check_out: p.check_out, signed_out_by_name: p.signed_out_by_name }).eq('id', p._id);
    }
  }
  console.log(`\nAPPLIED: ${inserts} inserted, ${updates} updated.`);
})();
