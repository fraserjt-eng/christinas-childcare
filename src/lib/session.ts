/**
 * Server-side session utilities (Node.js runtime only).
 * For Edge Runtime verification, use verifySignedCookieEdge in middleware.ts.
 */

import { createHmac, timingSafeEqual } from 'crypto';

const DEV_FALLBACK = 'dev-secret-change-in-production';

// Fail closed in production. The dev fallback is only used OUTSIDE production.
// In production we also REFUSE a secret that equals the publicly-known dev
// fallback or is shorter than 32 chars (a copy-pasted dev value would let anyone
// forge a superadmin cookie offline) — treating it as unset, so signing throws
// and verification denies rather than silently signing with a guessable key.
const SESSION_SECRET = (() => {
  const raw = process.env.SESSION_SECRET || '';
  if (process.env.NODE_ENV === 'production') {
    if (!raw || raw === DEV_FALLBACK || raw.length < 32) return '';
    return raw;
  }
  return raw || DEV_FALLBACK;
})();
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

// Constant-time comparison so the signature check is not a timing oracle.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function signPayload(payload: string): string {
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set to a strong value in production');
  }
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function verifySignedCookie(cookieValue: string): Record<string, unknown> | null {
  if (!SESSION_SECRET) return null;
  const lastDot = cookieValue.lastIndexOf('.');
  if (lastDot === -1) return null;

  const payload = cookieValue.substring(0, lastDot);
  const signature = cookieValue.substring(lastDot + 1);
  const expected = signPayload(payload);

  if (!constantTimeEqual(signature, expected)) return null;

  try {
    const data = JSON.parse(payload);
    if (data.expires_at && data.expires_at < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
