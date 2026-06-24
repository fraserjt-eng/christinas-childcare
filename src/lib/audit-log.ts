import { getServerSupabase } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';

// Durable, attributable audit trail for sensitive mutations. Writes to the
// service-role-only `admin_audit_log` table (migration 045). Append-only by
// design: the app never updates or deletes a row, and the anon/authenticated
// browser key cannot read or write it at all.
//
// Closes the audit Critical from the June 2026 SOC 2 / OWASP audit: before this,
// the "audit log" was a per-browser localStorage stub stamped admin@demo.com,
// so a children's-data system had no trustworthy record of who changed what.
//
// Call it AFTER the mutation succeeds, passing the server-derived session actor.
// It is fire-and-forget: a failure to log must never break the request it
// records, so every error is swallowed.

export interface AuditActor {
  id?: string | null;
  email?: string | null;
  role?: string | null;
  center_id?: string | null;
}

export interface AuditEntry {
  actor?: AuditActor | null;
  action: string; // dotted verb, e.g. 'family.update', 'statement.create', 'payroll.finalize'
  targetType?: string | null;
  targetId?: string | null;
  centerId?: string | null;
  detail?: Record<string, unknown> | null;
  ip?: string | null;
}

// Best-effort client IP for the audit row. Mirrors the rate-limiter's trust
// model: prefer Vercel's x-real-ip, fall back to the LAST x-forwarded-for hop
// (the one Vercel appended), never the client-spoofable first hop.
export function auditIp(request: NextRequest): string | null {
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const hops = xff.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return null;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return;
    await supabase.from('admin_audit_log').insert({
      actor_id: entry.actor?.id ?? null,
      actor_email: entry.actor?.email ?? null,
      actor_role: entry.actor?.role ?? null,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      center_id: entry.centerId ?? entry.actor?.center_id ?? null,
      detail: entry.detail ?? null,
      ip: entry.ip ?? null,
    });
  } catch {
    // Audit logging must never break the request it records.
  }
}
