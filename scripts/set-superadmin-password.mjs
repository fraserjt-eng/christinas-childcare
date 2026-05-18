// Set a known temporary password on the superadmin account via the service
// role (no email link, no redirect-allowlist dependency). J logs in with
// email + this password, then changes it in-app whenever.
//
// Usage: node scripts/set-superadmin-password.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const EMAIL = 'fraserjt@gmail.com';
// Readable but strong: 4 words-ish from hex + symbol.
const TEMP = 'Christina-' + randomBytes(4).toString('hex') + '!';

const { data: list } = await supabase.auth.admin.listUsers();
const user = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL);
if (!user) {
  console.error(`No auth user for ${EMAIL}. Run create-superadmin.mjs first.`);
  process.exit(1);
}

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  password: TEMP,
  email_confirm: true,
});
if (error) {
  console.error('updateUserById failed:', error.message);
  process.exit(1);
}

console.log('\n--- SUPERADMIN LOGIN (temporary password) ---');
console.log('URL:      https://christinas-childcare.vercel.app/admin-login');
console.log('Email:    ' + EMAIL);
console.log('Password: ' + TEMP);
console.log('--- change it in-app after first login ---\n');
