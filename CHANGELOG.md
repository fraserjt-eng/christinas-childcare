# Changelog: Christina's Child Care Center

All notable changes to this platform are documented here.

---

## [2026-03-28] Production Readiness Release

### Added: Supabase Backend
- Created Supabase project (`dkzxcxwjhhxqfgksynjb`) with East US region
- Pushed 4 database migrations: foundation tables, friction tools, operational tables, RLS policies
- Wired 5 critical storage modules to Supabase (dual-write with localStorage cache):
  - `food-storage.ts` -- meal counts, inventory, menus, classrooms
  - `employee-storage.ts` -- staff records, time entries, schedules, pay stubs
  - `incident-log-storage.ts` -- safety incidents with append-only audit trail
  - `enrollment-pipeline-storage.ts` -- leads, funnel stats, revenue projections
  - `tour-storage.ts` -- tour requests, availability, stats
- Set Supabase environment variables in Vercel production

### Added: Authentication and Security
- Middleware enforces session authentication on all protected routes
- Removed hardcoded demo credentials (admin123, owner123, teacher123)
- Role-based RLS policies on all database tables (admin, owner, staff, parent, anon)
- Rate limiting on API routes (5 req/min per IP)
- Enrollment deduplication (same email + child name within 24 hours)
- Error reporting to Supabase `error_logs` table
- HTML sanitizer for newsletter and message content (strips scripts, iframes, event handlers)

### Added: Safety Nets
- Auto-clock-out closes open time entries from previous days at 6 PM
- Session expiry warning component (30-minute countdown banner)
- Form draft persistence hook (saves form state on every keystroke, survives browser refresh)

### Added: Daily Reports and Data Export
- Daily operations report page at `/admin/reports/daily`
  - AM report: yesterday's enrollment, attendance, meals, tasks, incidents
  - PM report: today's data with clock discrepancies and certification warnings
- CSV export utility for full operational data backup
- PDF download of daily report

### Added: Analytics and Privacy
- Vercel Analytics + Speed Insights installed
- Privacy policy page at `/privacy`
- Privacy notice linked from footer and both forms (enrollment + tour)
- OG image for social media sharing (1200x630 branded graphic)

### Changed: Navigation
- Consolidated public nav from 9 to 7 items (removed Parent Guide, Feature Guide)
- Admin sidebar uses time-aware defaults (Opening: Today+People, Core: Operations+Communications, Closing: Today+Communications)

### Changed: Employee Dashboard
- Tiles reorder based on time of day (Clock In first at 6 AM, Meal Count first at 11 AM)
- Meal Count tile shows deadline status with color coding (green: upcoming, red: overdue)

### Changed: Forms
- Enrollment and tour forms POST to Supabase via API routes (localStorage as backup)
- FAQ pricing now shows actual rates ($375/$325/$285/$185) instead of "contact us"

### Fixed: Security Headers
- vercel.json committed and deployed (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Previously configured but never deployed (file was untracked)

---

## [2026-03-15] Scheduling and Guide System

### Added
- Interactive guide page with 96-page walkthrough across 3 user roles
- 24 guided tours using driver.js with "Take the Tour" buttons
- 8 video walkthrough compositions with AI voiceover (Remotion + edge-tts)
- Drag-and-drop schedule board with @dnd-kit
- Schedule PDF export
- Schedule publish to staff
- Week navigation in Hours Summary tab

### Fixed
- Schedule page infinite render loop from Date dependency
- Shift click crash (replaced Radix Dialog+Select with inline panel)
- Drag schedule board crash (moved Dialog outside DndContext)
- Schedule tabs render loops and mounted guards

---

## [2026-03-13] All 20 Friction Tools Complete

### Added: Phase 6 (Compliance and Communication)
- Tools 15, 17, 20 completing all 6 phases
- All 20 friction-reducing tools from FRICTION_TOOLS_PRD.md implemented

### Added: Phase 1 (Revenue Protection)
- Tool 01: Automated Meal Count Reminder System (CACFP deadlines, compliance %, revenue impact)
- Tool 10: CACFP Compliance Tracker (16 checklist items, audit readiness score, reimbursement tracker)

### Added: Phase 2 (Parent Experience)
- Tool 02: Daily Photo/Video Upload Workflow (staff upload, admin review, parent feed)
- Tool 11: Parent Communication Hub (announcements, templates, read receipts)
- Tool 18: Weekly Family Newsletter Generator (section editor, preview, schedule/send)

### Database: Supabase Migration
- `20260313_002_friction_tools.sql`: cacfp_compliance, daily_photos, photo_reactions, communications, communication_reads, newsletters

---

## [2026-03-07] Foundation

### Added
- Initial Next.js 14 App Router setup with TypeScript strict
- Three-portal architecture (admin, employee, parent dashboard)
- 8 core admin pages (dashboard, food counts, attendance, scheduling, tasks, messaging, compliance, inventory)
- Employee portal (clock in/out, tasks, schedule, training)
- Parent dashboard (messages, photos, calendar)
- Smart dashboard with time-aware alerts (Opening/Core/Closing zones)
- christina-red/blue/yellow/green/coral design system
- shadcn/ui component library integration
- Public pages (homepage, programs, about, gallery, FAQ, enrollment, schedule tour)

### Database: Supabase Migration
- `20260307_001_foundation.sql`: centers, employees, classrooms, food_counts, attendance, staff_schedules

---

## Feature Inventory

### Admin Portal (40+ pages)
| Feature | Page | Storage | Supabase |
|---------|------|---------|----------|
| Dashboard (time-aware) | `/admin` | smart-dashboard.ts | -- |
| Food Counts + CACFP | `/admin/food-counts` | food-storage.ts | Yes |
| Attendance | `/admin/attendance` | employee-storage.ts | Yes |
| Ratio Monitor | `/admin/ratios` | employee-storage.ts | Yes |
| Task Board | `/admin/tasks` | localStorage | No |
| Scheduling (drag-drop) | `/admin/scheduling` | employee-storage.ts | Yes |
| Schedule Optimizer | `/admin/schedule-optimizer` | localStorage | No |
| Staff Directory | `/admin/staff` | employee-storage.ts | Yes |
| HR and Onboarding | `/admin/hr` | localStorage | No |
| Compliance Dashboard | `/admin/compliance` | localStorage | No |
| Payroll | `/admin/payroll` | employee-storage.ts | Yes |
| Enrollment Pipeline | `/admin/pipeline` | enrollment-pipeline-storage.ts | Yes |
| Tour Manager | `/admin/pipeline/tours` | tour-storage.ts | Yes |
| Incident Reports | `/admin/incidents` | incident-log-storage.ts | Yes |
| Incident Log | `/admin/incidents/log` | incident-log-storage.ts | Yes |
| Staff Chat | `/admin/messaging` | localStorage | No |
| Newsletters | `/admin/communications` | localStorage | No |
| Photo Review | `/admin/communications/photos` | localStorage | No |
| Meetings | `/admin/meetings` | localStorage | No |
| Financial Planning | `/admin/financial` | localStorage | No |
| Revenue Forecast | `/admin/financial/forecasting` | localStorage | No |
| Curriculum | `/admin/curriculum` | localStorage | No |
| Lesson Builder (AI) | `/admin/lessons` | localStorage | No |
| Daily Reports | `/admin/reports/daily` | all sources | Yes |
| Settings | `/admin/settings` | localStorage | No |
| User Management | `/admin/settings/users` | localStorage | No |

### Employee Portal (12 pages)
| Feature | Page | Storage | Supabase |
|---------|------|---------|----------|
| Clock In/Out | `/employee` | employee-storage.ts | Yes |
| Meal Count | `/employee/meal-count` | food-storage.ts | Yes |
| Photo Upload | `/employee/photos` | localStorage | No |
| My Tasks | `/employee/tasks` | localStorage | No |
| My Schedule | `/employee/schedule` | employee-storage.ts | Yes |
| Time Off | `/employee/time-off` | employee-storage.ts | Yes |
| Training | `/employee/training` | localStorage | No |
| Pay Stubs | `/employee/pay-stubs` | employee-storage.ts | Yes |
| Knowledge Base | `/employee/knowledge` | localStorage | No |
| Onboarding | `/employee/onboarding` | localStorage | No |

### Parent Portal (8 pages)
| Feature | Page | Storage | Supabase |
|---------|------|---------|----------|
| Dashboard | `/dashboard` | family-storage.ts | No |
| My Children | `/dashboard/children` | family-storage.ts | No |
| Photo Gallery | `/dashboard/photos` | localStorage | No |
| Newsletter | `/dashboard/news` | localStorage | No |
| Messages | `/dashboard/messages` | localStorage | No |
| Calendar | `/dashboard/calendar` | localStorage | No |
| Documents | `/dashboard/documents` | localStorage | No |
| Progress Reports | `/dashboard/progress` | localStorage | No |

### Public Pages (10 pages)
| Page | URL |
|------|-----|
| Homepage | `/` |
| Programs | `/programs` |
| About | `/about` |
| Gallery | `/gallery` |
| FAQ | `/faq` |
| Enrollment | `/enroll` |
| Schedule Tour | `/schedule-tour` |
| Privacy Policy | `/privacy` |
| Scope and Sequence | `/scope-sequence` |
| Interactive Guide | `/guide` |

### API Routes (5 routes)
| Route | Purpose |
|-------|---------|
| `POST /api/inquiries` | Enrollment form submissions (Supabase + dedup) |
| `POST /api/tours` | Tour request submissions (Supabase) |
| `GET /api/reports/daily` | Daily operations report JSON |
| `POST /api/lessons/generate` | AI lesson generation (Anthropic) |
| `POST /api/lessons/remix` | AI lesson remixing (Anthropic) |
