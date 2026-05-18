export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// The signed-in staff member's real employee record, derived from the verified
// session cookie (the PIN they just entered), NOT browser localStorage.
//
// This is the single source of truth for "who is doing this" on a shared room
// iPad. Every employee action (clock in/out, naps, incidents, food counts,
// notes) should attribute to THIS, so a shared device records the actual
// person, like nurse charting on a shared workstation.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ employee: null }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ employee: null }, { status: 503 });
  }

  // The staff-pin login sets the session user.id to the employees row id;
  // fall back to email match for sessions minted another way.
  let employee = null;
  if (session.user.id) {
    const { data } = await supabase
      .from('employees')
      .select(
        'id, first_name, last_name, email, role, job_title, pin, employment_status, center_id, phone, address, emergency_contact_name, emergency_contact_phone'
      )
      .eq('id', session.user.id)
      .maybeSingle();
    employee = data ?? null;
  }
  if (!employee && session.user.email) {
    const { data } = await supabase
      .from('employees')
      .select(
        'id, first_name, last_name, email, role, job_title, pin, employment_status, center_id, phone, address, emergency_contact_name, emergency_contact_phone'
      )
      .ilike('email', session.user.email)
      .maybeSingle();
    employee = data ?? null;
  }

  if (!employee || employee.employment_status !== 'active') {
    return NextResponse.json({ employee: null }, { status: 404 });
  }

  // Never expose the PIN to the client.
  const { pin: _pin, ...safe } = employee;
  void _pin;
  return NextResponse.json({
    employee: { ...safe, full_name: `${employee.first_name} ${employee.last_name}`.trim() },
  });
}
