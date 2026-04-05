/**
 * Server-side session utilities (Node.js runtime only).
 * For Edge Runtime verification, use verifySignedCookieEdge in middleware.ts.
 */

import { createHmac } from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

export function signPayload(payload: string): string {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function verifySignedCookie(cookieValue: string): Record<string, unknown> | null {
  const lastDot = cookieValue.lastIndexOf('.');
  if (lastDot === -1) return null;

  const payload = cookieValue.substring(0, lastDot);
  const signature = cookieValue.substring(lastDot + 1);
  const expected = signPayload(payload);

  if (signature !== expected) return null;

  try {
    const data = JSON.parse(payload);
    if (data.expires_at && data.expires_at < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
