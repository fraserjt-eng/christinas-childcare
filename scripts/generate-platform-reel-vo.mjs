#!/usr/bin/env node
// Generate the 10 platform-reel-v3 VO lines as MP3s via ElevenLabs (Sarah voice).

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = resolve(ROOT, 'public/platform-reel/vo');
mkdirSync(OUT, { recursive: true });

// Load API key from .env.local
const envPath = resolve(ROOT, '.env.local');
const envText = readFileSync(envPath, 'utf8');
const keyMatch = envText.match(/^ELEVENLABS_API_KEY=(.+)$/m);
if (!keyMatch) {
  console.error('ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}
const API_KEY = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');

// Sarah voice ID — mature, reassuring, confident, professional, American, female
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const MODEL_ID = 'eleven_multilingual_v2';

const LINES = [
  'Two thousand twenty. Crystal, Minnesota.',
  'I opened a center and ran it from a page like this.',
  'Then I got tired of running my center from a spreadsheet and a three ring binder.',
  'So I built this.',
  'Three role based portals. Twenty plus operational tools. Ninety six pages. One system a real center actually runs on.',
  'Scheduling that staffs itself. Parents who see every photo. Compliance that is always audit ready.',
  'Enrollment pipelines. Business reporting. Staff workflows. Every Monday morning, covered.',
  'Built by a director. For directors.',
  'Come see how I run mine.',
  'christinas dash childcare dot vercel dot app slash platform.',
];

async function tts(text, outPath) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
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
    throw new Error(`TTS ${res.status}: ${body}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  return buf.byteLength;
}

for (let i = 0; i < LINES.length; i++) {
  const n = String(i + 1).padStart(2, '0');
  const path = resolve(OUT, `line-${n}.mp3`);
  if (existsSync(path)) {
    console.log(`line-${n}.mp3 already exists, skipping`);
    continue;
  }
  const bytes = await tts(LINES[i], path);
  console.log(`line-${n}.mp3 ${bytes} bytes  "${LINES[i].slice(0, 60)}..."`);
}

console.log('done.');
