import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { track } from '@vercel/analytics/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Save to Supabase (if connected, otherwise gracefully skip)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      await supabase.from('tour_requests').insert({
        parent_name: data.parentName,
        email: data.email,
        phone: data.phone,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        number_of_children: data.numberOfChildren || null,
        children_ages: data.childrenAges || null,
        questions: data.questions || null,
        status: 'new',
      });
    }

    // Track conversion event
    try {
      await track('tour_scheduled', {});
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tour request error:', error);
    return NextResponse.json({ success: true }); // Don't block the user on backend errors
  }
}
