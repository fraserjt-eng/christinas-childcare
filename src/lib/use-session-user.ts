'use client';

// The single source of truth for "who is signed in" on the client.
// Reads the real, server-verified session cookie via /api/auth/session.
// Never trust localStorage demo/seed data for identity again.

import { useEffect, useState } from 'react';

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  /** The center this session is scoped to (server-derived at mint time). Null
   *  for superadmin (cross-center) and parents until families carry a center. */
  center_id?: string | null;
}

export function useSessionUser(): { user: SessionUser | null; loading: boolean } {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setUser((d && d.user) || null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}

export function initialsFrom(name: string | undefined | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function roleLabel(role: string | undefined | null): string {
  switch ((role || '').toLowerCase()) {
    case 'superadmin':
    case 'admin':
      return 'Administrator';
    case 'owner':
      return 'Owner / Director';
    case 'teacher':
    case 'employee':
      return 'Staff';
    case 'parent':
      return 'Parent';
    default:
      return 'Account';
  }
}

export function firstNameFrom(name: string | undefined | null): string {
  const t = (name || '').trim().split(/\s+/)[0];
  return t || 'there';
}
