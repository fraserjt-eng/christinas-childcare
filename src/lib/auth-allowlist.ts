// Auth Allowlist — invite-only role lookup for Google OAuth users
// Checks Supabase employees + family_parents tables to resolve a signing-in email
// into a role. No match = not invited.

import { getSupabase } from './supabase/client';

export type AllowedRole = 'superadmin' | 'admin' | 'teacher' | 'parent';

export interface AllowlistResult {
  allowed: boolean;
  role?: AllowedRole;
  fullName?: string;
  employeeId?: string;
  familyId?: string;
  /** The center the matched employee belongs to. Undefined for superadmin and
   *  parents; stamped into the session so downstream queries can scope by it. */
  centerId?: string | null;
}

// Bootstrap superadmin list — always allowed even if not in any table.
// Exported so the server-side resolver shares one source of truth.
// J (builder) + Christina Fraser (owner) have cross-center superadmin access.
export const SUPERADMIN_EMAILS = ['fraserjt@gmail.com', 'c.fraser@chriskids2.org'];

/**
 * Look up a signing-in email against all role tables.
 * Returns the first match in this order:
 *   1. Hardcoded superadmin
 *   2. employees table → admin/teacher
 *   3. family_parents table → parent
 *   4. null (not invited)
 */
export async function lookupInvite(email: string): Promise<AllowlistResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Superadmin bootstrap
  if (SUPERADMIN_EMAILS.includes(normalizedEmail)) {
    return {
      allowed: true,
      role: 'superadmin',
      fullName: 'J Fraser',
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { allowed: false };
  }

  // 2. Check employees table
  try {
    const { data: employee } = await supabase
      .from('employees')
      .select('id, first_name, last_name, role, email, employment_status, center_id')
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
        centerId: (employee.center_id as string | null) ?? null,
      };
    }
  } catch (e) {
    console.error('Employee lookup failed:', e);
  }

  // 3. Check family_parents table
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
    console.error('Family parent lookup failed:', e);
  }

  // 4. Not invited
  return { allowed: false };
}

/**
 * Decide the redirect path after a successful allowlist match.
 */
export function redirectPathForRole(role: AllowedRole): string {
  // The new front-facing portal is the front door now. The deep backend
  // (/admin) and the old staff portal (/employee) stay reachable directly.
  switch (role) {
    case 'superadmin':
    case 'admin':
      return '/preview/office';
    case 'teacher':
      return '/preview/room';
    case 'parent':
      return '/preview/family';
    default:
      return '/';
  }
}
