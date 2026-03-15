'use client';

import { useState, useEffect } from 'react';
import {
  Rocket,
  Sun,
  MessageSquare,
  Calendar,
  TrendingUp,
  LogIn,
  UserCheck,
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Camera,
  Eye,
  LayoutGrid,
  Moon,
  Image,
  Newspaper,
  Archive,
  Megaphone,
  Bell,
  CalendarDays,
  CalendarRange,
  BookOpen,
  GraduationCap,
  UserPlus,
  Package,
  ShoppingCart,
  Filter,
  FileCheck,
  MapPin,
  Building2,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import { GuideHero } from '@/components/guide/GuideHero';
import { RoleFilter } from '@/components/guide/RoleFilter';
import { FeatureCard, type FeatureCardProps } from '@/components/guide/FeatureCard';
import { GuideSection } from '@/components/guide/GuideSection';
import { getTourProgress } from '@/lib/tour-progress';

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------
const RED = '#C62828';
const BLUE = '#2196F3';
const GREEN = '#4CAF50';
const CORAL = '#FF7043';
const PURPLE = '#7B1FA2';

// ---------------------------------------------------------------------------
// Feature card data
// ---------------------------------------------------------------------------

type CardDef = Omit<FeatureCardProps, 'categoryColor'> & { sectionColor: string };

const allCards: CardDef[] = [
  // ─── Section 1: Getting Started ─────────────────────────────────────────
  {
    icon: LogIn,
    title: 'Parent Login',
    description:
      'Your private door into the parent portal. See updates, photos, and messages the moment you log in.',
    whyItExists:
      'Families used to have to call or wait for a printed newsletter to know what happened during the day. That felt distant. This replaces the guessing with a real-time window into your child\u2019s day.',
    howItHelps:
      'You log in once, and everything is right there: today\u2019s photos, the latest newsletter, any messages from Christina. No app download, no extra passwords.',
    route: '/login',
    steps: [
      'Go to the parent portal login page',
      'Enter your email and the password Christina gave you',
      'You\u2019re taken straight to your family dashboard',
      'Bookmark it so you can check in anytime',
    ],
    roles: ['parent'],
    category: 'Getting Started',
    sectionColor: RED,
  },
  {
    icon: UserCheck,
    title: 'Employee Login',
    description:
      'The staff portal entrance. Clock in, check your schedule, enter meal counts, and access everything you need for your shift.',
    whyItExists:
      'Staff were juggling paper sign-in sheets, separate spreadsheets for meal counts, and text messages for schedule changes. That\u2019s too many places to look.',
    howItHelps:
      'One login gives you your full day at a glance. Clock in from your phone, see your tasks, check who else is on, and log meals all in the same place.',
    route: '/employee-login',
    steps: [
      'Go to the employee login page',
      'Enter your email or PIN number',
      'Your shift dashboard loads automatically',
      'Use the quick-action menu for clocking in and out',
    ],
    roles: ['staff'],
    category: 'Getting Started',
    sectionColor: RED,
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboard',
    description:
      'Your command center. At a glance: who\u2019s here today, what\u2019s overdue, which alerts need your attention across both locations.',
    whyItExists:
      'Running two centers means constantly juggling a mental list of what\u2019s happening at each site. This dashboard puts everything in one view so nothing falls through the cracks.',
    howItHelps:
      'Smart alerts surface only what needs your attention. You see enrollment gaps, missed meal counts, low supplies, and staff coverage issues before they become problems.',
    route: '/admin',
    tourId: 'admin-dashboard',
    steps: [
      'Log in with your admin credentials',
      'Review the smart alert panel at the top',
      'Check the daily summary cards for each center',
      'Click any alert to jump directly to that tool',
    ],
    roles: ['admin'],
    category: 'Getting Started',
    sectionColor: RED,
  },

  // ─── Section 2: Daily Essentials ────────────────────────────────────────
  {
    icon: UtensilsCrossed,
    title: 'Meal Count Entry',
    description:
      'Log breakfast, lunch, and snack counts by classroom in under two minutes. Designed for staff to do it quickly, every single day.',
    whyItExists:
      'Meal counts fund the CACFP reimbursements that cover a meaningful chunk of food costs. But they only work if they\u2019re submitted on time, every day. Paper logs get lost, and late submissions mean lost money.',
    howItHelps:
      'The entry form is pre-filled with your classroom and today\u2019s date. You just enter numbers and hit submit. The system flags if you\u2019re cutting it close to the deadline.',
    route: '/employee/meal-count',
    tourId: 'meal-count',
    steps: [
      'Open the Meal Count page from your employee dashboard',
      'Select the current meal period (breakfast, lunch, or snack)',
      'Enter the count for each child in your classroom',
      'Hit Submit before the deadline shown on screen',
    ],
    roles: ['staff'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: ClipboardList,
    title: 'Food Counts & CACFP',
    description:
      'The admin view of all meal submissions. Track compliance rates, see which classrooms are behind, and monitor your monthly reimbursement totals.',
    whyItExists:
      'CACFP audits can come without much notice. If records are incomplete, the center risks losing reimbursements retroactively. This tracker keeps you audit-ready every day, not just when the auditor calls.',
    howItHelps:
      'You see a running compliance score, a breakdown of on-time vs. late submissions, and projected reimbursement for the month. If something\u2019s off, you know about it the same day.',
    route: '/admin/food-counts',
    tourId: 'food-counts-compliance',
    steps: [
      'Navigate to Food Counts in your admin sidebar',
      'Check the Compliance tab for this week\u2019s on-time rate',
      'Click any classroom row to see its submission history',
      'Review the Reimbursement Tracker for monthly totals',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Users,
    title: 'Attendance Tracking',
    description:
      'Know who\u2019s here, who called out, and whether your ratios are covered. Updated in real time as children arrive and depart.',
    whyItExists:
      'Ratio violations are the fastest way to get a licensing citation. When you\u2019re moving fast in the morning, it\u2019s easy to lose track. This gives you a live headcount at all times.',
    howItHelps:
      'Color-coded alerts tell you if any room is approaching a ratio issue. You can pull up the full day\u2019s attendance for any child in seconds, which matters a lot on pick-up days.',
    route: '/admin/attendance',
    steps: [
      'Open Attendance from the Daily Essentials section',
      'Mark arrivals as children check in each morning',
      'Watch the ratio indicators update in real time',
      'Export attendance records for any date range',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Camera,
    title: 'Daily Photo Upload',
    description:
      'Snap and upload photos of activities, milestones, and classroom moments from your phone. Tag the activity type and classroom in seconds.',
    whyItExists:
      'Parents love seeing their kids in action, but getting photos from staff to families used to mean texting personal numbers or emailing blurry attachments. That\u2019s not professional, and it\u2019s not private.',
    howItHelps:
      'Photos go straight into a review queue for Christina to approve before parents see them. You take the photo, tag it, and move on. The system handles the rest.',
    route: '/employee/photos',
    tourId: 'photo-upload',
    steps: [
      'Open the Photos page from your employee menu',
      'Tap the upload button and select your photo',
      'Choose the classroom and activity type',
      'Write a short caption (optional) and submit',
    ],
    roles: ['staff'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Eye,
    title: 'Photo Review',
    description:
      'Review submitted staff photos before parents see them. Approve, reject, or edit captions from a clean grid view.',
    whyItExists:
      'Once a photo is visible to families, it\u2019s visible. Having a review step protects children\u2019s privacy and lets you maintain a consistent, professional look for all shared content.',
    howItHelps:
      'You can review a full day\u2019s photos in a few minutes. Bulk approve the ones that look great, reject any that don\u2019t meet the mark, and add context to captions before families see them.',
    route: '/admin/communications/photos',
    tourId: 'photo-review',
    steps: [
      'Open Photo Review under Communications',
      'Filter by date, classroom, or pending status',
      'Click any photo to preview it full-size',
      'Approve, reject, or edit caption, then move to the next',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: LayoutGrid,
    title: 'Task Board',
    description:
      'A kanban board of every task across both centers. Create tasks, assign them to staff, set due dates, and track what\u2019s done.',
    whyItExists:
      'Verbal to-do lists disappear the moment the conversation ends. Things like "check the spare freezer" or "order more bibs" kept getting lost between shifts. This gives every task a home.',
    howItHelps:
      'Staff see only the tasks assigned to them. You see everything. Overdue tasks turn red automatically. Nothing falls off the list because it\u2019s always right there.',
    route: '/admin/tasks',
    tourId: 'task-kanban',
    steps: [
      'Open the Task Board from your admin dashboard',
      'Create a task with a title, due date, and assignee',
      'Drag it through To Do, In Progress, and Done columns',
      'Set a recurrence for tasks that happen every week',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Moon,
    title: 'Nap Time Tasks',
    description:
      'A curated task list that appears during nap time: cleaning, restocking, documentation. Keep the quiet hour productive without forgetting what needs doing.',
    whyItExists:
      'Nap time is the only pocket of uninterrupted time in a childcare day, and it often got used inconsistently. Some staff were productive; others weren\u2019t sure what to work on. This removes the ambiguity.',
    howItHelps:
      'You open the Nap Tasks page and see exactly what needs to happen during this window. Check items off as you go. Christina can see completion rates across the team.',
    route: '/employee/nap-tasks',
    tourId: 'nap-tasks',
    steps: [
      'Open Nap Tasks when nap time begins',
      'See the list of assigned tasks for this shift',
      'Check off each item as you complete it',
      'Add notes on anything that needs follow-up',
    ],
    roles: ['staff'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },

  // ─── Section 3: Communication ───────────────────────────────────────────
  {
    icon: Image,
    title: 'Parent Photo Gallery',
    description:
      'A private, chronological feed of every approved photo from your child\u2019s classroom. Tap to react and see the captions staff added.',
    whyItExists:
      'Parents used to wonder what their kids were doing all day, especially for infants and toddlers who can\u2019t report back. Seeing real photos from real moments closes that gap completely.',
    howItHelps:
      'You scroll through photos the same way you\u2019d scroll a social feed, except it\u2019s completely private and only contains your child\u2019s classroom. React with a heart, save favorites, and know your kid had a great day.',
    route: '/dashboard/photos',
    tourId: 'parent-photos',
    steps: [
      'Log into the parent portal',
      'Tap Photos in the main menu',
      'Scroll through today\u2019s approved photos',
      'Tap the heart icon to react or long-press to save',
    ],
    roles: ['parent'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Newspaper,
    title: 'Newsletter Builder',
    description:
      'Build a professional weekly newsletter with photos, events, menu highlights, and classroom spotlights. No design skills needed.',
    whyItExists:
      'Sending updates used to mean assembling a Word document, attaching it to an email, and hoping parents actually opened it. The result looked inconsistent and took way too long to put together.',
    howItHelps:
      'You add sections, drag photos in, type your updates, and the layout handles itself. Schedule it to send Friday afternoon so families have it for the weekend.',
    route: '/admin/communications',
    tourId: 'newsletter-builder',
    steps: [
      'Open Communications and click New Newsletter',
      'Add sections: photos, events, menu, milestones',
      'Fill in your content for each section',
      'Preview, then schedule or send immediately',
    ],
    roles: ['admin'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Archive,
    title: 'Newsletter Archive',
    description:
      'Every newsletter Christina has sent, searchable and readable from any device. Never miss an update even if you were away.',
    whyItExists:
      'A newsletter sent on Friday disappears into an inbox by Monday. Parents who travel or work irregular hours often missed important updates entirely. The archive fixes that.',
    howItHelps:
      'You search by date or keyword and pull up any past newsletter in seconds. Great for referencing upcoming events, finding the menu from last month, or catching up after vacation.',
    route: '/dashboard/news',
    tourId: 'parent-newsletter',
    steps: [
      'Go to News in your parent portal',
      'Browse newsletters sorted by most recent first',
      'Use the search bar to find a specific topic',
      'Click any newsletter to read it in full',
    ],
    roles: ['parent'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Megaphone,
    title: 'Communication Hub',
    description:
      'Send announcements to all families, message individual parents, or use saved templates for common situations like closures or illness notices.',
    whyItExists:
      'Reaching families used to mean a patchwork of texts, emails, and Facebook posts. Messages got missed, and there was no record of what was sent or who read it.',
    howItHelps:
      'You write one message and choose your audience: all families, a specific classroom, or one parent. The system logs who opened it, so you know your message actually landed.',
    route: '/admin/communications',
    steps: [
      'Open the Communication Hub from your admin menu',
      'Choose your audience: all families, a room, or one parent',
      'Pick a template or write from scratch',
      'Send now or schedule for later',
    ],
    roles: ['admin'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Bell,
    title: 'Notification Preferences',
    description:
      'Choose exactly how and when you hear from the center: new photos, newsletters, important announcements. Your inbox, your rules.',
    whyItExists:
      'Some parents want every update the moment it happens. Others prefer a daily digest. With a one-size-fits-all email approach, you end up ignoring everything or missing things that matter.',
    howItHelps:
      'You set your preferences once and the center respects them. Get a push notification when new photos go up, a weekly email with the newsletter, and nothing else.',
    route: '/dashboard/notifications',
    tourId: 'notification-prefs',
    steps: [
      'Open Notifications in your parent settings',
      'Toggle on the types of updates you want',
      'Choose email, in-app, or both for each category',
      'Save and your preferences apply immediately',
    ],
    roles: ['parent'],
    category: 'Communication',
    sectionColor: BLUE,
  },

  // ─── Section 4: Scheduling & Staff ──────────────────────────────────────
  {
    icon: CalendarDays,
    title: 'Schedule Board',
    description:
      'Build and publish staff schedules for both centers. See gaps, manage coverage, and handle swap requests from one calendar view.',
    whyItExists:
      'Scheduling two centers with part-time and full-time staff across shifting enrollment numbers is genuinely hard. Doing it in a spreadsheet means re-doing it every time someone calls out.',
    howItHelps:
      'The board shows you who is scheduled, who has a conflict, and where ratio coverage gets thin. Drag shifts to reschedule. Approve or deny swap requests without a single text.',
    route: '/admin/scheduling',
    tourId: 'schedule-board',
    steps: [
      'Open the Schedule Board from your admin menu',
      'Select the week you want to build',
      'Drag staff into shift slots for each room',
      'Publish the schedule so staff can see their shifts',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: CalendarRange,
    title: 'Employee Schedule',
    description:
      'Your personal schedule view. See your upcoming shifts, request time off, and get notified when the schedule is published.',
    whyItExists:
      'Staff used to find out their schedule by texting Christina or checking a paper printout on the fridge at the center. That\u2019s not reliable, especially for people who plan childcare around their own work hours.',
    howItHelps:
      'You see your schedule the moment it\u2019s published. Your shifts are in your calendar app if you want. And you can request a swap or time off directly from this page without hunting for someone to call.',
    route: '/employee/schedule',
    tourId: 'my-schedule',
    steps: [
      'Open Schedule from your employee dashboard',
      'Browse your shifts for the current and next week',
      'Tap any shift to see room assignment and start time',
      'Use the Request Time Off button for planned absences',
    ],
    roles: ['staff'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    description:
      'The center\u2019s internal wiki. Policies, procedures, how-to guides, and anything else staff need to do their job well.',
    whyItExists:
      'New staff spent their first weeks asking the same questions over and over. Veteran staff couldn\u2019t find the updated allergy protocol because it was buried in an old email. A central knowledge base fixes both problems.',
    howItHelps:
      'Every answer is searchable and always current. You look up the fire drill procedure, the sick child policy, or how to use the lesson planning tool, and you find it immediately.',
    route: '/admin/staff/knowledge-base',
    tourId: 'knowledge-base',
    steps: [
      'Open the Knowledge Base from the Staff section',
      'Browse by category or use the search bar',
      'Click any article to read it in full',
      'As admin: add or update articles from the editor',
    ],
    roles: ['admin', 'staff'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: GraduationCap,
    title: 'Staff Development',
    description:
      'Track training hours, certifications, and professional development goals for every staff member. Know who\u2019s due for renewal before it becomes a compliance issue.',
    whyItExists:
      'Minnesota licensing requires ongoing training hours, and certifications expire on their own schedule. Tracking this in a spreadsheet only works until someone forgets to update it.',
    howItHelps:
      'You see each staff member\u2019s training status at a glance. Automatic reminders go out before a certification expires. Staff can log their own hours, and you verify them.',
    route: '/admin/staff/development',
    tourId: 'staff-development',
    steps: [
      'Open Staff Development from the admin sidebar',
      'Select a staff member to view their training record',
      'Add completed training with the date and credit hours',
      'Set renewal reminders for certifications',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: UserPlus,
    title: 'Onboarding',
    description:
      'A structured checklist for every new hire. Background check status, orientation tasks, and first-week milestones tracked in one place.',
    whyItExists:
      'Onboarding a new staff member involved scattered paperwork, forgotten orientation tasks, and no clear record of what had been completed. New staff felt lost, and Christina had to keep it all in her head.',
    howItHelps:
      'You create an onboarding record when someone is hired. Every required step is listed. As each task is completed, it gets checked off. Nothing important gets skipped.',
    route: '/admin/hr/onboarding',
    tourId: 'onboarding',
    steps: [
      'Open Onboarding under HR',
      'Click New Hire and fill in their basic information',
      'The onboarding checklist generates automatically',
      'Mark each item complete as the new hire finishes it',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: Package,
    title: 'Supply Management',
    description:
      'Track inventory levels for both centers. Set reorder points, approve purchase requests from staff, and see what\u2019s running low across locations.',
    whyItExists:
      'Running out of diapers at Crystal on a Tuesday when there\u2019s a full case in Brooklyn Park is the kind of problem that only happens when no one has visibility into both locations at once.',
    howItHelps:
      'You see stock levels for every item at every location. Low-stock alerts fire before things run out. Staff request what they need and you approve with one click.',
    route: '/admin/supplies',
    tourId: 'inventory',
    steps: [
      'Open Supply Management from your admin menu',
      'Browse the full inventory list by category or location',
      'Set a reorder threshold for each item',
      'Review and approve incoming staff supply requests',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: ShoppingCart,
    title: 'Request Supplies',
    description:
      'Submit a supply request to Christina in under a minute. No texts, no sticky notes, no guessing whether she saw it.',
    whyItExists:
      'Supply requests made verbally or by text got forgotten constantly. Staff didn\u2019t know if their request was approved, ordered, or never received. That friction led to either shortages or staff buying things themselves.',
    howItHelps:
      'You submit a request with the item, quantity, and reason. Christina sees it, approves or declines, and you get a notification either way. The request lives in the system whether or not she\u2019s standing right there.',
    route: '/employee/supplies',
    tourId: 'supply-request',
    steps: [
      'Open Request Supplies from your employee menu',
      'Search for the item or add a new one',
      'Set the quantity and add a note if needed',
      'Submit and watch for approval notification',
    ],
    roles: ['staff'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },

  // ─── Section 5: Business & Growth ───────────────────────────────────────
  {
    icon: Filter,
    title: 'Enrollment Funnel',
    description:
      'Track every prospective family from first inquiry to first day. See where leads drop off and which classrooms have openings.',
    whyItExists:
      'Enrollment inquiries came in by phone, email, and Facebook message, and there was no reliable way to track which families were still interested. Leads slipped through the cracks, and open spots sat empty longer than they needed to.',
    howItHelps:
      'Every family has a record. You see their stage in the enrollment process, when you last contacted them, and which room they\u2019re interested in. Follow-up reminders keep warm leads from going cold.',
    route: '/admin/pipeline/enrollment',
    tourId: 'enrollment-funnel',
    steps: [
      'Open the Enrollment Funnel from the Pipeline section',
      'Add a new lead when a family makes an inquiry',
      'Move them through stages: Inquiry, Toured, Applied, Enrolled',
      'Set a follow-up reminder to stay in touch',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: FileCheck,
    title: 'Authorization Tracking',
    description:
      'Keep tabs on every subsidy authorization: DHS child care assistance, county contracts, and private pay agreements. Never lose track of what\u2019s been submitted and what\u2019s still pending.',
    whyItExists:
      'Authorization paperwork has hard deadlines, and a single missed renewal can mean a child loses their spot or the center stops getting reimbursed. This tracker makes sure those deadlines don\u2019t sneak up.',
    howItHelps:
      'You see every authorization with its status, renewal date, and the family it\u2019s attached to. Upcoming expirations flag automatically so you have time to act.',
    route: '/admin/pipeline/authorizations',
    steps: [
      'Open Authorization Tracking from the Pipeline',
      'Add each family\u2019s authorization with its type and dates',
      'The dashboard flags anything expiring in the next 30 days',
      'Mark authorizations as renewed when the paperwork comes through',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: MapPin,
    title: 'Tour Manager',
    description:
      'Schedule center tours, track who showed up, and follow up with a message after. Turn a visit into an enrollment.',
    whyItExists:
      'Tours were being scheduled by phone and tracked on a notepad. Families who toured and then went quiet had nowhere to land, so they were forgotten. The conversion rate from tour to enrollment was lower than it needed to be.',
    howItHelps:
      'You schedule the tour, add the family\u2019s contact info, and get a reminder before it happens. After the tour, send a follow-up message with one click. The system tracks how many tours convert to enrollments over time.',
    route: '/admin/pipeline/tours',
    tourId: 'tour-manager',
    steps: [
      'Open Tour Manager from the Pipeline section',
      'Add a new tour with date, time, and family info',
      'Get a reminder 24 hours before the scheduled tour',
      'After the tour, mark outcome and send follow-up',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: TrendingUp,
    title: 'Revenue Forecast',
    description:
      'See projected monthly revenue based on current enrollment, authorizations, and open spots. Know whether you\u2019re on track before the month ends.',
    whyItExists:
      'Revenue in childcare is variable: authorizations change, families disenroll without notice, and CACFP reimbursements fluctuate. Without a forecast, surprises only show up when the bank account is already affected.',
    howItHelps:
      'The forecast pulls from real enrollment numbers and authorization amounts. You see the gap between projected and actual and can plan accordingly, whether that means filling a spot or adjusting hours.',
    route: '/admin/financial/forecasting',
    tourId: 'revenue-forecast',
    steps: [
      'Open Revenue Forecasting from the Financial section',
      'Review the current month\u2019s projected vs. actual revenue',
      'See which open spots represent lost revenue',
      'Use the scenario tool to model what filling those spots would change',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: Building2,
    title: 'Cross-Site Operations',
    description:
      'One view for both centers. Compare attendance, staffing, and supply levels across Crystal and Brooklyn Park without switching tabs.',
    whyItExists:
      'Running two locations creates a mental overhead that accumulates every day. You\u2019re always wondering if the thing that\u2019s true at one site is also true at the other. This collapses that into a single screen.',
    howItHelps:
      'Side-by-side metrics let you see which location needs attention today. Resource reallocation, like moving supplies from one site to another, starts with a clear picture of what\u2019s where.',
    route: '/admin/operations',
    tourId: 'cross-site-ops',
    steps: [
      'Open Operations from your admin dashboard',
      'View the side-by-side comparison dashboard',
      'Click either center to drill into its details',
      'Use the transfer tool to move resources between sites',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: AlertTriangle,
    title: 'Incident Log',
    description:
      'Document injuries, near-misses, and behavioral incidents with a timestamped record. Generate reports for licensing when needed.',
    whyItExists:
      'Incident documentation is a licensing requirement, but paper incident reports get misplaced, are hard to search, and offer no way to spot patterns. A recurring situation with one child or room should be visible before it escalates.',
    howItHelps:
      'You log an incident in under three minutes. It\u2019s timestamped, attached to the child\u2019s record, and available whenever licensing asks. Patterns across incidents are surfaced automatically.',
    route: '/admin/incidents/log',
    tourId: 'incident-log',
    steps: [
      'Open Incident Log from the Safety section',
      'Click New Incident and fill in the required fields',
      'Attach photos or witness notes if applicable',
      'Export a report for licensing or parent communication',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: ClipboardCheck,
    title: 'Meeting Efficiency',
    description:
      'Run staff meetings with a structured agenda, track action items, and make sure decisions from last week actually happened.',
    whyItExists:
      'Staff meetings often covered the same ground week after week because there was no record of what was decided or who committed to doing what. Good ideas got lost between meetings.',
    howItHelps:
      'You open a meeting, work through the agenda, and assign action items before everyone leaves. Next week\u2019s meeting opens with a review of what was supposed to happen. Accountability becomes automatic.',
    route: '/admin/meetings/efficiency',
    tourId: 'meeting-efficiency',
    steps: [
      'Open Meeting Efficiency and create a new meeting',
      'Add agenda items before the meeting starts',
      'During the meeting, take notes and assign action items',
      'At the next meeting, review the open action items first',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
];

// ---------------------------------------------------------------------------
// Section definitions
// ---------------------------------------------------------------------------
const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description:
      'Three doors into the platform: one for families, one for staff, and one for Christina. Start here.',
    icon: Rocket,
    color: RED,
    category: 'Getting Started',
  },
  {
    id: 'daily-essentials',
    title: 'Daily Essentials',
    description:
      'The tools that run every day: meals, attendance, photos, tasks, and the quiet-hour checklist.',
    icon: Sun,
    color: GREEN,
    category: 'Daily Essentials',
  },
  {
    id: 'communication',
    title: 'Communication',
    description:
      'Photos for families, newsletters for everyone, messages when it matters, and preferences that respect your time.',
    icon: MessageSquare,
    color: BLUE,
    category: 'Communication',
  },
  {
    id: 'scheduling-staff',
    title: 'Scheduling & Staff',
    description:
      'Schedules that work, a wiki that answers questions, and the tools that help your team grow.',
    icon: Calendar,
    color: CORAL,
    category: 'Scheduling & Staff',
  },
  {
    id: 'business-growth',
    title: 'Business & Growth',
    description:
      'Enrollment pipelines, revenue forecasts, two-center operations, and the compliance tools that protect what you\u2019ve built.',
    icon: TrendingUp,
    color: PURPLE,
    category: 'Business & Growth',
  },
];

// ---------------------------------------------------------------------------
// Total tours count (cards that have a tourId)
// ---------------------------------------------------------------------------
const TOTAL_GUIDES = allCards.filter((c) => c.tourId).length;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function GuidePage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [exploredCount, setExploredCount] = useState(0);

  useEffect(() => {
    const progress = getTourProgress();
    const completedTourIds = new Set(
      Array.from(Object.entries(progress.tours))
        .filter(([, t]) => t.lastStepReached === t.totalSteps)
        .map(([id]) => id)
    );
    setExploredCount(completedTourIds.size);
  }, []);

  const filteredCards = selectedRole
    ? allCards.filter((c) => c.roles.includes(selectedRole as 'parent' | 'staff' | 'admin'))
    : allCards;

  const progressPct =
    TOTAL_GUIDES > 0 ? Math.round((exploredCount / TOTAL_GUIDES) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <GuideHero />

      <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 max-w-xl mx-auto">
            <span className="text-xs text-gray-500 whitespace-nowrap font-medium shrink-0">
              {exploredCount} of {TOTAL_GUIDES} guides explored
            </span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(to right, #C62828, #FF7043)',
                }}
              />
            </div>
            <span className="text-xs font-bold text-christina-red shrink-0 w-9 text-right">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const cards = filteredCards.filter(
          (c) => c.category === section.category
        );

        if (cards.length === 0) return null;

        return (
          <GuideSection
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
            icon={section.icon}
            accentColor={section.color}
          >
            {cards.map((card) => (
              <FeatureCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
                whyItExists={card.whyItExists}
                howItHelps={card.howItHelps}
                route={card.route}
                tourId={card.tourId}
                steps={card.steps}
                roles={card.roles}
                categoryColor={section.color}
              />
            ))}
          </GuideSection>
        );
      })}

      {/* Empty state */}
      {filteredCards.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-gray-400 text-lg">
            No features match that filter yet.
          </p>
          <button
            onClick={() => setSelectedRole(null)}
            className="mt-4 text-sm text-christina-red underline"
          >
            Show everything
          </button>
        </div>
      )}

      {/* Footer nudge */}
      <div className="py-14 bg-gradient-to-br from-christina-red via-red-800 to-red-950 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to start? Pick any tool above.
          </h3>
          <p className="text-red-200 text-sm max-w-lg mx-auto">
            Every feature has a guided tour built in. Look for the{' '}
            <span className="font-semibold text-amber-300">Take the Tour</span>{' '}
            button and follow the steps at your own pace.
          </p>
        </div>
      </div>
    </main>
  );
}
