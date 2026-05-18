'use client';

// The staff member at this device, from the verified PIN session (server
// truth via /api/employee/me), NOT localStorage. Drop-in async replacement
// for the stale getCurrentEmployee(): each call site was already inside an
// async loader, so it becomes `await getSessionEmployee()`. No cache on
// purpose, so a shared device never serves the previous person's identity.

export interface SessionEmployee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  role: string;
  job_title: string | null;
  center_id: string | null;
}

export async function getSessionEmployee(): Promise<SessionEmployee | null> {
  try {
    const r = await fetch('/api/employee/me');
    if (!r.ok) return null;
    const d = await r.json();
    return d && d.employee ? (d.employee as SessionEmployee) : null;
  } catch {
    return null;
  }
}
