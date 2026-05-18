export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { getServerSupabase } from '@/lib/supabase/server';
import { mintSessionResponse } from '@/lib/mint-session';

/**
 * Staff PIN sign-in, rebuilt securely.
 *
 * The old employee-login PIN tab read employees from localStorage and then
 * POSTed {email, role} to the open /api/auth/session endpoint. That trusted
 * the client for the role. This route verifies the PIN against the employees
 * table SERVER-SIDE (service role, bypasses RLS) and derives the role from
 * that record. The client never sends a role.
 */
export async function POST(request: NextRequest) {
  // Loose backstop only. A trusted on-site center mistypes PINs and the owner
  // tests repeatedly; the old 5/15min lock blocked legitimate use. This cap is
  // high enough that a person never hits it, while still stopping a runaway
  // script from enumerating every 4-digit PIN.
  const clientId = getClientIdentifier(request);
  const rateResult = checkRateLimit(`staff-pin:${clientId}`, {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateResult.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      {
        status: 429,
        headers: { 'Retry-After': rateResult.retryAfterSeconds?.toString() ?? '60' },
      }
    );
  }

  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const pin = (body.pin || '').trim();
  if (!/^\d{4,8}$/.test(pin)) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 });
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('id, first_name, last_name, email, role, employment_status')
    .eq('pin', pin)
    .eq('employment_status', 'active')
    .limit(1)
    .maybeSingle();

  if (!employee) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  const empRole = (employee.role as string)?.toLowerCase() || 'teacher';
  const role =
    empRole === 'admin' || empRole === 'owner' || empRole === 'director'
      ? 'admin'
      : 'teacher';

  return mintSessionResponse({
    id: employee.id,
    email: employee.email || `pin-${employee.id}`,
    full_name: `${employee.first_name} ${employee.last_name}`.trim(),
    role,
  });
}
