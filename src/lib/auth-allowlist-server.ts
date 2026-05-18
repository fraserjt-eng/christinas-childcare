// Server-only role resolver.
//
// Roles are NEVER taken from client input. This module derives the role for a
// signing-in email from the database using the service-role client, which
// bypasses RLS (the employees table is otherwise only readable by an
// authenticated session, and anon is locked out entirely). The signing-in
// identity must already be proven (a verified Supabase access token or a
// verified families password) before this is called.
//
// This mirrors lookupInvite() in auth-allowlist.ts but uses the server client.
// SUPERADMIN_EMAILS is shared from that module so there is one source of truth.

import { getServerSupabase } from './supabase/server';
import { SUPERADMIN_EMAILS, type AllowlistResult, type AllowedRole } from './auth-allowlist';

/**
 * Resolve a verified email to a role using server-side database lookups.
 * Order: superadmin bootstrap → employees → family_parents → not invited.
 */
export async function lookupInviteServer(email: string): Promise<AllowlistResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Superadmin bootstrap
  if (SUPERADMIN_EMAILS.includes(normalizedEmail)) {
    return { allowed: true, role: 'superadmin', fullName: 'J Fraser' };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return { allowed: false };
  }

  // 2. employees table → admin / teacher (active only)
  try {
    const { data: employee } = await supabase
      .from('employees')
      .select('id, first_name, last_name, role, email, employment_status')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (employee && employee.employment_status === 'active') {
      const empRole = (employee.role as string)?.toLowerCase() || 'teacher';
      const resolvedRole: AllowedRole =
        empRole === 'admin' || empRole === 'owner' || empRole === 'director'
          ? 'admin'
          : 'teacher';
      return {
        allowed: true,
        role: resolvedRole,
        fullName: `${employee.first_name} ${employee.last_name}`.trim(),
        employeeId: employee.id,
      };
    }
  } catch (e) {
    console.error('Server employee lookup failed:', e);
  }

  // 3. family_parents table → parent
  try {
    const { data: parent } = await supabase
      .from('family_parents')
      .select('id, family_id, name, email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (parent) {
      return {
        allowed: true,
        role: 'parent',
        fullName: parent.name as string,
        familyId: parent.family_id as string,
      };
    }
  } catch (e) {
    console.error('Server family parent lookup failed:', e);
  }

  // 4. Not invited
  return { allowed: false };
}
