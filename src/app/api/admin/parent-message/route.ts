export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';

// Admin (or owner/superadmin) composes a direct message to a registered parent.
// Composing now saves a DRAFT (status='pending_review'); the actual send + email
// happen when an owner approves it from the review queue (see
// /api/admin/comms-review). requireSession('admin') allows owner + superadmin.

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email || '').toLowerCase().trim();
  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();

  if (!email || !subject || !message) {
    return NextResponse.json(
      { error: 'Recipient, subject, and message are all required' },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Only message a registered, active family.
  const { data: family } = await supabase
    .from('families')
    .select('id, email, status')
    .ilike('email', email)
    .maybeSingle();

  if (!family || family.status !== 'active') {
    return NextResponse.json(
      { error: 'That email is not a registered active family' },
      { status: 404 }
    );
  }

  const fromName = `${session.user.full_name || 'Christina’s Child Care Center'}`;

  // Composing saves a DRAFT for owner review — it does NOT send or email yet.
  // An owner approves it from the review queue, which is where the email + the
  // parent-portal post actually happen. So every outbound family message is
  // signed off before it reaches a parent (the "everything reviewed" rule).
  const { data: created, error: insErr } = await supabase
    .from('parent_messages')
    .insert({
      family_id: family.id,
      parent_email: family.email.toLowerCase(),
      subject,
      body: message,
      from_name: fromName,
      emailed: false,
      status: 'pending_review',
      created_by: session.user.id,
      created_by_name: fromName,
    })
    .select('id')
    .single();

  if (insErr || !created) {
    return NextResponse.json(
      { error: 'Could not save the message' },
      { status: 500 }
    );
  }

  await logAudit({
    actor: session.user,
    action: 'parent_message.draft_create',
    targetType: 'family',
    targetId: family.id,
    centerId: session.user.center_id ?? null,
    detail: { subject, message_id: created.id },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true, status: 'pending_review', id: created.id });
}
