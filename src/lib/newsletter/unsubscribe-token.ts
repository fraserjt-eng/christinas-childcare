// HMAC-signed one-click unsubscribe tokens. Same secret pool as the auth
// session so the wrapper is consistent. Token shape: base64url(payload).sig
//
// Payload encodes the subscriber id and the newsletter id (so we can credit
// the unsubscribe to the right campaign for analytics).

import { createHmac } from 'crypto';

const SECRET =
  process.env.NEWSLETTER_TOKEN_SECRET ||
  process.env.SESSION_SECRET ||
  'dev-secret-change-in-production';

interface UnsubscribePayload {
  sid: string;          // subscriber id
  nid?: string;         // newsletter id (optional)
  iat: number;          // issued at (ms)
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Buffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64');
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

export function buildUnsubscribeToken(subscriberId: string, newsletterId?: string): string {
  const payload: UnsubscribePayload = {
    sid: subscriberId,
    nid: newsletterId,
    iat: Date.now(),
  };
  const json = JSON.stringify(payload);
  const encoded = b64urlEncode(Buffer.from(json, 'utf8'));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): UnsubscribePayload | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const encoded = token.substring(0, dot);
  const signature = token.substring(dot + 1);
  const expected = sign(encoded);
  if (signature !== expected) return null;
  try {
    const json = b64urlDecode(encoded).toString('utf8');
    return JSON.parse(json) as UnsubscribePayload;
  } catch {
    return null;
  }
}
