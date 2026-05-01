// Pulls recent center activity (events, milestones, photos, lessons,
// enrollment changes) into a compact summary the AI generator can ground a
// newsletter draft on. Without this, AI newsletters are generic filler.
//
// Returns plain text blocks designed for prompt context, not for direct
// rendering. Each section is capped so the prompt stays under ~2000 tokens.

import { getServerSupabase } from '@/lib/supabase/server';

export interface CenterActivitySnapshot {
  windowDays: number;
  events: string[];
  milestones: string[];
  lessons: string[];
  photoCount: number;
  enrollmentDelta: number;
  inquiryCount: number;
  asPromptText: string;
}

const MAX_PER_SECTION = 8;

function truncate(s: string, max = 140): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

export async function getCenterActivitySnapshot(
  windowDays = 14
): Promise<CenterActivitySnapshot> {
  const empty: CenterActivitySnapshot = {
    windowDays,
    events: [],
    milestones: [],
    lessons: [],
    photoCount: 0,
    enrollmentDelta: 0,
    inquiryCount: 0,
    asPromptText: '',
  };

  const supabase = getServerSupabase();
  if (!supabase) return empty;

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  // Run all reads in parallel. PostgREST may not have all these tables
  // populated; missing data degrades to empty arrays gracefully.
  const [
    { data: announcements },
    { data: photos },
    { data: inquiries },
    { data: incidents },
    { data: comms },
  ] = await Promise.all([
    supabase
      .from('center_announcements')
      .select('title, body, audience, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(MAX_PER_SECTION),
    supabase
      .from('daily_photos')
      .select('id, caption, created_at')
      .gte('created_at', since)
      .limit(200),
    supabase
      .from('enrollment_inquiries')
      .select('id, status, family_name, created_at')
      .gte('created_at', since)
      .limit(50),
    supabase
      .from('incident_reports')
      .select('id, severity, summary, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(MAX_PER_SECTION),
    supabase
      .from('communications')
      .select('subject, body, audience, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(MAX_PER_SECTION),
  ]);

  // Convert each list into prompt-ready strings.
  const events = [
    ...(announcements ?? []).map(
      (a) => `${a.title || 'Announcement'}: ${truncate(a.body || '')}`
    ),
    ...(comms ?? [])
      .filter((c) => c.subject)
      .map((c) => `${c.subject}: ${truncate(c.body || '')}`),
  ].slice(0, MAX_PER_SECTION);

  const milestones = (incidents ?? [])
    .filter((i) => i.severity === 'positive' || i.severity === 'milestone')
    .map((i) => truncate(i.summary || ''))
    .slice(0, MAX_PER_SECTION);

  // Lessons: read recent lessons created in the window. Lessons live in
  // localStorage today; once they move to Supabase we can pull from there.
  const lessons: string[] = [];

  const photoCount = (photos ?? []).length;

  const newInquiries = (inquiries ?? []).filter((i) => i.status !== 'closed');
  const inquiryCount = newInquiries.length;

  const enrollmentDelta = newInquiries.length;

  // Build a single prompt-ready summary. The AI generator passes this in
  // verbatim so the model has real anchors instead of hallucinating.
  const lines: string[] = [];
  lines.push(`Activity window: last ${windowDays} days.`);
  if (photoCount > 0) {
    lines.push(`Photos uploaded: ${photoCount}.`);
  }
  if (inquiryCount > 0) {
    lines.push(`New family inquiries: ${inquiryCount}.`);
  }
  if (enrollmentDelta > 0) {
    lines.push(`Enrollment momentum: ${enrollmentDelta} new lead${enrollmentDelta === 1 ? '' : 's'}.`);
  }
  if (events.length > 0) {
    lines.push(`\nAnnouncements / events:\n${events.map((e) => `- ${e}`).join('\n')}`);
  }
  if (milestones.length > 0) {
    lines.push(`\nMilestones / positive incidents:\n${milestones.map((m) => `- ${m}`).join('\n')}`);
  }
  if (lessons.length > 0) {
    lines.push(`\nRecent lessons:\n${lessons.map((l) => `- ${l}`).join('\n')}`);
  }

  return {
    windowDays,
    events,
    milestones,
    lessons,
    photoCount,
    enrollmentDelta,
    inquiryCount,
    asPromptText: lines.join('\n'),
  };
}
