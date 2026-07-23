export const runtime = 'nodejs';
// A sign-in must fail fast, not hang. With the per-request DB timeout below, a
// wedged PostgREST returns a 503 in seconds; this cap is just a hard backstop.
export const maxDuration = 15;

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, peekRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { getServerSupabase } from '@/lib/supabase/server';
import { centerDate } from '@/lib/center-time';
import { PRIVACY_NOTICE_VERSION, ATTESTATION_VALID_DAYS } from '@/lib/attestation';
import { signPhotoList } from '@/lib/photo-url';
import { isEnded } from '@/lib/enrollment-end';

// The live kiosk's only data path. The browser never touches the family or
// attendance tables directly (anon is denied on them by migration 017). This
// route uses the service-role client and returns ONLY the fields the kiosk
// renders — never pin or password_hash.

// Default center for a kiosk that does not send one (legacy single-center
// kiosks). Each kiosk is bound to ONE center via its per-device URL and sends
// that center, which scopes every lookup and write below so a kiosk can never
// resolve or mutate another center's family or attendance row. This id is
// Brooklyn Park (renamed from the original "Crystal Center" seed record).
const OPERATING_CENTER_ID = '3104ae69-4f26-4c1e-a767-3ff45b534860';

function todayDate(): string {
  // Center timezone so a kiosk check-in lands on the same day the ratio
  // monitor, dashboard, and reports read.
  return centerDate();
}

// Verify a child belongs to the family that signed in at this kiosk, scoped to
// the kiosk's center. The kiosk only ever hands out a PIN'd family's own
// children, so an attendance write for any other childId is rejected here. This
// closes the cross-family / cross-center write: familyId is required on check-in
// (the client always sends it) and verified on check-out when present; the
// child's center is always enforced. center_id was backfilled on every
// family_children row (migration 030), so the null branch is only defensive.
async function verifyKioskChild(
  supabase: NonNullable<ReturnType<typeof getServerSupabase>>,
  childId: string,
  centerId: string,
  familyId?: string,
  // Only check-in refuses an ended child. Check-OUT must always be allowed, or a
  // child checked in on their last day could never be closed out and would sit
  // open forever in the attendance record.
  opts: { blockEnded?: boolean } = {}
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  let query = supabase
    .from('family_children')
    .select('id, family_id, center_id, end_date')
    .eq('id', childId);
  if (familyId) query = query.eq('family_id', familyId);
  const { data: child } = await query.maybeSingle();
  if (!child) return { ok: false, status: 403, error: 'Child not found for this family' };
  if (child.center_id && child.center_id !== centerId) {
    return { ok: false, status: 403, error: 'Child not at this center' };
  }
  // Enrollment ended. The roster read already hides them, so this only catches a
  // kiosk tab left open across the cutoff; it must still refuse the write, or a
  // departed child lands in an attendance period the provider then has to attest to.
  if (opts.blockEnded && isEnded(child.end_date as string | null, todayDate())) {
    return { ok: false, status: 403, error: 'This child is no longer enrolled' };
  }
  return { ok: true };
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);

  // General cap across all kiosk actions (a kiosk loads several per family).
  const general = checkRateLimit(`kiosk:${clientId}`, {
    maxRequests: 60,
    windowMs: 60 * 1000,
  });
  if (!general.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': general.retryAfterSeconds?.toString() ?? '60' } }
    );
  }

  let body: {
    action?: string;
    pin?: string;
    childId?: string;
    childName?: string;
    familyId?: string;
    employeeId?: string;
    centerId?: string;
    agreedName?: string;
    signedByName?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 7s per-request ceiling. When the database is unreachable this makes every
  // call fail fast with an AbortError instead of hanging until the platform 504,
  // so the paths below can return a 503 the pad reads as "system slow, use
  // paper" — never a false "PIN not found".
  const supabase = getServerSupabase({ timeoutMs: 7000 });
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // The kiosk is bound to one center (its per-device URL). Every lookup and
  // write below is scoped to this center so a kiosk can never resolve or mutate
  // another center's family or attendance row. Defaults to the operating center
  // for legacy single-center kiosks that don't send one.
  const centerId = body.centerId || OPERATING_CENTER_ID;

  // ---- privacy-notice attestation: is the family's agreement current? ----
  // (right version, within the year). Gates check-in on the kiosk.
  if (body.action === 'attest_status') {
    const familyId = (body.familyId || '').trim();
    if (!familyId) return NextResponse.json({ data: { current: false } });
    const cutoff = new Date(
      Date.now() - ATTESTATION_VALID_DAYS * 86400000
    ).toISOString();
    const { data } = await supabase
      .from('kiosk_attestations')
      .select('id')
      .eq('subject_type', 'family')
      .eq('subject_id', familyId)
      .eq('attestation_type', 'privacy_notice')
      .eq('version', PRIVACY_NOTICE_VERSION)
      .gte('agreed_at', cutoff)
      .limit(1);
    return NextResponse.json({ data: { current: !!(data && data.length > 0) } });
  }

  // ---- record a family's privacy-notice agreement ----
  if (body.action === 'record_attestation') {
    const familyId = (body.familyId || '').trim();
    if (!familyId) {
      return NextResponse.json({ error: 'familyId required' }, { status: 400 });
    }
    await supabase.from('kiosk_attestations').insert({
      subject_type: 'family',
      subject_id: familyId,
      attestation_type: 'privacy_notice',
      version: PRIVACY_NOTICE_VERSION,
      agreed_name: (body.agreedName || '').trim() || null,
      center_id: centerId,
      kiosk_device: request.headers.get('x-forwarded-for') || null,
    });
    return NextResponse.json({ data: { ok: true } });
  }

  // ---- lookup: PIN -> family ----
  // This is the PIN-guessing abuse path, but the throttle must count FAILURES,
  // not attempts. The old design counted every lookup against an 8-per-15-min
  // cap keyed on the center's shared NAT IP, so a normal pickup rush (a dozen+
  // parents entering CORRECT PINs in 15 min) locked the whole center out. Now:
  // a correct PIN never touches the counter; only a well-formed PIN that matches
  // no family (an actual wrong guess) does. A guesser is throttled as hard as
  // before; a busy front desk is never blocked. The general 60/min cap above
  // still bounds gross flooding.
  const PIN_FAIL_LIMIT = { maxRequests: 10, windowMs: 15 * 60 * 1000 };
  if (body.action === 'lookup') {
    // Peek only: are they already over their WRONG-GUESS budget? Block if so,
    // but do not count this (possibly legitimate) attempt.
    const failState = peekRateLimit(`kiosk-pin-fail:${clientId}`, PIN_FAIL_LIMIT);
    if (!failState.success) {
      return NextResponse.json(
        { error: 'Too many incorrect PIN attempts. Please wait a few minutes.' },
        { status: 429, headers: { 'Retry-After': failState.retryAfterSeconds?.toString() ?? '900' } }
      );
    }

    const pin = (body.pin || '').trim();
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ data: null });
    }

    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('id, email, status, end_date')
      .eq('pin', pin)
      .eq('status', 'active')
      .eq('center_id', centerId)
      .limit(1);

    // A database failure (timeout / unreachable / 5xx) must NOT collapse into a
    // "PIN not found" null — that would tell a parent their PIN is wrong during
    // an outage. Surface it as a 503 so the pad shows the system message and the
    // family can use paper, exactly as the client's KioskSystemError path expects.
    // A DB error is also NOT a wrong guess, so it is never counted below.
    if (familiesError) {
      return NextResponse.json({ error: 'System unavailable' }, { status: 503 });
    }

    if (!families || families.length === 0) {
      // A well-formed PIN that matched no active family at this center: this is
      // the only thing that counts toward the guess throttle.
      checkRateLimit(`kiosk-pin-fail:${clientId}`, PIN_FAIL_LIMIT);
      return NextResponse.json({ data: null });
    }
    const family = families[0];

    // A household past its end date is off the roster entirely. The PIN reads as
    // unknown rather than as an error, so a departed family cannot be checked in
    // and staff are not invited to argue with a message at the door.
    const rosterDay = todayDate();
    if (isEnded(family.end_date as string | null, rosterDay)) {
      return NextResponse.json({ data: null });
    }

    const { data: parents } = await supabase
      .from('family_parents')
      .select('id, family_id, name, phone, email, relationship, is_primary')
      .eq('family_id', family.id);

    const { data: childRows } = await supabase
      .from('family_children')
      .select('id, family_id, name, date_of_birth, classroom, photo_url, end_date')
      .eq('family_id', family.id);

    // Drop children whose own last day of care has passed, so a sibling leaving
    // does not take the rest of the household off the kiosk with them. End date
    // is inclusive: the child still appears ON their last day.
    const children = (childRows || []).filter(
      (c) => !isEnded(c.end_date as string | null, rosterDay)
    );

    // Sign each child's avatar so the kiosk check-in tiles show their face.
    // Short TTL (5 min): the kiosk lookup is PIN-gated but unauthenticated and
    // rate-limited, so a guessed PIN must not yield a long-lived face-photo link.
    // A re-lookup on the next PIN entry mints a fresh URL, so check-in is unaffected.
    const kids = children || [];
    const signedKidPhotos = await signPhotoList(
      supabase,
      kids.map((c) => (c.photo_url as string | null) ?? null),
      5 * 60
    );
    const childrenOut = kids.map((c, i) => ({
      ...c,
      photo_url: signedKidPhotos[i] || null,
    }));

    return NextResponse.json({
      data: {
        id: family.id,
        email: family.email,
        parents: parents || [],
        children: childrenOut,
      },
    });
  }

  // ---- attendance: today's row for a child ----
  if (body.action === 'attendance') {
    if (!body.childId) {
      return NextResponse.json({ error: 'childId required' }, { status: 400 });
    }
    const { data } = await supabase
      .from('attendance')
      .select('id, child_id, child_name, date, check_in, check_out')
      .eq('child_id', body.childId)
      .eq('date', todayDate())
      .eq('center_id', centerId)
      .limit(1);
    return NextResponse.json({ data: data?.[0] || null });
  }

  // ---- checkin ----
  if (body.action === 'checkin') {
    if (!body.childId || !body.childName) {
      return NextResponse.json({ error: 'childId and childName required' }, { status: 400 });
    }
    const familyId = (body.familyId || '').trim();
    if (!familyId) {
      return NextResponse.json({ error: 'familyId required' }, { status: 400 });
    }
    const guard = await verifyKioskChild(supabase, body.childId, centerId, familyId, {
      blockEnded: true,
    });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const today = todayDate();

    const { data: existingRows, error: existErr } = await supabase
      .from('attendance')
      .select('id, check_in, check_out')
      .eq('child_id', body.childId)
      .eq('date', today)
      .eq('center_id', centerId)
      .limit(1);
    // Reading the current row failed (DB down). Return 503 so the client queues
    // this check-in offline and replays it when the system is back, rather than
    // dropping it or risking a blind duplicate insert.
    if (existErr) {
      return NextResponse.json({ error: 'System unavailable' }, { status: 503 });
    }
    const existing = existingRows?.[0];

    if (existing && existing.check_in && !existing.check_out) {
      return NextResponse.json({ data: { ok: true } });
    }

    const signedInBy = (body.signedByName || '').toString().trim() || null;

    if (existing && existing.check_out) {
      const { error: reopenErr } = await supabase
        .from('attendance')
        .update({ check_out: null, check_in: new Date().toISOString(), signed_in_by_name: signedInBy })
        .eq('id', existing.id);
      if (reopenErr) {
        return NextResponse.json({ error: 'System unavailable' }, { status: 503 });
      }
      return NextResponse.json({ data: { ok: true } });
    }

    const { error: insertErr } = await supabase.from('attendance').insert({
      child_id: body.childId,
      child_name: body.childName,
      date: today,
      check_in: new Date().toISOString(),
      center_id: centerId,
      notes: `family:${familyId}`,
      signed_in_by_name: signedInBy,
    });
    if (insertErr) {
      return NextResponse.json({ error: 'System unavailable' }, { status: 503 });
    }
    return NextResponse.json({ data: { ok: true } });
  }

  // ---- checkout ----
  if (body.action === 'checkout') {
    if (!body.childId) {
      return NextResponse.json({ error: 'childId required' }, { status: 400 });
    }
    const guard = await verifyKioskChild(
      supabase,
      body.childId,
      centerId,
      (body.familyId || '').trim() || undefined
    );
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const { error: checkoutErr } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString(), signed_out_by_name: (body.signedByName || '').toString().trim() || null })
      .eq('child_id', body.childId)
      .eq('date', todayDate())
      .eq('center_id', centerId);
    // DB write failed: 503 so the client queues the checkout for replay.
    if (checkoutErr) {
      return NextResponse.json({ error: 'System unavailable' }, { status: 503 });
    }
    return NextResponse.json({ data: { ok: true } });
  }

  // ---- staff clock status: is this employee clocked in today? ----
  if (body.action === 'clockstatus') {
    if (!body.employeeId) return NextResponse.json({ data: { clockedIn: false } });
    const { data: openRows } = await supabase
      .from('time_entries')
      .select('id, clock_in')
      .eq('employee_id', body.employeeId)
      .eq('date', todayDate())
      .is('clock_out', null)
      .limit(5);
    const open = openRows?.[0];
    return NextResponse.json({ data: { clockedIn: !!open, since: (open?.clock_in as string) ?? null } });
  }

  // ---- staff clock in / out (server-side; validates the employee's center) ----
  if (body.action === 'clockin' || body.action === 'clockout') {
    if (!body.employeeId) {
      return NextResponse.json({ error: 'employeeId required' }, { status: 400 });
    }
    // The employee must belong to this kiosk's center.
    const { data: emp } = await supabase
      .from('employees')
      .select('id, center_id')
      .eq('id', body.employeeId)
      .maybeSingle();
    if (!emp) return NextResponse.json({ error: 'Unknown staff' }, { status: 404 });
    if (emp.center_id && emp.center_id !== centerId) {
      return NextResponse.json({ error: 'Not your center' }, { status: 403 });
    }

    const today = todayDate();
    const { data: openRows } = await supabase
      .from('time_entries')
      .select('id, clock_in')
      .eq('employee_id', body.employeeId)
      .eq('date', today)
      .is('clock_out', null)
      .limit(5);
    const open = openRows?.[0];

    if (body.action === 'clockin') {
      if (open) return NextResponse.json({ data: { ok: true, already: true } });
      await supabase.from('time_entries').insert({
        employee_id: body.employeeId,
        date: today,
        clock_in: new Date().toISOString(),
        status: 'open',
        center_id: centerId,
        source: 'kiosk',
      });
      return NextResponse.json({ data: { ok: true } });
    }

    // clockout
    if (!open) return NextResponse.json({ data: { ok: true } });
    const clockOut = new Date();
    const startedAt = open.clock_in ? new Date(open.clock_in as string).getTime() : null;
    const hours = startedAt ? Math.max(0, (clockOut.getTime() - startedAt) / 3_600_000) : null;
    await supabase
      .from('time_entries')
      .update({
        clock_out: clockOut.toISOString(),
        status: 'closed',
        hours_worked: hours != null ? Number(hours.toFixed(2)) : null,
      })
      .eq('id', open.id);
    return NextResponse.json({ data: { ok: true } });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
