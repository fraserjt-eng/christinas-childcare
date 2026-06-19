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
  // The center the new hire belongs to. A center-bound admin always creates
  // staff in their OWN center; a cross-center owner/superadmin (null center)
  // falls back to the legacy "reuse an existing center" behavior below.
  const centerId = session.user.center_id ?? null;

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
  // These two checks are intentionally GLOBAL (not center-scoped): email is
  // the durable login identity and PIN is the sole credential the door/login
  // lookup matches on (it queries by pin + employment_status='active' with no
  // center filter), so both must be unique across the whole system, not just
  // within one center. A center-scoped check would let two centers mint the
  // same PIN and make the login lookup ambiguous.
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

  // employees.center_id references centers(id). When the admin is bound to a
  // center, the new hire goes into THAT center (centerId from the session,
  // resolved at the top). Only a cross-center owner/superadmin (null center)
  // falls back to the legacy "reuse an existing center" behavior so the FK is
  // still satisfied (copy from any current employee, else first center).
  let resolvedCenterId: string | null = centerId;
  if (!resolvedCenterId) {
    const { data: anyEmp } = await supabase
      .from('employees')
      .select('center_id')
      .not('center_id', 'is', null)
      .limit(1)
      .maybeSingle();
    resolvedCenterId = anyEmp?.center_id ?? null;
    if (!resolvedCenterId) {
      const { data: center } = await supabase
        .from('centers')
        .select('id')
        .limit(1)
        .maybeSingle();
      resolvedCenterId = center?.id ?? null;
    }
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
      center_id: resolvedCenterId,
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

// Update a staff member server-side so PIN/role/status/etc. actually persist.
// The old client path called supabase.from('employees').update() with the
// anon key, which the employees RLS policy (admin/owner only) silently denies.
// The admin's browser saw the change in localStorage but the database did not,
// so the new PIN never worked at login. Same root cause already fixed for
// families. Body: { id?, email?, ...updates }. id wins; email is a fallback.
// Only fields that exist as real columns on public.employees. permissions and
// pageAccess live on the client Employee type but have no DB column yet, so
// including them here would make Postgres reject the whole UPDATE with a 500.
// Until those columns are added, the dialog continues to cache them locally.
const UPDATABLE_FIELDS = new Set([
  'first_name',
  'last_name',
  'email',
  'phone',
  'role',
  'pin',
  'job_title',
  'hourly_rate',
  'hire_date',
  'employment_status',
  'certifications',
  'emergency_contact_name',
  'emergency_contact_phone',
  'classroom_id',
]);

export async function PATCH(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // The center this admin is bound to. A center-bound admin may only edit
  // staff in their own center (authz check after the row is resolved below);
  // a cross-center owner/superadmin (null center) may edit anyone.
  const centerId = session.user.center_id ?? null;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Lookup precedence: id > email_lookup > email. email_lookup exists so a
  // rename ({ email_lookup: 'old@x', email: 'new@x' }) is unambiguous: the
  // email field in the body is always the *new* value when email_lookup is
  // provided, never the lookup key.
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const emailLookup =
    typeof body.email_lookup === 'string' ? body.email_lookup.toLowerCase().trim() : '';
  const emailAsLookup =
    !id && !emailLookup && typeof body.email === 'string'
      ? body.email.toLowerCase().trim()
      : '';
  if (!id && !emailLookup && !emailAsLookup) {
    return NextResponse.json(
      { error: 'id or email is required to identify the staff member' },
      { status: 400 }
    );
  }

  // Whitelist the updates. Anything not in UPDATABLE_FIELDS is silently dropped.
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === 'id' || key === 'email' || key === 'email_lookup') continue;
    if (UPDATABLE_FIELDS.has(key)) updates[key] = value;
  }

  // body.email is treated as a rename when an explicit lookup key was provided
  // (id or email_lookup). When email is itself the lookup (legacy path), no
  // rename is performed.
  if (typeof body.email === 'string' && (id || emailLookup)) {
    const newEmail = body.email.toLowerCase().trim();
    if (newEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    updates.email = newEmail;
  }

  if ('pin' in updates) {
    const pin = String(updates.pin || '').trim();
    if (!/^\d{4,8}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 4 to 8 digits' }, { status: 400 });
    }
    updates.pin = pin;
  }

  // Empty classroom selection clears the assignment (back to unassigned).
  if ('classroom_id' in updates) {
    const v = String(updates.classroom_id ?? '').trim();
    updates.classroom_id = v === '' ? null : v;
  }

  if ('role' in updates) {
    const raw = String(updates.role || '').toLowerCase();
    const role =
      raw === 'superadmin'
        ? 'admin'
        : ALLOWED_ROLES.has(raw)
          ? raw
          : raw === 'director'
            ? 'admin'
            : 'teacher';
    updates.role = role;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields supplied' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Resolve the row id once so subsequent uniqueness checks can exclude self.
  // Also pull the target's center_id for the center-membership authz check.
  let resolvedId = id;
  let targetCenterId: string | null = null;
  if (!resolvedId) {
    const lookup = emailLookup || emailAsLookup;
    const { data: byEmail } = await supabase
      .from('employees')
      .select('id, center_id')
      .ilike('email', lookup)
      .maybeSingle();
    if (!byEmail) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    resolvedId = byEmail.id;
    targetCenterId = byEmail.center_id ?? null;
  } else {
    const { data: byId } = await supabase
      .from('employees')
      .select('id, center_id')
      .eq('id', resolvedId)
      .maybeSingle();
    if (!byId) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    targetCenterId = byId.center_id ?? null;
  }

  // Center-membership authz: a center-bound admin may only edit staff in their
  // own center. A cross-center owner/superadmin (null center) skips this.
  if (centerId && targetCenterId !== centerId) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  // PIN must remain unique among active employees so the login lookup is
  // deterministic. Excluding self lets the admin "set the same PIN" no-op.
  // Kept GLOBAL (not center-scoped) on purpose: the login/door lookup matches
  // on pin alone, so the same PIN in two centers would make it ambiguous.
  if (typeof updates.pin === 'string') {
    const { data: pinClash } = await supabase
      .from('employees')
      .select('id')
      .eq('pin', updates.pin)
      .eq('employment_status', 'active')
      .neq('id', resolvedId)
      .limit(1)
      .maybeSingle();
    if (pinClash) {
      return NextResponse.json(
        { error: 'That PIN is already in use. Choose a different one.' },
        { status: 409 }
      );
    }
  }

  // Email uniqueness on rename. Also GLOBAL on purpose: email is the durable
  // login identity, unique system-wide, not per-center.
  if (typeof updates.email === 'string' && updates.email) {
    const { data: emailClash } = await supabase
      .from('employees')
      .select('id')
      .ilike('email', updates.email)
      .neq('id', resolvedId)
      .maybeSingle();
    if (emailClash) {
      return NextResponse.json(
        { error: 'A staff member with this email already exists' },
        { status: 409 }
      );
    }
  }

  const { data: updated, error: updErr } = await supabase
    .from('employees')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', resolvedId)
    .select('id, pin, role, employment_status, first_name, last_name, email')
    .single();

  if (updErr || !updated) {
    return NextResponse.json(
      { error: 'Could not update the staff member' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, employee: updated });
}

// Remove a staff member from active duty. Their PIN stops working immediately
// (the PIN auth query filters employment_status='active'), they drop off the
// active staff grid, and their history (time entries, attendance, pay stubs,
// training records, HR documents, photos, communications) is preserved for
// childcare compliance. Hard delete is intentionally NOT supported here: 11
// of 13 foreign keys to employees are ON DELETE NO ACTION, so a real DELETE
// would either fail with a constraint violation or orphan compliance-critical
// rows. ?email=<staff email>
export async function DELETE(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // The center this admin is bound to. A center-bound admin may only
  // deactivate staff in their own center; a cross-center owner/superadmin
  // (null center) may deactivate anyone.
  const centerId = session.user.center_id ?? null;

  const email = (new URL(request.url).searchParams.get('email') || '')
    .toLowerCase()
    .trim();
  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Resolve the target row(s) by email FIRST so the soft-delete can be scoped
  // to specific ids and gated by center membership. The previous code ran a
  // bare .ilike('email', email) UPDATE, which would deactivate a matching
  // staff member in ANY center: a cross-center hazard. We fetch broad, then
  // enforce center authz, then update by id.
  const { data: matches, error: lookupErr } = await supabase
    .from('employees')
    .select('id, center_id, first_name, last_name')
    .ilike('email', email)
    .limit(5000);

  if (lookupErr) {
    return NextResponse.json(
      { error: 'Could not deactivate the staff member' },
      { status: 500 }
    );
  }
  if (!matches || matches.length === 0) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
  }

  // Center-membership authz: a center-bound admin may only act on staff in
  // their own center. Filter the matched rows to that center; if nothing
  // remains, the target is not theirs. A cross-center owner (null center)
  // keeps every match.
  const inScope = centerId
    ? matches.filter((m) => (m.center_id ?? null) === centerId)
    : matches;
  if (inScope.length === 0) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  const ids = inScope.map((m) => m.id as string);

  // Soft delete: deactivate. PIN auth already filters on active, so the PIN
  // stops working at the door without touching any referencing rows. Scoped
  // to the in-scope ids (filter in JS already done; .in here on a tiny id set
  // for a single staff email is safe, not a many-uuid query).
  const { data, error } = await supabase
    .from('employees')
    .update({
      employment_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .in('id', ids)
    .select('id, first_name, last_name, employment_status');

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      { error: error ? 'Could not deactivate the staff member' : 'Staff member not found' },
      { status: error ? 500 : 404 }
    );
  }

  return NextResponse.json({ ok: true, deactivated: data });
}
