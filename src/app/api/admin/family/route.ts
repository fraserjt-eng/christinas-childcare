export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';
import { syncFamilyChildren } from '@/lib/family-children-sync';
import { normalizeEndDate } from '@/lib/enrollment-end';

// Center scoping: a director who is owner/superadmin, OR has no session center,
// may pick a center via the cc_center cookie or ?center; otherwise the caller is
// locked to their own session center_id.
function deriveCenterId(
  request: NextRequest,
  session: AuthedSession
): string | null {
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  const isCrossCenter =
    role === 'owner' || role === 'superadmin';
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;
  if (isCrossCenter) return picked || sessionCenter;
  return sessionCenter;
}

// "See/edit all centers" power belongs ONLY to a true owner/superadmin. A
// center-bound admin -- or a misconfigured admin with no center -- is not this,
// so when the derived center is null these handlers fail CLOSED for them.
function isSuperRole(session: AuthedSession): boolean {
  const role = (session.user.role || '').toLowerCase();
  return role === 'owner' || role === 'superadmin';
}

// Admin-only: create a real family in the LIVE tables so it can clock in at the
// kiosk by PIN. After migration 017 anon cannot write families, so this must
// run server-side with the service role. The role of this account is always a
// family (kiosk PIN); a parent-portal password can be set later via a link.

interface ChildInput {
  id?: string; // existing row id, so an edit updates in place instead of orphaning attendance
  name?: string;
  date_of_birth?: string;
  classroom?: string; // legacy display label (room name)
  classroom_id?: string; // real FK to classrooms(id); drives teacher access scoping
  end_date?: string | null; // last day of care (inclusive); null/'' = still enrolled
  end_reason?: string | null;
}

async function uniquePin(
  supabase: ReturnType<typeof getServerSupabase>
): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('families').select('pin');
  const used = new Set((data ?? []).map((r: { pin: string | null }) => r.pin));
  for (let i = 0; i < 200; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    if (!used.has(pin)) return pin;
  }
  return null;
}

// List live families for User Management (admin only). The list page reads
// browser storage for staff; families live in Supabase, so without this they
// never appear even though they work at the kiosk.
export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const centerId = deriveCenterId(request, session);
  // Fail closed: a non-superadmin with no resolved center must never read all
  // centers' families.
  if (!centerId && !isSuperRole(session)) {
    return NextResponse.json({ families: [] });
  }

  // Fetch broad, join in JS (PostgREST .in() can silently drop rows).
  let famQuery = supabase
    .from('families')
    .select('id, email, status, pin, created_at, center_id, end_date, end_reason')
    .limit(5000);
  if (centerId) famQuery = famQuery.eq('center_id', centerId);
  const { data: fams } = await famQuery;
  const { data: parents } = await supabase
    .from('family_parents')
    .select('family_id, name, phone, is_primary')
    .limit(5000);
  // The child `id` is required, not cosmetic: the edit form sends it back so the
  // PUT updates rows in place. Without it every edit re-creates the children
  // with new ids and orphans their attendance from the roster (blank DOB in the
  // DHS export). Centers are listed so the move-family control can name them.
  const { data: kids } = await supabase
    .from('family_children')
    .select('id, family_id, name, date_of_birth, classroom, classroom_id, end_date, end_reason')
    .limit(5000);
  const { data: centers } = await supabase
    .from('centers')
    .select('id, name, is_active')
    .limit(200);

  const families = (fams || [])
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map((f) => {
      const ps = (parents || []).filter((p) => p.family_id === f.id);
      const primary = ps.find((p) => p.is_primary) || ps[0];
      const children = (kids || [])
        .filter((k) => k.family_id === f.id)
        .map((k) => ({
          id: k.id,
          name: k.name,
          date_of_birth: k.date_of_birth || '',
          classroom: k.classroom || '',
          classroom_id: k.classroom_id || '',
          end_date: k.end_date || '',
          end_reason: k.end_reason || '',
        }));
      return {
        id: f.id,
        email: f.email,
        status: f.status,
        pin: f.pin,
        created_at: f.created_at,
        center_id: f.center_id || '',
        end_date: f.end_date || '',
        end_reason: f.end_reason || '',
        parentName: primary?.name || '',
        phone: primary?.phone || '',
        children,
      };
    });

  return NextResponse.json({
    families,
    centers: (centers || [])
      .filter((c) => c.is_active)
      .map((c) => ({ id: c.id as string, name: (c.name as string) || '' })),
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json(
      {
        error:
          'Your admin sign-in is not active (you may be signed in as a parent or staff, or it expired). Sign out, then sign in at the admin login with your admin account and try again.',
      },
      { status: 401 }
    );
  }

  let body: {
    email?: string;
    parentName?: string;
    parentPhone?: string;
    pin?: string;
    children?: ChildInput[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email || '').toLowerCase().trim();
  const parentName = (body.parentName || '').trim();
  const children = (body.children || []).filter((c) => (c.name || '').trim());

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid family email is required' }, { status: 400 });
  }
  if (!parentName) {
    return NextResponse.json({ error: 'A parent/guardian name is required' }, { status: 400 });
  }
  if (children.length === 0) {
    return NextResponse.json({ error: 'Add at least one child' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // PIN: caller-provided 4 digits, else generate a unique one.
  let pin = (body.pin || '').trim();
  if (pin && !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }
  if (!pin) {
    const generated = await uniquePin(supabase);
    if (!generated) {
      return NextResponse.json({ error: 'Could not allocate a PIN' }, { status: 500 });
    }
    pin = generated;
  } else {
    const { data: clash } = await supabase
      .from('families')
      .select('id')
      .eq('pin', pin)
      .limit(1);
    if (clash && clash.length > 0) {
      return NextResponse.json({ error: 'That PIN is already in use' }, { status: 409 });
    }
  }

  // Existing family with this email?
  const { data: existing } = await supabase
    .from('families')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'A family with this email already exists' },
      { status: 409 }
    );
  }

  // Unusable password until the parent sets one via a link later. Kiosk uses PIN.
  const placeholderHash = createHash('sha256')
    .update('nologin:' + randomBytes(16).toString('hex'))
    .digest('hex');

  const centerId = deriveCenterId(request, session);
  if (!centerId && !isSuperRole(session)) {
    return NextResponse.json({ error: 'No center for this account' }, { status: 403 });
  }

  const { data: family, error: famErr } = await supabase
    .from('families')
    .insert({
      email,
      password_hash: placeholderHash,
      pin,
      status: 'active',
      center_id: centerId || '3104ae69-4f26-4c1e-a767-3ff45b534860',
    })
    .select('id')
    .single();

  if (famErr || !family) {
    return NextResponse.json({ error: 'Could not create the family' }, { status: 500 });
  }

  await supabase.from('family_parents').insert({
    family_id: family.id,
    name: parentName,
    phone: body.parentPhone?.trim() || null,
    email,
    relationship: 'guardian',
    is_primary: true,
  });

  const childRows = children.map((c) => ({
    family_id: family.id,
    name: (c.name as string).trim(),
    date_of_birth: c.date_of_birth?.trim() || null,
    classroom: c.classroom?.trim() || null,
    classroom_id: c.classroom_id?.trim() || null,
  }));
  const { error: kidErr } = await supabase
    .from('family_children')
    .insert(childRows);

  if (kidErr) {
    // Roll back the family so we do not leave a childless, un-clockable record.
    await supabase.from('families').delete().eq('id', family.id);
    return NextResponse.json({ error: 'Could not add the children' }, { status: 500 });
  }

  await logAudit({
    actor: session.user,
    action: 'family.create',
    targetType: 'family',
    targetId: family.id,
    centerId: centerId ?? session.user.center_id ?? null,
    detail: { children: childRows.length, parents: 1 },
    ip: auditIp(request),
  });

  return NextResponse.json({
    ok: true,
    familyId: family.id,
    pin,
    childCount: childRows.length,
  });
}

// Permanently delete a family (their kiosk PIN stops working immediately):
// the family row plus its parents, children, attendance, and messages.
// ?id=<family uuid>
export async function DELETE(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = (new URL(request.url).searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data: fam } = await supabase
    .from('families')
    .select('id, email, center_id')
    .eq('id', id)
    .maybeSingle();
  if (!fam) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 });
  }

  const centerId = deriveCenterId(request, session);
  // Only an owner/superadmin may act outside a matched center; a center-bound
  // (or null-center) admin must match the family's own center.
  if (!isSuperRole(session) && (!centerId || fam.center_id !== centerId)) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  // Clear attendance for this family's children before the cascade removes
  // the child rows (attendance has no FK, so it would orphan otherwise).
  const { data: kids } = await supabase
    .from('family_children')
    .select('id')
    .eq('family_id', id);
  const childIds = (kids || []).map((k) => k.id);
  if (childIds.length > 0) {
    await supabase.from('attendance').delete().in('child_id', childIds);
  }

  if (fam.email) {
    await supabase
      .from('parent_messages')
      .delete()
      .ilike('parent_email', fam.email);
  }

  // family_parents + family_children cascade on the families delete.
  const { error } = await supabase.from('families').delete().eq('id', id);
  if (error) {
    return NextResponse.json(
      { error: 'Could not delete the family' },
      { status: 500 }
    );
  }

  await logAudit({
    actor: session.user,
    action: 'family.delete',
    targetType: 'family',
    targetId: id,
    centerId: fam.center_id ?? session.user.center_id ?? null,
    detail: { children: childIds.length },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true });
}

// Edit a family: parent name/phone/email, kiosk PIN, and the children list.
// Body: { id, email, parentName, parentPhone?, pin?, children:[{name,...}] }
export async function PUT(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    id?: string;
    email?: string;
    parentName?: string;
    parentPhone?: string;
    pin?: string;
    children?: ChildInput[];
    end_date?: string | null;
    end_reason?: string | null;
    center_id?: string; // move the whole household to another center
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const id = (body.id || '').trim();
  const email = (body.email || '').toLowerCase().trim();
  const parentName = (body.parentName || '').trim();
  const children = (body.children || []).filter((c) => (c.name || '').trim());

  if (!id) {
    return NextResponse.json({ error: 'Family id is required' }, { status: 400 });
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid family email is required' }, { status: 400 });
  }
  if (!parentName) {
    return NextResponse.json({ error: 'A parent/guardian name is required' }, { status: 400 });
  }
  if (children.length === 0) {
    return NextResponse.json({ error: 'Add at least one child' }, { status: 400 });
  }

  const pin = (body.pin || '').trim();
  if (pin && !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }

  // End dates are validated before anything is written. An unparseable date
  // must fail loudly: silently treating it as "no end date" would put a
  // departed child back on the live kiosk roster.
  const famEnd = normalizeEndDate(body.end_date);
  if (famEnd === undefined) {
    return NextResponse.json(
      { error: 'The family end date must be a real date (YYYY-MM-DD)' },
      { status: 400 }
    );
  }
  const childEnds: (string | null)[] = [];
  for (const c of children) {
    const e = normalizeEndDate(c.end_date);
    if (e === undefined) {
      return NextResponse.json(
        { error: `The end date for ${(c.name || 'a child').trim()} must be a real date (YYYY-MM-DD)` },
        { status: 400 }
      );
    }
    childEnds.push(e);
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data: fam } = await supabase
    .from('families')
    .select('id, pin, center_id')
    .eq('id', id)
    .maybeSingle();
  if (!fam) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 });
  }

  const centerId = deriveCenterId(request, session);
  if (!isSuperRole(session) && (!centerId || fam.center_id !== centerId)) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  // Email must stay unique across other families.
  const { data: emailClash } = await supabase
    .from('families')
    .select('id')
    .ilike('email', email)
    .neq('id', id)
    .maybeSingle();
  if (emailClash) {
    return NextResponse.json(
      { error: 'Another family already uses this email' },
      { status: 409 }
    );
  }

  const newPin = pin || fam.pin;
  if (pin && pin !== fam.pin) {
    const { data: pinClash } = await supabase
      .from('families')
      .select('id')
      .eq('pin', pin)
      .neq('id', id)
      .limit(1)
      .maybeSingle();
    if (pinClash) {
      return NextResponse.json(
        { error: 'That PIN is already in use' },
        { status: 409 }
      );
    }
  }

  // ---- move to another center (optional) ----
  // Only a true owner/superadmin may move a household between centers. A
  // center-bound admin moving a family out of their own center would be moving
  // it somewhere they cannot see or undo, so that is refused.
  const currentCenter = (fam.center_id as string | null) || null;
  const requestedCenter = (body.center_id || '').trim() || null;
  let targetCenter = currentCenter;
  if (requestedCenter && requestedCenter !== currentCenter) {
    if (!isSuperRole(session)) {
      return NextResponse.json(
        { error: 'Only an owner can move a family to another center' },
        { status: 403 }
      );
    }
    const { data: dest } = await supabase
      .from('centers')
      .select('id, is_active')
      .eq('id', requestedCenter)
      .maybeSingle();
    if (!dest || !dest.is_active) {
      return NextResponse.json({ error: 'That center does not exist' }, { status: 400 });
    }
    targetCenter = requestedCenter;
  }
  // Past attendance keeps the center where the care actually happened. Only the
  // household and its future check-ins move, so an already-submitted DHS period
  // for either center still reconciles.

  const { error: upErr } = await supabase
    .from('families')
    .update({
      email,
      pin: newPin,
      end_date: famEnd,
      end_reason: (body.end_reason || '').trim() || null,
      center_id: targetCenter,
    })
    .eq('id', id);
  if (upErr) {
    return NextResponse.json({ error: 'Could not update the family' }, { status: 500 });
  }

  // Replace parents + children with the submitted set.
  await supabase.from('family_parents').delete().eq('family_id', id);
  await supabase.from('family_parents').insert({
    family_id: id,
    name: parentName,
    phone: body.parentPhone?.trim() || null,
    email,
    relationship: 'guardian',
    is_primary: true,
  });

  // Update the children IN PLACE. Child ids stay stable, so attendance history,
  // photos, allergies, and medical notes all survive the edit. (This route used
  // to delete and re-insert, which re-issued every id and orphaned attendance
  // from the roster -- the blank-DOB rejection in the DHS Provider Hub.)
  const sync = await syncFamilyChildren(
    supabase,
    id,
    children.map((c, i) => ({
      id: c.id,
      name: (c.name as string).trim(),
      date_of_birth: c.date_of_birth?.trim() || null,
      classroom: c.classroom?.trim() || null,
      classroom_id: c.classroom_id?.trim() || null,
      end_date: childEnds[i],
      end_reason: (c.end_reason || '').trim() || null,
    })),
    targetCenter || '3104ae69-4f26-4c1e-a767-3ff45b534860'
  );
  if (sync.error) {
    return NextResponse.json({ error: sync.error }, { status: 500 });
  }

  await logAudit({
    actor: session.user,
    action: 'family.update',
    targetType: 'family',
    targetId: id,
    centerId: targetCenter ?? session.user.center_id ?? null,
    detail: {
      children: children.length,
      parents: 1,
      children_updated: sync.updated,
      children_added: sync.inserted,
      children_removed: sync.deleted,
      family_end_date: famEnd,
      moved_center:
        targetCenter !== currentCenter
          ? { from: currentCenter, to: targetCenter }
          : undefined,
    },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true, pin: newPin, childCount: children.length });
}
