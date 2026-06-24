export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { signPayload } from '@/lib/session';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';

// Completes the admin-issued setup link. Verifies our own signed token (no
// Supabase hosted flow) and sets the password where it is actually checked:
//  - a parent  -> families.password_hash (sha256, the parent-login store)
//  - a staff    -> Supabase Auth user password (best effort; staff also PIN)
// Public on purpose: the signed token IS the proof of email ownership.

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function verifyToken(
  token: string
): { email: string } | null {
  const lastDot = token.lastIndexOf('.');
  if (lastDot < 1) return null;
  const b64 = token.substring(0, lastDot);
  const sig = token.substring(lastDot + 1);
  let expected: string;
  try {
    expected = signPayload(b64);
  } catch {
    return null;
  }
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(b64, 'base64url').toString('utf8')
    ) as { email?: string; purpose?: string; exp?: number };
    if (payload.purpose !== 'setpw') return null;
    if (!payload.email || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return { email: payload.email.toLowerCase().trim() };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const verified = verifyToken((body.token || '').trim());
  if (!verified) {
    return NextResponse.json(
      { error: 'This link is invalid or has expired. Ask the director to resend it.' },
      { status: 401 }
    );
  }
  const password = body.password || '';
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Use at least 8 characters.' },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
  const email = verified.email;

  // ---- Parent path: the families password store ----
  let familyId: string | null = null;
  const { data: famByEmail } = await supabase
    .from('families')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (famByEmail) {
    familyId = famByEmail.id as string;
  } else {
    const { data: parentRow } = await supabase
      .from('family_parents')
      .select('family_id')
      .ilike('email', email)
      .maybeSingle();
    if (parentRow?.family_id) familyId = parentRow.family_id as string;
  }

  if (familyId) {
    const { error } = await supabase
      .from('families')
      .update({ password_hash: sha256Hex(password), status: 'active' })
      .eq('id', familyId);
    if (error) {
      return NextResponse.json(
        { error: 'Could not set the password.' },
        { status: 500 }
      );
    }
    await logAudit({
      actor: { email },
      action: 'credential.set_password',
      targetType: 'family',
      targetId: familyId,
      detail: { subject: 'family' },
      ip: auditIp(request),
    });
    return NextResponse.json({
      ok: true,
      kind: 'parent',
      email,
      loginPath: '/login',
    });
  }

  // ---- Staff path: Supabase Auth password (staff usually use a PIN) ----
  const { data: emp } = await supabase
    .from('employees')
    .select('id, email')
    .ilike('email', email)
    .maybeSingle();
  if (emp) {
    try {
      const { data: list } = await supabase.auth.admin.listUsers();
      const authUser = list?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );
      if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, { password });
      } else {
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      }
    } catch {
      // Staff can still sign in with their PIN; surface success regardless.
    }
    await logAudit({
      actor: { email },
      action: 'credential.set_password',
      targetType: 'employee',
      targetId: emp.id as string,
      detail: { subject: 'employee' },
      ip: auditIp(request),
    });
    return NextResponse.json({
      ok: true,
      kind: 'staff',
      email,
      loginPath: '/admin-login',
    });
  }

  return NextResponse.json(
    { error: 'No account found for this email. Ask the director to add you first.' },
    { status: 404 }
  );
}
