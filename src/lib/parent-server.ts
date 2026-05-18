// Server-only: resolve the family + children for a verified parent session.
// This is the security anchor for the Tadpoles per-child report: a parent can
// ONLY ever see children of the family their session email belongs to. Match
// on families.email first, then any family_parents.email. Service role
// (bypasses RLS); child_daily_entries is service-role-only by design.

import { getServerSupabase } from '@/lib/supabase/server';
import type { AuthedSession } from '@/lib/require-auth';

export interface ResolvedChild {
  id: string;
  name: string;
  classroom: string | null;
  date_of_birth: string | null;
}

export interface ResolvedFamily {
  family_id: string;
  email: string;
  children: ResolvedChild[];
}

export async function resolveSessionFamily(
  session: AuthedSession
): Promise<ResolvedFamily | null> {
  const email = (session.user.email || '').toLowerCase().trim();
  if (!email) return null;

  const supabase = getServerSupabase();
  if (!supabase) return null;

  // 1. The family account email itself.
  let familyId: string | null = null;
  let familyEmail = email;

  const { data: famByEmail } = await supabase
    .from('families')
    .select('id, email, status')
    .ilike('email', email)
    .maybeSingle();

  if (famByEmail && famByEmail.status !== 'inactive') {
    familyId = famByEmail.id as string;
    familyEmail = (famByEmail.email as string) || email;
  }

  // 2. Otherwise a parent on the family roster.
  if (!familyId) {
    const { data: parentRow } = await supabase
      .from('family_parents')
      .select('family_id, email')
      .ilike('email', email)
      .maybeSingle();
    if (parentRow && parentRow.family_id) {
      familyId = parentRow.family_id as string;
    }
  }

  if (!familyId) return null;

  const { data: kids } = await supabase
    .from('family_children')
    .select('id, name, classroom, date_of_birth, family_id')
    .eq('family_id', familyId)
    .limit(5000);

  const children: ResolvedChild[] = (kids ?? [])
    .filter((c) => c.family_id === familyId)
    .map((c) => ({
      id: c.id as string,
      name: (c.name as string) || 'Child',
      classroom: (c.classroom as string | null) ?? null,
      date_of_birth: (c.date_of_birth as string | null) ?? null,
    }));

  return { family_id: familyId, email: familyEmail, children };
}
