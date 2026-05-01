// Resend bulk send wrapper. Chunked at 100 per batch (Resend's batch
// endpoint limit), retries transient failures, and writes per-recipient
// rows to newsletter_send_log so the webhook can update them later.
//
// Returns aggregate counts and the resend message ids that came back.

import { getServerSupabase } from '@/lib/supabase/server';
import { renderNewsletterEmail } from '@/lib/newsletter/render-email';
import { buildUnsubscribeToken } from '@/lib/newsletter/unsubscribe-token';
import type { Newsletter } from '@/lib/newsletter-storage';

const RESEND_API = 'https://api.resend.com/emails';
const RESEND_BATCH_API = 'https://api.resend.com/emails/batch';
const CHUNK_SIZE = 100;
const CENTER_NAME = "Christina's Childcare";

interface BulkSendResult {
  ok: boolean;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  messageIds: string[];
  errors: { email: string; error: string }[];
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://christinas-childcare.vercel.app'
  );
}

function getFromHeader(newsletter: Newsletter): string {
  const name = newsletter.from_name || CENTER_NAME;
  const email =
    newsletter.from_email ||
    process.env.NEWSLETTER_FROM_EMAIL ||
    "newsletter@christinaschildcare.com";
  return `${name} <${email}>`;
}

export async function bulkSendNewsletter(
  newsletter: Newsletter
): Promise<BulkSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
      messageIds: [],
      errors: [{ email: 'config', error: 'RESEND_API_KEY is not set on the server.' }],
    };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return {
      ok: false,
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
      messageIds: [],
      errors: [{ email: 'config', error: 'Supabase service role not configured.' }],
    };
  }

  // Fetch active subscribers in chunks to avoid PostgREST limit caps.
  const { data: subscribers, error: subError } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, name')
    .eq('status', 'subscribed')
    .limit(10000);

  if (subError) {
    return {
      ok: false,
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
      messageIds: [],
      errors: [{ email: 'subscribers', error: subError.message }],
    };
  }

  const recipients = (subscribers ?? []) as Subscriber[];
  if (recipients.length === 0) {
    return {
      ok: true,
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
      messageIds: [],
      errors: [],
    };
  }

  const fromHeader = getFromHeader(newsletter);
  const siteUrl = getSiteUrl();

  const messageIds: string[] = [];
  const errors: BulkSendResult['errors'] = [];
  let successCount = 0;

  // Send in chunks of CHUNK_SIZE via the batch endpoint. Each batch element
  // gets its own per-subscriber unsubscribe link.
  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE);
    const batch = chunk.map((sub) => {
      const token = buildUnsubscribeToken(sub.id, newsletter.id);
      const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
      const { subject, html } = renderNewsletterEmail(newsletter, {
        centerName: CENTER_NAME,
        unsubscribeUrl,
      });
      return {
        from: fromHeader,
        to: [sub.email],
        subject,
        html,
        // List-Unsubscribe header so Gmail / Apple Mail render the native
        // one-click unsubscribe button.
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: [
          { name: 'newsletter_id', value: newsletter.id },
          { name: 'subscriber_id', value: sub.id },
        ],
      };
    });

    let batchOk = false;
    let attempt = 0;
    let lastError: string | null = null;
    while (!batchOk && attempt < 2) {
      attempt += 1;
      try {
        const res = await fetch(RESEND_BATCH_API, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });
        if (!res.ok) {
          lastError = `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
          continue;
        }
        const body = (await res.json()) as { data?: Array<{ id: string }> };
        const ids = body.data ?? [];
        // Map ids back to chunk subscribers in order. Resend preserves order.
        for (let j = 0; j < chunk.length; j++) {
          const sub = chunk[j];
          const messageId = ids[j]?.id ?? null;
          if (messageId) {
            messageIds.push(messageId);
            successCount += 1;
            await supabase.from('newsletter_send_log').insert({
              newsletter_id: newsletter.id,
              subscriber_id: sub.id,
              email: sub.email,
              resend_message_id: messageId,
            });
          } else {
            errors.push({ email: sub.email, error: 'no message id returned' });
          }
        }
        batchOk = true;
      } catch (e) {
        lastError = (e as Error).message;
      }
    }

    if (!batchOk) {
      // Whole batch failed. Record errors for the chunk and try sending
      // individually as a fallback so partial success is possible.
      for (const sub of chunk) {
        try {
          const token = buildUnsubscribeToken(sub.id, newsletter.id);
          const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
          const { subject, html } = renderNewsletterEmail(newsletter, {
            centerName: CENTER_NAME,
            unsubscribeUrl,
          });
          const res = await fetch(RESEND_API, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromHeader,
              to: [sub.email],
              subject,
              html,
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
              tags: [
                { name: 'newsletter_id', value: newsletter.id },
                { name: 'subscriber_id', value: sub.id },
              ],
            }),
          });
          if (!res.ok) {
            errors.push({ email: sub.email, error: `HTTP ${res.status}` });
            continue;
          }
          const body = (await res.json()) as { id?: string };
          if (body.id) {
            messageIds.push(body.id);
            successCount += 1;
            await supabase.from('newsletter_send_log').insert({
              newsletter_id: newsletter.id,
              subscriber_id: sub.id,
              email: sub.email,
              resend_message_id: body.id,
            });
          } else {
            errors.push({ email: sub.email, error: 'no id returned' });
          }
        } catch (e) {
          errors.push({
            email: sub.email,
            error: lastError ?? (e as Error).message,
          });
        }
      }
    }
  }

  // Update the newsletter row with aggregate counts + ids.
  await supabase
    .from('newsletters')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: recipients.length,
      resend_message_ids: messageIds,
      last_error: errors.length > 0 ? errors[0].error : null,
    })
    .eq('id', newsletter.id);

  // Stamp last_sent_at on the subscribers we successfully sent to.
  if (successCount > 0) {
    const successEmails = recipients
      .filter((r) => !errors.some((e) => e.email === r.email))
      .map((r) => r.id);
    if (successEmails.length > 0) {
      await supabase
        .from('newsletter_subscribers')
        .update({ last_sent_at: new Date().toISOString() })
        .in('id', successEmails);
    }
  }

  return {
    ok: errors.length === 0 || successCount > 0,
    recipientCount: recipients.length,
    successCount,
    failureCount: errors.length,
    messageIds,
    errors,
  };
}
