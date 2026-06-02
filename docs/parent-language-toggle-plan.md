# Plan: English / Spanish language toggle on the parent site

**Goal:** A button at the bottom of the parent-facing site that switches the interface between English and Spanish, and remembers the choice. Built for Christina's families, many of whom are Spanish-speaking. The same family the login emails go to.

**Status:** Plan only. Nothing built yet. This is a UI-language feature, no children's data exposure, no security surface change.

---

## What it does and what it does NOT do (set expectations first)

- **DOES:** translate the *interface*, the fixed words the app itself shows: buttons, labels, menu items, the login and set-password pages, the dashboard chrome, and the static marketing pages (About, Programs, FAQ, Enroll, etc.).
- **DOES NOT (Phase 1-2):** translate *staff-written content* stored in the database, things like individual messages from Christina, newsletter text, photo captions, lesson notes. Those are typed in English by staff and live as data. Auto-translating them needs a translation API call per item (a small per-use cost) or staff writing them in both languages. That is Phase 3, decided separately.

Being honest about this up front matters: a Spanish-speaking parent will get a Spanish interface but, until Phase 3, the actual messages from Christina stay in whatever language she wrote them.

---

## The approach (lightweight, no big refactor)

No heavy i18n framework. The site is Next.js 14 App Router with no translation library today. Adding `next-intl` would force a URL/route restructure and touch every page at once. For a focused parent-site feature on a bootstrapped budget, a small homegrown layer is the right call:

1. **A dictionary.** Two plain files: `src/lib/i18n/en.ts` and `src/lib/i18n/es.ts`, each a flat object of `key: string`. Example: `loginTitle: "Parent Login"` / `loginTitle: "Acceso de padres"`.
2. **A language context.** `src/lib/i18n/LanguageProvider.tsx`: a React context holding the current language, plus a `useT()` hook so any component calls `t('loginTitle')` and gets the right string.
3. **Persistence.** Store the choice in a cookie named `lang` (values `en` / `es`). A cookie (not just localStorage) so the server layout can read it and render the correct language on first paint, no flicker. Also lets a future version pick the email language from the same preference.
4. **The toggle button.** A small fixed pill at the bottom of the screen, "English · Español," that flips the cookie + context and re-renders. Accessible: real `<button>`, `aria-label`, keyboard focusable. Also set `<html lang="es">` dynamically so screen readers and browsers know the language.
5. **Scope the toggle to parent surfaces only.** Render the provider + button in `src/app/(public)/layout.tsx` and `src/app/dashboard/layout.tsx`. Do NOT add it to `admin`, `employee`, or `kiosk` layouts.

---

## Build phases

### Phase 1 — Toggle + the surfaces the login email drives to (highest value)
The email sends parents to set-password, then login, then the dashboard. Translate those first so the path the email promises is fully Spanish.
- Build the dictionary, `LanguageProvider`, `useT()`, cookie read/write, and the bottom toggle button.
- Wire it into `(public)/layout.tsx` and `dashboard/layout.tsx`.
- Translate strings on: `set-password`, `login`, and the dashboard shell (nav, section headings, buttons, empty states).
- Acceptance: load `/login`, click the toggle, the page is fully Spanish, reload, still Spanish, navigate to the dashboard, still Spanish. No English left in the chrome of these three surfaces.

### Phase 2 — The rest of the public pages
- Extract visible strings on About, Programs, FAQ, Enroll, Schedule a Tour, Locations, Gallery, Guide, Training, Privacy into the dictionary and swap to `t(...)`.
- These are static and content-heavy, so this is the larger, more mechanical pass. Do it page by page.
- Acceptance: every parent-facing public page renders fully in Spanish with the toggle on.

### Phase 3 — Dynamic / staff content (separate decision, has a cost)
- Decide how to handle staff-written content (messages, newsletters, captions). Options:
  - (a) On-the-fly machine translation via an API when a Spanish reader opens it (small per-call cost, fits the Supabase-native + Haiku-for-routine pattern, could even use the existing Claude key with Haiku for cheap translation).
  - (b) Bilingual entry: staff writes key notices in both languages (no cost, more staff effort).
  - (c) Leave dynamic content as-is and only translate the interface (Phases 1-2).
- Tie-in bonus: add a `preferred_language` column to the `families` table. Then the future automated parent emails (see the email-automation directive) send in the family's chosen language automatically, and the dashboard defaults to their language at login.

---

## Effort, risk, cost
- **Phase 1:** roughly half a day. Self-contained, low risk, reversible (the toggle just swaps strings).
- **Phase 2:** a day or so, mostly tedious string extraction across ~12 pages.
- **Phase 3:** depends on the option chosen; (a) adds a tiny per-translation cost, (c) is free.
- **No DB migration** needed for Phases 1-2. Phase 3 option (a)/preferred_language adds one small column.
- **No security or children's-data impact** in Phases 1-2 (interface text only).
- **Gate before deploy:** this is the shared children's-data app, so it ships behind your at-the-moment okay, after a local `npm run dev` review of the toggle on login + dashboard.

---

## First build-session prompt (when ready)
"Build Phase 1 of the parent language toggle per docs/parent-language-toggle-plan.md: dictionary (en/es), LanguageProvider + useT hook, `lang` cookie, a bottom fixed English/Espanol toggle wired into the (public) and dashboard layouts, and translate the set-password, login, and dashboard-shell strings. Run it on npm run dev for J before any deploy."
