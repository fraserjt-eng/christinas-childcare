export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { runStaffingScan } from '@/lib/intelligence/staffing-scan';

// Admin-gated: this assembles staff names + enrollment-lead child/parent names.
// Previously unauthenticated (open to the internet); now requires an admin session.
export async function GET() {
  const session = await requireSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const alerts = await runStaffingScan();
    return NextResponse.json({ alerts, generatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Failed to generate staffing alerts' }, { status: 500 });
  }
}
