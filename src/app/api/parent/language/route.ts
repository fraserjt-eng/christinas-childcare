export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { resolveSessionFamily } from '@/lib/parent-server';

// Persist the signed-in family's UI language choice to families.preferred_language.
// The cookie already drives the interface; this remembers the choice for return
// visits and lets future automated emails go out in the family's language.
// Mirrors the auth + family-resolution pattern in /api/parent/me.
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { language?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const language = (body.language || '').toLowerCase().trim();
  if (language !== 'en' && language !== 'es') {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }

  const fam = await resolveSessionFamily(session);
  if (!fam) {
    // Signed in but not a parent/family (e.g. staff). Nothing to persist; the
    // cookie still carries their UI choice.
    return NextResponse.json({ ok: true, persisted: false });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { error } = await supabase
    .from('families')
    .update({ preferred_language: language })
    .eq('id', fam.family_id);

  if (error) {
    return NextResponse.json({ error: 'Could not save language' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true, language });
}
