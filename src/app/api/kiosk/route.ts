export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { getServerSupabase } from '@/lib/supabase/server';
import { centerDate } from '@/lib/center-time';

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
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // The kiosk is bound to one center (its per-device URL). Every lookup and
  // write below is scoped to this center so a kiosk can never resolve or mutate
  // another center's family or attendance row. Defaults to the operating center
  // for legacy single-center kiosks that don't send one.
  const centerId = body.centerId || OPERATING_CENTER_ID;

  // ---- lookup: PIN -> family (tightly rate limited; this is the abuse path) ----
  if (body.action === 'lookup') {
    const pinLimit = checkRateLimit(`kiosk-pin:${clientId}`, {
      maxRequests: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (!pinLimit.success) {
      return NextResponse.json(
        { error: 'Too many PIN attempts. Please wait.' },
        { status: 429, headers: { 'Retry-After': pinLimit.retryAfterSeconds?.toString() ?? '900' } }
      );
    }

    const pin = (body.pin || '').trim();
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ data: null });
    }

    const { data: families } = await supabase
      .from('families')
      .select('id, email, status')
      .eq('pin', pin)
      .eq('status', 'active')
      .eq('center_id', centerId)
      .limit(1);

    if (!families || families.length === 0) {
      return NextResponse.json({ data: null });
    }
    const family = families[0];

    const { data: parents } = await supabase
      .from('family_parents')
      .select('id, family_id, name, phone, email, relationship, is_primary')
      .eq('family_id', family.id);

    const { data: children } = await supabase
      .from('family_children')
      .select('id, family_id, name, date_of_birth, classroom')
      .eq('family_id', family.id);

    return NextResponse.json({
      data: {
        id: family.id,
        email: family.email,
        parents: parents || [],
        children: children || [],
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
    const today = todayDate();

    const { data: existingRows } = await supabase
      .from('attendance')
      .select('id, check_in, check_out')
      .eq('child_id', body.childId)
      .eq('date', today)
      .eq('center_id', centerId)
      .limit(1);
    const existing = existingRows?.[0];

    if (existing && existing.check_in && !existing.check_out) {
      return NextResponse.json({ data: { ok: true } });
    }

    if (existing && existing.check_out) {
      await supabase
        .from('attendance')
        .update({ check_out: null, check_in: new Date().toISOString() })
        .eq('id', existing.id);
      return NextResponse.json({ data: { ok: true } });
    }

    await supabase.from('attendance').insert({
      child_id: body.childId,
      child_name: body.childName,
      date: today,
      check_in: new Date().toISOString(),
      center_id: centerId,
      notes: body.familyId ? `family:${body.familyId}` : null,
    });
    return NextResponse.json({ data: { ok: true } });
  }

  // ---- checkout ----
  if (body.action === 'checkout') {
    if (!body.childId) {
      return NextResponse.json({ error: 'childId required' }, { status: 400 });
    }
    await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('child_id', body.childId)
      .eq('date', todayDate())
      .eq('center_id', centerId);
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
