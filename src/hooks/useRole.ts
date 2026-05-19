'use client';

import { useState, useEffect } from 'react';
import { type AppRole, type RoleConfig, ROLE_CONFIGS, getRoleFromEmployee } from '@/lib/role-config';
import { getSessionEmployee } from '@/lib/session-employee';

// The admin menu must follow the AUTHORITATIVE session role (set at login
// from the superadmin bootstrap / allowlist), NOT a secondary employees-row
// `role`. An owner/superadmin who also has a staff "teacher" record must
// still get the full menu. Reading the employees role here collapsed
// fraserjt@gmail.com (session superadmin, employees teacher) to the
// assistant view. Session role first; employees record only refines a
// genuine teacher.
export function useRole(): { role: AppRole; config: RoleConfig } {
  const [role, setRole] = useState<AppRole>('owner_director');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/session', { cache: 'no-store' });
        const d = r.ok ? await r.json() : null;
        const sessionRole = String(d?.user?.role || '').toLowerCase();

        if (
          sessionRole === 'superadmin' ||
          sessionRole === 'admin' ||
          sessionRole === 'owner'
        ) {
          setRole('owner_director');
          return;
        }

        if (sessionRole === 'teacher' || sessionRole === 'employee') {
          // A genuine staff member: refine by their job title.
          const emp = await getSessionEmployee();
          setRole(
            getRoleFromEmployee(emp?.role, emp?.job_title ?? undefined)
          );
          return;
        }

        // No/other session (e.g. direct admin access in dev): default open,
        // honoring an explicit stored preference if present.
        const stored =
          typeof window !== 'undefined'
            ? localStorage.getItem('christinas_admin_role')
            : null;
        if (stored && stored in ROLE_CONFIGS) {
          setRole(stored as AppRole);
        } else {
          setRole('owner_director');
        }
      } catch {
        setRole('owner_director');
      }
    })();
  }, []);

  return { role, config: ROLE_CONFIGS[role] };
}
