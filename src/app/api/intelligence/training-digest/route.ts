export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { runTrainingScan } from '@/lib/intelligence/training-scan';

// Admin-gated: this assembles staff names. Previously unauthenticated.
export async function GET() {
  const session = await requireSession('admin');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const items = await runTrainingScan();
    return NextResponse.json({ items, generatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Failed to generate training digest' }, { status: 500 });
  }
}
