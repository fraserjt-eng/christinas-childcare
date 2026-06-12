export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseReady } from '@/lib/supabase';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { track } from '@vercel/analytics/server';
import { sendNotificationEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/escape-html';

// Max 5 tour requests per minute per IP for the public scheduling form
const TOUR_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: RATE_LIMITS.login.windowMs, // 1 minute
};

export async function POST(req: NextRequest) {
  // Rate limit check
  const rateCheck = applyRateLimit(req, 'tour', TOUR_RATE_LIMIT);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429, headers: rateCheck.headers }
    );
  }

  try {
    const data = await req.json();

    if (isSupabaseReady) {
      const { error: insertError } = await supabase
        .from('tour_requests')
        .insert({
          parent_name: data.parentName,
          email: data.email,
          phone: data.phone,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          number_of_children: data.numberOfChildren || null,
          children_ages: data.childrenAges || null,
          questions: data.questions || null,
          status: 'pending',
        });

      if (insertError) {
        console.error('Tour request insert failed:', insertError);
        // Do not expose DB errors to the user; still return success
      }
    }

    // Send email notification to the center owner
    await sendNotificationEmail(
      `New Tour Request: ${data.parentName}`,
      `<h2>New tour request received</h2>
       <p><strong>Parent:</strong> ${escapeHtml(data.parentName)}</p>
       <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
       <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
       <p><strong>Preferred Date:</strong> ${escapeHtml(data.preferredDate)}</p>
       <p><strong>Preferred Time:</strong> ${escapeHtml(data.preferredTime)}</p>
       <p><strong>Number of Children:</strong> ${escapeHtml(data.numberOfChildren || 'Not specified')}</p>
       <p><strong>Children Ages:</strong> ${escapeHtml(data.childrenAges || 'Not specified')}</p>
       <p><strong>Questions:</strong> ${escapeHtml(data.questions || 'None')}</p>
       <p><a href="https://christinas-childcare.vercel.app/admin/tours">View in admin dashboard</a></p>`
    );

    // Track conversion event
    try {
      await track('tour_scheduled', {});
    } catch {
      // Analytics failure must not block the response
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tour request error:', error);
    // Return success even on unexpected errors so the user is not blocked
    return NextResponse.json({ success: true });
  }
}
