export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionEmployee } from '@/lib/employee-server';
import { centerDateOf } from '@/lib/center-time';
import {
  ADMIN_ONLY_TYPES,
  STAFF_EDITABLE_TYPES,
  STAFF_EDIT_WINDOW_MS,
  ADMIN_ROLES,
} from '@/lib/child-entries-policy';

// Edit (PATCH) and soft-delete (DELETE) a single child_daily_entries row.
// Staff (teacher rank) may change everyday entries from the last 48 hours;
// medication + incident are admin-only; clock/payroll is untouched here.
// All gates are enforced server-side. child_daily_entries is service-role-only.

type EntryRow = {
  id: string;
  type: string;
  occurred_at: string | null;
  detail: Record<string, unknown> | null;
  deleted_at: string | null;
};

// Returns null when allowed, or an error response when not. `isAdmin` callers
// bypass the type + time limits.
function gate(entry: EntryRow, isAdmin: boolean): NextResponse | null {
  const adminOnly = (ADMIN_ONLY_TYPES as readonly string[]).includes(entry.type);
  if (adminOnly && !isAdmin) {
    return NextResponse.json(
      { error: 'Medication and incident entries can only be changed by the director.' },
      { status: 403 }
    );
  }
  if (!isAdmin && !(STAFF_EDITABLE_TYPES as readonly string[]).includes(entry.type)) {
    return NextResponse.json({ error: 'This entry cannot be changed here.' }, { status: 403 });
  }
  if (!isAdmin) {
    const occurred = entry.occurred_at ? new Date(entry.occurred_at).getTime() : 0;
    if (!occurred || Date.now() - occurred > STAFF_EDIT_WINDOW_MS) {
      return NextResponse.json(
        { error: 'This entry is locked. Ask the director to change it.' },
        { status: 403 }
      );
    }
  }
  return null;
}

async function loadContext(id: string) {
  const session = await requireSession('teacher');
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return { error: NextResponse.json({ error: 'Unavailable' }, { status: 503 }) } as const;
  }
  const { data: entry } = await supabase
    .from('child_daily_entries')
    .select('id, type, occurred_at, detail, deleted_at')
    .eq('id', id)
    .maybeSingle();
  if (!entry || entry.deleted_at) {
    return { error: NextResponse.json({ error: 'Entry not found' }, { status: 404 }) } as const;
  }
  const isAdmin = ADMIN_ROLES.includes(session.user.role);
  const employee = await resolveSessionEmployee(session);
  return { session, supabase, entry: entry as EntryRow, isAdmin, employee } as const;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await loadContext(params.id);
  if ('error' in ctx) return ctx.error;
  const { supabase, entry, isAdmin, employee } = ctx;

  const denied = gate(entry, isAdmin);
  if (denied) return denied;

  let body: { detail?: Record<string, unknown>; occurred_at?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    edited_by: employee?.id ?? null,
  };
  if (body.detail && typeof body.detail === 'object') {
    update.detail = body.detail;
  }
  if (typeof body.occurred_at === 'string' && body.occurred_at) {
    update.occurred_at = body.occurred_at;
    update.date = centerDateOf(body.occurred_at);
  }

  const { data: updated, error } = await supabase
    .from('child_daily_entries')
    .update(update)
    .eq('id', entry.id)
    .is('deleted_at', null)
    .select('id, child_id, date, type, detail, occurred_at, recorded_by, classroom_id, updated_at')
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: 'Could not update the entry' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, entry: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await loadContext(params.id);
  if ('error' in ctx) return ctx.error;
  const { supabase, entry, isAdmin, employee } = ctx;

  const denied = gate(entry, isAdmin);
  if (denied) return denied;

  // Soft delete: retain the record for compliance, hide it from the timeline.
  const { error } = await supabase
    .from('child_daily_entries')
    .update({ deleted_at: new Date().toISOString(), deleted_by: employee?.id ?? null })
    .eq('id', entry.id)
    .is('deleted_at', null);

  if (error) {
    return NextResponse.json({ error: 'Could not delete the entry' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: true });
}
