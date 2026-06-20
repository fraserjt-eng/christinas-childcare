// Email notification helper using Resend.
// Sends transactional notifications to the center owner when new inquiries arrive.
// If RESEND_API_KEY is not set, the function logs and returns null silently.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = 'info@christinaschildcare.com';

export async function sendNotificationEmail(
  subject: string,
  htmlBody: string
): Promise<Record<string, unknown> | null> {
  if (!RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set, skipping email notification');
    return null;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Christina's Childcare <notifications@christinaschildcare.com>",
        to: [NOTIFICATION_EMAIL],
        subject,
        html: htmlBody,
      }),
    });
    return (await res.json()) as Record<string, unknown>;
  } catch (error) {
    console.error('[email] Failed to send notification:', error);
    return null;
  }
}

// Generic single-message send via Resend. Used by family-facing communications
// (the privacy-notice announcement) where each family gets its own rendered
// email. Returns an honest { ok, reason } so callers can build a per-recipient
// summary without throwing.
//
// IMPORTANT (owner action): the Resend sending domain in the `from` address
// (christinaschildcare.com) must be VERIFIED in the Resend dashboard (SPF +
// DKIM DNS records) before any of these emails will actually deliver. Until
// then Resend accepts the request but mail will not reach families.
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ ok: boolean; reason: string }> {
  if (!RESEND_API_KEY) {
    return {
      ok: false,
      reason: 'Email sending is not configured (no RESEND_API_KEY).',
    };
  }
  if (!input.to || !input.to.includes('@')) {
    return { ok: false, reason: 'No valid email address on file.' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Christina's Child Care Center <notifications@christinaschildcare.com>",
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!res.ok) {
      // Do not leak the raw provider body; keep the reason short + safe.
      return { ok: false, reason: `Email provider returned status ${res.status}.` };
    }
    return { ok: true, reason: 'sent' };
  } catch {
    return { ok: false, reason: 'Email send failed (network or provider error).' };
  }
}

// Send a co-payment statement to a family. SINGLE wiring point for emailing
// statements: today there is no family-facing email path (RESEND_API_KEY is
// unset and the only sender above is owner-only), so this is a stub. When the
// real email path lands (a verified Resend domain, or the Google-account
// connection), implement the send here, and the admin UI's "Send" button plus a
// biweekly/monthly schedule can call it. Returns an honest status for the admin.
export interface StatementEmailInput {
  to: string;
  parentName: string;
  periodLabel: string;
  amount: number;
  pdf?: { filename: string; base64: string };
}

export async function sendStatement(
  input: StatementEmailInput
): Promise<{ ok: boolean; reason: string }> {
  // Not configured yet on purpose. Statements are generated + downloaded
  // (Christina sends them manually for now); automatic emailing is a later step.
  // `input` is accepted now so callers + the schedule are stable; reference it
  // so the signature stays honest until the real send is implemented here.
  void input;
  return {
    ok: false,
    reason: 'Email sending is not connected yet. Download the statement PDF and send it manually.',
  };
}
