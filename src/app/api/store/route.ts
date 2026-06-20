export const runtime = 'nodejs';

// Guarded generic store. The browser anon key must NOT reach PII / roster /
// security tables, but those tables back client-side dual-write modules. This
// route is the session-gated, service-role path those modules use instead of
// the anon client. Every table here has its anon RLS policy removed (or, for
// app_settings, narrowed to non-sensitive keys), so the ONLY way to read/write
// them is through this route, which checks a per-table minimum role.
//
// It mirrors the operations of src/lib/supabase/service.ts so a storage module
// only swaps its import (service -> guarded). Service role bypasses RLS.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

type MinRole = 'parent' | 'teacher' | 'admin';

// Per-table minimum role for reads vs writes. Writes to the roster/security
// table and the substitutes roster require admin; family-owned prefs/messages
// allow any signed-in user (the family); the rest are staff-level.
const POLICY: Record<string, { read: MinRole; write: MinRole }> = {
  app_settings: { read: 'teacher', write: 'admin' },
  notification_prefs: { read: 'parent', write: 'parent' },
  parent_conversations: { read: 'parent', write: 'parent' },
  comms: { read: 'teacher', write: 'teacher' },
  authorizations: { read: 'teacher', write: 'teacher' },
  substitutes: { read: 'teacher', write: 'admin' },
  sub_assignments: { read: 'teacher', write: 'teacher' },
};

const RANK: Record<string, number> = {
  parent: 1,
  teacher: 2,
  employee: 2,
  admin: 3,
  director: 3,
  owner: 4,
  superadmin: 5,
};
const rankOf = (role: string | undefined) => RANK[(role || '').toLowerCase()] ?? 0;

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: {
    op?: string;
    table?: string;
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    record?: Record<string, unknown>;
    updates?: Record<string, unknown>;
    id?: string;
    onConflict?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const op = body.op || '';
  const table = body.table || '';
  const policy = POLICY[table];
  if (!policy) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
  }

  const isWrite = op !== 'select';
  const min = isWrite ? policy.write : policy.read;
  if (rankOf(session.user.role) < RANK[min]) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    if (op === 'select') {
      let q = supabase.from(table).select('*');
      if (body.filters) {
        for (const [k, v] of Object.entries(body.filters)) {
          if (v !== undefined && v !== null) q = q.eq(k, v);
        }
      }
      if (body.orderBy) {
        q = q.order(body.orderBy.column, { ascending: body.orderBy.ascending ?? true });
      }
      if (body.limit) q = q.limit(body.limit);
      const { data, error } = await q;
      if (error) return NextResponse.json({ data: null }, { status: 200 });
      return NextResponse.json({ data: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (op === 'insert') {
      const { data } = await supabase.from(table).insert(body.record ?? {}).select().single();
      return NextResponse.json({ data: data ?? null });
    }

    if (op === 'update') {
      if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
      const { data } = await supabase
        .from(table)
        .update({ ...(body.updates ?? {}), updated_at: new Date().toISOString() })
        .eq('id', body.id)
        .select()
        .single();
      return NextResponse.json({ data: data ?? null });
    }

    if (op === 'upsert') {
      const { data } = await supabase
        .from(table)
        .upsert(body.record ?? {}, { onConflict: body.onConflict || 'id' })
        .select()
        .single();
      return NextResponse.json({ data: data ?? null });
    }

    if (op === 'delete') {
      if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
      await supabase.from(table).delete().eq('id', body.id);
      return NextResponse.json({ data: true });
    }

    return NextResponse.json({ error: 'Unknown op' }, { status: 400 });
  } catch {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
