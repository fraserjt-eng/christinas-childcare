export const runtime = 'nodejs';

// Superadmin-only download of the Crystal kiosk rollout kit: a ZIP of the
// per-family flyers (PDF) plus the staff master PIN list (PDF). The kit is
// prepared offline (scripts/kiosk-rollout) and stored in a PRIVATE bucket; this
// route streams it behind the admin session. PII: it contains every family's
// kiosk PIN, so it is gated to superadmin and served via the service-role client
// only (never the anon key), with no caching. It is a dated snapshot: regenerate
// and re-upload with scripts/kiosk-rollout when the family list changes.

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

const BUCKET = 'admin-exports';
const OBJECT = 'kiosk-rollout/Crystal-Kiosk-Rollout-Kit.zip';
const FILENAME = 'Crystal-Kiosk-Rollout-Kit.zip';

export async function GET() {
  const session = await requireSession('admin');
  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Superadmin only' }, { status: 403 });
  }
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  const { data, error } = await supabase.storage.from(BUCKET).download(OBJECT);
  if (error || !data) {
    return NextResponse.json(
      { error: 'Kit not available yet. Generate and upload it with scripts/kiosk-rollout.' },
      { status: 404 }
    );
  }

  const buf = Buffer.from(await data.arrayBuffer());
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${FILENAME}"`,
      'Content-Length': String(buf.length),
      'Cache-Control': 'no-store',
    },
  });
}
