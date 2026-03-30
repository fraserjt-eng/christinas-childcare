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

  // Poll for completion (5s intervals, max 60 attempts = 5 minutes)
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
    // Fallback to static image, don't abort the pipeline
    fs.copyFileSync(AVATAR_IMAGE, path.join(OUT_DIR, `${clipId}.jpg`));
    console.log(`  [fallback] Using static image for ${clipId}`);
  }
}

console.log(`\nAvatar clips saved to ${OUT_DIR}`);
