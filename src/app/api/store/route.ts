export const runtime = 'nodejs';

// Guarded generic store. The browser anon key must NOT reach PII / roster /
// security tables, but those tables back client-side dual-write modules. This
// route is the session-gated, service-role path those modules use.
//
// SECURITY (hardened after the pre-ship SOC review found an IDOR): a per-table
// minimum role is NOT enough — the service role bypasses RLS, so this route must
// enforce ROW OWNERSHIP itself. Every owner-scoped table is constrained to the
// caller's own rows on the server, regardless of any client-supplied filters:
//   - parent_conversations / notification_prefs: a parent sees ONLY their own
//     family's rows (by family email / family id); staff see their own center.
//   - comms / authorizations / substitutes / sub_assignments: scoped to the
//     caller's center; only an owner/superadmin is cross-center.
//   - app_settings: non-sensitive global keys (teacher read / admin write).
// Writes force the ownership fields server-side and verify the target row's
// ownership before update/upsert/delete, so a row id cannot be used to reach
// another family's or center's data.

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, type AuthedSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionFamily } from '@/lib/parent-server';
import { logAudit, auditIp } from '@/lib/audit-log';

type MinRole = 'parent' | 'teacher' | 'admin';

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
  parent: 1, teacher: 2, employee: 2, admin: 3, director: 3, owner: 4, superadmin: 5,
};
const rankOf = (role: string | undefined) => RANK[(role || '').toLowerCase()] ?? 0;

interface Ctx { rank: number; isParent: boolean; isCrossCenter: boolean; center: string | null; email: string; }
function ctxOf(session: AuthedSession): Ctx {
  const role = (session.user.role || '').toLowerCase();
  return {
    rank: rankOf(role),
    isParent: rankOf(role) <= 1,
    isCrossCenter: role === 'owner' || role === 'superadmin',
    center: session.user.center_id ?? null,
    email: (session.user.email || '').toLowerCase().trim(),
  };
}

type Scope = 'global' | { filterCol: string; filterVal: string; stamp: Record<string, string> } | null;

// Resolve the server-enforced ownership scope for (table, session). null = deny.
async function scopeFor(table: string, session: AuthedSession, ctx: Ctx): Promise<Scope> {
  if (table === 'app_settings') return 'global';

  if (table === 'parent_conversations') {
    if (ctx.isParent) {
      if (!ctx.email) return null;
      const stamp: Record<string, string> = { parent_email: ctx.email };
      if (ctx.center) stamp.center_id = ctx.center;
      return { filterCol: 'parent_email', filterVal: ctx.email, stamp };
    }
    if (ctx.isCrossCenter) return 'global';
    return ctx.center ? { filterCol: 'center_id', filterVal: ctx.center, stamp: { center_id: ctx.center } } : null;
  }

  if (table === 'notification_prefs') {
    if (ctx.isParent) {
      const fam = await resolveSessionFamily(session);
      if (!fam) return null;
      const stamp: Record<string, string> = { id: fam.family_id };
      if (ctx.center) stamp.center_id = ctx.center;
      return { filterCol: 'id', filterVal: fam.family_id, stamp };
    }
    if (ctx.isCrossCenter) return 'global';
    return ctx.center ? { filterCol: 'center_id', filterVal: ctx.center, stamp: { center_id: ctx.center } } : null;
  }

  // center-scoped staff tables (comms, authorizations, substitutes, sub_assignments)
  if (ctx.isCrossCenter) return 'global';
  return ctx.center ? { filterCol: 'center_id', filterVal: ctx.center, stamp: { center_id: ctx.center } } : null;
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  let body: {
    op?: string; table?: string; filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean }; limit?: number;
    record?: Record<string, unknown>; updates?: Record<string, unknown>; id?: string; onConflict?: string;
  };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const op = body.op || '';
  const table = body.table || '';
  const policy = POLICY[table];
  if (!policy) return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });

  const ctx = ctxOf(session);
  const isWrite = op !== 'select';
  if (ctx.rank < RANK[isWrite ? policy.write : policy.read]) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Server-enforced row ownership (NOT the client's filters).
  const scope = await scopeFor(table, session, ctx);
  if (scope === null) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Confirm an existing row by id belongs to the caller's scope before mutating it.
  async function ownsRow(id: string): Promise<boolean> {
    if (scope === 'global' || scope === null) return true;
    const { data } = await supabase!.from(table).select(scope.filterCol).eq('id', id).maybeSingle();
    if (!data) return true; // no existing row -> new insert via upsert; record gets force-stamped
    const row = data as unknown as Record<string, unknown>;
    return String(row[scope.filterCol] ?? '').toLowerCase() === String(scope.filterVal).toLowerCase();
  }

  try {
    if (op === 'select') {
      let q = supabase.from(table).select('*');
      if (scope !== 'global') q = q.eq(scope.filterCol, scope.filterVal); // forced ownership; client filters are ignored
      if (body.orderBy) q = q.order(body.orderBy.column, { ascending: body.orderBy.ascending ?? true });
      if (body.limit) q = q.limit(body.limit);
      const { data, error } = await q;
      if (error) return NextResponse.json({ data: null }, { status: 200 });
      return NextResponse.json({ data: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (op === 'insert') {
      const rec = { ...(body.record ?? {}) };
      if (scope !== 'global') Object.assign(rec, scope.stamp);
      const { data } = await supabase.from(table).insert(rec).select().single();
      await logAudit({
        actor: session.user, action: `store.insert`, targetType: table,
        targetId: (data as { id?: string } | null)?.id ?? null, centerId: ctx.center, ip: auditIp(request),
      });
      return NextResponse.json({ data: data ?? null });
    }

    if (op === 'upsert') {
      const rec = { ...(body.record ?? {}) };
      if (scope !== 'global') Object.assign(rec, scope.stamp);
      const rid = (rec.id as string) || body.id;
      if (rid && !(await ownsRow(rid))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const { data } = await supabase.from(table).upsert(rec, { onConflict: body.onConflict || 'id' }).select().single();
      await logAudit({
        actor: session.user, action: `store.upsert`, targetType: table,
        targetId: (data as { id?: string } | null)?.id ?? rid ?? null, centerId: ctx.center, ip: auditIp(request),
      });
      return NextResponse.json({ data: data ?? null });
    }

    if (op === 'update') {
      if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
      if (!(await ownsRow(body.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const updates: Record<string, unknown> = { ...(body.updates ?? {}), updated_at: new Date().toISOString() };
      if (scope !== 'global') for (const [k, v] of Object.entries(scope.stamp)) if (k !== 'id') updates[k] = v; // can't reassign owner
      const { data } = await supabase.from(table).update(updates).eq('id', body.id).select().single();
      await logAudit({
        actor: session.user, action: `store.update`, targetType: table,
        targetId: body.id, centerId: ctx.center, ip: auditIp(request),
      });
      return NextResponse.json({ data: data ?? null });
    }

    if (op === 'delete') {
      if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
      if (!(await ownsRow(body.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      await supabase.from(table).delete().eq('id', body.id);
      await logAudit({
        actor: session.user, action: `store.delete`, targetType: table,
        targetId: body.id, centerId: ctx.center, ip: auditIp(request),
      });
      return NextResponse.json({ data: true });
    }

    return NextResponse.json({ error: 'Unknown op' }, { status: 400 });
  } catch {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
