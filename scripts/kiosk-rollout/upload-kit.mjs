// Uploads the packaged kit ZIP to the PRIVATE prod bucket the admin route streams.
// Idempotent: creates the bucket if missing (private), upserts the object.
// Reads prod creds from .env.prod.local. Never prints the key.
//   node scripts/kiosk-rollout/upload-kit.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const BUCKET = 'admin-exports';
const OBJECT = 'kiosk-rollout/Crystal-Kiosk-Rollout-Kit.zip';
const ZIP = join(homedir(), 'Desktop', 'christina-kiosk-rollout', 'Crystal-Kiosk-Rollout-Kit.zip');

const env = {};
for (const line of readFileSync('.env.prod.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}
const url = env.SUPA_URL, key = env.SUPA_SERVICE_ROLE;
if (!url || !key || key.includes('PASTE_')) { console.error('Prod key not set in .env.prod.local'); process.exit(1); }
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase/) || [])[1] || '?';
const sb = createClient(url, key, { auth: { persistSession: false } });

// 1) ensure the private bucket
const { error: be } = await sb.storage.createBucket(BUCKET, { public: false });
if (be && !/already exists/i.test(be.message)) { console.error('bucket error:', be.message); process.exit(1); }
console.log(`bucket ${BUCKET}: ${be ? 'already present' : 'created (private)'}  db=${ref}`);

// 2) upsert the object
const body = readFileSync(ZIP);
const { error: ue } = await sb.storage.from(BUCKET).upload(OBJECT, body, {
  contentType: 'application/zip', upsert: true,
});
if (ue) { console.error('upload error:', ue.message); process.exit(1); }
console.log(`uploaded ${(body.length / 1024 / 1024).toFixed(2)} MB -> ${BUCKET}/${OBJECT}`);
console.log('Superadmin download route: GET /api/admin/kiosk-rollout-kit');
