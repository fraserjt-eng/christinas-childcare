'use client';

import { useState, useEffect } from 'react';
import { type AppRole, type RoleConfig, ROLE_CONFIGS, getRoleFromEmployee } from '@/lib/role-config';
import { getCurrentEmployee } from '@/lib/employee-storage';

export function useRole(): { role: AppRole; config: RoleConfig } {
  const [role, setRole] = useState<AppRole>('owner_director');

  useEffect(() => {
    const employee = getCurrentEmployee();
    if (employee) {
      setRole(getRoleFromEmployee(employee.role, employee.job_title));
    } else {
      // Direct admin access without login defaults to owner
      const stored = localStorage.getItem('christinas_admin_role');
      if (stored && stored in ROLE_CONFIGS) {
        setRole(stored as AppRole);
      } else {
        setRole('owner_director');
      }
    }
  }, []);

  return { role, config: ROLE_CONFIGS[role] };
}
