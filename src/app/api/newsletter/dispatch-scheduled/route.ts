export const runtime = 'nodejs';
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { getNewsletter } from '@/lib/newsletter-storage';
import { bulkSendNewsletter } from '@/lib/newsletter/bulk-send';

// Vercel Cron entry. Runs every 5 minutes via vercel.json. Picks up any
// newsletter rows where status='scheduled' AND scheduled_for <= now() and
// sends them. Uses dispatch_lock to avoid double-sends if two cron runs
// overlap.
//
// Authorization:
//  - Vercel Cron sends an Authorization: Bearer ${CRON_SECRET} header
//  - We accept it in production. In dev anyone can call this; that's fine
//    because the lock prevents double-sends.

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Supabase service role not configured.' },
      { status: 503 }
    );
  }

  const lockId = `cron_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const nowIso = new Date().toISOString();

  // Atomic claim: update with WHERE status='scheduled' AND scheduled_for<=now()
  // AND dispatch_lock IS NULL. Returns the rows we now own.
  const { data: claimed, error: claimError } = await supabase
    .from('newsletters')
    .update({ dispatch_lock: lockId })
    .eq('status', 'scheduled')
    .lte('scheduled_for', nowIso)
    .is('dispatch_lock', null)
    .select('id');

  if (claimError) {
    return NextResponse.json(
      { ok: false, error: `Claim failed: ${claimError.message}` },
      { status: 500 }
    );
  }

  const ids = (claimed ?? []).map((r) => r.id as string);
  const results: Array<{ id: string; ok: boolean; sent: number; failed: number; error?: string }> = [];

  for (const id of ids) {
    try {
      const newsletter = await getNewsletter(id);
      if (!newsletter) {
        results.push({ id, ok: false, sent: 0, failed: 0, error: 'not found after claim' });
        continue;
      }
      const r = await bulkSendNewsletter(newsletter);
      results.push({
        id,
        ok: r.ok,
        sent: r.successCount,
        failed: r.failureCount,
        error: r.errors[0]?.error,
      });
    } catch (e) {
      results.push({ id, ok: false, sent: 0, failed: 0, error: (e as Error).message });
    } finally {
      // Release the lock regardless of outcome. bulkSendNewsletter sets
      // status='sent' on success; on failure we leave it scheduled for retry
      // by clearing the lock.
      const { data: row } = await supabase
        .from('newsletters')
        .select('status')
        .eq('id', id)
        .maybeSingle();
      if (row?.status !== 'sent') {
        await supabase
          .from('newsletters')
          .update({ dispatch_lock: null })
          .eq('id', id);
      } else {
        await supabase
          .from('newsletters')
          .update({ dispatch_lock: null })
          .eq('id', id);
      }
    }
  }

  return NextResponse.json({ ok: true, claimed: ids.length, results });
}
