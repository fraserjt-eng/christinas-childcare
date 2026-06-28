// General "we're going digital" poster for the Crystal entrance, doors, and walls.
// No PINs, no names. US-Letter portrait, vector text, so a print shop can blow it
// up to 11x17 or larger with no quality loss.
//   node scripts/kiosk-rollout/build-poster.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(homedir(), 'Desktop', 'christina-kiosk-rollout');
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOGO = `data:image/png;base64,${readFileSync(join(REPO, 'public', 'images', 'icon-512.png')).toString('base64')}`;
const GO_LIVE = 'Monday, June 29';

const IC_TABLET = `<svg width="58" height="58" viewBox="0 0 24 24" fill="none"><rect x="4" y="2.5" width="16" height="19" rx="2.5" stroke="#C62828" stroke-width="1.6"/><circle cx="12" cy="18.5" r="1" fill="#C62828"/><rect x="7" y="6" width="10" height="3" rx="1" fill="#FFD54F"/></svg>`;
const IC_KEYPAD = `<svg width="58" height="58" viewBox="0 0 24 24" fill="none"><g fill="#2196F3">${[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<circle cx="${6 + c * 6}" cy="${5 + r * 6}" r="1.9"/>`)).join('')}</g></svg>`;
const IC_CHILD = `<svg width="58" height="58" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#4CAF50" stroke-width="1.6"/><path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" stroke="#4CAF50" stroke-width="1.6" stroke-linecap="round"/><path d="M15.5 11.5l1.6 1.6 3-3.2" stroke="#C62828" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Open+Sans:wght@400;600;700&display=swap');
@page { size: Letter portrait; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Open Sans', sans-serif; color: #2b2b2b; }
.poster { width: 8.5in; height: 11in; display: flex; flex-direction: column; overflow: hidden; }
.hdr { background: #C62828; color: #fff; padding: 30px 54px; display: flex; align-items: center; gap: 18px; position: relative; }
.hdr::after { content: ''; position: absolute; left: 0; right: 0; bottom: -12px; height: 12px;
  background: repeating-linear-gradient(90deg, #FFD54F 0 48px, #2196F3 48px 96px, #4CAF50 96px 144px); }
.hdr img { width: 70px; height: 70px; border-radius: 16px; background: #fff; padding: 5px; }
.hdr .name { font-family: 'Nunito'; font-weight: 900; font-size: 26px; line-height: 1.05; }
.hdr .tag { font-size: 13px; opacity: .9; margin-top: 3px; }
.main { flex: 1; padding: 46px 54px 0; display: flex; flex-direction: column; align-items: center; text-align: center; }
.eyebrow { color: #2196F3; font-family: 'Nunito'; font-weight: 800; font-size: 17px; letter-spacing: .16em; text-transform: uppercase; }
.h1 { font-family: 'Nunito'; font-weight: 900; font-size: 70px; line-height: .98; color: #C62828; margin-top: 12px; }
.sub { font-size: 22px; color: #444; margin-top: 18px; max-width: 6.6in; line-height: 1.4; }
.steps { display: flex; gap: 20px; margin-top: 44px; width: 100%; }
.step { flex: 1; background: #faf6f0; border-radius: 18px; padding: 26px 14px; }
.step .num { width: 44px; height: 44px; border-radius: 50%; background: #C62828; color: #fff;
  font-family: 'Nunito'; font-weight: 900; font-size: 22px; line-height: 44px; margin: 0 auto 14px; }
.step .ic { height: 58px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; }
.step .t { font-family: 'Nunito'; font-weight: 800; font-size: 19px; }
.step .d { font-size: 14px; color: #6b6b6b; margin-top: 6px; line-height: 1.4; }
.pincall { margin-top: 36px; background: #FFD54F; border-radius: 16px; padding: 20px 30px; }
.pincall b { font-family: 'Nunito'; font-weight: 900; font-size: 24px; color: #7a5a00; }
.pincall span { display: block; font-size: 16px; color: #6b5200; margin-top: 4px; }
.ftr { margin-top: auto; background: #2b2b2b; color: #eee; padding: 18px 54px; display: flex;
  justify-content: space-between; align-items: center; font-size: 14px; }
.ftr .live { font-family: 'Nunito'; font-weight: 800; }
.ftr .live span { color: #FFD54F; }
</style></head><body>
<div class="poster">
  <div class="hdr"><img src="${LOGO}" alt="">
    <div><div class="name">Christina's Child Care Center</div><div class="tag">Where Learning and Growth Become One</div></div>
  </div>
  <div class="main">
    <div class="eyebrow">Starting ${GO_LIVE}</div>
    <div class="h1">Check-in is<br>going digital.</div>
    <div class="sub">Our front desk now has a sign-in kiosk. Signing your child in and out takes a few quick taps.</div>
    <div class="steps">
      <div class="step"><div class="num">1</div><div class="ic">${IC_TABLET}</div><div class="t">Tap "Crystal"</div><div class="d">Choose Crystal on the screen.</div></div>
      <div class="step"><div class="num">2</div><div class="ic">${IC_KEYPAD}</div><div class="t">Enter your PIN</div><div class="d">Type your family's four digits.</div></div>
      <div class="step"><div class="num">3</div><div class="ic">${IC_CHILD}</div><div class="t">Tap your child</div><div class="d">Sign in, and tap again to sign out.</div></div>
    </div>
    <div class="pincall"><b>Need your family PIN?</b><span>Ask any staff member. We are here to help all week.</span></div>
  </div>
  <div class="ftr">
    <div class="live">Kiosk goes live <span>${GO_LIVE}</span></div>
    <div>5510 W Broadway Ave, Crystal, MN &nbsp;·&nbsp; (763) 390-5870</div>
  </div>
</div>
</body></html>`;

const htmlPath = join(DIR, 'Crystal-Kiosk-Poster.html');
const pdfPath = join(DIR, 'Crystal-Kiosk-Poster.pdf');
writeFileSync(htmlPath, html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Poster -> ${pdfPath}`);
