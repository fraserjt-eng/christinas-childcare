export const runtime = 'nodejs';

// POST /api/communications/send
//
// Sends the branded "privacy notice is coming" announcement to every family in
// the derived center. For each family we read its email + PIN (service-role
// only; PINs and PII never touch the anon key), look up the primary parent name
// for the greeting, render a per-family email (PIN shown), and send via Resend.
//
// Security: admin session required. The center is derived exactly as the portal
// and schedule routes derive it: a director (admin/owner/superadmin) may choose
// a center via the cc_center cookie or ?center; a center-bound user is forced to
// their own session center, so a session can never message another center's
// families.
//
// Delivery never throws. Each family gets an ok/failed status and the response
// is a summary, so a single bad address or an unset key degrades gracefully.
//
// OWNER ACTION REQUIRED for delivery: the Resend sending domain on the `from`
// address (christinaschildcare.com) must be verified in Resend (SPF + DKIM DNS
// records). Until then Resend may accept the request but mail will not arrive.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { renderPrivacyNoticeNotice } from '@/lib/communications/privacy-notice-email';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Mirrors /api/staff/schedule deriveCenterId: a director may pick a center; a
// center-bound user is locked to their session center; null-center cross-center
// falls back to the pick. Returns null only when nothing resolves a center.
function deriveCenterId(request: NextRequest, session: AuthedSession): string | null {
  const role = (session.user.role || '').toLowerCase();
  const isDirector = role === 'admin' || role === 'owner' || role === 'superadmin';
  const sessionCenter = session.user.center_id ?? null;
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;

  if (isDirector && picked) return picked;
  if (sessionCenter) return sessionCenter;
  if (picked) return picked;
  return null;
}

// Short last-name label from a primary parent's full name, used to greet the
// family ("Brown family") when no better name exists.
function lastNameOf(full: string): string {
  const parts = (full || '').trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || '';
}

interface FamilyResult {
  familyId: string;
  email: string;
  ok: boolean;
  reason: string;
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const centerId = deriveCenterId(request, session);
  if (!centerId) return fail('No center', 403);

  // Center name for the email signature (broad fetch, filter in JS).
  const { data: centerRow } = await supabase
    .from('centers')
    .select('id, name')
    .eq('id', centerId)
    .maybeSingle();
  const centerName = (centerRow?.name as string) || "Christina's Child Care Center";

  // Active families in this center: id + email + PIN. Service-role read; the PIN
  // is used only to render that family's own email and is never returned in the
  // response summary.
  const { data: famRows } = await supabase
    .from('families')
    .select('id, email, pin, status')
    .eq('center_id', centerId)
    .limit(5000);

  const families = (famRows ?? []).filter(
    (f) => (f.status as string | null) !== 'archived'
  );

  // Primary parent name per family for the greeting (filter to this center's
  // families in JS, per the PostgREST .in() gotcha).
  const familyIds = new Set(families.map((f) => f.id as string));
  const { data: parentRows } = await supabase
    .from('family_parents')
    .select('family_id, name, is_primary')
    .limit(5000);

  const primaryNameByFamily = new Map<string, string>();
  for (const p of parentRows ?? []) {
    const fid = p.family_id as string;
    if (!familyIds.has(fid)) continue;
    const name = (p.name as string) || '';
    if (!name) continue;
    if (p.is_primary || !primaryNameByFamily.has(fid)) {
      primaryNameByFamily.set(fid, name);
    }
  }

  const results: FamilyResult[] = [];
  for (const f of families) {
    const familyId = f.id as string;
    const email = (f.email as string) || '';
    const pin = (f.pin as string) || '';

    const primaryName = primaryNameByFamily.get(familyId) || '';
    const familyName = primaryName ? `${lastNameOf(primaryName)} family` : 'Families';

    if (!email) {
      results.push({ familyId, email: '', ok: false, reason: 'No email on file.' });
      continue;
    }

    const { subject, html } = renderPrivacyNoticeNotice({
      familyName,
      pin,
      centerName,
    });
    const sent = await sendEmail({ to: email, subject, html });
    results.push({ familyId, email, ok: sent.ok, reason: sent.reason });
  }

  const sentCount = results.filter((r) => r.ok).length;
  const failedCount = results.length - sentCount;

  return NextResponse.json(
    {
      centerId,
      centerName,
      total: results.length,
      sent: sentCount,
      failed: failedCount,
      results,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
