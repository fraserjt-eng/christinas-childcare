// Flyer template for the Crystal kiosk rollout. Pure rendering: no I/O except
// reading the logo once for embedding. One family -> one US-Letter portrait page.
// Brand: red #C62828, blue #2196F3, yellow #FFD54F, green #4CAF50; Nunito + Open Sans.
// Voice: warm, plain, zero em-dashes.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOGO_B64 = readFileSync(join(REPO, 'public', 'images', 'icon-512.png')).toString('base64');
const LOGO = `data:image/png;base64,${LOGO_B64}`;

const GO_LIVE = 'Monday, June 29';
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const HEAD_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Open+Sans:wght@400;600;700&display=swap');
@page { size: Letter; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Open Sans', sans-serif; color: #2b2b2b; }
.flyer { width: 8.5in; height: 11in; position: relative; overflow: hidden; background: #ffffff;
  display: flex; flex-direction: column; page-break-after: always; }
.flyer:last-child { page-break-after: auto; }

/* header band */
.hdr { background: #C62828; color: #fff; padding: 30px 48px 26px; display: flex; align-items: center; gap: 18px; position: relative; }
.hdr::after { content: ''; position: absolute; left: 0; right: 0; bottom: -10px; height: 10px;
  background: repeating-linear-gradient(90deg, #FFD54F 0 40px, #2196F3 40px 80px, #4CAF50 80px 120px); }
.hdr img { width: 66px; height: 66px; border-radius: 16px; background: #fff; padding: 4px; }
.hdr .name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 25px; line-height: 1.05; }
.hdr .tag { font-size: 12.5px; opacity: .9; margin-top: 3px; letter-spacing: .02em; }

.body { flex: 1; padding: 40px 48px 0; display: flex; flex-direction: column; }
.kicker { color: #2196F3; font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 13px;
  letter-spacing: .14em; text-transform: uppercase; }
.h1 { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 42px; line-height: 1.05; color: #C62828; margin-top: 6px; }
.greet { margin-top: 22px; }
.greet .fam { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 24px; color: #2b2b2b; }
.greet .kids { font-size: 16px; color: #6b6b6b; margin-top: 2px; }
.lede { font-size: 15.5px; line-height: 1.6; color: #444; margin-top: 16px; max-width: 6.4in; }

/* PIN hero */
.pin { margin: 26px 0 4px; border: 3px dashed #C62828; border-radius: 18px; background: #fff7f7;
  padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; }
.pin .lbl { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 15px; color: #C62828;
  text-transform: uppercase; letter-spacing: .08em; }
.pin .lbl small { display: block; font-weight: 600; font-size: 12px; color: #9a6a6a; letter-spacing: 0; text-transform: none; margin-top: 4px; }
.pin .digits { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 58px; letter-spacing: .14em; color: #C62828; }

/* steps */
.steps { display: flex; gap: 16px; margin-top: 30px; }
.step { flex: 1; background: #faf6f0; border-radius: 16px; padding: 20px 16px; text-align: center; }
.step .num { width: 34px; height: 34px; border-radius: 50%; background: #C62828; color: #fff;
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 17px; line-height: 34px; margin: 0 auto 12px; }
.step .ic { height: 40px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; }
.step .t { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 15px; color: #2b2b2b; }
.step .d { font-size: 12.5px; color: #6b6b6b; margin-top: 5px; line-height: 1.45; }

.reassure { margin-top: auto; margin-bottom: 18px; background: #eef7ef; border-left: 5px solid #4CAF50;
  border-radius: 10px; padding: 14px 18px; font-size: 13.5px; color: #2f5d36; line-height: 1.5; }
.reassure b { color: #2e7d32; }

.ftr { background: #2b2b2b; color: #d9d9d9; padding: 16px 48px; font-size: 12px; line-height: 1.55;
  display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.ftr .start { color: #fff; font-family: 'Nunito', sans-serif; font-weight: 800; }
.ftr .start span { color: #FFD54F; }
.ftr .contact { text-align: right; }
`;

const IC_TABLET = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="4" y="2.5" width="16" height="19" rx="2.5" stroke="#C62828" stroke-width="1.8"/><circle cx="12" cy="18.5" r="1.1" fill="#C62828"/><rect x="7" y="6" width="10" height="3" rx="1" fill="#FFD54F"/></svg>`;
const IC_KEYPAD = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><g fill="#2196F3">${[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<circle cx="${6 + c * 6}" cy="${5 + r * 6}" r="2"/>`)).join('')}</g></svg>`;
const IC_CHILD = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#4CAF50" stroke-width="1.8"/><path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" stroke="#4CAF50" stroke-width="1.8" stroke-linecap="round"/><path d="M15.5 11.5l1.6 1.6 3-3.2" stroke="#C62828" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function flyerSection(f) {
  const pin = esc(f.pin);
  const kids = esc(f.childFirsts);
  return `
  <section class="flyer">
    <div class="hdr">
      <img src="${LOGO}" alt="">
      <div>
        <div class="name">Christina's Child Care Center</div>
        <div class="tag">Where Learning and Growth Become One</div>
      </div>
    </div>

    <div class="body">
      <div class="kicker">A friendlier front desk</div>
      <div class="h1">Check-in just got easier.</div>

      <div class="greet">
        <div class="fam">${esc(f.familyLabel)}</div>
        ${kids ? `<div class="kids">For ${kids}</div>` : ''}
      </div>

      <p class="lede">Starting ${GO_LIVE}, our Crystal front desk has a new digital sign-in kiosk.
      Signing your child in and out now takes a few taps. Here is your family's private code.</p>

      <div class="pin">
        <div class="lbl">Your Family PIN<small>The same code for every child in your family</small></div>
        <div class="digits">${pin}</div>
      </div>

      <div class="steps">
        <div class="step"><div class="num">1</div><div class="ic">${IC_TABLET}</div><div class="t">Tap "Crystal"</div><div class="d">Choose the Crystal location on the kiosk screen.</div></div>
        <div class="step"><div class="num">2</div><div class="ic">${IC_KEYPAD}</div><div class="t">Enter your PIN</div><div class="d">Type your four digits. It opens to your children.</div></div>
        <div class="step"><div class="num">3</div><div class="ic">${IC_CHILD}</div><div class="t">Tap your child</div><div class="d">Tap a name to sign in, and again to sign out.</div></div>
      </div>

      <div class="reassure"><b>Your PIN is private.</b> Please keep it to the grown-ups who pick up.
      Staff will be at the desk all week to walk you through it, and nothing else about your day changes.</div>
    </div>

    <div class="ftr">
      <div>
        <div class="start">Kiosk goes live <span>${GO_LIVE}</span></div>
        <div>5510 W Broadway Ave, Crystal, MN &nbsp;·&nbsp; (763) 390-5870</div>
      </div>
      <div class="contact">Questions? Ask any staff member.<br>info@christinaschildcare.com</div>
    </div>
  </section>`;
}

export function renderDocument(families) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Crystal Kiosk Flyers</title><style>${HEAD_STYLES}</style></head><body>${families.map(flyerSection).join('\n')}</body></html>`;
}
