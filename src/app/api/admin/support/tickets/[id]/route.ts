export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { reportError } from '@/lib/error-reporter';
import type { TicketStatus } from '@/lib/support/types';

const VALID: TicketStatus[] = ['new', 'in_progress', 'resolved'];

// Owner/admin only. Moves a ticket between New / In progress / Resolved.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const status = body.status as TicketStatus | undefined;
  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error('ticket status update failed'), {
      route: '/api/admin/support/tickets/[id]',
    });
    return NextResponse.json({ error: 'Could not update the ticket.' }, { status: 500 });
  }
}
