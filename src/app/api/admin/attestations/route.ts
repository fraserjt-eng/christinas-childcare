export const runtime = 'nodejs';

// Admin compliance view: which families have a CURRENT kiosk privacy-notice
// agreement (right version, within the year) and which do not. Service-role
// only (kiosk_attestations is locked), admin-gated, center-derived.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { PRIVACY_NOTICE_VERSION, ATTESTATION_VALID_DAYS } from '@/lib/attestation';

function deriveCenterId(
  request: NextRequest,
  session: AuthedSession
): string | null {
  const role = (session.user.role || '').toLowerCase();
  const sessionCenter = session.user.center_id ?? null;
  const isCrossCenter = role === 'owner' || role === 'superadmin' || !sessionCenter;
  const picked =
    request.cookies.get('cc_center')?.value ||
    request.nextUrl.searchParams.get('center') ||
    null;
  if (isCrossCenter) return picked || sessionCenter;
  return sessionCenter;
}

export async function GET(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const centerId = deriveCenterId(request, session);
  if (!centerId) {
    return NextResponse.json({ error: 'Not your center' }, { status: 403 });
  }

  const { data: families } = await supabase
    .from('families')
    .select('id, email, center_id, status')
    .eq('center_id', centerId)
    .limit(5000);
  const fams = (families ?? []).filter((f) => f.status !== 'inactive');
  const famIds = fams.map((f) => f.id as string);
  const idFilter = famIds.length ? famIds : ['00000000-0000-0000-0000-000000000000'];

  const { data: parents } = await supabase
    .from('family_parents')
    .select('family_id, name, is_primary')
    .in('family_id', idFilter)
    .limit(5000);

  const { data: atts } = await supabase
    .from('kiosk_attestations')
    .select('subject_id, version, agreed_at')
    .eq('subject_type', 'family')
    .eq('attestation_type', 'privacy_notice')
    .in('subject_id', idFilter)
    .order('agreed_at', { ascending: false })
    .limit(5000);

  const cutoff = Date.now() - ATTESTATION_VALID_DAYS * 86400000;
  const rows = fams.map((f) => {
    const fid = f.id as string;
    // atts are ordered newest-first, so the first match is the latest.
    const att = (atts ?? []).find((a) => a.subject_id === fid);
    const current =
      !!att &&
      att.version === PRIVACY_NOTICE_VERSION &&
      new Date(att.agreed_at as string).getTime() > cutoff;
    const ps = (parents ?? []).filter((p) => p.family_id === fid);
    const primary = ps.find((p) => p.is_primary) ?? ps[0];
    return {
      familyId: fid,
      name: (primary?.name as string) || (f.email as string) || 'Family',
      email: (f.email as string) || '',
      agreed: current,
      version: (att?.version as string) || null,
      agreedAt: (att?.agreed_at as string) || null,
    };
  });

  return NextResponse.json(
    { rows, version: PRIVACY_NOTICE_VERSION },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
