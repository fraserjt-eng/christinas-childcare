export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { verifyUnsubscribeToken } from '@/lib/newsletter/unsubscribe-token';

// One-click unsubscribe via signed token. Public endpoint, no auth.
// Returns a small HTML confirmation page (mail clients open this in-browser).
// Also handles POST for email clients that follow RFC 8058 List-Unsubscribe-Post.

async function unsubscribeByToken(token: string): Promise<{
  ok: boolean;
  email?: string;
  error?: string;
}> {
  const payload = verifyUnsubscribeToken(token);
  if (!payload) {
    return { ok: false, error: 'Invalid or tampered unsubscribe link.' };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return { ok: false, error: 'Service is temporarily unavailable.' };
  }

  const { data: subscriber, error: fetchError } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status')
    .eq('id', payload.sid)
    .maybeSingle();

  if (fetchError || !subscriber) {
    return { ok: false, error: 'Subscriber not found.' };
  }

  if (subscriber.status === 'unsubscribed') {
    return { ok: true, email: subscriber.email };
  }

  await supabase
    .from('newsletter_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('id', subscriber.id);

  // If the token carried a newsletter id, increment its unsubscribe counter
  // and stamp the per-recipient log row.
  if (payload.nid) {
    await supabase
      .from('newsletter_send_log')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('newsletter_id', payload.nid)
      .eq('subscriber_id', subscriber.id);

    const { data: nlRow } = await supabase
      .from('newsletters')
      .select('id, unsubscribe_count')
      .eq('id', payload.nid)
      .maybeSingle();
    if (nlRow) {
      await supabase
        .from('newsletters')
        .update({ unsubscribe_count: (nlRow.unsubscribe_count ?? 0) + 1 })
        .eq('id', payload.nid);
    }
  }

  return { ok: true, email: subscriber.email };
}

function htmlResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function confirmationPage(message: string, ok: boolean): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#faf6f0;margin:0;padding:40px 20px;color:#1f2937}.card{max-width:480px;margin:60px auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);text-align:center}h1{color:${ok ? '#059669' : '#dc2626'};font-size:22px;margin:0 0 12px}p{color:#6b7280;font-size:15px;line-height:1.6;margin:0}</style>
</head><body><div class="card"><h1>${ok ? 'You are unsubscribed' : 'Unsubscribe failed'}</h1><p>${escapeHtml(message)}</p></div></body></html>`;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return htmlResponse(confirmationPage('Missing unsubscribe token.', false), 400);
  }
  const result = await unsubscribeByToken(token);
  if (!result.ok) {
    return htmlResponse(confirmationPage(result.error ?? 'Could not unsubscribe.', false), 400);
  }
  return htmlResponse(
    confirmationPage(
      `${result.email ?? 'Your address'} will no longer receive newsletters from Christina's Child Care.`,
      true
    )
  );
}

export async function POST(req: NextRequest) {
  // RFC 8058 List-Unsubscribe-Post: token comes as a form value or query.
  const url = new URL(req.url);
  let token = url.searchParams.get('token');
  if (!token) {
    const formData = await req.formData().catch(() => null);
    token = formData?.get('token')?.toString() ?? null;
  }
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
  }
  const result = await unsubscribeByToken(token);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
