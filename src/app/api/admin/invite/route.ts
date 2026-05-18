export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

/**
 * Admin-only: create (or recover) a Supabase Auth account for a staff/parent
 * the admin added in User Management, and produce a "set your password" link.
 *
 * Security: gated by requireSession('admin') so only an authenticated admin
 * can trigger it. The role is NOT set here; it is derived at sign-in time from
 * the employees / family_parents tables by lookupInviteServer. This route only
 * proves identity ownership via the email link.
 *
 * Returns a copyable action link always (reliable even if email delivery is
 * rate-limited), and attempts to send the Supabase email as well.
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

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/set-password`;

  // Does a Supabase Auth user already exist for this email?
  let userExists = false;
  try {
    const { data: list } = await supabase.auth.admin.listUsers();
    userExists = !!list?.users?.some(
      (u) => u.email?.toLowerCase() === email
    );
  } catch {
    // If listing fails, fall through and let generateLink decide.
  }

  let emailed = false;

  // Best-effort: send the Supabase email (invite for new, recovery for existing).
  try {
    if (!userExists) {
      const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo,
      });
      emailed = !error;
    }
  } catch {
    emailed = false;
  }

  // Always produce a copyable link as the reliable path.
  let link = '';
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: userExists ? 'recovery' : 'invite',
      email,
      options: { redirectTo },
    });
    if (!error) {
      link = data?.properties?.action_link ?? '';
    }
  } catch {
    link = '';
  }

  if (!link && !emailed) {
    return NextResponse.json(
      { error: 'Could not create a setup link. Check Supabase Auth URL configuration.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, emailed, link, userExists });
}
