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
