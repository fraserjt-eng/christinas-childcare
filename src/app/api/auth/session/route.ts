export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { verifySignedCookie } from '@/lib/session';
import { getServerSupabase } from '@/lib/supabase/server';
import { lookupInviteServer } from '@/lib/auth-allowlist-server';
import { mintSessionResponse } from '@/lib/mint-session';

// GET: Read current session (returns user info without exposing raw cookie)
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = verifySignedCookie(decodeURIComponent(sessionCookie));
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user,
    expires_at: session.expires_at,
  });
}

/**
 * Mint the signed HttpOnly session cookie.
 *
 * Security model: the caller must prove identity FIRST. The role is then
 * derived server-side from the database, never taken from the request body.
 * Two proofs are accepted:
 *
 *   1. accessToken — a Supabase Auth session token (password or Google OAuth).
 *      Verified with supabase.auth.getUser(); the email comes from the verified
 *      user, the role from lookupInviteServer().
 *   2. familyLogin {email, password} — a parent on the legacy families table.
 *      Verified against families.password_hash; role is always 'parent'.
 *
 * Anything else is rejected. The old behaviour (trusting a client-supplied
 * email + role) is removed: that allowed anyone to mint a superadmin cookie.
 */
function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 attempts per IP per 15 minutes
  const clientId = getClientIdentifier(request);
  const rateResult = checkRateLimit(`login:${clientId}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateResult.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': rateResult.retryAfterSeconds?.toString() ?? '900' },
      }
    );
  }

  let body: {
    accessToken?: string;
    familyLogin?: { email?: string; password?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // --- Path 1: verified Supabase Auth session (staff, admin, OAuth) ---
  if (body.accessToken) {
    if (!supabase) {
      return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(body.accessToken);

    if (error || !user || !user.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const invite = await lookupInviteServer(user.email);
    if (!invite.allowed || !invite.role) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return mintSessionResponse({
      id: user.id,
      email: user.email.toLowerCase(),
      full_name: invite.fullName || user.email.split('@')[0],
      role: invite.role,
    });
  }

  // --- Path 2: legacy parent families password (bridge, role is fixed) ---
  if (body.familyLogin?.email && body.familyLogin?.password) {
    if (!supabase) {
      return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 });
    }

    const email = body.familyLogin.email.toLowerCase().trim();

    const { data: family } = await supabase
      .from('families')
      .select('id, email, password_hash, status')
      .ilike('email', email)
      .maybeSingle();

    if (!family || family.status !== 'active') {
      // Same response whether the email exists or not (no enumeration).
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (sha256Hex(body.familyLogin.password) !== family.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { data: primaryParent } = await supabase
      .from('family_parents')
      .select('name, is_primary')
      .eq('family_id', family.id)
      .order('is_primary', { ascending: false })
      .limit(1)
      .maybeSingle();

    return mintSessionResponse({
      id: `family-${family.id}`,
      email: family.email,
      full_name: primaryParent?.name || family.email.split('@')[0],
      role: 'parent',
    });
  }

  return NextResponse.json({ error: 'No valid credential provided' }, { status: 400 });
}

// DELETE: Destroy session (logout)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
