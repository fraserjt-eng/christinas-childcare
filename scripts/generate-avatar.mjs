// scripts/generate-avatar.mjs
import fs from 'fs';
import path from 'path';

const DID_API_KEY = process.env.DID_API_KEY;
const AVATAR_IMAGE = path.resolve('assets/avatar-jf.jpg');
const OUT_DIR = '/tmp/christinas-avatar';

fs.mkdirSync(OUT_DIR, { recursive: true });

const AVATAR_CLIPS = [
  { id: 'avatar-intro', text: "Welcome to the admin portal. This is your command center for managing every aspect of Christina's Child Care Center." },
  { id: 'avatar-operations-transition', text: "Now let's look at the operations tools that keep your center running smoothly." },
  { id: 'avatar-communication-transition', text: "Next, we'll explore the communication and engagement tools." },
  { id: 'avatar-growth-transition', text: "Let's look at the tools that help grow your enrollment and revenue." },
  { id: 'avatar-outro', text: "That covers the admin portal. Every tool here is designed to save you time and keep your center running at its best." },
];

// Use the OG image URL as source (D-ID needs a publicly accessible image)
const SOURCE_IMAGE_URL = 'https://christinas-childcare.vercel.app/avatar-jf.jpg';

async function createTalkingHead(text, outputPath) {
  if (!DID_API_KEY) {
    console.log('  [skip] DID_API_KEY not set. Using static image fallback.');
    fs.copyFileSync(AVATAR_IMAGE, outputPath.replace('.mp4', '.jpg'));
    return outputPath.replace('.mp4', '.jpg');
  }

  // Create talk using text-based script (D-ID generates voice + lip sync)
  const createRes = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${DID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_url: SOURCE_IMAGE_URL,
      script: {
        type: 'text',
        input: text,
        provider: { type: 'microsoft', voice_id: 'en-US-AvaNeural' },
      },
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

for (const clip of AVATAR_CLIPS) {
  const outputPath = path.join(OUT_DIR, `${clip.id}.mp4`);

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1024) {
    console.log(`  [cached] ${clip.id}`);
    continue;
  }

  try {
    // Remove stale fallback JPG if exists
    const jpgFallback = path.join(OUT_DIR, `${clip.id}.jpg`);
    if (fs.existsSync(jpgFallback)) fs.unlinkSync(jpgFallback);

    await createTalkingHead(clip.text, outputPath);
  } catch (err) {
    console.error(`  [error] ${clip.id}: ${err.message}`);
    fs.copyFileSync(AVATAR_IMAGE, path.join(OUT_DIR, `${clip.id}.jpg`));
    console.log(`  [fallback] Using static image for ${clip.id}`);
  }
}

console.log(`\nAvatar clips saved to ${OUT_DIR}`);
