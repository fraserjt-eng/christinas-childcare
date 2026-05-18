export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// Create a staff member in the LIVE employees table so their PIN works at
// login/kiosk. The old "Add User" path wrote employees only to the admin's
// browser (client dual-write is RLS-blocked for anon), so PIN login failed.
// This runs server-side with the service role.

const ALLOWED_ROLES = new Set(['owner', 'admin', 'teacher']);

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
    pin?: string;
    job_title?: string;
    hourly_rate?: number;
    hire_date?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email || '').toLowerCase().trim();
  const first_name = (body.first_name || '').trim();
  const last_name = (body.last_name || '').trim();
  const pin = (body.pin || '').trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!first_name || !last_name) {
    return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
  }
  if (!/^\d{4,8}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be 4 to 8 digits' }, { status: 400 });
  }

  // employees.role has a CHECK constraint (owner/admin/teacher/parent). Map
  // anything elevated down to admin; default to teacher.
  const rawRole = (body.role || 'teacher').toLowerCase();
  const role =
    rawRole === 'superadmin' || rawRole === 'owner' || rawRole === 'admin' || rawRole === 'director'
      ? rawRole === 'superadmin'
        ? 'admin'
        : ALLOWED_ROLES.has(rawRole)
          ? rawRole
          : 'admin'
      : 'teacher';

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Unique email + PIN not already in use by an active employee.
  const { data: emailClash } = await supabase
    .from('employees')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (emailClash) {
    return NextResponse.json(
      { error: 'A staff member with this email already exists' },
      { status: 409 }
    );
  }
  const { data: pinClash } = await supabase
    .from('employees')
    .select('id')
    .eq('pin', pin)
    .eq('employment_status', 'active')
    .limit(1)
    .maybeSingle();
  if (pinClash) {
    return NextResponse.json(
      { error: 'That PIN is already in use. Choose a different one.' },
      { status: 409 }
    );
  }

  // employees.center_id references centers(id). Reuse an existing center so
  // the FK is satisfied (copy from any current employee, else first center).
  let centerId: string | null = null;
  const { data: anyEmp } = await supabase
    .from('employees')
    .select('center_id')
    .not('center_id', 'is', null)
    .limit(1)
    .maybeSingle();
  centerId = anyEmp?.center_id ?? null;
  if (!centerId) {
    const { data: center } = await supabase
      .from('centers')
      .select('id')
      .limit(1)
      .maybeSingle();
    centerId = center?.id ?? null;
  }

  const { data: created, error: insErr } = await supabase
    .from('employees')
    .insert({
      email,
      first_name,
      last_name,
      phone: body.phone?.trim() || null,
      role,
      pin,
      job_title: body.job_title?.trim() || null,
      hourly_rate: Number.isFinite(body.hourly_rate) ? body.hourly_rate : null,
      hire_date: body.hire_date || new Date().toISOString().slice(0, 10),
      employment_status: 'active',
      certifications: [],
      center_id: centerId,
      emergency_contact_name: body.emergency_contact_name?.trim() || null,
      emergency_contact_phone: body.emergency_contact_phone?.trim() || null,
    })
    .select('id')
    .single();

  if (insErr || !created) {
    return NextResponse.json(
      { error: 'Could not create the staff member' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: created.id, role });
}
