// Per-family kiosk announcement emails. PREPARE BY DEFAULT (dry run): writes an
// HTML preview per family and sends NOTHING. Same Resend from-address as
// src/lib/email.ts. Families with no usable email are skipped and listed.
//
//   node scripts/kiosk-rollout/send-crystal-kiosk-emails.mjs                 dry run -> emails/*.html previews
//   node scripts/kiosk-rollout/send-crystal-kiosk-emails.mjs --test <addr>   send ONE (first family's content) to <addr>
//   node scripts/kiosk-rollout/send-crystal-kiosk-emails.mjs --send          send the real batch (needs RESEND_API_KEY + verified domain)
//
// RESEND_API_KEY is read from the environment or .env.local / .env.prod.local.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { esc } from './flyer-template.mjs';

const ARGV = process.argv.slice(2);
const SEND = ARGV.includes('--send');
const TEST = ARGV.includes('--test') ? ARGV[ARGV.indexOf('--test') + 1] : null;
const DIR = join(homedir(), 'Desktop', 'christina-kiosk-rollout');
const EMAILS = join(DIR, 'emails');
const FROM = "Christina's Child Care Center <notifications@christinaschildcare.com>";
const GO_LIVE = 'Monday, June 29';
const SUBJECT = 'Your family check-in PIN for our new front-desk kiosk';
const { families } = JSON.parse(readFileSync(join(DIR, 'crystal-families.json'), 'utf8'));

function readEnv(file) {
  if (!existsSync(file)) return {};
  const e = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return e;
}
const RESEND_API_KEY = process.env.RESEND_API_KEY || readEnv('.env.local').RESEND_API_KEY || readEnv('.env.prod.local').RESEND_API_KEY || '';

// Inline-styled, mobile-friendly email. Same copy + voice as the flyer.
function emailHTML(f) {
  const kids = esc(f.childFirsts);
  return `<!doctype html><html><body style="margin:0;background:#f4f1ec;font-family:'Helvetica Neue',Arial,sans-serif;color:#2b2b2b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.06)">
  <tr><td style="background:#C62828;padding:24px 28px;color:#fff">
    <div style="font-size:20px;font-weight:800">Christina's Child Care Center</div>
    <div style="font-size:12px;opacity:.9;margin-top:3px">Where Learning and Growth Become One</div>
  </td></tr>
  <tr><td style="height:6px;background:#FFD54F;font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="padding:28px 28px 8px">
    <div style="color:#2196F3;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">A friendlier front desk</div>
    <h1 style="margin:6px 0 0;font-size:27px;color:#C62828;line-height:1.15">Check-in just got easier.</h1>
    <p style="font-size:15px;line-height:1.6;color:#444;margin:18px 0 0">Hi ${esc(f.familyLabel)},</p>
    <p style="font-size:15px;line-height:1.6;color:#444;margin:10px 0 0">Starting <b>${GO_LIVE}</b>, our Crystal front desk has a new digital sign-in kiosk. Signing ${kids ? esc(kids) : 'your child'} in and out now takes a few taps. Here is your family's private code.</p>
  </td></tr>
  <tr><td style="padding:18px 28px 0">
    <table role="presentation" width="100%" style="border:3px dashed #C62828;border-radius:14px;background:#fff7f7"><tr>
      <td style="padding:18px 22px;font-size:13px;font-weight:800;color:#C62828;text-transform:uppercase;letter-spacing:.06em">Your Family PIN
        <div style="font-weight:600;font-size:11px;color:#9a6a6a;text-transform:none;letter-spacing:0;margin-top:4px">Same code for every child in your family</div></td>
      <td align="right" style="padding:18px 22px;font-size:46px;font-weight:800;color:#C62828;letter-spacing:.12em">${esc(f.pin)}</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:22px 28px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="33%" style="padding:6px;vertical-align:top"><div style="background:#faf6f0;border-radius:12px;padding:14px;text-align:center"><div style="width:28px;height:28px;border-radius:50%;background:#C62828;color:#fff;font-weight:800;line-height:28px;margin:0 auto 8px">1</div><div style="font-weight:700;font-size:13px">Tap "Crystal"</div><div style="font-size:12px;color:#6b6b6b;margin-top:4px">Choose the Crystal location.</div></div></td>
      <td width="33%" style="padding:6px;vertical-align:top"><div style="background:#faf6f0;border-radius:12px;padding:14px;text-align:center"><div style="width:28px;height:28px;border-radius:50%;background:#C62828;color:#fff;font-weight:800;line-height:28px;margin:0 auto 8px">2</div><div style="font-weight:700;font-size:13px">Enter your PIN</div><div style="font-size:12px;color:#6b6b6b;margin-top:4px">Type your four digits.</div></div></td>
      <td width="33%" style="padding:6px;vertical-align:top"><div style="background:#faf6f0;border-radius:12px;padding:14px;text-align:center"><div style="width:28px;height:28px;border-radius:50%;background:#C62828;color:#fff;font-weight:800;line-height:28px;margin:0 auto 8px">3</div><div style="font-weight:700;font-size:13px">Tap your child</div><div style="font-size:12px;color:#6b6b6b;margin-top:4px">Tap to sign in, again to sign out.</div></div></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:20px 28px 4px">
    <div style="background:#eef7ef;border-left:5px solid #4CAF50;border-radius:10px;padding:13px 16px;font-size:13px;color:#2f5d36;line-height:1.5"><b style="color:#2e7d32">Your PIN is private.</b> Please keep it to the grown-ups who pick up. Staff will be at the desk all week to walk you through it, and nothing else about your day changes.</div>
  </td></tr>
  <tr><td style="padding:18px 28px 26px;color:#777;font-size:12px;line-height:1.6;border-top:1px solid #eee;margin-top:10px">
    Kiosk goes live <b style="color:#C62828">${GO_LIVE}</b><br>
    5510 W Broadway Ave, Crystal, MN &nbsp;·&nbsp; (763) 390-5870<br>
    Questions? Ask any staff member or reply to this email.
  </td></tr>
</table></td></tr></table></body></html>`;
}

async function resendSend(to, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject: SUBJECT, html }),
  });
  return { ok: res.ok, status: res.status };
}

const sendable = families.filter((f) => f.emailUsable);
const held = families.filter((f) => !f.emailUsable);

// --- TEST: one message to a chosen address (uses first sendable family's content) ---
if (TEST) {
  if (!RESEND_API_KEY) { console.error('No RESEND_API_KEY found (env or .env.local/.env.prod.local). Cannot test-send.'); process.exit(1); }
  const f = sendable[0] || families[0];
  const r = await resendSend(TEST, emailHTML(f));
  console.log(r.ok ? `TEST sent to ${TEST} (sample: ${f.familyLabel}). Check the inbox + spam.` : `TEST failed: provider status ${r.status} (likely the Resend domain is not verified yet).`);
  process.exit(r.ok ? 0 : 1);
}

// --- DRY RUN: write previews, send nothing ---
if (!SEND) {
  mkdirSync(EMAILS, { recursive: true });
  for (const f of families) writeFileSync(join(EMAILS, `${f.surname}-${f.familyId.slice(0, 8)}.html`), emailHTML(f));
  console.log(`\nDRY RUN — nothing sent.`);
  console.log(`Previews written: ${families.length} -> ${EMAILS}`);
  console.log(`Would email: ${sendable.length} families with a real address.`);
  console.log(`Held out (no usable email, hand them the flyer): ${held.length}${held.length ? ' -> ' + held.map((f) => f.surname).join(', ') : ''}`);
  console.log(`\nResend key detected: ${RESEND_API_KEY ? 'yes' : 'NO (sending will not work until set + domain verified)'}.`);
  console.log(`Next: open a preview, then  --test <your-email>  to send one to yourself, then  --send  for the batch.\n`);
  process.exit(0);
}

// --- SEND: real batch ---
if (!RESEND_API_KEY) { console.error('No RESEND_API_KEY. Aborting batch.'); process.exit(1); }
console.log(`Sending ${sendable.length} emails (holding ${held.length} with no address)...`);
let ok = 0, fail = 0;
for (const f of sendable) {
  const r = await resendSend(f.email, emailHTML(f));
  if (r.ok) { ok++; } else { fail++; console.log(`  FAIL ${f.surname} <${f.email}>: status ${r.status}`); }
  await new Promise((res) => setTimeout(res, 600)); // gentle pace
}
console.log(`\nDone. Sent ${ok}, failed ${fail}, held ${held.length}.`);
if (fail) console.log('Failures are usually an unverified Resend sending domain (christinaschildcare.com SPF/DKIM).');
