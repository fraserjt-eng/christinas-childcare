export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// Admin time corrections, authoritative on the real tables so the fix
// pulses everywhere (payroll, ratios, labor, dashboard, reports):
//  - kind 'clock'      -> time_entries (recomputes hours_worked + status)
//  - kind 'attendance' -> attendance (family check in/out)
// Admin only (rank >= admin). Mistakes happen; this is how they get fixed
// without touching the database by hand.

function validIso(s: unknown): s is string {
  return typeof s === 'string' && s.length > 0 && !isNaN(new Date(s).getTime());
}

function hoursBetween(inIso: string, outIso: string, breakMin: number): number {
  const ms = new Date(outIso).getTime() - new Date(inIso).getTime();
  const h = ms / 3600000 - (breakMin || 0) / 60;
  return Math.max(0, Math.round(h * 100) / 100);
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: {
    kind?: string;
    id?: string;
    clock_in?: string | null;
    clock_out?: string | null;
    break_minutes?: number;
    check_in?: string | null;
    check_out?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const id = (body.id || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  // ---- Staff clock correction ----------------------------------------
  if (body.kind === 'clock') {
    const { data: existing } = await supabase
      .from('time_entries')
      .select('id, clock_in, clock_out, break_minutes')
      .eq('id', id)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    const clockIn =
      body.clock_in === undefined ? (existing.clock_in as string | null) : body.clock_in;
    const clockOut =
      body.clock_out === undefined ? (existing.clock_out as string | null) : body.clock_out;
    const breakMin =
      typeof body.break_minutes === 'number'
        ? body.break_minutes
        : (existing.break_minutes as number) || 0;

    if (clockIn && !validIso(clockIn)) {
      return NextResponse.json({ error: 'Invalid clock-in time' }, { status: 400 });
    }
    if (clockOut && !validIso(clockOut)) {
      return NextResponse.json({ error: 'Invalid clock-out time' }, { status: 400 });
    }
    if (clockIn && clockOut && new Date(clockOut) < new Date(clockIn)) {
      return NextResponse.json(
        { error: 'Clock-out cannot be before clock-in' },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {
      clock_in: clockIn,
      clock_out: clockOut,
      break_minutes: breakMin,
    };
    if (clockIn && clockOut) {
      update.hours_worked = hoursBetween(clockIn, clockOut, breakMin);
      update.status = 'closed';
    } else {
      update.hours_worked = null;
      update.status = 'open';
    }

    const { data: saved, error } = await supabase
      .from('time_entries')
      .update(update)
      .eq('id', id)
      .select('id, clock_in, clock_out, hours_worked, break_minutes, status')
      .single();
    if (error || !saved) {
      return NextResponse.json(
        { error: 'Could not save the correction' },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, entry: saved });
  }

  // ---- Family attendance correction ----------------------------------
  if (body.kind === 'attendance') {
    const { data: existing } = await supabase
      .from('attendance')
      .select('id, check_in, check_out')
      .eq('id', id)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    const checkIn =
      body.check_in === undefined ? (existing.check_in as string | null) : body.check_in;
    const checkOut =
      body.check_out === undefined ? (existing.check_out as string | null) : body.check_out;

    if (checkIn && !validIso(checkIn)) {
      return NextResponse.json({ error: 'Invalid check-in time' }, { status: 400 });
    }
    if (checkOut && !validIso(checkOut)) {
      return NextResponse.json({ error: 'Invalid check-out time' }, { status: 400 });
    }
    if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) {
      return NextResponse.json(
        { error: 'Check-out cannot be before check-in' },
        { status: 400 }
      );
    }

    const { data: saved, error } = await supabase
      .from('attendance')
      .update({ check_in: checkIn, check_out: checkOut })
      .eq('id', id)
      .select('id, check_in, check_out')
      .single();
    if (error || !saved) {
      return NextResponse.json(
        { error: 'Could not save the correction' },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, attendance: saved });
  }

  return NextResponse.json({ error: 'Unknown correction kind' }, { status: 400 });
}
