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
    .select('family_id, name, date_of_birth, classroom')
    .limit(5000);

  const families = (fams || [])
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map((f) => {
      const ps = (parents || []).filter((p) => p.family_id === f.id);
      const primary = ps.find((p) => p.is_primary) || ps[0];
      const children = (kids || [])
        .filter((k) => k.family_id === f.id)
        .map((k) => ({
          name: k.name,
          date_of_birth: k.date_of_birth || '',
          classroom: k.classroom || '',
        }));
      return {
        id: f.id,
        email: f.email,
        status: f.status,
        pin: f.pin,
        created_at: f.created_at,
        parentName: primary?.name || '',
        phone: primary?.phone || '',
        children,
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

// Permanently delete a family (their kiosk PIN stops working immediately):
// the family row plus its parents, children, attendance, and messages.
// ?id=<family uuid>
export async function DELETE(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = (new URL(request.url).searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data: fam } = await supabase
    .from('families')
    .select('id, email')
    .eq('id', id)
    .maybeSingle();
  if (!fam) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 });
  }

  // Clear attendance for this family's children before the cascade removes
  // the child rows (attendance has no FK, so it would orphan otherwise).
  const { data: kids } = await supabase
    .from('family_children')
    .select('id')
    .eq('family_id', id);
  const childIds = (kids || []).map((k) => k.id);
  if (childIds.length > 0) {
    await supabase.from('attendance').delete().in('child_id', childIds);
  }

  if (fam.email) {
    await supabase
      .from('parent_messages')
      .delete()
      .ilike('parent_email', fam.email);
  }

  // family_parents + family_children cascade on the families delete.
  const { error } = await supabase.from('families').delete().eq('id', id);
  if (error) {
    return NextResponse.json(
      { error: 'Could not delete the family' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

// Edit a family: parent name/phone/email, kiosk PIN, and the children list.
// Body: { id, email, parentName, parentPhone?, pin?, children:[{name,...}] }
export async function PUT(request: NextRequest) {
  const session = await requireSession('admin');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    id?: string;
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

  const id = (body.id || '').trim();
  const email = (body.email || '').toLowerCase().trim();
  const parentName = (body.parentName || '').trim();
  const children = (body.children || []).filter((c) => (c.name || '').trim());

  if (!id) {
    return NextResponse.json({ error: 'Family id is required' }, { status: 400 });
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid family email is required' }, { status: 400 });
  }
  if (!parentName) {
    return NextResponse.json({ error: 'A parent/guardian name is required' }, { status: 400 });
  }
  if (children.length === 0) {
    return NextResponse.json({ error: 'Add at least one child' }, { status: 400 });
  }

  const pin = (body.pin || '').trim();
  if (pin && !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  const { data: fam } = await supabase
    .from('families')
    .select('id, pin')
    .eq('id', id)
    .maybeSingle();
  if (!fam) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 });
  }

  // Email must stay unique across other families.
  const { data: emailClash } = await supabase
    .from('families')
    .select('id')
    .ilike('email', email)
    .neq('id', id)
    .maybeSingle();
  if (emailClash) {
    return NextResponse.json(
      { error: 'Another family already uses this email' },
      { status: 409 }
    );
  }

  const newPin = pin || fam.pin;
  if (pin && pin !== fam.pin) {
    const { data: pinClash } = await supabase
      .from('families')
      .select('id')
      .eq('pin', pin)
      .neq('id', id)
      .limit(1)
      .maybeSingle();
    if (pinClash) {
      return NextResponse.json(
        { error: 'That PIN is already in use' },
        { status: 409 }
      );
    }
  }

  const { error: upErr } = await supabase
    .from('families')
    .update({ email, pin: newPin })
    .eq('id', id);
  if (upErr) {
    return NextResponse.json({ error: 'Could not update the family' }, { status: 500 });
  }

  // Replace parents + children with the submitted set.
  await supabase.from('family_parents').delete().eq('family_id', id);
  await supabase.from('family_parents').insert({
    family_id: id,
    name: parentName,
    phone: body.parentPhone?.trim() || null,
    email,
    relationship: 'guardian',
    is_primary: true,
  });

  await supabase.from('family_children').delete().eq('family_id', id);
  const { error: kidErr } = await supabase.from('family_children').insert(
    children.map((c) => ({
      family_id: id,
      name: (c.name as string).trim(),
      date_of_birth: c.date_of_birth?.trim() || null,
      classroom: c.classroom?.trim() || null,
    }))
  );
  if (kidErr) {
    return NextResponse.json({ error: 'Could not update the children' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pin: newPin, childCount: children.length });
}
