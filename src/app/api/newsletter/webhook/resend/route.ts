export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getServerSupabase } from '@/lib/supabase/server';

// Resend webhook receiver. Updates per-recipient send-log rows on
// delivered / opened / clicked / bounced / complained / unsubscribed events,
// and rolls aggregates into the parent newsletter row.
//
// Resend signs webhook bodies with a `resend-webhook-secret` (svix-style).
// Set RESEND_WEBHOOK_SECRET in Vercel env. If unset (dev), signature check
// is skipped.

interface ResendWebhookEvent {
  type: string;            // "email.delivered" | "email.opened" | etc.
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[];
    tags?: Array<{ name: string; value: string }>;
  };
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // dev: skip
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

async function incrementCounter(
  newsletterId: string,
  column: 'open_count' | 'click_count' | 'bounce_count'
): Promise<void> {
  const supabase = getServerSupabase();
  if (!supabase) return;
  const { data } = await supabase
    .from('newsletters')
    .select(column)
    .eq('id', newsletterId)
    .maybeSingle();
  if (!data) return;
  const current = (data as Record<string, number>)[column] ?? 0;
  await supabase
    .from('newsletters')
    .update({ [column]: current + 1 })
    .eq('id', newsletterId);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('resend-signature');
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(rawBody) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: 'no service role' });
  }

  const messageId = event.data?.email_id;
  const newsletterId =
    event.data?.tags?.find((t) => t.name === 'newsletter_id')?.value ?? null;

  if (!messageId) {
    return NextResponse.json({ ok: true, skipped: 'no email_id' });
  }

  const nowIso = event.created_at ?? new Date().toISOString();

  switch (event.type) {
    case 'email.delivered':
      await supabase
        .from('newsletter_send_log')
        .update({ delivered_at: nowIso })
        .eq('resend_message_id', messageId);
      break;

    case 'email.opened': {
      // Increment per-recipient open_count and stamp opened_at on first open.
      const { data: row } = await supabase
        .from('newsletter_send_log')
        .select('id, opened_at, open_count')
        .eq('resend_message_id', messageId)
        .maybeSingle();
      if (row) {
        await supabase
          .from('newsletter_send_log')
          .update({
            opened_at: row.opened_at ?? nowIso,
            open_count: (row.open_count ?? 0) + 1,
          })
          .eq('id', row.id);
        // Roll up to newsletter only on the first open per recipient.
        if (!row.opened_at && newsletterId) {
          await incrementCounter(newsletterId, 'open_count');
        }
      }
      break;
    }

    case 'email.clicked': {
      const { data: row } = await supabase
        .from('newsletter_send_log')
        .select('id, clicked_at, click_count')
        .eq('resend_message_id', messageId)
        .maybeSingle();
      if (row) {
        await supabase
          .from('newsletter_send_log')
          .update({
            clicked_at: row.clicked_at ?? nowIso,
            click_count: (row.click_count ?? 0) + 1,
          })
          .eq('id', row.id);
        if (!row.clicked_at && newsletterId) {
          await incrementCounter(newsletterId, 'click_count');
        }
      }
      break;
    }

    case 'email.bounced':
    case 'email.bounce': {
      const { data: row } = await supabase
        .from('newsletter_send_log')
        .select('id, bounced_at, subscriber_id, email')
        .eq('resend_message_id', messageId)
        .maybeSingle();
      if (row) {
        await supabase
          .from('newsletter_send_log')
          .update({ bounced_at: nowIso })
          .eq('id', row.id);
        if (!row.bounced_at && newsletterId) {
          await incrementCounter(newsletterId, 'bounce_count');
        }
        // Mark the subscriber as bounced so future sends skip them.
        if (row.subscriber_id) {
          await supabase
            .from('newsletter_subscribers')
            .update({ status: 'bounced' })
            .eq('id', row.subscriber_id);
        }
      }
      break;
    }

    case 'email.complained': {
      const { data: row } = await supabase
        .from('newsletter_send_log')
        .select('id, subscriber_id')
        .eq('resend_message_id', messageId)
        .maybeSingle();
      if (row) {
        await supabase
          .from('newsletter_send_log')
          .update({ complained_at: nowIso })
          .eq('id', row.id);
        if (row.subscriber_id) {
          await supabase
            .from('newsletter_subscribers')
            .update({ status: 'complained' })
            .eq('id', row.subscriber_id);
        }
      }
      break;
    }

    default:
      // Unknown events are acknowledged so Resend doesn't retry.
      break;
  }

  return NextResponse.json({ ok: true });
}
