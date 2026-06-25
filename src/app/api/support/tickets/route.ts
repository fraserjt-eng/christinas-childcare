export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireSession } from '@/lib/require-auth';
import { getServerSupabase } from '@/lib/supabase/server';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { reportError } from '@/lib/error-reporter';
import { audioObjectPath, imageObjectPath } from '@/lib/support/paths';
import { normalizeRole } from '@/lib/support/types';
import { sendNotificationEmail } from '@/lib/email';

const SUBMIT_RATE_LIMIT = { maxRequests: 10, windowMs: RATE_LIMITS.login.windowMs };
const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; //  8 MB (already compressed client-side)

// Any logged-in person (owner, staff, parent) can report a site issue.
export async function POST(req: NextRequest) {
  const rate = applyRateLimit(req, 'support-ticket', SUBMIT_RATE_LIMIT);
  if (!rate.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: rate.headers }
    );
  }

  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const subject = String(form.get('subject') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const pageUrl = String(form.get('page_url') ?? '').slice(0, 2000);
  const viewport = String(form.get('viewport') ?? '').slice(0, 50);
  const audio = form.get('audio');
  const image = form.get('image');
  const hasAudio = audio instanceof File && audio.size > 0;
  const hasImage = image instanceof File && image.size > 0;

  if (!subject) {
    return NextResponse.json({ error: 'A short summary is required.' }, { status: 400 });
  }
  if (!description && !hasAudio && !hasImage) {
    return NextResponse.json(
      { error: 'Add a description, a voice memo, or a photo.' },
      { status: 400 }
    );
  }
  if (hasAudio && (audio as File).size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'That voice memo is too large.' }, { status: 400 });
  }
  if (hasImage && (image as File).size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'That photo is too large.' }, { status: 400 });
  }

  const id = randomUUID();
  let audioPath: string | null = null;
  let imagePath: string | null = null;

  try {
    if (hasAudio) {
      const a = audio as File;
      const ext = a.type.includes('mp4') ? 'mp4' : a.type.includes('ogg') ? 'ogg' : 'webm';
      audioPath = audioObjectPath(id, ext);
      const buf = Buffer.from(await a.arrayBuffer());
      const up = await supabase.storage
        .from('ticket-media')
        .upload(audioPath, buf, { contentType: a.type || 'audio/webm', upsert: false });
      if (up.error) throw up.error;
    }
    if (hasImage) {
      imagePath = imageObjectPath(id, 'jpg');
      const buf = Buffer.from(await (image as File).arrayBuffer());
      const up = await supabase.storage
        .from('ticket-media')
        .upload(imagePath, buf, { contentType: (image as File).type || 'image/jpeg', upsert: false });
      if (up.error) throw up.error;
    }

    const { error: insErr } = await supabase.from('support_tickets').insert({
      id,
      subject: subject.slice(0, 200),
      description: description || null,
      audio_path: audioPath,
      image_path: imagePath,
      page_url: pageUrl || null,
      user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
      viewport: viewport || null,
      submitter_id: String(session.user.id),
      submitter_name: session.user.full_name ?? null,
      submitter_role: normalizeRole(session.user.role),
      submitter_email: session.user.email ?? null,
      status: 'new',
    });
    if (insErr) throw insErr;

    // Alert J by email so a new ticket reaches him without watching the queue.
    // Best-effort: sendNotificationEmail no-ops when RESEND_API_KEY is unset and
    // never throws, so it can't fail the ticket. Destination is overridable via
    // TICKET_ALERT_EMAIL.
    const alertTo = process.env.TICKET_ALERT_EMAIL || 'fraserjt@gmail.com';
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    await sendNotificationEmail(
      `New support ticket: ${subject.slice(0, 120)}`,
      `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.5;color:#222">
        <p><strong>${esc(subject)}</strong></p>
        ${description ? `<p>${esc(description).replace(/\n/g, '<br/>')}</p>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
        <p style="font-size:13px;color:#666">From ${esc(session.user.full_name || 'a user')} (${esc(session.user.email || 'no email')}, ${esc(normalizeRole(session.user.role))})${pageUrl ? ` &middot; on ${esc(pageUrl)}` : ''}</p>
      </div>`,
      alertTo
    );

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    // Best-effort cleanup of any uploaded media if the row insert failed.
    const toRemove = [audioPath, imagePath].filter(Boolean) as string[];
    if (toRemove.length) {
      await supabase.storage.from('ticket-media').remove(toRemove).catch(() => {});
    }
    reportError(err instanceof Error ? err : new Error('support ticket create failed'), {
      route: '/api/support/tickets',
    });
    return NextResponse.json({ error: 'Could not send your report.' }, { status: 500 });
  }
}
