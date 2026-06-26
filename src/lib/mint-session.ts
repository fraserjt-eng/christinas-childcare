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
  // The leadership emails mint as cross-center superadmin on a staff/admin/Google
  // login, no matter which role the credential resolved to. Without this, a
  // staff-PIN login resolves an owner to role 'admin', which hides the center
  // switcher and owner-only features. Forcing it here makes the COOKIE say
  // superadmin so the client UI matches.
  //
  // EXCEPTION: a deliberate PARENT login (parent-pin route mints role 'parent')
  // is NEVER overridden — otherwise an owner whose email is also a family email
  // (e.g. J's test family) could never sign in as a parent to test the family
  // experience. So an owner can be a parent via the family PIN AND a superadmin
  // via the admin/staff login.
  const email = (user.email || '').toLowerCase().trim();
  const effectiveUser: SessionUser =
    user.role !== 'parent' && SUPERADMIN_EMAILS.includes(email)
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
