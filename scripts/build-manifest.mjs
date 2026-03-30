// scripts/build-manifest.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VOICE_DIR = '/tmp/christinas-voice';
const TIMESTAMP_DIR = '/tmp/christinas-timestamps';
const AVATAR_DIR = '/tmp/christinas-avatar';
const RECORDING_DIR = '/tmp/christinas-recordings';
const OUT_PATH = '/tmp/christinas-manifest.json';

function getAudioDuration(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] Audio file not found: ${filePath}`);
    return 0;
  }
  try {
    const output = execSync(
      `ffprobe -v quiet -print_format json -show_format "${filePath}"`,
      { encoding: 'utf-8' }
    );
    return parseFloat(JSON.parse(output).format.duration) * 1000; // ms
  } catch {
    console.warn(`[WARN] ffprobe failed for: ${filePath}`);
    return 0;
  }
}

function readTimestamps(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    console.warn(`[WARN] Timestamp file not found: ${jsonPath}`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')).words || [];
  } catch {
    console.warn(`[WARN] Failed to parse timestamp file: ${jsonPath}`);
    return [];
  }
}

const CHAPTER_ORDER = [
  { id: 'intro', type: 'avatar', audioFile: 'avatar-intro.mp3', avatarClip: 'avatar-intro.mp4', title: 'Introduction' },
  { id: 'dashboard', type: 'recording', audioFile: 'admin-0-dashboard.mp3', title: 'Admin Dashboard' },
  { id: 'food-counts', type: 'recording', audioFile: 'admin-1-food-counts.mp3', title: 'Food Counts' },
  { id: 'cacfp', type: 'recording', audioFile: 'admin-2-cacfp-compliance.mp3', title: 'CACFP Compliance' },
  { id: 'attendance', type: 'recording', audioFile: 'admin-3-attendance.mp3', title: 'Attendance' },
  { id: 'scheduling', type: 'recording', audioFile: 'admin-4-schedule-board.mp3', title: 'Schedule Board' },
  { id: 'operations-transition', type: 'avatar', audioFile: 'avatar-operations-transition.mp3', avatarClip: 'avatar-operations-transition.mp4', title: 'Operations Tools' },
  { id: 'task-board', type: 'recording', audioFile: 'admin-5-task-board.mp3', title: 'Task Board' },
  { id: 'cross-site', type: 'recording', audioFile: 'admin-6-cross-site.mp3', title: 'Cross-Site Operations' },
  { id: 'communication-transition', type: 'avatar', audioFile: 'avatar-communication-transition.mp3', avatarClip: 'avatar-communication-transition.mp4', title: 'Communication Tools' },
  { id: 'newsletter', type: 'recording', audioFile: 'admin-7-newsletter.mp3', title: 'Newsletter Builder' },
  { id: 'photo-review', type: 'recording', audioFile: 'admin-8-photo-review.mp3', title: 'Photo Review' },
  { id: 'knowledge-base', type: 'recording', audioFile: 'admin-9-knowledge-base.mp3', title: 'Knowledge Base' },
  { id: 'staff-development', type: 'recording', audioFile: 'admin-10-staff-development.mp3', title: 'Staff Development' },
  { id: 'onboarding', type: 'recording', audioFile: 'admin-11-onboarding.mp3', title: 'Onboarding' },
  { id: 'growth-transition', type: 'avatar', audioFile: 'avatar-growth-transition.mp3', avatarClip: 'avatar-growth-transition.mp4', title: 'Growth & Enrollment' },
  { id: 'enrollment', type: 'recording', audioFile: 'admin-12-enrollment-funnel.mp3', title: 'Enrollment Funnel' },
  { id: 'authorizations', type: 'recording', audioFile: 'admin-13-authorization-tracking.mp3', title: 'Authorization Tracking' },
  { id: 'tours', type: 'recording', audioFile: 'admin-14-tour-manager.mp3', title: 'Tour Manager' },
  { id: 'revenue', type: 'recording', audioFile: 'admin-15-revenue-forecast.mp3', title: 'Revenue Forecast' },
  { id: 'incidents', type: 'recording', audioFile: 'admin-16-incident-log.mp3', title: 'Incident Log' },
  { id: 'meetings', type: 'recording', audioFile: 'admin-17-meeting-efficiency.mp3', title: 'Meeting Efficiency' },
  { id: 'supplies', type: 'recording', audioFile: 'admin-18-supply-management.mp3', title: 'Supply Management' },
  { id: 'messaging', type: 'recording', audioFile: 'admin-19-staff-chat.mp3', title: 'Staff Chat' },
  { id: 'outro', type: 'avatar', audioFile: 'avatar-outro.mp3', avatarClip: 'avatar-outro.mp4', title: 'Closing' },
];

let cursor = 0; // cumulative time in ms
const chapters = [];

for (const ch of CHAPTER_ORDER) {
  const audioPath = path.join(VOICE_DIR, ch.audioFile);
  const tsPath = path.join(TIMESTAMP_DIR, ch.audioFile.replace('.mp3', '.json'));
  const duration = getAudioDuration(audioPath);
  const words = readTimestamps(tsPath);

  const chapter = {
    id: ch.id,
    title: ch.title,
    type: ch.type,
    audioFile: `voice/${ch.audioFile}`,
    durationMs: Math.round(duration),
    startTimeMs: Math.round(cursor),
    endTimeMs: Math.round(cursor + duration),
    words,
  };

  if (ch.type === 'avatar' && ch.avatarClip) {
    const avatarPath = path.join(AVATAR_DIR, ch.avatarClip);
    chapter.avatarClip = fs.existsSync(avatarPath) ? `avatar/${ch.avatarClip}` : undefined;
    if (!fs.existsSync(avatarPath)) {
      console.warn(`[WARN] Avatar clip not found: ${avatarPath}`);
    }
  }

  if (ch.type === 'recording') {
    const recPath = path.join(RECORDING_DIR, `${ch.id}.webm`);
    chapter.recordingFile = fs.existsSync(recPath) ? `recordings/${ch.id}.webm` : undefined;
    if (!fs.existsSync(recPath)) {
      console.warn(`[WARN] Recording not found: ${recPath}`);
    }
  }

  chapters.push(chapter);
  cursor += duration;
}

const manifest = {
  id: 'admin-walkthrough',
  title: 'Admin Portal Guide',
  fps: 30,
  width: 1920,
  height: 1080,
  totalDurationMs: Math.round(cursor),
  branding: {
    primaryColor: '#C62828',
    secondaryColor: '#2196F3',
    backgroundColor: '#FDFBF7',
    centerName: "Christina's Child Care Center",
    initial: 'C',
  },
  chapters,
  pageTransitions: [],
};

fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2));
console.log(`Manifest written to ${OUT_PATH}`);
console.log(`Total duration: ${(cursor / 1000 / 60).toFixed(1)} minutes`);
console.log(`Chapters: ${chapters.length} (${chapters.filter(c => c.type === 'avatar').length} avatar, ${chapters.filter(c => c.type === 'recording').length} recording)`);
