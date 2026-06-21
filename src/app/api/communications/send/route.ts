export const runtime = 'nodejs';

// POST /api/communications/send
//
// Builds the branded "privacy notice is coming" announcement for every family in
// the derived center. For each family we read its email + PIN (service-role only;
// PINs and PII never touch the anon key), look up the primary parent name for the
// greeting, and render a per-family email (PIN shown).
//
// TWO MODES (body.mode):
//   - 'draft' (DEFAULT): render every family's notice and return the drafts for
//     review/print. NOTHING is sent. This is the mode used until the owner
//     verifies the Resend sending domain. Drafts are "ready to send".
//   - 'send': actually deliver via Resend. Refused unless email is configured
//     (RESEND_API_KEY present), so a half-set-up account can never blast mail.
//
// Security: admin session required. Center derivation mirrors the portal/schedule
// routes (a director may pick a center; a center-bound user is locked to their
// own), so a session can never message another center's families.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import { renderPrivacyNoticeNotice } from '@/lib/communications/privacy-notice-email';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

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

function lastNameOf(full: string): string {
  const parts = (full || '').trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || '';
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) return fail('Unauthorized', 401);

  const supabase = getServerSupabase();
  if (!supabase) return fail('Unavailable', 503);

  const centerId = deriveCenterId(request, session);
  if (!centerId) return fail('No center', 403);

  let body: { mode?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* default to draft */
  }
  const mode = body.mode === 'send' ? 'send' : 'draft';

  // Sending is hard-gated on a configured email account. Until then, drafts only.
  if (mode === 'send' && !isEmailConfigured()) {
    return fail(
      'Email sending is not turned on yet. The notices are ready as drafts; turn on sending after the Resend domain is verified and the API key is set.',
      400
    );
  }

  const { data: centerRow } = await supabase
    .from('centers')
    .select('id, name')
    .eq('id', centerId)
    .maybeSingle();
  const centerName = (centerRow?.name as string) || "Christina's Child Care Center";

  const { data: famRows } = await supabase
    .from('families')
    .select('id, email, pin, status')
    .eq('center_id', centerId)
    .limit(5000);

  const families = (famRows ?? []).filter((f) => (f.status as string | null) !== 'archived');

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
    if (p.is_primary || !primaryNameByFamily.has(fid)) primaryNameByFamily.set(fid, name);
  }

  // Real (non-placeholder) email addresses only. A kiosk-only roster stub has a
  // @roster.local placeholder and no guardian: it has no notice recipient yet.
  const isRealEmail = (e: string) => !!e && e.includes('@') && !/@roster\.local$/i.test(e);

  interface Draft {
    familyId: string;
    email: string;
    hasEmail: boolean;
    familyName: string;
    subject: string;
    html: string;
  }
  const drafts: Draft[] = [];
  const sendResults: { familyId: string; email: string; ok: boolean; reason: string }[] = [];

  for (const f of families) {
    const familyId = f.id as string;
    const email = (f.email as string) || '';
    const pin = (f.pin as string) || '';
    const primaryName = primaryNameByFamily.get(familyId) || '';
    const familyName = primaryName ? `${lastNameOf(primaryName)} family` : 'Families';
    const hasEmail = isRealEmail(email);

    const { subject, html } = renderPrivacyNoticeNotice({ familyName, pin, centerName });

    if (mode === 'send') {
      if (!hasEmail) {
        sendResults.push({ familyId, email: '', ok: false, reason: 'No email on file.' });
        continue;
      }
      const sent = await sendEmail({ to: email, subject, html });
      sendResults.push({ familyId, email, ok: sent.ok, reason: sent.reason });
    } else {
      drafts.push({ familyId, email: hasEmail ? email : '', hasEmail, familyName, subject, html });
    }
  }

  if (mode === 'send') {
    const sentCount = sendResults.filter((r) => r.ok).length;
    return NextResponse.json(
      { mode, centerName, total: sendResults.length, sent: sentCount, failed: sendResults.length - sentCount, results: sendResults },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    {
      mode,
      centerName,
      sendEnabled: isEmailConfigured(),
      total: drafts.length,
      withEmail: drafts.filter((d) => d.hasEmail).length,
      withoutEmail: drafts.filter((d) => !d.hasEmail).length,
      drafts,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
