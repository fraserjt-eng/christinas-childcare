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
