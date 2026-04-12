export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { runResearchPass } from '@/lib/intelligence/auto-research';
import { saveFinding } from '@/lib/intelligence/research-findings-storage';

export async function POST(request: Request): Promise<NextResponse> {
  // Admin-only: require auth_session cookie
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const questionIds = Array.isArray(body.questionIds) ? body.questionIds : undefined;

    const result = await runResearchPass(questionIds);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Research pass failed' },
        { status: 503 }
      );
    }

    // Persist findings
    for (const finding of result.findings) {
      await saveFinding(finding);
    }

    return NextResponse.json(
      {
        ok: true,
        count: result.findings.length,
        findings: result.findings,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('Research run error:', e);
    return NextResponse.json(
      { error: 'Research pass encountered an error' },
      { status: 500 }
    );
  }
}
