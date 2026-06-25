export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// The signed-in parent reads their own direct messages from the center.
// Any valid session; the email is taken from the verified session cookie,
// never from the client, so a parent can only ever see their own messages.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = (session.user.email || '').toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ messages: [] });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ messages: [] });
  }

  // Only SENT messages reach the parent. Drafts awaiting owner review
  // (status 'pending_review' / 'draft') must never be visible here.
  const { data } = await supabase
    .from('parent_messages')
    .select('id, subject, body, from_name, created_at, read_by_parent')
    .ilike('parent_email', email)
    .eq('status', 'sent')
    .order('created_at', { ascending: false })
    .limit(200);

  // Mark them read once fetched (best effort) — sent messages only.
  if (data && data.some((m) => !m.read_by_parent)) {
    await supabase
      .from('parent_messages')
      .update({ read_by_parent: true })
      .ilike('parent_email', email)
      .eq('status', 'sent')
      .eq('read_by_parent', false);
  }

  return NextResponse.json({ messages: data || [] });
}
