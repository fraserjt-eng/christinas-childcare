export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';
import { signPhotoList } from '@/lib/photo-url';
import { syncFamilyChildren } from '@/lib/family-children-sync';
import { normalizeEndDate } from '@/lib/enrollment-end';

// Full family records for the admin Families tab (People > Families).
// The page used the client family-storage which reads Supabase with the
// ANON key; migration 017 locked those tables down, so the list came back
// empty and edits silently failed. This is the service-role path, same
// pattern as User Management. Admin only.
//
// GET            -> full FamilyAccount[] (parents + children)
// PATCH { id, status?, email?, address?, family_bio?, parentName?,
//         parentPhone?, children? } -> partial update (incl. approve /
//         deactivate via status). Service role; nothing trusts the client
//         for identity.

interface ChildIn {
  id?: string; // existing row id, so an edit updates in place instead of orphaning attendance
  name?: string;
  date_of_birth?: string;
  classroom?: string;
  classroom_id?: string;
  allergies?: string[];
  medical_notes?: string;
  end_date?: string | null; // last day of care (inclusive); null/'' = still enrolled
  end_reason?: string | null;
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Center scope: a center-bound admin only sees their own center's families. A
  // cross-center director (owner/superadmin, or no home center) sees all, or one
  // center if they narrowed via the cc_center cookie. Without this, any admin saw
  // every center's families, children's DOB/allergies/medical notes, and PINs.
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !sessionCenter;
  const picked = request.cookies.get('cc_center')?.value || null;
  const centerId = crossCenter ? picked : sessionCenter;

  let famQ = supabase
    .from('families')
    .select(
      'id, email, status, pin, address, family_bio, created_at, updated_at, center_id, end_date, end_reason'
    )
    .limit(5000);
  if (centerId) famQ = famQ.eq('center_id', centerId);

  // Fetch broad, join in JS (PostgREST .in() can silently drop rows).
  const [{ data: fams }, { data: parents }, { data: kids }, { data: centerRows }] =
    await Promise.all([
      famQ,
      supabase
        .from('family_parents')
        .select('id, family_id, name, phone, email, relationship, is_primary')
        .limit(5000),
      supabase
        .from('family_children')
        .select(
          'id, family_id, name, date_of_birth, classroom, classroom_id, allergies, medical_notes, photo_url, end_date, end_reason'
        )
        .limit(5000),
      supabase.from('centers').select('id, name, is_active').limit(200),
    ]);

  // Sign each child's avatar so the admin Families tab shows their face (and so
  // the edit form can preview the current photo). Bare paths -> 8h signed URLs.
  const kidList = kids || [];
  const signedKidPhotos = await signPhotoList(
    supabase,
    kidList.map((k) => (k.photo_url as string | null) ?? null)
  );
  const photoByKidId = new Map<string, string>();
  kidList.forEach((k, i) => {
    if (signedKidPhotos[i]) photoByKidId.set(k.id as string, signedKidPhotos[i]);
  });

  const families = (fams || [])
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map((f) => ({
      id: f.id as string,
      email: (f.email as string) || '',
      password_hash: '',
      pin: (f.pin as string | null) || undefined,
      status: (f.status as string) || 'active',
      address: (f.address as string | null) || undefined,
      family_bio: (f.family_bio as string | null) || undefined,
      created_at: (f.created_at as string) || '',
      updated_at: (f.updated_at as string) || '',
      center_id: (f.center_id as string | null) || '',
      end_date: (f.end_date as string | null) || '',
      end_reason: (f.end_reason as string | null) || '',
      parents: (parents || [])
        .filter((p) => p.family_id === f.id)
        .map((p) => ({
          id: p.id as string,
          name: (p.name as string) || '',
          phone: (p.phone as string | null) || '',
          email: (p.email as string | null) || '',
          relationship: (p.relationship as string) || 'guardian',
          is_primary: Boolean(p.is_primary),
        })),
      children: (kids || [])
        .filter((k) => k.family_id === f.id)
        .map((k) => ({
          id: k.id as string,
          name: (k.name as string) || '',
          date_of_birth: (k.date_of_birth as string | null) || '',
          classroom: (k.classroom as string | null) || '',
          classroom_id: (k.classroom_id as string | null) || '',
          allergies: (k.allergies as string[] | null) || [],
          medical_notes: (k.medical_notes as string | null) || undefined,
          emergency_contacts: [],
          photo_url: photoByKidId.get(k.id as string) || undefined,
          end_date: (k.end_date as string | null) || '',
          end_reason: (k.end_reason as string | null) || '',
        })),
    }));

  return NextResponse.json(
    {
      families,
      centers: (centerRows || [])
        .filter((c) => c.is_active)
        .map((c) => ({ id: c.id as string, name: (c.name as string) || '' })),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: {
    id?: string;
    status?: string;
    email?: string;
    address?: string;
    family_bio?: string;
    parentName?: string;
    parentPhone?: string;
    children?: ChildIn[];
    end_date?: string | null;
    end_reason?: string | null;
    center_id?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const id = (body.id || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Validate every end date BEFORE writing anything. An unparseable date must
  // fail loudly rather than read as "no end date", which would put a departed
  // child back on the live kiosk roster.
  const famEnd = normalizeEndDate(body.end_date);
  if (famEnd === undefined) {
    return NextResponse.json(
      { error: 'The family end date must be a real date (YYYY-MM-DD)' },
      { status: 400 }
    );
  }
  const cleanChildren = Array.isArray(body.children)
    ? body.children.filter((c) => (c.name || '').trim())
    : null;
  const childEnds: (string | null)[] = [];
  for (const c of cleanChildren ?? []) {
    const e = normalizeEndDate(c.end_date);
    if (e === undefined) {
      return NextResponse.json(
        { error: `The end date for ${(c.name || 'a child').trim()} must be a real date (YYYY-MM-DD)` },
        { status: 400 }
      );
    }
    childEnds.push(e);
  }

  // Center scope: a center-bound admin may only edit a family at their own center
  // (this PATCH can delete+rewrite children + rotate the kiosk PIN). Cross-center
  // directors (owner/superadmin, or no home center) are exempt.
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !myCenter;
  const { data: fam } = await supabase
    .from('families')
    .select('center_id')
    .eq('id', id)
    .maybeSingle();
  if (!fam) return NextResponse.json({ error: 'Family not found' }, { status: 404 });
  const currentCenter = (fam.center_id as string | null) || null;
  if (!crossCenter && currentCenter !== myCenter) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  // ---- move to another center (optional) ----
  // Only a true owner/superadmin moves a household between centers; a
  // center-bound admin would be sending it somewhere they cannot see or undo.
  // Past attendance stays at the center that actually delivered the care, so an
  // already-submitted DHS period for either center still reconciles.
  const requestedCenter = (body.center_id || '').trim() || null;
  let targetCenter = currentCenter;
  if (requestedCenter && requestedCenter !== currentCenter) {
    const isSuper = role === 'owner' || role === 'superadmin';
    if (!isSuper) {
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

  const famUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.status === 'string') famUpdate.status = body.status;
  if (typeof body.email === 'string') famUpdate.email = body.email.toLowerCase().trim();
  if (typeof body.address === 'string') famUpdate.address = body.address;
  if (typeof body.family_bio === 'string') famUpdate.family_bio = body.family_bio;
  if (body.status === 'active') famUpdate.approved_at = new Date().toISOString();
  if (body.end_date !== undefined) famUpdate.end_date = famEnd;
  if (body.end_reason !== undefined) {
    famUpdate.end_reason = (body.end_reason || '').trim() || null;
  }
  if (targetCenter !== currentCenter) famUpdate.center_id = targetCenter;

  const { error: famErr } = await supabase
    .from('families')
    .update(famUpdate)
    .eq('id', id);
  if (famErr) {
    return NextResponse.json(
      { error: 'Could not update the family' },
      { status: 500 }
    );
  }

  // Primary parent name/phone, if provided.
  if (typeof body.parentName === 'string' && body.parentName.trim()) {
    const { data: ps } = await supabase
      .from('family_parents')
      .select('id, is_primary')
      .eq('family_id', id);
    const primary = (ps || []).find((p) => p.is_primary) || (ps || [])[0];
    if (primary) {
      await supabase
        .from('family_parents')
        .update({
          name: body.parentName.trim(),
          phone: body.parentPhone ?? null,
        })
        .eq('id', primary.id);
    }
  }

  // Every child stays bound to the family's center so the kiosk cross-center
  // guard (which fails open on a NULL center) cannot be widened by an edit.
  const childCenterId =
    targetCenter || myCenter || '3104ae69-4f26-4c1e-a767-3ff45b534860';

  // A move with no children payload still has to carry the children across,
  // or they keep the old center and the kiosk refuses them at the new one.
  if (targetCenter !== currentCenter) {
    await supabase
      .from('family_children')
      .update({ center_id: childCenterId })
      .eq('family_id', id);
  }

  // Reconcile the children IN PLACE when a list is provided. Child ids stay
  // stable, so attendance history, photos, allergies, and medical notes survive
  // the edit. (This route used to delete and re-insert, which re-issued every id
  // and orphaned attendance from the roster: the blank-DOB rejection in the DHS
  // Provider Hub.)
  let sync = { updated: 0, inserted: 0, deleted: 0, error: null as string | null };
  if (cleanChildren) {
    sync = await syncFamilyChildren(
      supabase,
      id,
      cleanChildren.map((c, i) => ({
        id: c.id,
        name: (c.name || '').trim(),
        date_of_birth: c.date_of_birth || null,
        classroom: c.classroom || null,
        classroom_id: c.classroom_id || null,
        allergies: c.allergies,
        medical_notes: c.medical_notes,
        end_date: childEnds[i],
        end_reason: c.end_reason === undefined ? undefined : (c.end_reason || '').trim() || null,
      })),
      childCenterId
    );
    if (sync.error) {
      return NextResponse.json({ error: sync.error }, { status: 500 });
    }
  }

  await logAudit({
    actor: session.user,
    action: 'family.update',
    targetType: 'family',
    targetId: id,
    centerId: targetCenter ?? myCenter,
    detail: {
      status: typeof body.status === 'string' ? body.status : undefined,
      email_changed: typeof body.email === 'string',
      children_updated: sync.updated,
      children_added: sync.inserted,
      children_removed: sync.deleted,
      family_end_date: body.end_date !== undefined ? famEnd : undefined,
      moved_center:
        targetCenter !== currentCenter
          ? { from: currentCenter, to: targetCenter }
          : undefined,
    },
    ip: auditIp(request),
  });

  return NextResponse.json({ ok: true });
}
