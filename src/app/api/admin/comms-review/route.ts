export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// Owner review queue: family communications awaiting sign-off before they reach
// a parent. Owner/superadmin only (the email override makes J + Christina
// superadmin). Today it lists pending parent messages; family broadcasts plug
// into the same shape ({ type }) next.
export async function GET() {
  const session = await requireSession('owner');
  if (!session) {
    return NextResponse.json({ error: 'Owner sign-in required' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const role = (session.user.role || '').toLowerCase();
  const myCenter = session.user.center_id ?? null;
  const crossCenter = role === 'superadmin' || role === 'owner' || !myCenter;

  // Fetch by status only (no .order() alongside the filter — PostgREST can drop
  // rows when ordering is combined with filters); sort in JS.
  const { data: msgs } = await supabase
    .from('parent_messages')
    .select('id, family_id, parent_email, subject, body, from_name, created_by_name, created_at, status, review_note')
    .in('status', ['pending_review', 'draft'])
    .limit(500);

  let rows = msgs ?? [];

  // Center scope for a center-bound owner (J/Christina are cross-center and skip
  // this). Fetch families broad + map in JS rather than .in() on many ids.
  if (!crossCenter && rows.length) {
    const { data: fams } = await supabase
      .from('families')
      .select('id, center_id')
      .limit(5000);
    const inMyCenter = new Set(
      (fams ?? []).filter((f) => f.center_id === myCenter).map((f) => f.id as string)
    );
    rows = rows.filter((r) => inMyCenter.has(r.family_id as string));
  }

  const items = rows
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .map((r) => ({
      id: r.id as string,
      type: 'parent_message' as const,
      family_id: r.family_id as string,
      to: r.parent_email as string,
      subject: (r.subject as string) || '',
      body: (r.body as string) || '',
      from_name: (r.created_by_name as string) || (r.from_name as string) || '',
      created_at: (r.created_at as string) || '',
      status: (r.status as string) || 'pending_review',
      review_note: (r.review_note as string | null) ?? null,
    }));

  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}
