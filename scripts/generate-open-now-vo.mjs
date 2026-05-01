#!/usr/bin/env node
// One-shot VO generator for the Open Now ad's pillar line. Uses the same
// ElevenLabs voice (Jessica) as the platform-reel-v3 script for continuity.
// Reads ELEVENLABS_API_KEY from .env.local. Writes to
// public/platform-reel/vo/open-now-pillars.mp3.

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT_DIR = resolve(ROOT, 'public/platform-reel/vo');
const OUT_PATH = resolve(OUT_DIR, 'open-now-pillars.mp3');
mkdirSync(OUT_DIR, { recursive: true });

const envText = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
const keyMatch = envText.match(/^ELEVENLABS_API_KEY=(.+)$/m);
if (!keyMatch) {
  console.error('ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}
const API_KEY = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');

// Same Jessica voice + settings as generate-platform-reel-vo.mjs.
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';
const MODEL_ID = 'eleven_multilingual_v2';

const LINE = 'Warm, qualified staff. Full-spectrum programs. Nourished and active.';

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
  method: 'POST',
  headers: {
    'xi-api-key': API_KEY,
    'Content-Type': 'application/json',
    Accept: 'audio/mpeg',
  },
  body: JSON.stringify({
    text: LINE,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.15,
      use_speaker_boost: true,
    },
  }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`TTS ${res.status}: ${body.slice(0, 300)}`);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
writeFileSync(OUT_PATH, buf);
console.log(`open-now-pillars.mp3 ${buf.byteLength} bytes  "${LINE}"`);
