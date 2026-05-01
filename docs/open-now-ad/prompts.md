# Gemini Veo 3.1 Prompts — "Open Now" Ad

Copy / paste each prompt into the Gemini app one at a time. Generate.
Save the resulting MP4 with the exact filename listed below the prompt.

**Common settings to ask Gemini for:**
- 9:16 vertical / portrait / TikTok-Reels-Stories format
- ~6-8 seconds duration
- No text overlays, no subtitles, no captions
- Realistic UGC / iPhone-selfie aesthetic

If a clip doesn't look right (face wrong, weird motion, captions burned
in, off-aspect), re-roll with the same prompt — Veo varies per generation.

---

## Anchor character description

Use this exact description in every prompt so the mom looks consistent
across all 4 clips:

> **A 35-year-old working mother with mid-tone skin, dark shoulder-length
> hair pulled back loosely, light freckles, brown eyes, no makeup. She
> wears a heather grey crewneck sweatshirt. Visible pores, slight
> unevenness in skin tone, minor undereye shadows from a tired morning,
> hint of natural skin shine. She speaks with a warm Minnesota accent.
> She looks like a real working parent, not a model. She is filming herself
> on her iPhone front camera in her sun-lit suburban kitchen at 7 AM.**

---

## Clip 1 — HOOK (~3-4 seconds)

**Save as:** `clip-01-hook.mp4`

```
A 35-year-old working mother with mid-tone skin, dark shoulder-length hair
pulled back loosely, light freckles, brown eyes, no makeup, wearing a
heather grey crewneck sweatshirt. Visible pores, slight unevenness in skin
tone, minor undereye shadows from a tired morning, hint of natural skin
shine. She is in her sun-lit suburban kitchen at 7 AM, holding a coffee
mug in her left hand, filming herself on her iPhone front camera. She
looks directly into the lens with a warm but excited expression and says
in a natural Minnesota accent: "Christina's just opened a second location,
and I had to tell you." She breaks eye contact briefly to glance at her
coffee on the words "second location," then looks back to the camera and
leans slightly forward on "I had to tell you." Her free hand comes up
briefly in a small gesture. Background: kitchen window with morning light,
slightly out of focus. Camera: iPhone front camera, slightly off-center
framing, very light hand-held motion blur. 9:16 vertical portrait.
Realistic UGC selfie video, not glossy or polished. No text overlay,
no captions, no subtitles.
```

---

## Clip 2 — SOLUTION VO (~6-7 seconds)

**Save as:** `clip-02-solution.mp4`

This clip's audio plays under photo cuts (her face is mostly off-screen
on the final composition). Generate with her looking off-camera most of
the clip so when we crop to her audio over the photos, the lips don't
fight the visuals.

```
Same 35-year-old working mother in the same sun-lit suburban kitchen,
heather grey crewneck sweatshirt, hair pulled back, mid-tone skin with
freckles, no makeup, visible pores. She is sitting at the kitchen counter
holding her coffee mug with both hands, looking off-camera to her right
toward something out of frame, with a small reflective smile. She speaks
in the same warm Minnesota voice: "Christina's was different. Every
teacher knew our kids by name. The classrooms felt like home." On the
phrase "felt like home" she glances back to the camera and gives a small
warm nod. Background: same kitchen, morning window light. Camera: iPhone
front camera, slight motion. 9:16 vertical portrait. Realistic UGC selfie
video. No text overlay, no captions, no subtitles.
```

---

## Clip 3 — LOCATIONS VO (~5 seconds)

**Save as:** `clip-03-locations.mp4`

Audio plays under the locations card overlay. Her face is mostly hidden.

```
Same 35-year-old working mother in the same sun-lit suburban kitchen,
heather grey crewneck sweatshirt, hair pulled back. She is now standing
at the counter, looking down at her coffee mug while she pours a small
amount of cream into it. She speaks in the same warm Minnesota voice:
"Both Crystal and Brooklyn Park. Two locations, one family." On the last
word "family" she looks up and smiles softly toward the camera. Background:
same kitchen, morning window light. Camera: iPhone front camera, off-center
framing. 9:16 vertical portrait. Realistic UGC selfie video. No text
overlay, no captions, no subtitles.
```

---

## Clip 4 — CTA CLOSE (~3 seconds)

**Save as:** `clip-04-cta.mp4`

```
Same 35-year-old working mother in the same sun-lit suburban kitchen,
heather grey crewneck sweatshirt, hair pulled back, mid-tone skin with
freckles. She is back at the original opening composition holding her
coffee mug, looking directly into her iPhone camera with a warm,
confident smile. She leans slightly toward the camera and says in her
Minnesota voice: "Tour today." She gives a small confident nod and her
eyes flicker briefly with a smile, then she looks down at her coffee.
Background: same kitchen window light. Camera: iPhone front camera,
slightly off-center. 9:16 vertical portrait. Realistic UGC selfie video.
No text overlay, no captions, no subtitles.
```

---

## Optional: Clip 5 — B-roll competitor exterior (~5 seconds)

**Save as:** `broll/broll-01-competitor.mp4`

Optional — only generate if you want a sterile-feeling competitor B-roll
under scene 2. The composition will still render without it (placeholder
will play).

```
Establishing shot of a generic suburban strip mall daycare in late-autumn
Minnesota. Plain glass storefront with fluorescent interior lighting
visible through the windows, no signage close-ups, no children visible,
overcast cool morning light. Subtle handheld camera drift left-to-right,
about 2 seconds of movement. Color grade cool blue-grey to feel sterile
and uninviting. No text, no captions, no people in the frame. 9:16
vertical portrait.
```

---

## After generating

1. All 5 (or 4) MP4s saved to `~/Downloads/` from Gemini.
2. Move / rename to:
   ```
   christinas-childcare/public/platform-reel/open-now/avatar/clip-0{1..4}-*.mp4
   christinas-childcare/public/platform-reel/open-now/broll/broll-01-competitor.mp4
   ```
   (overwriting the silent placeholder files)
3. Generate the Sarah pillars VO line per the README.
4. Run the render commands per the README.
5. Mobile-preview before publishing.

---

## Re-roll guide

If a clip needs a re-roll:

| Problem | What to add to the prompt |
|---------|---------------------------|
| Face looks too glossy / model-like | "untouched skin, no makeup, real visible pores, NOT a model, NOT polished" |
| Wrong age | "exactly 35 years old, looks like a working mom, not in her 20s" |
| Lip-sync off | regenerate same prompt — usually fixes itself |
| Caption burned in | append "ABSOLUTELY NO TEXT OVERLAY, NO SUBTITLES, NO CAPTIONS, NO WORDS ON SCREEN" |
| Off-aspect | restate "9:16 vertical portrait, NOT 16:9, NOT square" |
| Wrong setting | restate the kitchen description verbatim from the anchor description |
| Voice doesn't sound like Minnesota | append "warm slight upper-Midwest Minnesota accent, NOT Texas, NOT generic American" |
