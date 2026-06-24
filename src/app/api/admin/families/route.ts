export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

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
  name?: string;
  date_of_birth?: string;
  classroom?: string;
  classroom_id?: string;
  allergies?: string[];
  medical_notes?: string;
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
    .select('id, email, status, pin, address, family_bio, created_at, updated_at')
    .limit(5000);
  if (centerId) famQ = famQ.eq('center_id', centerId);

  // Fetch broad, join in JS (PostgREST .in() can silently drop rows).
  const [{ data: fams }, { data: parents }, { data: kids }] = await Promise.all([
    famQ,
    supabase
      .from('family_parents')
      .select('id, family_id, name, phone, email, relationship, is_primary')
      .limit(5000),
    supabase
      .from('family_children')
      .select('id, family_id, name, date_of_birth, classroom, classroom_id, allergies, medical_notes')
      .limit(5000),
  ]);

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
        })),
    }));

  return NextResponse.json(
    { families },
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

  // Center scope: a center-bound admin may only edit a family at their own center
  // (this PATCH can delete+rewrite children + rotate the kiosk PIN). Cross-center
  // directors (owner/superadmin, or no home center) are exempt.
  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'owner' || role === 'superadmin' || !myCenter;
  if (!crossCenter) {
    const { data: fam } = await supabase.from('families').select('center_id').eq('id', id).maybeSingle();
    if (!fam) return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    if ((fam.center_id as string | null) !== myCenter) {
      return NextResponse.json({ error: 'Not your center' }, { status: 403 });
    }
  }

  const famUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.status === 'string') famUpdate.status = body.status;
  if (typeof body.email === 'string') famUpdate.email = body.email.toLowerCase().trim();
  if (typeof body.address === 'string') famUpdate.address = body.address;
  if (typeof body.family_bio === 'string') famUpdate.family_bio = body.family_bio;
  if (body.status === 'active') famUpdate.approved_at = new Date().toISOString();

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

  // Replace the children list, if provided.
  if (Array.isArray(body.children)) {
    const clean = body.children.filter((c) => (c.name || '').trim());
    await supabase.from('family_children').delete().eq('family_id', id);
    if (clean.length > 0) {
      await supabase.from('family_children').insert(
        clean.map((c) => ({
          family_id: id,
          name: (c.name || '').trim(),
          date_of_birth: c.date_of_birth || null,
          classroom: c.classroom || null,
          classroom_id: c.classroom_id || null,
          allergies: c.allergies || [],
          medical_notes: c.medical_notes || null,
        }))
      );
    }
  }

  return NextResponse.json({ ok: true });
}
