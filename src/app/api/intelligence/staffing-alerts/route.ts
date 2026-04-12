import { NextResponse } from 'next/server';
import { runStaffingScan } from '@/lib/intelligence/staffing-scan';

export async function GET() {
  try {
    const alerts = await runStaffingScan();
    return NextResponse.json({ alerts, generatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Failed to generate staffing alerts' }, { status: 500 });
  }
}
