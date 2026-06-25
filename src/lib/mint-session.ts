// Single place that mints the signed HttpOnly session cookie.
//
// Both /api/auth/session and /api/auth/staff-pin call this so the cookie
// shape, flags, and signing can never drift between routes. The caller is
// responsible for verifying the credential and deriving the role BEFORE
// calling this. Node.js runtime only (signPayload uses crypto).

import { NextResponse } from 'next/server';
import { signPayload, SESSION_MAX_AGE } from '@/lib/session';
import { SUPERADMIN_EMAILS } from '@/lib/auth-allowlist';

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
  // The leadership emails ALWAYS mint as cross-center superadmin, no matter how
  // they signed in. Without this, a staff-PIN login resolves an owner to role
  // 'admin', which hides the center switcher and owner-only features — even
  // though requireSession would treat them as superadmin server-side. Forcing it
  // here makes the COOKIE itself say superadmin, so the client UI matches. (Each
  // owner must sign out + back in once for their new cookie to take effect.)
  const email = (user.email || '').toLowerCase().trim();
  const effectiveUser: SessionUser = SUPERADMIN_EMAILS.includes(email)
    ? { ...user, role: 'superadmin', center_id: null }
    : user;

  const sessionData = {
    user: effectiveUser,
    expires_at: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const payload = JSON.stringify(sessionData);
  const cookieValue = `${payload}.${signPayload(payload)}`;

  const response = NextResponse.json({ success: true, user: effectiveUser });
  response.cookies.set('auth_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}
