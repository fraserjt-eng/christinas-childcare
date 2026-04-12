# Unit 6: Growth and Enrollment

**Modules:** M22, M23, M24, M25
**Roles:** Directors (Tier 3), Owner (Tier 4)
**Total Time:** 3 hours (facilitated + self-paced)
**Core Truth:** Every empty spot in a classroom costs $800-1,200/month in lost revenue. Growth is not optional; it is how you stay open.

---

## M22: Enrollment Pipeline

**Format:** Self-paced (15 min) + facilitated sales strategy session (45 min)
**Roles:** Directors (Tier 3), Owner (Tier 4)
**URL:** `/admin/pipeline`

### Learning Outcomes

By the end of this module, participants will:

1. Navigate the enrollment pipeline kanban board
2. Move prospects through funnel stages (Inquiry > Tour Scheduled > Tour Complete > Paperwork > Enrolled)
3. Identify stalled leads and take action
4. Read and interpret conversion rate metrics
5. Set follow-up reminders that prevent leads from falling through the cracks

### Facilitator Notes

This module reframes enrollment from "waiting for the phone to ring" to active pipeline management. Most childcare centers lose 30-50% of inquiries because nobody follows up within 48 hours. The pipeline makes every inquiry visible and trackable.

Start the facilitated session with a reality check: "How many inquiries did you get last month? How many became enrolled families? If you don't know the exact numbers, that is the problem this module solves."

The word "sales" makes some childcare professionals uncomfortable. Reframe it: this is not selling. This is making sure families who need care can find you, tour your center, and complete enrollment without getting lost along the way. The pipeline removes friction for families, not pressure them.

### Step-by-Step Platform Walkthrough

**Step 1: Open the Pipeline Board**
Navigate to `/admin/pipeline`. The kanban board displays five columns representing your enrollment funnel:

| Column | Meaning |
|--------|---------|
| Inquiry | Family made first contact (call, web form, walk-in) |
| Tour Scheduled | Tour date is set |
| Tour Complete | Tour happened, awaiting decision |
| Paperwork | Family is completing enrollment documents |
| Enrolled | Fully enrolled and active |

Each card on the board represents one family. Cards show: family name, child age(s), inquiry date, and days in current stage.

[Screenshot: Pipeline kanban board with 5 columns, several family cards at different stages, days-in-stage badges visible]

**Step 2: Add a New Inquiry**
Click "Add Inquiry" at the top of the Inquiry column. Fill in:

- Parent name and contact info
- Child name(s) and date(s) of birth
- How they heard about you (referral, Google, drive-by, social media)
- Preferred start date
- Any notes from the initial conversation

The card appears in the Inquiry column with today's date.

[Screenshot: New inquiry form with fields for parent info, child info, referral source, and notes]

**Step 3: Move Cards Through the Funnel**
Drag a card from one column to the next as the family progresses. When you move a card:

- The system timestamps the transition
- A follow-up reminder auto-generates based on stage rules
- The card's "days in stage" counter resets

Stage-specific follow-up rules (customizable):

| Stage | Auto-Reminder | Default Timing |
|-------|--------------|----------------|
| Inquiry | "Schedule a tour" | 24 hours after inquiry |
| Tour Scheduled | "Confirm tour" | 24 hours before tour |
| Tour Complete | "Send follow-up" | 48 hours after tour |
| Paperwork | "Check paperwork status" | 5 days after paperwork sent |

[Screenshot: Card being dragged from "Tour Complete" to "Paperwork" with transition confirmation dialog]

**Step 4: Identify Stalled Leads**
Cards that sit in one stage too long turn yellow (5+ days) then red (10+ days). The system also displays a "Stalled" filter that shows only cards past their follow-up deadline.

Click any stalled card to see:

- Last action taken and date
- All communication history
- Suggested next action

The most common stall point is between Tour Complete and Paperwork. Families toured, liked what they saw, but did not receive a timely follow-up. This is the highest-leverage gap to close.

[Screenshot: Stalled leads filter active, showing 3 cards in red with "days since last action" prominently displayed]

**Step 5: Read Conversion Metrics**
Click "Metrics" in the top toolbar. The conversion dashboard shows:

- **Inquiry-to-Tour rate:** What percentage of inquiries become scheduled tours
- **Tour-to-Enroll rate:** What percentage of tours result in enrollment
- **Average time to enroll:** Days from first inquiry to enrolled status
- **Lead source breakdown:** Which referral sources produce the most enrollments (not just the most inquiries)
- **Monthly trend:** Are conversion rates improving or declining?

These numbers tell you where your funnel leaks. If your inquiry-to-tour rate is 80% but your tour-to-enroll rate is 30%, the problem is not lead generation. The problem is what happens during or after the tour.

[Screenshot: Conversion metrics dashboard with bar charts for each stage transition rate and a trend line over 6 months]

**Step 6: Set Follow-Up Reminders**
On any card, click "Add Reminder." Set a date, time, and note. The reminder appears in your notification bell and on your dashboard at the scheduled time.

Best practice: set the next follow-up before you close the current conversation. Never leave a card without a scheduled next action.

### Discussion Questions

1. "Walk through the last 5 families who inquired but did not enroll. At what stage did they drop off? Was there a follow-up that did not happen?"

2. "If your tour-to-enroll rate is 40%, and you want to add 5 new families this quarter, how many tours do you need to schedule? What does that tell you about your inquiry volume?"

3. "Which lead source has produced your most loyal families? How does that compare to where you spend the most marketing energy?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Not logging walk-in inquiries | "They were just looking around" | Every person who walks through the door and asks about enrollment is a lead. Log them immediately, even if the conversation lasted 2 minutes. |
| Moving cards to "Enrolled" before paperwork is complete | Optimism | A family is not enrolled until all paperwork and payment are received. Premature moves inflate your numbers and create confusion. |
| Ignoring stalled cards | Uncomfortable making follow-up calls | Stalled does not mean lost. A simple "Just checking in, do you have any questions?" message re-opens 20-30% of stalled leads. |
| Not tracking referral sources | Feels unnecessary | Referral source data tells you where to invest marketing dollars. Without it, you are guessing. |

### Handout: Pipeline Management Weekly Routine

**Monday Morning (15 minutes)**

- [ ] Open `/admin/pipeline`
- [ ] Review all cards in red (stalled 10+ days); take action or archive
- [ ] Review all cards in yellow (stalled 5+ days); send follow-up
- [ ] Check that every card has a scheduled next action
- [ ] Note total cards per stage for weekly tracking

**After Every Inquiry**

- [ ] Add card to pipeline within 1 hour
- [ ] Set follow-up reminder for 24 hours
- [ ] Record referral source
- [ ] If tour-ready, schedule immediately and move card

**Monthly Review**

- [ ] Check conversion metrics at `/admin/pipeline` (Metrics tab)
- [ ] Compare this month to last month
- [ ] Identify the weakest funnel stage
- [ ] Discuss one change to improve that stage

**Conversion Rate Benchmarks (Childcare Industry)**

| Metric | Below Average | Average | Strong |
|--------|-------------|---------|--------|
| Inquiry to Tour | < 50% | 50-70% | 70%+ |
| Tour to Enroll | < 30% | 30-50% | 50%+ |
| Days to Enroll | 30+ days | 14-30 days | < 14 days |

### Screenshots Needed

1. Full kanban board with cards at various stages
2. New inquiry entry form
3. Card drag between columns with confirmation
4. Stalled leads filter with red/yellow cards
5. Conversion metrics dashboard with charts
6. Follow-up reminder creation dialog

---

## M23: Tour Management

**Format:** Self-paced (10 min) + facilitated tour best practices session (30 min)
**Roles:** Directors (Tier 3), Owner (Tier 4)
**URL:** `/admin/pipeline/tours`

### Learning Outcomes

By the end of this module, participants will:

1. Schedule tours from the pipeline board
2. Use the digital tour checklist during walkthroughs
3. Enable and share the parent self-scheduling link
4. Send follow-up messages using built-in templates
5. Track tour feedback and outcomes

### Facilitator Notes

Tours are the single most important conversion event in childcare enrollment. A family who tours is 3-5x more likely to enroll than one who only calls. The quality and consistency of the tour experience directly drives enrollment.

The facilitated session should include a mock tour. One participant plays the parent; another gives the tour using the digital checklist. Debrief what went well and what was missed. This practice round builds confidence and reveals gaps in the current tour experience.

Key insight for the group: families decide in the first 5 minutes whether they feel welcome. The checklist ensures you cover the operational details, but the warmth and attentiveness during those first 5 minutes is what closes the deal.

### Step-by-Step Platform Walkthrough

**Step 1: Access Tour Management**
Navigate to `/admin/pipeline/tours`. The tour calendar shows:

- Upcoming tours with family name, child age, and scheduled time
- Past tours with outcome status (enrolled, declined, no-show, pending)
- Available tour slots (time blocks you have designated as tour-friendly)

[Screenshot: Tour calendar view showing upcoming tours with family details and available time slots highlighted]

**Step 2: Schedule a Tour**
From the pipeline board, click a card in the "Inquiry" column and select "Schedule Tour." Or from the tour page, click "New Tour."

Fill in:

- Family name (auto-populates if from pipeline)
- Preferred date and time (shows available slots)
- Tour guide (which staff member will conduct the tour)
- Special notes (sibling attending, specific concerns, accessibility needs)

The system sends a confirmation to the family with the date, time, address, and what to bring.

[Screenshot: Tour scheduling form with date picker showing available time slots in green]

**Step 3: Share the Self-Scheduling Link**
Click "Self-Schedule Settings" to configure and copy your public scheduling link. This link shows available tour slots and lets families pick their own time.

Share this link on:

- Your website enrollment page
- Email responses to inquiries
- Social media posts about openings
- Google Business listing

When a family self-schedules, a card automatically appears in the pipeline at "Tour Scheduled."

[Screenshot: Self-scheduling configuration page with public link, available time slots editor, and preview of what families see]

**Step 4: Use the Tour Checklist**
On the day of the tour, open the tour card and click "Start Checklist." The digital checklist walks you through every stop and talking point:

**Welcome (5 min)**
- [ ] Greet by name at the door
- [ ] Introduce yourself and your role
- [ ] Ask about their child and what they are looking for
- [ ] Offer a brief overview of what they will see

**Classroom Tour (15 min)**
- [ ] Visit the age-appropriate classroom first
- [ ] Introduce the lead teacher
- [ ] Point out safety features (outlets, gates, ratios posted)
- [ ] Show daily schedule posted on the wall
- [ ] Highlight learning materials and curriculum approach

**Facility Tour (10 min)**
- [ ] Kitchen and meal preparation area
- [ ] Outdoor play space
- [ ] Nap/rest area
- [ ] Drop-off and pick-up procedures
- [ ] Security and check-in system (show the kiosk)

**Closing (5 min)**
- [ ] Answer remaining questions
- [ ] Explain enrollment process and next steps
- [ ] Provide enrollment packet (digital or paper)
- [ ] Set a specific follow-up date ("I will call you Thursday")

Check off items as you cover them. The completed checklist saves to the family's pipeline card.

[Screenshot: Tour checklist in progress on a tablet, showing checked and unchecked items with section headers]

**Step 5: Send Follow-Up from Templates**
After the tour, open the family's pipeline card and click "Send Follow-Up." Choose from templates:

- **Thank You (same day):** Warm thanks, recap highlights, answer any lingering questions, next steps
- **Gentle Nudge (48 hours):** "Wanted to check in and see if you have any questions after your visit"
- **Final Follow-Up (7 days):** "We would love to welcome [child name]. Let me know if I can help with anything."
- **Waitlist Notification:** "A spot has opened in [classroom]. Are you still interested?"

Each template pre-fills with the family's name and child's information. Edit before sending.

[Screenshot: Follow-up template selection with preview of the "Thank You" template populated with family details]

**Step 6: Track Tour Outcomes**
After sending the follow-up, update the tour outcome on the card:

- Enrolled (move to Paperwork or Enrolled)
- Declined (note the reason for future pattern analysis)
- No-show (trigger a "sorry we missed you" message)
- Pending (follow-up scheduled)

Over time, tour outcome data reveals patterns: which tour guide has the highest conversion rate, which time slots produce more no-shows, which objections come up most often.

### Discussion Questions

1. "What is the one thing you want every family to remember about your center after a tour? Is that thing currently part of your tour routine, or does it happen by accident?"

2. "How many tours in the past 6 months ended with no follow-up? What is the revenue impact of those missed connections?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Giving tours without the checklist | "I know what to cover" | Even experienced directors miss items under pressure (phone ringing, child needs attention). The checklist is a safety net, not a script. |
| Waiting 3+ days for follow-up | Busy with daily operations | Send the thank-you template within 2 hours. It takes 60 seconds using the template. Delay kills momentum. |
| Not tracking no-shows | "They just didn't come" | No-shows often reschedule if you reach out. The "sorry we missed you" template recovers 15-20% of no-shows. |
| Scheduling tours during chaotic times | Didn't think about it | Avoid scheduling tours during drop-off (7:30-9:00) or pick-up (3:30-5:30). Mid-morning after activities start is ideal: the center is active but calm. |

### Handout: Tour Excellence Quick Reference

**Before the Tour**

- [ ] Review the family's pipeline card (names, ages, concerns)
- [ ] Confirm with the tour guide
- [ ] Ensure classrooms are tour-ready (clean, organized, activities in progress)
- [ ] Have enrollment packets ready (digital or paper)

**During the Tour**

- [ ] Use the digital checklist on your phone or tablet
- [ ] Spend the first 5 minutes listening, not talking
- [ ] Let the classroom teacher interact with the touring family
- [ ] End with clear next steps and a specific follow-up date

**After the Tour**

- [ ] Send thank-you template within 2 hours
- [ ] Update the pipeline card with outcome notes
- [ ] Set the 48-hour follow-up reminder
- [ ] If declined, note the reason for pattern tracking

### Screenshots Needed

1. Tour calendar with upcoming and past tours
2. Tour scheduling form with available time slots
3. Self-scheduling public link configuration
4. Digital tour checklist in use on a tablet
5. Follow-up template selection with preview
6. Tour outcome tracking on pipeline card

---

## M24: Authorization Tracking

**Format:** Self-paced (15 min)
**Roles:** Directors (Tier 3), Owner (Tier 4)
**URL:** `/admin/pipeline/authorizations`

### Learning Outcomes

By the end of this module, participants will:

1. Read the authorization dashboard and understand status indicators
2. Respond to expiry alerts at 60, 30, and 14 days
3. Track renewal processing from submission to approval
4. Calculate revenue at risk from expiring authorizations
5. Distinguish between authorization types and their renewal requirements

### Facilitator Notes

Authorizations (county childcare assistance, state-funded programs) represent a significant revenue stream for many childcare centers. A lapsed authorization means the center cannot bill for that child's care during the gap. The family may not even know their authorization is expiring. This module ensures nobody is surprised.

The urgency framework matters here: at 60 days, you have time. At 30 days, you need to act. At 14 days, it is a crisis. The system uses this tiered alert structure to create appropriate urgency without constant alarm.

### Step-by-Step Platform Walkthrough

**Step 1: Open the Authorization Dashboard**
Navigate to `/admin/pipeline/authorizations`. The dashboard organizes authorizations into status categories:

- **Active (Green):** Valid authorization with 60+ days remaining
- **Attention (Yellow):** 30-60 days until expiry
- **Urgent (Orange):** 14-30 days until expiry
- **Critical (Red):** Less than 14 days or already expired
- **Pending Renewal (Blue):** Renewal submitted, awaiting approval

Each card shows: child name, authorization type, start date, end date, days remaining, and monthly revenue value.

[Screenshot: Authorization dashboard with color-coded status sections showing cards in each category with days-remaining badges]

**Step 2: Understand Authorization Types**
The system tracks multiple authorization types:

| Type | Source | Typical Duration | Renewal Process |
|------|--------|-----------------|----------------|
| CCAP (Child Care Assistance Program) | County | 12 months | County redetermination |
| CCDF (Child Care Development Fund) | Federal/State | 12 months | State application |
| Head Start | Federal | Program year | Annual re-enrollment |
| Private Pay Agreement | Family | Varies | Family renewal |

Each type has different renewal requirements and timelines. The system knows the rules and sets alerts accordingly.

[Screenshot: Authorization type filter showing counts per type with color-coded status]

**Step 3: Respond to Expiry Alerts**

**At 60 Days (Yellow Alert):**
- Review the authorization details
- Contact the family to confirm they are aware of the upcoming renewal
- Note any required documentation the family needs to gather
- Set a follow-up reminder for 45 days

**At 30 Days (Orange Alert):**
- Verify the family has started the renewal process
- Offer to help with paperwork or connect them with their county worker
- Document all communication in the authorization card
- If no action from the family, escalate to a phone call

**At 14 Days (Red Alert):**
- Direct contact with the family is required
- If renewal is submitted, track it in the "Pending Renewal" status
- If no renewal action, prepare for potential gap in coverage
- Calculate revenue at risk and flag to the owner

Click any alert to open the action panel. Log your response and set the next follow-up.

[Screenshot: Alert response panel for a 30-day warning showing communication log, action buttons, and next follow-up date]

**Step 4: Track Renewal Processing**
When a family submits their renewal, move the authorization card to "Pending Renewal." The system tracks:

- Date renewal was submitted
- Submitted to which agency
- Expected processing time
- Any additional documents requested
- Approval/denial outcome

Some county offices take 4-6 weeks to process renewals. Starting at 60 days gives enough runway for processing delays.

[Screenshot: Pending renewal tracking view showing submission date, agency, expected timeline, and current status]

**Step 5: Revenue-at-Risk Calculations**
The dashboard sidebar shows a revenue summary:

- Total monthly revenue from authorized care
- Revenue from authorizations expiring in 30 days
- Revenue from authorizations expiring in 60 days
- Revenue currently at risk (expired or critical status)

This number makes the abstract concrete. "Three authorizations expiring this month" becomes "$3,600/month in revenue that stops if we do not act."

[Screenshot: Revenue-at-risk sidebar showing dollar amounts for each expiry tier and total monthly authorized revenue]

### Discussion Questions

1. "Have you ever had a child's authorization lapse without anyone noticing? What happened to the billing for that period?"

2. "If three authorizations worth $3,600/month are expiring in the next 30 days, what is your action plan this week? Who contacts the families, and what is the backup plan if renewals are delayed?"

3. "How do you currently communicate with families about authorization renewals? Where does that communication break down?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Waiting until 14 days to act | Didn't notice the 60-day alert | Check the authorization dashboard every Monday. Make it part of your pipeline review routine. |
| Assuming the family knows about renewal | "The county sends them a letter" | County letters get lost, ignored, or misunderstood. Confirm directly with the family at 60 and 30 days. |
| Not tracking pending renewals | "We submitted it, so it should be fine" | Processing delays are common. Track the status weekly until the new authorization is in hand. |
| Forgetting to update the system when a new authorization arrives | The paperwork sits on the desk | Update the system the same day the new authorization is received. A valid authorization that is not in the system is the same as no authorization for billing purposes. |

### Handout: Authorization Expiry Action Plan

**Weekly Monday Check (10 minutes)**

- [ ] Open `/admin/pipeline/authorizations`
- [ ] Review all Orange and Red status cards
- [ ] Take action on every card past its follow-up date
- [ ] Check Pending Renewals for any updates
- [ ] Note total revenue at risk

**60-Day Alert Actions**

1. Pull up the family's contact information
2. Send a friendly reminder (template available in system)
3. Confirm they received the renewal notice from their county/agency
4. Document the conversation in the authorization card
5. Set 45-day follow-up reminder

**30-Day Alert Actions**

1. Phone call to the family (not just a message)
2. Ask specifically: "Have you submitted the renewal?"
3. Offer help with paperwork or agency contact
4. If submitted, move to Pending Renewal and track
5. If not submitted, help them start immediately

**14-Day Alert Actions**

1. Direct conversation with the family
2. If renewal is in process, contact the agency for status
3. Prepare gap plan (can the family pay privately during the gap?)
4. Notify the owner of revenue at risk
5. Document everything

### Screenshots Needed

1. Authorization dashboard with color-coded status sections
2. Authorization type filter with counts
3. Alert response panel with communication log
4. Pending renewal tracking view
5. Revenue-at-risk sidebar summary

---

## M25: Public Website and Marketing

**Format:** Self-paced (15 min)
**Roles:** Owner (Tier 4)
**URL:** `/admin/marketing` (settings) + public site pages

### Learning Outcomes

By the end of this module, participants will:

1. Understand which public pages drive enrollment inquiries
2. Manage enrollment form submissions from the website
3. Keep the photo gallery and content current
4. Connect website traffic to pipeline conversions

### Facilitator Notes

This is the lightest module in Unit 6, but it closes an important loop. The public website is the top of the enrollment funnel. If the site is outdated, families form an impression before they ever call. This module connects website management to the pipeline work covered in M22-M24.

No deep marketing strategy here. The focus is practical: keep the site accurate, respond to submissions quickly, and update photos so the site reflects today's center, not last year's.

### Step-by-Step Platform Walkthrough

**Step 1: Review Public Pages**
The platform's public-facing pages include:

- **Home:** First impression, value proposition, call to action
- **About Us:** Mission, philosophy, director bios
- **Programs:** Age group descriptions, curriculum overview, daily schedule
- **Gallery:** Photos from daily activities (fed from M07 photo uploads)
- **Enrollment:** Inquiry form, tuition information, availability
- **FAQ:** Common questions answered before families need to call
- **Contact:** Location, hours, phone, email

Navigate to each page by visiting the public URL. Note anything that is outdated, missing, or inaccurate.

[Screenshot: Public website homepage on desktop and mobile side by side]

**Step 2: Manage Enrollment Submissions**
When a family submits the enrollment inquiry form on the website, the submission appears in two places:

- The notification bell on your admin dashboard
- The pipeline board as a new Inquiry card (if auto-pipeline is enabled)

Review submissions daily. Respond within 24 hours. A 24-hour response time converts 2x better than a 48-hour response.

[Screenshot: Enrollment form submissions list showing family name, submission date, child age, and response status]

**Step 3: Update the Photo Gallery**
The gallery pulls from photos uploaded through M07 (Daily Photo Upload) that have been approved for public display. To manage the gallery:

- Navigate to `/admin/marketing` (or gallery settings)
- Review recently uploaded photos tagged as "gallery eligible"
- Approve or remove photos
- Organize by classroom or activity type

Aim for a gallery refresh at least monthly. Families visiting the site should see recent photos, not pictures from 6 months ago.

[Screenshot: Gallery management view with photo grid, approval toggles, and classroom tags]

**Step 4: Track Referral Sources**
When families enter the pipeline (M22), you record how they found you. Over time, this data shows which marketing channels produce results:

- Google search / Google Maps
- Social media (Facebook, Instagram)
- Referral from current family
- Drive-by / signage
- Community event
- Website direct

Review this data monthly. Double down on what works. If 60% of your enrollments come from current family referrals, invest in referral incentives rather than paid ads.

### Discussion Questions

1. "If a parent visits your website right now, does it accurately represent what they would experience on a tour? What is the biggest gap between the site and reality?"

2. "How quickly do you currently respond to online enrollment inquiries? What would it take to respond within 4 hours every time?"

### Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Letting the gallery go stale | Nobody is assigned to update it | Designate one person to review gallery-eligible photos every Friday. 10 minutes. |
| Not responding to web inquiries for days | Submissions get buried in email or notifications | Set up a daily 9 AM check of enrollment submissions. First thing, every morning. |
| Ignoring referral source tracking | "We know where people come from" | You do not, and the data often surprises. Track it for 3 months, then review. Your assumptions may be wrong. |

### Handout: Website and Marketing Quick Reference

**Daily**
- [ ] Check enrollment form submissions; respond within 24 hours

**Weekly**
- [ ] Review and approve gallery-eligible photos

**Monthly**
- [ ] Visit your own website on a phone (that is how most parents see it)
- [ ] Check that all information is accurate (hours, rates, availability)
- [ ] Review referral source data in pipeline metrics
- [ ] Update the gallery with recent photos

### Screenshots Needed

1. Public website homepage (desktop and mobile)
2. Enrollment form submissions management list
3. Gallery management view with approval controls
4. Referral source breakdown chart from pipeline metrics

---

## Unit 6 Capstone Exercise

**Time:** 30 minutes
**Format:** Hands-on scenario

**Scenario:** It is Monday morning. Your pipeline shows:

- 3 new web inquiries from the weekend (M22/M25)
- 1 tour scheduled for Wednesday (M23)
- 2 authorizations expiring in 28 days (M24)
- 1 stalled lead from 2 weeks ago (M22)

Work through all four situations in the platform. Prioritize your actions and explain your reasoning to the facilitator.

**Success Criteria:**

- All 3 web inquiries logged in pipeline with follow-ups scheduled
- Tour checklist prepared and confirmation sent for Wednesday
- Both authorization families contacted with documented follow-up plan
- Stalled lead re-engaged or archived with documented reason

---

## Unit 6 Cost Impact Summary

| Module | Annual Impact | How |
|--------|-------------|-----|
| M22 Pipeline | $20,000-30,000 revenue | Converting 2-3 additional families per quarter |
| M23 Tours | $10,000-15,000 revenue | 30% better tour conversion through consistency |
| M24 Authorizations | $5,000-15,000 protected | Preventing authorization gaps and billing interruptions |
| M25 Marketing | $3,000-5,000 saved | Reducing cost per inquiry through organic channels |

**Combined Unit 6 Impact:** $38,000-65,000 in annual revenue gained and protected. Growth does not come from one big move. It comes from closing dozens of small gaps in the enrollment process.
