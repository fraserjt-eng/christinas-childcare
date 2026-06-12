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
