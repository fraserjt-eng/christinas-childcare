export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendFamilyEmail } from '@/lib/family-email';
import { logAudit, auditIp } from '@/lib/audit-log';

// Owner action on a pending family communication.
//   POST { action: 'approve' }            -> send it (email if Resend is on) +
//                                            mark sent; the parent now sees it.
//   POST { action: 'reject', note? }      -> send it back to draft with a note.
// Owner/superadmin only. A center-bound owner may only act on their own center.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession('owner');
  if (!session) {
    return NextResponse.json({ error: 'Owner sign-in required' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: { action?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const id = params.id;

  const { data: msg } = await supabase
    .from('parent_messages')
    .select('id, family_id, parent_email, subject, body, from_name, status')
    .eq('id', id)
    .maybeSingle();
  if (!msg) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }
  if (msg.status === 'sent') {
    return NextResponse.json({ error: 'This message was already sent' }, { status: 409 });
  }

  // Center scope: a center-bound owner may only act on a message to a family at
  // their center. Cross-center director (J/Christina) is exempt.
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'superadmin' || role === 'owner' || !myCenter;
  if (!crossCenter) {
    const { data: fam } = await supabase
      .from('families')
      .select('center_id')
      .eq('id', msg.family_id)
      .maybeSingle();
    if (!fam || (fam.center_id as string | null) !== myCenter) {
      return NextResponse.json({ error: 'Not your center' }, { status: 403 });
    }
  }

  if (body.action === 'reject') {
    await supabase
      .from('parent_messages')
      .update({
        status: 'draft',
        review_note: (body.note || '').trim() || null,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    await logAudit({
      actor: session.user,
      action: 'parent_message.reject',
      targetType: 'family',
      targetId: msg.family_id as string,
      centerId: myCenter,
      detail: { message_id: id },
      ip: auditIp(request),
    });
    return NextResponse.json({ ok: true, status: 'draft' });
  }

  if (body.action === 'approve') {
    const emailed = await sendFamilyEmail({
      to: msg.parent_email as string,
      subject: (msg.subject as string) || '',
      bodyText: (msg.body as string) || '',
      fromName: (msg.from_name as string) || "Christina's Child Care Center",
    });
    const { error } = await supabase
      .from('parent_messages')
      .update({
        status: 'sent',
        emailed,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      return NextResponse.json({ error: 'Could not send the message' }, { status: 500 });
    }
    await logAudit({
      actor: session.user,
      action: 'parent_message.approve_send',
      targetType: 'family',
      targetId: msg.family_id as string,
      centerId: myCenter,
      detail: { message_id: id, emailed },
      ip: auditIp(request),
    });
    return NextResponse.json({ ok: true, status: 'sent', emailed });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
