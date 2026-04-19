#!/usr/bin/env node
// Capture 9:16 screen recordings for platform-reel-v3:
//   - Slow scroll of the live /platform page (10s)
//   - Slight zoom on the old WordPress chriskids2.com home (5s)
// Saves MP4 clips to public/platform-reel/.

import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdirSync, renameSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'public/platform-reel';
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

mkdirSync(OUT_DIR, { recursive: true });

async function capture({ name, url, durationMs, scroll }) {
  const tmpDir = `/tmp/playwright-capture-${name}`;
  rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: WIDTH, height: HEIGHT } },
  });
  const page = await context.newPage();
  page.on('console', (msg) => msg.type() === 'error' && console.error('PAGE ERROR:', msg.text()));
  console.log(`[${name}] loading ${url}`);
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(800);

  if (scroll === 'slow-scroll') {
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const visibleHeight = HEIGHT;
    const scrollMax = Math.max(0, totalHeight - visibleHeight);
    const steps = Math.max(10, Math.round(durationMs / 100));
    const stepPx = scrollMax / steps;
    for (let i = 0; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'auto' }), i * stepPx);
      await page.waitForTimeout(durationMs / steps);
    }
  } else if (scroll === 'zoom') {
    // Apply a gentle CSS scale animation over the duration
    await page.evaluate((durSec) => {
      const style = document.createElement('style');
      style.innerHTML = `
        html { transform-origin: 50% 30%; animation: platformReelZoom ${durSec}s linear forwards; }
        @keyframes platformReelZoom { from { transform: scale(1); } to { transform: scale(1.12); } }
      `;
      document.head.appendChild(style);
    }, durationMs / 1000);
    await page.waitForTimeout(durationMs);
  } else {
    await page.waitForTimeout(durationMs);
  }

  await page.close();
  await context.close();
  await browser.close();

  const files = readdirSync(tmpDir).filter((f) => f.endsWith('.webm'));
  if (!files.length) throw new Error(`No capture produced for ${name}`);
  const webm = join(tmpDir, files[0]);
  const mp4 = join(OUT_DIR, `${name}.mp4`);

  const enc = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      webm,
      '-vf',
      `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`,
      '-r',
      String(FPS),
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '19',
      mp4,
    ],
    { stdio: 'inherit' }
  );
  if (enc.status !== 0) throw new Error(`ffmpeg failed for ${name}`);
  console.log(`[${name}] wrote ${mp4}`);
}

await capture({
  name: 'feature-platform-scroll',
  url: 'https://christinas-childcare.vercel.app/platform',
  durationMs: 10000,
  scroll: 'slow-scroll',
});

await capture({
  name: 'old-site-zoom',
  url: 'https://www.chriskids2.com/',
  durationMs: 5000,
  scroll: 'zoom',
});

console.log('done.');
