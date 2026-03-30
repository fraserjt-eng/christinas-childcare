// scripts/assemble-final.mjs
// Assembles all recorded chapters + voice into a single admin-final.mp4
// Avatar clips removed per user feedback. Transitions use colored title cards instead.
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VOICE_DIR = '/tmp/christinas-voice';
const RECORDING_DIR = '/tmp/christinas-recordings';
const TMP_DIR = '/tmp/christinas-assembly';
const OUTPUT = path.resolve('public/videos/walkthroughs/admin-final.mp4');

fs.mkdirSync(TMP_DIR, { recursive: true });

// Chapter order: transitions are now 'title' type (colored card + voice, no avatar)
const CHAPTERS = [
  { id: 'intro', type: 'title', audio: 'avatar-intro.mp3', label: "Christina's Child Care Center\nAdmin Portal Guide" },
  { id: 'dashboard', type: 'recording', audio: 'admin-0-dashboard.mp3', video: 'dashboard.webm' },
  { id: 'food-counts', type: 'recording', audio: 'admin-1-food-counts.mp3', video: 'food-counts.webm' },
  { id: 'cacfp', type: 'recording', audio: 'admin-2-cacfp-compliance.mp3', video: 'cacfp.webm' },
  { id: 'attendance', type: 'recording', audio: 'admin-3-attendance.mp3', video: 'attendance.webm' },
  { id: 'scheduling', type: 'recording', audio: 'admin-4-schedule-board.mp3', video: 'scheduling.webm' },
  { id: 'operations-transition', type: 'title', audio: 'avatar-operations-transition.mp3', label: 'Operations Tools' },
  { id: 'task-board', type: 'recording', audio: 'admin-5-task-board.mp3', video: 'task-board.webm' },
  { id: 'cross-site', type: 'recording', audio: 'admin-6-cross-site.mp3', video: 'cross-site.webm' },
  { id: 'communication-transition', type: 'title', audio: 'avatar-communication-transition.mp3', label: 'Communication Tools' },
  { id: 'newsletter', type: 'recording', audio: 'admin-7-newsletter.mp3', video: 'newsletter.webm' },
  { id: 'photo-review', type: 'recording', audio: 'admin-8-photo-review.mp3', video: 'photo-review.webm' },
  { id: 'knowledge-base', type: 'recording', audio: 'admin-9-knowledge-base.mp3', video: 'knowledge-base.webm' },
  { id: 'staff-development', type: 'recording', audio: 'admin-10-staff-development.mp3', video: 'staff-development.webm' },
  { id: 'onboarding', type: 'recording', audio: 'admin-11-onboarding.mp3', video: 'onboarding.webm' },
  { id: 'growth-transition', type: 'title', audio: 'avatar-growth-transition.mp3', label: 'Growth & Enrollment' },
  { id: 'enrollment', type: 'recording', audio: 'admin-12-enrollment-funnel.mp3', video: 'enrollment.webm' },
  { id: 'authorizations', type: 'recording', audio: 'admin-13-authorization-tracking.mp3', video: 'authorizations.webm' },
  { id: 'tours', type: 'recording', audio: 'admin-14-tour-manager.mp3', video: 'tours.webm' },
  { id: 'revenue', type: 'recording', audio: 'admin-15-revenue-forecast.mp3', video: 'revenue.webm' },
  { id: 'incidents', type: 'recording', audio: 'admin-16-incident-log.mp3', video: 'incidents.webm' },
  { id: 'meetings', type: 'recording', audio: 'admin-17-meeting-efficiency.mp3', video: 'meetings.webm' },
  { id: 'supplies', type: 'recording', audio: 'admin-18-supply-management.mp3', video: 'supplies.webm' },
  { id: 'messaging', type: 'recording', audio: 'admin-19-staff-chat.mp3', video: 'messaging.webm' },
  { id: 'outro', type: 'title', audio: 'avatar-outro.mp3', label: "Christina's Child Care Center\nThank You" },
];

function getAudioDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v quiet -print_format json -show_format "${filePath}"`, { encoding: 'utf-8' });
    return parseFloat(JSON.parse(out).format.duration);
  } catch { return 5; }
}

// Generate a title card video: solid dark background with white text, synced to audio duration
function generateTitleCard(label, audioPath, outputPath) {
  const duration = getAudioDuration(audioPath);
  const escapedLabel = label.replace(/'/g, "'\\''").replace(/\n/g, '\\n');

  execSync(
    `ffmpeg -y -f lavfi -i "color=c=0x1a1a1a:s=1920x1080:d=${duration}" ` +
    `-i "${audioPath}" ` +
    `-vf "drawtext=text='${escapedLabel}':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=20,fps=30,format=yuv420p" ` +
    `-c:v libx264 -preset fast -crf 20 ` +
    `-c:a aac -b:a 192k ` +
    `-shortest ` +
    `"${outputPath}"`,
    { stdio: 'pipe', timeout: 30000 }
  );
}

console.log('Assembling admin walkthrough video (no avatar)...\n');

const segmentFiles = [];

for (let i = 0; i < CHAPTERS.length; i++) {
  const ch = CHAPTERS[i];
  const audioPath = path.join(VOICE_DIR, ch.audio);
  const segmentPath = path.join(TMP_DIR, `segment-${String(i).padStart(2, '0')}-${ch.id}.mp4`);

  if (!fs.existsSync(audioPath)) {
    console.log(`  [skip] ${ch.id}: audio not found`);
    continue;
  }

  console.log(`  [${i + 1}/${CHAPTERS.length}] ${ch.id} (${ch.type})`);

  try {
    if (ch.type === 'title') {
      generateTitleCard(ch.label, audioPath, segmentPath);
    } else {
      const videoPath = path.join(RECORDING_DIR, ch.video);
      if (!fs.existsSync(videoPath)) {
        console.log(`    [skip] video not found: ${ch.video}`);
        continue;
      }
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
    }
    segmentFiles.push(segmentPath);
  } catch (err) {
    console.error(`  [error] ${ch.id}: ${err.message.split('\n')[0]}`);
  }
}

console.log(`\nSegments: ${segmentFiles.length}/${CHAPTERS.length}`);

// Concatenate
const concatList = path.join(TMP_DIR, 'concat.txt');
fs.writeFileSync(concatList, segmentFiles.map(f => `file '${f}'`).join('\n'));

console.log('Concatenating final video...');

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
  console.log(`\nDone: ${OUTPUT}`);
  console.log(`Size: ${(size / 1024 / 1024).toFixed(1)} MB`);
} catch (err) {
  console.error(`Concat failed: ${err.message.split('\n')[0]}`);
}
