# Christina's Child Care Center: Platform Training Curriculum Guide

**Version:** 1.0
**Date:** April 2026
**Platform:** christinas-childcare.vercel.app
**Sites:** Brooklyn Park and Crystal centers

---

## Executive Summary

This is the master training document for the Christina's Child Care Center operations platform. It covers every portal, every friction tool, and every daily workflow your team will touch.

The platform has 97 pages across three portals (admin, employee, parent dashboard) plus an iPad kiosk. It was built to solve 20 specific friction points identified in a friction assessment of both centers. Those friction points fall into six categories: revenue protection, parent experience, time management, enrollment growth, institutional memory, and operational efficiency.

This curriculum organizes training into 30 modules across 8 units, delivered through 4 role-based pathways. Each pathway gives people exactly what they need and nothing they don't.

### Who This Is For

| Role | What They Learn | Time Investment |
|------|----------------|-----------------|
| Parents and families | Check in at kiosk, view photos, read daily reports, message staff, manage family profile | 1.5 hours over 2 weeks |
| Employees and staff | Daily operations (attendance, meals, photos, tasks, incidents), plus basic compliance | 7 hours over 4 weeks |
| Directors and lead teachers | Everything staff learn, plus scheduling, HR, enrollment, CACFP compliance, and communication | 15.5 hours over 6 weeks |
| Owner/Admin (Christina) | The full system: all 30 modules including financial intelligence and strategic leadership | 23.5 hours over 8 weeks |

### What to Expect After Training

**For families:** No more lost paper forms. Real-time photos of your child's day. Messages that actually get through. A profile you control and update yourself.

**For staff:** Clear task lists instead of sticky notes. Meal counts submitted on time (protecting revenue). Incident reports filed correctly the first time. Certifications tracked so nothing expires by surprise.

**For directors:** A weekly schedule that accounts for ratios and labor costs. An enrollment pipeline that shows where every prospect stands. CACFP audit readiness you can check on a Monday morning, not panic about once a year.

**For the owner:** A single screen showing both centers. Financial data that lets you make decisions before problems become crises. Delegation tools that free up 5 to 10 hours per week. Strategic planning that moves from "we should do that someday" to tracked priorities with deadlines.

---

## Architecture Overview

### 8 Units, 30 Modules, 4 Pathways

```
UNIT 1: Getting Started (M01-M04)
    Everyone starts here. Login, navigation, profiles, kiosk.

UNIT 2: Daily Rhythms (M05-M09)
    The heartbeat of the center. Attendance, meals, photos, tasks, daily reports.

UNIT 3: Communication & Family Engagement (M10-M13)
    Building trust and retention through consistent communication.

UNIT 4: Compliance & Safety (M14-M17)
    The modules that keep the license on the wall and children safe.

UNIT 5: Scheduling & Staff Management (M18-M21)
    Where labor costs meet operational reality.

UNIT 6: Growth & Enrollment (M22-M25)
    Filling seats and keeping them filled.

UNIT 7: Financial Intelligence (M26-M28)
    Making money decisions with data instead of gut feeling.

UNIT 8: Strategic Leadership (M29-M30)
    Running the business, not just the building.
```

### 4 Pathways (Role-Based)

```
Pathway 1: Parent/Family ............ 8 modules  |  1.5 hrs  |  2 weeks
Pathway 2: Employee/Staff .......... 16 modules  |  7 hrs    |  4 weeks
Pathway 3: Director/Lead Teacher ... 24 modules  | 15.5 hrs  |  6 weeks
Pathway 4: Owner/Admin ............. 30 modules  | 23.5 hrs  |  8 weeks
```

Each pathway includes everything from the pathway below it. Directors learn everything staff learn. The owner learns everything directors learn. This means Christina can troubleshoot any question from any role because she has been through the same training.

---

## Role Access Matrix

This table shows which modules each role receives. An "X" means the module is required for that role.

| Module | Title | Parent | Employee | Director | Owner |
|--------|-------|:------:|:--------:|:--------:|:-----:|
| M01 | Welcome and Login | X | X | X | X |
| M02 | Navigating Your Portal | X | X | X | X |
| M03 | Your Profile and Settings | X | X | X | X |
| M04 | Kiosk Check-In/Check-Out | X | X | X | |
| M05 | Attendance Tracking | | X | X | X |
| M06 | Meal Count Submission (CACFP) | | X | X | X |
| M07 | Daily Photo Upload | | X | X | |
| M08 | Task Management | | X | X | X |
| M09 | Daily Reports | X (view) | X | X | X |
| M10 | Parent-Staff Messaging | X | X | X | X |
| M11 | Newsletters and Announcements | | | X | X |
| M12 | Parent Portal Mastery | X | | | |
| M13 | Notification Management | X | X | | |
| M14 | CACFP Compliance Deep Dive | | | X | X |
| M15 | Ratio Monitoring and Compliance | | X | X | X |
| M16 | Incident Reporting | | X | X | X |
| M17 | Certifications and Training Tracking | | X | X | X |
| M18 | Staff Scheduling | | | X | X |
| M19 | HR and Document Management | | | X | X |
| M20 | Payroll Management | | | | X |
| M21 | Staff Onboarding | | | X | X |
| M22 | Enrollment Pipeline | | | X | X |
| M23 | Tour Management | | | X | X |
| M24 | Authorization Tracking | | | X | X |
| M25 | Public Website and Marketing | | | | X |
| M26 | Budget Planning and Tracking | | | | X |
| M27 | Revenue Forecasting | | | | X |
| M28 | Cost Optimization | | | | X |
| M29 | Cross-Site Operations | | | | X |
| M30 | Strategic Planning and Continuous Improvement | | | | X |

**Module counts per role:** Parent: 8 | Employee: 16 | Director: 24 | Owner: 30

---

## Full Module Catalog

### UNIT 1: Getting Started

Foundation skills. Everyone starts here.

---

#### M01: Welcome and Login

**Roles:** All (Tiers 1 through 4)
**Format:** Self-paced (5 min) plus paper quick-start card
**Portal Pages:** Login pages (`/login`, `/admin-login`, `/employee-login`), kiosk (`/kiosk`)

**Learning Outcomes:**
- Log in to the correct portal for your role
- Understand what role-based access means (you see what you need, not everything)
- Reset your PIN or password without calling for help

**Assessment:** Completion; successful login to the correct portal.

**Daily Habits to Build:**
- Bookmark your portal URL on your phone or tablet
- Check the dashboard as soon as you arrive each morning

**Cost Impact:** Every "how do I log in?" call to Christina is 5 to 10 minutes of her time. With 15 staff across two centers, even one call per person per month adds up to 2.5 hours of wasted director time monthly.

**Friction Tools Covered:** None directly; this is the gateway to all 20 tools.

---

#### M02: Navigating Your Portal

**Roles:** All (Tiers 1 through 4)
**Format:** Self-paced (10 min) with interactive walkthrough
**Portal Pages:** All portal dashboards (`/admin`, `/employee`, `/dashboard`), bottom navigation (mobile)

**Learning Outcomes:**
- Find any page within 2 clicks from your dashboard
- Understand the portal layout: sidebar navigation (desktop) and bottom tabs (mobile)
- Use quick-action buttons on the dashboard for common tasks

**Assessment:** Navigation scavenger hunt. Find 5 specific pages in under 2 minutes.

**Daily Habits to Build:**
- Start each session from the dashboard, not from a bookmarked deep link
- Use quick-action buttons instead of navigating through menus

**Cost Impact:** Reduces "where do I find X?" questions by roughly 80%. That question is currently one of the top three interruptions Christina handles daily.

**Friction Tools Covered:** Smart Dashboard (Tool 07, cross-site overview for admin portal)

---

#### M03: Your Profile and Settings

**Roles:** All (Tiers 1 through 4)
**Format:** Self-paced (10 min)
**Portal Pages:** `/employee/profile`, `/dashboard` (family settings), `/admin/settings`

**Learning Outcomes:**
- Update personal information (address, phone, photo)
- Manage emergency contacts
- Set notification preferences (what alerts you receive and how)
- Upload a profile photo

**Assessment:** Profile completeness check. All required fields filled, emergency contacts current, photo uploaded.

**Daily Habits to Build:**
- Review your profile once per quarter
- Update emergency contacts immediately when they change

**Cost Impact:** Complete profiles mean complete compliance records. Every incomplete employee profile is a licensing risk. Every incomplete family profile means staff have to chase down information manually, which costs roughly 15 minutes per family.

**Friction Tools Covered:** Notification preferences (Tool 11, parent communication hub)

---

#### M04: Kiosk Check-In/Check-Out

**Roles:** Parents (Tier 1), Employees (Tier 2), Directors (Tier 3)
**Format:** Facilitated demo at the kiosk (5 min) plus paper card with PIN
**Portal Pages:** `/kiosk`

**Learning Outcomes:**
- Enter your PIN on the iPad kiosk
- Check in and check out each child (parents) or yourself (staff)
- Understand the auto-reset timer (kiosk returns to welcome screen after inactivity)

**Assessment:** Competency demonstration. Check in at the kiosk with a supervisor watching. Must complete without assistance.

**Daily Habits to Build:**
- Check in immediately when you walk through the door
- Check out before you leave the building, every time, no exceptions

**Cost Impact:** Accurate attendance records drive accurate CACFP reimbursement. Each child's daily CACFP claim is worth $2 to $5 depending on meal counts. One missed check-in can mean one missed claim. Across 40 children over a year, even a 5% error rate in attendance tracking costs $2,000 to $4,000 in lost reimbursement.

**Strategy Change:** Replaces paper sign-in sheets. Eliminates lost records, illegible handwriting, and end-of-day guessing about who was actually present.

**Friction Tools Covered:** Attendance tracking (feeds Tools 01 and 10, meal counts and CACFP compliance)

---

### UNIT 2: Daily Rhythms

The heartbeat of the center. What happens every single day.

---

#### M05: Attendance Tracking

**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (15 min) plus facilitated scenario session (30 min)
**Portal Pages:** `/admin/attendance`, `/admin/ratios`

**Learning Outcomes:**
- View real-time attendance by classroom
- Identify absent children and understand why that matters for ratios
- Understand how attendance changes throughout the day affect staffing needs

**Assessment:** Scenario exercise. "A parent calls at 10 AM saying their child is sick. Walk through what you do in the system: mark absent, check ratios, notify the kitchen about meal count."

**Daily Habits to Build:**
- Check the attendance dashboard at 9:30 AM (after the arrival rush settles)
- Flag any discrepancy between physical headcount and digital count immediately

**Cost Impact:** Accurate daily counts drive CACFP claims and ratio compliance. Inaccurate attendance is a double risk: it can trigger licensing violations (understaffed for the number of children present) and cost you reimbursement (claiming meals for children who weren't there, or missing claims for children who were).

**Strategy Change:** Replaces manual headcounts and paper rosters that get filled out after the fact.

**Friction Tools Covered:** Cross-site operations dashboard (Tool 07), ratio monitoring

---

#### M06: Meal Count Submission (CACFP Revenue Protection)

**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (15 min) plus facilitated session on CACFP basics (45 min)
**Portal Pages:** `/admin/food-counts`, `/employee/meal-count`, `/admin/compliance`

**Learning Outcomes:**
- Submit meal counts before each deadline (breakfast by 9:30 AM, lunch by 1:30 PM, snacks on time)
- Use the pre-fill feature to save time on repetitive counts
- Understand why counts equal money: each submitted count triggers a reimbursement claim

**Assessment:** Two parts. First, a knowledge check with 5 questions on CACFP deadlines and what happens when you miss them. Second, a competency rubric: 3 consecutive days of on-time submission with correct counts.

**Daily Habits to Build:**
- Submit counts within 15 minutes of each meal ending
- Never let a deadline indicator turn red
- If you are unsure about a count, submit your best estimate and flag it for review rather than submitting nothing

**Cost Impact:** This is the single highest-impact module in the entire curriculum. Each missed meal count loses $3 to $8 in reimbursement per child. A center with 40 children that misses just one meal count per week loses between $6,000 and $16,000 per year. That is not a rounding error; it is a staff salary.

**Strategy Change:** Replaces end-of-day paper tallies, which routinely miss counts and get rounded. The system captures counts in real time, at the point of service, which is what auditors want to see.

**Friction Tools Covered:** Automated meal count reminders (Tool 01), CACFP compliance tracker (Tool 10)

---

#### M07: Daily Photo Upload

**Roles:** Employees (Tier 2), Directors (Tier 3)
**Format:** Self-paced (10 min)
**Portal Pages:** `/employee/photos`, `/admin/communications/photos`, `/dashboard/photos`

**Learning Outcomes:**
- Upload photos with activity tags (art, outdoor, circle time, free play, meals, nap prep, special event)
- Write brief captions that help parents understand what their child was doing
- Understand the approval workflow: staff uploads, admin reviews, approved photos go to parents
- Batch upload up to 5 photos at once

**Assessment:** Competency check. Upload 3 properly tagged and captioned photos.

**Daily Habits to Build:**
- Take 3 to 5 photos during each activity block
- Upload during transitions or nap time, not during active supervision
- Think of photos as evidence of learning, not just decoration

**Cost Impact:** Parent engagement photos directly reduce family churn. Industry data shows that families who see daily photos of their child are roughly 40% less likely to leave the center. At $800 to $1,200 per child per month in tuition, retaining even 2 families per year through better communication is worth $19,000 to $29,000.

**Strategy Change:** Replaces "we forgot to take pictures this week" with a structured capture system that tracks completion by classroom.

**Friction Tools Covered:** Daily photo/video upload workflow (Tool 02), feeds into weekly newsletter (Tool 18)

---

#### M08: Task Management

**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (15 min) plus facilitated session on delegation (30 min, Tiers 3 and 4 only)
**Portal Pages:** `/admin/tasks`, `/employee/tasks`, `/employee/nap-tasks`, `/admin/tasks/assessment`

**Learning Outcomes:**
- View assigned tasks organized by time block
- Mark tasks complete with a timestamp
- Understand priority levels and what "urgent" actually means in this system
- Use the nap-time optimizer to pick and sequence tasks during the 90-minute nap window
- (Tiers 3 and 4): Create tasks, delegate to staff, track completion rates

**Assessment:** Scenario exercise. "It is nap time. You have 90 minutes. Show how you would pick tasks from your queue, start and complete them, and handle one that takes longer than expected."

**Daily Habits to Build:**
- Check the task board at the start of every shift
- Complete all assigned tasks before clocking out
- Use the nap window for admin tasks, not just cleanup

**Cost Impact:** Task completion tracking reveals where time actually goes, which is often very different from where people think it goes. The delegation engine saves the owner 5 to 10 hours per week by making it obvious which tasks can be handed off and to whom.

**Strategy Change:** Replaces sticky notes, verbal reminders, and the "I forgot" pattern that creates rework and dropped balls.

**Friction Tools Covered:** Digital task board with time blocks (Tool 03), nap time task optimizer (Tool 09), delegation engine (Tool 13)

---

#### M09: Daily Reports

**Roles:** Parents (Tier 1, view only), Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (10 min)
**Portal Pages:** `/admin/reports/daily`, `/dashboard` (parent view)

**Learning Outcomes:**
- View per-child daily summaries covering meals, naps, activities, and mood
- Understand what parents see on their end (the same data, formatted for families)
- Filter reports by classroom and date

**Assessment:** Completion plus a scenario exercise. "A parent arrives at pickup and asks what their child ate today and how nap went. Find the information and share it, either from memory or by pulling it up on a tablet."

**Daily Habits to Build:**
- Review daily reports at 4 PM, before parents start arriving for pickup
- Flag anything unusual (missed nap, didn't eat lunch, behavior note) before the parent asks about it

**Cost Impact:** Reduces parent anxiety calls during the day by roughly 60%. Professional daily reports are also a competitive differentiator; most home daycares and many small centers do not offer this.

**Strategy Change:** Replaces handwritten daily sheets that are often illegible, incomplete, or lost.

**Friction Tools Covered:** Cross-site dashboard reports (Tool 07)

---

### UNIT 3: Communication and Family Engagement

Building trust and retention through consistent communication.

---

#### M10: Parent-Staff Messaging

**Roles:** Parents (Tier 1), Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (10 min)
**Portal Pages:** `/admin/messaging`, `/dashboard/messages`

**Learning Outcomes:**
- Send and receive messages through the platform
- View conversation history with any parent or staff member
- Understand response time expectations (within 4 hours during business hours)

**Assessment:** Completion. Send a practice message and receive a response.

**Daily Habits to Build:**
- Check messages at the start and end of each day
- Respond within 4 hours during operating hours; acknowledge receipt even if a full answer takes longer

**Cost Impact:** Fast, documented parent communication reduces complaints and builds the kind of trust that keeps families enrolled. A message thread also creates a record, which protects both parties if there is ever a disagreement about what was said.

**Strategy Change:** Replaces hallway conversations that get forgotten and paper notes in cubbies that get lost.

**Friction Tools Covered:** Parent communication hub (Tool 11)

---

#### M11: Newsletters and Announcements

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (20 min) plus facilitated best practices session (30 min)
**Portal Pages:** `/admin/news`, `/admin/communications`, `/dashboard/news`

**Learning Outcomes:**
- Create a newsletter with multiple sections (photos, menu highlights, upcoming events, classroom spotlights)
- Schedule a send time (recommended: Friday by 3 PM)
- View read receipts to see which families opened the newsletter
- Use templates to save time on recurring formats

**Assessment:** Create and send a practice newsletter with 3 or more sections.

**Daily Habits to Build:**
- Publish a weekly newsletter every Friday by 3 PM
- Include a monthly parent spotlight (builds community)
- Check read rates; if a family never opens newsletters, follow up with a personal message

**Cost Impact:** Consistent newsletters project professionalism and keep families informed. They reduce "I didn't know about X" complaints, which waste staff time and damage trust.

**Strategy Change:** Replaces paper flyers that get crumpled in backpacks and never reach the other parent.

**Friction Tools Covered:** Weekly family newsletter generator (Tool 18), daily photo workflow feeds content (Tool 02)

---

#### M12: Parent Portal Mastery

**Roles:** Parents (Tier 1)
**Format:** Self-paced (15 min) plus paper welcome packet
**Portal Pages:** `/dashboard`, `/dashboard/photos`, `/dashboard/progress`, `/dashboard/children`, `/dashboard/documents`, `/dashboard/calendar`, `/dashboard/notifications`

**Learning Outcomes:**
- View your child's daily photos and progress reports
- Check the center calendar for closures, events, and holidays
- Update family information, allergies, and emergency contacts without calling the office
- Manage notification preferences

**Assessment:** Profile completeness. All children added, allergies documented, emergency contacts entered and current.

**Daily Habits to Build:**
- Check the portal 2 to 3 times per week
- Update information immediately when anything changes (new phone number, new emergency contact, new allergy)

**Cost Impact:** Complete family profiles mean complete compliance files. When parents self-serve their own data, the office saves roughly 15 minutes per family per update cycle. Across 40 families updating quarterly, that is 40 hours of admin time saved per year.

**Strategy Change:** Replaces annual paper registration forms that are outdated within 2 months.

**Friction Tools Covered:** Parent communication hub (Tool 11), notification preferences

---

#### M13: Notification Management

**Roles:** Parents (Tier 1), Employees (Tier 2)
**Format:** Self-paced (5 min)
**Portal Pages:** `/dashboard/notifications`, `/admin/notifications`

**Learning Outcomes:**
- Configure which notifications you receive (all, critical only, digest)
- Understand notification types: incidents (always on), schedule changes, meal reminders, newsletters, general updates
- Manage preferences so you get the right information at the right time

**Assessment:** Completion. Preferences configured and saved.

**Daily Habits to Build:**
- Keep critical notifications on at all times (incidents, schedule changes)
- Review the weekly digest if you have turned off individual notifications

**Cost Impact:** People who get the right notifications at the right time take the right action. People who get too many notifications ignore all of them. Getting this balance right is what makes the difference between a system people use and one they abandon.

**Friction Tools Covered:** Notification preferences (Tool 11, communication hub)

---

### UNIT 4: Compliance and Safety

The modules that keep the license on the wall and children safe.

---

#### M14: CACFP Compliance Deep Dive

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Facilitated PD session (60 min) with self-assessment
**Portal Pages:** `/admin/compliance`, `/admin/food-counts`

**Learning Outcomes:**
- Interpret the compliance dashboard: what green, yellow, and red mean and what to do about each
- Achieve and maintain a 90% or higher audit readiness score
- Understand how reimbursement calculations work (rates per meal type, documentation requirements)
- Generate compliance reports for auditors on demand

**Assessment:** Full PD model. Self-assessment (10 items on CACFP knowledge) followed by a scenario (audit simulation where the assessor plays the state auditor), then a reflection (what would I do differently?), and finally a growth plan for maintaining compliance.

**Daily Habits to Build:**
- Check the compliance dashboard every Monday morning
- Address any yellow or red item the same day it appears
- Never let "I'll get to it later" turn into "audit finding"

**Cost Impact:** CACFP audit failure results in suspended reimbursement. For a two-site operation, CACFP reimbursement is worth $40,000 to $80,000 per year. Suspension is not a fine you pay once; it is revenue that stops until you fix the problem and get re-approved, which can take months.

**Strategy Change:** Replaces the annual panic before audit with continuous readiness that you can verify any Monday.

**Friction Tools Covered:** CACFP compliance tracker (Tool 10), automated meal count reminders (Tool 01)

---

#### M15: Ratio Monitoring and Compliance

**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (15 min) plus facilitated scenario session (30 min)
**Portal Pages:** `/admin/ratios`, `/admin/attendance`

**Learning Outcomes:**
- Read the ratio dashboard and know instantly whether each classroom is in compliance
- Understand Minnesota state ratio requirements by age group
- Respond to ratio violations: who to call, how to rebalance, when to combine classrooms
- Know when a ratio issue becomes a licensing-reportable event

**Assessment:** Scenario exercise. "Two staff called in sick this morning. Show how you would check ratios across all classrooms, identify the problem rooms, and adjust coverage before 9 AM."

**Daily Habits to Build:**
- Check ratios at every transition point: arrival, nap, departure
- Never leave a room out of ratio, even for a bathroom break, without calling for coverage first

**Cost Impact:** A ratio violation is a licensing citation. Citations cost $500 to $5,000 in direct fines, but the real damage is to your license status. Repeated violations can lead to conditional licensing or closure. The platform catches ratio problems in real time, before they become citations.

**Strategy Change:** Replaces "counting heads" with real-time digital tracking that accounts for staff breaks, arrivals, and departures throughout the day.

**Friction Tools Covered:** Cross-site operations dashboard (Tool 07), staff scheduling optimizer (Tool 12)

---

#### M16: Incident Reporting

**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Facilitated session (45 min) with practice scenarios
**Portal Pages:** `/admin/incidents`, `/admin/incidents/log`, `/admin/incidents/training`

**Learning Outcomes:**
- File a complete incident report with all required fields
- Assign the correct severity level (minor, moderate, serious, critical)
- Notify parents through the system with a pre-populated message
- Understand the audit trail: every edit to an incident report is tracked with a timestamp and author
- Know which incidents are licensure-reportable under Minnesota law

**Assessment:** Competency rubric. A supervisor observes the staff member filing a practice incident report. All fields must be complete, severity must be correct, and parent notification must be sent.

**Daily Habits to Build:**
- File the incident report within 30 minutes of the event, while details are fresh
- Notify the parent the same day, always
- Follow up on every incident until it is resolved and documented as resolved

**Cost Impact:** Incomplete incident documentation creates liability exposure. In a lawsuit, what is not documented did not happen. Proper documentation protects the center, the staff member, and the family. A single undocumented incident that leads to litigation can cost $10,000 to $100,000.

**Strategy Change:** Replaces paper incident forms that get filled out days later (or never) and live in a folder nobody can find.

**Friction Tools Covered:** Incident and communication log (Tool 17)

---

#### M17: Certifications and Training Tracking

**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (10 min)
**Portal Pages:** `/employee/training`, `/employee/development`, `/admin/staff/development`

**Learning Outcomes:**
- View your certification status: what you hold, when each expires, what is coming due
- Understand the alert system: warnings at 90, 60, and 30 days before expiration
- Log training hours and upload certificates
- Request training through the system

**Assessment:** Completion. Verify that all your certifications are current and accurately recorded in the system.

**Daily Habits to Build:**
- Check your certification page once per month
- Never let a certification expire without a renewal already scheduled
- Log training hours the same day you complete them, not weeks later

**Cost Impact:** An expired certification means that staff member legally cannot work until it is renewed. That means scrambling for substitute coverage, which costs overtime. CPR certification alone, if it lapses for one person, can trigger a licensing finding. The tracking system prevents surprise expirations by giving everyone 90 days of advance notice.

**Strategy Change:** Replaces the wall calendar with Post-it notes and the phrase "I thought it was next month."

**Friction Tools Covered:** Staff development tracker (Tool 16)

---

### UNIT 5: Scheduling and Staff Management

Where labor costs meet operational reality.

---

#### M18: Staff Scheduling

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Facilitated session (60 min) with hands-on practice
**Portal Pages:** `/admin/scheduling`, `/admin/schedule-optimizer`, `/admin/salaried-scheduling`, `/admin/schedule-requests`, `/employee/schedule`, `/employee/schedule-request`

**Learning Outcomes:**
- Build a weekly schedule using drag-and-drop
- Check the ratio compliance view to ensure every time block meets state requirements
- Project weekly labor costs before publishing the schedule
- Handle coverage requests when staff call in or request time off
- Publish the schedule to staff so they see it on their phones

**Assessment:** Competency exercise. Build a compliant one-week schedule for 8 staff members across 4 classrooms, staying under the labor budget.

**Daily Habits to Build:**
- Draft next week's schedule by Wednesday
- Publish by Thursday at noon so staff can plan
- Check coverage requests daily and respond within 24 hours

**Cost Impact:** Labor is typically 56% of a childcare center's total expenses. Optimized scheduling reduces overtime by 15 to 20%. Even a 5% reduction in labor waste at a two-site operation saves $10,000 or more per year. The scheduling optimizer also prevents the expensive mistake of being overstaffed on low-enrollment days.

**Strategy Change:** Replaces the paper schedule on the wall that nobody updates and the group text thread where coverage swaps get lost.

**Friction Tools Covered:** Staff scheduling optimizer (Tool 12)

---

#### M19: HR and Document Management

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (20 min)
**Portal Pages:** `/admin/hr`, `/admin/staff`

**Learning Outcomes:**
- Create HR documents from templates (offer letters, write-ups, performance reviews)
- Track document status through the workflow (draft, pending signature, completed)
- Manage discipline records with proper documentation
- Maintain complete employee files that meet licensing requirements

**Assessment:** Knowledge check. 5 questions on the HR document workflow.

**Daily Habits to Build:**
- File all HR actions in the system the same day they happen
- Never rely on memory for discipline history; if it is not in the system, it did not happen

**Cost Impact:** Proper HR documentation protects against wrongful termination claims, which cost $10,000 to $50,000 per incident in legal fees and settlement even when you are in the right. Having a documented, timestamped record of performance conversations and progressive discipline is the difference between a defensible termination and a costly one.

**Friction Tools Covered:** Staff knowledge capture system (Tool 05)

---

#### M20: Payroll Management

**Roles:** Owner (Tier 4)
**Format:** Self-paced (20 min) plus facilitated walkthrough (30 min)
**Portal Pages:** `/admin/payroll`, `/employee/pay-stubs`

**Learning Outcomes:**
- Review time entries from the kiosk and manual clock-ins
- Generate pay stubs with correct calculations
- Identify and flag overtime before it hits the paycheck
- Reconcile hours between the schedule and actual clock data
- Approve payroll before it processes

**Assessment:** Competency exercise. Process a practice payroll run with correct calculations, catching at least one intentional error in the test data.

**Daily Habits to Build:**
- Review time entries every Friday afternoon
- Approve payroll by Monday morning
- Flag overtime the moment it appears, not after the pay period closes

**Cost Impact:** Catching time entry errors saves 2 to 5% of labor costs. At a typical childcare labor budget, that is $4,000 to $10,000 per year. Overtime visibility also prevents budget overruns; you cannot manage what you cannot see.

**Strategy Change:** Replaces manual timesheet calculations and paper pay stubs that create disputes.

**Friction Tools Covered:** Staff scheduling optimizer data (Tool 12), cross-site operations data (Tool 07)

---

#### M21: Staff Onboarding

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (15 min) plus facilitated onboarding design session (45 min)
**Portal Pages:** `/admin/hr/onboarding`, `/employee/onboarding`

**Learning Outcomes:**
- Create a digital onboarding pathway with tasks grouped by phase (Pre-Start, Day 1, Week 1, Month 1)
- Assign checklist tasks to new hires with due dates and verification methods
- Track new hire progress from the admin view
- Ensure all compliance items (background check, certifications, training) are completed on time

**Assessment:** Scenario exercise. "A new hire starts Monday. Build their complete onboarding pathway, including required knowledge base articles, supervisor sign-offs, and compliance documents."

**Daily Habits to Build:**
- Start digital onboarding before the new hire's first day (send them login info and pre-start tasks)
- Check progress at day 1, end of week 1, and end of month 1
- Do not mark onboarding complete until every item is verified

**Cost Impact:** Structured onboarding reduces first-year turnover by roughly 25%. Each staff replacement costs $3,000 to $5,000 in recruiting, training, and lost productivity during the transition. If you lose 4 staff per year and structured onboarding prevents even one of those departures, the training pays for itself immediately.

**Strategy Change:** Replaces "follow Sarah around for a week and figure it out," which is neither consistent nor auditable.

**Friction Tools Covered:** Digital onboarding pathway (Tool 06), staff knowledge capture system (Tool 05)

---

### UNIT 6: Growth and Enrollment

Filling seats and keeping them filled.

---

#### M22: Enrollment Pipeline

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (15 min) plus facilitated sales strategy session (45 min)
**Portal Pages:** `/admin/pipeline`, `/admin/pipeline/enrollment`, `/admin/inquiries`

**Learning Outcomes:**
- Track every prospect through the funnel: Inquiry, Tour Scheduled, Tour Completed, Application, Waitlist, Enrolled, Active
- Identify stalled leads (no movement in more than 5 days) and take action
- Understand conversion rates between stages and what they tell you about your process
- Set follow-up reminders so no inquiry falls through the cracks

**Assessment:** Scenario exercise. "You have 5 inquiries from last week. Walk through how you would move each one through the pipeline, including follow-up messages and status updates."

**Daily Habits to Build:**
- Review the pipeline every Monday morning
- Follow up on stalled leads within 48 hours
- Log every single inquiry immediately, even a casual phone call, because the ones you forget are the ones that would have enrolled

**Cost Impact:** Each enrolled child represents $800 to $1,200 per month in tuition revenue. Converting just 2 additional leads per quarter, leads that would have otherwise fallen through the cracks, adds $20,000 to $30,000 per year.

**Strategy Change:** Replaces sticky notes on the desk and "I think someone called last week but I can't remember their name."

**Friction Tools Covered:** Automated enrollment funnel (Tool 08)

---

#### M23: Tour Management

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (10 min) plus facilitated tour best practices session (30 min)
**Portal Pages:** `/admin/pipeline/tours`, `/schedule-tour` (public-facing)

**Learning Outcomes:**
- Schedule tours using the calendar system
- Use the digital tour checklist during the visit
- Enable parent self-scheduling via the public website link
- Send follow-up templates within 2 hours of the tour
- Track tour feedback to improve the experience

**Assessment:** Competency exercise. Conduct a mock tour using the digital checklist and send the follow-up within the required window.

**Daily Habits to Build:**
- Confirm tours 24 hours before the scheduled time
- Send a thank-you message within 2 hours after every tour
- Follow up at 48 hours if the family has not responded

**Cost Impact:** Standardized tours convert roughly 30% better than ad-hoc walkthroughs. If you give 4 tours per month and your conversion rate goes from 25% to 33%, that is one extra enrolled family per quarter, worth $10,000 to $14,000 per year.

**Friction Tools Covered:** Tour experience standardizer (Tool 14)

---

#### M24: Authorization Tracking

**Roles:** Directors (Tier 3), Owner (Tier 4)
**Format:** Self-paced (15 min)
**Portal Pages:** `/admin/pipeline/authorizations`

**Learning Outcomes:**
- Monitor state authorization status for every enrolled child
- Respond to expiry alerts at the 60, 30, and 14 day marks
- Track renewal processing from submission to approval
- Understand revenue-at-risk calculations (children whose authorizations are about to lapse)

**Assessment:** Knowledge check covering authorization types, renewal deadlines, and the financial consequences of lapsed authorizations.

**Daily Habits to Build:**
- Check the authorization dashboard weekly
- Start the renewal process at the 60-day alert, not the 14-day panic

**Cost Impact:** A lapsed authorization means the child cannot attend, which means lost tuition revenue and a damaged relationship with the family. If authorizations lapse for even 2 children per quarter, that is $3,200 to $7,200 in lost revenue plus the risk that those families do not come back.

**Friction Tools Covered:** State authorization tracking dashboard (Tool 04)

---

#### M25: Public Website and Marketing

**Roles:** Owner (Tier 4)
**Format:** Self-paced (15 min)
**Portal Pages:** `/` (homepage), `/about`, `/programs`, `/gallery`, `/blog`, `/faq`, `/enroll`, `/guide`, `/signup-guide`

**Learning Outcomes:**
- Understand what families see on the public website (about page, program descriptions, photo gallery, FAQ, enrollment form)
- Manage enrollment form submissions that come through the website
- Keep gallery photos and program descriptions current

**Assessment:** Completion.

**Daily Habits to Build:**
- Review inquiry submissions from the website daily
- Update gallery photos monthly with current, approved images
- Check that all program descriptions and rates are accurate after any pricing change

**Cost Impact:** A professional web presence reduces the cost per lead compared to paid advertising. Families research centers online before calling; a dated or empty website sends them to the next result.

**Friction Tools Covered:** Enrollment funnel (Tool 08, website inquiries feed the pipeline)

---

### UNIT 7: Financial Intelligence

Making money decisions with data instead of gut feeling.

---

#### M26: Budget Planning and Tracking

**Roles:** Owner (Tier 4)
**Format:** Facilitated session (60 min) with hands-on budget exercise
**Portal Pages:** `/admin/budget`, `/admin/financial`

**Learning Outcomes:**
- Set an annual budget by category (labor, supplies, occupancy, food, insurance, professional development)
- Track actual spending against budget monthly
- Interpret variance reports: where you are over, where you are under, and what it means
- Export data to Excel for your accountant
- Compare budget performance across both sites

**Assessment:** Full PD model. Self-assessment on financial literacy, followed by a scenario (analyze a month with a 15% labor variance and propose 2 corrective actions), then reflection and an action plan.

**Daily Habits to Build:**
- Review budget versus actual on the 1st of every month
- Investigate any category with variance greater than 10%
- Share a monthly financial snapshot with your accountant or bookkeeper

**Cost Impact:** Budget visibility prevents "where did the money go?" conversations in March that should have been caught in October. Centers that track monthly catch overspending an average of 6 weeks earlier than those who review quarterly.

**Strategy Change:** Replaces shoebox receipts and the quarterly surprise from the accountant.

**Friction Tools Covered:** Revenue forecasting tool (Tool 19), supply and inventory spending data (Tool 15)

---

#### M27: Revenue Forecasting

**Roles:** Owner (Tier 4)
**Format:** Facilitated session (45 min)
**Portal Pages:** `/admin/financial/forecasting`

**Learning Outcomes:**
- Read revenue projections based on current enrollment, rates, and CACFP reimbursement
- Run "what-if" scenarios: What happens if enrollment drops by 3? What if you raise rates by $25/week?
- Understand the P&L (profit and loss) statement the system generates
- Interpret optimization suggestions from the platform

**Assessment:** Scenario exercise. "Enrollment drops by 3 children next month. Model the financial impact and identify 2 concrete responses you could implement within 30 days."

**Daily Habits to Build:**
- Run the forecast once per month
- Model scenarios before making any pricing, staffing, or expansion decision
- Compare last month's forecast to actual results to calibrate your projections

**Cost Impact:** Proactive forecasting prevents cash flow surprises. The most expensive financial problem in childcare is not a big loss; it is a slow leak you do not notice until the account is short. Scenario planning builds margin by giving you options before you need them.

**Friction Tools Covered:** Revenue forecasting tool (Tool 19), enrollment pipeline data (Tool 08)

---

#### M28: Cost Optimization

**Roles:** Owner (Tier 4)
**Format:** Facilitated session (45 min)
**Portal Pages:** `/admin/financial`, `/admin/budget`, `/admin/supplies`

**Learning Outcomes:**
- Interpret the expense breakdown by category
- Identify optimization opportunities in staffing (consolidation during low-enrollment hours), CACFP (maximizing reimbursable meals), and supplies (vendor comparison, bulk ordering)
- Understand labor cost as a percentage of revenue and what healthy looks like (50 to 55%)
- Challenge assumptions: just because you have always spent $X on supplies does not mean you should

**Assessment:** Reflection exercise. "Using your current platform data, identify 3 specific cost optimization opportunities and estimate the annual savings for each."

**Daily Habits to Build:**
- Review expense categories quarterly
- Challenge every line item that is over budget before approving the next month's spending
- Ask "is there a less expensive way to get the same outcome?" at least once per budget review

**Cost Impact:** The platform reveals savings that are invisible when you track expenses in spreadsheets or not at all. Typical first-year savings for a center that switches from manual to data-driven cost management: $15,000 to $30,000. The biggest wins usually come from labor optimization (scheduling) and CACFP maximization (never missing a reimbursable meal).

**Friction Tools Covered:** Staff scheduling optimizer (Tool 12), supply and inventory tracker (Tool 15), CACFP compliance (Tool 10), revenue forecasting (Tool 19)

---

### UNIT 8: Strategic Leadership

Running the business, not just the building.

---

#### M29: Cross-Site Operations

**Roles:** Owner (Tier 4)
**Format:** Self-paced (15 min) plus facilitated strategy session (45 min)
**Portal Pages:** `/admin/operations`, `/admin` (admin dashboard)

**Learning Outcomes:**
- Monitor both centers from a single screen
- Compare performance metrics side by side: attendance, ratios, incidents, supply needs, staff coverage
- Identify trends that one center shows but the other does not
- Manage by exception: focus only on what needs attention, not everything

**Assessment:** Scenario exercise. "Brooklyn Park has a ratio violation in the toddler room and Crystal has 3 pending supply requests. Prioritize your response and take action through the platform."

**Daily Habits to Build:**
- Start each day with the cross-site dashboard before doing anything else
- Manage by exception, not by micromanagement; green means "don't touch it"
- Visit the center that has more yellow and red flags, not the one that is closer

**Cost Impact:** The cross-site dashboard saves 10 or more hours per week that Christina currently spends driving between locations, calling staff for status updates, and piecing together information from text messages. At her effective hourly rate, that time is worth $500 to $1,000 per week in owner productivity.

**Strategy Change:** Replaces the "drive to each center to see what is happening" approach with real-time visibility from anywhere.

**Friction Tools Covered:** Cross-site operations dashboard (Tool 07)

---

#### M30: Strategic Planning and Continuous Improvement

**Roles:** Owner (Tier 4)
**Format:** Facilitated PD session (90 min)
**Portal Pages:** `/admin/strategic`, `/admin/meetings`, `/admin/meetings/efficiency`

**Learning Outcomes:**
- Define mission, vision, and values in the system so they are visible and trackable, not just words on a wall
- Conduct a SWOT analysis using platform data (not just opinions)
- Set strategic priorities with timelines and accountability dates
- Use the meeting efficiency tool for leadership meetings: agendas, timers, action items that auto-populate the task board
- Create a cycle of continuous improvement: plan, act, check, adjust

**Assessment:** Full PD model. Self-assessment on leadership practices, followed by a SWOT exercise using real center data, then reflection and a strategic plan with accountability dates.

**Daily Habits to Build:**
- Monthly strategic review: are we on track for our quarterly priorities?
- Quarterly SWOT refresh: has anything changed in our environment, staffing, enrollment, or finances?
- Annual vision check: does our mission still describe what we are actually doing?

**Cost Impact:** Centers with a documented strategic plan and quarterly check-ins grow enrollment 20% faster than those operating reactively. Strategic alignment also prevents drift, where small daily decisions slowly move the center away from its stated goals without anyone noticing until the gap is too large to fix easily.

**Strategy Change:** Replaces "we should do that someday" with tracked priorities, deadlines, and assigned owners.

**Friction Tools Covered:** Meeting efficiency system (Tool 20), delegation engine (Tool 13), task board (Tool 03)

---

## Friction Tool Cross-Reference

This table maps each of the 20 friction tools to the training modules that cover how to use it. If a staff member is struggling with a specific tool, point them to the relevant module for retraining.

| # | Friction Tool | Primary Module(s) | Supporting Module(s) |
|---|--------------|-------------------|---------------------|
| 01 | Automated Meal Count Reminders | M06 Meal Counts | M14 CACFP Compliance |
| 02 | Daily Photo/Video Upload Workflow | M07 Daily Photos | M11 Newsletters |
| 03 | Digital Task Board with Time Blocks | M08 Task Management | M30 Strategic Planning |
| 04 | State Authorization Tracking | M24 Authorization Tracking | M22 Enrollment Pipeline |
| 05 | Staff Knowledge Capture System | M19 HR and Documents | M21 Staff Onboarding |
| 06 | Digital Onboarding Pathway | M21 Staff Onboarding | M17 Certifications |
| 07 | Cross-Site Operations Dashboard | M29 Cross-Site Operations | M02 Navigation, M05 Attendance, M09 Daily Reports, M15 Ratios |
| 08 | Automated Enrollment Funnel | M22 Enrollment Pipeline | M23 Tour Management, M25 Website, M27 Revenue Forecasting |
| 09 | Nap Time Task Optimizer | M08 Task Management | (none) |
| 10 | CACFP Compliance Tracker | M14 CACFP Compliance | M06 Meal Counts |
| 11 | Parent Communication Hub | M10 Messaging | M12 Parent Portal, M13 Notifications |
| 12 | Staff Scheduling Optimizer | M18 Staff Scheduling | M15 Ratios, M20 Payroll, M28 Cost Optimization |
| 13 | Delegation Engine | M08 Task Management | M29 Cross-Site, M30 Strategic Planning |
| 14 | Tour Experience Standardizer | M23 Tour Management | M22 Enrollment Pipeline |
| 15 | Supply and Inventory Tracker | M28 Cost Optimization | M26 Budget Planning |
| 16 | Staff Development Tracker | M17 Certifications | M21 Onboarding |
| 17 | Incident and Communication Log | M16 Incident Reporting | M10 Messaging |
| 18 | Weekly Family Newsletter Generator | M11 Newsletters | M07 Daily Photos |
| 19 | Revenue Forecasting Tool | M27 Revenue Forecasting | M26 Budget, M28 Cost Optimization |
| 20 | Meeting Efficiency System | M30 Strategic Planning | M08 Task Management |

---

## Prerequisite Map

This shows which modules must be completed before starting each module. Modules with no prerequisites can be started immediately within their pathway.

```
M01 Welcome and Login .............. No prerequisites
M02 Navigating Your Portal ......... Requires M01
M03 Your Profile and Settings ...... Requires M01
M04 Kiosk Check-In/Check-Out ....... Requires M01
M05 Attendance Tracking ............ Requires M02
M06 Meal Count Submission .......... Requires M02, M05
M07 Daily Photo Upload ............. Requires M02
M08 Task Management ................ Requires M02
M09 Daily Reports .................. Requires M02
M10 Parent-Staff Messaging ......... Requires M02
M11 Newsletters and Announcements .. Requires M10, M07
M12 Parent Portal Mastery .......... Requires M02, M03
M13 Notification Management ........ Requires M03
M14 CACFP Compliance Deep Dive ..... Requires M06
M15 Ratio Monitoring ............... Requires M05
M16 Incident Reporting ............. Requires M02, M10
M17 Certifications Tracking ........ Requires M03
M18 Staff Scheduling ............... Requires M05, M15
M19 HR and Document Management ..... Requires M02
M20 Payroll Management ............. Requires M18
M21 Staff Onboarding ............... Requires M17, M19
M22 Enrollment Pipeline ............ Requires M02
M23 Tour Management ................ Requires M22
M24 Authorization Tracking ......... Requires M22
M25 Public Website and Marketing ... Requires M02
M26 Budget Planning and Tracking ... Requires M02
M27 Revenue Forecasting ............ Requires M26, M22
M28 Cost Optimization .............. Requires M26, M18
M29 Cross-Site Operations .......... Requires M05, M15, M08
M30 Strategic Planning ............. Requires M29, M26
```

### Visual Dependency Chains

The longest dependency chains in the curriculum:

**Financial chain:** M01 > M02 > M05 > M06 > M14 (6 weeks to reach CACFP compliance deep dive)

**Strategic chain:** M01 > M02 > M05 > M15 > M18 > M28 > M30 (full 8-week owner pathway to strategic planning)

**Growth chain:** M01 > M02 > M22 > M23 or M24 > M27 (enrollment through revenue forecasting)

---

## Total Time Investment Per Pathway

### Pathway 1: Parent/Family

| Week | Modules | Format | Duration |
|------|---------|--------|----------|
| 1 | M01 Welcome, M02 Navigation, M03 Profile, M04 Kiosk | Self-paced plus paper packet | 45 min |
| 2 | M10 Messaging, M12 Parent Portal, M13 Notifications | Self-paced | 30 min |
| Ongoing | M09 Daily Reports (view only) | Reference card | 5 min |

**Total: 1 hour 20 minutes of structured training**
**Completion gate:** Family profile 100% complete, successful kiosk check-in demo, practice message sent

---

### Pathway 2: Employee/Staff

| Week | Modules | Format | Duration |
|------|---------|--------|----------|
| 1 | M01 through M04 (Getting Started) | Self-paced plus facilitated orientation (1 hr) | 1.5 hr |
| 2 | M05 Attendance, M06 Meal Counts, M07 Photos | Self-paced plus facilitated CACFP basics (45 min) | 2 hr |
| 3 | M08 Tasks, M09 Daily Reports, M10 Messaging | Self-paced plus scenario practice (30 min) | 1.5 hr |
| 4 | M15 Ratios, M16 Incidents, M17 Certifications | Facilitated safety session (45 min) plus self-paced | 2 hr |

**Total: 7 hours over 4 weeks**
**Completion gate:** 3 consecutive days of on-time meal counts, one incident report filed correctly, all personal certifications verified in system

---

### Pathway 3: Director/Lead Teacher

| Week | Modules | Format | Duration |
|------|---------|--------|----------|
| 1 | M01 through M04 plus M05 and M06 | Orientation plus CACFP deep dive | 3 hr |
| 2 | M07 through M09 plus M10 and M11 | Daily operations plus communication | 2.5 hr |
| 3 | M14 CACFP Compliance plus M15 and M16 | Facilitated compliance PD (90 min) | 2.5 hr |
| 4 | M17 Certs plus M18 Scheduling plus M19 HR | Facilitated scheduling workshop (60 min) | 3 hr |
| 5 | M21 Onboarding plus M22 and M23 Pipeline/Tours | Facilitated enrollment strategy (45 min) | 2.5 hr |
| 6 | M24 Authorizations plus M08 delegation deep dive plus M12 and M13 | Capstone scenario exercise | 2 hr |

**Total: 15.5 hours over 6 weeks**
**Completion gate:** Build one compliant weekly schedule, process one mock enrollment from inquiry to enrolled, file one complete incident with parent notification

---

### Pathway 4: Owner/Admin

| Week | Modules | Format | Duration |
|------|---------|--------|----------|
| 1 | M01 through M06 (Foundation plus Daily) | Intensive orientation (3 hr facilitated) | 4 hr |
| 2 | M07 through M09 plus M10 and M11 | Operations plus communication | 2.5 hr |
| 3 | M14 through M17 (Full Compliance Unit) | Compliance PD session (90 min facilitated) | 3 hr |
| 4 | M18 through M21 (Staff Management) | HR/Scheduling workshop (90 min facilitated) | 3.5 hr |
| 5 | M22 through M25 (Growth and Enrollment) | Enrollment strategy session (60 min facilitated) | 3 hr |
| 6 | M26 through M28 (Financial Intelligence) | Financial PD session (90 min facilitated) | 3 hr |
| 7 | M29 and M30 (Strategic Leadership) | Strategic planning retreat (90 min facilitated) | 2.5 hr |
| 8 | Capstone: Full scenario simulation | Facilitated capstone (2 hr) | 2 hr |

**Total: 23.5 hours over 8 weeks**
**Completion gate:** Pass all knowledge checks at 80% or higher, complete a growth plan, demonstrate 5 competencies from the owner rubric, run a full day on the platform without falling back to paper

---

## Assessment Architecture Summary

The curriculum uses five levels of assessment, progressively deeper:

**Level 1: Completion Tracking (all modules).** Did you start it? Did you finish it? How long did it take?

**Level 2: Knowledge Checks (Units 2, 4, 5, 6).** Five-question quizzes per module, mixing multiple choice with scenario-based questions. 80% pass threshold, unlimited retries. Question bank: 150 questions total.

**Level 3: Self-Assessment Inventory (Units 4, 7, 8).** Likert-scale self-report on confidence and practice frequency. Domains: Compliance Confidence, Financial Literacy, Leadership Practice, Technology Comfort. Take it before training and again after to measure growth.

**Level 4: Competency Rubrics (Units 2, 4, 5).** Observable skills verified by a supervisor during real work, not in a test. Three levels: Guided (needs help), Independent (does it alone), Mentor (can teach others to do it).

**Level 5: Growth Plans (Units 4, 7, 8; Directors and Owner only).** Constraint identification, evidence from platform data, specific practice change, structural change, accountability partner, and reassess date.

---

## Key Competency Rubrics

### Employee Competencies (8 items)

1. Clock in and out accurately every shift
2. Submit all meal counts before each deadline
3. Upload 3 or more tagged photos per shift
4. Complete all assigned tasks by end of shift
5. File an incident report within 30 minutes of occurrence
6. Maintain current certifications in the system
7. Respond to parent messages within 4 hours
8. Check dashboard alerts at start of each shift

### Director Competencies (14 items)

All 8 employee competencies, plus:

9. Build a compliant weekly schedule that stays under the labor budget
10. Process an enrollment inquiry within 48 hours
11. Achieve 90% or higher CACFP audit readiness score
12. Conduct a monthly 1:1 with each staff member using the HR tools
13. Send a weekly newsletter by Friday at 3 PM
14. Resolve ratio violations within 15 minutes

### Owner Competencies (20 items)

All 14 director competencies, plus:

15. Review budget versus actual monthly with variance under 10%
16. Run a revenue forecast and scenario model at least quarterly
17. Update the strategic plan quarterly
18. Maintain zero expired staff certifications across both sites
19. Review the cross-site dashboard daily
20. Delegate 60% or more of operational tasks

---

## Estimated Cost Impact Summary

This table summarizes the financial impact of each unit when the training is completed and habits are adopted.

| Unit | Primary Financial Impact | Estimated Annual Value |
|------|------------------------|----------------------|
| Unit 1: Getting Started | Reduced onboarding friction, fewer support calls | $2,000 to $4,000 in saved director time |
| Unit 2: Daily Rhythms | CACFP revenue protection, reduced parent churn, recovered admin time | $15,000 to $35,000 |
| Unit 3: Communication | Family retention, reduced complaints, self-service data entry | $10,000 to $20,000 |
| Unit 4: Compliance | Avoided fines, protected CACFP reimbursement, reduced liability | $40,000 to $80,000 in protected revenue |
| Unit 5: Staff Management | Reduced overtime, lower turnover, documented HR actions | $15,000 to $30,000 |
| Unit 6: Growth | Increased enrollment conversion, retained authorizations | $20,000 to $45,000 |
| Unit 7: Financial Intelligence | Caught overspending, optimized costs | $15,000 to $30,000 |
| Unit 8: Strategic Leadership | Owner time recovery, strategic growth | $25,000 to $50,000 in productivity and growth |

**Total estimated annual impact: $142,000 to $294,000** in revenue protected, costs avoided, time recovered, and growth enabled across both sites.

These are not theoretical projections. They are based on the specific friction points identified in the assessment, the reimbursement rates published by CACFP, Minnesota licensing fine schedules, industry data on staff turnover costs, and the actual tuition rates at Christina's Child Care Center.

---

## How to Use This Document

This curriculum guide is the anchor document. Every other training document references it:

- **Scope and Sequence** (`scope-and-sequence.md`): The week-by-week rollout schedule for each pathway
- **Unit Detail Files** (`modules/unit-*.md`): Expanded facilitator notes, discussion questions, scenario scripts, and platform walkthroughs for each unit
- **Paper Training Packets** (`packets/*.md`): Role-specific condensed guides designed to print on 8.5x11
- **Facilitator Guide** (`facilitator-guide.md`): Session plans for all facilitated modules
- **Assessment Bank** (`assessment-bank.md`): All 150 knowledge check questions, 20 scenario cards, self-assessment inventories, and growth plan templates
- **Competency Rubrics** (`competency-rubrics.md`): Observable skills checklists with 3-level rating scales

When in doubt about what a module covers, how long it takes, or who needs it, come back to this document. It is the single source of truth for the training program.
