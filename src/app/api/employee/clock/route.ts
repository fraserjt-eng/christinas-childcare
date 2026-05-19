export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { centerDate } from '@/lib/center-time';

// Staff clock in/out, written to the real time_entries table, stamped to the
// VERIFIED session employee (not localStorage). This is the spine the pulse
// (payroll, ratios, budget, dashboard, daily report) reads from.

function todayDate(): string {
  // Center timezone, so a clock-in pulses on the same day ratios/dashboard
  // read (they were UTC-vs-Central misaligned after 7pm).
  return centerDate();
}

function hoursBetween(inIso: string, outIso: string, breakMin: number): number {
  const ms = new Date(outIso).getTime() - new Date(inIso).getTime();
  const h = ms / 3600000 - (breakMin || 0) / 60;
  return Math.max(0, Math.round(h * 100) / 100);
}

// GET: current clock status for the signed-in staff member.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const employee = await resolveSessionEmployee(session);
  if (!employee) {
    return NextResponse.json({ error: 'No active staff record' }, { status: 404 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data: open } = await supabase
    .from('time_entries')
    .select('id, date, clock_in, clock_out, hours_worked, status')
    .eq('employee_id', employee.id)
    .is('clock_out', null)
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: today } = await supabase
    .from('time_entries')
    .select('id, date, clock_in, clock_out, hours_worked, break_minutes, status')
    .eq('employee_id', employee.id)
    .eq('date', todayDate())
    .order('clock_in', { ascending: false });

  // This week (Sunday start) for the weekly-hours summary.
  const sow = new Date();
  sow.setDate(sow.getDate() - sow.getDay());
  sow.setHours(0, 0, 0, 0);
  const { data: week } = await supabase
    .from('time_entries')
    .select('id, date, clock_in, clock_out, hours_worked, break_minutes, status')
    .eq('employee_id', employee.id)
    .gte('date', sow.toISOString().split('T')[0])
    .order('clock_in', { ascending: false });

  return NextResponse.json({
    employee: {
      id: employee.id,
      full_name: `${employee.first_name} ${employee.last_name}`.trim(),
      role: employee.role,
    },
    active: open ?? null,
    today: today ?? [],
    week: week ?? [],
  });
}

// POST { action: 'in' | 'out', breakMinutes? }
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const employee = await resolveSessionEmployee(session);
  if (!employee) {
    return NextResponse.json({ error: 'No active staff record' }, { status: 404 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: { action?: string; breakMinutes?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { data: open } = await supabase
    .from('time_entries')
    .select('id, clock_in')
    .eq('employee_id', employee.id)
    .is('clock_out', null)
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (body.action === 'in') {
    if (open) {
      return NextResponse.json({ ok: true, entry: open, alreadyOpen: true });
    }
    const nowIso = new Date().toISOString();
    const { data: created, error } = await supabase
      .from('time_entries')
      .insert({
        employee_id: employee.id,
        date: todayDate(),
        clock_in: nowIso,
        status: 'open',
        source: 'pin',
        center_id: employee.center_id,
      })
      .select('id, date, clock_in, status')
      .single();
    if (error || !created) {
      return NextResponse.json({ error: 'Could not clock in' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, entry: created });
  }

  if (body.action === 'out') {
    if (!open) {
      return NextResponse.json(
        { error: 'Not clocked in' },
        { status: 409 }
      );
    }
    const nowIso = new Date().toISOString();
    const breakMin = Number.isFinite(body.breakMinutes) ? Number(body.breakMinutes) : 0;
    const hrs = hoursBetween(open.clock_in as string, nowIso, breakMin);
    const { data: closed, error } = await supabase
      .from('time_entries')
      .update({
        clock_out: nowIso,
        hours_worked: hrs,
        break_minutes: breakMin,
        status: 'closed',
      })
      .eq('id', open.id)
      .select('id, date, clock_in, clock_out, hours_worked, status')
      .single();
    if (error || !closed) {
      return NextResponse.json({ error: 'Could not clock out' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, entry: closed });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
