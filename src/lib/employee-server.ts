// Server-only: resolve the real employees row for the verified session.
// Single resolver used by /api/employee/me and /api/employee/clock so the
// "who is this staff member" logic never drifts. Service role (bypasses RLS).

import { getServerSupabase } from '@/lib/supabase/server';
import type { AuthedSession } from '@/lib/require-auth';

export interface ResolvedEmployee {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  job_title: string | null;
  employment_status: string;
  center_id: string | null;
  classroom_id: string | null;
}

export async function resolveSessionEmployee(
  session: AuthedSession
): Promise<ResolvedEmployee | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const cols =
    'id, first_name, last_name, email, role, job_title, employment_status, center_id, classroom_id';

  let employee: ResolvedEmployee | null = null;
  if (session.user.id) {
    const { data } = await supabase
      .from('employees')
      .select(cols)
      .eq('id', session.user.id)
      .maybeSingle();
    employee = (data as ResolvedEmployee) ?? null;
  }
  if (!employee && session.user.email) {
    const { data } = await supabase
      .from('employees')
      .select(cols)
      .ilike('email', session.user.email)
      .maybeSingle();
    employee = (data as ResolvedEmployee) ?? null;
  }

  if (!employee) return null;
  // Only an EXPLICITLY ended status locks someone out. A blank/variant
  // status (a staff member added without one) must not silently break
  // their portal and clock-in. Lock out only the unambiguous cases.
  const status = String(employee.employment_status || '').toLowerCase().trim();
  if (status === 'inactive' || status === 'terminated' || status === 'archived') {
    return null;
  }
  return employee;
}
