// scripts/generate-voice.mjs
// ElevenLabs TTS with edge-tts fallback for Christina's Child Care Center walkthrough videos.
// Usage: node scripts/generate-voice.mjs [admin|avatar|all]

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Default voice ID is Adam (pNInz6obpgDQGcFmaJgB). Will be swapped to Ava once voice is confirmed.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

// ---------------------------------------------------------------------------
// Narration content
// ---------------------------------------------------------------------------

const ADMIN_NARRATIONS = [
  {
    index: 0,
    slug: 'dashboard',
    text: "Christina's command center. The dashboard shows real-time alerts at the top, anything that needs attention right now. Below that, today's attendance snapshot, staff on duty, ratio status, and tasks completed. Quick action buttons change based on the time of day, showing the most relevant tools for morning, afternoon, or closing.",
  },
  {
    index: 1,
    slug: 'food-counts',
    text: "Food counts and CACFP tracking. Three quick-fill buttons at the top: copy yesterday, fill from enrollment, or everyone here. One click fills the entire grid. No more typing forty-eight numbers manually. The daily summary shows totals by meal type across all classrooms.",
  },
  {
    index: 2,
    slug: 'cacfp-compliance',
    text: "The compliance tab shows your on-time submission rate, revenue impact from missed counts, the sixteen-item CACFP checklist with auto-verification, and your audit readiness score from zero to one hundred percent. This is how Christina protects revenue.",
  },
  {
    index: 3,
    slug: 'attendance',
    text: "Attendance tracking. See who is checked in, who has not arrived yet, and who has already departed. Color-coded status for each child. The ratio monitor shows if every classroom has enough staff.",
  },
  {
    index: 4,
    slug: 'schedule-board',
    text: "The scheduling board. Drag preset shift blocks onto employee rows. Morning, full day, afternoon, opening, closing. Build the whole week by dragging instead of typing. Copy last week with one button. Switch between the board, weekly grid, hours summary, ratio compliance, labor cost, coverage requests, and the publish tab.",
  },
  {
    index: 5,
    slug: 'task-board',
    text: "The task board with multiple views. The list view shows all tasks with priority and status. The kanban view has three drag-and-drop columns. The timeline shows tasks on a visual schedule. Delegation tracking shows how much work Christina is doing versus what has been delegated to staff. Insights auto-generate observations about time allocation patterns.",
  },
  {
    index: 6,
    slug: 'cross-site',
    text: "Both centers at a glance. Crystal Center and Brooklyn Park, side by side. Each card shows kids present, staff on duty, staff-to-child ratio with compliance color, open incidents, and pending messages. Green means nominal. Yellow means attention needed. Red means act now. The weekly trends tab shows patterns over time.",
  },
  {
    index: 7,
    slug: 'newsletter',
    text: "The newsletter builder. Works like Mailchimp but built into the platform. Add sections for photos, events, classroom spotlights, announcements. Use the rich text editor for formatting, images, and links. Drag sections to reorder. Toggle the preview to see what parents receive. Send now, schedule for later, or download as a PDF. Analytics show which families engaged.",
  },
  {
    index: 8,
    slug: 'photo-review',
    text: "Photo review. Staff upload photos throughout the day. Christina reviews them here before parents can see them. Approve or reject individually, or use bulk actions to approve the whole batch at once. Stats show how many are pending, approved, and rejected.",
  },
  {
    index: 9,
    slug: 'knowledge-base',
    text: "The staff knowledge base. When people leave, their knowledge usually leaves with them. Not anymore. Entries are organized by category: procedures, protocols, routines, templates, checklists, vendor contacts, equipment instructions. Rich text editing with version history. Tag entries as required reading for new hires.",
  },
  {
    index: 10,
    slug: 'staff-development',
    text: "Staff development and certification tracking. The grid shows every employee's CPR, first aid, food handler, and state license status. Green is current, yellow is expiring soon, red is expired. Training log tracks hours per employee against the annual state requirement. Development plans track professional goals.",
  },
  {
    index: 11,
    slug: 'onboarding',
    text: "Digital onboarding for new hires. Build templates with four phases: pre-start, day one, week one, and month one. Each task has a responsible person, due date offset, and verification method. Assign a template to a new hire and track their progress. Ahead of schedule, on track, behind, or blocked.",
  },
  {
    index: 12,
    slug: 'enrollment-funnel',
    text: "The enrollment funnel. Every prospective family tracked from first inquiry to active enrollment. Seven stages with conversion rates between each. The pipeline board shows each lead as a card. Yellow borders flag stale leads with no activity in seven or more days. Lead source analytics show which sources actually convert.",
  },
  {
    index: 13,
    slug: 'authorization-tracking',
    text: "State authorization tracking. Every enrolled child's authorization status: active, expiring soon, expired, or pending. Sorted by urgency so the most critical expirations are at the top. Renewal tracking shows processing times and revenue at risk from expired authorizations.",
  },
  {
    index: 14,
    slug: 'tour-manager',
    text: "Tour management. Schedule tours with parent contact info, date, time, and center. During the tour, follow the eight-step checklist on your phone. After the tour, send a follow-up with one click. Track the conversion from tour completed to application received.",
  },
  {
    index: 15,
    slug: 'revenue-forecast',
    text: "Revenue forecasting and scenario modeling. Financial health shows revenue per child, operating margin, and break-even enrollment. The cash flow chart shows six months of revenue versus expenses. Scenario modeling lets you slide enrollment and rates up or down to see the impact in real time. Save and compare up to three scenarios.",
  },
  {
    index: 16,
    slug: 'incident-log',
    text: "Incident reporting and compliance. The structured form requires all critical fields including parent notification. The timeline shows every incident with filters by type, severity, and notification status. A red flag appears if a parent was not notified within twenty-four hours. Analytics reveal patterns across classrooms and time of day.",
  },
  {
    index: 17,
    slug: 'meeting-efficiency',
    text: "Meeting efficiency tools. Build agendas with timed items. The calculator warns if you have overbooked the time slot. During meetings, a live timer counts down each agenda item. Green when under time, yellow at seventy-five percent, red when over. Capture decisions and action items in real time. Track effectiveness across meetings.",
  },
  {
    index: 18,
    slug: 'supply-management',
    text: "Supply and inventory management. Every item tracked with color-coded stock levels. Green is good, yellow is low, red is critical. Staff submit restock requests from their phone. The reorder generator auto-lists everything below threshold. Monthly spend charts show costs by category over time.",
  },
  {
    index: 19,
    slug: 'staff-chat',
    text: "Staff messaging. Channels for team communication, direct messages, pinned announcements, and read receipts. This replaces scattered text messages and keeps all staff communication in one professional platform.",
  },
];

// Avatar transition narrations (used in Phase 3 with D-ID talking-head clips)
const AVATAR_NARRATIONS = [
  {
    id: 'intro',
    text: "Welcome to the admin portal. This is your command center for managing every aspect of Christina's Child Care Center.",
  },
  {
    id: 'operations-transition',
    text: "Now let's look at the operations tools that keep your center running smoothly.",
  },
  {
    id: 'communication-transition',
    text: "Next, we'll explore the communication and engagement tools.",
  },
  {
    id: 'growth-transition',
    text: "Let's look at the tools that help grow your enrollment and revenue.",
  },
  {
    id: 'outro',
    text: "That covers the admin portal. Every tool here is designed to save you time and keep your center running at its best.",
  },
];

// ---------------------------------------------------------------------------
// Generation functions
// ---------------------------------------------------------------------------

async function generateWithElevenLabs(text, outputPath) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

async function generateWithEdgeTTS(text, outputPath) {
  const ttsEnvBin = '/tmp/tts-env/bin/edge-tts';
  const edgeTts = fs.existsSync(ttsEnvBin) ? ttsEnvBin : 'edge-tts';

  // Escape single quotes in text so the shell argument stays intact.
  // We wrap the text in single quotes and escape any embedded single quotes as '\''
  const escapedText = text.replace(/'/g, "'\\''");

  execSync(
    `${edgeTts} --voice "en-US-AvaNeural" --text '${escapedText}' --write-media "${outputPath}"`,
    { stdio: 'inherit' }
  );

  return outputPath;
}

async function generateVoice(text, outputPath) {
  // Skip if a valid cached file already exists (>1 KB)
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1024) {
    console.log(`  [cached]     ${path.basename(outputPath)}`);
    return outputPath;
  }

  // Try ElevenLabs first; fall back to edge-tts
  if (ELEVENLABS_API_KEY) {
    try {
      console.log(`  [elevenlabs] ${path.basename(outputPath)}`);
      return await generateWithElevenLabs(text, outputPath);
    } catch (err) {
      console.warn(`  [fallback]   ElevenLabs failed (${err.message}), switching to edge-tts`);
    }
  }

  console.log(`  [edge-tts]   ${path.basename(outputPath)}`);
  return await generateWithEdgeTTS(text, outputPath);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const section = process.argv[2] || 'all'; // 'admin' | 'avatar' | 'all'
const outDir = '/tmp/christinas-voice';
fs.mkdirSync(outDir, { recursive: true });

if (!['admin', 'avatar', 'all'].includes(section)) {
  console.error(`Unknown section "${section}". Use: admin, avatar, or all`);
  process.exit(1);
}

if (section === 'admin' || section === 'all') {
  console.log(`\nGenerating admin narrations (${ADMIN_NARRATIONS.length} pages)...\n`);
  for (const n of ADMIN_NARRATIONS) {
    const outPath = path.join(outDir, `admin-${n.index}-${n.slug}.mp3`);
    await generateVoice(n.text, outPath);
  }
}

if (section === 'avatar' || section === 'all') {
  console.log(`\nGenerating avatar narrations (${AVATAR_NARRATIONS.length} clips)...\n`);
  for (const n of AVATAR_NARRATIONS) {
    const outPath = path.join(outDir, `avatar-${n.id}.mp3`);
    await generateVoice(n.text, outPath);
  }
}

console.log('\nVoice generation complete.');
console.log(`Output directory: ${outDir}`);
console.log(`Files: ${fs.readdirSync(outDir).filter(f => f.endsWith('.mp3')).length} MP3s`);
