# Fable 5 discipline (auto-loaded, do not drop)

*Paste this block at the top of each repo's `CLAUDE.md`. Claude Code re-reads `CLAUDE.md` on every turn, so these rules survive context compaction and keep the session from reverting to default behavior. This is the architectural version of the Fable habits: the loaded path is the safe path, and it does not depend on anyone remembering.*

The model running this session is Opus 4.8. Fable 5 behavior is produced by keeping these rules engaged. Do not revert to unharnessed defaults for any reason: not time pressure, not a "just ship it," not a long or compacted session. If you notice yourself skipping verification or claiming done without proof, that is drift. Stop and re-anchor.

## The four habits (hold all four, every turn)
- **Align before build:** restate the goal and confirm it before acting.
- **Verify before done:** every "done" is backed by something you actually ran or read. "Build passes" is not "works."
- **Ship clean:** commit and push before deploy. What is live equals the repo.
- **Keep a memory:** capture the session to the heartbeat log before closing.

## Hard stops (refuse, and say why)
1. A secret about to reach a client-side file or a git commit.
2. A new table without row-level security, unless confirmed intentionally public.
3. A production deploy from a dirty or unpushed tree.
4. A "done" claim with no verification behind it.

## The Fable check (output this before any "done", "fixed", "shipped", or "complete")
```
Fable check
- Aligned:  <the goal in one line>
- Verified: <the exact command, test, or read that proves it, and the result>
- Clean:    <git status, and whether it is pushed>
- Open:     <what is still unproven, or "nothing">
```
If Verified is empty, the work is not done. Say what is left instead of claiming completion.

## If your context is compacted or you lose the thread
Stop. Re-read `~/Desktop/security-first-system/FABLE-5-SESSION-OPENER.md` and `~/Desktop/security-first-system/01-MASTER-security-first-context.md` before continuing. Never continue in default mode. Re-anchoring costs a minute; drifting costs a breach.

---

# Christina's Child Care Center - Claude Code Instructions

## Security rules (non-negotiable, added 2026-04-05 after full audit)

These rules were established after a comprehensive security audit that found 3 critical, 5 high, 6 medium, and 3 low severity issues. The fixes below were applied. These rules prevent regression.

### HTML sanitization
- Every `dangerouslySetInnerHTML` MUST wrap content with `sanitizeHTML()` from `src/lib/sanitize.ts`
- No exceptions. The existing sanitizer handles script tags, event handlers, and iframe injection.
- Layout.tsx JSON-LD is the only exception (static hardcoded data, no user input).

### Authentication
- Auth cookies MUST be HttpOnly, set server-side only (never via `document.cookie`)
- Session tokens should be HMAC-signed and verified in middleware
- Login rate limiting must exist on all auth endpoints
- Auth rewrite COMPLETE (April 5, 2026): HMAC-signed HttpOnly cookies, server-side session API, Edge-compatible middleware verification

### Demo mode
- Demo credentials (admin@demo.com, employee PINs, parent@demo.com) MUST be gated behind `process.env.NEXT_PUBLIC_DEMO_MODE === 'true'`
- Never render credentials in production UI

### API protection
- Every API route MUST check for a valid session before executing
- Lesson generation routes (`/api/lessons/generate`, `/api/lessons/remix`) check `auth_session` cookie
- Error responses MUST NOT include `error.message` or internal details

### Data storage
- Passwords MUST be hashed before storage. Never store plaintext. The field `password_hash` must contain an actual hash.
- Child photos, health records, and medical data should be migrated to Supabase Storage (not localStorage) before production
- Financial data should be server-side, not in localStorage

### Dependencies
- `playwright` is a devDependency only. Never move to production dependencies.
- `xlsx` REPLACED with `exceljs` (April 5, 2026). Do not re-add xlsx.

### Error boundaries
- All portal layouts (admin, employee, dashboard) are wrapped with `ErrorBoundary` component
- New portal layouts must include `<ErrorBoundary>` wrapping children

## Key commands
```bash
npm run dev          # Development server
npm run build        # Production build
```

## Current score: 90/100 (A grade, April 5, 2026)
Quality gate report: `QUALITY-GATE-REPORT.md`
Training curriculum: `docs/training/` (19 files, 12K+ lines)

## Tech stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (7 migrations, 5 modules dual-write, RLS active)
- DOMPurify (isomorphic-dompurify) for HTML sanitization
- Sentry error monitoring (activates when SENTRY_DSN is set)
- ExcelJS for spreadsheet export (dynamic import)
- 10 of 23 storage modules Supabase-backed; 13 remain localStorage-only
- 3 portals: admin, employee, parent (dashboard)

## Deploy safety: staging lane (Fortress Layer 7, non-negotiable, added 2026-06-11)

This app holds children's and family PII and auto-deploys `main` straight to production. Until a real staging environment exists, every change follows the **no-staging fallback** so families never see work in progress:

1. Branch off `main` for any change (`git checkout -b fix/...`). Never commit features straight to `main`.
2. Push the branch. Vercel builds a **preview deployment** automatically (preview URL, not the live domain).
3. Verify on the preview URL with synthetic data only. Never test against real family data on a shared write path.
4. Only after the preview checks out, merge to `main` so the production deploy carries verified code.
5. Never `vercel --prod` from a dirty or unpushed tree. The local pre-flight hook (`scripts/hardening-preflight.mjs`) blocks committed secrets and warns on RLS/lockfile drift.

**Tracked Layer 7 finding (build when scheduled):** a true staging lane = a Vercel preview environment with its own env vars pointing at either a Supabase branch or a second project seeded with synthetic data, so preview never reads or writes the live `dkzxcxwjhhxqfgksynjb` instance. The fallback above is the interim; the real lane closes the finding.
