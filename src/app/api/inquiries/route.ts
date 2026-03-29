import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseReady } from '@/lib/supabase';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { track } from '@vercel/analytics/server';
import { sendNotificationEmail } from '@/lib/email';

// Max 5 submission attempts per minute per IP for the public enrollment form
const INQUIRY_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: RATE_LIMITS.login.windowMs, // 1 minute
};

export async function POST(req: NextRequest) {
  // Rate limit check
  const rateCheck = applyRateLimit(req, 'inquiry', INQUIRY_RATE_LIMIT);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429, headers: rateCheck.headers }
    );
  }

  try {
    const data = await req.json();

    if (isSupabaseReady) {
      // Deduplication: reject duplicate submissions for the same email + child_name
      // within the last 24 hours.
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: existing, error: lookupError } = await supabase
        .from('enrollment_inquiries')
        .select('id')
        .eq('email', data.email)
        .eq('child_name', data.childName)
        .gte('created_at', oneDayAgo)
        .limit(1);

      if (lookupError) {
        console.error('Enrollment inquiry dedup check failed:', lookupError);
        // Fall through and still insert; do not block the user
      } else if (existing && existing.length > 0) {
        console.log(
          `Duplicate enrollment inquiry suppressed: email=${data.email}, child=${data.childName}`
        );
        return NextResponse.json({ success: true, duplicate: true });
      }

      // Insert new inquiry
      const { error: insertError } = await supabase
        .from('enrollment_inquiries')
        .insert({
          parent_name: data.parentName,
          email: data.email,
          phone: data.phone,
          child_name: data.childName,
          child_age: data.childAge,
          program: data.program,
          start_date: data.startDate || null,
          message: data.message || null,
          status: 'new',
        });

      if (insertError) {
        console.error('Enrollment inquiry insert failed:', insertError);
        // Do not expose DB errors to the user; still return success
      }
    }

    // Send email notification to the center owner
    await sendNotificationEmail(
      `New Enrollment Inquiry: ${data.childName}`,
      `<h2>New enrollment inquiry received</h2>
       <p><strong>Parent:</strong> ${data.parentName}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Phone:</strong> ${data.phone}</p>
       <p><strong>Child:</strong> ${data.childName}, ${data.childAge}</p>
       <p><strong>Program:</strong> ${data.program}</p>
       <p><strong>Start Date:</strong> ${data.startDate || 'Not specified'}</p>
       <p><strong>Message:</strong> ${data.message || 'None'}</p>
       <p><a href="https://christinas-childcare.vercel.app/admin/inquiries">View in admin dashboard</a></p>`
    );

    // Track conversion event
    try {
      await track('enrollment_inquiry', { program: data.program });
    } catch {
      // Analytics failure must not block the response
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Enrollment inquiry error:', error);
    // Return success even on unexpected errors so the user is not blocked
    return NextResponse.json({ success: true });
  }
}
