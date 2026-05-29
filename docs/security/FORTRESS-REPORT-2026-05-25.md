# Christina's Child Care: Security Fortress Report

**Date:** May 25, 2026
**Scope:** Security hardening of the live platform (Supabase `dkzxcxwjhhxqfgksynjb`, Vercel `christinas-childcare`).
**Audience:** Christina (owner) and J (builder). Written plain, no jargon where it can be helped.

---

## One-paragraph summary

Before today, a person with no account and no password could pull the center's business financials and every family's children-and-parent records straight from the database, through a hole the app shipped with. That hole is closed. The work also fixed the bugs that hole was hiding (photos that never saved, family imports that silently failed) and added what the owner asked for. Nothing was lost: every record is still there, counted before and after. The platform now sits at a reasonable security baseline for the data it holds. It is not yet certified the way the big paid platforms are, and that gap is named honestly below.

---

## What changed this session

| Area | Before | After |
|---|---|---|
| Business financials | Readable and writable by anyone, no login | Reachable only by the center's own admin server. Closed. |
| Family + child records | Readable by any logged-in user (any parent could see every family) | Each family's data reachable only through the admin server. Closed. |
| Admin helper functions | Callable by anonymous visitors | Anonymous access removed. |
| Photos | Never actually saved (silent failure) | Save through a secure server path, tagged to the right children, owner approves before parents see them. |
| Family bulk import | Looked like it worked, saved nothing | Saves correctly through the admin server. |
| Meal logging | Four meal times | Six (added Supper and Evening Snack with their CACFP rates). |
| Daily logging | One child at a time | New "batch entry" to log the whole class at once, then adjust per child. |
| Stray duplicate files in the app | Several botched copies inside the live app | Removed. |

**Data integrity:** row counts identical before and after (families 6, children 8, parents 6, financial records 6, staff 14, meal counts 18, daily entries 67). The security changes only changed who can reach the data, never the data itself.

---

## How Christina's compares to the major childcare platforms

This is the honest version, not a sales pitch. Brightwheel, Procare, and Lillio are funded companies with security teams and formal certifications. Christina's is a custom, single-center app. Each model has real advantages.

| Control | Brightwheel | Procare | Lillio (HiMama) | Christina's (after today) |
|---|---|---|---|---|
| Encryption in transit + at rest | Yes (AWS) | Yes | Yes (AWS) | Yes (Supabase on AWS) |
| Sensitive data server-only, not exposed to the browser | Yes | Yes | Yes | **Yes (fixed today)** |
| Row-level database access control | (platform-managed) | (platform-managed) | (platform-managed) | Yes (RLS, hardened today) |
| Formal SOC 2 audit | AWS SOC inherited; third-party audits | **SOC 2 Type 2** | Not publicly confirmed | **No** |
| PCI compliance (payments) | PCI Level 1 | Yes | PCI | Uses separate billing; not in scope |
| Two-factor admin login | Yes | (PIN-based access) | Strong auth | **Not yet** |
| Independent penetration test | Periodic third-party | SOC 2 process | OWASP ASVS | **Not yet (AI scan only)** |
| Does not sell or share personal data | Yes | Yes | Yes | Yes (single-tenant, no third parties) |

**Where the big platforms still lead:** they carry formal certifications (Procare's SOC 2 Type 2 is the standout), two-factor login, and independent penetration tests. Christina's has none of those yet.

**Where a single-center app like Christina's has the edge:** one center's data lives alone, so there is no risk of another customer's breach exposing Christina's families (the multi-tenant risk the big platforms have to engineer around). The owner controls the database directly. No data is shared with any outside company, by design, because there are no third parties in the stack.

**The fair verdict:** today's work moved Christina's from "had an exploitable hole the certified platforms would never ship" to "meets the access-control baseline those platforms hold." It did not make Christina's SOC 2 certified, and it should not be described that way.

---

## What is still open

| Item | Severity | Plan |
|---|---|---|
| Child photos are public by direct link (bucket is public) | Medium (privacy) | Next pass: make the bucket private and serve photos through signed, expiring links. |
| Leaked-password protection is off | Low | One toggle in the Supabase dashboard (owner action). |
| `app_settings` table still open to the browser | Medium | Move its few writes to the server, then lock it. |
| Helper functions still callable by logged-in users | Low | Acceptable: they only reveal the caller's own role. |
| No formal SOC 2 / professional penetration test | Context | For a production child-data system at scale, engage a professional security firm. The AI scan used here is a strong first pass, not a substitute. |

---

## Bottom line

The dangerous, no-login data exposure is gone, the owner's requested features work, and not a single record was lost. The platform is now at a sound baseline for a single-center app. The honest next steps are the photo-privacy hardening and, if the center grows, a professional penetration test to reach the bar the large platforms certify against.

---

*Sources for the platform comparison: Brightwheel security pages (mybrightwheel.com/security, help.mybrightwheel.com), Procare SOC 2 Type 2 announcements (procaresoftware.com), Lillio data privacy FAQ (support.lillio.com). Christina's posture verified directly against the live database and deployment on 2026-05-25.*
