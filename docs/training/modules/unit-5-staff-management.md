# Unit 5: Scheduling and Staff Management

**Modules:** M18, M19, M20, M21
**Roles:** Directors (Tier 3), Owner (Tier 4)
**Total Time:** 3.5 hours (facilitated + self-paced)
**Core Truth:** Labor is 56% of your expenses. Every scheduling decision is a financial decision.

---

## M18: Staff Scheduling

**Format:** Facilitated session (60 min) with hands-on practice
**Roles:** Directors (Tier 3), Owner (Tier 4)
**URL:** `/admin/scheduling`

### Learning Outcomes

By the end of this module, participants will:

1. Build a full weekly schedule using drag-and-drop
2. Read and respond to ratio compliance indicators in real time
3. Project labor costs before publishing a schedule
4. Process coverage requests from staff
5. Publish the schedule so staff see it on their portal

### Facilitator Notes

Open this session by asking: "How long does it take you to build next week's schedule right now?" Most directors say 45 minutes to 2 hours using paper or spreadsheets. By the end of this session, that drops to 15 minutes, and the schedule will be smarter because the system checks ratios and costs for you.

Start with a blank week. Do not use a pre-built template for the first exercise. Participants need to feel the drag-and-drop workflow from scratch before they appreciate templates.

Common energy killer: participants get stuck trying to make a "perfect" schedule on their first attempt. Remind them that the system flags problems in real time. They do not need to hold all the constraints in their head.

### Step-by-Step Platform Walkthrough

**Step 1: Open the Scheduling Dashboard**
Navigate to `/admin/scheduling`. You will see the current week's schedule in a grid view: classrooms across the top, time blocks down the left side, staff names in the cells.

[Screenshot: Scheduling dashboard with weekly grid view showing 4 classrooms and time blocks from 6:30 AM to 6:00 PM]

**Step 2: Start a New Week**
Click "Next Week" in the top navigation bar. The system may offer to copy the current week as a starting point. For this exercise, start from blank.

**Step 3: Drag-and-Drop Staff Assignment**
The staff roster appears in a sidebar panel on the right. Each staff member shows their role, certified age groups, and weekly hours so far.

To assign: drag a staff name from the roster and drop it into a classroom/time block cell. The cell highlights green if the assignment is valid, yellow if it creates a ratio concern, red if it violates a ratio requirement.

[Screenshot: Drag-and-drop in progress with staff member being placed into a classroom cell, ratio indicator showing green]

**Step 4: Ratio Compliance Checking**
As you place staff, the ratio bar at the top of each classroom column updates in real time. It shows:

- Current staff count vs. required staff for enrolled children
- Color-coded status: green (compliant), yellow (at minimum), red (violation)
- Age group breakdown if the classroom has mixed ages

Click the ratio bar to expand the detail view. This shows exact numbers: "Toddler Room: 8 children, 2 staff required, 2 assigned."

[Screenshot: Ratio compliance panel expanded showing per-classroom breakdown with green/yellow/red indicators]

**Step 5: Labor Cost Projection**
Click "Cost View" in the top toolbar. The schedule grid now overlays estimated labor cost per day and per week. Each staff member's cell shows their hourly rate multiplied by scheduled hours. The weekly total appears at the bottom.

Watch for: overtime indicators. Any staff member approaching 40 hours shows an orange clock icon. Clicking it shows projected overtime cost if the schedule stands.

[Screenshot: Cost view overlay showing daily totals, weekly total, and one staff member with orange overtime warning icon]

**Step 6: Handle Coverage Requests**
Coverage requests from staff appear in the notification bell. Open `/admin/scheduling` and look for the "Coverage Requests" tab. Each request shows:

- Who is requesting off
- Which shifts need coverage
- Suggested replacements (system recommends based on availability and certification)

To approve: click the request, review the suggested replacement, and drag the replacement into the open slot. The system re-checks ratios automatically.

[Screenshot: Coverage request panel with original staff member, requested date, and system-suggested replacement]

**Step 7: Publish the Schedule**
When all cells are filled and all ratio indicators are green, click "Publish." Staff receive a notification on their employee portal. They can view their schedule at `/employee/schedule`.

Published schedules are locked. To make changes after publishing, click "Edit Published" which creates an amendment and notifies affected staff of the change.

### Discussion Questions

1. "Right now, what happens when someone calls in sick at 6 AM? Walk through your current process from phone call to coverage. Where does it break down?"

2. "If you could see that a staff member is heading toward overtime by Wednesday, what would you do differently for Thursday and Friday?"

3. "How would you use the cost view to have a conversation with the owner about hiring a part-time floater?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Scheduling the same person in two classrooms at once | Dragging quickly without checking | System warns with a red overlap indicator. Always check the "Conflicts" panel before publishing. |
| Ignoring yellow ratio warnings | "We usually make it work" | Yellow means one absence puts you out of compliance. Treat yellow as a problem to solve, not a status to accept. |
| Publishing without checking overtime | Focused on coverage, not cost | Always switch to Cost View before publishing. Make it the last step every time. |
| Not using the copy-from-last-week feature | Trying to build from scratch every time | After your first good week, use "Copy Week" as your starting template. Edit exceptions instead of rebuilding. |

### Handout: Staff Scheduling Quick Reference

**Your Weekly Scheduling Checklist**

- [ ] Wednesday: Open next week's schedule at `/admin/scheduling`
- [ ] Copy last week as template (or start fresh if major changes)
- [ ] Drag staff into open slots; watch ratio indicators
- [ ] Switch to Cost View; check for overtime warnings
- [ ] Review any pending coverage requests
- [ ] Thursday noon: Publish the schedule
- [ ] Daily: Check coverage requests in notification bell

**Ratio Requirements (Minnesota)**

| Age Group | Staff:Child Ratio | Max Group Size |
|-----------|------------------|----------------|
| Infant (6 wks - 16 mo) | 1:4 | 8 |
| Toddler (16 mo - 33 mo) | 1:7 | 14 |
| Preschool (33 mo - 5 yr) | 1:10 | 20 |
| School Age (5+) | 1:15 | 30 |

**Keyboard Shortcuts**

- `Ctrl+C` / `Cmd+C`: Copy selected shift
- `Ctrl+V` / `Cmd+V`: Paste shift to new cell
- `Tab`: Move to next time block
- `Esc`: Cancel current drag operation

### Screenshots Needed

1. Weekly grid view with 4 classrooms populated
2. Drag-and-drop mid-action with green highlight
3. Ratio compliance panel expanded
4. Cost view overlay with overtime warning
5. Coverage request notification panel
6. Published schedule confirmation dialog

---

## M19: HR and Document Management

**Format:** Self-paced (20 min)
**Roles:** Directors (Tier 3), Owner (Tier 4)
**URL:** `/admin/hr`

### Learning Outcomes

By the end of this module, participants will:

1. Create HR documents from built-in templates
2. Track document status (draft, signed, filed)
3. Maintain digital employee files
4. Record discipline actions with proper documentation trail

### Facilitator Notes

This module is self-paced, but flag it during the Unit 5 facilitated session as critical liability protection. The key message: "If it's not documented in the system, it didn't happen." HR documentation protects the center against wrongful termination claims, unemployment disputes, and licensing investigations.

For directors who have never managed HR documentation before, pair this module with a brief conversation about what constitutes a documentable event vs. a verbal coaching moment.

### Step-by-Step Platform Walkthrough

**Step 1: Access the HR Dashboard**
Navigate to `/admin/hr`. The dashboard shows:

- Active employees with document status indicators
- Pending documents requiring signatures
- Expiring certifications (links to M17)
- Recent HR actions

[Screenshot: HR dashboard showing employee list with document status badges - green checkmarks for complete files, yellow warnings for missing items]

**Step 2: Create a Document from Template**
Click "New Document" and choose from templates:

- Written Warning
- Performance Improvement Plan
- Attendance Notice
- Policy Acknowledgment
- Offer Letter
- Separation Notice

Select a template, choose the employee, and fill in the specifics. The template provides the structure and required legal language. You add the facts.

[Screenshot: Document template selection screen showing 6 template options with brief descriptions]

**Step 3: Track Document Status**
Every document moves through a workflow: Draft > Sent > Signed > Filed. The employee list shows badges for each status. Click any employee to see their complete document history.

[Screenshot: Individual employee HR file showing document timeline with status badges]

**Step 4: Manage Discipline Records**
Discipline records are a specific document type with escalation tracking. The system shows the progression: verbal warning > written warning > final warning > termination. Each step references the previous one, building a defensible chain of documentation.

### Discussion Questions

1. "Think of a time when you wished you had written something down about a staff performance issue. What would have been different if that documentation existed?"

2. "How do you currently handle the gap between a verbal coaching conversation and a formal written warning? Where does information get lost?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Backdating discipline records | Trying to document something that happened weeks ago | Document the same day. If you missed it, note the actual date of the incident and the date of documentation separately. |
| Using free-text instead of templates | Templates feel too formal | Templates include legally protective language. Free-text documents may miss critical elements that protect you in a dispute. |
| Not getting signatures | Uncomfortable asking staff to sign | Digital signatures are built in. Send the document through the system; the employee signs on their portal. No awkward paper exchange. |

### Handout: HR Documentation Quick Reference

**Document Within 24 Hours**

Any of these events requires a document in the system:

- Performance concern discussed with employee
- Attendance issue (late, no-show, pattern)
- Policy violation observed
- Positive performance recognition (yes, document good things too)
- Schedule of a formal coaching or improvement plan
- Any conversation where you say "this needs to change"

**The Documentation Formula**

1. Date and time of incident
2. What happened (facts only, no interpretation)
3. What policy or expectation it relates to
4. What was discussed with the employee
5. What the employee said in response
6. What happens next (action items, timeline, consequences)

### Screenshots Needed

1. HR dashboard with employee list and status badges
2. Document template selection screen
3. Individual employee HR file with document timeline
4. Discipline escalation tracker showing progression
5. Digital signature workflow

---

## M20: Payroll Management

**Format:** Self-paced (20 min) + facilitated walkthrough (30 min)
**Roles:** Owner (Tier 4)
**URL:** `/admin/payroll`

### Learning Outcomes

By the end of this module, participants will:

1. Review and approve time entries for all staff
2. Identify and flag overtime before it becomes a cost problem
3. Generate pay stubs for each pay period
4. Reconcile hours between the schedule and actual time worked
5. Catch common time entry errors before processing payroll

### Facilitator Notes

This module is owner-only because payroll touches every dollar in the business. The facilitator should walk through a complete payroll cycle using real (or realistic) data. The goal is not to replace the accountant or payroll service; the goal is to catch errors and understand labor costs before the numbers leave the building.

Start by asking: "How confident are you right now that every hour on last week's payroll was accurate?" Most owners say 70-80%. This module targets 95%+ confidence.

Sensitive topic: some staff may have time entry habits that inflate hours (clocking in early, clocking out late). Address this directly but without accusation. The system provides visibility. What the owner does with that visibility is a management decision, not a software decision.

### Step-by-Step Platform Walkthrough

**Step 1: Open the Payroll Dashboard**
Navigate to `/admin/payroll`. The dashboard shows:

- Current pay period dates
- Total hours logged across all staff
- Total projected labor cost
- Flags for overtime, missed punches, and discrepancies

[Screenshot: Payroll dashboard with pay period summary showing total hours, projected cost, and 3 flag indicators]

**Step 2: Review Time Entries**
Click "Time Entries" to see the detailed view. Each row shows one staff member with:

- Scheduled hours vs. actual hours
- Clock-in and clock-out times for each shift
- Variance column (actual minus scheduled)
- Any flagged entries (late clock-in, early clock-out, missed punch)

Sort by variance to find the biggest discrepancies first. Click any row to see the day-by-day breakdown.

[Screenshot: Time entry review table with columns for staff name, scheduled hours, actual hours, variance, and flag icons]

**Step 3: Flag and Resolve Overtime**
The system automatically flags any staff member approaching or exceeding 40 hours. The overtime section shows:

- Current weekly hours for each flagged employee
- Projected overtime cost if no changes are made
- Suggested schedule adjustments to avoid overtime

Review each flag. If overtime was pre-approved, mark it as "Approved." If it was unplanned, investigate the cause and decide whether to adjust the remaining schedule.

[Screenshot: Overtime flagging panel showing 2 employees approaching 40 hours with projected cost and suggested adjustments]

**Step 4: Handle Missed Punches**
Missed punches (forgot to clock in or out) show as incomplete entries with a yellow warning. Click the entry to add the missing time manually. The system logs who made the correction and when, creating an audit trail.

[Screenshot: Missed punch correction screen with fields for actual time, reason, and approver signature]

**Step 5: Generate Pay Stubs**
Once all entries are reviewed and approved, click "Generate Pay Stubs." The system calculates:

- Regular hours x hourly rate
- Overtime hours x 1.5 rate
- Any deductions or additions
- Net pay per employee

Review the summary before finalizing. Pay stubs are accessible to employees on their portal at `/employee/pay`.

[Screenshot: Pay stub generation summary showing all employees with regular hours, overtime, gross pay, deductions, net pay]

**Step 6: Export and Reconcile**
Click "Export" to download the payroll data as CSV or PDF. Use this to reconcile with your payroll service or accountant. The export includes all raw data, corrections, and approval timestamps.

### Discussion Questions

1. "What is one payroll error you have caught (or wish you had caught) in the past year? How much did it cost, and how would this system have flagged it?"

2. "If you could see overtime building by Wednesday every week, how would that change the way you manage Thursday and Friday staffing?"

3. "How do you currently verify that scheduled hours match actual hours worked? What falls through the cracks?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Approving payroll without reviewing variances | Rushing to meet the deadline | Block 30 minutes every Friday for payroll review. Never approve without checking the variance column. |
| Ignoring small time discrepancies | "It's only 10 minutes" | Ten minutes per day per employee across 8 staff = 6.5 hours/week of unplanned labor cost. Small leaks sink big ships. |
| Not correcting missed punches promptly | Waiting until payroll day to fix them | Correct missed punches the same day. Memory fades; accuracy drops with every day of delay. |
| Generating pay stubs before resolving all flags | Wanting to "just get it done" | The system warns you if unresolved flags exist. Resolve every flag before generating. No exceptions. |

### Handout: Payroll Processing Checklist

**Every Friday (30 minutes)**

- [ ] Open `/admin/payroll` and review the current pay period
- [ ] Sort time entries by variance (largest first)
- [ ] Investigate any variance over 30 minutes
- [ ] Resolve all missed punch flags
- [ ] Review overtime flags; approve or adjust
- [ ] Check that total hours match your budget expectation

**Every Pay Period (before submitting to payroll service)**

- [ ] Generate pay stubs in the system
- [ ] Review the summary for anything unexpected
- [ ] Export CSV/PDF for your accountant
- [ ] Archive the pay period (locks entries from further editing)

**Monthly Review**

- [ ] Compare total labor cost to budget at `/admin/budget`
- [ ] Identify any staff consistently over scheduled hours
- [ ] Look for overtime patterns (same person every week = scheduling problem, not a one-time issue)

### Screenshots Needed

1. Payroll dashboard with pay period summary
2. Time entry review table with variance column
3. Overtime flagging panel with projected costs
4. Missed punch correction dialog
5. Pay stub generation summary
6. Export options (CSV/PDF)

---

## M21: Staff Onboarding

**Format:** Self-paced (15 min) + facilitated onboarding design session (45 min)
**Roles:** Directors (Tier 3), Owner (Tier 4)
**URL:** `/admin/hr/onboarding`

### Learning Outcomes

By the end of this module, participants will:

1. Create a structured onboarding pathway for a new hire
2. Assign checklist tasks with deadlines and responsible parties
3. Track new hire progress through the onboarding timeline
4. Verify that all compliance items are completed before the new hire works unsupervised
5. Customize the onboarding pathway for different roles (teacher, aide, floater, cook)

### Facilitator Notes

This is one of the highest-impact modules in the entire curriculum. Staff turnover in childcare averages 30-40% annually. Every new hire costs $3,000-5,000 in recruiting, training, and lost productivity. Structured onboarding reduces turnover by 25%, which means this module pays for itself with the first hire it retains.

The facilitated session should include building a real onboarding pathway, not a hypothetical one. Ask participants: "Who is your next hire likely to be? What role? Let's build their onboarding pathway right now."

The compliance angle is non-negotiable. Minnesota licensing requires specific training and documentation before a new employee can be counted in ratios. If onboarding is incomplete, that employee cannot legally supervise children alone. The system tracks this.

### Step-by-Step Platform Walkthrough

**Step 1: Open the Onboarding Dashboard**
Navigate to `/admin/hr/onboarding`. The dashboard shows:

- Active onboarding pathways (new hires currently in progress)
- Completed pathways (historical record)
- Template library (reusable onboarding blueprints)
- Compliance status for each new hire

[Screenshot: Onboarding dashboard showing 2 active pathways with progress bars and 1 completed pathway]

**Step 2: Create a New Onboarding Pathway**
Click "New Pathway." Choose from a template or start blank.

Built-in templates include:

- Lead Teacher Onboarding (21 days, 35 tasks)
- Assistant Teacher Onboarding (14 days, 25 tasks)
- Floater/Substitute Onboarding (7 days, 18 tasks)
- Kitchen Staff Onboarding (10 days, 20 tasks)

Select a template and assign it to the new hire. The system pre-fills tasks, deadlines, and responsible parties based on the template.

[Screenshot: Template selection screen with 4 role-specific templates showing task count and duration]

**Step 3: Customize the Checklist**
The pathway appears as a checklist organized into phases:

**Phase 1: Before Day 1 (Pre-boarding)**
- [ ] Background check submitted
- [ ] Employment paperwork signed (offer letter, W-4, I-9)
- [ ] Portal account created
- [ ] First-week schedule sent
- [ ] Mentor assigned

**Phase 2: Day 1**
- [ ] Building tour and safety walkthrough
- [ ] Meet the team introductions
- [ ] Classroom assignment and supplies
- [ ] System login and portal training (M01-M03)
- [ ] Emergency procedures review

**Phase 3: Week 1**
- [ ] Shadow experienced teacher (2 full days)
- [ ] Complete kiosk training (M04)
- [ ] Complete attendance tracking training (M05)
- [ ] Complete meal count training (M06)
- [ ] First solo meal count submission (observed)
- [ ] Daily check-in with mentor (15 min)

**Phase 4: Month 1**
- [ ] All Unit 2 modules complete (M05-M09)
- [ ] Incident reporting training (M16)
- [ ] Certification verification in system (M17)
- [ ] 30-day performance check-in with director
- [ ] Transition from supervised to independent

Each task can be edited: change the deadline, reassign the responsible person, add notes, or mark as not applicable for this hire.

[Screenshot: Checklist view with 4 phases expanded, showing task names, due dates, assigned person, and completion checkboxes]

**Step 4: Track Progress**
The progress bar at the top of each pathway shows overall completion percentage. Click into any phase to see which tasks are done, which are overdue, and which are upcoming.

Overdue tasks appear in red with the number of days past due. The system sends automatic reminders to the responsible person at 1 day before due and on the due date.

[Screenshot: Progress tracking view showing 62% complete, with 3 overdue items highlighted in red]

**Step 5: Compliance Items**
Compliance tasks are flagged with a shield icon. These cannot be marked as "not applicable" and must be completed before the system allows the new hire to be scheduled independently (without a supervising staff member in the same room).

Compliance items include:

- Background check clearance
- CPR/First Aid certification
- Mandated reporter training
- Health screening documentation
- Minnesota DHS orientation training

The compliance status panel shows a clear pass/fail for each item. All items must show green before the new hire moves to independent status.

[Screenshot: Compliance panel showing 5 required items with 3 green checks and 2 pending yellow indicators]

**Step 6: Close the Pathway**
When all tasks are complete, click "Complete Onboarding." The system:

- Archives the pathway as a permanent record
- Updates the employee's HR file
- Changes the employee's status from "Onboarding" to "Active"
- Notifies the director and owner

### Discussion Questions

1. "Think about the last person you hired. What fell through the cracks during their first month? How would a checklist with automatic reminders have changed that?"

2. "What is one thing you wish every new hire knew by the end of their first week that they currently do not learn until month two or three?"

3. "How do you currently track whether a new hire has completed all required compliance training before they work unsupervised? What is the risk if something is missed?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Skipping the pre-boarding phase | "They start Monday, we'll figure it out" | Pre-boarding tasks should begin the moment the offer is accepted. Portal access, paperwork, and schedule should be ready before day 1. |
| Not assigning a mentor | Assumes the new hire will "figure it out" | Assign a specific mentor for every new hire. The system tracks mentor check-ins. Mentorship is the single strongest predictor of retention. |
| Marking compliance items complete without verification | Trusting the employee's word | Compliance items require documentation upload (certificate, clearance letter). The system does not accept a checkbox alone for compliance tasks. |
| Using the same template for every role | Convenience | A kitchen staff onboarding is fundamentally different from a lead teacher onboarding. Use role-specific templates. Customize further for site-specific needs. |
| Abandoning the pathway after week 1 | "They seem fine" | The 30-day check-in catches problems that week 1 cannot reveal. Complete the full pathway. Early abandonment correlates with higher turnover. |

### Handout: Onboarding Timeline Quick Reference

**Before Day 1**

| Task | Responsible | Deadline |
|------|------------|----------|
| Background check submitted | Owner/Director | Offer + 1 day |
| Employment paperwork completed | New hire | Offer + 3 days |
| Portal account created | Director | Start date - 2 days |
| Mentor assigned | Director | Start date - 2 days |
| First-week schedule sent | Director | Start date - 1 day |

**Day 1**

| Task | Responsible | Duration |
|------|------------|----------|
| Building tour and safety review | Mentor | 30 min |
| Team introductions | Director | 15 min |
| Classroom setup and supplies | Mentor | 30 min |
| Portal login and basic navigation | Mentor | 20 min |
| Emergency procedures | Director | 15 min |

**Week 1 Milestones**

- Shadow an experienced teacher for 2 full days
- Complete first solo meal count (observed by mentor)
- Log in to all required system modules
- Daily 15-minute check-in with mentor

**Month 1 Milestones**

- All compliance certifications verified in system
- All Unit 2 platform training modules complete
- 30-day performance check-in with director
- Transition from "supervised" to "independent" scheduling status

### Screenshots Needed

1. Onboarding dashboard with active and completed pathways
2. Template selection screen with role-specific options
3. Full checklist view with 4 phases and task details
4. Progress tracking with overdue items highlighted
5. Compliance panel with pass/fail indicators
6. Completed pathway archive confirmation

---

## Unit 5 Capstone Exercise

**Time:** 30 minutes
**Format:** Hands-on scenario

**Scenario:** It is Wednesday morning. You need to:

1. Build next week's schedule for 8 staff across 4 classrooms (M18)
2. A coverage request came in: Maria needs Friday off (M18)
3. Review this week's time entries before Friday payroll (M20)
4. A new assistant teacher starts next Monday (M21)

Work through all four tasks in the platform. Your facilitator will observe and provide feedback using the Director Competency Rubric.

**Success Criteria:**

- Schedule is ratio-compliant and published
- Coverage for Maria's absence is arranged
- All time entry flags are resolved
- Onboarding pathway is created and pre-boarding tasks are assigned

---

## Unit 5 Cost Impact Summary

| Module | Annual Impact | How |
|--------|-------------|-----|
| M18 Scheduling | $10,000-20,000 saved | Overtime reduction, optimized coverage |
| M19 HR Docs | $10,000-50,000 risk avoided | Protection against wrongful termination claims |
| M20 Payroll | $5,000-15,000 saved | Time entry error correction, overtime prevention |
| M21 Onboarding | $3,000-5,000 per retained hire | Reduced turnover through structured onboarding |

**Combined Unit 5 Impact:** $28,000-90,000 in annual savings and risk reduction. This is the unit that pays for the entire platform.
