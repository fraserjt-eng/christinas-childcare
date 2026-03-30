// scripts/generate-timestamps.mjs
// Phase 2: Word-level timestamp generation
// Tries whisper-cpp for real alignment, falls back to even distribution across duration.
// Output format: { "words": [{ "word": "The", "start": 0.0, "end": 0.12 }, ...] }

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VOICE_DIR = '/tmp/christinas-voice';
const OUT_DIR = '/tmp/christinas-timestamps';
const WHISPER_MODEL = path.join(process.env.HOME, '.cache/whisper/ggml-base.en.bin');

// Narration text keyed by the filename stem produced by generate-voice.mjs.
// Format: admin-{index}-{slug}.mp3  and  avatar-{id}.mp3
const NARRATION_LOOKUP = {
  'admin-0-dashboard': "Christina's command center. The dashboard shows real-time alerts at the top, anything that needs attention right now. Below that, today's attendance snapshot, staff on duty, ratio status, and tasks completed. Quick action buttons change based on the time of day, showing the most relevant tools for morning, afternoon, or closing.",
  'admin-1-food-counts': "Food counts and CACFP tracking. Three quick-fill buttons at the top: copy yesterday, fill from enrollment, or everyone here. One click fills the entire grid. No more typing forty-eight numbers manually. The daily summary shows totals by meal type across all classrooms.",
  'admin-2-cacfp-compliance': "The compliance tab shows your on-time submission rate, revenue impact from missed counts, the sixteen-item CACFP checklist with auto-verification, and your audit readiness score from zero to one hundred percent. This is how Christina protects revenue.",
  'admin-3-attendance': "Attendance tracking. See who is checked in, who has not arrived yet, and who has already departed. Color-coded status for each child. The ratio monitor shows if every classroom has enough staff.",
  'admin-4-schedule-board': "The scheduling board. Drag preset shift blocks onto employee rows. Morning, full day, afternoon, opening, closing. Build the whole week by dragging instead of typing. Copy last week with one button. Switch between the board, weekly grid, hours summary, ratio compliance, labor cost, coverage requests, and the publish tab.",
  'admin-5-task-board': "The task board with multiple views. The list view shows all tasks with priority and status. The kanban view has three drag-and-drop columns. The timeline shows tasks on a visual schedule. Delegation tracking shows how much work Christina is doing versus what has been delegated to staff. Insights auto-generate observations about time allocation patterns.",
  'admin-6-cross-site': "Both centers at a glance. Crystal Center and Brooklyn Park, side by side. Each card shows kids present, staff on duty, staff-to-child ratio with compliance color, open incidents, and pending messages. Green means nominal. Yellow means attention needed. Red means act now. The weekly trends tab shows patterns over time.",
  'admin-7-newsletter': "The newsletter builder. Works like Mailchimp but built into the platform. Add sections for photos, events, classroom spotlights, announcements. Use the rich text editor for formatting, images, and links. Drag sections to reorder. Toggle the preview to see what parents receive. Send now, schedule for later, or download as a PDF. Analytics show which families engaged.",
  'admin-8-photo-review': "Photo review. Staff upload photos throughout the day. Christina reviews them here before parents can see them. Approve or reject individually, or use bulk actions to approve the whole batch at once. Stats show how many are pending, approved, and rejected.",
  'admin-9-knowledge-base': "The staff knowledge base. When people leave, their knowledge usually leaves with them. Not anymore. Entries are organized by category: procedures, protocols, routines, templates, checklists, vendor contacts, equipment instructions. Rich text editing with version history. Tag entries as required reading for new hires.",
  'admin-10-staff-development': "Staff development and certification tracking. The grid shows every employee's CPR, first aid, food handler, and state license status. Green is current, yellow is expiring soon, red is expired. Training log tracks hours per employee against the annual state requirement. Development plans track professional goals.",
  'admin-11-onboarding': "Digital onboarding for new hires. Build templates with four phases: pre-start, day one, week one, and month one. Each task has a responsible person, due date offset, and verification method. Assign a template to a new hire and track their progress. Ahead of schedule, on track, behind, or blocked.",
  'admin-12-enrollment-funnel': "The enrollment funnel. Every prospective family tracked from first inquiry to active enrollment. Seven stages with conversion rates between each. The pipeline board shows each lead as a card. Yellow borders flag stale leads with no activity in seven or more days. Lead source analytics show which sources actually convert.",
  'admin-13-authorization-tracking': "State authorization tracking. Every enrolled child's authorization status: active, expiring soon, expired, or pending. Sorted by urgency so the most critical expirations are at the top. Renewal tracking shows processing times and revenue at risk from expired authorizations.",
  'admin-14-tour-manager': "Tour management. Schedule tours with parent contact info, date, time, and center. During the tour, follow the eight-step checklist on your phone. After the tour, send a follow-up with one click. Track the conversion from tour completed to application received.",
  'admin-15-revenue-forecast': "Revenue forecasting and scenario modeling. Financial health shows revenue per child, operating margin, and break-even enrollment. The cash flow chart shows six months of revenue versus expenses. Scenario modeling lets you slide enrollment and rates up or down to see the impact in real time. Save and compare up to three scenarios.",
  'admin-16-incident-log': "Incident reporting and compliance. The structured form requires all critical fields including parent notification. The timeline shows every incident with filters by type, severity, and notification status. A red flag appears if a parent was not notified within twenty-four hours. Analytics reveal patterns across classrooms and time of day.",
  'admin-17-meeting-efficiency': "Meeting efficiency tools. Build agendas with timed items. The calculator warns if you have overbooked the time slot. During meetings, a live timer counts down each agenda item. Green when under time, yellow at seventy-five percent, red when over. Capture decisions and action items in real time. Track effectiveness across meetings.",
  'admin-18-supply-management': "Supply and inventory management. Every item tracked with color-coded stock levels. Green is good, yellow is low, red is critical. Staff submit restock requests from their phone. The reorder generator auto-lists everything below threshold. Monthly spend charts show costs by category over time.",
  'admin-19-staff-chat': "Staff messaging. Channels for team communication, direct messages, pinned announcements, and read receipts. This replaces scattered text messages and keeps all staff communication in one professional platform.",
  'avatar-intro': "Welcome to the admin portal. This is your command center for managing every aspect of Christina's Child Care Center.",
  'avatar-operations-transition': "Now let's look at the operations tools that keep your center running smoothly.",
  'avatar-communication-transition': "Next, we'll explore the communication and engagement tools.",
  'avatar-growth-transition': "Let's look at the tools that help grow your enrollment and revenue.",
  'avatar-outro': "That covers the admin portal. Every tool here is designed to save you time and keep your center running at its best.",
};

// ---------------------------------------------------------------------------
// getAudioDuration
// Returns duration in seconds using ffprobe. Throws if ffprobe is unavailable.
// ---------------------------------------------------------------------------
function getAudioDuration(filePath) {
  let output;
  try {
    output = execSync(
      `ffprobe -v quiet -print_format json -show_format "${filePath}"`,
      { encoding: 'utf-8' }
    );
  } catch (err) {
    throw new Error(`ffprobe failed for "${filePath}": ${err.message}`);
  }
  const parsed = JSON.parse(output);
  const duration = parseFloat(parsed?.format?.duration);
  if (isNaN(duration)) throw new Error(`Could not parse duration from ffprobe output for "${filePath}"`);
  return duration;
}

// ---------------------------------------------------------------------------
// estimateWordTimestamps
// Splits narration text into words and distributes them evenly across the
// audio duration. Returns an array of { word, start, end }.
// When no narration text is available, generates placeholder words based on
// the estimated word count (~2.5 words per second of natural speech).
// ---------------------------------------------------------------------------
function estimateWordTimestamps(text, durationSec) {
  let words;

  if (text && text.trim().length > 0) {
    words = text.split(/\s+/).filter(Boolean);
  } else {
    // No source text: generate placeholders at ~2.5 words per second
    const count = Math.max(1, Math.round(durationSec * 2.5));
    words = Array.from({ length: count }, (_, i) => `[word-${i + 1}]`);
  }

  const perWord = durationSec / words.length;
  let cursor = 0;

  return words.map(w => {
    const start = parseFloat(cursor.toFixed(3));
    const end = parseFloat((cursor + perWord).toFixed(3));
    cursor += perWord;
    return { word: w, start, end };
  });
}

// ---------------------------------------------------------------------------
// whisperTimestamps
// Attempts to run whisper-cpp for accurate word-level alignment.
// Returns an array of { word, start, end } or null if whisper is unavailable
// or produces no output.
// ---------------------------------------------------------------------------
function whisperTimestamps(audioPath) {
  if (!fs.existsSync(WHISPER_MODEL)) {
    console.warn(`  [whisper] Model not found at ${WHISPER_MODEL}, skipping`);
    return null;
  }

  // Check that whisper-cpp binary is on PATH
  try {
    execSync('which whisper-cpp', { stdio: 'ignore' });
  } catch {
    console.warn('  [whisper] whisper-cpp not found on PATH, skipping');
    return null;
  }

  try {
    const output = execSync(
      `whisper-cpp -m "${WHISPER_MODEL}" -f "${audioPath}" --output-json --word-timestamps`,
      { encoding: 'utf-8', timeout: 60000 }
    );

    const result = JSON.parse(output);
    const words = [];
    const segments = result.segments || result;

    for (const seg of segments) {
      const tokens = seg.tokens || seg.words || [];
      for (const tok of tokens) {
        const word = (tok.text || tok.word || '').trim();
        if (!word) continue;
        words.push({
          word,
          start: parseFloat((tok.start ?? tok.t0 ?? 0).toFixed(3)),
          end: parseFloat((tok.end ?? tok.t1 ?? 0).toFixed(3)),
        });
      }
    }

    if (words.length === 0) {
      console.warn('  [whisper] Ran successfully but extracted zero words');
      return null;
    }

    return words;
  } catch (err) {
    console.warn(`  [whisper] Failed: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// stemFromFilename
// Converts "admin-0-dashboard.mp3" into "admin-0-dashboard" for lookup.
// ---------------------------------------------------------------------------
function stemFromFilename(filename) {
  return filename.replace(/\.mp3$/, '');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
if (!fs.existsSync(VOICE_DIR)) {
  console.error(`Voice directory not found: ${VOICE_DIR}`);
  console.error('Run "node scripts/generate-voice.mjs" first to produce audio files.');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// Verify ffprobe is available before processing anything
try {
  execSync('which ffprobe', { stdio: 'ignore' });
} catch {
  console.error('ffprobe is not installed or not on PATH.');
  console.error('Install it with: brew install ffmpeg');
  process.exit(1);
}

const audioFiles = fs.readdirSync(VOICE_DIR)
  .filter(f => f.endsWith('.mp3'))
  .sort();

if (audioFiles.length === 0) {
  console.warn(`No .mp3 files found in ${VOICE_DIR}`);
  console.warn('Run "node scripts/generate-voice.mjs" first.');
  process.exit(0);
}

console.log(`Processing ${audioFiles.length} audio file(s)...\n`);

let cached = 0;
let whisperCount = 0;
let estimateCount = 0;
let errorCount = 0;

for (const file of audioFiles) {
  const audioPath = path.join(VOICE_DIR, file);
  const stem = stemFromFilename(file);
  const outPath = path.join(OUT_DIR, `${stem}.json`);

  if (fs.existsSync(outPath)) {
    console.log(`  [cached]   ${file}`);
    cached++;
    continue;
  }

  let duration;
  try {
    duration = getAudioDuration(audioPath);
  } catch (err) {
    console.error(`  [error]    ${file}: ${err.message}`);
    errorCount++;
    continue;
  }

  // Try whisper-cpp first for real word-level alignment
  const whisperWords = whisperTimestamps(audioPath);
  if (whisperWords) {
    console.log(`  [whisper]  ${file} (${whisperWords.length} words, ${duration.toFixed(1)}s)`);
    fs.writeFileSync(outPath, JSON.stringify({ words: whisperWords }, null, 2));
    whisperCount++;
    continue;
  }

  // Fallback: even distribution using narration text from the lookup table
  const narrationText = NARRATION_LOOKUP[stem] || null;
  if (!narrationText) {
    console.warn(`  [estimate] ${file}: no narration text in lookup, using placeholders`);
  }

  const estimatedWords = estimateWordTimestamps(narrationText, duration);
  const method = narrationText ? 'estimate' : 'placeholder';
  console.log(`  [${method}] ${file} (${estimatedWords.length} words, ${duration.toFixed(1)}s)`);
  fs.writeFileSync(outPath, JSON.stringify({ words: estimatedWords }, null, 2));
  estimateCount++;
}

console.log(`
Done.
  Cached:      ${cached}
  Whisper:     ${whisperCount}
  Estimated:   ${estimateCount}
  Errors:      ${errorCount}

Timestamps saved to: ${OUT_DIR}
`);
