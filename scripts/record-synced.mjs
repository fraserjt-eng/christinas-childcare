/**
 * Record site walkthrough with synced voiceover.
 * V2: All pages, login handling, slower pacing, deeper scrolling.
 *
 * Usage: node scripts/record-synced.mjs [section]
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(__dirname, '..');
const OUT = path.join(PROJECT, 'public', 'videos', 'walkthroughs');
const AUDIO_OUT = path.join(PROJECT, 'public', 'audio', 'segments');
const SITE = 'https://christinas-childcare.vercel.app';
const TTS_URL = 'http://localhost:8880/v1/audio/speech';
const EXTRA_PADDING = 4000; // 4 extra seconds per page beyond narration

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(AUDIO_OUT, { recursive: true });

const wait = (ms) => new Promise(r => setTimeout(r, ms));

function getAudioDuration(filePath) {
  try {
    return parseFloat(execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: 'utf8' }
    ).trim());
  } catch { return 8; }
}

async function generateVoiceover(text, filename) {
  const filePath = path.join(AUDIO_OUT, filename);
  // Skip if already exists (cache)
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    const duration = getAudioDuration(filePath);
    console.log(`    Cached: ${filename} (${duration.toFixed(1)}s)`);
    return { filePath, duration };
  }
  const response = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'kokoro', input: text, voice: 'af_heart' }),
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  const duration = getAudioDuration(filePath);
  console.log(`    Audio: ${filename} (${duration.toFixed(1)}s)`);
  return { filePath, duration };
}

// Generate silence audio of a specific duration for padding
function generateSilence(durationSec, filePath) {
  execSync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${durationSec} -c:a libmp3lame "${filePath}"`, { stdio: 'pipe' });
}

// ─── EMPLOYEE PAGES (comprehensive) ─────────────────────────────────────

const EMPLOYEE_PAGES = [
  {
    url: `${SITE}/employee-login`,
    label: 'Employee Login',
    narration: "This is the employee login. Staff enter a four-digit PIN to get in. No email address, no password to remember. It works like clocking in at a register. Let me log in now.",
    scroll: false,
    action: async (page) => {
      // Type PIN 1234 to log in as Ophelia
      await wait(2000);
      try {
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await btn.textContent();
          if (text?.trim() === '1') { await btn.click(); await wait(300); }
        }
        for (const btn of buttons) {
          const text = await btn.textContent();
          if (text?.trim() === '2') { await btn.click(); await wait(300); }
        }
        for (const btn of buttons) {
          const text = await btn.textContent();
          if (text?.trim() === '3') { await btn.click(); await wait(300); }
        }
        for (const btn of buttons) {
          const text = await btn.textContent();
          if (text?.trim() === '4') { await btn.click(); await wait(300); }
        }
        await wait(3000); // Wait for login to process
      } catch { console.log('    (PIN entry failed, continuing)'); }
    },
  },
  {
    url: `${SITE}/employee`,
    label: 'Employee Home',
    narration: "Welcome to the employee home screen. Six quick-action tiles at the top: clock in, meal count, photos, chat, schedule, and training. Below that you can see today's task checklist, your weekly hours, and quick links to time off, pay stubs, and your profile.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/meal-count`,
    label: 'Meal Count',
    narration: "The meal count page. This is the feature that saves Christina the most time every day. Pick your classroom from the list. The count is pre-filled from yesterday. Tap plus or minus to adjust. Hit submit. Fifteen seconds, and Christina sees it on her dashboard instantly. Green checkmarks show which classrooms have already reported.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/photos`,
    label: 'Upload Photos',
    narration: "Upload daily photos from your classroom. Select up to five photos from your camera or gallery. Tag the activity type, whether that is art, outdoor play, circle time, or meals. Pick your classroom, add a caption, and submit. Christina reviews and approves them before parents can see them in their photo gallery.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/nap-tasks`,
    label: 'Nap Time Tasks',
    narration: "Nap time tasks. Between twelve thirty and two thirty, this page shows what you can get done while kids sleep. Tasks are sorted by quickest first. Tap start when you begin, done when you finish. The progress bar tracks how much of your ninety-minute window you have used.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/tasks`,
    label: 'My Tasks',
    narration: "Your full task list. Daily routines, one-time items, and recurring tasks. Check them off as you complete them. Each task shows priority, estimated time, and who assigned it. The task board gives you a clear view of what needs to happen today.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/knowledge`,
    label: 'Knowledge Base',
    narration: "The knowledge base. This is the center's wiki. How to handle the morning opening, fire drill steps, how to mix formula, where the first aid kit is. If you know something that is not written down yet, tap share what you know to submit it for Christina to review and publish.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/development`,
    label: 'My Development',
    narration: "Your professional development page. See your certifications with color-coded status. Green means current, yellow means expiring soon, red means expired. Track your annual training hours against the state requirement. And view your professional development goals set during reviews.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/supplies`,
    label: 'Request Supplies',
    narration: "Need supplies? Skip the sticky note. Fill out what you need, pick your classroom, and set the urgency. Need it today, this week, or just a routine restock. Christina gets the request immediately and can approve it from her dashboard.",
    scroll: false,
  },
  {
    url: `${SITE}/employee/schedule`,
    label: 'My Schedule',
    narration: "Your shifts for the week. Navigate between weeks to plan ahead. Each day shows your start time, end time, and classroom assignment. Need a change? Request it right here and Christina will review it.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/pay-stubs`,
    label: 'Pay Stubs',
    narration: "Pay stubs and earnings history. See your hours worked, hourly rate, gross pay, and deductions for each pay period.",
    scroll: false,
  },
  {
    url: `${SITE}/employee/training`,
    label: 'Training',
    narration: "Required training modules. Watch the video, read the material, and mark it as complete. The system tracks what you have finished and what is still due so nothing falls through the cracks.",
    scroll: true,
  },
];

// ─── ADMIN PAGES (comprehensive) ────────────────────────────────────────

const ADMIN_PAGES = [
  {
    url: `${SITE}/admin`,
    label: 'Admin Dashboard',
    narration: "Christina's command center. The dashboard shows real-time alerts at the top, anything that needs attention right now. Below that, today's attendance snapshot, staff on duty, ratio status, and tasks completed. Quick action buttons change based on the time of day, showing the most relevant tools for morning, afternoon, or closing.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/food-counts`,
    label: 'Food Counts',
    narration: "Food counts and CACFP tracking. Three quick-fill buttons at the top: copy yesterday, fill from enrollment, or everyone here. One click fills the entire grid. No more typing forty-eight numbers manually. The daily summary shows totals by meal type across all classrooms.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/food-counts`,
    label: 'CACFP Compliance',
    narration: "The compliance tab shows your on-time submission rate, revenue impact from missed counts, the sixteen-item CACFP checklist with auto-verification, and your audit readiness score from zero to one hundred percent. This is how Christina protects revenue.",
    scroll: true,
    click: '[value="compliance"]',
  },
  {
    url: `${SITE}/admin/attendance`,
    label: 'Attendance',
    narration: "Attendance tracking. See who is checked in, who has not arrived yet, and who has already departed. Color-coded status for each child. The ratio monitor shows if every classroom has enough staff.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/scheduling`,
    label: 'Schedule Board',
    narration: "The scheduling board. Drag preset shift blocks onto employee rows. Morning, full day, afternoon, opening, closing. Build the whole week by dragging instead of typing. Copy last week with one button. Switch between the board, weekly grid, hours summary, ratio compliance, labor cost, coverage requests, and the publish tab.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/tasks`,
    label: 'Task Board',
    narration: "The task board with multiple views. The list view shows all tasks with priority and status. The kanban view has three drag-and-drop columns. The timeline shows tasks on a visual schedule. Delegation tracking shows how much work Christina is doing versus what has been delegated to staff. Insights auto-generate observations about time allocation patterns.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/operations`,
    label: 'Cross-Site Operations',
    narration: "Both centers at a glance. Crystal Center and Brooklyn Park, side by side. Each card shows kids present, staff on duty, staff-to-child ratio with compliance color, open incidents, and pending messages. Green means nominal. Yellow means attention needed. Red means act now. The weekly trends tab shows patterns over time.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/communications`,
    label: 'Newsletter Builder',
    narration: "The newsletter builder. Works like Mailchimp but built into the platform. Add sections for photos, events, classroom spotlights, announcements. Use the rich text editor for formatting, images, and links. Drag sections to reorder. Toggle the preview to see what parents receive. Send now, schedule for later, or download as a PDF. Analytics show which families engaged.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/communications/photos`,
    label: 'Photo Review',
    narration: "Photo review. Staff upload photos throughout the day. Christina reviews them here before parents can see them. Approve or reject individually, or use bulk actions to approve the whole batch at once. Stats show how many are pending, approved, and rejected.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/staff/knowledge-base`,
    label: 'Knowledge Base',
    narration: "The staff knowledge base. When people leave, their knowledge usually leaves with them. Not anymore. Entries are organized by category: procedures, protocols, routines, templates, checklists, vendor contacts, equipment instructions. Rich text editing with version history. Tag entries as required reading for new hires.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/staff/development`,
    label: 'Staff Development',
    narration: "Staff development and certification tracking. The grid shows every employee's CPR, first aid, food handler, and state license status. Green is current, yellow is expiring soon, red is expired. Training log tracks hours per employee against the annual state requirement. Development plans track professional goals.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/hr/onboarding`,
    label: 'Onboarding',
    narration: "Digital onboarding for new hires. Build templates with four phases: pre-start, day one, week one, and month one. Each task has a responsible person, due date offset, and verification method. Assign a template to a new hire and track their progress. Ahead of schedule, on track, behind, or blocked.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/pipeline/enrollment`,
    label: 'Enrollment Funnel',
    narration: "The enrollment funnel. Every prospective family tracked from first inquiry to active enrollment. Seven stages with conversion rates between each. The pipeline board shows each lead as a card. Yellow borders flag stale leads with no activity in seven or more days. Lead source analytics show which sources actually convert.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/pipeline/authorizations`,
    label: 'Authorization Tracking',
    narration: "State authorization tracking. Every enrolled child's authorization status: active, expiring soon, expired, or pending. Sorted by urgency so the most critical expirations are at the top. Renewal tracking shows processing times and revenue at risk from expired authorizations.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/pipeline/tours`,
    label: 'Tour Manager',
    narration: "Tour management. Schedule tours with parent contact info, date, time, and center. During the tour, follow the eight-step checklist on your phone. After the tour, send a follow-up with one click. Track the conversion from tour completed to application received.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/financial/forecasting`,
    label: 'Revenue Forecast',
    narration: "Revenue forecasting and scenario modeling. Financial health shows revenue per child, operating margin, and break-even enrollment. The cash flow chart shows six months of revenue versus expenses. Scenario modeling lets you slide enrollment and rates up or down to see the impact in real time. Save and compare up to three scenarios.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/incidents/log`,
    label: 'Incident Log',
    narration: "Incident reporting and compliance. The structured form requires all critical fields including parent notification. The timeline shows every incident with filters by type, severity, and notification status. A red flag appears if a parent was not notified within twenty-four hours. Analytics reveal patterns across classrooms and time of day.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/meetings/efficiency`,
    label: 'Meeting Efficiency',
    narration: "Meeting efficiency tools. Build agendas with timed items. The calculator warns if you have overbooked the time slot. During meetings, a live timer counts down each agenda item. Green when under time, yellow at seventy-five percent, red when over. Capture decisions and action items in real time. Track effectiveness across meetings.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/supplies`,
    label: 'Supply Management',
    narration: "Supply and inventory management. Every item tracked with color-coded stock levels. Green is good, yellow is low, red is critical. Staff submit restock requests from their phone. The reorder generator auto-lists everything below threshold. Monthly spend charts show costs by category over time.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/messaging`,
    label: 'Staff Chat',
    narration: "Staff messaging. Channels for team communication, direct messages, pinned announcements, and read receipts. This replaces scattered text messages and keeps all staff communication in one professional platform.",
    scroll: true,
  },
];

// ─── PUBLIC PAGES ────────────────────────────────────────────────────────

const PUBLIC_PAGES = [
  {
    url: `${SITE}/`,
    label: 'Home Page',
    narration: "Welcome to Christina's Child Care Center. The home page is the first thing families see. It showcases the programs, introduces the staff, shares parent testimonials, and highlights what makes the center special. The schedule a tour button is prominently placed to convert visitors into prospective families.",
    scroll: true,
  },
  {
    url: `${SITE}/about`,
    label: 'About',
    narration: "The about page tells Christina's story. Her philosophy, the center's history, and why families choose this center over others. This is the trust-building page.",
    scroll: true,
  },
  {
    url: `${SITE}/programs`,
    label: 'Programs',
    narration: "Programs broken down by age group. Infants, toddlers, preschool, and school age. Each section shows the curriculum approach, daily schedule, staff-to-child ratios, and what a typical day looks like. Parents can see exactly what their child will experience.",
    scroll: true,
  },
  {
    url: `${SITE}/gallery`,
    label: 'Gallery',
    narration: "The photo gallery. Real images from the classrooms showing art projects, outdoor play, group activities, and special events. This gives prospective families a window into daily life at the center.",
    scroll: true,
  },
  {
    url: `${SITE}/faq`,
    label: 'FAQ',
    narration: "Frequently asked questions. Hours, rates, what to bring on the first day, sick policies, food allergies, transportation, and more. The answers families need before they schedule a tour.",
    scroll: true,
  },
  {
    url: `${SITE}/schedule-tour`,
    label: 'Schedule a Tour',
    narration: "The tour scheduling page. Families fill in their name, phone number, email, and pick a date and time. Christina gets notified immediately. This is how the enrollment journey begins.",
    scroll: false,
  },
  {
    url: `${SITE}/guide`,
    label: 'Feature Guide',
    narration: "The interactive feature guide. Every tool in the platform, organized by role. Parents, staff, and admin each see the features that matter to them. Each feature card explains why it exists, how it helps, and has a take the tour button for a step-by-step walkthrough. Scroll down to watch video walkthroughs right here.",
    scroll: true,
  },
];

// ─── Recording engine ────────────────────────────────────────────────────

async function recordSyncedWalkthrough(sectionName, pages) {
  console.log(`\n=== ${sectionName} Walkthrough (${pages.length} pages) ===`);

  // Step 1: Generate all voiceovers
  console.log('  Step 1: Generating voiceovers...');
  const segments = [];
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const filename = `${sectionName}-${i}-${p.label.toLowerCase().replace(/\s+/g, '-')}.mp3`;
    const { filePath, duration } = await generateVoiceover(p.narration, filename);
    segments.push({ ...p, audioPath: filePath, audioDuration: duration });
  }

  // Generate silence padding file (4 seconds)
  const silenceFile = path.join(AUDIO_OUT, `${sectionName}-silence.mp3`);
  generateSilence(EXTRA_PADDING / 1000, silenceFile);

  // Step 2: Record browser with narration duration + padding per page
  console.log('  Step 2: Recording browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();

  for (const seg of segments) {
    const totalTime = (seg.audioDuration * 1000) + EXTRA_PADDING;
    console.log(`    ${seg.label} (${(totalTime / 1000).toFixed(1)}s total)`);

    try {
      await page.goto(seg.url, { waitUntil: 'networkidle', timeout: 20000 });
    } catch {
      // Auth redirects, timeouts — continue
    }

    await wait(1500); // Let page render

    // Run custom action (like PIN login)
    if (seg.action) {
      await seg.action(page);
    }

    // Click specific element if specified
    if (seg.click) {
      try {
        await page.click(seg.click, { timeout: 3000 });
        await wait(2000);
      } catch { /* not found */ }
    }

    // Scroll slowly through the page
    if (seg.scroll) {
      const scrollChunk = totalTime / 5;
      await wait(scrollChunk); // view top
      await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
      await wait(scrollChunk);
      await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }));
      await wait(scrollChunk);
      await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'smooth' }));
      await wait(scrollChunk);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await wait(scrollChunk - 1500);
    } else {
      await wait(totalTime - 1500);
    }
  }

  await context.close();
  await browser.close();

  // Step 3: Find and convert video
  console.log('  Step 3: Converting to MP4...');
  const videos = fs.readdirSync(OUT)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(OUT, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (videos.length === 0) { console.log('  ERROR: No video found'); return; }

  const rawVideo = path.join(OUT, videos[0].name);
  const mp4Video = path.join(OUT, `${sectionName}-walkthrough.mp4`);
  execSync(`ffmpeg -y -i "${rawVideo}" -c:v libx264 -crf 20 -preset fast "${mp4Video}"`, { stdio: 'pipe' });
  fs.unlinkSync(rawVideo);

  // Step 4: Build audio track (narration + silence padding between pages)
  console.log('  Step 4: Building audio track...');
  const fullAudio = path.join(AUDIO_OUT, `${sectionName}-full.mp3`);
  const audioInputs = [];
  for (const seg of segments) {
    audioInputs.push(`-i "${seg.audioPath}"`);
    audioInputs.push(`-i "${silenceFile}"`);
  }
  const n = segments.length * 2;
  const filterParts = Array.from({ length: n }, (_, i) => `[${i}:a]`).join('');
  execSync(`ffmpeg -y ${audioInputs.join(' ')} -filter_complex "${filterParts}concat=n=${n}:v=0:a=1[out]" -map "[out]" "${fullAudio}"`, { stdio: 'pipe' });

  // Step 5: Merge video + audio
  console.log('  Step 5: Merging final video...');
  const finalVideo = path.join(OUT, `${sectionName}-final.mp4`);
  execSync(`ffmpeg -y -i "${mp4Video}" -i "${fullAudio}" -c:v copy -c:a aac -shortest "${finalVideo}"`, { stdio: 'pipe' });

  const size = (fs.statSync(finalVideo).size / 1024 / 1024).toFixed(1);
  console.log(`  DONE: ${finalVideo} (${size} MB)`);
}

// ─── Main ────────────────────────────────────────────────────────────────

const section = process.argv[2] || 'all';
console.log(`Recording: ${section}`);

if (section === 'all' || section === 'admin') await recordSyncedWalkthrough('admin', ADMIN_PAGES);
if (section === 'all' || section === 'employee') await recordSyncedWalkthrough('employee', EMPLOYEE_PAGES);
if (section === 'all' || section === 'public') await recordSyncedWalkthrough('public', PUBLIC_PAGES);

console.log('\n=== Complete ===');
