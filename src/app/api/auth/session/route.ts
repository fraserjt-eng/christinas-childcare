export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { signPayload, verifySignedCookie, SESSION_MAX_AGE } from '@/lib/session';

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

// POST: Create session
export async function POST(request: NextRequest) {
  // Rate limit: 5 login attempts per IP per 15 minutes
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

  let body: { email?: string; role?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, role, name } = body;

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
  }

  // Server-side role validation: only accept known roles
  const ALLOWED_ROLES = ['admin', 'owner', 'teacher', 'employee', 'parent'];
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Build session payload
  const sessionData = {
    user: {
      id: `local-${Date.now()}`,
      email,
      full_name: name || email.split('@')[0],
      role,
    },
    expires_at: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const payload = JSON.stringify(sessionData);
  const signature = signPayload(payload);
  const cookieValue = `${payload}.${signature}`;

  const response = NextResponse.json({ success: true, user: sessionData.user });
  response.cookies.set('auth_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return response;
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
