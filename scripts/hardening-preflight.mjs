#!/usr/bin/env node
// Local pre-flight gate, referenced by CLAUDE.md "Deploy safety".
//
// The HARD secret-blocking gate is the Fortress pre-commit hook
// (fortress-guard.mjs --staged), installed by ~/.claude/security/fortress-bootstrap.sh.
// This script makes that reference real and adds the advisory RLS + lockfile
// drift checks CLAUDE.md promises. It exits non-zero only if the Fortress secret
// scan finds something (safe to also wire as a pre-push hook); its own RLS /
// lockfile findings are warnings, not blockers.
//
// Run manually:  node scripts/hardening-preflight.mjs

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function stagedFiles() {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

const files = stagedFiles();
let warnings = 0;

// 1) Lockfile drift: package.json changed without the lockfile.
if (files.includes('package.json') && !files.includes('package-lock.json')) {
  console.warn('WARN  package.json is staged without package-lock.json — run `npm install` and stage the lockfile so `npm ci` stays deterministic.');
  warnings++;
}

// 2) RLS drift: a new migration that CREATE TABLEs without ENABLE ROW LEVEL SECURITY.
for (const f of files) {
  if (!/supabase\/migrations\/.*\.sql$/.test(f) || !existsSync(f)) continue;
  const sql = readFileSync(f, 'utf8');
  const creates = (sql.match(/create table/gi) || []).length;
  const rls = (sql.match(/enable row level security/gi) || []).length;
  if (creates > rls) {
    console.warn(`WARN  ${f}: ${creates} CREATE TABLE vs ${rls} ENABLE ROW LEVEL SECURITY — a new table may be missing RLS.`);
    warnings++;
  }
}

// 3) Hard gate: delegate the secret scan to Fortress.
const guard = join(homedir(), '.claude/security/fortress-guard.mjs');
if (existsSync(guard)) {
  try {
    execSync(`node "${guard}" --staged`, { stdio: 'inherit' });
  } catch {
    console.error('BLOCK Fortress secret scan flagged staged changes — fix or `git commit --no-verify` only if you are certain.');
    process.exit(1);
  }
} else {
  console.warn('WARN  Fortress guard not found; secret scan skipped. Run ~/.claude/security/fortress-bootstrap.sh.');
}

console.log(`hardening-preflight: ok${warnings ? ` (${warnings} advisory warning${warnings === 1 ? '' : 's'})` : ''}`);
