// Single place that mints the signed HttpOnly session cookie.
//
// Both /api/auth/session and /api/auth/staff-pin call this so the cookie
// shape, flags, and signing can never drift between routes. The caller is
// responsible for verifying the credential and deriving the role BEFORE
// calling this. Node.js runtime only (signPayload uses crypto).

import { NextResponse } from 'next/server';
import { signPayload, SESSION_MAX_AGE } from '@/lib/session';

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  /** The center this session is scoped to. Derived server-side at mint time
   *  from the employee record. Null for cross-center identities (superadmin)
   *  and for parents until the families table carries a center. */
  center_id?: string | null;
}

export function mintSessionResponse(user: SessionUser): NextResponse {
  const sessionData = {
    user,
    expires_at: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const payload = JSON.stringify(sessionData);
  const cookieValue = `${payload}.${signPayload(payload)}`;

  const response = NextResponse.json({ success: true, user });
  response.cookies.set('auth_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}
