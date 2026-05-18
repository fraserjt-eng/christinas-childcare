export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// The room-based per-child daily report for staff/owner: every child, grouped
// by classroom, with their real child_daily_entries for the chosen day, in one
// query (no per-child fan-out). Staff only (rank >= teacher); service role.

interface ReportEntry {
  id: string;
  type: string;
  detail: Record<string, unknown>;
  occurred_at: string;
}
interface ReportChild {
  id: string;
  name: string;
  classroom: string;
  entries: ReportEntry[];
}

export async function GET(request: NextRequest) {
  const session = await requireSession('teacher');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data: kids } = await supabase
    .from('family_children')
    .select('id, name, classroom')
    .limit(5000);

  const { data: entries } = await supabase
    .from('child_daily_entries')
    .select('id, child_id, type, detail, occurred_at, date')
    .eq('date', date)
    .order('occurred_at', { ascending: false })
    .limit(5000);

  // Group entries by child in JS (PostgREST .in can drop rows).
  const byChild = new Map<string, ReportEntry[]>();
  for (const e of entries ?? []) {
    const cid = e.child_id as string;
    const list = byChild.get(cid) || [];
    list.push({
      id: e.id as string,
      type: e.type as string,
      detail: (e.detail as Record<string, unknown>) || {},
      occurred_at: e.occurred_at as string,
    });
    byChild.set(cid, list);
  }

  const children: ReportChild[] = (kids ?? [])
    .map((c) => ({
      id: c.id as string,
      name: (c.name as string) || 'Child',
      classroom: (c.classroom as string | null) || 'Unassigned',
      entries: byChild.get(c.id as string) || [],
    }))
    .sort((a, b) => {
      if (a.classroom !== b.classroom)
        return a.classroom.localeCompare(b.classroom);
      return a.name.localeCompare(b.name);
    });

  const classrooms = Array.from(
    new Set(children.map((c) => c.classroom))
  ).sort();

  return NextResponse.json(
    { date, classrooms, children },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
