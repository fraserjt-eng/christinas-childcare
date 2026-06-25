// Shared Resend sender for family-facing email. Used by the owner-approved
// send path (parent messages now; broadcasts next). Returns whether the email
// actually went out: when RESEND_API_KEY is unset (email is dark today), it
// returns false and the message still posts to the parent portal in-app.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendFamilyEmail(opts: {
  to: string;
  subject: string;
  bodyText: string;
  fromName: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Christina's Child Care Center <notifications@christinaschildcare.com>",
        to: [opts.to],
        reply_to: 'info@christinaschildcare.com',
        subject: opts.subject,
        html: `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.5;color:#222">
            <p>${escapeHtml(opts.bodyText).replace(/\n/g, '<br/>')}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="font-size:13px;color:#666">From ${escapeHtml(opts.fromName)} at Christina&rsquo;s Child Care Center.
            You can also see this in your parent portal.</p>
          </div>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
