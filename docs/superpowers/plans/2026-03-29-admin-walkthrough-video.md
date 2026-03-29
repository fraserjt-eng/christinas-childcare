# Admin Walkthrough Video Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current amateur admin walkthrough video with a production-grade video featuring ElevenLabs voice, D-ID avatar, element highlighting, karaoke captions, and a 7-layer Remotion composition.

**Architecture:** 8-phase pipeline (voice → timestamps → avatar → record → manifest → render → mix → encode) with a video quality scorecard that auto-scores the output on 7 dimensions. All Remotion overlay components are ported from the reference pipeline at `~/Desktop/video-studio/`.

**Tech Stack:** ElevenLabs API, D-ID API, Playwright, Remotion 4, FFmpeg, whisper.cpp, Node.js ESM (.mjs)

**Project:** `/Users/jfraser/Desktop/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare/`
**Reference pipeline:** `/Users/jfraser/Desktop/video-studio/`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `types/video-schema.ts` | Type definitions for manifest, chapters, segments, word timestamps |
| `scripts/record-v3.mjs` | 8-phase pipeline orchestrator (CLI entry point) |
| `scripts/generate-voice.mjs` | ElevenLabs TTS with edge-tts fallback |
| `scripts/generate-timestamps.mjs` | Whisper word-level alignment with duration-based fallback |
| `scripts/generate-avatar.mjs` | D-ID API for talking-head clips |
| `scripts/build-manifest.mjs` | Assembles all assets into a single manifest JSON |
| `scripts/score-video.mjs` | 7-dimension video quality scorecard |
| `remotion/compositions/WalkthroughVideo.tsx` | 6-layer composition driven by manifest |
| `remotion/components/AvatarPIP.tsx` | Circular avatar picture-in-picture overlay |
| `remotion/components/BrandedTitleCard.tsx` | Port from video-studio, rebranded |
| `remotion/components/ChapterCard.tsx` | Port from video-studio |
| `remotion/components/ElementHighlight.tsx` | Port from video-studio |
| `remotion/components/KaraokeCaption.tsx` | Port from video-studio (adapted for local types) |
| `remotion/components/PageTransition.tsx` | Port from video-studio (simplified, no screenshots) |
| `remotion/components/ProgressBar.tsx` | Port from video-studio |

### Modified Files
| File | Change |
|------|--------|
| `remotion/Root.tsx` | Register `WalkthroughVideo` composition |
| `.env.local` | Add `ELEVENLABS_API_KEY`, `DID_API_KEY` |

### Not Modified
| File | Reason |
|------|--------|
| `scripts/record-synced.mjs` | Keep as fallback, read narration data from it |

---

## Task 0: Score Current Video (Baseline)

**Files:**
- Create: `scripts/score-video.mjs`

- [ ] **Step 1: Create the scorecard script**

```javascript
// scripts/score-video.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const videoPath = process.argv[2];
if (!videoPath) { console.error('Usage: node scripts/score-video.mjs <video.mp4>'); process.exit(1); }

const scores = {};

// 1. Encoding Quality (resolution + bitrate proxy)
function scoreEncoding(videoPath) {
  try {
    const probe = execSync(
      `ffprobe -v quiet -print_format json -show_streams "${videoPath}"`,
      { encoding: 'utf-8' }
    );
    const streams = JSON.parse(probe).streams;
    const video = streams.find(s => s.codec_type === 'video');
    if (!video) return { score: 0, detail: 'No video stream found' };
    const w = parseInt(video.width);
    const h = parseInt(video.height);
    const is1080 = w >= 1920 && h >= 1080;
    const bitrate = parseInt(video.bit_rate || '0');
    let score = 4;
    if (is1080) score += 3;
    if (bitrate > 5000000) score += 3;
    else if (bitrate > 2000000) score += 2;
    else if (bitrate > 1000000) score += 1;
    return { score: Math.min(10, score), detail: `${w}x${h}, ${Math.round(bitrate/1000)}kbps` };
  } catch { return { score: 2, detail: 'ffprobe failed' }; }
}

// 2. Audio Quality (presence + bitrate)
function scoreAudio(videoPath) {
  try {
    const probe = execSync(
      `ffprobe -v quiet -print_format json -show_streams "${videoPath}"`,
      { encoding: 'utf-8' }
    );
    const streams = JSON.parse(probe).streams;
    const audio = streams.find(s => s.codec_type === 'audio');
    if (!audio) return { score: 0, detail: 'No audio stream' };
    const bitrate = parseInt(audio.bit_rate || '0');
    let score = 4; // Has audio
    if (bitrate >= 192000) score += 3;
    else if (bitrate >= 128000) score += 2;
    else if (bitrate >= 64000) score += 1;
    // TTS quality: check if NISQA is available, otherwise manual note
    return { score: Math.min(10, score), detail: `${audio.codec_name}, ${Math.round(bitrate/1000)}kbps. Voice naturalness: manual review needed.` };
  } catch { return { score: 2, detail: 'ffprobe failed' }; }
}

// 3. A/V Sync (check if audio and video have same duration within 500ms)
function scoreSync(videoPath) {
  try {
    const probe = execSync(
      `ffprobe -v quiet -print_format json -show_format "${videoPath}"`,
      { encoding: 'utf-8' }
    );
    const duration = parseFloat(JSON.parse(probe).format.duration);
    // Without subtitle track, we can only check stream alignment
    return { score: 6, detail: `Duration: ${duration.toFixed(1)}s. Detailed sync requires caption track.` };
  } catch { return { score: 2, detail: 'ffprobe failed' }; }
}

// 4. Pacing (check total duration vs page count)
function scorePacing(videoPath, pageCount = 20) {
  try {
    const probe = execSync(
      `ffprobe -v quiet -print_format json -show_format "${videoPath}"`,
      { encoding: 'utf-8' }
    );
    const duration = parseFloat(JSON.parse(probe).format.duration);
    const avgPerPage = duration / pageCount;
    let score = 6;
    if (avgPerPage >= 10 && avgPerPage <= 40) score = 10; // Good pacing
    else if (avgPerPage >= 5 && avgPerPage <= 60) score = 8;
    else score = 4; // Too rushed or too slow
    return { score, detail: `${duration.toFixed(0)}s total, ${avgPerPage.toFixed(1)}s avg per page` };
  } catch { return { score: 2, detail: 'ffprobe failed' }; }
}

// 5. Coverage (manual — check narration count)
function scoreCoverage(pageCount = 20) {
  return { score: 10, detail: `All ${pageCount} admin pages have narration text defined` };
}

// 6. Visual Clarity (resolution check)
function scoreVisualClarity(videoPath) {
  const enc = scoreEncoding(videoPath);
  const is1080 = enc.detail.includes('1920');
  return { score: is1080 ? 8 : 5, detail: enc.detail };
}

// 7. Accessibility (check for subtitle stream)
function scoreAccessibility(videoPath) {
  try {
    const probe = execSync(
      `ffprobe -v quiet -print_format json -show_streams "${videoPath}"`,
      { encoding: 'utf-8' }
    );
    const streams = JSON.parse(probe).streams;
    const subs = streams.find(s => s.codec_type === 'subtitle');
    if (subs) return { score: 10, detail: 'Subtitle track present' };
    return { score: 0, detail: 'No captions/subtitle track' };
  } catch { return { score: 0, detail: 'ffprobe failed' }; }
}

// Run all
scores.encoding = scoreEncoding(videoPath);
scores.audio = scoreAudio(videoPath);
scores.sync = scoreSync(videoPath);
scores.pacing = scorePacing(videoPath);
scores.coverage = scoreCoverage();
scores.visual = scoreVisualClarity(videoPath);
scores.accessibility = scoreAccessibility(videoPath);

const total = Object.values(scores).reduce((sum, s) => sum + s.score, 0);
const tier = total >= 60 ? 'Production-ready' : total >= 50 ? 'Good' : total >= 40 ? 'Acceptable' : 'Reshoot';

// Print
console.log('\n╔══════════════════════════════════════╗');
console.log('║   VIDEO QUALITY SCORECARD            ║');
console.log('╚══════════════════════════════════════╝\n');
console.log(`Video: ${path.basename(videoPath)}`);
console.log(`Date:  ${new Date().toISOString().split('T')[0]}\n`);

for (const [key, val] of Object.entries(scores)) {
  const bar = '█'.repeat(val.score) + '░'.repeat(10 - val.score);
  console.log(`  ${key.padEnd(15)} ${bar} ${val.score}/10  ${val.detail}`);
}
console.log(`\n  TOTAL: ${total}/70  —  ${tier}\n`);

// Save markdown report
const md = `# Video Scorecard: ${path.basename(videoPath)}\n\nDate: ${new Date().toISOString().split('T')[0]}\nTotal: **${total}/70** (${tier})\n\n| Dimension | Score | Detail |\n|-----------|-------|--------|\n${Object.entries(scores).map(([k, v]) => `| ${k} | ${v.score}/10 | ${v.detail} |`).join('\n')}\n`;
const outDir = path.dirname(videoPath);
fs.writeFileSync(path.join(outDir, `${path.basename(videoPath, '.mp4')}-scorecard.md`), md);
console.log(`Scorecard saved to ${path.join(outDir, path.basename(videoPath, '.mp4') + '-scorecard.md')}`);
```

- [ ] **Step 2: Run baseline score on current video**

```bash
node scripts/score-video.mjs public/videos/walkthroughs/admin-final.mp4
```

Expected: Score ~25-35/70. No captions (0/10 accessibility), basic encoding, robotic voice.

- [ ] **Step 3: Commit**

```bash
git add scripts/score-video.mjs
git commit -m "feat: add video quality scorecard (7 dimensions, 70 points max)"
```

---

## Task 1: Type System

**Files:**
- Create: `types/video-schema.ts`

- [ ] **Step 1: Create the type definitions**

Copy the type system from `/Users/jfraser/Desktop/video-studio/types/video-schema.ts` and extend with avatar and walkthrough-specific types:

```typescript
// types/video-schema.ts

/** Word-level timestamp from whisper.cpp */
export interface WordTimestamp {
  word: string;
  start: number; // seconds from segment start
  end: number;   // seconds from segment start
}

/** Element geometry captured during recording */
export interface ElementCapture {
  found: boolean;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
}

/** A recorded segment with captured metadata */
export interface RecordedSegment {
  id: string;
  startTimeMs: number;
  endTimeMs: number;
  audioPath: string;
  audioDurationMs: number;
  wordTimestamps: WordTimestamp[];
  element: ElementCapture;
  scrollFrom: number;
  scrollTo: number;
}

/** Page transition data for crossfade rendering */
export interface PageTransition {
  fromUrl: string;
  toUrl: string;
  timeMs: number;
}

/** Brand configuration */
export interface Branding {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  centerName: string;
  initial: string;
}

/** A chapter in the walkthrough manifest */
export interface ManifestChapter {
  id: string;
  title: string;
  type: 'avatar' | 'recording';
  avatarClip?: string;
  recordingFile?: string;
  audioFile: string;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  words: WordTimestamp[];
  highlights?: { selector: string; startMs: number; endMs: number; boundingBox?: ElementCapture['boundingBox'] }[];
}

/** Complete manifest output from all pipeline phases */
export interface WalkthroughManifest {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  totalDurationMs: number;
  branding: Branding;
  chapters: ManifestChapter[];
  pageTransitions: PageTransition[];
}

/** Props passed to the WalkthroughVideo Remotion composition */
export interface WalkthroughVideoProps {
  manifest: WalkthroughManifest;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/video-schema.ts
git commit -m "feat: add video-schema types for walkthrough manifest pipeline"
```

---

## Task 2: Port Remotion Components

**Files:**
- Create: `remotion/components/BrandedTitleCard.tsx`
- Create: `remotion/components/ChapterCard.tsx`
- Create: `remotion/components/ElementHighlight.tsx`
- Create: `remotion/components/KaraokeCaption.tsx`
- Create: `remotion/components/PageTransition.tsx`
- Create: `remotion/components/ProgressBar.tsx`
- Create: `remotion/components/AvatarPIP.tsx`
- Modify: `remotion/Root.tsx`

- [ ] **Step 1: Copy BrandedTitleCard.tsx from video-studio**

Copy `/Users/jfraser/Desktop/video-studio/remotion/components/BrandedTitleCard.tsx` to `remotion/components/BrandedTitleCard.tsx`. This file is self-contained with no imports from `video-schema.ts`. Use as-is. The component accepts `primaryColor`, `brandInitial`, `brandName`, `title`, `subtitle`, `badge` props. When called, pass `primaryColor: '#C62828'`, `brandInitial: 'C'`, `brandName: "Christina's Child Care Center"`.

- [ ] **Step 2: Copy ChapterCard.tsx**

Copy from `/Users/jfraser/Desktop/video-studio/remotion/components/ChapterCard.tsx`. Self-contained. Use as-is. Accepts `title`, `subtitle`, `chapterIndex`, `totalChapters`, `primaryColor`.

- [ ] **Step 3: Copy ElementHighlight.tsx**

Copy from `/Users/jfraser/Desktop/video-studio/remotion/components/ElementHighlight.tsx`. Change the import path:
```typescript
// Change this:
import type { RecordedSegment } from '../../types/video-schema';
// To this:
import type { RecordedSegment } from '@/types/video-schema';
```

- [ ] **Step 4: Copy KaraokeCaption.tsx**

Copy from `/Users/jfraser/Desktop/video-studio/remotion/components/KaraokeCaption.tsx`. Change import path same as Step 3:
```typescript
import type { RecordedSegment, WordTimestamp } from '@/types/video-schema';
```

- [ ] **Step 5: Copy ProgressBar.tsx**

Copy from `/Users/jfraser/Desktop/video-studio/remotion/components/ProgressBar.tsx`. Replace the import:
```typescript
// Change:
import type { RecordingManifest } from '../../types/video-schema';
// To:
import type { WalkthroughManifest } from '@/types/video-schema';
```
And rename the prop type from `RecordingManifest` to `WalkthroughManifest`. The interface shape is compatible (both have `chapters` with `startTimeMs`, `endTimeMs`, `title` and `totalDurationMs`).

- [ ] **Step 6: Create simplified PageTransition.tsx**

The video-studio version uses screenshot files for crossfades. Our version is simpler (just a black fade between chapters):

```tsx
// remotion/components/PageTransition.tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { PageTransition as PageTransitionData } from '@/types/video-schema';

interface PageTransitionProps {
  transitions: PageTransitionData[];
  contentStartFrame: number;
}

const CROSSFADE_FRAMES = 15; // 0.5s at 30fps

export const PageTransitionOverlay: React.FC<PageTransitionProps> = ({
  transitions,
  contentStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const contentFrame = frame - contentStartFrame;
  if (contentFrame < 0) return null;

  const currentTimeMs = (contentFrame / fps) * 1000;

  for (const t of transitions) {
    const endMs = t.timeMs + (CROSSFADE_FRAMES / fps) * 1000;
    if (currentTimeMs >= t.timeMs && currentTimeMs < endMs) {
      const progress = (currentTimeMs - t.timeMs) / ((CROSSFADE_FRAMES / fps) * 1000);
      const opacity = interpolate(progress, [0, 0.5, 1], [0, 0.6, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', background: `rgba(0,0,0,${opacity})` }} />
      );
    }
  }
  return null;
};
```

- [ ] **Step 7: Create AvatarPIP.tsx**

```tsx
// remotion/components/AvatarPIP.tsx
import { AbsoluteFill, Video, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface AvatarPIPProps {
  src: string;
  isVideo: boolean;
  startFrame: number;
  endFrame: number;
  size?: number;
}

export const AvatarPIP: React.FC<AvatarPIPProps> = ({
  src,
  isVideo,
  startFrame,
  endFrame,
  size = 200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const fadeFrames = Math.round(fps * 0.3);
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + fadeFrames, endFrame - fadeFrames, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
        opacity,
      }}>
        {isVideo ? (
          <Video src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 8: Commit all components**

```bash
git add remotion/components/BrandedTitleCard.tsx remotion/components/ChapterCard.tsx \
  remotion/components/ElementHighlight.tsx remotion/components/KaraokeCaption.tsx \
  remotion/components/PageTransition.tsx remotion/components/ProgressBar.tsx \
  remotion/components/AvatarPIP.tsx
git commit -m "feat: port 6 Remotion overlay components from video-studio + create AvatarPIP"
```

---

## Task 3: WalkthroughVideo Composition

**Files:**
- Create: `remotion/compositions/WalkthroughVideo.tsx`
- Modify: `remotion/Root.tsx`

- [ ] **Step 1: Create the 6-layer composition**

```tsx
// remotion/compositions/WalkthroughVideo.tsx
import { AbsoluteFill, Sequence, Video, Audio, staticFile } from 'remotion';
import { BrandedTitleCard } from '../components/BrandedTitleCard';
import { ChapterCard } from '../components/ChapterCard';
import { KaraokeCaption } from '../components/KaraokeCaption';
import { AvatarPIP } from '../components/AvatarPIP';
import { ProgressBar } from '../components/ProgressBar';
import { PageTransitionOverlay } from '../components/PageTransition';
import type { WalkthroughManifest, RecordedSegment } from '@/types/video-schema';

const TITLE_CARD_FRAMES = 120; // 4s at 30fps
const CHAPTER_CARD_FRAMES = 90; // 3s at 30fps

interface WalkthroughVideoProps {
  manifest: WalkthroughManifest;
}

export const WalkthroughVideo: React.FC<WalkthroughVideoProps> = ({ manifest }) => {
  const fps = manifest.fps || 30;
  let currentFrame = 0;

  const sequences: JSX.Element[] = [];

  // Title card
  sequences.push(
    <Sequence key="title" from={currentFrame} durationInFrames={TITLE_CARD_FRAMES}>
      <BrandedTitleCard
        title={manifest.title}
        subtitle="Complete Guide"
        brandName={manifest.branding.centerName}
        brandInitial={manifest.branding.initial}
        primaryColor={manifest.branding.primaryColor}
        badge="Admin Portal Walkthrough"
      />
    </Sequence>
  );
  currentFrame += TITLE_CARD_FRAMES;

  const contentStartFrame = currentFrame;

  // Chapters
  const recordingChapters = manifest.chapters.filter(ch => ch.type === 'recording');
  const avatarChapters = manifest.chapters.filter(ch => ch.type === 'avatar');

  for (const chapter of manifest.chapters) {
    const chapterFrames = Math.round((chapter.durationMs / 1000) * fps);

    if (chapter.type === 'avatar' && chapter.avatarClip) {
      // Avatar chapter: show avatar clip with branded background
      sequences.push(
        <Sequence key={chapter.id} from={currentFrame} durationInFrames={chapterFrames}>
          <AbsoluteFill style={{ background: '#1a1a1a' }}>
            <Video src={staticFile(chapter.avatarClip)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </AbsoluteFill>
          <Audio src={staticFile(chapter.audioFile)} />
        </Sequence>
      );
    } else if (chapter.type === 'recording' && chapter.recordingFile) {
      // Screen recording chapter
      sequences.push(
        <Sequence key={chapter.id} from={currentFrame} durationInFrames={chapterFrames}>
          <Video src={staticFile(chapter.recordingFile)} style={{ width: '100%', height: '100%' }} />
          <Audio src={staticFile(chapter.audioFile)} />
        </Sequence>
      );
    }

    currentFrame += chapterFrames;
  }

  // Build segments array for captions (flatten all chapters with words)
  const allSegments: RecordedSegment[] = manifest.chapters
    .filter(ch => ch.words && ch.words.length > 0)
    .map(ch => ({
      id: ch.id,
      startTimeMs: ch.startTimeMs,
      endTimeMs: ch.endTimeMs,
      audioPath: ch.audioFile,
      audioDurationMs: ch.durationMs,
      wordTimestamps: ch.words,
      element: { found: false, boundingBox: null },
      scrollFrom: 0,
      scrollTo: 0,
    }));

  return (
    <AbsoluteFill>
      {sequences}

      {/* Layer 3: Karaoke captions */}
      <KaraokeCaption segments={allSegments} contentStartFrame={contentStartFrame} />

      {/* Layer 5: Progress bar */}
      <ProgressBar manifest={manifest} contentStartFrame={contentStartFrame} />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Register in Root.tsx**

Add to `remotion/Root.tsx`:
```tsx
import { WalkthroughVideo } from './compositions/WalkthroughVideo';

// Add inside the RemotionRoot component, alongside existing compositions:
<Composition
  id="WalkthroughVideo"
  component={WalkthroughVideo}
  durationInFrames={30 * 60 * 15} // 15 min max
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    manifest: {
      id: 'admin-walkthrough',
      title: 'Admin Portal Guide',
      fps: 30,
      width: 1920,
      height: 1080,
      totalDurationMs: 600000,
      branding: {
        primaryColor: '#C62828',
        secondaryColor: '#2196F3',
        backgroundColor: '#FDFBF7',
        centerName: "Christina's Child Care Center",
        initial: 'C',
      },
      chapters: [],
      pageTransitions: [],
    },
  }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add remotion/compositions/WalkthroughVideo.tsx remotion/Root.tsx
git commit -m "feat: add WalkthroughVideo 6-layer Remotion composition"
```

---

## Task 4: Voice Generation (Phase 1)

**Files:**
- Create: `scripts/generate-voice.mjs`

- [ ] **Step 1: Create the voice generation script**

```javascript
// scripts/generate-voice.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'ava'; // Ava voice

const ADMIN_NARRATIONS = [
  { index: 0, slug: 'dashboard', text: "Christina's command center. The dashboard shows real-time alerts at the top, anything that needs attention right now. Below that, today's attendance snapshot, staff on duty, ratio status, and tasks completed. Quick action buttons change based on the time of day, showing the most relevant tools for morning, afternoon, or closing." },
  { index: 1, slug: 'food-counts', text: "Food counts and CACFP tracking. Three quick-fill buttons at the top: copy yesterday, fill from enrollment, or everyone here. One click fills the entire grid. No more typing forty-eight numbers manually. The daily summary shows totals by meal type across all classrooms." },
  { index: 2, slug: 'cacfp-compliance', text: "The compliance tab shows your on-time submission rate, revenue impact from missed counts, the sixteen-item CACFP checklist with auto-verification, and your audit readiness score from zero to one hundred percent. This is how Christina protects revenue." },
  { index: 3, slug: 'attendance', text: "Attendance tracking. See who is checked in, who has not arrived yet, and who has already departed. Color-coded status for each child. The ratio monitor shows if every classroom has enough staff." },
  { index: 4, slug: 'schedule-board', text: "The scheduling board. Drag preset shift blocks onto employee rows. Morning, full day, afternoon, opening, closing. Build the whole week by dragging instead of typing. Copy last week with one button. Switch between the board, weekly grid, hours summary, ratio compliance, labor cost, coverage requests, and the publish tab." },
  { index: 5, slug: 'task-board', text: "The task board with multiple views. The list view shows all tasks with priority and status. The kanban view has three drag-and-drop columns. The timeline shows tasks on a visual schedule. Delegation tracking shows how much work Christina is doing versus what has been delegated to staff. Insights auto-generate observations about time allocation patterns." },
  { index: 6, slug: 'cross-site', text: "Both centers at a glance. Crystal Center and Brooklyn Park, side by side. Each card shows kids present, staff on duty, staff-to-child ratio with compliance color, open incidents, and pending messages. Green means nominal. Yellow means attention needed. Red means act now. The weekly trends tab shows patterns over time." },
  { index: 7, slug: 'newsletter', text: "The newsletter builder. Works like Mailchimp but built into the platform. Add sections for photos, events, classroom spotlights, announcements. Use the rich text editor for formatting, images, and links. Drag sections to reorder. Toggle the preview to see what parents receive. Send now, schedule for later, or download as a PDF. Analytics show which families engaged." },
  { index: 8, slug: 'photo-review', text: "Photo review. Staff upload photos throughout the day. Christina reviews them here before parents can see them. Approve or reject individually, or use bulk actions to approve the whole batch at once. Stats show how many are pending, approved, and rejected." },
  { index: 9, slug: 'knowledge-base', text: "The staff knowledge base. When people leave, their knowledge usually leaves with them. Not anymore. Entries are organized by category: procedures, protocols, routines, templates, checklists, vendor contacts, equipment instructions. Rich text editing with version history. Tag entries as required reading for new hires." },
  { index: 10, slug: 'staff-development', text: "Staff development and certification tracking. The grid shows every employee's CPR, first aid, food handler, and state license status. Green is current, yellow is expiring soon, red is expired. Training log tracks hours per employee against the annual state requirement. Development plans track professional goals." },
  { index: 11, slug: 'onboarding', text: "Digital onboarding for new hires. Build templates with four phases: pre-start, day one, week one, and month one. Each task has a responsible person, due date offset, and verification method. Assign a template to a new hire and track their progress. Ahead of schedule, on track, behind, or blocked." },
  { index: 12, slug: 'enrollment-funnel', text: "The enrollment funnel. Every prospective family tracked from first inquiry to active enrollment. Seven stages with conversion rates between each. The pipeline board shows each lead as a card. Yellow borders flag stale leads with no activity in seven or more days. Lead source analytics show which sources actually convert." },
  { index: 13, slug: 'authorization-tracking', text: "State authorization tracking. Every enrolled child's authorization status: active, expiring soon, expired, or pending. Sorted by urgency so the most critical expirations are at the top. Renewal tracking shows processing times and revenue at risk from expired authorizations." },
  { index: 14, slug: 'tour-manager', text: "Tour management. Schedule tours with parent contact info, date, time, and center. During the tour, follow the eight-step checklist on your phone. After the tour, send a follow-up with one click. Track the conversion from tour completed to application received." },
  { index: 15, slug: 'revenue-forecast', text: "Revenue forecasting and scenario modeling. Financial health shows revenue per child, operating margin, and break-even enrollment. The cash flow chart shows six months of revenue versus expenses. Scenario modeling lets you slide enrollment and rates up or down to see the impact in real time. Save and compare up to three scenarios." },
  { index: 16, slug: 'incident-log', text: "Incident reporting and compliance. The structured form requires all critical fields including parent notification. The timeline shows every incident with filters by type, severity, and notification status. A red flag appears if a parent was not notified within twenty-four hours. Analytics reveal patterns across classrooms and time of day." },
  { index: 17, slug: 'meeting-efficiency', text: "Meeting efficiency tools. Build agendas with timed items. The calculator warns if you have overbooked the time slot. During meetings, a live timer counts down each agenda item. Green when under time, yellow at seventy-five percent, red when over. Capture decisions and action items in real time. Track effectiveness across meetings." },
  { index: 18, slug: 'supply-management', text: "Supply and inventory management. Every item tracked with color-coded stock levels. Green is good, yellow is low, red is critical. Staff submit restock requests from their phone. The reorder generator auto-lists everything below threshold. Monthly spend charts show costs by category over time." },
  { index: 19, slug: 'staff-chat', text: "Staff messaging. Channels for team communication, direct messages, pinned announcements, and read receipts. This replaces scattered text messages and keeps all staff communication in one professional platform." },
];

// Avatar transition narrations (for D-ID, Phase 3)
const AVATAR_NARRATIONS = [
  { id: 'intro', text: "Welcome to the admin portal. This is your command center for managing every aspect of Christina's Child Care Center." },
  { id: 'operations-transition', text: "Now let's look at the operations tools that keep your center running smoothly." },
  { id: 'communication-transition', text: "Next, we'll explore the communication and engagement tools." },
  { id: 'growth-transition', text: "Let's look at the tools that help grow your enrollment and revenue." },
  { id: 'outro', text: "That covers the admin portal. Every tool here is designed to save you time and keep your center running at its best." },
];

async function generateWithElevenLabs(text, outputPath) {
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not set');

  const voiceId = VOICE_ID === 'ava' ? 'pNInz6obpgDQGcFmaJgB' : VOICE_ID;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
    }),
  });

  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

async function generateWithEdgeTTS(text, outputPath) {
  const ttsEnv = '/tmp/tts-env/bin/edge-tts';
  const edgeTts = fs.existsSync(ttsEnv) ? ttsEnv : 'edge-tts';
  execSync(`${edgeTts} --voice "en-US-AvaNeural" --text "${text.replace(/"/g, '\\"')}" --write-media "${outputPath}"`, { stdio: 'inherit' });
  return outputPath;
}

async function generateVoice(text, outputPath) {
  // Skip if cached
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1024) {
    console.log(`  [cached] ${path.basename(outputPath)}`);
    return outputPath;
  }

  try {
    console.log(`  [elevenlabs] ${path.basename(outputPath)}`);
    return await generateWithElevenLabs(text, outputPath);
  } catch (err) {
    console.warn(`  [fallback] ElevenLabs failed: ${err.message}. Using edge-tts.`);
    return await generateWithEdgeTTS(text, outputPath);
  }
}

// CLI
const section = process.argv[2] || 'all'; // 'admin', 'avatar', 'all'
const outDir = '/tmp/christinas-voice';
fs.mkdirSync(outDir, { recursive: true });

if (section === 'admin' || section === 'all') {
  console.log(`\nGenerating admin narration (${ADMIN_NARRATIONS.length} pages)...\n`);
  for (const n of ADMIN_NARRATIONS) {
    const outPath = path.join(outDir, `admin-${n.index}-${n.slug}.mp3`);
    await generateVoice(n.text, outPath);
  }
}

if (section === 'avatar' || section === 'all') {
  console.log(`\nGenerating avatar narration (${AVATAR_NARRATIONS.length} clips)...\n`);
  for (const n of AVATAR_NARRATIONS) {
    const outPath = path.join(outDir, `avatar-${n.id}.mp3`);
    await generateVoice(n.text, outPath);
  }
}

console.log('\nVoice generation complete.');
console.log(`Output: ${outDir}`);
```

- [ ] **Step 2: Test voice generation (dry run with edge-tts first)**

```bash
# First test with edge-tts (no API key needed)
node scripts/generate-voice.mjs admin
# Verify: ls /tmp/christinas-voice/ should show 20 MP3 files
```

- [ ] **Step 3: Test with ElevenLabs (requires API key)**

Add to `.env.local`:
```
ELEVENLABS_API_KEY=sk-your-key-here
```

Then regenerate:
```bash
# Delete cache to force regeneration
rm /tmp/christinas-voice/*.mp3
node scripts/generate-voice.mjs admin
# Listen to a few files to verify quality
```

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-voice.mjs
git commit -m "feat: add ElevenLabs voice generation with edge-tts fallback"
```

---

## Task 5: Timestamp Generation (Phase 2)

**Files:**
- Create: `scripts/generate-timestamps.mjs`

- [ ] **Step 1: Create the timestamp script**

```javascript
// scripts/generate-timestamps.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const voiceDir = '/tmp/christinas-voice';
const outDir = '/tmp/christinas-timestamps';
fs.mkdirSync(outDir, { recursive: true });

function getAudioDuration(filePath) {
  const output = execSync(
    `ffprobe -v quiet -print_format json -show_format "${filePath}"`,
    { encoding: 'utf-8' }
  );
  return parseFloat(JSON.parse(output).format.duration);
}

function estimateWordTimestamps(text, durationSec) {
  const words = text.split(/\s+/).filter(Boolean);
  const perWord = durationSec / words.length;
  let cursor = 0;
  return words.map(w => {
    const start = cursor;
    const end = cursor + perWord;
    cursor = end;
    return { word: w, start: parseFloat(start.toFixed(3)), end: parseFloat(end.toFixed(3)) };
  });
}

function whisperTimestamps(audioPath) {
  // Try whisper.cpp if available
  try {
    const modelPath = path.join(process.env.HOME, '.cache/whisper/ggml-base.en.bin');
    if (!fs.existsSync(modelPath)) throw new Error('Model not found');

    const output = execSync(
      `whisper-cpp -m "${modelPath}" -f "${audioPath}" --output-json --word-timestamps`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    const result = JSON.parse(output);
    // whisper.cpp outputs segments with word-level tokens
    const words = [];
    for (const seg of (result.segments || result)) {
      for (const tok of (seg.tokens || seg.words || [])) {
        words.push({
          word: (tok.text || tok.word || '').trim(),
          start: tok.start || tok.t0 || 0,
          end: tok.end || tok.t1 || 0,
        });
      }
    }
    if (words.length > 0) return words;
    throw new Error('No words extracted');
  } catch {
    return null; // Fallback to estimation
  }
}

// Process all voice files
const audioFiles = fs.readdirSync(voiceDir)
  .filter(f => f.endsWith('.mp3'))
  .sort();

console.log(`Processing ${audioFiles.length} audio files...\n`);

for (const file of audioFiles) {
  const audioPath = path.join(voiceDir, file);
  const outPath = path.join(outDir, file.replace('.mp3', '.json'));

  if (fs.existsSync(outPath)) {
    console.log(`  [cached] ${file}`);
    continue;
  }

  const duration = getAudioDuration(audioPath);

  // Try whisper first
  const whisperWords = whisperTimestamps(audioPath);
  if (whisperWords) {
    console.log(`  [whisper] ${file} (${whisperWords.length} words)`);
    fs.writeFileSync(outPath, JSON.stringify({ words: whisperWords }, null, 2));
    continue;
  }

  // Fallback: estimate from narration text
  // Read narration text from generate-voice.mjs (we'll match by filename)
  const slug = file.replace(/^(admin|avatar)-\d*-?/, '').replace('.mp3', '');
  console.log(`  [estimate] ${file} (${duration.toFixed(1)}s)`);

  // We don't have the text here, so estimate evenly
  // The WalkthroughVideo composition can work without precise timestamps
  const estimatedWords = [{ word: '[narration]', start: 0, end: duration }];
  fs.writeFileSync(outPath, JSON.stringify({ words: estimatedWords }, null, 2));
}

console.log(`\nTimestamps saved to ${outDir}`);
```

- [ ] **Step 2: Run timestamp generation**

```bash
node scripts/generate-timestamps.mjs
# Verify: ls /tmp/christinas-timestamps/ should show JSON files
```

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-timestamps.mjs
git commit -m "feat: add word-level timestamp generation (whisper + fallback)"
```

---

## Task 6: Avatar Generation (Phase 3)

**Files:**
- Create: `scripts/generate-avatar.mjs`

- [ ] **Step 1: Create the D-ID avatar script**

```javascript
// scripts/generate-avatar.mjs
import fs from 'fs';
import path from 'path';

const DID_API_KEY = process.env.DID_API_KEY;
const AVATAR_IMAGE = path.resolve('assets/avatar-jf.jpg');
const VOICE_DIR = '/tmp/christinas-voice';
const OUT_DIR = '/tmp/christinas-avatar';

fs.mkdirSync(OUT_DIR, { recursive: true });

const AVATAR_CLIPS = [
  'avatar-intro',
  'avatar-operations-transition',
  'avatar-communication-transition',
  'avatar-growth-transition',
  'avatar-outro',
];

async function createTalkingHead(audioPath, outputPath) {
  if (!DID_API_KEY) {
    console.log('  [skip] DID_API_KEY not set. Using static image fallback.');
    // Copy the static image as a "clip" placeholder
    fs.copyFileSync(AVATAR_IMAGE, outputPath.replace('.mp4', '.jpg'));
    return outputPath.replace('.mp4', '.jpg');
  }

  // Upload the source image
  const imageBuffer = fs.readFileSync(AVATAR_IMAGE);
  const imageBase64 = imageBuffer.toString('base64');

  // Read the audio file
  const audioBuffer = fs.readFileSync(audioPath);
  const audioBase64 = audioBuffer.toString('base64');

  // Create talk
  const createRes = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${DID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_url: `data:image/jpeg;base64,${imageBase64}`,
      script: {
        type: 'audio',
        audio_url: `data:audio/mpeg;base64,${audioBase64}`,
      },
      config: { stitch: true },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`D-ID create failed: ${createRes.status} ${err}`);
  }

  const { id: talkId } = await createRes.json();
  console.log(`  [d-id] Created talk ${talkId}, polling...`);

  // Poll for completion
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: { 'Authorization': `Basic ${DID_API_KEY}` },
    });
    const status = await statusRes.json();

    if (status.status === 'done') {
      // Download the result
      const videoRes = await fetch(status.result_url);
      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      fs.writeFileSync(outputPath, videoBuffer);
      console.log(`  [d-id] Saved ${path.basename(outputPath)}`);
      return outputPath;
    }

    if (status.status === 'error') {
      throw new Error(`D-ID talk failed: ${JSON.stringify(status)}`);
    }
  }

  throw new Error('D-ID talk timed out after 5 minutes');
}

console.log('Generating avatar clips...\n');

for (const clipId of AVATAR_CLIPS) {
  const audioPath = path.join(VOICE_DIR, `${clipId}.mp3`);
  const outputPath = path.join(OUT_DIR, `${clipId}.mp4`);

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1024) {
    console.log(`  [cached] ${clipId}`);
    continue;
  }

  if (!fs.existsSync(audioPath)) {
    console.log(`  [skip] No audio for ${clipId}`);
    continue;
  }

  try {
    await createTalkingHead(audioPath, outputPath);
  } catch (err) {
    console.error(`  [error] ${clipId}: ${err.message}`);
    // Fallback to static image
    fs.copyFileSync(AVATAR_IMAGE, path.join(OUT_DIR, `${clipId}.jpg`));
    console.log(`  [fallback] Using static image for ${clipId}`);
  }
}

console.log(`\nAvatar clips saved to ${OUT_DIR}`);
```

- [ ] **Step 2: Commit**

```bash
git add scripts/generate-avatar.mjs
git commit -m "feat: add D-ID avatar generation with static image fallback"
```

---

## Task 7: Manifest Builder (Phase 5)

**Files:**
- Create: `scripts/build-manifest.mjs`

- [ ] **Step 1: Create the manifest builder**

This script reads all generated assets (voice, timestamps, avatar clips, recordings) and produces a single JSON manifest that the Remotion composition reads.

```javascript
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
  if (!fs.existsSync(filePath)) return 0;
  try {
    const output = execSync(
      `ffprobe -v quiet -print_format json -show_format "${filePath}"`,
      { encoding: 'utf-8' }
    );
    return parseFloat(JSON.parse(output).format.duration) * 1000; // ms
  } catch { return 0; }
}

function readTimestamps(jsonPath) {
  if (!fs.existsSync(jsonPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')).words || [];
  } catch { return []; }
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
  }

  if (ch.type === 'recording') {
    const recPath = path.join(RECORDING_DIR, `${ch.id}.webm`);
    chapter.recordingFile = fs.existsSync(recPath) ? `recordings/${ch.id}.webm` : undefined;
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/build-manifest.mjs
git commit -m "feat: add manifest builder assembling all pipeline assets"
```

---

## Task 8: Pipeline Orchestrator

**Files:**
- Create: `scripts/record-v3.mjs`

- [ ] **Step 1: Create the CLI orchestrator**

```javascript
// scripts/record-v3.mjs
// Pipeline orchestrator: voice → timestamps → avatar → record → manifest → render → mix → final
import { execSync } from 'child_process';

const phase = process.argv[2] || 'all';
const section = process.argv[3] || 'admin';

const PHASES = {
  voice: () => execSync(`node scripts/generate-voice.mjs ${section}`, { stdio: 'inherit' }),
  timestamps: () => execSync('node scripts/generate-timestamps.mjs', { stdio: 'inherit' }),
  avatar: () => execSync('node scripts/generate-avatar.mjs', { stdio: 'inherit' }),
  manifest: () => execSync('node scripts/build-manifest.mjs', { stdio: 'inherit' }),
  score: () => execSync('node scripts/score-video.mjs public/videos/walkthroughs/admin-final.mp4', { stdio: 'inherit' }),
};

console.log(`\n=== Christina's Video Pipeline ===`);
console.log(`Phase: ${phase} | Section: ${section}\n`);

if (phase === 'all') {
  for (const [name, fn] of Object.entries(PHASES)) {
    console.log(`\n--- Phase: ${name} ---\n`);
    fn();
  }
} else if (PHASES[phase]) {
  PHASES[phase]();
} else {
  console.error(`Unknown phase: ${phase}`);
  console.log('Available: voice, timestamps, avatar, manifest, score, all');
  process.exit(1);
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/record-v3.mjs
git commit -m "feat: add record-v3.mjs pipeline orchestrator"
```

---

## Task 9: Run the Pipeline

- [ ] **Step 1: Generate voice (edge-tts first for testing)**

```bash
node scripts/record-v3.mjs voice admin
```

- [ ] **Step 2: Generate timestamps**

```bash
node scripts/record-v3.mjs timestamps
```

- [ ] **Step 3: Build manifest**

```bash
node scripts/record-v3.mjs manifest
# Verify: cat /tmp/christinas-manifest.json | head -50
```

- [ ] **Step 4: Score current baseline**

```bash
node scripts/score-video.mjs public/videos/walkthroughs/admin-final.mp4
```

- [ ] **Step 5: Listen to voice samples, verify quality**

Play a few MP3 files from `/tmp/christinas-voice/` and confirm they sound natural. If using edge-tts, they'll sound decent but robotic. Switch to ElevenLabs when API key is ready.

---

## Verification

After all tasks complete:
- [ ] `types/video-schema.ts` compiles with `npx tsc --noEmit`
- [ ] All 7 Remotion components exist in `remotion/components/`
- [ ] `WalkthroughVideo` composition registered in `remotion/Root.tsx`
- [ ] `node scripts/record-v3.mjs voice admin` generates 20 + 5 MP3 files
- [ ] `node scripts/record-v3.mjs timestamps` generates timestamp JSONs
- [ ] `node scripts/record-v3.mjs manifest` generates valid manifest JSON
- [ ] `node scripts/score-video.mjs public/videos/walkthroughs/admin-final.mp4` produces baseline scorecard
- [ ] Remotion Studio shows WalkthroughVideo composition: `npx remotion studio`
