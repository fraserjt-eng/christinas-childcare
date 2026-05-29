export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { reportError } from '@/lib/error-reporter';

const SIGNED_TTL_SECONDS = 60 * 10; // 10 minutes

// Owner/admin only. Returns short-lived signed URLs for a ticket's media.
// The bucket is private; these links are the only way to view the files.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  try {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('audio_path, image_path')
      .eq('id', params.id)
      .maybeSingle();
    if (error) throw error;
    if (!ticket) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const sign = async (path: string | null): Promise<string | null> => {
      if (!path) return null;
      const { data } = await supabase!.storage
        .from('ticket-media')
        .createSignedUrl(path, SIGNED_TTL_SECONDS);
      return data?.signedUrl ?? null;
    };

    return NextResponse.json({
      audioUrl: await sign(ticket.audio_path),
      imageUrl: await sign(ticket.image_path),
    });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error('ticket media sign failed'), {
      route: '/api/admin/support/tickets/[id]/media',
    });
    return NextResponse.json({ error: 'Could not load media.' }, { status: 500 });
  }
}
