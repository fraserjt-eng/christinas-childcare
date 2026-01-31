import { type DriveStep } from 'driver.js';

export interface TourConfig {
  id: string;
  title: string;
  description: string;
  steps: DriveStep[];
}

// ============================================
// Lesson Builder Tour - Comprehensive (20 steps)
// ============================================
export const lessonBuilderTour: TourConfig = {
  id: 'lesson-builder',
  title: 'Lesson Builder Tour',
  description: 'Learn how to create AI-powered lesson plans',
  steps: [
    {
      popover: {
        title: 'Welcome to Lesson Builder!',
        description: 'This powerful tool helps you create engaging, age-appropriate lesson plans using AI. In this tour, you\'ll learn how to generate complete lessons in minutes.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="lesson-form"]',
      popover: {
        title: 'Your Lesson Workspace',
        description: 'This is where you\'ll create lessons. Fill in a few details about what you want to teach, and AI will generate a complete lesson plan with objectives, activities, and materials.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="new"]',
      popover: {
        title: 'New Lesson Tab',
        description: 'Start here to create a new lesson from scratch. This is where you\'ll spend most of your time when building curriculum.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="library"]',
      popover: {
        title: 'Your Lesson Library',
        description: 'All saved lessons appear here. You can search by topic, filter by age or domain, and mark favorites for quick access. Think of it as your personal curriculum database.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="remix"]',
      popover: {
        title: 'Remix Existing Lessons',
        description: 'WHY: Great lessons can work for multiple ages with adjustments. Remix lets you adapt any lesson for a different age group automatically, saving you from starting over.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="analytics"]',
      popover: {
        title: 'Teaching Analytics',
        description: 'Track your lesson creation patterns. See which domains you focus on most, how many lessons you\'ve created, and identify gaps in your curriculum coverage.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Let\'s Create a Lesson',
        description: 'Now I\'ll walk you through each field in the lesson form. These inputs help the AI understand exactly what kind of lesson you need.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="age-group"]',
      popover: {
        title: 'Step 1: Select Age Group',
        description: 'WHY THIS MATTERS: The AI customizes everything based on age - vocabulary complexity, attention span considerations, safety requirements, and developmental appropriateness.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="age-group"]',
      popover: {
        title: 'Age Group Options',
        description: 'Infant (6wk-16mo): Sensory, early motor skills. Toddler (16-33mo): Exploration, language building. Preschool (33mo-5yr): Pre-academic skills. School Age (5-12yr): Complex concepts.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="topic-input"]',
      popover: {
        title: 'Step 2: Enter Your Topic',
        description: 'Type what you want to teach. Be specific ("Life cycle of butterflies") or broad ("Nature"). The more specific, the more focused your lesson. Examples: Weather, Colors, Community Helpers.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="topic-input"]',
      popover: {
        title: 'Topic Tips',
        description: 'TIP: Connect to current events, seasons, or class themes. "Fall leaves" in autumn, "Valentine\'s friendship" in February. This makes lessons more relevant and engaging.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="domain-select"]',
      popover: {
        title: 'Step 3: Choose Learning Domain',
        description: 'WHY: Different domains develop different skills. The AI will emphasize activities that strengthen the chosen area while still incorporating other domains naturally.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="domain-select"]',
      popover: {
        title: 'Understanding Domains',
        description: 'Cognitive: Problem-solving, memory, reasoning. Language: Vocabulary, communication. Physical: Motor skills, coordination. Social-Emotional: Feelings, relationships. Creative: Art, music, imagination.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="duration-select"]',
      popover: {
        title: 'Step 4: Set Duration',
        description: 'Choose how long the lesson should run. The AI adjusts depth and number of activities accordingly. Shorter = focused. Longer = more exploration time.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="duration-select"]',
      popover: {
        title: 'Duration Guidelines',
        description: 'TIP: Infants/Toddlers: 15-20 min max (short attention spans). Preschool: 20-30 min ideal. School-Age: Can handle 45-60 min with breaks. When in doubt, go shorter.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="context-input"]',
      popover: {
        title: 'Step 5: Additional Context',
        description: 'OPTIONAL BUT POWERFUL: Add special requirements here. The AI uses this to customize your lesson beyond the basic settings.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="context-input"]',
      popover: {
        title: 'Context Examples',
        description: 'Try: "Include outdoor activity" / "Child with peanut allergy" / "Tie into field trip" / "Focus on quiet activities" / "Incorporate Spanish vocabulary" / "Use materials we already have"',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generate-btn"]',
      popover: {
        title: 'Step 6: Generate!',
        description: 'Click here and AI creates your complete lesson in 10-30 seconds. Don\'t like the result? Click again for a fresh approach. You can regenerate as many times as needed.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lesson-preview"]',
      popover: {
        title: 'Review Your Lesson',
        description: 'The generated lesson appears here with: Learning objectives, Materials list, Step-by-step activities with timing, Discussion questions, Assessment ideas. You can edit any section.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="save-btn"]',
      popover: {
        title: 'Save to Library',
        description: 'Happy with your lesson? Save it! You can also download as PDF for printing, share with colleagues, or come back later to remix for different ages.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'You\'re Ready!',
        description: 'That\'s the Lesson Builder! Start by creating a simple lesson - maybe about shapes or colors. Visit /training for video tutorials and detailed guides.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Curriculum Library Tour - Comprehensive (15 steps)
// ============================================
export const curriculumLibraryTour: TourConfig = {
  id: 'curriculum-library',
  title: 'Curriculum Library Tour',
  description: 'Navigate and manage your lesson collection',
  steps: [
    {
      popover: {
        title: 'Welcome to Curriculum Management!',
        description: 'This page helps you organize curriculum by classroom, track developmental milestones, and keep assessments organized. Everything you need for quality early education.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[value="Infant"]',
      popover: {
        title: 'Classroom Tabs',
        description: 'Switch between rooms to view age-specific curriculum. Each classroom has its own standards, activities, and assessments appropriate for that developmental stage.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Why Organize by Room?',
        description: 'WHY: Children develop at different rates. Organizing by room ensures you\'re always working with age-appropriate materials and tracking relevant milestones.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[value="standards"]',
      popover: {
        title: 'Developmental Standards',
        description: 'View developmental milestones for each age group. Track which skills are mastered, developing, or emerging. Great for parent conferences and progress reports.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="standards"]',
      popover: {
        title: 'Using Standards Effectively',
        description: 'TIP: Review standards weekly. Use them to guide lesson planning - if kids are working on counting, create lessons that reinforce that skill.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="activities"]',
      popover: {
        title: 'Weekly Activities',
        description: 'See the weekly activity schedule at a glance. Each day shows planned activities with domain focus, duration, and materials needed.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="lessons"]',
      popover: {
        title: 'Lesson Plans',
        description: 'Access detailed lesson plans with objectives, materials, and step-by-step instructions. Print for teachers or display on tablets during activities.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="assessments"]',
      popover: {
        title: 'Child Assessments',
        description: 'WHY ASSESS: Assessments help you understand each child\'s progress and identify areas needing support. Required for quality programs and helpful for parents.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="assessments"]',
      popover: {
        title: 'Assessment Tools',
        description: 'Track individual progress with rubric-based scoring. Document skills across developmental areas over time. Generate progress reports automatically.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="feedback"]',
      popover: {
        title: 'Teacher Observations',
        description: 'Anecdotal records capture important moments. "Maya shared toys today without prompting" - these notes paint a picture of each child\'s development journey.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="feedback"]',
      popover: {
        title: 'Observation Tips',
        description: 'TIP: Aim for 1-2 observations per child per week. Note specific behaviors, not judgments. "Stacked 5 blocks" not "Good at blocks."',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="reports"]',
      popover: {
        title: 'Family Reports',
        description: 'Generate progress reports that summarize assessments and observations in parent-friendly language. Share during conferences or send home quarterly.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="reports"]',
      popover: {
        title: 'Report Best Practices',
        description: 'WHY SHARE: Parents want to know how their child is doing. Regular reports build trust and create partnership in the child\'s education.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Explore Each Room',
        description: 'Click through different rooms and tabs to explore. The curriculum adapts to each age group automatically. Visit /training for detailed guides.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Staff Management Tour - Comprehensive (14 steps)
// ============================================
export const staffManagementTour: TourConfig = {
  id: 'staff-management',
  title: 'Staff Management Tour',
  description: 'Manage your team and their information',
  steps: [
    {
      popover: {
        title: 'Staff Management',
        description: 'Manage team profiles, track certifications, and maintain compliance. This is your central hub for all staff-related information and documentation.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="staff-list"]',
      popover: {
        title: 'Staff Directory',
        description: 'See all team members at a glance. Color indicators show certification status: Green = all current, Yellow = expires within 60 days, Red = something expired.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="staff-list"]',
      popover: {
        title: 'Why Status Matters',
        description: 'WHY: DCYF requires current certifications. Expired CPR or background checks can result in citations. The color system helps you stay ahead.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="add-staff"]',
      popover: {
        title: 'Add New Staff',
        description: 'Click here to add team members. You\'ll enter contact info, role, classroom assignment, and upload certifications. The system tracks everything from day one.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="staff-card"]',
      popover: {
        title: 'Staff Profile Cards',
        description: 'Click any staff member to view their full profile. See certifications, assigned classrooms, schedule, and contact information all in one place.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="certifications"]',
      popover: {
        title: 'Certification Tracking',
        description: 'The system tracks CPR, First Aid, background checks, food handler permits, and training certificates. Each has an expiration date that triggers automatic reminders.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="certifications"]',
      popover: {
        title: 'Certification Alerts',
        description: 'HOW IT WORKS: 60 days before expiration, you and the staff member receive email alerts. Another reminder at 30 days. No more surprise expirations!',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="classroom-assignment"]',
      popover: {
        title: 'Classroom Assignments',
        description: 'Assign staff to specific classrooms. This affects ratio calculations - the system uses assignments to determine if each room has adequate staffing.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="classroom-assignment"]',
      popover: {
        title: 'Float Staff',
        description: 'TIP: Staff can be assigned to multiple rooms if they float. Check all applicable rooms so ratios calculate correctly when they\'re covering.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Staff Reports',
        description: 'Generate reports for DCYF visits: Contact lists for emergencies, Certification status summaries, Hours worked for payroll. Export as PDF or Excel.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'During DCYF Visits',
        description: 'TIP: Print the certification status report before inspections. It shows all staff with their cert dates in one document - inspectors love organized records.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'Stay Compliant',
        description: 'Keep certifications current, maintain accurate classroom assignments, and update records promptly. The system makes compliance easy if you keep it updated.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Attendance Tour - Comprehensive (15 steps)
// ============================================
export const attendanceTour: TourConfig = {
  id: 'attendance',
  title: 'Attendance Tour',
  description: 'Track daily attendance and ratios',
  steps: [
    {
      popover: {
        title: 'Attendance Tracking',
        description: 'Track check-ins/check-outs, monitor ratios in real-time, and maintain compliance records. This is critical for both billing accuracy and licensing.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="date-picker"]',
      popover: {
        title: 'Date Selection',
        description: 'Today is selected by default. Use the date picker to view or edit attendance for any date - useful for corrections or viewing historical records.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="date-picker"]',
      popover: {
        title: 'Historical Records',
        description: 'WHY IT MATTERS: Accurate historical records are essential for billing reconciliation and DCYF audits. Always correct same-day if possible.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="classroom-tabs"]',
      popover: {
        title: 'Classroom View',
        description: 'Switch between classrooms to manage attendance room by room. Each tab shows only enrolled children and current ratio for that space.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="child-list"]',
      popover: {
        title: 'Child List',
        description: 'See all enrolled children with status: Checked in (time shown), Checked out (departure time), Not arrived (no check-in yet).',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="check-in"]',
      popover: {
        title: 'Check-In Process',
        description: 'Click to check a child in when they arrive. The exact time is recorded automatically. You can add notes like "Didn\'t sleep well" or "Has doctor appointment at 2pm".',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="check-in"]',
      popover: {
        title: 'Check-Out Safety',
        description: 'At pickup, select the authorized person from the dropdown. If someone not on the list attempts pickup, the system alerts you. Always verify ID for unfamiliar faces.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="ratio-display"]',
      popover: {
        title: 'Ratio Monitor',
        description: 'CRITICAL: This shows real-time staff-to-child ratios. Green = compliant. Yellow = approaching limit. Red = over ratio - take action immediately.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="ratio-display"]',
      popover: {
        title: 'Minnesota Requirements',
        description: 'DCYF RATIOS: 1:4 Infants, 1:7 Toddlers, 1:10 Preschool, 1:15 School-age. The system knows these and monitors continuously throughout the day.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'When Ratios Go Red',
        description: 'ACTION REQUIRED: Move a floater to that room, call in backup, or (as last resort) combine with another room temporarily. Document any ratio issues.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="attendance-reports"]',
      popover: {
        title: 'Attendance Reports',
        description: 'Generate reports for any date range: Daily sign-in sheets, Monthly summaries, Ratio compliance logs. Export as PDF for records or Excel for analysis.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="attendance-reports"]',
      popover: {
        title: 'Billing Integration',
        description: 'TIP: Monthly attendance summaries show exact days attended per child - perfect for billing reconciliation. No more manual counting!',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Best Practices',
        description: 'Check in/out immediately (don\'t batch at end of day). Watch the ratio monitor during transitions. Keep pickup lists current. Verify unfamiliar faces.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'You\'re Ready!',
        description: 'Accurate attendance records are the foundation of compliance. The system makes it easy - just stay consistent with check-ins and check-outs.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Reports Tour - Comprehensive (16 steps)
// ============================================
export const reportsTour: TourConfig = {
  id: 'reports',
  title: 'Reports Tour',
  description: 'Generate insights and compliance reports',
  steps: [
    {
      popover: {
        title: 'Reports & Analytics',
        description: 'Generate the reports you need for billing, parent communication, and DCYF compliance. Everything is organized by category and exportable.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="report-categories"]',
      popover: {
        title: 'Report Categories',
        description: 'Reports are organized by purpose: Attendance, Enrollment, Financial, Staff, and Compliance. Each category has pre-built reports for common needs.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="report-categories"]',
      popover: {
        title: 'Finding the Right Report',
        description: 'TIP: Not sure which report you need? Start with the category that matches your question. Billing issue? Try Financial. DCYF visit? Try Compliance.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="report-types"]',
      popover: {
        title: 'Available Reports',
        description: 'Select the specific report you need. Options vary by category - attendance summaries, payment records, certification status, incident logs, and more.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="date-range"]',
      popover: {
        title: 'Date Range Selection',
        description: 'Choose your time period: Today, This Week, This Month, or custom range. Most reports let you pick any dates - useful for quarterly reviews or audits.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="filters"]',
      popover: {
        title: 'Filters',
        description: 'Narrow your report by classroom, age group, or staff member. Get exactly the data you need without extra noise.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generate-report"]',
      popover: {
        title: 'Generate Report',
        description: 'Click Generate and the report appears on screen instantly. You can sort columns, search within results, and review before exporting.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="export-options"]',
      popover: {
        title: 'Export Options',
        description: 'Download your report: PDF for printing/emailing (includes branding), Excel for further analysis, CSV for importing to other systems.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="export-options"]',
      popover: {
        title: 'Which Format?',
        description: 'TIP: PDF for parents and inspectors (looks professional). Excel for your own analysis. CSV for accountants or external systems.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Attendance Reports',
        description: 'Daily sign-in sheets (print for backup). Monthly summaries (billing). Ratio compliance logs (prove you maintained staffing). Absence tracking.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'Financial Reports',
        description: 'Revenue by program, Outstanding balances, Payment history, Tuition by family. Essential for end-of-month reconciliation.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'Compliance Reports',
        description: 'WHY THESE MATTER: Staff qualification summary, Ratio compliance logs, Incident reports, Training documentation. Have these ready for inspections.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="schedule-report"]',
      popover: {
        title: 'Scheduled Reports',
        description: 'Set reports to generate and email automatically. Weekly attendance to management, monthly billing to yourself, quarterly compliance reviews.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="schedule-report"]',
      popover: {
        title: 'Scheduling Tips',
        description: 'TIP: Schedule a monthly certification status report to yourself. You\'ll always know what\'s expiring before it becomes urgent.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Ready for Any Request',
        description: 'DCYF visit? Print compliance reports. Parent question? Pull their child\'s attendance. Billing discrepancy? Export financial data. You\'re prepared.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// Export all tours
export const tours: Record<string, TourConfig> = {
  'lesson-builder': lessonBuilderTour,
  'curriculum-library': curriculumLibraryTour,
  'staff-management': staffManagementTour,
  'attendance': attendanceTour,
  'reports': reportsTour,
};

export function getTourById(id: string): TourConfig | undefined {
  return tours[id];
}

export function getAllTourIds(): string[] {
  return Object.keys(tours);
}

export function getTourCount(): number {
  return Object.keys(tours).length;
}
