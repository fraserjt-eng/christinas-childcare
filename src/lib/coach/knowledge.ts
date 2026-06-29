// The Coach's reference is DERIVED from the same registries the app itself
// renders, so it can never again drift behind a shipped feature (the video bug:
// a hand-written digest forgot video existed and the Coach denied it).
//
// Two layers:
//  1. CURATED_WORKFLOWS — short prose for the few cross-screen, multi-step flows
//     that a tile label cannot explain (check-in, daily logging, photo/video
//     upload + approval, message approval). Keep this tight.
//  2. Derived sections — generated at module load from TILE_CATALOG (every
//     owner-facing screen), trainingModules (every topic + its pages), and
//     ROLE_CONFIGS (who can reach what). These are the canonical, always-current
//     source: ship a tile or a module and the Coach knows about it automatically.
//
// No em dashes anywhere (Iron Rule); the derived lines use colons.

import { TILE_CATALOG } from '@/lib/tile-catalog';
import { trainingModules } from '@/lib/training/modules';
import { ROLE_CONFIGS } from '@/lib/role-config';

const CURATED_WORKFLOWS = `
# How the key workflows work (the multi-step ones)

## Sign in & who can do what
- Staff sign in with a 4-8 digit PIN on the kiosk or the staff sign-in. Parents sign in with their family PIN. Owners (Dr. J Fraser, Christina, Ophelia, Stephen) sign in by PIN or Google and have full cross-center "superadmin" access.
- Owners switch between Brooklyn Park, Crystal, and a Combined view with the center switcher in the top bar / sidebar of the back office. If you don't see it, sign out and back in once.
- Two surfaces: the simple owner "office" landing (/preview/office) and the deep back office (/admin). The Admin button opens the deep one.

## Attendance
- Families check in/out at the kiosk by tapping their PIN, then the child, then the adult dropping off or picking up.
- Staff can also key attendance: the Attendance page has "Today (live)" and "Enter a day" (a bulk grid to enter a paper sign-in sheet for any date).
- The Attendance Hub shows by-room and by-day totals and exports the DCYF "Import Attendance" CSV. An admin can fix or delete a check-in/out.

## Daily reports
- Staff log a child's day from the room screen: tap an action (Meal, Nap, Activity, Photo, Note; infants also Bottle + Diaper; toddler rooms also Potty + Accident). Each entry appears on the parent's Daily Report as a timestamped timeline.
- The live feed is today only. Past days stay viewable under Daily Reports (use the day arrows). Nothing is deleted.

## Photos & videos
- A child's profile photo: the small camera button on their tile; it uploads to the cloud and shows on every device.
- Activity photos AND short videos (up to 60 seconds, 50MB): staff upload them from the Photos page (staff sidebar "Upload Photos & Video"; the room Photo panel also links to it). An owner then approves each one in Photo Review before any parent sees it. Approved photos and videos show in the parent's Photos feed; activity photos also show on the Daily Report.
- There is no separate owner video uploader: owners APPROVE videos (Photo Review), staff UPLOAD them.

## Communications
- Newsletters: the office Newsletter tile opens the full builder (AI draft, audience, sections, preview, send).
- Parent messages: a message to a family is saved as a DRAFT; an owner approves it (Review & Send) before it reaches the parent (and emails them when email is on).

## Billing
- Billing (rates, charges, statements, balances) is owner-only and still being built. If a piece is not live yet, offer to create a ticket.

## Support
- Anyone can "Report an Issue"; it reaches Dr. J Fraser. The Coach can create that ticket when the app cannot do what is asked.
`.trim();

// ---- derived sections (canonical, regenerated from the live registries) ----

function deriveScreens(): string {
  const byGroup = new Map<string, string[]>();
  for (const t of TILE_CATALOG) {
    const line = `- ${t.label} (${t.href}): ${t.description}`;
    const list = byGroup.get(t.group) || [];
    list.push(line);
    byGroup.set(t.group, list);
  }
  // Array.from(...) not for-of: the tsconfig target lacks downlevelIteration for Maps.
  return Array.from(byGroup.entries())
    .map(([group, lines]) => `### ${group}\n${lines.join('\n')}`)
    .join('\n');
}

function deriveTopics(): string {
  return trainingModules
    .map((m) => {
      const pages = (m.portalPages || []).join(', ');
      return `- ${m.title}${pages ? ` (screens: ${pages})` : ''}`;
    })
    .join('\n');
}

function deriveRoles(): string {
  return Object.values(ROLE_CONFIGS)
    .map((r) => {
      const hidden = r.hiddenPages.length ? `cannot reach ${r.hiddenPages.join(', ')}` : 'full access (sees everything)';
      return `- ${r.label}: ${hidden}`;
    })
    .join('\n');
}

let cachedReference: string | null = null;

// The full reference the Coach answers from. Memoized: the registries are static
// at runtime, so this builds once per server instance.
export function buildCoachReference(): string {
  if (cachedReference) return cachedReference;
  cachedReference = [
    `# Christina's Child Care app — what it does and how`,
    CURATED_WORKFLOWS,
    `\n# Every screen in the app (generated from the live app, always current)`,
    deriveScreens(),
    `\n# Topics the app covers (from the training modules, with their screens)`,
    deriveTopics(),
    `\n# Who can reach what (by role)`,
    deriveRoles(),
  ].join('\n');
  return cachedReference;
}

// Back-compat for any importer of the old constant.
export const COACH_KNOWLEDGE = buildCoachReference();
