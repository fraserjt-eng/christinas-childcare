/**
 * Record a full site walkthrough video using Playwright.
 *
 * This navigates the live site page by page, pausing on each to show
 * the content, clicking elements, scrolling, and recording the entire
 * session as an MP4 video.
 *
 * Usage: node scripts/record-walkthrough.mjs [section]
 * Sections: all, parent, employee, admin
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos', 'walkthroughs');

const SITE = 'https://christinas-childcare.vercel.app';
const PAUSE = 3000; // 3 seconds per page
const SCROLL_PAUSE = 1500;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrollPage(page) {
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await wait(800);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
  await wait(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await wait(500);
}

async function recordSection(sectionName, pages) {
  console.log(`\n=== Recording: ${sectionName} ===`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  for (const entry of pages) {
    console.log(`  Navigating: ${entry.url} (${entry.label})`);

    try {
      await page.goto(entry.url, { waitUntil: 'networkidle', timeout: 15000 });
    } catch {
      // Some pages redirect (auth required), just continue
      console.log(`    (page may have redirected)`);
    }

    await wait(PAUSE);

    // Scroll down to show more content
    if (entry.scroll !== false) {
      await scrollPage(page);
    }

    // Click a specific element if specified
    if (entry.click) {
      try {
        await page.click(entry.click, { timeout: 3000 });
        await wait(2000);
      } catch {
        console.log(`    (click target not found: ${entry.click})`);
      }
    }

    await wait(1000);
  }

  // Close to finalize the video
  await context.close();
  await browser.close();

  // Find the recorded video file
  const fs = await import('fs');
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.webm'))
    .sort((a, b) => {
      const aStat = fs.statSync(path.join(OUTPUT_DIR, a));
      const bStat = fs.statSync(path.join(OUTPUT_DIR, b));
      return bStat.mtimeMs - aStat.mtimeMs;
    });

  if (files.length > 0) {
    const latestVideo = files[0];
    const outputName = `${sectionName}-walkthrough.webm`;
    fs.renameSync(
      path.join(OUTPUT_DIR, latestVideo),
      path.join(OUTPUT_DIR, outputName)
    );
    console.log(`  Saved: ${OUTPUT_DIR}/${outputName}`);
    return path.join(OUTPUT_DIR, outputName);
  }

  return null;
}

// ─── Page definitions ────────────────────────────────────────────────────

const PUBLIC_PAGES = [
  { url: `${SITE}/`, label: 'Home Page' },
  { url: `${SITE}/about`, label: 'About' },
  { url: `${SITE}/programs`, label: 'Programs' },
  { url: `${SITE}/gallery`, label: 'Gallery' },
  { url: `${SITE}/schedule-tour`, label: 'Schedule a Tour' },
  { url: `${SITE}/guide`, label: 'Feature Guide' },
];

const PARENT_PAGES = [
  { url: `${SITE}/login`, label: 'Parent Login' },
  { url: `${SITE}/dashboard`, label: 'Parent Dashboard' },
  { url: `${SITE}/dashboard/children`, label: 'My Children' },
  { url: `${SITE}/dashboard/photos`, label: 'Photo Gallery' },
  { url: `${SITE}/dashboard/news`, label: 'Newsletter Archive' },
  { url: `${SITE}/dashboard/notifications`, label: 'Notification Preferences' },
  { url: `${SITE}/dashboard/messages`, label: 'Messages' },
];

const EMPLOYEE_PAGES = [
  { url: `${SITE}/employee-login`, label: 'Employee Login' },
  { url: `${SITE}/employee`, label: 'Employee Home' },
  { url: `${SITE}/employee/meal-count`, label: 'Meal Count' },
  { url: `${SITE}/employee/photos`, label: 'Upload Photos' },
  { url: `${SITE}/employee/nap-tasks`, label: 'Nap Time Tasks' },
  { url: `${SITE}/employee/tasks`, label: 'My Tasks' },
  { url: `${SITE}/employee/knowledge`, label: 'Knowledge Base' },
  { url: `${SITE}/employee/development`, label: 'My Development' },
  { url: `${SITE}/employee/supplies`, label: 'Request Supplies' },
  { url: `${SITE}/employee/schedule`, label: 'My Schedule' },
];

const ADMIN_PAGES = [
  { url: `${SITE}/admin`, label: 'Admin Dashboard' },
  { url: `${SITE}/admin/food-counts`, label: 'Food Counts', click: '[value="compliance"]' },
  { url: `${SITE}/admin/attendance`, label: 'Attendance' },
  { url: `${SITE}/admin/scheduling`, label: 'Staff Scheduling' },
  { url: `${SITE}/admin/tasks`, label: 'Task Board', click: '[value="kanban"]' },
  { url: `${SITE}/admin/operations`, label: 'Cross-Site Operations' },
  { url: `${SITE}/admin/communications`, label: 'Newsletters' },
  { url: `${SITE}/admin/communications/photos`, label: 'Photo Review' },
  { url: `${SITE}/admin/staff/knowledge-base`, label: 'Knowledge Base' },
  { url: `${SITE}/admin/staff/development`, label: 'Staff Development' },
  { url: `${SITE}/admin/hr/onboarding`, label: 'Onboarding' },
  { url: `${SITE}/admin/pipeline/enrollment`, label: 'Enrollment Funnel' },
  { url: `${SITE}/admin/pipeline/authorizations`, label: 'Authorizations' },
  { url: `${SITE}/admin/pipeline/tours`, label: 'Tour Manager' },
  { url: `${SITE}/admin/financial/forecasting`, label: 'Revenue Forecast' },
  { url: `${SITE}/admin/incidents/log`, label: 'Incident Log' },
  { url: `${SITE}/admin/meetings/efficiency`, label: 'Meeting Efficiency' },
  { url: `${SITE}/admin/supplies`, label: 'Supply Management' },
];

// ─── Main ────────────────────────────────────────────────────────────────

const section = process.argv[2] || 'all';

const fs = await import('fs');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('Christina\'s Childcare - Site Walkthrough Recorder');
console.log(`Section: ${section}`);
console.log(`Output: ${OUTPUT_DIR}`);

if (section === 'all' || section === 'public') {
  await recordSection('public', PUBLIC_PAGES);
}
if (section === 'all' || section === 'parent') {
  await recordSection('parent', PARENT_PAGES);
}
if (section === 'all' || section === 'employee') {
  await recordSection('employee', EMPLOYEE_PAGES);
}
if (section === 'all' || section === 'admin') {
  await recordSection('admin', ADMIN_PAGES);
}

console.log('\n=== All recordings complete ===');
console.log(`Videos saved to: ${OUTPUT_DIR}`);
console.log('\nNext steps:');
console.log('1. Convert to MP4: ffmpeg -i walkthrough.webm -c:v libx264 -crf 20 walkthrough.mp4');
console.log('2. Add voiceover: ffmpeg -i video.mp4 -i voiceover.mp3 -c:v copy -c:a aac final.mp4');
