export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { checkDailyQuota, getDailyCap, setDailyCap } from '@/lib/ai-usage-storage';

// GET: Return today's usage + configured cap
export async function GET(): Promise<NextResponse> {
  try {
    const [quota, cap] = await Promise.all([checkDailyQuota(), getDailyCap()]);
    return NextResponse.json(
      {
        usedToday: quota.used,
        cap,
        remaining: quota.remaining,
        overQuota: !quota.ok,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('AI usage GET error:', e);
    return NextResponse.json({ error: 'Failed to load usage' }, { status: 500 });
  }
}

// POST: Update the daily cap (admin only)
export async function POST(request: Request): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const cap = Number(body.cap);
    if (!Number.isFinite(cap) || cap < 1000) {
      return NextResponse.json(
        { error: 'Cap must be a number >= 1000' },
        { status: 400 }
      );
    }
    const ok = await setDailyCap(cap);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to save cap' }, { status: 500 });
    }
    return NextResponse.json({ success: true, cap });
  } catch (e) {
    console.error('AI usage POST error:', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
