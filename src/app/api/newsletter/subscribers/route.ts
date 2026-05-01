export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase/server';

// Public POST: subscribe to the newsletter (no auth required).
// Admin GET: list all subscribers.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const name = (body.name || '').trim() || null;
  const source = body.source || 'public_form';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'A valid email is required.' },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Subscription is temporarily unavailable.' },
      { status: 503 }
    );
  }

  // Idempotent insert: if the email exists and was unsubscribed, re-subscribe.
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'subscribed') {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'subscribed',
        unsubscribed_at: null,
        name: name ?? undefined,
        source,
      })
      .eq('id', existing.id);
    return NextResponse.json({ ok: true, resubscribed: true });
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, name, source, status: 'subscribed' });

  if (error) {
    return NextResponse.json(
      { ok: false, error: `Could not subscribe: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Supabase service role not configured.' },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json(
      { ok: false, error: `Could not list subscribers: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, subscribers: data ?? [] });
}
