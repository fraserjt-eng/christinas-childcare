# "Open Now" Paid-Social Ad — Gemini + Remotion Workflow

9:16 vertical 30s + 15s ad combining live Gemini-generated avatar clips
with the existing platform-reel real photos and a flyer-styled overlay
package.

**Generation tool:** Google Gemini app (Veo 3.1, free tier acceptable).
**Assembly tool:** Remotion (already in this repo).
**Total cost:** $0 if you have a Google account; $20 one-month for Gemini
Advanced if you want higher daily limits.

---

## TL;DR — what you do

1. Open the Gemini app (web or mobile) signed into your Google account.
2. Open `prompts.md` next to this file. Copy prompt 1.
3. Paste into Gemini, request 9:16 portrait (or 720x1280), wait ~1-3 min.
4. Save the generated MP4. Repeat for prompts 2, 3, 4.
5. AirDrop / drag the 4 files into:
   ```
   public/platform-reel/open-now/avatar/
     clip-01-hook.mp4
     clip-02-solution.mp4
     clip-03-locations.mp4
     clip-04-cta.mp4
   ```
   (overwrite the placeholder MP4s)
6. Run the render commands at the bottom of this README.

That's it. The composition file (`remotion/compositions/OpenNowAd.tsx`)
already references those exact paths.

---

## Why Gemini and not Arcads

Arcads wraps the same Veo 3.1 model that powers Gemini, plus a UGC-tuned
prompting library and a paid credit pipeline. For a single 30s ad with
4 short clips the wrapper isn't worth the cost. Gemini gives you the
same model directly. The clips you save are full-quality MP4 with audio
(Veo 3.1 produces dialogue + ambient sound natively).

If we end up making 50 ads a month, switching back to Arcads becomes
worth it for the workflow tooling. For one ad, no.

---

## Gemini-app tips

- **Aspect ratio:** request "9:16 portrait" or "vertical for TikTok / Reels"
  in the prompt itself — Gemini doesn't always have a UI control for it.
- **Duration:** Veo 3.1 caps at 8 seconds per clip. Our longest scripted
  line is ~6s so we're under the cap on every clip.
- **Audio:** Veo 3.1 generates dialogue audio inline. The mom's voice
  comes out of the model — we don't need ElevenLabs for the avatar lines.
- **Re-rolling:** if a clip looks off (eyes wrong, weird hands, off-camera
  framing), regenerate with the same prompt. Veo varies per generation.
- **Same person across clips:** Veo 3.1 doesn't have persistent character
  IDs. To keep the mom looking like the same person across all 4 clips,
  the prompts use very specific physical descriptors and identical
  setting / wardrobe / lighting language. Generate clip 1 first, lock it
  in, then use the same prompt skeleton for clips 2-4.
- **No subtitles:** every prompt explicitly asks for no captions / no
  text overlay. Gemini sometimes still burns one in — re-roll if it does.

---

## Asset map

| Path | Source | Status |
|------|--------|--------|
| `public/platform-reel/open-now/avatar/clip-01-hook.mp4` | Gemini Veo 3.1 (you) | placeholder |
| `public/platform-reel/open-now/avatar/clip-02-solution.mp4` | Gemini Veo 3.1 (you) | placeholder |
| `public/platform-reel/open-now/avatar/clip-03-locations.mp4` | Gemini Veo 3.1 (you) | placeholder |
| `public/platform-reel/open-now/avatar/clip-04-cta.mp4` | Gemini Veo 3.1 (you) | placeholder |
| `public/platform-reel/open-now/broll/broll-01-competitor.mp4` | Optional Gemini B-roll | placeholder |
| `public/platform-reel/africa-mural.jpg` | Real Christina's photo | already in repo |
| `public/platform-reel/center-kids.jpg` | Real Christina's photo | already in repo |
| `public/platform-reel/center-family.jpg` | Real Christina's photo | already in repo |
| `public/platform-reel/vo/open-now-pillars.mp3` | ElevenLabs Sarah (script below) | placeholder |
| `public/platform-reel/music.mp3` | Existing ambient bed | already in repo |

---

## Sarah VO for the proof scene (one line, ~6 seconds)

The proof scene (0:14–0:20) needs a Sarah voiceover. Generate with your
existing pipeline:

```bash
cd "<this repo>"
node scripts/generate-platform-reel-vo.mjs --line open-now-pillars \
  --text "Warm, qualified staff. Full-spectrum programs. Nourished and active." \
  --out public/platform-reel/vo/open-now-pillars.mp3
```

(If your generate-platform-reel-vo.mjs takes different flags, see the
existing line-01.mp3 entries for the pattern. Worst case, generate
manually with ElevenLabs Sarah `EXAVITQu4vr4xnSDxMaL` and drop the file
at the path above.)

---

## Render commands

After dropping the 4 avatar clips into the avatar folder:

```bash
cd "<this repo>"

# Preview live in the studio
npx remotion studio

# Render the 30s primary cut
npx remotion render remotion/index.tsx OpenNowAd30s \
  public/platform-reel/open-now/output/open-now-30s-9x16.mp4

# Render the 15s short cut
npx remotion render remotion/index.tsx OpenNowAd15s \
  public/platform-reel/open-now/output/open-now-15s-9x16.mp4

# Optional quality score (target >= 55/70)
node scripts/score-video.mjs public/platform-reel/open-now/output/open-now-30s-9x16.mp4
```

---

## Composition timing reference

| Time | Scene | What plays | Source |
|------|-------|-----------|--------|
| 0:00–0:03 | HOOK | Mom on camera + corner Open Now chip | Gemini clip-01 |
| 0:03–0:08 | PROBLEM | Cool-graded competitor exterior B-roll | Gemini broll-01 (optional) |
| 0:08–0:14 | SOLUTION | 3 real photos with Ken Burns + mom VO | Gemini clip-02 (audio) + real photos |
| 0:14–0:20 | PROOF | Three flyer pillars + Sarah VO | Built-in overlay + Sarah mp3 |
| 0:20–0:25 | LOCATIONS | Teal locations card + mom VO | Built-in overlay + Gemini clip-03 (audio) |
| 0:25–0:30 | CTA | End card + mom "Tour today" | Built-in overlay + Gemini clip-04 |

---

## Mobile preview before paid spend

Before uploading to Meta Ads Manager:

1. AirDrop the 30s MP4 to your phone.
2. Watch full-screen on actual device. The flyer palette and lockups
   need to read at thumb-scroll speed.
3. Mute and re-watch. The visual story should still land without sound
   (most people scroll muted).
4. Watch with sound. Lip-sync should match. Sarah VO and ambient bed
   should sit under the dialog, not compete.

If anything misses, re-roll the affected Gemini clip and re-render.
