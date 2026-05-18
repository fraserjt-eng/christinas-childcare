export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// Admin (or owner/superadmin) sends a direct message to a registered parent.
// It is saved server-side (shows in the parent's portal) and emailed.
// requireSession('admin') already allows owner + superadmin (higher rank).

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

  // Try to send the email first so we can record whether it went out.
  let emailed = false;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: "Christina's Child Care Center <notifications@christinaschildcare.com>",
          to: [family.email],
          reply_to: 'info@christinaschildcare.com',
          subject,
          html: `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.5;color:#222">
            <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="font-size:13px;color:#666">From ${escapeHtml(fromName)} at Christina&rsquo;s Child Care Center.
            You can also see this in your parent portal.</p>
          </div>`,
        }),
      });
      emailed = res.ok;
    } catch {
      emailed = false;
    }
  }

  const { error: insErr } = await supabase.from('parent_messages').insert({
    family_id: family.id,
    parent_email: family.email.toLowerCase(),
    subject,
    body: message,
    from_name: fromName,
    emailed,
  });

  if (insErr) {
    return NextResponse.json(
      { error: 'Could not save the message' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, emailed });
}
