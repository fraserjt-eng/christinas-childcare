# Christina's Child Care Center: Context Index

**Last updated:** 2026-03-29
**Live:** https://christinas-childcare.vercel.app/
**Root:** `/Users/jfraser/Desktop/Desktop Winter 26 - Drive/09_Childcare-Business/Christina's Child Care Center/christinas-childcare/`
**Deploy:** `vercel --prod`
**Stack:** Next.js 14 + TypeScript + Tailwind + Radix UI + dnd-kit + Remotion (video) + React Hook Form + Zod

---

## Project Status: BUILT, NO DATABASE YET

Massive build: 96 pages, 20 friction tools, 3 portals, 23 storage modules. All running on localStorage only. Supabase project not yet created; migrations are ready but env vars commented out.

```
Admin Portal       DONE   Staff management, scheduling, curriculum, reports
Employee Portal    DONE   Timesheets, lesson plans, daily logs
Parent Portal      DONE   Child info, messaging, billing
Friction Tools     DONE   20 operational tools (attendance, behavior, meals, etc.)
Storage Modules    DONE   23 localStorage-backed Zustand stores
Remotion Videos    DONE   5 walkthrough videos (lesson builder, curriculum, staff, attendance, reports)
Supabase           TODO   Create project, push migrations, swap localStorage for Supabase
Auth               TODO   Currently no auth; all portals open
```

---

## Key Files

```
src/app/                   96 pages across admin/, employee/, parent/ routes
src/components/ui/         Radix-based component library
src/lib/store*.ts          23 Zustand stores with localStorage persistence
src/hooks/                 Custom React hooks
remotion/                  Video generation (5 walkthrough compositions)
supabase/migrations/       Ready but not yet pushed
```

---

## Architecture Notes

- **No Supabase yet:** Everything is localStorage. First user who clears storage loses data.
- **Three portals:** Admin (owner/director), Employee (staff), Parent (families)
- **Primary users:** Owner/director + staff. This is an operational tool, not a marketing site.
- **Remotion:** Video walkthroughs can be rendered with `npm run remotion:render:all`
