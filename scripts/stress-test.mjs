// Load/stress test against a preview deploy (production build, test DB).
// Simulates concurrent distinct users across: home, kiosk, admin-login pages,
// admin sign-in (staff-pin) + dashboard read. Each virtual admin uses a unique
// X-Forwarded-For so we exercise N distinct users (not one rate-limited IP).
// Usage: node scripts/stress-test.mjs <baseUrl> <concurrency> <totalFlows>

const BASE = process.argv[2];
const CONC = parseInt(process.argv[3] || '50', 10);
const TOTAL = parseInt(process.argv[4] || '600', 10);
if (!BASE) { console.error('need base url'); process.exit(1); }

const m = {};
function rec(key, status, ms, errored) {
  const e = m[key] || (m[key] = { n: 0, ok: 0, c429: 0, c4xx: 0, c5xx: 0, err: 0, lat: [] });
  e.n++; e.lat.push(ms);
  if (errored) e.err++;
  else if (status >= 200 && status < 400) e.ok++;
  else if (status === 429) e.c429++;
  else if (status >= 500) e.c5xx++;
  else if (status >= 400) e.c4xx++;
}
let uid = 0;
const xff = () => { uid++; return `10.${(uid >> 16) & 255}.${(uid >> 8) & 255}.${uid & 255}`; };

async function timed(key, fn) {
  const t0 = performance.now();
  try { const r = await fn(); rec(key, r.status, performance.now() - t0, false); return r; }
  catch { rec(key, 0, performance.now() - t0, true); return null; }
}

async function visitor() { await timed('GET /', () => fetch(BASE + '/', { redirect: 'manual' })); }
async function kioskUser() { await timed('GET /kiosk', () => fetch(BASE + '/kiosk', { redirect: 'manual' })); }
async function loginPage() { await timed('GET /admin-login', () => fetch(BASE + '/admin-login', { redirect: 'manual' })); }
async function adminUser() {
  const ip = xff();
  const r = await timed('POST staff-pin', () => fetch(BASE + '/api/auth/staff-pin', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, body: JSON.stringify({ pin: '2000' }),
  }));
  if (r && r.ok) {
    const setc = r.headers.get('set-cookie');
    if (setc) {
      const cookie = setc.split(',').map((c) => c.split(';')[0]).join('; ');
      const today = new Date().toISOString().slice(0, 10);
      await timed('GET summary', () => fetch(BASE + `/api/admin/attendance/summary?from=${today}&to=${today}&bucket=day`, { headers: { Cookie: cookie } }));
    }
  }
}
const flows = [visitor, kioskUser, loginPage, adminUser];

let idx = 0, done = 0;
async function worker() { while (idx < TOTAL) { const i = idx++; await flows[i % flows.length](); done++; } }

const t0 = performance.now();
await Promise.all(Array.from({ length: CONC }, worker));
const secs = (performance.now() - t0) / 1000;

const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(s.length * p))]) : 0; };
const totalReq = Object.values(m).reduce((a, e) => a + e.n, 0);
console.log(`\nSTRESS  ${BASE}`);
console.log(`concurrency=${CONC}  flows=${done}  requests=${totalReq}  wall=${secs.toFixed(1)}s  throughput=${(totalReq / secs).toFixed(0)} req/s\n`);
console.log('endpoint                 n    ok   429   4xx  5xx  err    p50    p95    max');
for (const [k, e] of Object.entries(m)) {
  console.log(
    k.padEnd(24) + String(e.n).padStart(4) + String(e.ok).padStart(6) + String(e.c429).padStart(5) +
    String(e.c4xx).padStart(6) + String(e.c5xx).padStart(5) + String(e.err).padStart(5) +
    (pct(e.lat, 0.5) + 'ms').padStart(8) + (pct(e.lat, 0.95) + 'ms').padStart(7) + (Math.round(Math.max(...e.lat)) + 'ms').padStart(8)
  );
}
