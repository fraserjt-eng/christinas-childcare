export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAudit, auditIp } from '@/lib/audit-log';

const STATUSES = ['new', 'in_review', 'completed', 'denied'] as const;

// GET: the director's deletion-request queue. Admin only, service role.
export async function GET(): Promise<NextResponse> {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('data_deletion_requests')
    .select('id, created_at, requester_name, requester_email, relationship, child_name, reason, status, admin_notes, handled_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: 'Could not load requests' }, { status: 500 });
  }
  return NextResponse.json(
    { requests: data ?? [] },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

// PATCH { id, status?, admin_notes? }: record progress on a request. Admin only.
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.status === 'string') {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    update.status = body.status;
    update.handled_by = session.user.email || session.user.id;
    update.handled_at = new Date().toISOString();
  }
  if (typeof body.admin_notes === 'string') {
    update.admin_notes = body.admin_notes.slice(0, 4000);
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('data_deletion_requests')
    .update(update)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Could not update the request' }, { status: 500 });
  }

  await logAudit({
    actor: session.user,
    action: 'data_request.update',
    targetType: 'data_request',
    targetId: id,
    centerId: session.user.center_id ?? null,
    detail: typeof body.status === 'string' ? { status: body.status } : undefined,
    ip: auditIp(request),
  });

  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
