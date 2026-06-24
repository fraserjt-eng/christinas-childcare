export const runtime = 'nodejs';

// CCAP attendance export + provider accuracy attestation.
//
// The DCYF Child Care Assistance Program requires the provider to attest, as a
// condition of payment, that the submitted attendance records are true and
// accurate. This route is the single server-side path for that flow:
//   1. It is session-gated to admin (requireSession('admin')) and runs with the
//      service role, so the RLS-locked attendance + roster tables are read only
//      here, never with the browser anon key.
//   2. It reads the period's attendance rows, center-scoped, joined to the
//      child roster, and returns the exact fields the CSV needs (date, child
//      first/last name, drop-off, pick-up). The browser builds the file; PII
//      never travels through the anon client.
//   3. It records the provider attestation as a kiosk_attestations row
//      (subject_type 'staff', attestation_type 'import_attendance') so there is
//      a durable, queryable record of who attested, for which period, and how
//      many rows were certified.
//
// Center scope mirrors /api/staff/schedule + /api/portal/center-data: a director
// (admin/owner/superadmin) may choose a center (cc_center cookie or ?center); a
// center-bound user is forced to their own session center. A request can never
// read or attest to another center's attendance.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { IMPORT_ATTENDANCE_VERSION } from '@/lib/attestation';
import { logAudit, auditIp } from '@/lib/audit-log';

// A staff subject with no resolvable employee id still needs a non-null uuid
// for the attestation row's subject_id (the column is uuid). The all-zero uuid
// reads as "attested by an admin whose employee record could not be resolved".
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Friendly errors only. Never leak error.message or internal details.
function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// The center to act on. Same derivation as /api/staff/schedule: a director may
// pick (cc_center cookie or ?center); a center-bound user is locked to their
// session center; a null-center cross-center user falls back to the pick.
function deriveCenterId(request: NextRequest, session: AuthedSession): string | null {
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  // Only a cross-center director (owner/superadmin, or no home center) may pick a
  // center; a center-bound admin/teacher is locked to their own center.
  const isCrossCenter = role === 'owner' || role === 'superadmin';
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;

  if (isCrossCenter && picked) return picked;
  if (sessionCenter) return sessionCenter;
  if (picked) return picked;
  return null;
}

// Split a single roster name into first / last for the CCAP columns. CCAP wants
// each child's first AND last name; the roster stores one `name` field. First
// token is the first name, the remainder is the last name. A single token has
// no last name (empty), which is still legible in the export.
function splitName(name: string): { first: string; last: string } {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

interface ExportRow {
  date: string; // YYYY-MM-DD, for stable sorting only (DCYF embeds the date in the times)
  firstName: string;
  lastName: string;
  dob: string | null; // YYYY-MM-DD from the roster
  checkIn: string | null; // ISO check_in
  checkOut: string | null; // ISO check_out
  signInPerson: string;
  signOutPerson: string;
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const centerId = deriveCenterId(request, session);
  if (!centerId) return fail('No center selected', 404);

  let body: {
    period_start?: string;
    period_end?: string;
    attested?: boolean;
    agreed_name?: string;
  };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body', 400);
  }

  const periodStart = (body.period_start || '').trim();
  const periodEnd = (body.period_end || '').trim();
  if (!DATE_RE.test(periodStart) || !DATE_RE.test(periodEnd)) {
    return fail('A start date and end date are required', 400);
  }
  if (periodStart > periodEnd) {
    return fail('The start date must be on or before the end date', 400);
  }
  // The accuracy attestation is a hard gate: no export without it.
  if (body.attested !== true) {
    return fail('You must check the accuracy attestation before exporting', 400);
  }

  // ---- read the period's attendance, center-scoped (service role) ----
  const { data: attendance, error: attErr } = await supabase
    .from('attendance')
    .select('child_id, child_name, date, check_in, check_out, signed_in_by_name, signed_out_by_name')
    .eq('center_id', centerId)
    .gte('date', periodStart)
    .lte('date', periodEnd)
    .limit(5000);
  if (attErr) return fail('Could not read attendance for that period', 500);

  const rawRows = attendance ?? [];

  // Resolve child names from the roster. CCAP wants the child's real first +
  // last name; attendance carries a denormalized child_name, but the roster is
  // the source of truth, so prefer family_children.name and fall back to the
  // denormalized value for any legacy row not in the roster.
  const childIds = Array.from(
    new Set(rawRows.map((r) => r.child_id as string).filter(Boolean))
  );
  const nameById = new Map<string, string>();
  const dobById = new Map<string, string>();
  if (childIds.length > 0) {
    // Fetch the roster broad, then map in JS. PostgREST .in() with many UUIDs
    // can silently drop rows, so we filter client-side instead. DOB is required
    // by the DCYF import and comes from the roster (source of truth).
    const { data: kids } = await supabase
      .from('family_children')
      .select('id, name, date_of_birth')
      .limit(5000);
    for (const k of kids ?? []) {
      nameById.set(k.id as string, (k.name as string) || '');
      if (k.date_of_birth) dobById.set(k.id as string, k.date_of_birth as string);
    }
  }

  const rows: ExportRow[] = rawRows
    .map((r) => {
      const rosterName = nameById.get(r.child_id as string);
      const name = rosterName || (r.child_name as string) || '';
      const { first, last } = splitName(name);
      return {
        date: (r.date as string) || '',
        firstName: first,
        lastName: last,
        dob: dobById.get(r.child_id as string) || null,
        checkIn: (r.check_in as string) || null,
        checkOut: (r.check_out as string) || null,
        signInPerson: (r.signed_in_by_name as string) || '',
        signOutPerson: (r.signed_out_by_name as string) || '',
      };
    })
    // Stable order: by date, then child last/first name, sorted in JS.
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const an = `${a.lastName} ${a.firstName}`.trim();
      const bn = `${b.lastName} ${b.firstName}`.trim();
      return an.localeCompare(bn);
    });

  // ---- record the provider attestation (durable, queryable) ----
  const employee = await resolveSessionEmployee(session);
  const agreedName =
    (body.agreed_name || '').trim() ||
    (employee
      ? `${employee.first_name} ${employee.last_name}`.trim()
      : '') ||
    session.user.full_name ||
    session.user.email ||
    null;

  await supabase.from('kiosk_attestations').insert({
    subject_type: 'staff',
    subject_id: employee?.id ?? ZERO_UUID,
    attestation_type: 'import_attendance',
    version: IMPORT_ATTENDANCE_VERSION,
    agreed_name: agreedName,
    center_id: centerId,
    kiosk_device: request.headers.get('x-forwarded-for') || null,
    detail: {
      period_start: periodStart,
      period_end: periodEnd,
      row_count: rows.length,
    },
  });

  await logAudit({
    actor: session.user,
    action: 'ccap.export',
    targetType: 'cacfp',
    targetId: centerId,
    centerId: session.user.center_id ?? centerId,
    detail: {
      period_start: periodStart,
      period_end: periodEnd,
      row_count: rows.length,
    },
    ip: auditIp(request),
  });

  return NextResponse.json(
    { rows, period_start: periodStart, period_end: periodEnd, row_count: rows.length },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
