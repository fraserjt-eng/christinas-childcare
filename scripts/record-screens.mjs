/**
 * record-screens.mjs
 *
 * Phase 4: Screen recordings for the admin portal walkthrough video.
 * Records each of the 20 admin pages as a separate WebM file.
 * Duration of each recording matches the corresponding narration MP3.
 *
 * Output: /tmp/christinas-recordings/{chapter-id}.webm
 *
 * Usage: node scripts/record-screens.mjs
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE = 'https://christinas-childcare.vercel.app';
const VOICE_DIR = '/tmp/christinas-voice';
const RECORDINGS_DIR = '/tmp/christinas-recordings';
const VIEWPORT = { width: 1920, height: 1080 };
const SCROLL_INTERVAL_MS = 100;
const DEFAULT_DURATION_S = 25;
const FALLBACK_DURATION_S = 20;

// Ensure output directory exists
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Get audio duration in seconds via ffprobe.
 * Returns DEFAULT_DURATION_S if ffprobe is unavailable or file not found.
 */
function getAudioDuration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    const duration = parseFloat(result);
    if (isNaN(duration) || duration <= 0) return DEFAULT_DURATION_S;
    return duration;
  } catch {
    return DEFAULT_DURATION_S;
  }
}

/**
 * Find the narration MP3 for a given chapter ID.
 * The voice pipeline names files admin-{index}-{slug}.mp3, e.g. admin-0-dashboard.mp3.
 * We match by chapter ID (the slug part).
 */
function findNarrationFile(chapterId) {
  if (!fs.existsSync(VOICE_DIR)) return null;

  const files = fs.readdirSync(VOICE_DIR);
  // Try exact slug match first: admin-{n}-{chapterId}.mp3
  const exact = files.find((f) => f.endsWith(`-${chapterId}.mp3`));
  if (exact) return path.join(VOICE_DIR, exact);

  // Fallback: any file containing the chapter ID
  const partial = files.find((f) => f.includes(chapterId) && f.endsWith('.mp3'));
  if (partial) return path.join(VOICE_DIR, partial);

  return null;
}

/**
 * Smooth scroll from current position to the bottom of the page
 * over the given duration using even increments every SCROLL_INTERVAL_MS.
 */
async function smoothScrollToBottom(page, durationMs) {
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);

  if (maxScroll <= 0) {
    // Page fits in viewport, just wait out the duration
    await wait(durationMs);
    return;
  }

  const steps = Math.floor(durationMs / SCROLL_INTERVAL_MS);
  const pixelsPerStep = maxScroll / steps;

  for (let i = 1; i <= steps; i++) {
    const targetY = Math.round(pixelsPerStep * i);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
    await wait(SCROLL_INTERVAL_MS);
  }
}

// ─── The 20 admin pages ───────────────────────────────────────────────────────

const ADMIN_PAGES = [
  {
    chapterId: 'dashboard',
    url: `${SITE}/admin`,
    label: 'Admin Dashboard',
    click: null,
  },
  {
    chapterId: 'food-counts',
    url: `${SITE}/admin/food-counts`,
    label: 'Food Counts',
    click: null,
  },
  {
    chapterId: 'cacfp',
    url: `${SITE}/admin/food-counts`,
    label: 'CACFP Compliance',
    click: '[value="compliance"]',
  },
  {
    chapterId: 'attendance',
    url: `${SITE}/admin/attendance`,
    label: 'Attendance',
    click: null,
  },
  {
    chapterId: 'scheduling',
    url: `${SITE}/admin/scheduling`,
    label: 'Schedule Board',
    click: null,
  },
  {
    chapterId: 'task-board',
    url: `${SITE}/admin/tasks`,
    label: 'Task Board',
    click: null,
  },
  {
    chapterId: 'cross-site',
    url: `${SITE}/admin/operations`,
    label: 'Cross-Site Operations',
    click: null,
  },
  {
    chapterId: 'newsletter',
    url: `${SITE}/admin/communications`,
    label: 'Newsletter Builder',
    click: null,
  },
  {
    chapterId: 'photo-review',
    url: `${SITE}/admin/communications/photos`,
    label: 'Photo Review',
    click: null,
  },
  {
    chapterId: 'knowledge-base',
    url: `${SITE}/admin/staff/knowledge-base`,
    label: 'Knowledge Base',
    click: null,
  },
  {
    chapterId: 'staff-development',
    url: `${SITE}/admin/staff/development`,
    label: 'Staff Development',
    click: null,
  },
  {
    chapterId: 'onboarding',
    url: `${SITE}/admin/hr/onboarding`,
    label: 'Onboarding',
    click: null,
  },
  {
    chapterId: 'enrollment',
    url: `${SITE}/admin/pipeline/enrollment`,
    label: 'Enrollment Funnel',
    click: null,
  },
  {
    chapterId: 'authorizations',
    url: `${SITE}/admin/pipeline/authorizations`,
    label: 'Authorization Tracking',
    click: null,
  },
  {
    chapterId: 'tours',
    url: `${SITE}/admin/pipeline/tours`,
    label: 'Tour Manager',
    click: null,
  },
  {
    chapterId: 'revenue',
    url: `${SITE}/admin/financial/forecasting`,
    label: 'Revenue Forecast',
    click: null,
  },
  {
    chapterId: 'incidents',
    url: `${SITE}/admin/incidents/log`,
    label: 'Incident Log',
    click: null,
  },
  {
    chapterId: 'meetings',
    url: `${SITE}/admin/meetings/efficiency`,
    label: 'Meeting Efficiency',
    click: null,
  },
  {
    chapterId: 'supplies',
    url: `${SITE}/admin/supplies`,
    label: 'Supply Management',
    click: null,
  },
  {
    chapterId: 'messaging',
    url: `${SITE}/admin/messaging`,
    label: 'Staff Chat',
    click: null,
  },
];

// ─── Per-page recording ───────────────────────────────────────────────────────

async function recordPage(browser, page, index, total) {
  const { chapterId, url, label, click } = page;
  const outputPath = path.join(RECORDINGS_DIR, `${chapterId}.webm`);

  // Look up narration duration
  const narrationFile = findNarrationFile(chapterId);
  let durationS = FALLBACK_DURATION_S;

  if (narrationFile) {
    durationS = getAudioDuration(narrationFile);
    console.log(`  [${index + 1}/${total}] ${label}: narration ${durationS.toFixed(1)}s (${narrationFile})`);
  } else {
    console.log(`  [${index + 1}/${total}] ${label}: no narration file found, using ${durationS}s fallback`);
  }

  const durationMs = Math.round(durationS * 1000);

  // Each page gets its own context so the video file is cleanly saved on close
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: VIEWPORT,
    },
  });

  const pw = await context.newPage();

  try {
    // Navigate and wait for network to settle
    await pw.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await wait(1000);

    // Apply smooth scroll behavior
    await pw.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'smooth';
    });

    // If there is a click selector (e.g. CACFP compliance tab), click it first
    if (click) {
      try {
        await pw.click(click, { timeout: 5000 });
        await wait(1000);
      } catch (err) {
        console.log(`    Click on "${click}" failed: ${err.message} - continuing`);
      }
    }

    // Scroll smoothly from top to bottom over the narration duration
    await pw.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await wait(200);
    await smoothScrollToBottom(pw, durationMs);

  } catch (err) {
    console.error(`  ERROR on ${label} (${url}): ${err.message}`);
  } finally {
    // Close context to flush the WebM file to disk
    await context.close();
  }

  // Playwright saves the video with an auto-generated filename in the dir.
  // Find the most recently created .webm file and rename it to our chapter ID.
  const files = fs.readdirSync(RECORDINGS_DIR)
    .filter((f) => f.endsWith('.webm') && f !== `${chapterId}.webm`)
    .map((f) => ({
      name: f,
      mtime: fs.statSync(path.join(RECORDINGS_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length > 0) {
    const src = path.join(RECORDINGS_DIR, files[0].name);
    fs.renameSync(src, outputPath);
    const stats = fs.statSync(outputPath);
    console.log(`    Saved: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
  } else {
    console.log(`    Warning: no WebM file found for ${label}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Christina\'s Child Care Center - Admin Screen Recordings (Phase 4)');
  console.log(`Output directory: ${RECORDINGS_DIR}`);
  console.log(`Voice directory: ${VOICE_DIR}`);
  console.log(`Pages to record: ${ADMIN_PAGES.length}`);
  console.log('');

  // Try headed mode first, fall back to headless
  let browser;
  let headless = false;

  try {
    browser = await chromium.launch({
      headless: false,
      args: [
        '--use-gl=angle',
        '--enable-gpu-rasterization',
        '--force-device-scale-factor=2',
        '--window-position=-2000,-2000',
      ],
    });
    console.log('Launched in headed mode (GPU rasterization enabled)');
  } catch (err) {
    console.log(`Headed launch failed: ${err.message}`);
    console.log('Falling back to headless mode...');
    headless = true;
    browser = await chromium.launch({ headless: true });
  }

  const results = { success: 0, failed: 0 };
  const startTime = Date.now();

  for (let i = 0; i < ADMIN_PAGES.length; i++) {
    const page = ADMIN_PAGES[i];
    try {
      await recordPage(browser, page, i, ADMIN_PAGES.length);
      results.success++;
    } catch (err) {
      console.error(`  FATAL ERROR recording ${page.label}: ${err.message}`);
      results.failed++;
    }
  }

  await browser.close();

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('');
  console.log(`Done in ${elapsed} minutes.`);
  console.log(`  Succeeded: ${results.success}/${ADMIN_PAGES.length}`);
  if (results.failed > 0) {
    console.log(`  Failed:    ${results.failed}/${ADMIN_PAGES.length}`);
  }
  console.log('');
  console.log('Recordings saved to:');

  const webms = fs.existsSync(RECORDINGS_DIR)
    ? fs.readdirSync(RECORDINGS_DIR).filter((f) => f.endsWith('.webm')).sort()
    : [];

  webms.forEach((f) => {
    const fPath = path.join(RECORDINGS_DIR, f);
    const size = (fs.statSync(fPath).size / 1024 / 1024).toFixed(1);
    console.log(`  ${fPath} (${size} MB)`);
  });
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
