export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { reportError } from '@/lib/error-reporter';
import type { SupportTicket, TicketStatus } from '@/lib/support/types';

// Owner/admin/superadmin only (requireSession('admin') enforces the rank).
// Lists all tickets with an optional status filter, plus the unhandled "new" count.
export async function GET(req: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const statusParam = req.nextUrl.searchParams.get('status');
  const status: TicketStatus | null =
    statusParam === 'new' || statusParam === 'in_progress' || statusParam === 'resolved'
      ? statusParam
      : null;

  try {
    let listQuery = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (status) listQuery = listQuery.eq('status', status);

    const [list, count] = await Promise.all([
      listQuery,
      supabase
        .from('support_tickets')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
    ]);
    if (list.error) throw list.error;

    return NextResponse.json({
      tickets: (list.data ?? []) as SupportTicket[],
      newCount: count.count ?? 0,
    });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error('admin tickets fetch failed'), {
      route: '/api/admin/support/tickets',
    });
    return NextResponse.json({ error: 'Could not load tickets.' }, { status: 500 });
  }
}
