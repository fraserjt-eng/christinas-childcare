# Design: Admin Portal Walkthrough Video Upgrade

**Date:** 2026-03-29
**Status:** Approved
**Scope:** Replace `public/videos/walkthroughs/admin-final.mp4` with production-grade video
**Test run:** Admin portal only (20 pages). If successful, apply same pipeline to employee and public videos.

---

## Goal

The current admin walkthrough video is a raw Playwright screen recording with Kokoro TTS voiceover. No presenter, no element highlighting, no captions. It looks amateur on the live `/guide` page. Replace it with a professional video that has natural voice, animated avatar presenter during transitions, element highlighting during screen recordings, and karaoke captions throughout.

## Architecture

### 8-Phase Pipeline (`scripts/record-v3.mjs`)

```
Phase 1: VOICE       → ElevenLabs Ava → 20 MP3 files (one per admin page)
Phase 2: TIMESTAMPS  → Whisper word-level alignment → 20 JSON files
Phase 3: AVATAR      → D-ID API → 4-5 short clips (intro, section transitions, outro)
Phase 4: RECORD      → Headed Playwright → 20 screen recordings with element highlights
Phase 5: MANIFEST    → Build JSON manifest linking all assets with timing data
Phase 6: RENDER      → Remotion 7-layer composition → raw video
Phase 7: MIX         → FFmpeg → voice + video merge
Phase 8: FINAL       → FFmpeg encode → public/videos/walkthroughs/admin-final.mp4
```

Each phase is independently re-runnable:
```bash
node scripts/record-v3.mjs --phase voice --section admin
node scripts/record-v3.mjs --phase record --section admin
node scripts/record-v3.mjs --all --section admin
```

### Remotion Layer Stack (`remotion/compositions/WalkthroughVideo.tsx`)

```
Layer 0: Screen recording video (base)
Layer 1: Page transitions (crossfade between pages)
Layer 2: Element highlights (blue glow on narrated UI elements)
Layer 3: Karaoke captions (bottom center, word-by-word highlight)
Layer 4: Avatar PIP (bottom-right circle, intro/transitions/outro only)
Layer 5: Progress bar (thin bar at top, chapter-aware)
```

---

## Voice (Phase 1)

**Provider:** ElevenLabs, Ava voice
**Plan:** Starter tier ($5/mo, 30,000 chars, cancel after one month)
**Model:** `eleven_multilingual_v2`
**Settings:** stability 0.5, similarity_boost 0.75, style 0.3
**Fallback:** edge-tts `en-US-AvaNeural` if API fails
**Output:** `/tmp/christinas-voice/admin-{index}-{slug}.mp3`

**Narration source:** All 20 admin page narrations from `scripts/record-synced.mjs` lines in the `ADMIN_PAGES` array. Preserve existing narration text exactly.

**Env var:** `ELEVENLABS_API_KEY` in `.env.local`

---

## Timestamps (Phase 2)

**Tool:** whisper.cpp with `ggml-base.en.bin` model
**Input:** Each MP3 from Phase 1
**Output:** JSON with word-level timestamps per segment

```json
{
  "words": [
    { "text": "The", "start": 0.0, "end": 0.12 },
    { "text": "dashboard", "start": 0.12, "end": 0.58 }
  ]
}
```

**Fallback:** If whisper.cpp not available, estimate word timing from audio duration divided by word count. Less accurate but functional for captions.

---

## Avatar (Phase 3)

**Provider:** D-ID (free tier, 5 minutes)
**Source image:** `assets/avatar-jf.jpg`
**Strategy:** Avatar appears only during intro, section transitions, and outro. Not during screen recordings.

**Clips to generate (4-5 total, ~2-3 minutes):**

| Clip | Duration | Narration |
|------|----------|-----------|
| Intro | ~15s | "Welcome to the admin portal. This is your command center for managing every aspect of Christina's Child Care Center." |
| Operations transition | ~10s | "Now let's look at the operations tools that keep your center running smoothly." |
| Communication transition | ~10s | "Next, we'll explore the communication and engagement tools." |
| Growth transition | ~10s | "Let's look at the tools that help grow your enrollment and revenue." |
| Outro | ~15s | "That covers the admin portal. Every tool here is designed to save you time and keep your center running at its best." |

**Output:** MP4 clips with transparent or solid background, cropped to square for PIP circle.

**D-ID API flow:**
1. Upload avatar image
2. For each clip: POST to create talk with audio + image
3. Poll for completion
4. Download result MP4

---

## Screen Recording (Phase 4)

**Tool:** Playwright (headed mode with GPU)

**Launch config:**
```javascript
{
  headless: false,
  args: ['--use-gl=angle', '--enable-gpu-rasterization', '--force-device-scale-factor=2']
}
```

**Viewport:** 1920x1080, deviceScaleFactor 2

**Per-page recording flow:**
1. Navigate to page
2. Wait for load + 1 second settle
3. For the 5 priority pages: scroll to each CSS selector, inject blue glow highlight, hold 5 seconds
4. For the other 15 pages: smooth auto-scroll top to bottom at steady pace
5. Save as WebM

**5 priority pages with CSS selector segments:**
1. `/admin` (dashboard) - `.dashboard-stats`, `.attendance-widget`, `.quick-actions`
2. `/admin/food-counts` - `.meal-count-grid`, `.compliance-score`
3. `/admin/attendance` - `.attendance-table`, `.filter-controls`
4. `/admin/scheduling` - `.schedule-board`, `.shift-controls`
5. `/admin/families` - `.family-table`, `.pending-approvals`

**Element highlight injection:**
```javascript
el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
el.style.outline = '2px solid #3B82F6';
```

**Output:** `/tmp/christinas-recordings/admin-{index}-{slug}.webm`

---

## Manifest (Phase 5)

Bridge JSON linking all assets with timing data. One manifest per video. Phase 5 reads the per-page audio files, timestamp JSONs, recording files, and avatar clips, then assembles them into a single manifest with cumulative timing offsets.

```json
{
  "id": "admin-walkthrough",
  "title": "Admin Portal Guide",
  "branding": {
    "primaryColor": "#C62828",
    "secondaryColor": "#2196F3",
    "backgroundColor": "#FDFBF7",
    "centerName": "Christina's Child Care Center"
  },
  "chapters": [
    {
      "id": "intro",
      "type": "avatar",
      "avatarClip": "intro.mp4",
      "audioFile": "intro.mp3",
      "durationMs": 15000,
      "words": [...]
    },
    {
      "id": "dashboard",
      "type": "recording",
      "recordingFile": "admin-0-dashboard.webm",
      "audioFile": "admin-0-dashboard.mp3",
      "durationMs": 25000,
      "words": [...],
      "highlights": [
        { "selector": ".dashboard-stats", "startMs": 2000, "endMs": 8000 }
      ]
    }
  ]
}
```

---

## Remotion Components (Phase 6)

### Port from video-studio (`~/Desktop/video-studio/remotion/components/`):

| Component | Purpose | Modifications needed |
|-----------|---------|---------------------|
| `BrandedTitleCard.tsx` | Animated intro card | Rebrand to Christina's red (#C62828), "C" initial |
| `ChapterCard.tsx` | Section transition card | Rebrand colors |
| `ElementHighlight.tsx` | Blue glow on UI elements | Use as-is |
| `KaraokeCaption.tsx` | Word-by-word captions | Use as-is |
| `PageTransition.tsx` | Crossfade between pages | Use as-is |
| `ProgressBar.tsx` | Chapter-aware progress | Rebrand color |

### New components to create:

| Component | Purpose |
|-----------|---------|
| `AvatarPIP.tsx` | Circular PIP overlay with fade in/out, positioned bottom-right |

### NOT building (test run scope):

- `CursorOverlay.tsx` (adds complexity, highlight boxes serve same purpose)
- `ClickRipple.tsx` (polish, not essential)
- `ZoomLens.tsx` (can add in second pass)

### New composition: `WalkthroughVideo.tsx`

Reads the manifest JSON. Sequences chapters in order. For each chapter:
- If `type: "avatar"`: render avatar clip full-width with branded background + captions
- If `type: "recording"`: render screen recording with highlight overlays + captions
- Between chapters: crossfade transition (0.5s)
- Throughout: progress bar at top, karaoke captions at bottom

---

## Audio Mix (Phase 7)

Simple FFmpeg merge of all segment audio files into one continuous track matching the video timeline. No background music in the test run.

```bash
ffmpeg -f concat -safe 0 -i segments.txt -c:a aac -b:a 192k admin-audio.m4a
```

---

## Final Encode (Phase 8)

```bash
ffmpeg -i render.mp4 -i admin-audio.m4a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -movflags +faststart \
  -y public/videos/walkthroughs/admin-final.mp4
```

---

## Video Quality Scorecard

Runs automatically after Phase 8. Scores the output video on 7 dimensions.

### Dimensions (10 points each, 70 max)

| # | Dimension | Tool | Scoring |
|---|-----------|------|---------|
| 1 | **Encoding Quality** | VMAF via `ffmpeg-quality-metrics` | VMAF 90+ = 10, 80+ = 8, 70+ = 6, <70 = 4 |
| 2 | **Audio Quality** | NISQA speech assessment | MOS 4.0+ = 10, 3.5+ = 8, 3.0+ = 6, <3.0 = 4 |
| 3 | **A/V Sync** | ffsubsync RMSE | <100ms = 10, <200ms = 8, <500ms = 6, >500ms = 2 |
| 4 | **Pacing** | Custom: silence detection + time-per-page | No silence >3s AND no page >45s = 10; violations subtract 2 each |
| 5 | **Coverage** | Whisper transcript vs page list | 100% pages mentioned = 10; subtract 0.5 per missing page |
| 6 | **Visual Clarity** | SSIM + resolution check | 1080p + SSIM >0.95 = 10; 720p or SSIM <0.9 = 6 |
| 7 | **Accessibility** | Caption existence + sync + contrast | Captions present + synced + readable = 10; missing captions = 0 |

### Tiers

- 60-70: Production-ready (ship it)
- 50-59: Good (minor fixes needed)
- 40-49: Acceptable (needs polish)
- Below 40: Reshoot

### Implementation

`scripts/score-video.mjs` takes a video path, runs all automated checks, produces:
- Terminal output with scores
- `public/videos/walkthroughs/admin-scorecard.md` with full breakdown

### Baseline

Score the CURRENT `admin-final.mp4` first. This establishes the "before" number. Expected score: ~25-30/70 (no captions, robotic voice, soft encoding, no highlights).

---

## Files to Create

| File | Purpose |
|------|---------|
| `scripts/record-v3.mjs` | New 8-phase pipeline |
| `scripts/score-video.mjs` | Video quality scorecard |
| `remotion/compositions/WalkthroughVideo.tsx` | 7-layer composition |
| `remotion/components/AvatarPIP.tsx` | Avatar picture-in-picture |
| `remotion/components/BrandedTitleCard.tsx` | Port + rebrand from video-studio |
| `remotion/components/ChapterCard.tsx` | Port from video-studio |
| `remotion/components/ElementHighlight.tsx` | Port from video-studio |
| `remotion/components/KaraokeCaption.tsx` | Port from video-studio |
| `remotion/components/PageTransition.tsx` | Port from video-studio |
| `remotion/components/ProgressBar.tsx` | Port from video-studio |
| `types/video-schema.ts` | Type definitions for manifest |
| `assets/avatar-jf.jpg` | Avatar source image (already saved) |

## Files to Modify

| File | Change |
|------|--------|
| `remotion/Root.tsx` | Register WalkthroughVideo composition |
| `package.json` | Add ffmpeg-quality-metrics, elevenlabs deps if needed |
| `.env.local` | Add ELEVENLABS_API_KEY, DID_API_KEY |

## Files NOT to Modify

| File | Reason |
|------|--------|
| `scripts/record-synced.mjs` | Keep as fallback |
| `public/videos/final/*` | Feature videos are separate |
| `remotion/compositions/ScreenRecordingVideo.tsx` | Existing, don't break |

---

## Cost

| Item | Cost | Notes |
|------|------|-------|
| ElevenLabs Starter | $5/mo | Cancel after 1 month |
| D-ID free tier | $0 | 5 minutes, enough for intro/transitions/outro |
| VMAF/NISQA/whisper | $0 | Open source tools |
| **Total** | **$5** | One-time |

---

## Success Criteria

1. New video scores 55+ on the scorecard (current expected: ~25-30)
2. Voice sounds natural, not robotic
3. Avatar appears during intro and transitions, not during screen recordings
4. UI elements are highlighted when being narrated
5. Karaoke captions are present and synced
6. Video plays correctly on the `/guide` page
7. File size is reasonable (<50MB for a 10-15 minute video)

---

## Implementation Order

1. Score current video (baseline)
2. Phase 1: Voice generation (ElevenLabs)
3. Phase 2: Word timestamps (whisper)
4. Phase 3: Avatar clips (D-ID)
5. Port Remotion components from video-studio
6. Build WalkthroughVideo.tsx composition
7. Phase 4: Screen recordings (Playwright)
8. Phase 5: Build manifest
9. Phase 6-8: Render, mix, encode
10. Score new video (compare to baseline)
11. Deploy to `/guide` page
