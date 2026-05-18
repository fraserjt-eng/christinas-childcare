'use client';

// The staff member signed in at this device, from the verified PIN session
// (server truth), not localStorage. Employee tools should attribute every
// entry to this so a shared room iPad records the actual person.

import { useEffect, useState } from 'react';

export interface CurrentEmployee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  role: string;
  job_title: string | null;
  center_id: string | null;
}

export function useCurrentEmployee(): {
  employee: CurrentEmployee | null;
  loading: boolean;
} {
  const [employee, setEmployee] = useState<CurrentEmployee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/employee/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setEmployee((d && d.employee) || null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setEmployee(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { employee, loading };
}
