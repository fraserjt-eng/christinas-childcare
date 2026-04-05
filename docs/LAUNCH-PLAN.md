# Christina's Childcare Launch Plan: 56 → 90+

**Created:** April 5, 2026
**Current score:** 56/100 (D)
**Target:** 90/100 (A)
**Total estimated work:** ~18 hours across 3-4 sessions

## Phase 1: Auth rewrite + credential safety (4 hours → score ~70)

1. Create server-side session API (`src/app/api/auth/session/route.ts`)
2. Update middleware for HMAC-signed cookie verification
3. Update 3 login pages to POST to session API (remove document.cookie)
4. Add password hashing (`src/lib/crypto.ts`)
5. Add login rate limiting (5 attempts / 15 min)

## Phase 2: Performance fixes (2 hours → score ~74)

6. Dynamic import ExcelJS in budget page
7. Code-split pipeline page with next/dynamic
8. Loading skeletons on slow admin pages (HR, Payroll, Menu Planning, Ratios)
9. Paginate employee photos (currently 8s load)

## Phase 3: Migrate critical localStorage to Supabase (6 hours → score ~84)

10. family-storage → Supabase dual-write
11. photo-storage → Supabase Storage
12. financial-storage → new migration + dual-write
13. user-storage → Supabase dual-write
14. staff-development-storage → Supabase dual-write

## Phase 4: Production hardening (6 hours → score ~92)

15. Replace regex sanitizer with DOMPurify
16. Nonce-based CSP (remove unsafe-inline from script-src)
17. Sentry error monitoring
18. Migrate remaining 13 localStorage modules
19. Rerun stress test + quality gate

## Nothing gets deleted

Every change is additive or a swap-in-place. localStorage stays as offline cache even after Supabase migration. Login UI stays the same. All 97 pages preserved.

## Session strategy

- **Session 1:** Phases 1-2 (auth + performance, 6 hours)
- **Session 2:** Phase 3 (data migration, 6 hours)
- **Session 3:** Phase 4 (hardening + final audit, 6 hours)

## Reference files

- Full plan: `~/.claude/plans/snoopy-inventing-shore.md`
- Quality gate report: `QUALITY-GATE-REPORT.md` (project root)
- Known issues: `~/.claude/known-issues/christinas-childcare.md`
- Stress test: `stress-test/` directory
- Security audit: applied April 5 (see root `CLAUDE.md` security section)
