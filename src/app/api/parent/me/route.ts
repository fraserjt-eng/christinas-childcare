export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionFamily } from '@/lib/parent-server';
import { centerDate, centerTime } from '@/lib/center-time';
import { signPhotoList } from '@/lib/photo-url';

// The signed-in parent's REAL family record (profile + parents + children),
// from the verified session email. Replaces the home page's stale
// localStorage getCurrentFamily(). Service role; scoped server-side.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fam = await resolveSessionFamily(session);
  if (!fam) {
    return NextResponse.json({ family: null });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const [{ data: famRow }, { data: parents }, { data: kids }] =
    await Promise.all([
      supabase
        .from('families')
        .select('id, email, address, family_bio, status')
        .eq('id', fam.family_id)
        .maybeSingle(),
      supabase
        .from('family_parents')
        .select('id, name, phone, email, relationship, is_primary, family_id')
        .eq('family_id', fam.family_id)
        .limit(200),
      supabase
        .from('family_children')
        .select(
          'id, name, date_of_birth, classroom, allergies, medical_notes, family_id, photo_url'
        )
        .eq('family_id', fam.family_id)
        .limit(200),
    ]);

  // Sign each child's avatar (private bucket -> short-lived signed URL) so the
  // photo follows the child onto the parent's home + family view.
  const kidRows = kids ?? [];
  const signedPhotos = await signPhotoList(
    supabase,
    kidRows.map((c) => (c.photo_url as string | null) ?? null)
  );
  const photoByChild: Record<string, string> = {};
  kidRows.forEach((c, i) => {
    if (signedPhotos[i]) photoByChild[c.id as string] = signedPhotos[i];
  });

  // Today's presence for this family's own children (parent-scoped: we only
  // ever query the kids resolved from the verified session, never a client id).
  // "here since <time>" if checked in with no check-out, else null.
  const kidIds = (kids ?? []).map((c) => c.id as string);
  const presence: Record<string, string | null> = {};
  if (kidIds.length) {
    const { data: att } = await supabase
      .from('attendance')
      .select('child_id, check_in, check_out')
      .in('child_id', kidIds)
      .eq('date', centerDate())
      .limit(5000);
    for (const a of att ?? []) {
      const cid = a.child_id as string;
      if (a.check_out) {
        presence[cid] = null;
        continue;
      }
      const t = a.check_in ? new Date(a.check_in as string) : null;
      presence[cid] =
        t && !isNaN(t.getTime())
          ? centerTime(t)
          : null;
    }
  }

  const family = {
    id: fam.family_id,
    email: (famRow?.email as string) || fam.email,
    status: (famRow?.status as string) || 'active',
    address: (famRow?.address as string | null) || undefined,
    family_bio: (famRow?.family_bio as string | null) || undefined,
    parents: (parents ?? [])
      .filter((p) => p.family_id === fam.family_id)
      .map((p) => ({
        id: p.id as string,
        name: (p.name as string) || '',
        phone: (p.phone as string | null) || '',
        email: (p.email as string | null) || '',
        relationship: (p.relationship as string) || 'guardian',
        is_primary: Boolean(p.is_primary),
      })),
    children: (kids ?? [])
      .filter((c) => c.family_id === fam.family_id)
      .map((c) => ({
        id: c.id as string,
        name: (c.name as string) || 'Child',
        date_of_birth: (c.date_of_birth as string | null) || '',
        classroom: (c.classroom as string | null) || '',
        allergies: (c.allergies as string[] | null) || [],
        medical_notes: (c.medical_notes as string | null) || undefined,
        emergency_contacts: [],
        checked_in_at: presence[c.id as string] ?? null,
        photo_url: photoByChild[c.id as string] || undefined,
      })),
  };

  return NextResponse.json(
    { family },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
