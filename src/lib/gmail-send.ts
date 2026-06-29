// Send an email from a Google account via the Gmail API, using a stored OAuth
// refresh token. Plain fetch, no SDK. Used by the kiosk-report cron so the report
// arrives from J's own Gmail (no Resend / no verified domain needed).
//
// Required env (set in Vercel): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
// GMAIL_REFRESH_TOKEN, GMAIL_SENDER (the authorized address, e.g. fraserjt@gmail.com).
// Mint the refresh token once with scripts/kiosk-rollout/gmail-authorize.mjs.

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN &&
      process.env.GMAIL_SENDER
  );
}

async function accessToken(): Promise<string | null> {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    refresh_token: process.env.GMAIL_REFRESH_TOKEN || '',
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

function buildRaw(from: string, to: string, subject: string, html: string): string {
  // RFC 2047 encode the subject so any non-ASCII survives; body is base64 UTF-8.
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html, 'utf8').toString('base64'),
  ].join('\r\n');
  return Buffer.from(message, 'utf8').toString('base64url');
}

export async function sendGmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; reason: string }> {
  if (!isGmailConfigured()) return { ok: false, reason: 'Gmail not configured (missing GOOGLE_* / GMAIL_* env).' };
  const from = process.env.GMAIL_SENDER as string;
  try {
    const token = await accessToken();
    if (!token) return { ok: false, reason: 'Could not refresh the Gmail access token.' };
    const raw = buildRaw(from, input.to, input.subject, input.html);
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) return { ok: false, reason: `Gmail API returned status ${res.status}.` };
    return { ok: true, reason: 'sent' };
  } catch {
    return { ok: false, reason: 'Gmail send failed (network or provider error).' };
  }
}
