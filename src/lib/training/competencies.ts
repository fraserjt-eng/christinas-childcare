import { Competency } from '@/types/training';

export const trainingCompetencies: Competency[] = [
  // Employee Competencies (1-8)
  {
    id: 'C01',
    number: 1,
    title: 'Clock In/Out Accurately Every Shift',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-1', 'unit-2'],
    levels: {
      guided: 'Forgets to clock in or out at least once per week. Needs reminders from the director. Time entries require manual correction regularly.',
      independent: 'Clocks in within 5 minutes of shift start and out at shift end every day. No manual corrections needed. Notifies director immediately if a clock error occurs.',
      mentor: 'Shows new staff how to use the kiosk for time entry. Notices when colleagues forget to clock in and reminds them. Explains the payroll and overtime implications of missed punches.',
    },
  },
  {
    id: 'C02',
    number: 2,
    title: 'Submit All Meal Counts Before Deadline',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-2'],
    levels: {
      guided: 'Needs reminders about deadlines. Misses 1-2 meal counts per week. Needs help using the pre-fill feature. Submits counts with errors.',
      independent: 'Submits all 4 meal types on time daily. Uses pre-fill correctly and adjusts for absent children. Corrects own errors before submitting. Never lets a deadline indicator turn red.',
      mentor: 'Trains new staff on the meal count process and deadlines. Catches pre-fill errors before submission. Explains CACFP reimbursement impact to others. Covers meal count duties when colleagues are absent.',
    },
  },
  {
    id: 'C03',
    number: 3,
    title: 'Upload 3+ Tagged Photos Per Shift',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-2'],
    levels: {
      guided: 'Uploads fewer than 3 photos most shifts. Forgets to add activity tags. Captions are blank or generic. Needs reminders to take photos.',
      independent: 'Uploads 3-5 photos per shift with accurate activity tags and descriptive captions. Takes photos during different activity blocks. Follows the approval workflow.',
      mentor: 'Takes high-quality photos that capture engagement and learning. Coaches new staff on what makes a good classroom photo. Suggests new activity tags. Batch uploads efficiently.',
    },
  },
  {
    id: 'C04',
    number: 4,
    title: 'Complete All Assigned Tasks by End of Shift',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-2'],
    levels: {
      guided: 'Leaves tasks incomplete without notifying the director. Does not check the task board at shift start. Misses priority-based ordering.',
      independent: 'Checks task board at shift start. Completes all assigned tasks by end of shift. Works through urgent items first. Marks tasks complete immediately. Uses nap-time window for admin tasks.',
      mentor: 'Identifies tasks that need to be created and suggests them. Helps colleagues prioritize their task boards. Develops efficient task routines others adopt. Flags systemic task issues.',
    },
  },
  {
    id: 'C05',
    number: 5,
    title: 'File Incident Report Within 30 Minutes',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-4'],
    levels: {
      guided: 'Delays incident reports past 30 minutes. Leaves fields incomplete. Assigns incorrect severity level. Forgets to notify parents.',
      independent: 'Files complete incident reports within 30 minutes. Selects correct severity level. Includes all required fields. Notifies parent through the system same day.',
      mentor: 'Helps new staff file their first incident reports correctly. Reviews reports for completeness before submission. Explains which incidents are licensure-reportable. Identifies patterns in incident data.',
    },
  },
  {
    id: 'C06',
    number: 6,
    title: 'Maintain Current Certifications in System',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-4'],
    levels: {
      guided: 'Does not know expiration dates for own certifications. Ignores system alerts. Discovers expired certifications only when the director flags them.',
      independent: 'Knows expiration dates for all required certifications. Responds to 90/60/30-day alerts by scheduling renewal. Logs training hours promptly.',
      mentor: 'Helps new staff understand certification requirements. Shares information about available training classes. Reminds colleagues when renewal alerts appear. Maintains a training resource list.',
    },
  },
  {
    id: 'C07',
    number: 7,
    title: 'Respond to Parent Messages Within 4 Hours',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-3'],
    levels: {
      guided: 'Does not check messages during the shift. Leaves parent messages unanswered for 24+ hours. Responses are incomplete. Forgets to flag messages needing director attention.',
      independent: 'Checks messages at shift start and end. Responds within 4 business hours. Responses are professional and clear. Escalates messages requiring director input.',
      mentor: 'Models professional communication tone. Helps draft responses to sensitive messages. Suggests message templates for common questions. De-escalates concerned parent messages.',
    },
  },
  {
    id: 'C08',
    number: 8,
    title: 'Check Dashboard Alerts at Start of Shift',
    roles: ['teacher', 'admin', 'owner'],
    unitIds: ['unit-1', 'unit-2'],
    levels: {
      guided: 'Does not open the dashboard at shift start. Misses alerts about attendance, tasks, or ratio warnings. Relies entirely on verbal updates.',
      independent: 'Opens the dashboard within 10 minutes of shift start. Reviews alerts, attendance, and task assignments. Acts on red or yellow alerts immediately. Confirms key info with outgoing shift.',
      mentor: 'Explains dashboard layout and alert meanings to new staff. Has developed a shift-start routine others follow. Identifies when dashboard data looks wrong. Uses dashboard data to plan proactively.',
    },
  },

  // Director Competencies (9-14)
  {
    id: 'C09',
    number: 9,
    title: 'Build Compliant Weekly Schedule Under Budget',
    roles: ['admin', 'owner'],
    unitIds: ['unit-5'],
    levels: {
      guided: 'Creates schedules with ratio gaps requiring last-minute fixes. Does not check labor cost projection. Schedules result in unplanned overtime. Publishes late.',
      independent: 'Drafts schedule by Wednesday. Verifies ratio compliance for every hour. Checks labor cost and adjusts to stay within budget. Publishes by Thursday noon. Processes coverage requests within 24 hours.',
      mentor: 'Teaches new directors scheduling workflow including staggered staffing. Identifies optimization opportunities. Creates scheduling templates for common patterns.',
    },
  },
  {
    id: 'C10',
    number: 10,
    title: 'Process Enrollment Inquiry Within 48 Hours',
    roles: ['admin', 'owner'],
    unitIds: ['unit-6'],
    levels: {
      guided: 'Inquiries sit without follow-up for 3+ days. Does not capture complete information. Does not schedule tours proactively. Pipeline has stalled leads with no notes.',
      independent: 'Responds to every inquiry within 48 hours. Captures complete intake data. Schedules tours during initial conversation. Updates pipeline status and adds follow-up notes.',
      mentor: 'Converts inquiries to tours above 50%. Coaches staff on phone inquiry handling. Develops follow-up templates. Tracks conversion rates. Recovers stalled leads.',
    },
  },
  {
    id: 'C11',
    number: 11,
    title: 'Achieve 90%+ CACFP Audit Readiness Score',
    roles: ['admin', 'owner'],
    unitIds: ['unit-4'],
    levels: {
      guided: 'Does not check compliance dashboard regularly. Audit readiness below 85%. Cannot locate required documents during practice audit.',
      independent: 'Checks compliance dashboard every Monday. Maintains 90%+ readiness. Addresses yellow items same day, red within 1 hour. Pulls audit documents within 5 minutes. Generates compliance reports.',
      mentor: 'Maintains 95%+ readiness. Conducts mock audits quarterly. Trains new directors on CACFP requirements. Identifies compliance trends and implements prevention.',
    },
  },
  {
    id: 'C12',
    number: 12,
    title: 'Conduct Monthly 1:1 with Each Staff Member',
    roles: ['admin', 'owner'],
    unitIds: ['unit-5'],
    levels: {
      guided: 'Skips monthly 1:1s or holds them inconsistently. Does not document conversations. Feedback is vague.',
      independent: 'Holds documented 1:1 every month. Uses HR module to record topics, goals, follow-ups. Provides specific, behavior-based feedback. References previous notes to track progress.',
      mentor: 'Uses HR data to prepare for conversations. Connects individual development to center goals. Coaches other directors on effective 1:1 practices. Creates development pathways.',
    },
  },
  {
    id: 'C13',
    number: 13,
    title: 'Send Weekly Newsletter by Friday',
    roles: ['admin', 'owner'],
    unitIds: ['unit-3'],
    levels: {
      guided: 'Newsletters go out inconsistently. Content is minimal. Does not use templates. Does not check read receipts.',
      independent: 'Sends newsletter every Friday by 3:00 PM. Includes 3+ sections. Uses templates. Reviews read receipts the following Monday.',
      mentor: 'Creates templates others use. Maintains content calendar. Writes newsletters parents forward to prospects. Tracks which content types get highest reads.',
    },
  },
  {
    id: 'C14',
    number: 14,
    title: 'Resolve Ratio Violations Within 15 Minutes',
    roles: ['admin', 'owner'],
    unitIds: ['unit-4'],
    levels: {
      guided: 'Does not notice violations until told. Takes 30+ minutes to resolve. Relies solely on owner for backup. No coverage plan for common scenarios.',
      independent: 'Monitors ratio dashboard at every transition. Contacts backup or reassigns within 15 minutes. Maintains current substitute list. Documents violation and resolution.',
      mentor: 'Prevents most violations through proactive scheduling. Created a coverage protocol staff follow independently. Trains staff to self-monitor ratios. Analyzes ratio data for recurring vulnerability windows.',
    },
  },

  // Owner Competencies (15-20)
  {
    id: 'C15',
    number: 15,
    title: 'Review Budget vs. Actual Monthly (Variance Under 10%)',
    roles: ['owner'],
    unitIds: ['unit-7'],
    levels: {
      guided: 'Reviews budget quarterly or less. Cannot identify over-budget categories without help. Does not use budget dashboard. Variances exceed 10% before detection.',
      independent: 'Reviews budget vs actual on the 1st of every month. Investigates any variance over 10%. Takes corrective action within the same month. Exports data for accountant.',
      mentor: 'Maintains all categories within 5% variance. Uses historical data for accurate targets. Teaches directors to monitor site-level spending. Connects budget to strategic decisions.',
    },
  },
  {
    id: 'C16',
    number: 16,
    title: 'Run Revenue Forecast and Scenario Model Quarterly',
    roles: ['owner'],
    unitIds: ['unit-7'],
    levels: {
      guided: 'Does not use forecasting tool. Makes decisions on current-month data only. Cannot describe breakeven enrollment. Has never run a what-if scenario.',
      independent: 'Runs forecast at least quarterly. Knows breakeven enrollment per site. Models scenarios before pricing/staffing/expansion decisions. Uses forecast data in strategic planning.',
      mentor: 'Runs monthly forecasts proactively. Models multiple scenarios before major decisions and documents analysis. Uses forecast accuracy to improve projections. Teaches directors to interpret revenue reports.',
    },
  },
  {
    id: 'C17',
    number: 17,
    title: 'Update Strategic Plan Quarterly',
    roles: ['owner'],
    unitIds: ['unit-8'],
    levels: {
      guided: 'Strategic plan not updated in 6+ months. Cannot name priorities without looking them up. Does not connect daily decisions to strategic goals.',
      independent: 'Reviews and updates quarterly. Conducts SWOT refresh each review. Tracks 2-3 measurable priorities with deadlines. Translates priorities into monthly action items on the task board.',
      mentor: 'Plan visibly drives decisions. Involves directors in quarterly reviews. Adjusts priorities based on data rather than crisis. Articulates a 12-month strategic narrative.',
    },
  },
  {
    id: 'C18',
    number: 18,
    title: 'Maintain Zero Expired Staff Certifications',
    roles: ['owner'],
    unitIds: ['unit-4', 'unit-5'],
    levels: {
      guided: 'Discovers expirations reactively. Does not review dashboard regularly. No staggered renewal system.',
      independent: 'Reviews certification dashboard monthly. Responds to 90-day alerts. Ensures no expirations without scheduled renewal. Coordinates training to avoid multiple absences.',
      mentor: 'Implemented staggered renewal calendar. Maintains provider relationships for priority enrollment. Built certification health metric. Coaches directors to own tracking for their teams.',
    },
  },
  {
    id: 'C19',
    number: 19,
    title: 'Cross-Site Dashboard Review Daily',
    roles: ['owner'],
    unitIds: ['unit-8'],
    levels: {
      guided: 'Relies on phone calls or site visits. Does not open cross-site dashboard regularly. Learns about issues late.',
      independent: 'Reviews dashboard every morning before site visit decisions. Manages by exception. Uses cross-site comparison for best practice transfer. Reduces unnecessary travel.',
      mentor: 'Reduced weekly travel from 15+ to under 5 hours. Uses cross-site data in director 1:1s. Identifies trends only visible through comparison. Delegates routine monitoring.',
    },
  },
  {
    id: 'C20',
    number: 20,
    title: 'Delegate 60%+ of Operational Tasks',
    roles: ['owner'],
    unitIds: ['unit-8'],
    levels: {
      guided: 'Performs most operational tasks personally. Spends less than 2 hours/week on strategic work. Task board shows owner assigned to routine items.',
      independent: 'Delegates routine tasks to directors and staff with clear expectations. Spends at least 5 hours/week on strategic work. Task board shows owner on strategic and decision-level items only.',
      mentor: 'Built systems that run without daily owner involvement. Directors resolve 90%+ of operational issues. Owner focuses on growth, finance, and organizational development. Can be absent a week with no disruption.',
    },
  },
];

export function getCompetenciesForRole(role: string): Competency[] {
  return trainingCompetencies.filter(c => c.roles.includes(role as Competency['roles'][number]));
}

export function getCompetenciesForUnit(unitId: string): Competency[] {
  return trainingCompetencies.filter(c => c.unitIds.includes(unitId));
}

export function getCompetencyById(id: string): Competency | undefined {
  return trainingCompetencies.find(c => c.id === id);
}
