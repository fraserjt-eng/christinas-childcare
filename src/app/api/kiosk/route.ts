export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { getServerSupabase } from '@/lib/supabase/server';

// The live kiosk's only data path. The browser never touches the family or
// attendance tables directly (anon is denied on them by migration 017). This
// route uses the service-role client and returns ONLY the fields the kiosk
// renders — never pin or password_hash.

const CRYSTAL_CENTER_ID = '3104ae69-4f26-4c1e-a767-3ff45b534860';

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
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
      center_id: CRYSTAL_CENTER_ID,
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
      .eq('date', todayDate());
    return NextResponse.json({ data: { ok: true } });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
