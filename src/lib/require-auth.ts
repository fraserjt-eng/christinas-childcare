/**
 * Server-side API authorization guard.
 *
 * Before this existed, API routes checked only that the `auth_session` cookie
 * was present and non-empty. They never verified the HMAC signature, expiry,
 * or role. Any request with `Cookie: auth_session=x` passed. This guard calls
 * the real verifier (verifySignedCookie) so the signature and expiry are
 * actually checked, and optionally enforces a minimum role.
 *
 * Node.js runtime only (uses next/headers cookies + crypto via session.ts).
 */

import { cookies } from 'next/headers';
import { verifySignedCookie } from '@/lib/session';
import { SUPERADMIN_EMAILS } from '@/lib/auth-allowlist';

export interface SessionUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  /** The center this session is scoped to (server-derived at mint time). Null
   *  for superadmin (cross-center) and parents until families carry a center. */
  center_id?: string | null;
}

export interface AuthedSession {
  user: SessionUser;
  expires_at: number;
}

// Higher number = more privilege. 'employee' is accepted by the login route's
// allowlist even though it is not in the UserRole union, so it is mapped here.
const ROLE_RANK: Record<string, number> = {
  parent: 1,
  teacher: 2,
  employee: 2,
  admin: 3,
  owner: 4,
  superadmin: 5,
};

/**
 * Returns the authenticated session, or null if the cookie is missing,
 * unsigned, tampered, expired, or below the required role.
 *
 * @param minRole minimum role required. Omit to require only a valid session.
 */
export async function requireSession(
  minRole?: 'teacher' | 'admin'
): Promise<AuthedSession | null> {
  const raw = (await cookies()).get('auth_session')?.value;
  if (!raw) return null;

  // The login route sets the cookie URL-encoded; the legacy GET reader uses
  // decodeURIComponent. Try decoded first, fall back to raw.
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = verifySignedCookie(decodeURIComponent(raw));
  } catch {
    parsed = null;
  }
  if (!parsed) parsed = verifySignedCookie(raw);
  if (!parsed || typeof parsed.user !== 'object' || parsed.user === null) {
    return null;
  }

  const session = parsed as unknown as AuthedSession;

  // The configured owner email is ALWAYS treated as superadmin, regardless of
  // which role its cookie carries. fraserjt@gmail.com is also a staff
  // (teacher) and a parent record; signing in via the staff PIN mints a
  // 'teacher' cookie, which then failed every admin action even though the
  // person IS the owner. The email is the durable identity here.
  const email = String(session.user.email || '').toLowerCase().trim();
  if (SUPERADMIN_EMAILS.includes(email)) {
    return { ...session, user: { ...session.user, role: 'superadmin' } };
  }

  if (minRole) {
    const have = ROLE_RANK[session.user.role] ?? 0;
    const need = ROLE_RANK[minRole] ?? 99;
    if (have < need) return null;
  }

  return session;
}
