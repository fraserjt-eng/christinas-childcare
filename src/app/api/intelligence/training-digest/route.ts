import { NextResponse } from 'next/server';
import { runTrainingScan } from '@/lib/intelligence/training-scan';

export async function GET() {
  try {
    const items = await runTrainingScan();
    return NextResponse.json({ items, generatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Failed to generate training digest' }, { status: 500 });
  }
}
