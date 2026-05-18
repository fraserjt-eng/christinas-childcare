// One-shot: ensure the superadmin Supabase Auth account exists for J Fraser
// and print a private "set your password" link. No email is sent.
//
// Usage: node scripts/create-superadmin.mjs
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv(envPath);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'fraserjt@gmail.com';
const REDIRECT =
  process.argv[2] || 'https://christinas-childcare.vercel.app/set-password';

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const { data: list } = await supabase.auth.admin.listUsers();
const existing = list?.users?.find(
  (u) => u.email?.toLowerCase() === EMAIL
);

if (existing) {
  console.log(`Account already exists for ${EMAIL} (id ${existing.id}).`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    email_confirm: true,
  });
  if (error) {
    console.error('createUser failed:', error.message);
    process.exit(1);
  }
  console.log(`Created auth account for ${EMAIL} (id ${data.user.id}).`);
}

const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
  type: 'recovery',
  email: EMAIL,
  options: { redirectTo: REDIRECT },
});

if (linkError) {
  console.error('generateLink failed:', linkError.message);
  process.exit(1);
}

console.log('\n--- SET-PASSWORD LINK (private, do not share) ---');
console.log(linkData?.properties?.action_link ?? '(none)');
console.log('--- end ---\n');
console.log(
  'Open that link, set your password, and you are in as superadmin.\n' +
    'Note: the redirect target must be in Supabase Auth > URL Configuration\n' +
    'allowed redirect URLs, or change the redirect by passing a URL arg.'
);
