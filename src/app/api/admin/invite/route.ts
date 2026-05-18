export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { signPayload } from '@/lib/session';

/**
 * Admin-only: produce a "set your password" link for a staff/parent the admin
 * added in User Management.
 *
 * This does NOT use Supabase's hosted invite/recovery flow. That flow rewrote
 * redirect_to to the project Site URL (localhost) and, for parents, set the
 * wrong password store entirely (parents authenticate against
 * families.password_hash, not Supabase Auth). Instead we mint our own
 * short-lived signed token and point at our own /set-password page on this
 * origin. No email is sent: the admin copies the link and gives it to the
 * person directly (also avoids any mail to real family addresses).
 *
 * Security: gated by requireSession('admin'); the token only proves "this
 * email may set a password", signed with SESSION_SECRET, 7-day expiry. The
 * role is still derived at sign-in from employees / family tables.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email || '').toLowerCase().trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  let token: string;
  try {
    const payload = {
      email,
      purpose: 'setpw',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    token = `${b64}.${signPayload(b64)}`;
  } catch {
    return NextResponse.json(
      { error: 'Server not configured for setup links (SESSION_SECRET).' },
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;
  const link = `${origin}/set-password?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ ok: true, link, emailed: false });
}
