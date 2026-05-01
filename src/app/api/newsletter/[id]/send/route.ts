export const runtime = 'nodejs';
export const maxDuration = 300; // give bulk sends up to 5 min on Vercel Pro

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getNewsletter } from '@/lib/newsletter-storage';
import { bulkSendNewsletter } from '@/lib/newsletter/bulk-send';

// POST /api/newsletter/[id]/send  — admin-triggered send-now.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  if (!session?.value) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const newsletter = await getNewsletter(id);
  if (!newsletter) {
    return NextResponse.json({ ok: false, error: 'Newsletter not found.' }, { status: 404 });
  }

  if (newsletter.status === 'sent') {
    return NextResponse.json(
      {
        ok: false,
        error: 'This newsletter was already sent. Duplicate sends are blocked to prevent spam complaints.',
      },
      { status: 409 }
    );
  }

  const result = await bulkSendNewsletter(newsletter);

  return NextResponse.json({
    ok: result.ok,
    recipientCount: result.recipientCount,
    successCount: result.successCount,
    failureCount: result.failureCount,
    messageIds: result.messageIds.length,
    errors: result.errors.slice(0, 5), // cap so the response stays small
  });
}
