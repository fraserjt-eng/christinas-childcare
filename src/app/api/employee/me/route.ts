export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';

// The signed-in staff member's real employee record, from the verified
// session cookie (the PIN they entered), NOT localStorage. Single source of
// truth for "who is doing this" on a shared room iPad.
//
// Identity comes from resolveSessionEmployee (the SAME resolver /clock uses,
// proven to work, only safe columns). Profile contact fields are fetched in
// a SEPARATE, error-tolerant query: a missing/extra column there must never
// null out identity again (that bug hung every employee page on "Loading").
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ employee: null }, { status: 401 });
  }

  const employee = await resolveSessionEmployee(session);
  if (!employee) {
    return NextResponse.json({ employee: null }, { status: 404 });
  }

  // Optional profile fields for the profile screen. Best-effort: if a column
  // is absent or the query fails, return identity without them.
  let phone: string | null = null;
  let emergency_contact_name: string | null = null;
  let emergency_contact_phone: string | null = null;
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data } = await supabase
        .from('employees')
        .select('phone, emergency_contact_name, emergency_contact_phone')
        .eq('id', employee.id)
        .maybeSingle();
      if (data) {
        phone = (data.phone as string | null) ?? null;
        emergency_contact_name = (data.emergency_contact_name as string | null) ?? null;
        emergency_contact_phone = (data.emergency_contact_phone as string | null) ?? null;
      }
    }
  } catch {
    /* profile extras are optional; identity already resolved */
  }

  return NextResponse.json({
    employee: {
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      full_name: `${employee.first_name} ${employee.last_name}`.trim(),
      email: employee.email,
      role: employee.role,
      job_title: employee.job_title,
      center_id: employee.center_id,
      classroom_id: employee.classroom_id,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
    },
  });
}
