export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { signPayload } from '@/lib/session';

/**
 * Multi-admin management (Phase 6). The owner adds and manages other backend
 * users (admin / owner) over time so additional directors get /admin access.
 *
 * The role is derived from the employees row at sign-in (see auth-allowlist.ts:
 * employees.role of owner/admin/director resolves to an 'admin'-rank session).
 * So creating an employees row with an elevated role + minting a set-password
 * link is all that is needed to grant backend access. No email is sent: the
 * owner copies the link and hands it to the new admin, same no-email invite
 * model as /api/admin/invite.
 *
 * All handlers gate on requireSession('admin') (rank >= admin) and never leak
 * error.message in responses, per the project security rules.
 */

// employees.role has a CHECK constraint (owner/admin/teacher/parent). 'director'
// is treated as an admin-rank role by the allowlist but is NOT a valid column
// value, so it is mapped to 'admin' on write while still being listed on read.
const BACKEND_ROLES = ['owner', 'admin', 'director'] as const;
const CREATE_ROLES = new Set(['admin', 'owner']);
const PATCH_ROLES = new Set(['admin', 'owner', 'teacher']);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface TeamUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  center_id: string | null;
  employment_status: string;
}

// GET: list current backend users (owner / admin / director). PostgREST gotcha:
// never combine .order with .eq filters (it can silently drop rows), so we
// fetch broad with .limit(5000) and sort in JS.
export async function GET() {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('employees')
    .select('id, first_name, last_name, email, role, center_id, employment_status')
    .in('role', BACKEND_ROLES as unknown as string[])
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: 'Could not load the team' }, { status: 500 });
  }

  const users = ((data as TeamUser[] | null) ?? []).slice().sort((a, b) => {
    const an = `${a.last_name || ''} ${a.first_name || ''}`.trim().toLowerCase();
    const bn = `${b.last_name || ''} ${b.first_name || ''}`.trim().toLowerCase();
    return an.localeCompare(bn);
  });

  // The centers list powers the "assign to center" select on the page (a new
  // admin is bound to one center; an owner spans all). Sorted in JS per the
  // PostgREST rule. Best-effort: a missing centers table just yields [].
  const { data: centerRows } = await supabase
    .from('centers')
    .select('id, name')
    .limit(5000);
  const centers = ((centerRows as { id: string; name: string | null }[] | null) ?? [])
    .map((c) => ({ id: c.id, name: c.name || 'Center' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ ok: true, users, centers });
}

// POST: create a backend user (admin or owner) and mint a set-password link.
// Body { firstName, lastName, email, role, centerId? }. centerId null = all
// centers (cross-center owner). The set-password link uses the SAME signed
// token logic as /api/admin/invite (signPayload, base64url, 7-day expiry).
export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    centerId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email || '').toLowerCase().trim();
  const first_name = (body.firstName || '').trim();
  const last_name = (body.lastName || '').trim();
  const role = (body.role || '').toLowerCase().trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!first_name || !last_name) {
    return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
  }
  if (!CREATE_ROLES.has(role)) {
    return NextResponse.json({ error: 'Role must be admin or owner' }, { status: 400 });
  }

  // An owner spans all centers (null center_id); an admin is bound to a center.
  // A bare empty string from the form maps to null.
  const centerId =
    role === 'owner'
      ? null
      : typeof body.centerId === 'string' && body.centerId.trim()
        ? body.centerId.trim()
        : null;

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Email is the durable login identity, so uniqueness is global (not
  // center-scoped), matching /api/admin/staff. Case-insensitive.
  const { data: emailClash } = await supabase
    .from('employees')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (emailClash) {
    return NextResponse.json(
      { error: 'A user with this email already exists' },
      { status: 409 }
    );
  }

  const { data: created, error: insErr } = await supabase
    .from('employees')
    .insert({
      first_name,
      last_name,
      email,
      role,
      center_id: centerId,
      employment_status: 'active',
      certifications: [],
      hire_date: new Date().toISOString().slice(0, 10),
    })
    .select('id, first_name, last_name, email, role, center_id, employment_status')
    .single();

  if (insErr || !created) {
    return NextResponse.json(
      { error: 'Could not create the user' },
      { status: 500 }
    );
  }

  // Mint a "set your password" link with the SAME logic as /api/admin/invite:
  // a short-lived signed token pointing at our own /set-password page.
  let token: string;
  try {
    const payload = {
      email,
      purpose: 'setpw',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    token = `${b64}.${signPayload(b64)}`;
  } catch {
    // The user row was created, but the link could not be minted (no secret).
    // Report partial success so the UI can prompt to re-mint once configured.
    return NextResponse.json(
      {
        ok: true,
        user: created,
        link: null,
        warning: 'User created, but the setup link could not be generated (SESSION_SECRET).',
      },
      { status: 201 }
    );
  }

  const origin = new URL(request.url).origin;
  const link = `${origin}/set-password?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ ok: true, user: created, link }, { status: 201 });
}

// PATCH: change a user's role. Body { id, role }. The only-owner safeguard
// prevents demoting the last remaining owner (which would lock everyone out of
// owner-level controls).
export async function PATCH(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { id?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const id = (body.id || '').trim();
  const role = (body.role || '').toLowerCase().trim();

  if (!id) {
    return NextResponse.json({ error: 'A user id is required' }, { status: 400 });
  }
  if (!PATCH_ROLES.has(role)) {
    return NextResponse.json(
      { error: 'Role must be admin, owner, or teacher' },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Resolve the target so we know its current role (only-owner guard) and its
  // center (cross-center guard).
  const { data: target } = await supabase
    .from('employees')
    .select('id, role, center_id')
    .eq('id', id)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Cross-center guard: an admin is bound to one center and may only manage
  // users in that center. owner/superadmin span all centers and skip this.
  // A center-bound admin with no resolvable center cannot manage anyone in
  // another center (which, with a null session center, is everyone but their
  // own null-center peers).
  const callerRole = (session.user.role || '').toLowerCase();
  const isCrossCenter = callerRole === 'owner' || callerRole === 'superadmin';
  if (!isCrossCenter) {
    const callerCenter = session.user.center_id ?? null;
    const targetCenter = (target as { center_id?: string | null }).center_id ?? null;
    if (callerCenter !== targetCenter) {
      return NextResponse.json(
        { error: 'You can only manage users in your own center.' },
        { status: 403 }
      );
    }
  }

  // Only-owner safeguard: if this row is currently an owner and the change
  // would drop it below owner, refuse when it is the sole active owner. That
  // keeps at least one owner able to manage access.
  const currentRole = String((target as { role?: string }).role || '').toLowerCase();
  if (currentRole === 'owner' && role !== 'owner') {
    const { data: owners } = await supabase
      .from('employees')
      .select('id')
      .eq('role', 'owner')
      .eq('employment_status', 'active')
      .limit(5000);
    const activeOwners = (owners ?? []).filter((o) => (o as { id: string }).id !== id);
    if (activeOwners.length === 0) {
      return NextResponse.json(
        { error: 'Cannot change the only owner. Promote another owner first.' },
        { status: 409 }
      );
    }
  }

  const { error: updErr } = await supabase
    .from('employees')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updErr) {
    return NextResponse.json({ error: 'Could not update the role' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
