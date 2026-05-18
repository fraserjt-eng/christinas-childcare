export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { resolveSessionFamily } from '@/lib/parent-server';

// The signed-in parent's OWN children, from the verified session email.
// Never accepts a family/child id from the client.
export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const family = await resolveSessionFamily(session);
  return NextResponse.json(
    { children: family?.children ?? [] },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
