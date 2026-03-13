# PRD: 20 friction-reducing tools for Christina's Child Care

**Source:** Christina's Child Care Friction Assessment Report
**Platform:** christinas-childcare.vercel.app
**Tech stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase, Recharts, Zustand
**Date:** March 13, 2026

---

## Context

The friction assessment identified 20 tools across six priority categories: revenue protection, parent experience, time management, enrollment, institutional memory, and operational efficiency. This PRD specifies how each tool integrates into the existing Christina's Child Care platform.

The platform already has admin, employee, and parent dashboard portals. Many routes already exist (food-counts, attendance, scheduling, tasks, messaging, compliance, inventory, etc.). Some tools enhance existing pages. Others are new routes. Every tool uses the existing component library (shadcn/ui), color system (christina-red, christina-blue, christina-yellow, christina-green, christina-coral), and localStorage/Supabase data patterns already in the codebase.

---

## Priority tier: CRITICAL (revenue + retention)

### Tool 01: Automated meal count reminder system
**Route:** Enhances existing `/admin/food-counts`
**Category:** Revenue protection
**Friction addressed:** Missed CACFP counts = direct revenue loss

**What exists:** `FoodCountGrid`, `FoodProjectionChart`, `CostTracker`, `ClassroomSettings` components. `food-storage.ts` with `getCACFPDailyReport` and `getCACFPMonthlyReport`. Types in `food.ts`.

**What to build:**
- Notification engine in `src/lib/meal-reminders.ts`:
  - Configurable reminder schedule per meal type (breakfast, AM snack, lunch, PM snack)
  - Default: 15 min before meal count deadline
  - Push via browser Notification API (request permission on first admin login)
  - In-app toast fallback using existing toast system
- Dashboard alert integration:
  - Add "Missed Meal Count" alert type to `smart-dashboard.ts` `getDashboardAlerts()`
  - Red severity badge if any meal count is missing by 30 min past deadline
  - Link directly to food-counts page with date pre-selected
- Automated tracking:
  - New field `submittedAt` on each meal count record
  - Weekly compliance summary card on food-counts page: % of counts submitted on time
  - Monthly revenue impact estimate: missed counts x average reimbursement rate ($1.40 lunch, $0.60 snack)
- Staff-facing notification:
  - Employee portal gets a meal count reminder banner during active meal windows
  - Quick-entry form: employee taps count for their classroom without navigating to full food-counts page

**New components:**
- `src/components/food/MealReminderBanner.tsx` (employee portal)
- `src/components/food/QuickMealEntry.tsx` (employee portal)
- `src/components/food/ComplianceSummary.tsx` (admin food-counts)
- `src/components/food/RevenueImpactCard.tsx` (admin food-counts)

**Data:**
- Extend `food.ts` types with `submittedAt: string`, `onTime: boolean`
- New localStorage key: `meal-reminder-config`
- New localStorage key: `meal-count-compliance-{month}`

---

### Tool 02: Daily photo/video upload workflow
**Route:** Enhances existing `/admin/communications` + new `/employee/photos`
**Category:** Parent experience
**Friction addressed:** Parents want daily visual updates. Staff takes photos but has no structured capture system.

**What to build:**
- Employee photo upload page (`/employee/photos`):
  - Camera capture button (uses `navigator.mediaDevices.getUserMedia`)
  - File upload fallback for gallery selection
  - Auto-tag: classroom (from employee profile), date (auto), activity type (dropdown: art, outdoor, circle time, free play, meals, nap prep, special event)
  - Batch upload: up to 5 photos per submission
  - Caption field: one line per photo (optional)
  - Submit button stores to Supabase Storage bucket `daily-photos`
- Admin review page (`/admin/communications/photos`):
  - Grid view of all photos uploaded today, grouped by classroom
  - Approve/reject toggle per photo
  - Auto-generate parent update: select approved photos, generate formatted daily summary
  - Push to parent dashboard `/dashboard/photos`
- Parent dashboard integration:
  - `/dashboard/photos` page: chronological feed of approved daily photos
  - Filter by child's classroom
  - Heart/like reaction (stored in Supabase, visible to staff as engagement metric)
- Compliance tracking:
  - Dashboard alert if a classroom has zero photos by 2 PM
  - Weekly summary: photos per classroom per day, engagement rate from parents

**New components:**
- `src/components/employee/PhotoCapture.tsx`
- `src/components/employee/PhotoUploadForm.tsx`
- `src/components/admin/PhotoReviewGrid.tsx`
- `src/components/admin/DailyUpdateGenerator.tsx`
- `src/components/dashboard/PhotoFeed.tsx`

**Data:**
- New Supabase table: `daily_photos` (id, classroom_id, employee_id, photo_url, caption, activity_type, status: pending|approved|rejected, created_at)
- New Supabase table: `photo_reactions` (id, photo_id, parent_id, type: heart, created_at)
- Supabase Storage bucket: `daily-photos`

---

## Priority tier: HIGH (owner time + systems + visibility)

### Tool 03: Digital task board with time blocks
**Route:** Enhances existing `/admin/tasks`
**Category:** Time management
**Friction addressed:** Christina is the single point of dependency. No visibility into where her time goes.

**What to build:**
- Time-block view on admin tasks page:
  - Kanban board (using existing `@dnd-kit` dependency) with columns: To Do, In Progress, Done
  - Each card shows: task name, estimated time, assigned to, category badge, due date
  - Categories match friction domains: Operations (blue), Compliance (orange), Parent Comms (purple), Staff (green), Admin (gray)
  - Drag-and-drop between columns
- Daily schedule view:
  - Toggle from kanban to timeline view
  - 30-minute blocks from 6 AM to 6 PM
  - Drag tasks into time blocks
  - Color-coded by category
  - Shows which center each task belongs to (Center 1 / Center 2 / Both)
- Delegation tracker:
  - Each task has an "assignable to" field (dropdown of staff)
  - Filter view: "Tasks only Christina can do" vs "Tasks that could be delegated"
  - Weekly summary: % of Christina's time on delegatable vs non-delegatable tasks
  - Delegation score (0-100): higher = more distributed, target = 60+
- Auto-generated insights:
  - "You spent 12 hours on compliance this week. That's 3x more than operations."
  - "8 tasks were delegatable but still done by you."

**New components:**
- `src/components/admin/TaskKanban.tsx`
- `src/components/admin/TimeBlockSchedule.tsx`
- `src/components/admin/DelegationTracker.tsx`
- `src/components/admin/TimeInsights.tsx`

**Data:**
- Extend existing `tasks.ts` types: add `estimatedMinutes`, `category`, `centerId`, `delegatableTo`, `timeBlockStart`, `timeBlockEnd`
- New localStorage key: `task-time-blocks-{date}`

---

### Tool 04: State authorization tracking dashboard
**Route:** New `/admin/pipeline/authorizations`
**Category:** Enrollment
**Friction addressed:** Tracking which children have current state authorizations, which are expiring, which need renewal.

**What to build:**
- Authorization status grid:
  - List all enrolled children with columns: child name, authorization type, start date, end date, days remaining, status badge
  - Status: Active (green), Expiring Soon (yellow, <30 days), Expired (red), Pending (blue)
  - Sort by expiration date ascending (most urgent first)
- Automated alerts:
  - Dashboard alert at 60, 30, and 14 days before expiration
  - Alert severity escalates: info → warning → critical
  - Option to send parent reminder from the alert card (links to messaging)
- Renewal tracking:
  - When parent submits renewal documents, mark as "renewal pending"
  - Track average renewal processing time
  - Monthly report: renewals completed, renewals overdue, revenue at risk from expired authorizations

**New components:**
- `src/components/admin/AuthorizationGrid.tsx`
- `src/components/admin/AuthorizationAlerts.tsx`
- `src/components/admin/RenewalTracker.tsx`

**Data:**
- New Supabase table: `child_authorizations` (id, child_id, auth_type, start_date, end_date, status, renewal_submitted_at, renewal_approved_at, notes)
- Extend `getDashboardAlerts()` in `smart-dashboard.ts`

---

### Tool 05: Staff knowledge capture system
**Route:** New `/admin/staff/knowledge-base`
**Category:** Institutional memory
**Friction addressed:** When staff leave, their knowledge leaves with them. Procedures live in people's heads.

**What to build:**
- Knowledge base editor:
  - Uses existing TipTap editor dependency (`@tiptap/react`, `@tiptap/starter-kit`)
  - Categories: Daily Procedures, Emergency Protocols, Classroom Routines, Parent Communication Templates, Compliance Checklists, Vendor Contacts, Equipment Instructions
  - Each entry: title, category, content (rich text), last updated, author
  - Search bar with full-text search across all entries
- Staff contribution flow:
  - Employee portal gets "Share what you know" button
  - Simple form: title, category, content
  - Admin reviews and publishes
- Version history:
  - Track edits with timestamp and author
  - Rollback capability
- Onboarding integration:
  - Tag entries as "required reading for new staff"
  - Track which new employees have read which entries

**New components:**
- `src/components/admin/KnowledgeBaseEditor.tsx`
- `src/components/admin/KnowledgeBaseSearch.tsx`
- `src/components/admin/KnowledgeEntry.tsx`
- `src/components/employee/KnowledgeContribution.tsx`

**Data:**
- New Supabase table: `knowledge_entries` (id, title, category, content_html, author_id, status: draft|published, is_onboarding_required, created_at, updated_at)
- New Supabase table: `knowledge_reads` (id, entry_id, employee_id, read_at)
- New Supabase table: `knowledge_versions` (id, entry_id, content_html, edited_by, edited_at)

---

### Tool 06: Digital onboarding pathway
**Route:** New `/admin/hr/onboarding` + enhances `/employee` portal
**Category:** Staffing
**Friction addressed:** Orientation is a hiring bottleneck. No structured path from hire to classroom-ready.

**What to build:**
- Onboarding checklist builder (admin):
  - Ordered list of onboarding tasks grouped by phase: Pre-Start, Day 1, Week 1, Month 1
  - Each task: title, description, responsible person, due offset (days from start date), required document (link to knowledge base entry), verification method (self-check, supervisor sign-off, quiz)
  - Template system: save and reuse for each new hire
- New employee onboarding view:
  - Employee portal shows onboarding progress when `isOnboarding: true`
  - Visual progress bar: phase completion percentage
  - Task list with checkboxes (self-check items) and "request sign-off" buttons (supervisor items)
  - Links to knowledge base articles marked as required reading
  - Timeline showing which tasks are due when
- Admin tracking:
  - `/admin/hr/onboarding` shows all active onboarding employees
  - Status: ahead of schedule (green), on track (blue), behind (yellow), blocked (red)
  - Average time to full onboarding completion across all hires

**New components:**
- `src/components/admin/OnboardingBuilder.tsx`
- `src/components/admin/OnboardingTracker.tsx`
- `src/components/employee/OnboardingChecklist.tsx`
- `src/components/employee/OnboardingProgress.tsx`

**Data:**
- New Supabase table: `onboarding_templates` (id, name, tasks_json, created_at)
- New Supabase table: `onboarding_assignments` (id, employee_id, template_id, start_date, status, created_at)
- New Supabase table: `onboarding_task_completions` (id, assignment_id, task_index, completed_at, verified_by, verification_method)
- Extend `employee.ts` types: add `isOnboarding: boolean`, `onboardingAssignmentId: string`

---

### Tool 07: Cross-site operations dashboard
**Route:** New `/admin/operations`
**Category:** Operations
**Friction addressed:** Christina drives between centers. No real-time view of both sites.

**What to build:**
- Split-view dashboard:
  - Side-by-side cards for Center 1 and Center 2
  - Each card shows: attendance count, staff present, staff-child ratio (with compliance color), open incidents, supply requests, parent messages pending
  - Real-time (refreshes every 60 seconds via Supabase Realtime or polling)
  - Conditional formatting: green (nominal), yellow (attention), red (action required)
- Daily check-in form (employee):
  - Staff at each center submit by 9 AM: attendance count, staff present, any incidents, supply needs, notes
  - Form auto-fills known data (enrolled children count, scheduled staff)
  - Takes 2 minutes to complete
- Alert engine:
  - Staff-child ratio below legal minimum: immediate red alert
  - No check-in submitted by 9:30 AM: yellow alert
  - Supply request pending > 2 days: orange alert
- Historical comparison:
  - Weekly trend charts per center: attendance, ratio, incidents
  - Spot patterns: "Center 2 consistently runs lower ratio on Fridays"

**New components:**
- `src/components/admin/OperationsSplitView.tsx`
- `src/components/admin/CenterCard.tsx`
- `src/components/admin/OperationsAlerts.tsx`
- `src/components/admin/CenterTrends.tsx`
- `src/components/employee/DailyCheckIn.tsx`

**Data:**
- New Supabase table: `daily_checkins` (id, center_id, submitted_by, date, attendance_count, staff_present, incidents_note, supply_needs, notes, submitted_at)
- New localStorage key: `operations-alert-config`

---

## Priority tier: MEDIUM (growth + optimization)

### Tool 08: Automated enrollment funnel
**Route:** Enhances existing `/admin/inquiries` + `/admin/pipeline`
**Category:** Growth
**Friction addressed:** No tracking from initial inquiry to enrolled child. Leads fall through cracks.

**What to build:**
- Funnel visualization:
  - Pipeline stages: Inquiry → Tour Scheduled → Tour Completed → Application → Waitlist → Enrolled → Active
  - Visual funnel chart (Recharts) showing count at each stage
  - Conversion rate between each stage
  - Average time in each stage
- Automated follow-ups:
  - Configurable follow-up reminders per stage (e.g., 3 days after tour with no application = reminder)
  - Template messages per stage (links to existing messaging system)
  - Dashboard alert for stale leads (no movement in X days)
- Lead source tracking:
  - Where did the inquiry come from: website, referral, drive-by, social media, other
  - Source conversion rates: which sources produce enrolled families?
- Revenue projection:
  - Each pipeline stage has a probability weight
  - Projected monthly revenue from current pipeline
  - Show gap between projected and capacity

**New components:**
- `src/components/admin/EnrollmentFunnel.tsx`
- `src/components/admin/PipelineBoard.tsx`
- `src/components/admin/LeadSourceChart.tsx`
- `src/components/admin/RevenueProjection.tsx`

**Data:**
- New Supabase table: `enrollment_pipeline` (id, child_name, parent_name, parent_email, parent_phone, stage, lead_source, inquiry_date, last_activity, notes, assigned_to)
- New Supabase table: `pipeline_activities` (id, pipeline_id, activity_type, notes, created_at, created_by)

---

### Tool 09: Nap time task optimizer
**Route:** Enhances `/admin/tasks` + `/employee/tasks`
**Category:** Operations
**Friction addressed:** Nap time (12:30-2:30) is the only window for admin tasks. It's unstructured and wasted.

**What to build:**
- Nap time task queue:
  - Filtered view of tasks tagged as "nap-time-appropriate"
  - Auto-sorted by priority and estimated time
  - Target: fit tasks into 90-minute window (accounting for 30 min of monitoring/settling)
  - Visual timer showing remaining nap window
  - "What can I finish in X minutes?" filter
- Employee nap-time view:
  - When clock hits 12:30, employee portal shows nap-time task list
  - Pre-populated with their assigned tasks that fit the window
  - One-tap "start task" and "complete task" with timestamp
- Admin optimization:
  - See what got done during nap time across both centers
  - Identify tasks that consistently don't fit (need to be reassigned to non-nap time)

**New components:**
- `src/components/admin/NapTimeOptimizer.tsx`
- `src/components/employee/NapTimeTaskList.tsx`
- `src/components/admin/NapTimeReport.tsx`

**Data:**
- Extend tasks types: add `isNapTimeAppropriate: boolean`, `startedAt: string`, `completedAt: string`

---

### Tool 10: CACFP compliance tracker
**Route:** Enhances existing `/admin/food-counts` + `/admin/compliance`
**Category:** Revenue protection
**Friction addressed:** CACFP compliance requires specific documentation. Missing docs = audit risk = revenue risk.

**What to build:**
- Compliance checklist:
  - Monthly CACFP requirements: meal counts submitted, menu on file, attendance records match meal counts, staff training current, kitchen inspection current
  - Each item: status (complete/incomplete/overdue), due date, responsible person
  - Auto-check items that have data (e.g., meal counts auto-verified from food-counts page)
- Audit preparation:
  - "Audit ready" score (0-100%)
  - Gap report: what's missing before you're audit-ready
  - Document upload for supporting evidence (stored in Supabase Storage)
- Revenue protection dashboard:
  - Monthly reimbursement tracker: expected vs actual
  - Identify discrepancies: meal counts submitted but not reimbursed
  - Annual revenue trend from CACFP

**New components:**
- `src/components/admin/CACFPComplianceChecklist.tsx`
- `src/components/admin/AuditReadinessScore.tsx`
- `src/components/admin/ReimbursementTracker.tsx`

**Data:**
- New Supabase table: `cacfp_compliance` (id, month, checklist_json, audit_score, notes, updated_at)
- Supabase Storage bucket: `compliance-docs`

---

### Tool 11: Parent communication hub
**Route:** Enhances existing `/admin/communications` + `/dashboard/messages`
**Category:** Parent experience
**Friction addressed:** Parent communication is scattered. No single place for all parent-facing messages.

**What to build:**
- Unified communication center:
  - Tabs: Announcements (one-to-many), Individual Messages (one-to-one), Daily Updates (auto from photos), Templates
  - Compose with audience selector: all parents, classroom, individual
  - Schedule send: pick date/time for future delivery
  - Read receipts: track which parents opened messages
- Template library:
  - Pre-built templates: closure notice, illness notification, field trip permission, supply request, fee reminder, positive update
  - Editable templates with merge fields: {child_name}, {classroom}, {date}
- Communication log:
  - Searchable history of all messages sent
  - Filter by type, recipient, date range
  - Response tracking: which messages got parent replies

**New components:**
- `src/components/admin/CommunicationHub.tsx`
- `src/components/admin/MessageComposer.tsx`
- `src/components/admin/TemplateLibrary.tsx`
- `src/components/admin/CommunicationLog.tsx`
- `src/components/dashboard/ParentInbox.tsx`

**Data:**
- New Supabase table: `communications` (id, type: announcement|individual|daily_update, subject, body_html, audience_type, audience_ids, scheduled_for, sent_at, created_by)
- New Supabase table: `communication_reads` (id, communication_id, parent_id, read_at)

---

### Tool 12: Staff scheduling optimizer
**Route:** Enhances existing `/admin/scheduling`
**Category:** Staffing
**Friction addressed:** Scheduling is manual. No optimization for ratio compliance or cost.

**What to build:**
- Smart schedule builder:
  - Input: staff availability, required ratios per classroom, enrollment by classroom
  - Output: optimized weekly schedule that minimizes overtime while maintaining ratios
  - Highlight gaps: times when ratio is below minimum
  - Highlight waste: times when ratio is way above minimum (overstaffed)
- Swap/cover request flow:
  - Staff requests time off via employee portal (existing `/employee/schedule-request`)
  - System identifies who can cover based on availability and qualifications
  - Admin approves swap with one click
  - Auto-updates schedule
- Cost view:
  - Weekly labor cost projection based on schedule
  - Compare planned vs actual hours
  - Overtime alerts before they happen

**New components:**
- `src/components/admin/ScheduleOptimizer.tsx`
- `src/components/admin/RatioComplianceView.tsx`
- `src/components/admin/LaborCostProjection.tsx`
- `src/components/admin/CoverageRequests.tsx`

**Data:**
- Extend scheduling types: add `hourlyRate`, `isOvertime`, `ratioAtTime`
- New localStorage key: `schedule-optimization-config`

---

### Tool 13: Delegation engine
**Route:** Enhances `/admin/tasks`
**Category:** Time management
**Friction addressed:** Christina does everything. Delegation is an afterthought.

**What to build:**
- Task delegation wizard:
  - When creating a task, system suggests: "This looks like a [category] task. [Staff name] has handled similar tasks before."
  - Delegation confidence score based on: staff training completion, past task history, current workload
  - One-click delegate with notification to assigned staff
- Delegation dashboard:
  - Pie chart: Christina's tasks vs delegated tasks (this week)
  - Trend line: delegation ratio over time (target: trending up)
  - "Delegation wins": completed delegated tasks with time saved estimate
  - "Stuck delegations": tasks assigned to others but not progressing
- Staff capability matrix:
  - Grid: staff vs task categories
  - Color: green (proven), yellow (training), red (not qualified)
  - Identifies delegation bottlenecks: "Only Christina and Maria can handle compliance tasks"

**New components:**
- `src/components/admin/DelegationWizard.tsx`
- `src/components/admin/DelegationDashboard.tsx`
- `src/components/admin/StaffCapabilityMatrix.tsx`

**Data:**
- Extend tasks types: add `delegatedTo`, `delegatedAt`, `delegationScore`
- New Supabase table: `staff_capabilities` (id, employee_id, category, level: proven|training|not_qualified, verified_at)

---

### Tool 14: Tour experience standardizer
**Route:** New `/admin/pipeline/tours`
**Category:** Growth
**Friction addressed:** Tours are the first impression. Inconsistent tours = inconsistent enrollment.

**What to build:**
- Tour checklist:
  - Step-by-step tour script: greeting, intro, classroom visit order, Q&A points, next steps
  - Checkable by whoever gives the tour (mobile-friendly)
  - Customizable per center
- Tour scheduling:
  - Calendar integration (uses existing `react-day-picker`)
  - Available tour slots (configurable by admin)
  - Parent self-schedules via link (no login required)
  - Confirmation and reminder notifications
- Post-tour follow-up:
  - Auto-generate follow-up message template after tour
  - Track: tour completed → follow-up sent → application received
  - Tour feedback form (optional, sent to parent 24 hours after)

**New components:**
- `src/components/admin/TourChecklist.tsx`
- `src/components/admin/TourScheduler.tsx`
- `src/components/admin/TourFollowUp.tsx`
- `src/app/(public)/schedule-tour/page.tsx` (public-facing, no auth)

**Data:**
- New Supabase table: `tours` (id, parent_name, parent_email, parent_phone, scheduled_date, scheduled_time, center_id, status: scheduled|completed|no_show|cancelled, checklist_completed, follow_up_sent_at, feedback_json)

---

### Tool 15: Supply and inventory tracker
**Route:** Enhances existing `/admin/inventory`
**Category:** Operations
**Friction addressed:** Supply tracking is manual. Running out of supplies disrupts classrooms.

**What to build:**
- Inventory list with thresholds:
  - Items grouped by category: classroom supplies, cleaning, food/kitchen, office, first aid, outdoor
  - Each item: name, current quantity, minimum threshold, reorder quantity, preferred vendor, unit cost
  - Auto-alert when quantity drops below threshold
- Staff restock requests:
  - Employee portal: "Request supplies" button
  - Simple form: item, classroom, urgency (need today / need this week / routine restock)
  - Admin sees all requests in a queue
- Spending tracker:
  - Monthly supply spend by category
  - Compare month-over-month
  - Budget vs actual per category
- Reorder automation:
  - One-click "generate reorder list" based on items below threshold
  - Export to CSV or PDF for ordering

**New components:**
- `src/components/admin/InventoryList.tsx`
- `src/components/admin/RestockQueue.tsx`
- `src/components/admin/SupplySpendChart.tsx`
- `src/components/admin/ReorderGenerator.tsx`
- `src/components/employee/SupplyRequest.tsx`

**Data:**
- New Supabase table: `inventory_items` (id, name, category, current_qty, min_threshold, reorder_qty, vendor, unit_cost, center_id, updated_at)
- New Supabase table: `supply_requests` (id, item_id, requested_by, classroom, urgency, status: pending|fulfilled|denied, created_at)
- New Supabase table: `supply_orders` (id, items_json, total_cost, ordered_at, received_at)

---

### Tool 16: Staff development tracker
**Route:** Enhances existing `/admin/staff` + `/employee/training`
**Category:** Staffing
**Friction addressed:** No systematic tracking of staff skills, certifications, or professional development.

**What to build:**
- Certification tracker:
  - Per-employee: CPR/First Aid expiration, state licensing, food handler cert, mandatory training completion
  - Auto-alert at 90, 60, 30 days before expiration
  - Red/yellow/green status per employee
- Training log:
  - Record: training name, date, hours, provider, certificate upload
  - Annual training hours per employee
  - Compliance: state-required hours met vs remaining
- Professional development plan:
  - Goals per employee (set during reviews)
  - Track progress toward goals
  - Suggested training based on capability gaps (links to Tool 13 staff capability matrix)

**New components:**
- `src/components/admin/CertificationTracker.tsx`
- `src/components/admin/TrainingLog.tsx`
- `src/components/admin/DevPlanTracker.tsx`
- `src/components/employee/MyTraining.tsx`
- `src/components/employee/MyCertifications.tsx`

**Data:**
- New Supabase table: `certifications` (id, employee_id, cert_type, issued_date, expiry_date, document_url, status)
- New Supabase table: `training_records` (id, employee_id, training_name, date, hours, provider, certificate_url)
- New Supabase table: `dev_goals` (id, employee_id, goal_text, target_date, status, progress_notes)

---

## Priority tier: STANDARD (communication + compliance + growth)

### Tool 17: Incident and communication log
**Route:** Enhances existing `/admin/incidents`
**Category:** Compliance
**Friction addressed:** Incident documentation is inconsistent. No link between incident and parent communication about it.

**What to build:**
- Structured incident form:
  - Fields: date, time, child involved, witnesses, description, action taken, parent notified (yes/no/when), follow-up needed
  - Required fields enforced (can't skip parent notification field)
  - Photo upload for documentation
- Parent notification link:
  - From incident form, one-click "notify parent" with pre-populated message
  - Track: incident created → parent notified → parent acknowledged
  - Flag incidents where parent was NOT notified within 24 hours
- Reporting:
  - Incident frequency by type, classroom, time of day, staff on duty
  - Trend analysis: are incidents increasing or decreasing?
  - Compliance report: % of incidents with complete documentation

**New components:**
- `src/components/admin/IncidentForm.tsx`
- `src/components/admin/IncidentTimeline.tsx`
- `src/components/admin/IncidentAnalytics.tsx`

**Data:**
- Extend existing incidents types: add `parentNotifiedAt`, `parentAcknowledgedAt`, `photoUrls`, `followUpRequired`, `followUpCompletedAt`

---

### Tool 18: Weekly family newsletter generator
**Route:** New feature on `/admin/communications`
**Category:** Parent experience
**Friction addressed:** No regular parent communication cadence. Updates are ad hoc.

**What to build:**
- Newsletter builder:
  - Auto-populated sections: weekly photo highlights (from Tool 02), upcoming events (from calendar), menu highlights (from food system), classroom spotlight
  - Editable template with drag-and-drop sections
  - Preview mode (desktop and mobile)
  - Schedule send: Friday afternoons recommended
- Content suggestions:
  - Pull from activity log: "This week in the Butterfly Room: 12 art projects, 5 outdoor sessions, 2 special visitors"
  - Pull from milestones: "Congratulations to Maya who learned to write her name!"
  - Admin edits and approves before send
- Archive:
  - All past newsletters browsable by parents on `/dashboard/news`
  - Search by date or keyword

**New components:**
- `src/components/admin/NewsletterBuilder.tsx`
- `src/components/admin/NewsletterPreview.tsx`
- `src/components/admin/ContentSuggestions.tsx`
- `src/components/dashboard/NewsletterArchive.tsx`

**Data:**
- New Supabase table: `newsletters` (id, subject, body_html, sections_json, status: draft|scheduled|sent, scheduled_for, sent_at, created_by)

---

### Tool 19: Revenue forecasting tool
**Route:** Enhances existing `/admin/financial`
**Category:** Growth
**Friction addressed:** No forward-looking financial view. Revenue surprises are the norm.

**What to build:**
- Monthly revenue projections:
  - Inputs: current enrollment x rate per child, CACFP reimbursement estimate, pipeline weighted forecast (from Tool 08)
  - 3-month rolling forecast
  - Scenario modeling: "What if enrollment drops by 2?" / "What if we add 3 from waitlist?"
- Expense tracking:
  - Monthly fixed costs (rent, insurance, utilities)
  - Variable costs (staff labor from Tool 12, supplies from Tool 15)
  - Margin calculation: revenue - expenses = operating margin
- Financial health dashboard:
  - Cash flow chart (Recharts)
  - Key metrics: revenue per child, cost per child, break-even enrollment count
  - Red flags: "Operating margin below 10%" or "Cash reserves below 2 months expenses"

**New components:**
- `src/components/admin/RevenueProjection.tsx`
- `src/components/admin/ScenarioModeler.tsx`
- `src/components/admin/FinancialDashboard.tsx`
- `src/components/admin/CashFlowChart.tsx`

**Data:**
- New Supabase table: `financial_records` (id, month, revenue_tuition, revenue_cacfp, revenue_other, expenses_labor, expenses_supplies, expenses_fixed, expenses_other, notes)
- New Supabase table: `revenue_scenarios` (id, name, assumptions_json, projected_revenue, projected_margin, created_at)

---

### Tool 20: Meeting efficiency system
**Route:** Enhances existing `/admin/meetings`
**Category:** Communication
**Friction addressed:** Meetings run long, lack agendas, and produce no tracked action items.

**What to build:**
- Meeting planner:
  - Agenda builder: timed sections (topic, duration, presenter, purpose: inform/discuss/decide)
  - Total time calculator (flag if agenda exceeds meeting slot)
  - Share agenda with attendees before meeting
- During-meeting mode:
  - Timer per agenda item (visual countdown)
  - Real-time notes capture (TipTap editor)
  - Decision capture: "We decided X" with owner and due date
  - Action item capture: task, owner, due date (auto-creates task in Tool 03)
- Post-meeting:
  - Auto-generate meeting summary from notes
  - Action items auto-populate on admin task board
  - Follow-up: track whether action items from this meeting were completed
  - Meeting effectiveness score: % of action items completed by next meeting

**New components:**
- `src/components/admin/MeetingPlanner.tsx`
- `src/components/admin/MeetingTimer.tsx`
- `src/components/admin/MeetingNotes.tsx`
- `src/components/admin/MeetingSummary.tsx`
- `src/components/admin/ActionItemTracker.tsx`

**Data:**
- Extend existing meetings types: add `agenda_json`, `notes_html`, `decisions_json`, `action_items_json`, `effectiveness_score`

---

## Build phases

### Phase 1: Revenue protection (Tools 01, 10)
Enhance existing food-counts page with reminders, compliance tracking, and revenue impact. These directly recover money.

### Phase 2: Parent experience (Tools 02, 11, 18)
Photo workflow, communication hub, newsletter generator. These directly improve retention.

### Phase 3: Owner time liberation (Tools 03, 07, 09, 13)
Task board, cross-site dashboard, nap time optimizer, delegation engine. These give Christina her time back.

### Phase 4: Staff systems (Tools 05, 06, 12, 16)
Knowledge base, onboarding, scheduling optimizer, development tracker. These reduce staffing friction.

### Phase 5: Growth engine (Tools 04, 08, 14, 19)
Authorization tracking, enrollment funnel, tour standardizer, revenue forecasting. These drive sustainable growth.

### Phase 6: Compliance and communication (Tools 15, 17, 20)
Inventory tracker, incident log, meeting efficiency. These close operational gaps.

---

## Integration map

Tools don't exist in isolation. Key connections:

- Tool 01 (meal reminders) feeds data into Tool 10 (CACFP compliance)
- Tool 02 (photos) feeds content into Tool 18 (newsletters)
- Tool 03 (task board) receives action items from Tool 20 (meetings)
- Tool 04 (authorizations) feeds alerts into Tool 08 (enrollment funnel)
- Tool 05 (knowledge base) provides content for Tool 06 (onboarding)
- Tool 07 (cross-site dashboard) uses data from Tool 12 (scheduling) and Tool 15 (inventory)
- Tool 08 (enrollment funnel) feeds projections into Tool 19 (revenue forecasting)
- Tool 13 (delegation) uses data from Tool 16 (staff development)

Every tool uses the existing component library (shadcn/ui), follows the christina-red/blue/yellow/green/coral color system, and integrates with the existing admin dashboard alert system.
