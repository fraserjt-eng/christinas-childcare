export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { reportError } from '@/lib/error-reporter';
import type { MyTicket } from '@/lib/support/types';

// A submitter's own tickets, for the "Your reports" list on the support page.
// Filtered server-side by the session user; never returns anyone else's rows.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('id, subject, status, created_at, resolved_at')
      .eq('submitter_id', String(session.user.id))
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ tickets: (data ?? []) as MyTicket[] });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error('my tickets fetch failed'), {
      route: '/api/support/tickets/mine',
    });
    return NextResponse.json({ error: 'Could not load your reports.' }, { status: 500 });
  }
}
