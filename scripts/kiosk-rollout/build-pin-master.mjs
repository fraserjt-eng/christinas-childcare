// Staff master PIN list -> one branded PDF. CONFIDENTIAL, desk use only.
//   node scripts/kiosk-rollout/build-pin-master.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './flyer-template.mjs';

const DIR = join(homedir(), 'Desktop', 'christina-kiosk-rollout');
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOGO = `data:image/png;base64,${readFileSync(join(REPO, 'public', 'images', 'icon-512.png')).toString('base64')}`;
const { families, generatedAt } = JSON.parse(readFileSync(join(DIR, 'crystal-families.json'), 'utf8'));

const dateStr = new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const childCount = families.reduce((n, f) => n + f.children.length, 0);

const rows = families.map((f, i) => `<tr class="${i % 2 ? 'alt' : ''}">
  <td class="pin">${esc(f.pin)}</td>
  <td class="fam">${esc(f.surname)}</td>
  <td>${esc(f.children.map((c) => c.name).join(', '))}</td>
  <td>${esc(f.classrooms.join(', '))}</td>
  <td>${esc(f.primaryName)}</td>
  <td class="contact">${esc(f.emailUsable ? f.email : (f.primaryPhone || 'no email on file'))}</td>
</tr>`).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Open+Sans:wght@400;600&display=swap');
@page { size: Letter portrait; margin: 0.5in 0.55in; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Open Sans', sans-serif; color: #2b2b2b; margin: 0; }
.top { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #C62828; padding-bottom: 10px; }
.top img { width: 42px; height: 42px; border-radius: 9px; }
.top .h { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 19px; color: #C62828; }
.top .s { font-size: 11.5px; color: #6b6b6b; margin-top: 2px; }
.conf { margin-left: auto; text-align: right; font-family: 'Nunito', sans-serif; font-weight: 800;
  font-size: 11px; color: #fff; background: #C62828; padding: 5px 10px; border-radius: 6px; letter-spacing: .04em; }
.meta { font-size: 11.5px; color: #6b6b6b; margin: 9px 0 12px; }
table { border-collapse: collapse; width: 100%; font-size: 11.5px; }
th { background: #2b2b2b; color: #fff; text-align: left; padding: 7px 8px; font-family: 'Nunito', sans-serif;
  font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
td { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
tr.alt td { background: #faf6f0; }
td.pin { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 14px; color: #C62828; letter-spacing: .1em; white-space: nowrap; }
td.fam { font-weight: 700; white-space: nowrap; }
td.contact { color: #555; word-break: break-word; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
.foot { margin-top: 12px; font-size: 10.5px; color: #9a6a6a; }
</style></head><body>
<div class="top"><img src="${LOGO}" alt="">
  <div><div class="h">Crystal Center — Family Kiosk PINs</div><div class="s">Where Learning and Growth Become One</div></div>
  <div class="conf">STAFF USE<br>CONFIDENTIAL</div>
</div>
<div class="meta">${families.length} families · ${childCount} children · one PIN per family (siblings share) · generated ${dateStr}. Keep at the front desk. Do not hand out.</div>
<table>
  <thead><tr><th>PIN</th><th>Family</th><th>Children</th><th>Room</th><th>Primary parent</th><th>Email / phone</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="foot">Help a parent: tap Crystal, enter their PIN above, tap the child to sign in or out. PIN attempts are limited to 8 per 15 minutes per device.</div>
</body></html>`;

const htmlPath = join(DIR, 'Crystal-Kiosk-PIN-Master-List.html');
const pdfPath = join(DIR, 'Crystal-Kiosk-PIN-Master-List.pdf');
writeFileSync(htmlPath, html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Master PIN list (${families.length} families) -> ${pdfPath}`);
