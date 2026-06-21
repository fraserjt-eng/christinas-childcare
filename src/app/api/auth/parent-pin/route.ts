export const runtime = 'nodejs';

// Parent kiosk PIN sign-in (v1 parent entry — no password / OAuth yet).
//
// A family enters its kiosk PIN (the same 4-digit PIN used at the check-in
// kiosk) for its center and gets a parent session for the family home page.
// The PIN is matched server-side, scoped to the chosen center (so PINs may
// repeat across centers); the role is always 'parent'. The session carries the
// family's EMAIL, which is how resolveSessionFamily() finds the family for
// /api/parent/me and the family view (works for kiosk-only roster stubs too,
// since each has a unique placeholder email).
//
// Eventually this becomes a real parent login + OAuth; the PIN is the low-
// friction v1 for captive families.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { mintSessionResponse } from '@/lib/mint-session';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Brute-force guard: 8 attempts / 15 min per IP (mirrors the kiosk lookup).
  const clientId = getClientIdentifier(request);
  const rate = checkRateLimit(`parent-pin:${clientId}`, { maxRequests: 8, windowMs: 15 * 60 * 1000 });
  if (!rate.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds ?? 900) } }
    );
  }

  let body: { pin?: string; centerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const pin = (body.pin || '').trim();
  const centerId = (body.centerId || '').trim();
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'Enter your 4-digit PIN.' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  // Match the family by PIN, then keep only this center's match (fetch broad +
  // filter in JS per the PostgREST .eq+filter drop gotcha). A center mismatch
  // never falls back to another center.
  const { data: fams } = await supabase
    .from('families')
    .select('id, email, pin, status, center_id')
    .eq('pin', pin)
    .eq('status', 'active')
    .limit(50);
  const family = (fams ?? []).find((f) => !centerId || f.center_id === centerId) || null;
  if (!family) {
    return NextResponse.json(
      { error: 'That PIN was not found at this center. Check the center, or see staff.' },
      { status: 401 }
    );
  }

  const { data: primary } = await supabase
    .from('family_parents')
    .select('name, is_primary')
    .eq('family_id', family.id)
    .order('is_primary', { ascending: false })
    .limit(1)
    .maybeSingle();

  return mintSessionResponse({
    id: `family-${family.id}`,
    email: (family.email as string) || `family-${family.id}`,
    full_name: (primary?.name as string) || 'Family',
    role: 'parent',
    center_id: (family.center_id as string | null) ?? null,
  });
}
