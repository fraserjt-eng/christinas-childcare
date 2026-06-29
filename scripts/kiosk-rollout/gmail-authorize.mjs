// One-time: mint a Gmail refresh token so the kiosk-report cron can send mail
// from J's Google account. Run locally; J clicks Allow once.
//
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/kiosk-rollout/gmail-authorize.mjs
//
// The OAuth client must be a "Desktop app" (or a Web client that allows the
// loopback redirect below) in a Google Cloud project with the Gmail API enabled.
// Scope requested: gmail.send only (send mail, nothing else).
import http from 'node:http';
import { exec } from 'node:child_process';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment first.');
  console.error('Create them at https://console.cloud.google.com/apis/credentials (OAuth client, type "Desktop app"),');
  console.error('and enable the Gmail API for the project. Then add this redirect if it is a Web client: ' + REDIRECT);
  process.exit(1);
}

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent', // force a refresh_token every time
  }).toString();

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) { res.writeHead(404); res.end(); return; }
  const code = new URL(req.url, REDIRECT).searchParams.get('code');
  if (!code) { res.writeHead(400); res.end('No code'); return; }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code',
    }),
  });
  const tok = await tokenRes.json();
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h2>Done. You can close this tab and return to the terminal.</h2>');
  server.close();

  if (!tok.refresh_token) {
    console.error('\nNo refresh_token returned. Revoke prior access at https://myaccount.google.com/permissions and re-run.');
    console.error('Response:', JSON.stringify(tok));
    process.exit(1);
  }
  console.log('\nSuccess. Set these in Vercel (production) for the christinas-childcare project:\n');
  console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
  console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
  console.log(`GMAIL_REFRESH_TOKEN=${tok.refresh_token}`);
  console.log(`GMAIL_SENDER=fraserjt@gmail.com`);
  console.log('\nAlso set CRON_SECRET (any long random string) if it is not already set.\n');
  process.exit(0);
});

server.listen(PORT, () => {
  console.log('Opening Google consent in your browser. Approve the "unverified app" screen (it is your own app).');
  console.log('If it does not open, paste this URL:\n' + authUrl + '\n');
  exec(`open "${authUrl}"`);
});
