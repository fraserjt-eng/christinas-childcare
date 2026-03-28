import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { track } from '@vercel/analytics/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Save to Supabase (if connected, otherwise gracefully skip)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      await supabase.from('enrollment_inquiries').insert({
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
    }

    // Track conversion event
    try {
      await track('enrollment_inquiry', { program: data.program });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Enrollment inquiry error:', error);
    return NextResponse.json({ success: true }); // Don't block the user on backend errors
  }
}
