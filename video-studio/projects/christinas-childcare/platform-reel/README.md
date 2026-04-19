# Platform Reel v1

The Facebook / Instagram / LinkedIn / YouTube ad for Christina's Platform.

## Folders

- `script/SCRIPT.md` — Shot-by-shot script, five VO lines, brand tokens.
- `illustrations/BRIEF.md` — Five illustration prompts and art direction.
- `illustrations/` — Place `frame_01.png` through `frame_05.png` and `christina-headshot.jpg` here.
- `captions/captions.srt` — Timed captions for sound-off playback.
- `output/` — Rendered MP4 masters land here.

## Render

The Remotion composition `PlatformReelV1` renders this reel. Text-only by default. When illustrations exist, they are loaded by the composition from the `illustrations/` folder.

```bash
# Studio preview
npm run remotion:studio
# Then select "PlatformReelV1" in the Studio UI.

# Render the 9:16 master
npx remotion render remotion/index.tsx PlatformReelV1 \
  video-studio/projects/christinas-childcare/platform-reel/output/platform-reel-9x16.mp4
```

## Delivery targets

- 9:16 (1080x1920) — Facebook/Instagram Reels, TikTok
- 1:1 (1080x1080) — Facebook feed
- 16:9 (1920x1080) — LinkedIn feed, YouTube pre-roll

Generate the 1:1 and 16:9 cuts by creating sibling compositions or by post-render cropping. For v1 the simplest path is to render 9:16 once and letterbox-crop afterwards.

## Open items before publish

- Christina records the five VO lines.
- Illustrator produces the five frames.
- Christina's real headshot is supplied.
- Email inbox `hello@christinaschildcare.com` is confirmed to exist and routes to a human (used by the `/platform` CTA).
