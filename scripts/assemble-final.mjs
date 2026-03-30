// scripts/assemble-final.mjs
// Assembles all recorded chapters + voice into a single admin-final.mp4
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VOICE_DIR = '/tmp/christinas-voice';
const AVATAR_DIR = '/tmp/christinas-avatar';
const RECORDING_DIR = '/tmp/christinas-recordings';
const TMP_DIR = '/tmp/christinas-assembly';
const OUTPUT = path.resolve('public/videos/walkthroughs/admin-final.mp4');

fs.mkdirSync(TMP_DIR, { recursive: true });

// Chapter order matching the manifest
const CHAPTERS = [
  { id: 'intro', type: 'avatar', audio: 'avatar-intro.mp3', video: 'avatar-intro.mp4' },
  { id: 'dashboard', type: 'recording', audio: 'admin-0-dashboard.mp3', video: 'dashboard.webm' },
  { id: 'food-counts', type: 'recording', audio: 'admin-1-food-counts.mp3', video: 'food-counts.webm' },
  { id: 'cacfp', type: 'recording', audio: 'admin-2-cacfp-compliance.mp3', video: 'cacfp.webm' },
  { id: 'attendance', type: 'recording', audio: 'admin-3-attendance.mp3', video: 'attendance.webm' },
  { id: 'scheduling', type: 'recording', audio: 'admin-4-schedule-board.mp3', video: 'scheduling.webm' },
  { id: 'operations-transition', type: 'avatar', audio: 'avatar-operations-transition.mp3', video: 'avatar-operations-transition.mp4' },
  { id: 'task-board', type: 'recording', audio: 'admin-5-task-board.mp3', video: 'task-board.webm' },
  { id: 'cross-site', type: 'recording', audio: 'admin-6-cross-site.mp3', video: 'cross-site.webm' },
  { id: 'communication-transition', type: 'avatar', audio: 'avatar-communication-transition.mp3', video: 'avatar-communication-transition.mp4' },
  { id: 'newsletter', type: 'recording', audio: 'admin-7-newsletter.mp3', video: 'newsletter.webm' },
  { id: 'photo-review', type: 'recording', audio: 'admin-8-photo-review.mp3', video: 'photo-review.webm' },
  { id: 'knowledge-base', type: 'recording', audio: 'admin-9-knowledge-base.mp3', video: 'knowledge-base.webm' },
  { id: 'staff-development', type: 'recording', audio: 'admin-10-staff-development.mp3', video: 'staff-development.webm' },
  { id: 'onboarding', type: 'recording', audio: 'admin-11-onboarding.mp3', video: 'onboarding.webm' },
  { id: 'growth-transition', type: 'avatar', audio: 'avatar-growth-transition.mp3', video: 'avatar-growth-transition.mp4' },
  { id: 'enrollment', type: 'recording', audio: 'admin-12-enrollment-funnel.mp3', video: 'enrollment.webm' },
  { id: 'authorizations', type: 'recording', audio: 'admin-13-authorization-tracking.mp3', video: 'authorizations.webm' },
  { id: 'tours', type: 'recording', audio: 'admin-14-tour-manager.mp3', video: 'tours.webm' },
  { id: 'revenue', type: 'recording', audio: 'admin-15-revenue-forecast.mp3', video: 'revenue.webm' },
  { id: 'incidents', type: 'recording', audio: 'admin-16-incident-log.mp3', video: 'incidents.webm' },
  { id: 'meetings', type: 'recording', audio: 'admin-17-meeting-efficiency.mp3', video: 'meetings.webm' },
  { id: 'supplies', type: 'recording', audio: 'admin-18-supply-management.mp3', video: 'supplies.webm' },
  { id: 'messaging', type: 'recording', audio: 'admin-19-staff-chat.mp3', video: 'messaging.webm' },
  { id: 'outro', type: 'avatar', audio: 'avatar-outro.mp3', video: 'avatar-outro.mp4' },
];

console.log('Assembling admin walkthrough video...\n');

// Phase 1: Create per-chapter MP4 segments with synced audio
const segmentFiles = [];

for (let i = 0; i < CHAPTERS.length; i++) {
  const ch = CHAPTERS[i];
  const videoDir = ch.type === 'avatar' ? AVATAR_DIR : RECORDING_DIR;
  const videoPath = path.join(videoDir, ch.video);
  const audioPath = path.join(VOICE_DIR, ch.audio);
  const segmentPath = path.join(TMP_DIR, `segment-${String(i).padStart(2, '0')}-${ch.id}.mp4`);

  if (!fs.existsSync(videoPath)) {
    console.log(`  [skip] ${ch.id}: video not found at ${videoPath}`);
    continue;
  }

  if (!fs.existsSync(audioPath)) {
    console.log(`  [skip] ${ch.id}: audio not found at ${audioPath}`);
    continue;
  }

  console.log(`  [${i + 1}/${CHAPTERS.length}] ${ch.id}`);

  try {
    // Merge video + audio into a segment, scale to 1920x1080, set to 30fps
    execSync(
      `ffmpeg -y -i "${videoPath}" -i "${audioPath}" ` +
      `-filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p[v]" ` +
      `-map "[v]" -map 1:a ` +
      `-c:v libx264 -preset fast -crf 20 ` +
      `-c:a aac -b:a 192k ` +
      `-shortest ` +
      `"${segmentPath}"`,
      { stdio: 'pipe', timeout: 60000 }
    );
    segmentFiles.push(segmentPath);
  } catch (err) {
    console.error(`  [error] ${ch.id}: ${err.message.split('\n')[0]}`);
  }
}

console.log(`\nSegments created: ${segmentFiles.length}/${CHAPTERS.length}`);

// Phase 2: Concatenate all segments into final video
const concatList = path.join(TMP_DIR, 'concat.txt');
fs.writeFileSync(concatList, segmentFiles.map(f => `file '${f}'`).join('\n'));

console.log('\nConcatenating into final video...');

try {
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${concatList}" ` +
    `-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p ` +
    `-c:a aac -b:a 192k ` +
    `-movflags +faststart ` +
    `"${OUTPUT}"`,
    { stdio: 'pipe', timeout: 300000 }
  );

  const size = fs.statSync(OUTPUT).size;
  console.log(`\nFinal video: ${OUTPUT}`);
  console.log(`Size: ${(size / 1024 / 1024).toFixed(1)} MB`);
} catch (err) {
  console.error(`Concat failed: ${err.message.split('\n')[0]}`);
}
