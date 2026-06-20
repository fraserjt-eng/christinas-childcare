// Branded family communication: the "we are adding a privacy notice" heads-up.
//
// Renders a full HTML document (inline styles so email clients keep them) that
// announces the new check-in privacy notice, summarizes it in plain language,
// and shows the family their kiosk PIN. Modeled on the newsletter email
// renderer (red #C62828 header band, cream #faf6f0 body, gold #FFD54F accent
// rule, footer with both centers + phone + email).
//
// Two layouts come out of one content source:
//   - the email layout (renderPrivacyNoticeNotice) for Resend delivery
//   - a print-friendly layout (renderPrivacyNoticePrintHandout) usable as a
//     one-page paper handout at the door
// Both share renderNoticeBody so the wording never drifts between them.

export interface PrivacyNoticeInput {
  familyName: string;
  pin: string;
  centerName?: string;
}

// Center contact block shown in every footer. Kept here (not pulled from the
// DB) so the handout is correct even when printed offline.
const CENTERS = [
  'Crystal: 5510 W Broadway Ave, Crystal, MN 55428',
  'Brooklyn Park, MN',
];
const PHONE = '(763) 390-5870';
const EMAIL = 'c.fraser@chriskids2.org';
const TAGLINE = 'Where Learning and Growth Become One';
const ORG_NAME = "Christina's Child Care Center";

const RED = '#C62828';
const GOLD = '#FFD54F';
const CREAM = '#faf6f0';
const DARK = '#1f2937';
const MUTED = '#6b7280';

// The kiosk re-prompts every family at their next use starting this date. Keep
// the spoken date in sync with PRIVACY_NOTICE_VERSION (2026-06-22 = a Monday).
const START_DATE = 'Monday June 22';

function escapeText(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// The "C" logo: white rounded square on red, red "C". Inline table so it holds
// in email clients that drop background-image. Used in both layouts.
function logoMark(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;vertical-align:middle;">
    <tr><td style="width:46px;height:46px;background:#ffffff;border-radius:12px;text-align:center;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;line-height:46px;color:${RED};">C</td></tr>
  </table>`;
}

// Shared content body (everything between the header band and the footer). The
// only structural difference between email and print is the outer chrome, so the
// PIN card, summary, and reassurance all live here once.
function renderNoticeBody(input: PrivacyNoticeInput): string {
  const familyName = escapeText(input.familyName || 'Families');
  const pin = escapeText(input.pin || '');
  const greeting = familyName.toLowerCase().endsWith('family')
    ? `Hello, ${familyName}`
    : `Hello, ${familyName} family`;

  return `
  <p style="font-size:17px;font-weight:700;margin:0 0 14px 0;color:${DARK};">${greeting}</p>

  <p style="font-size:15px;line-height:1.65;margin:0 0 16px 0;color:${DARK};">
    Starting ${START_DATE}, the check-in kiosk will ask you to read and agree to a short privacy notice before you check your child in. It takes a few seconds, and you only need to do it once a year.
  </p>

  <p style="font-size:15px;line-height:1.65;margin:0 0 6px 0;color:${DARK};font-weight:700;">What the notice covers</p>
  <p style="font-size:15px;line-height:1.65;margin:0 0 20px 0;color:${DARK};">
    We keep attendance records to run the program and to meet the rules for child care assistance (CCAP) and state licensing. We share that information with the program and with the State of Minnesota. We do not sell it or use it for anything else.
  </p>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;">
    <tr>
      <td style="background:#ffffff;border:2px solid ${RED};border-radius:14px;padding:20px 24px;text-align:center;">
        <p style="font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 6px 0;color:${MUTED};">Your family PIN</p>
        <p style="font-size:38px;font-weight:700;letter-spacing:0.18em;margin:0;color:${RED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${pin || '----'}</p>
        <p style="font-size:13px;line-height:1.5;margin:8px 0 0 0;color:${MUTED};">You will enter this PIN at the kiosk to check in and out.</p>
      </td>
    </tr>
  </table>

  <p style="font-size:15px;line-height:1.65;margin:0 0 4px 0;color:${DARK};">
    Nothing changes about how you drop off or pick up. If you have any questions, just ask us. We are happy to walk through it with you.
  </p>
  <p style="font-size:15px;line-height:1.65;margin:0;color:${DARK};">
    Thank you,<br />The team at ${escapeText(input.centerName || ORG_NAME)}
  </p>
  `;
}

// Footer block (org name, both centers, phone, email). Shared by both layouts.
function renderFooter(): string {
  const centerLines = CENTERS.map((c) => escapeText(c)).join('<br />');
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="border-top:3px solid ${GOLD};padding-top:18px;text-align:center;">
      <p style="font-size:14px;font-weight:700;margin:0 0 4px 0;color:${RED};">${escapeText(ORG_NAME)}</p>
      <p style="font-size:12px;line-height:1.7;margin:0;color:${MUTED};">
        ${centerLines}<br />
        Phone: ${escapeText(PHONE)} &nbsp;&bull;&nbsp; Email: ${escapeText(EMAIL)}
      </p>
    </td></tr>
  </table>
  `;
}

// The red header band with the "C" logo, org name, and tagline. Shared chrome.
function renderHeaderBand(): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${RED};border-radius:16px 16px 0 0;">
    <tr>
      <td style="padding:24px 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:14px;">${logoMark()}</td>
            <td style="vertical-align:middle;">
              <p style="font-size:19px;font-weight:700;margin:0;color:#ffffff;">${escapeText(ORG_NAME)}</p>
              <p style="font-size:13px;font-style:italic;margin:2px 0 0 0;color:${GOLD};">${escapeText(TAGLINE)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
}

/**
 * Email layout. Returns { subject, html } ready for Resend. Inline styles only,
 * 600px content column, the branded header/footer chrome and the shared body.
 */
export function renderPrivacyNoticeNotice(
  input: PrivacyNoticeInput
): { subject: string; html: string } {
  const subject = 'A quick heads-up about checking in starting June 22';
  const preheader =
    'Starting June 22 the kiosk will ask you to agree to a short privacy notice. Here is your family PIN.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeText(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${DARK};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeText(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${CREAM};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
        <tr><td>${renderHeaderBand()}</td></tr>
        <tr>
          <td style="background:${CREAM};border:1px solid #ece3d6;border-top:none;border-radius:0 0 16px 16px;padding:28px;">
            ${renderNoticeBody(input)}
            <div style="height:24px;"></div>
            ${renderFooter()}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html };
}

/**
 * Print-friendly layout. Same content, but a paper-first page with print CSS
 * (white background, no rounded radii on print, page margins) so it can be
 * opened in a browser and printed as a one-page door handout. Returns the full
 * HTML document string.
 */
export function renderPrivacyNoticePrintHandout(input: PrivacyNoticeInput): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeText(ORG_NAME)} privacy notice handout</title>
<style>
  html, body { margin:0; padding:0; }
  body {
    background:${CREAM};
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    color:${DARK};
  }
  .sheet {
    max-width:680px;
    margin:0 auto;
    padding:24px 16px;
  }
  @media print {
    body { background:#ffffff; }
    .sheet { max-width:none; margin:0; padding:0; }
    .band { border-radius:0 !important; }
    .panel { border:none !important; border-radius:0 !important; }
    @page { margin:0.6in; }
  }
</style>
</head>
<body>
<div class="sheet">
  <div class="band">${renderHeaderBand()}</div>
  <div class="panel" style="background:#ffffff;border:1px solid #ece3d6;border-top:none;border-radius:0 0 16px 16px;padding:28px;">
    ${renderNoticeBody(input)}
    <div style="height:24px;"></div>
    ${renderFooter()}
  </div>
</div>
</body>
</html>`;
}
