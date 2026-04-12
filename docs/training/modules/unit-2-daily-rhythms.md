# Unit 2: Daily Rhythms

**Modules:** M05 Attendance Tracking, M06 Meal Count Submission, M07 Daily Photo Upload, M08 Task Management, M09 Daily Reports
**Audience:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)
**Total Time:** 2.5-3 hours (self-paced + facilitated sessions)

This is the most critical unit in the entire curriculum. These five modules cover the actions that happen every single day in the center. If your team gets these right, the center runs smoothly, stays in compliance, and protects its revenue. If they get these wrong, you lose money, miss deadlines, and scramble to reconstruct records after the fact.

---

## M05: Attendance Tracking

**Format:** Self-paced (15 min) + facilitated scenario session (30 min)
**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)

### Facilitator Notes

**Before the session:**
- Pull up the /admin/attendance page on a large screen
- Have at least 5 children checked in via the kiosk so the data is live
- Prepare the late-arrival scenario (see Assessment below)
- Print the classroom attendance reference card (see Handout Content)

**What to demo:**
- Show the real-time attendance view with children grouped by classroom
- Demonstrate the difference between "checked in," "absent," and "not yet arrived"
- Show how arrival time connects to meal count eligibility (a child who arrives at 10:15 AM was not present for breakfast; that meal cannot be claimed)
- Show the end-of-day attendance summary
- For directors: show how attendance data feeds into the ratio dashboard (/admin/ratios)

### Step-by-Step Platform Walkthrough

**Employee view (checking attendance for your classroom):**

1. Go to /employee
2. Your dashboard shows a quick count: "X children present in your classroom"
3. At 9:30 AM (after the arrival window closes), check your classroom's attendance:
   - Look at who is present vs. expected
   - Note any children who haven't arrived and don't have a parent message explaining why
4. If a parent calls to report an absence:
   - Go to your messages (/employee, then tap Messages) or notify the front desk
   - The director will update the attendance record
5. If a child arrives late:
   - The parent checks in at the kiosk; the system records the late arrival time
   - This timestamp matters for meal count eligibility

**Director/Owner view (/admin/attendance):**

1. Go to /admin/attendance
2. The top section shows center-wide numbers: total enrolled, present today, absent, not yet arrived
3. Below that, each classroom card shows:
   - Classroom name and age group
   - Staff assigned vs. staff present
   - Children present vs. enrolled
   - Current ratio (with color: green = good, yellow = watch, red = violation)
4. Tap any classroom card to see the child-by-child list with check-in times
5. Use the date picker to view past days
6. The "Expected but Not Arrived" section highlights children with no check-in and no absence notification by 9:30 AM

[Screenshot: /admin/attendance showing classroom cards with live counts]

[Screenshot: Classroom detail view showing individual child check-in times]

[Screenshot: "Expected but Not Arrived" alert section]

### Discussion Questions

1. It's 9:45 AM and three children in the Toddler Room haven't arrived. No one has called. What do you do?
2. A parent drops off at 10:30 AM and asks, "Did my child get counted for breakfast?" How do you answer?
3. Why is the 9:30 AM attendance check a habit and not just a suggestion?

### Common Mistakes and How to Avoid Them

| Mistake | What Happens | Prevention |
|---------|-------------|------------|
| Not checking attendance at 9:30 AM | You don't know who's missing; you can't flag no-shows | Set a daily phone alarm for 9:30 AM |
| Assuming a child is absent without confirmation | Child might be running late; you stop expecting them | Always verify: check messages, call the parent |
| Ignoring the ratio implications | A late arrival could push your room over ratio | Watch the ratio indicator on the attendance card |
| Not documenting late arrivals | Audit finds children marked present who arrived after breakfast | The kiosk timestamps everything; make sure every late arrival goes through it |

### Handout Content: Daily Attendance Card

**Attendance Rhythm**

| Time | Action |
|------|--------|
| 6:30-9:00 AM | Arrival window. Parents check in at kiosk. |
| 9:30 AM | Check your classroom's attendance. Flag missing children. |
| 10:00 AM | Attendance snapshot locks for morning meal counts. |
| 3:00-6:00 PM | Departure window. Parents check out at kiosk. |
| 6:00 PM | Director reviews any unclosed check-ins. |

**If a child is absent:** Parent should message or call by 9:00 AM.
**If a child arrives late:** Parent checks in at kiosk. Time is recorded automatically.

### Screenshots Needed

- Screenshot: /admin/attendance main view with classroom cards
- Screenshot: Single classroom expanded to show child list with times
- Screenshot: Ratio indicator colors (green, yellow, red) on attendance cards
- Screenshot: End-of-day attendance summary

---

## M06: Meal Count Submission (CACFP Revenue Protection)

**Format:** Self-paced (15 min) + facilitated session on CACFP basics (45 min)
**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)

This module is about money. Every meal you serve to every child is eligible for federal reimbursement through the Child and Adult Care Food Program (CACFP). But only if you submit the count on time, with the right numbers, tied to the right children. A missed meal count is money thrown away that you will never get back.

### Facilitator Notes

**Before the session:**
- Have the CACFP reimbursement rate sheet printed (current federal rates)
- Calculate your center's approximate daily CACFP revenue so the dollar amounts feel real
- Pull up /admin/food-counts and /employee/meal-count side by side
- Prepare the "missed lunch count" scenario (see below)
- Have a calendar showing your meal service times and submission deadlines

**What to demo:**
- Show the meal count submission form on /employee/meal-count
- Demonstrate the pre-fill feature (the system pulls today's attendance and auto-populates counts)
- Show what a deadline looks like as it approaches (the indicator changes from green to yellow to red)
- Show what a missed deadline looks like on /admin/food-counts (the record turns red and cannot be edited)
- Show the weekly and monthly CACFP reports on /admin/compliance

**Key context for all staff:** CACFP reimburses approximately $2-8 per child per day, depending on how many meals and snacks are served and the income tier. For a center with 40 children, that adds up to $80-320 per day. Over a year, CACFP reimbursement can total $40,000-80,000. This is not a bonus; it is core revenue that pays for food, staff, and supplies.

### CACFP Deadline Times

These are the hard deadlines for meal count submission. After the deadline passes, the count for that meal cannot be submitted or corrected.

| Meal | Service Window | Submission Deadline | What Gets Locked |
|------|---------------|-------------------|-----------------|
| Breakfast | 6:30-8:30 AM | 9:30 AM | Breakfast counts for all classrooms |
| AM Snack | 9:00-10:00 AM | 10:30 AM | Morning snack counts |
| Lunch | 11:00 AM-1:00 PM | 1:30 PM | Lunch counts for all classrooms |
| PM Snack | 2:30-3:30 PM | 4:00 PM | Afternoon snack counts |
| Supper (if applicable) | 5:00-6:00 PM | 6:30 PM | Evening meal counts |

**The 15-minute rule:** Submit your count within 15 minutes of the meal ending. Don't wait until the deadline. If something goes wrong (phone dies, system slow), you still have a buffer.

### Pre-Fill Workflow Explanation

The platform saves you time by pre-filling meal counts based on attendance data.

**How it works:**
1. Children who are checked in at the kiosk appear on your meal count form automatically
2. The system marks all present children as "served" by default
3. You only need to make changes for children who did not eat (sick, sleeping, arrived after the meal)
4. This takes 30 seconds instead of counting heads and writing numbers on paper

**How to use pre-fill:**
1. Go to /employee/meal-count
2. Select the meal (Breakfast, Lunch, AM Snack, PM Snack)
3. The system pre-fills with today's attendance
4. Review the list: uncheck any child who was not served
5. Add any child who arrived after check-in but was present for the meal
6. Tap "Submit"
7. You see a green confirmation with the count and timestamp

[Screenshot: /employee/meal-count showing pre-filled list with checkboxes]

[Screenshot: Submission confirmation with timestamp and count]

### What Happens When a Count Is Missed

When a meal count deadline passes without a submission, here is what happens:

1. **The record turns red** on /admin/food-counts. It cannot be edited or submitted after the fact.
2. **The reimbursement is lost.** For that meal, for that day, for every child who was served, the center receives $0.
3. **The dollar impact is immediate.** If 30 children ate lunch and you missed the count, that is roughly $60-120 lost in a single day.
4. **The compliance score drops.** The CACFP compliance dashboard on /admin/compliance tracks your submission rate. Anything below 95% triggers a yellow warning. Below 85% triggers red.
5. **Over time, it compounds.** Missing one lunch per week for 40 children costs $3,000-6,000 per year. Missing breakfast and lunch once a week each costs $6,000-12,000 per year.

**There is no way to recover a missed count.** The federal program does not accept late submissions. The money is gone.

### Sample Meal Count Scenario Walkthrough

**Scenario:** It is 12:45 PM. Lunch just ended in the Preschool Room. You served 18 children.

1. Open /employee/meal-count on your phone
2. Tap "Lunch"
3. The pre-fill shows 20 children checked in
4. Review the list: 2 children were napping through lunch and didn't eat
5. Uncheck those 2 children
6. The count now shows 18 served
7. Tap "Submit"
8. Confirmation screen: "Lunch submitted: 18 children served at 12:47 PM"
9. Done. You submitted 43 minutes before the 1:30 PM deadline.

**What if you forgot and it's now 1:25 PM?**

Same steps, but you are cutting it close. The deadline indicator is yellow. Submit immediately. Do not double-check anything else first. You can adjust minor errors with a director's help before the hard lock, but you cannot submit after 1:30.

**What if it's 1:35 PM?**

The submission form for lunch is locked. The indicator is red. That meal count is lost. The director will see the missed count on /admin/food-counts. This is a coaching conversation, not a punishment, but it is money that cannot be recovered.

### Step-by-Step Platform Walkthrough

**Employee view (/employee/meal-count):**

1. Go to /employee from your phone
2. Tap "Meal Count" (or the meal count card on your dashboard if it's showing a deadline alert)
3. Select the meal you are submitting (Breakfast, Lunch, AM Snack, PM Snack)
4. Review the pre-filled child list
5. Uncheck any children who were not served
6. Add notes if needed (e.g., "arrived at 10:15, missed breakfast")
7. Tap "Submit"
8. Verify the green confirmation message

**Director/Owner view (/admin/food-counts):**

1. Go to /admin/food-counts
2. The dashboard shows today's meal counts by classroom and meal type
3. Color coding:
   - **Green:** Submitted on time
   - **Yellow:** Deadline approaching, not yet submitted
   - **Red:** Deadline passed, count missed
4. Tap any classroom to see individual child counts
5. Use the date range selector to review historical submissions
6. The bottom section shows the weekly/monthly submission rate and estimated reimbursement

[Screenshot: /admin/food-counts dashboard showing mixed green/yellow/red meal status]

[Screenshot: /employee/meal-count form with pre-filled attendance list]

[Screenshot: Deadline indicator changing from green to yellow to red]

[Screenshot: Missed meal count showing in red with $0 reimbursement]

### Discussion Questions

1. You serve breakfast at 8:00 AM. When should you submit the count? (Answer: by 8:15 AM, not at 9:29 AM)
2. A substitute teacher doesn't know how to submit meal counts. It's 1:20 PM and lunch counts haven't been submitted. What do you do?
3. The center missed 5 lunch counts last month. Using the rate of $4 per child and 30 children per lunch, how much revenue was lost? (Answer: 5 x 30 x $4 = $600)

### Common Mistakes and How to Avoid Them

| Mistake | What Happens | Prevention |
|---------|-------------|------------|
| Waiting until the deadline to submit | Any delay (slow connection, distraction) means a missed count | Submit within 15 minutes of meal end |
| Submitting without reviewing pre-fill | Children who were absent get counted as served; this is a compliance violation | Spend 30 seconds reviewing the list before tapping Submit |
| Not knowing the deadlines | "I didn't know lunch had to be in by 1:30" | Post the deadline chart in every classroom (see Handout Content) |
| Forgetting AM/PM snack counts | Snacks feel less important but are worth $1-2 per child per day | Snack deadlines are just as real as meal deadlines |
| Counting children who arrived after the meal | Inflates your count; creates an audit flag | Only count children who were physically served |

### Handout Content: Meal Count Deadline Poster

**Print this poster and tape it in every classroom at adult eye level.**

CACFP MEAL COUNT DEADLINES

| Meal | SUBMIT BY |
|------|-----------|
| Breakfast | 9:30 AM |
| AM Snack | 10:30 AM |
| Lunch | 1:30 PM |
| PM Snack | 4:00 PM |

Go to /employee/meal-count on your phone.
Review the pre-filled list. Uncheck children who were not served. Tap Submit.
Every missed count = $3-8 lost per child. No exceptions. No late submissions.

**If you are struggling with the form, tell the director BEFORE the deadline, not after.**

### Assessment: CACFP Knowledge Check (5 Questions)

1. What is the lunch meal count deadline? (Answer: 1:30 PM)
2. True or false: You can submit a meal count after the deadline if you forgot. (Answer: False)
3. A child arrives at 9:45 AM. Can you count them for breakfast if the service window ended at 8:30 AM? (Answer: No)
4. The pre-fill shows 22 children but only 19 ate lunch. What do you do before submitting? (Answer: Uncheck the 3 children who did not eat)
5. Roughly how much CACFP reimbursement does the center receive per child per day? (Answer: $2-8 depending on meals served and income tier)

**Competency rubric:** Submit meal counts on time for 3 consecutive days with accurate counts. Director verifies by comparing /admin/food-counts data against classroom records.

### Screenshots Needed

- Screenshot: /employee/meal-count main screen with meal type selector
- Screenshot: Pre-filled attendance list with checkboxes
- Screenshot: Submission confirmation with timestamp
- Screenshot: /admin/food-counts showing on-time (green), approaching (yellow), and missed (red) counts
- Screenshot: CACFP compliance score on /admin/compliance
- Screenshot: Monthly reimbursement estimate on /admin/food-counts

---

## M07: Daily Photo Upload

**Format:** Self-paced (10 min)
**Roles:** Employees (Tier 2), Directors (Tier 3)

### Facilitator Notes

**Before the session:**
- Have 3-5 sample photos taken during the day (activity, meal, outdoor play)
- Know the approval workflow: who reviews photos before parents see them?
- Review the photo tagging options available in the system
- Confirm the batch upload limit (up to 5 at once)

**What to demo:**
- Take a photo during the training session and upload it live
- Show how to add activity tags and a brief caption
- Demonstrate batch upload of multiple photos
- Show the approval queue on /admin/communications/photos
- Show what parents see on /dashboard/photos when a photo is approved

### Step-by-Step Platform Walkthrough

**Employee view (uploading photos):**

1. During an activity (art, outdoor play, circle time, meals), take 3-5 photos on your phone
2. Open the platform and navigate to your dashboard or photo section
3. Tap "Upload Photos"
4. Select up to 5 photos from your camera roll
5. For each photo:
   - Select an **activity tag** (Art, Outdoor Play, Circle Time, Meal, Free Play, Music, Science, Reading)
   - Write a brief **caption** (1-2 sentences, e.g., "Maya and Jordan built a tower in the block area today")
   - Tag the **classroom** if prompted
6. Tap "Submit"
7. The photos go to the approval queue. A director reviews before they become visible to parents.

**Director view (/admin/communications/photos):**

1. Go to /admin/communications/photos
2. The approval queue shows submitted photos with tags, captions, and timestamps
3. For each photo, you can:
   - **Approve:** Photo becomes visible to parents on /dashboard/photos
   - **Reject:** Photo is removed (blurry, identifiable info visible, inappropriate)
   - **Edit caption:** Fix typos or add detail before approving
4. Approved photos appear in the parent gallery within minutes

**What parents see (/dashboard/photos):**

Parents see a timeline of approved photos from their child's classroom. Each photo shows the activity tag, caption, date, and time. Parents can save or share photos to their phone.

[Screenshot: Photo upload form with activity tag dropdown and caption field]

[Screenshot: /admin/communications/photos approval queue]

[Screenshot: /dashboard/photos parent view with timeline of classroom photos]

### Discussion Questions

1. What makes a good classroom photo? (Answer: shows children engaged in activity, faces visible, good lighting, no identifying documents in background)
2. How many photos per day is a reasonable target for each classroom? (Answer: 3-5 per activity block; aim for variety)
3. Why does the approval step exist? (Answer: quality control, privacy protection, professional presentation)

### Common Mistakes and How to Avoid Them

| Mistake | What Happens | Prevention |
|---------|-------------|------------|
| Taking photos only during special events | Parents think nothing happens on regular days | Take 3-5 photos during every activity block |
| Uploading blurry or dark photos | Director rejects them; wasted effort | Check the photo quality before uploading |
| Forgetting to tag and caption | Parents see unlabeled photos with no context | Always add a tag and at least one sentence |
| Uploading photos with other children's names visible | Privacy violation | Check backgrounds for name tags, sign-in sheets, etc. |
| Waiting until end of week to upload | Photos lose their immediacy; parents want same-day | Upload during transitions or nap time |

### Handout Content: Photo Upload Cheat Sheet

**Daily Photo Rhythm**

| When | What to Photograph |
|------|--------------------|
| Morning activity | Circle time, art project, free play |
| Outdoor play | Running, climbing, group games |
| Meal time | Children eating together (no close-ups of individual plates) |
| Afternoon activity | Science, music, sensory play |
| Special moments | Birthdays, milestones, sibling visits |

**Upload steps:** Take photo, open platform, Upload Photos, add tag + caption, Submit.
**Batch limit:** 5 photos at a time.
**Photos go live after director approval.**

### Screenshots Needed

- Screenshot: Photo upload button on employee dashboard
- Screenshot: Upload form with tag dropdown, caption field, and photo preview
- Screenshot: Batch upload showing multiple photos queued
- Screenshot: Director approval queue with approve/reject buttons
- Screenshot: Parent photo gallery view on /dashboard/photos

---

## M08: Task Management

**Format:** Self-paced (15 min) + facilitated session on delegation (30 min, Tiers 3-4 only)
**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)

### Facilitator Notes

**Before the session:**
- Create 5-10 sample tasks in the system so participants have something to work with
- Assign at least 2 tasks to each employee account
- For the delegation session (directors/owner only), prepare a list of tasks that should be delegated vs. handled personally
- Know the priority level system (Critical, High, Normal, Low)
- Understand the nap-time task optimizer and how it works

**What to demo:**
- Employee view: show how to see, accept, and complete tasks
- Director view: show how to create, assign, and track tasks
- Show the nap-time optimizer suggesting tasks based on available time
- Demonstrate priority levels and how they affect task order
- Show task completion tracking and what the owner sees in reports

### Step-by-Step Platform Walkthrough

**Employee view (completing tasks):**

Employees see their tasks and complete them. They do not create or assign tasks.

1. Go to /employee/tasks
2. Your task board shows tasks assigned to you, sorted by priority and due time
3. Each task card shows:
   - Task title and description
   - Priority level (color-coded: red = critical, orange = high, blue = normal, gray = low)
   - Due time or time block
   - Who assigned it
4. To complete a task:
   - Tap the task card
   - Review the details and instructions
   - Do the work
   - Tap "Mark Complete"
   - Add a note if needed (e.g., "supply room was locked, completed after maintenance opened it")
5. Completed tasks move to the "Done" section at the bottom

**Nap-time tasks (/employee/nap-tasks):**

1. Go to /employee/nap-tasks
2. This page shows tasks optimized for the nap window (typically 12:30-2:30 PM)
3. Tasks are ordered by priority and estimated time
4. The system suggests which tasks to tackle first based on your available time
5. Complete tasks the same way: tap, do the work, mark complete

[Screenshot: /employee/tasks showing task cards with priority colors]

[Screenshot: Task detail view with description, priority, due time, and "Mark Complete" button]

[Screenshot: /employee/nap-tasks showing nap-time optimized task list]

**Director/Owner view (creating and delegating tasks):**

Directors and the owner create, assign, and monitor tasks.

1. Go to /admin/tasks
2. The dashboard shows all tasks across the center:
   - **By status:** Open, In Progress, Completed, Overdue
   - **By assignee:** See each employee's task load
   - **By priority:** Filter to see critical items first
3. To create a new task:
   - Tap "New Task"
   - Enter the task title and description (be specific: "Sanitize infant room toys" not "clean stuff")
   - Set the priority level
   - Assign to an employee (or a role, like "Lead Teacher, Toddler Room")
   - Set a due date and time
   - Add the time block if applicable (morning, nap time, afternoon)
   - Tap "Create"
4. The assigned employee sees the task on their /employee/tasks page immediately
5. Monitor completion from /admin/tasks. Overdue tasks show in red.

**Task assessment (/admin/tasks/assessment):**

1. Go to /admin/tasks/assessment
2. This page shows task completion rates by employee, classroom, and time period
3. Use this data in 1:1 meetings and performance conversations
4. Patterns appear here: if one employee consistently misses nap-time tasks, that is a coaching opportunity

[Screenshot: /admin/tasks dashboard with status filters and assignee view]

[Screenshot: New task creation form with all fields]

[Screenshot: /admin/tasks/assessment showing completion rates by employee]

### Discussion Questions

**For employees:**
1. It's nap time. You have 90 minutes. Your task board shows 5 tasks. The top one is "High" priority but will take 45 minutes. The second is "Critical" but only takes 10 minutes. Which do you do first and why?
2. A task says "organize supply closet" but you can't find the supply closet key. What do you do? (Answer: add a note to the task, message the director, move on to the next task)

**For directors/owner:**
1. What makes a well-written task? What makes a poorly-written one?
2. How do you decide what to delegate vs. what to handle yourself?
3. How would you use the task assessment data without making it feel punitive?

### Common Mistakes and How to Avoid Them

| Mistake | What Happens | Prevention |
|---------|-------------|------------|
| Not checking the task board at shift start | You miss time-sensitive assignments | Open /employee/tasks within 5 minutes of clocking in |
| Marking a task complete without doing it | Data integrity breaks; trust erodes | Only mark complete when the work is actually done |
| Creating vague tasks (directors) | Employee doesn't know what "handle the thing" means | Write specific, actionable titles: who, what, where |
| Over-assigning to one person | That employee burns out; others are underloaded | Check the assignee view before creating new tasks |
| Ignoring overdue tasks (directors) | Problems pile up invisibly | Review overdue tasks daily; reassign or adjust deadlines |

### Handout Content: Task Management Quick Reference

**For Employees:**
1. Check /employee/tasks at shift start
2. Work highest priority first (red before orange before blue)
3. Mark complete when done; add notes if something was unusual
4. During nap time, check /employee/nap-tasks for optimized list
5. If a task is blocked, message the director

**For Directors:**
1. Create tasks with clear, specific titles
2. Assign to the right person with a realistic due time
3. Check /admin/tasks for overdue items daily
4. Use /admin/tasks/assessment for performance patterns
5. Delegation rule of thumb: if someone else can do it 80% as well as you, delegate it

### Screenshots Needed

- Screenshot: /employee/tasks showing task cards with priority colors and due times
- Screenshot: Task detail view with Mark Complete button
- Screenshot: /employee/nap-tasks optimized view
- Screenshot: /admin/tasks dashboard with status and assignee filters
- Screenshot: New task creation form
- Screenshot: /admin/tasks/assessment completion rate chart

---

## M09: Daily Reports

**Format:** Self-paced (10 min)
**Roles:** Employees (Tier 2), Directors (Tier 3), Owner (Tier 4)

### Facilitator Notes

**Before the session:**
- Have a sample daily report visible for a specific child (meals, naps, activities, mood)
- Know the difference between what employees see, what directors see, and what parents see
- Prepare the parent-question scenario (see Assessment below)

**What to demo:**
- Show the daily report view for a single child: meals eaten, nap duration, activities participated in, mood notes
- Show how data flows in automatically from other modules (meal counts from M06, attendance from M05, photos from M07)
- Show the classroom filter and date picker
- Show what a parent sees on their /dashboard when they view daily reports
- Demonstrate the 4 PM review habit: scan for anything unusual before parents arrive

### Step-by-Step Platform Walkthrough

**Employee view (reviewing reports for your classroom):**

1. Go to /employee from your dashboard
2. Navigate to the reports section or the child summary view
3. Select your classroom
4. Each child's daily summary shows:
   - **Attendance:** Arrival and departure time
   - **Meals:** Which meals were served (from meal count submissions)
   - **Naps:** Nap start and end time (if tracked)
   - **Activities:** What the child participated in (from photo tags and activity logs)
   - **Notes:** Any notes from staff (mood, behavior, milestones)
5. At 4:00 PM, scan each child's report. Flag anything that needs a parent conversation at pickup.

**Director/Owner view (/admin/reports/daily):**

1. Go to /admin/reports/daily
2. The daily report dashboard shows summaries across all classrooms
3. Filter by classroom, date, or individual child
4. Data pulls from:
   - Kiosk check-in/check-out times (M04/M05)
   - Meal count submissions (M06)
   - Photo uploads (M07)
   - Task completions (M08)
5. Export options: download as PDF for individual families or print a classroom summary
6. The "incomplete reports" alert shows which classrooms are missing data before end of day

**What parents see (/dashboard):**

Parents see a daily summary card for each child on their dashboard:
- Today's meals (with checkmarks for each meal served)
- Nap time duration
- Activities and photos from the day
- Any notes from the teacher
- Check-in and check-out times

This is often the first thing a parent looks at when they pick up their phone after work. It answers the questions every parent has: "What did my child eat? Did they sleep? What did they do today?"

[Screenshot: Daily report for a single child showing meals, nap, activities, and notes]

[Screenshot: /admin/reports/daily dashboard with classroom filter]

[Screenshot: Parent dashboard view of daily summary card]

[Screenshot: "Incomplete reports" alert on admin dashboard]

### Discussion Questions

1. A parent arrives at pickup and asks, "Did my child eat lunch today? She's been picky at home." How do you find this information in the system? (Answer: open the daily report for that child; the meals section shows what was served)
2. Why is the 4 PM report review important? (Answer: it gives you a chance to catch missing data, prepare for parent conversations, and address any concerns before families arrive)
3. What happens to parent trust when daily reports are incomplete or missing? (Answer: parents assume nobody is paying attention; this erodes trust and increases the chance they look for a different center)

### Common Mistakes and How to Avoid Them

| Mistake | What Happens | Prevention |
|---------|-------------|------------|
| Not adding notes to daily reports | Parents see bare data with no personal touch | Add 1-2 sentences per child per day: mood, milestones, cute moments |
| Skipping the 4 PM review | You are caught off guard when a parent asks a question | Build the 4 PM review into your daily routine |
| Relying on memory instead of the system | "I think she ate lunch" is not good enough | Check the report before answering any parent question |
| Leaving nap times unrecorded | Parents worry when nap info is blank | Log nap start and end as it happens, not from memory later |
| Not reviewing incomplete report alerts (directors) | Reports go out to parents with gaps | Check the "incomplete reports" alert before 5 PM daily |

### Handout Content: Daily Report Rhythm

**Your 4 PM Checklist**

Before parents arrive, open your classroom's daily reports and verify:

- [ ] All meal counts are submitted and accurate
- [ ] Nap times are recorded for every child
- [ ] At least 1 activity note per child
- [ ] Any unusual behavior or mood is documented
- [ ] Photos from the day are uploaded and tagged

**What parents see:** Meals served, nap duration, activities, photos, and your notes. This is your professional report card for the day. Treat it accordingly.

**The question every parent has:** "Was my child safe, fed, rested, and happy today?" Your daily report should answer all four.

### Assessment

**Completion check:** View a daily report for at least one child and confirm you can find meals, naps, activities, and notes.

**Scenario:** A parent sends a message at 5:30 PM: "My daughter said she didn't get a snack today. Can you check?" Walk through how you would find the answer:
1. Open the daily report for that child
2. Check the meals section for PM Snack
3. If PM Snack shows as served, respond with the specific data
4. If PM Snack is missing, check with the classroom teacher and respond honestly

### Screenshots Needed

- Screenshot: Full daily report for one child (meals, nap, activities, notes, photos)
- Screenshot: Classroom summary view on /admin/reports/daily
- Screenshot: Parent-facing daily summary card on /dashboard
- Screenshot: "Incomplete reports" alert
- Screenshot: Export/download option for daily reports

---

## Unit 2 Summary

After completing this unit, every participant should be able to:

1. Check and interpret classroom attendance by 9:30 AM daily
2. Submit accurate meal counts within 15 minutes of every meal (and explain why this is non-negotiable)
3. Upload 3-5 tagged, captioned photos per activity block
4. View, prioritize, and complete assigned tasks (employees) or create and delegate tasks (directors/owner)
5. Review daily reports at 4 PM and answer any parent question with data, not guesses

**The daily rhythm in sequence:**
- 6:30 AM: Center opens, kiosk active
- 8:30 AM: Breakfast count submitted
- 9:30 AM: Attendance checked, AM snack count submitted by 10:30
- 10:00-12:00 PM: Morning activities, photos taken
- 12:00-1:00 PM: Lunch served, count submitted by 1:15
- 12:30-2:30 PM: Nap time, nap tasks completed
- 3:00 PM: PM snack served, count submitted by 3:45
- 4:00 PM: Daily report review
- 5:00-6:00 PM: Parent pickup, conversations informed by data

**Next up:** Unit 3, Communication & Family Engagement. Now that the daily operations are running, we build the communication layer that keeps families connected and retained.
