export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseReady } from '@/lib/supabase';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendNotificationEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/escape-html';

// Public endpoint: a family files a data deletion request. It records a tracked
// request and emails the director. It never deletes anything; fulfillment is a
// deliberate admin action under childcare record-retention limits.
const REQUEST_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: RATE_LIMITS.login.windowMs, // 1 minute per IP
};

export async function POST(req: NextRequest) {
  const rateCheck = applyRateLimit(req, 'data-request', REQUEST_RATE_LIMIT);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429, headers: rateCheck.headers }
    );
  }

  let data: {
    requesterName?: string;
    requesterEmail?: string;
    relationship?: string;
    childName?: string;
    reason?: string;
  };
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const name = (data.requesterName || '').trim();
  const email = (data.requesterEmail || '').trim();
  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please provide your name and a valid email address.' },
      { status: 400 }
    );
  }

  if (isSupabaseReady) {
    const { error } = await supabase.from('data_deletion_requests').insert({
      requester_name: name.slice(0, 200),
      requester_email: email.slice(0, 200),
      relationship: (data.relationship || '').trim().slice(0, 100) || null,
      child_name: (data.childName || '').trim().slice(0, 200) || null,
      reason: (data.reason || '').trim().slice(0, 2000) || null,
      status: 'new',
    });
    if (error) {
      // Do not expose internal details; the family still gets a path forward.
      console.error('Data deletion request insert failed:', error.message);
      return NextResponse.json(
        { error: 'We could not file your request automatically. Please email info@christinaschildcare.com and we will handle it.' },
        { status: 500 }
      );
    }
  }

  // Notify the director. All submitted values are escaped before going into the
  // email body.
  await sendNotificationEmail(
    `Data Deletion Request: ${name}`,
    `<h2>A family has requested deletion of their data</h2>
     <p><strong>Name:</strong> ${escapeHtml(name)}</p>
     <p><strong>Email:</strong> ${escapeHtml(email)}</p>
     <p><strong>Relationship:</strong> ${escapeHtml(data.relationship || 'Not specified')}</p>
     <p><strong>Child:</strong> ${escapeHtml(data.childName || 'Not specified')}</p>
     <p><strong>Reason:</strong> ${escapeHtml(data.reason || 'None given')}</p>
     <p>Review and action this in the admin Data Requests queue. Delete what you are able to, and keep only the records licensing requires you to retain.</p>
     <p><a href="https://christinas-childcare.vercel.app/admin/data-requests">Open the Data Requests queue</a></p>`
  );

  return NextResponse.json({ success: true });
}
