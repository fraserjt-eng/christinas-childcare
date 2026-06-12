# Where the simplified experience lives (shared map for the merge conversation)

One page so J and the director share the same mental model. Written June 2026.

## The short version

The simplified experience is a **new front-door layer**. It is a different,
calmer VIEW of the same accounts and the same data the center already has. It
does not replace the current app and it does not add a new login. At merge it
sits alongside today's portals, additive, easy to roll back.

## Two versions, do not confuse them

| | App version (the demo) | Real version (production) |
|---|---|---|
| Where | `/preview/*` on the shared link | real routes in the live app |
| Data | made-up families, fixtures only | real families, real Supabase |
| Persists | only on the device, until Reset | real database, with RLS |
| Login | none, you pick a demo person | the real parent and staff logins |
| Who sees it | J and the director, by passcode | the actual families and staff |
| Status | live now, this is what you review | built in stages 3 to 5, not yet |

The shared preview link is the **app version**. It exists to get the look,
flow, and feel approved cheaply, before any real-data work.

## How it is reached, vs the logins families use today

Today, the home page red bar has two doors:
- **Parent Portal** to `/login` (email + password) into `/dashboard`.
- **Staff Portal** to `/employee-login` (PIN, or email + password) into `/employee` or `/admin`.
- The lobby **kiosk** at `/kiosk` runs open on the iPad for check-in.

The simplified layer adds **one clear way in** (the three-door "Who's here?")
reachable from the home page. It reuses those SAME logins:
- A parent still signs in with their email and password.
- A staff member still uses their PIN.
- The kiosk still runs open on the iPad.

The simplified screens are a different view of the same login, the same roles,
and the same data. There is no new password and no new account system.

## How it compares to the current portals

| Audience | Current (full) | Simplified (new) | Same login? |
|---|---|---|---|
| Parent | `/dashboard` | the parent phone home | yes |
| Staff | `/employee` | the room view | yes (PIN) |
| Owner | `/admin` | the office | yes |
| Lobby | `/kiosk` | the three-door + PIN pad | open, same as now |

Both the full and the simplified views exist during the transition. Which one
a person lands on by default is a stage-3 decision, decided with the director,
not now.

## The merge is "another layer"

The merge does not rip out the current app. It adds the simplified routes on
top, wired to the real data, behind the same auth. The current detailed portals
stay for power use and as a fallback. If anything about the simplified layer
needs to come down, it comes down without touching what families use today.

## What is already real underneath (do not rebuild)

The live app already has: the daily-report feed, a photo gallery scoped to each
family's own kids (now private, served by signed URLs), one-way center
messages, newsletters, the family roster, and the kiosk. The simplified layer
reuses these. New tables come later, in priority order: presence on the parent
phone, the authorized-pickup model (the top safety gap), billing parent view,
two-way messages, documents, closures, structured infant fields, and real
photo storage through the existing signed-URL path.

## The path, paused at the right place

1. Stage 2 (now): the app version, fixtures, on the shared link. Brand-matched.
2. Stage 3: wire the approved screens to a seeded TEST database, never live data.
3. Stage 4: the director uses it like the real thing for a week.
4. Stage 5: one reviewed merge to production, security-gated, deploy from git.

We are pausing between stage 2 and stage 3 for the director's review and the
go-ahead. Nothing merges to production without that approval.
