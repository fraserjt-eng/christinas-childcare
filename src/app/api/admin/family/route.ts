export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';

// Admin-only: create a real family in the LIVE tables so it can clock in at the
// kiosk by PIN. After migration 017 anon cannot write families, so this must
// run server-side with the service role. The role of this account is always a
// family (kiosk PIN); a parent-portal password can be set later via a link.

interface ChildInput {
  name?: string;
  date_of_birth?: string;
  classroom?: string;
}

async function uniquePin(
  supabase: ReturnType<typeof getServerSupabase>
): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('families').select('pin');
  const used = new Set((data ?? []).map((r: { pin: string | null }) => r.pin));
  for (let i = 0; i < 200; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    if (!used.has(pin)) return pin;
  }
  return null;
}

// List live families for User Management (admin only). The list page reads
// browser storage for staff; families live in Supabase, so without this they
// never appear even though they work at the kiosk.
export async function GET() {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // Fetch broad, join in JS (PostgREST .in() can silently drop rows).
  const { data: fams } = await supabase
    .from('families')
    .select('id, email, status, pin, created_at')
    .limit(5000);
  const { data: parents } = await supabase
    .from('family_parents')
    .select('family_id, name, phone, is_primary')
    .limit(5000);
  const { data: kids } = await supabase
    .from('family_children')
    .select('family_id, name')
    .limit(5000);

  const families = (fams || [])
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map((f) => {
      const ps = (parents || []).filter((p) => p.family_id === f.id);
      const primary = ps.find((p) => p.is_primary) || ps[0];
      const childNames = (kids || [])
        .filter((k) => k.family_id === f.id)
        .map((k) => k.name);
      return {
        id: f.id,
        email: f.email,
        status: f.status,
        pin: f.pin,
        created_at: f.created_at,
        parentName: primary?.name || '',
        phone: primary?.phone || '',
        children: childNames,
      };
    });

  return NextResponse.json({ families });
}

export async function POST(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    email?: string;
    parentName?: string;
    parentPhone?: string;
    pin?: string;
    children?: ChildInput[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email || '').toLowerCase().trim();
  const parentName = (body.parentName || '').trim();
  const children = (body.children || []).filter((c) => (c.name || '').trim());

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid family email is required' }, { status: 400 });
  }
  if (!parentName) {
    return NextResponse.json({ error: 'A parent/guardian name is required' }, { status: 400 });
  }
  if (children.length === 0) {
    return NextResponse.json({ error: 'Add at least one child' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  // PIN: caller-provided 4 digits, else generate a unique one.
  let pin = (body.pin || '').trim();
  if (pin && !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }
  if (!pin) {
    const generated = await uniquePin(supabase);
    if (!generated) {
      return NextResponse.json({ error: 'Could not allocate a PIN' }, { status: 500 });
    }
    pin = generated;
  } else {
    const { data: clash } = await supabase
      .from('families')
      .select('id')
      .eq('pin', pin)
      .limit(1);
    if (clash && clash.length > 0) {
      return NextResponse.json({ error: 'That PIN is already in use' }, { status: 409 });
    }
  }

  // Existing family with this email?
  const { data: existing } = await supabase
    .from('families')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'A family with this email already exists' },
      { status: 409 }
    );
  }

  // Unusable password until the parent sets one via a link later. Kiosk uses PIN.
  const placeholderHash = createHash('sha256')
    .update('nologin:' + randomBytes(16).toString('hex'))
    .digest('hex');

  const { data: family, error: famErr } = await supabase
    .from('families')
    .insert({
      email,
      password_hash: placeholderHash,
      pin,
      status: 'active',
    })
    .select('id')
    .single();

  if (famErr || !family) {
    return NextResponse.json({ error: 'Could not create the family' }, { status: 500 });
  }

  await supabase.from('family_parents').insert({
    family_id: family.id,
    name: parentName,
    phone: body.parentPhone?.trim() || null,
    email,
    relationship: 'guardian',
    is_primary: true,
  });

  const childRows = children.map((c) => ({
    family_id: family.id,
    name: (c.name as string).trim(),
    date_of_birth: c.date_of_birth?.trim() || null,
    classroom: c.classroom?.trim() || null,
  }));
  const { error: kidErr } = await supabase
    .from('family_children')
    .insert(childRows);

  if (kidErr) {
    // Roll back the family so we do not leave a childless, un-clockable record.
    await supabase.from('families').delete().eq('id', family.id);
    return NextResponse.json({ error: 'Could not add the children' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    familyId: family.id,
    pin,
    childCount: childRows.length,
  });
}
