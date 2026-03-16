/**
 * Record site walkthrough with synced voiceover.
 *
 * Strategy: Generate one voiceover per page FIRST, measure its duration,
 * then record the browser staying on that page for exactly that duration.
 * This guarantees voice and video are perfectly synced.
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

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(AUDIO_OUT, { recursive: true });

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Get audio duration in seconds using ffprobe
function getAudioDuration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: 'utf8' }
    ).trim();
    return parseFloat(result);
  } catch {
    return 5; // fallback
  }
}

// Generate TTS audio and return duration
async function generateVoiceover(text, filename) {
  const filePath = path.join(AUDIO_OUT, filename);

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

// ─── Page definitions with narration scripts ─────────────────────────────

const ADMIN_PAGES = [
  {
    url: `${SITE}/admin`,
    label: 'Admin Dashboard',
    narration: "This is Christina's command center. The dashboard shows real-time alerts, today's attendance snapshot, and quick actions that change based on the time of day. Everything that needs attention is right here.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/food-counts`,
    label: 'Food Counts',
    narration: "Food counts with three quick-fill buttons. Copy yesterday, fill from enrollment, or everyone here. One click fills the entire grid instead of typing forty-eight numbers. The compliance tab tracks CACFP submissions and audit readiness.",
    scroll: true,
    click: '[value="compliance"]',
    clickDelay: 3000,
  },
  {
    url: `${SITE}/admin/scheduling`,
    label: 'Staff Scheduling',
    narration: "The scheduling board. Drag preset shift blocks onto employee rows. Morning, full day, afternoon. Build next week's schedule in five minutes. The publish tab sends it to all staff with one click.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/tasks`,
    label: 'Task Board',
    narration: "The task board with kanban, timeline, delegation, and insight views. Drag cards between columns. See where Christina's time goes and which tasks could be delegated to staff.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/operations`,
    label: 'Cross-Site Operations',
    narration: "Both centers side by side. Crystal and Brooklyn Park. Kids present, staff on duty, ratio compliance. Green means fine, yellow means attention needed, red means act now.",
    scroll: false,
  },
  {
    url: `${SITE}/admin/communications`,
    label: 'Newsletters',
    narration: "The newsletter builder. Rich text editing, drag and drop sections, branded preview with PDF export. After sending, analytics show which families opened it and which sections they clicked.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/staff/knowledge-base`,
    label: 'Knowledge Base',
    narration: "The knowledge base captures everything staff know. Procedures, protocols, routines. When someone leaves, their knowledge stays. Entries can be tagged as required reading for new hires.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/pipeline/enrollment`,
    label: 'Enrollment Funnel',
    narration: "The enrollment funnel shows every prospective family from inquiry to enrolled. Conversion rates at each stage. Lead source tracking shows which sources actually produce enrolled families.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/financial/forecasting`,
    label: 'Revenue Forecast',
    narration: "Revenue forecasting with scenario modeling. Slide enrollment up or down, see the financial impact in real time. Save and compare scenarios side by side. Data-driven decisions, not guesswork.",
    scroll: true,
  },
  {
    url: `${SITE}/admin/incidents/log`,
    label: 'Incident Log',
    narration: "Incident reporting with structured forms, required parent notification tracking, and analytics showing patterns by classroom, time of day, and severity. Complete compliance documentation.",
    scroll: true,
  },
];

const EMPLOYEE_PAGES = [
  {
    url: `${SITE}/employee-login`,
    label: 'Employee Login',
    narration: "Staff log in with a four-digit PIN. No email, no password. Just tap four numbers like clocking in at a register.",
    scroll: false,
  },
  {
    url: `${SITE}/employee`,
    label: 'Employee Home',
    narration: "The employee home screen. Six quick-action tiles: clock in, meal count, photos, chat, schedule, and training. Below that, today's task checklist and weekly hours summary.",
    scroll: true,
  },
  {
    url: `${SITE}/employee/meal-count`,
    label: 'Meal Count',
    narration: "Meal counts in fifteen seconds. Pick your classroom. The number is pre-filled from yesterday. Tap plus or minus to adjust. Hit submit. Done. Christina sees it instantly.",
    scroll: false,
  },
  {
    url: `${SITE}/employee/photos`,
    label: 'Upload Photos',
    narration: "Upload classroom photos. Select files, tag the activity type, pick your classroom, add a caption. Submit up to five at once. Christina approves before parents see them.",
    scroll: false,
  },
  {
    url: `${SITE}/employee/schedule`,
    label: 'My Schedule',
    narration: "Your shifts for the week. Navigate between weeks, see start and end times for each day, and request schedule changes right from your phone.",
    scroll: false,
  },
];

const PUBLIC_PAGES = [
  {
    url: `${SITE}/`,
    label: 'Home Page',
    narration: "Welcome to Christina's Child Care Center. The home page shows programs, staff bios, parent testimonials, and a prominent schedule a tour button. This is the front door for new families.",
    scroll: true,
  },
  {
    url: `${SITE}/programs`,
    label: 'Programs',
    narration: "The programs page breaks down what happens at each age level. Infants, toddlers, preschool, and school age each have their own curriculum, daily schedules, and learning objectives.",
    scroll: true,
  },
  {
    url: `${SITE}/guide`,
    label: 'Feature Guide',
    narration: "The interactive feature guide. Pick your role, parent, staff, or admin, and explore every tool with step-by-step instructions, guided tours, and video walkthroughs. This is your complete onboarding experience.",
    scroll: true,
  },
];

// ─── Recording ───────────────────────────────────────────────────────────

async function recordSyncedWalkthrough(sectionName, pages) {
  console.log(`\n=== ${sectionName} Walkthrough ===`);

  // Step 1: Generate all voiceovers and get durations
  console.log('  Generating voiceovers...');
  const segments = [];
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const filename = `${sectionName}-${i}-${p.label.toLowerCase().replace(/\s+/g, '-')}.mp3`;
    const { filePath, duration } = await generateVoiceover(p.narration, filename);
    segments.push({ ...p, audioPath: filePath, audioDuration: duration });
  }

  // Step 2: Record browser with exact timing per page
  console.log('  Recording browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();

  for (const seg of segments) {
    console.log(`    ${seg.label} (${seg.audioDuration.toFixed(1)}s)`);

    try {
      await page.goto(seg.url, { waitUntil: 'networkidle', timeout: 15000 });
    } catch {
      // Auth redirects, continue
    }

    // Wait 1 second for render
    await wait(1000);

    // Click if needed
    if (seg.click) {
      try {
        await page.click(seg.click, { timeout: 2000 });
        await wait(1000);
      } catch { /* element not found */ }
    }

    // Scroll during the middle of the segment
    if (seg.scroll) {
      const scrollTime = (seg.audioDuration * 1000) / 3;
      await wait(scrollTime);
      await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
      await wait(scrollTime);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await wait(scrollTime - 2000);
    } else {
      // Just wait the full duration minus the 1s we already waited
      await wait(Math.max(0, (seg.audioDuration * 1000) - 1000));
    }
  }

  await context.close();
  await browser.close();

  // Step 3: Find the recorded video
  const videos = fs.readdirSync(OUT)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(OUT, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (videos.length === 0) {
    console.log('  ERROR: No video file found');
    return;
  }

  const rawVideo = path.join(OUT, videos[0].name);
  const mp4Video = path.join(OUT, `${sectionName}-walkthrough.mp4`);

  // Step 4: Convert to MP4
  console.log('  Converting to MP4...');
  execSync(`ffmpeg -y -i "${rawVideo}" -c:v libx264 -crf 20 -preset fast "${mp4Video}" `, { stdio: 'pipe' });
  fs.unlinkSync(rawVideo); // clean up webm

  // Step 5: Concatenate all audio segments
  console.log('  Merging audio segments...');
  const audioList = path.join(AUDIO_OUT, `${sectionName}-list.txt`);
  const fullAudio = path.join(AUDIO_OUT, `${sectionName}-full.mp3`);

  const listContent = segments.map(s => `file '${s.audioPath}'`).join('\n');
  fs.writeFileSync(audioList, listContent);
  // Use ffmpeg to concatenate by filtering instead of concat protocol (handles paths with spaces)
  const audioInputs = segments.map((s, i) => `-i "${s.audioPath}"`).join(' ');
  const filterParts = segments.map((_, i) => `[${i}:a]`).join('');
  execSync(`ffmpeg -y ${audioInputs} -filter_complex "${filterParts}concat=n=${segments.length}:v=0:a=1[out]" -map "[out]" "${fullAudio}"`, { stdio: 'pipe' });

  // Step 6: Merge video + audio
  console.log('  Merging video + audio...');
  const finalVideo = path.join(OUT, `${sectionName}-final.mp4`);
  execSync(`ffmpeg -y -i "${mp4Video}" -i "${fullAudio}" -c:v copy -c:a aac -shortest "${finalVideo}" `, { stdio: 'pipe' });

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
