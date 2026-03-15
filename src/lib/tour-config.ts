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

// ============================================
// Meal Count Tour - Employee Portal (4 steps)
// ============================================
export const mealCountTour: TourConfig = {
  id: 'meal-count',
  title: 'Meal Count Tour',
  description: 'Submit your classroom meal counts quickly',
  steps: [
    {
      popover: {
        title: 'Meal Counts in 15 Seconds',
        description: 'No spreadsheet, no waiting for Christina. This tour shows you how to submit your classroom meal count from your phone in under a minute.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'select',
      popover: {
        title: 'Select Your Classroom',
        description: 'Pick your classroom from the dropdown list. Only the rooms you&apos;re assigned to will appear.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Adjust the Count',
        description: 'The form pre-fills with your enrolled number. Use the plus and minus buttons to adjust for absences or extras.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Hit Submit',
        description: 'Tap Submit and you&apos;re done. Christina sees it instantly in her dashboard. No follow-up needed.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Photo Upload Tour - Employee Portal (5 steps)
// ============================================
export const photoUploadTour: TourConfig = {
  id: 'photo-upload',
  title: 'Photo Upload Tour',
  description: 'Share classroom moments with families',
  steps: [
    {
      popover: {
        title: 'Share Your Classroom Moments',
        description: 'Families love seeing what their kids are up to. This tour shows you how to upload photos in under a minute.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'input[type="file"]',
      popover: {
        title: 'Select Your Photos',
        description: 'Tap to choose photos from your camera or gallery. You can upload up to 5 at a time.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'select',
      popover: {
        title: 'Pick the Activity Type',
        description: 'Label the moment so families know what was happening: art, outdoor play, circle time, sensory, music, and more.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Choose Your Classroom',
        description: 'Select the classroom so parents can find photos of their child&apos;s specific group.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Add a Caption and Submit',
        description: 'A short caption goes a long way. Then hit Submit. Christina reviews every photo before parents can see it, so nothing goes out unreviewed.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Nap Tasks Tour - Employee Portal (4 steps)
// ============================================
export const napTasksTour: TourConfig = {
  id: 'nap-tasks',
  title: 'Nap Tasks Tour',
  description: 'Make the most of your nap window',
  steps: [
    {
      popover: {
        title: 'Your Power Window',
        description: 'The 90 minutes while kids sleep is the most productive time in your day. This tour shows you how to use the task tracker to get through your list without losing track of time.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Tasks Sorted by Quickest First',
        description: 'Your assigned tasks are sorted so the fastest ones appear at the top. Knock out small wins first, then tackle the longer ones.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Tap Start',
        description: 'When you begin a task, tap Start. The timer runs so you know how long you&apos;ve been on it.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Tap Done, Watch the Bar Move',
        description: 'Each completed task moves the progress bar forward. You can see at a glance whether you&apos;re on pace to finish before kids wake up.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Supply Request Tour - Employee Portal (3 steps)
// ============================================
export const supplyRequestTour: TourConfig = {
  id: 'supply-request',
  title: 'Supply Request Tour',
  description: 'Request supplies without the sticky note',
  steps: [
    {
      popover: {
        title: 'Need Supplies?',
        description: 'Skip the sticky note on Christina&apos;s door. Submit a supply request from your phone and she gets it immediately.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Describe What You Need',
        description: 'Type the item name, quantity, and which classroom it&apos;s for. Be specific so Christina can order the right thing.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'select',
      popover: {
        title: 'Set the Urgency Level',
        description: 'Is this needed today, this week, or whenever? Setting urgency helps Christina prioritize her orders.',
        side: 'bottom',
        align: 'start',
      },
    },
  ],
};

// ============================================
// My Development Tour - Employee Portal (4 steps)
// ============================================
export const myDevelopmentTour: TourConfig = {
  id: 'my-development',
  title: 'My Development Tour',
  description: 'Track your certifications and professional goals',
  steps: [
    {
      popover: {
        title: 'Your Professional Growth',
        description: 'Certifications, training hours, and professional goals, all in one place. This tour walks you through what&apos;s tracked and how to read it.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Certification Status',
        description: 'Green means your certification is current. Yellow means it expires within 60 days. Red means it&apos;s expired and needs attention.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Training Hours',
        description: 'Your annual training hours are tracked here against the state requirement. The bar fills as you log completed trainings.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Professional Development Goals',
        description: 'View goals set during your last review and update your progress. Christina sees your updates, so this is a live conversation, not a once-a-year form.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// My Schedule Tour - Employee Portal (3 steps)
// ============================================
export const myScheduleTour: TourConfig = {
  id: 'my-schedule',
  title: 'My Schedule Tour',
  description: 'View your shifts and request changes',
  steps: [
    {
      popover: {
        title: 'Your Schedule, Always Accessible',
        description: 'See your upcoming shifts, request changes, and plan your week without having to ask Christina for a copy of the schedule.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Navigate Between Weeks',
        description: 'Use the arrow buttons to move forward or back through weeks. You can see the current week and as far ahead as Christina has published.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Your Daily Details',
        description: 'Each day shows your start time, end time, and classroom assignment. Need a change? Tap Request Change to send a schedule request directly to Christina.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Parent Photos Tour - Parent Portal (3 steps)
// ============================================
export const parentPhotosTour: TourConfig = {
  id: 'parent-photos',
  title: 'Parent Photos Tour',
  description: 'See daily photos from your child&apos;s classroom',
  steps: [
    {
      popover: {
        title: 'See What Your Child Did Today',
        description: 'Photos uploaded by staff and reviewed by Christina appear here. This tour shows you how to browse and interact with your child&apos;s classroom moments.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Daily Photo Feed',
        description: 'Photos are organized by date with the most recent at the top. You&apos;ll see activity labels and captions from the teacher.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'select',
      popover: {
        title: 'Filter by Classroom',
        description: 'If you have children in different classrooms, use the filter to see just your child&apos;s room. Tap the heart icon to react. Staff can see your engagement.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Parent Newsletter Tour - Parent Portal (3 steps)
// ============================================
export const parentNewsletterTour: TourConfig = {
  id: 'parent-newsletter',
  title: 'Parent Newsletter Tour',
  description: 'Read and search center newsletters',
  steps: [
    {
      popover: {
        title: 'Weekly Updates, Always Available',
        description: 'Every newsletter Christina sends lives here permanently. You can always come back and find something you missed.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'input',
      popover: {
        title: 'Search Past Newsletters',
        description: 'Type a keyword to find specific newsletters. Searching "fall festival" or "flu season" pulls up every newsletter that mentioned it.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Click to Read',
        description: 'Click any newsletter card to expand the full content. Each one includes classroom highlights, upcoming events, and any announcements from the center.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Notification Preferences Tour - Parent Portal (4 steps)
// ============================================
export const notificationPrefsTour: TourConfig = {
  id: 'notification-prefs',
  title: 'Notification Preferences Tour',
  description: 'Control how and when the center contacts you',
  steps: [
    {
      popover: {
        title: 'Hear From Us Your Way',
        description: 'You choose how the center reaches you. This tour walks you through every option so you never miss something important and never get bothered when you don&apos;t want to.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Choose Your Channels',
        description: 'Toggle email, text, or phone call notifications on or off independently. You can mix and match based on what works for your life.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Set Your Frequency',
        description: 'Choose how often you hear from us: immediate (as it happens), daily digest (one summary per day), or weekly summary (just the highlights).',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Topics and Quiet Hours',
        description: 'Choose which topics you want to hear about: newsletters, incidents, closures, or new photos. Then set quiet hours so we never send messages during times that don&apos;t work for you.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Food Counts Compliance Tour - Admin Portal (6 steps)
// ============================================
export const foodCountsComplianceTour: TourConfig = {
  id: 'food-counts-compliance',
  title: 'Food Counts Compliance Tour',
  description: 'Keep CACFP counts accurate and audit-ready',
  steps: [
    {
      popover: {
        title: 'Every Missed Count Costs Money',
        description: 'CACFP reimbursements depend on accurate meal counts. This tour shows you every tool on this tab so nothing slips through.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Quick-Fill Buttons',
        description: 'Three options: Copy Yesterday, Fill from Enrollment, or Everyone Here. One click fills the entire grid. Adjust individual rooms from there.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Compliance Rate',
        description: 'Your on-time submission percentage is tracked here. CACFP programs with consistent late submissions can trigger audits.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Revenue Impact',
        description: 'This card shows exactly how much money missed or late counts have cost you. It&apos;s the clearest way to see why this matters.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'CACFP Checklist',
        description: 'All 16 compliance items are tracked here. Where the system can verify automatically, it does. The rest show as manual items to confirm.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Audit Readiness Score',
        description: 'A 0-100 score that tells you how prepared you are for a CACFP audit right now. Green means ready. Anything below 80 shows you what to fix.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Schedule Board Tour - Admin Portal (6 steps)
// ============================================
export const scheduleBoardTour: TourConfig = {
  id: 'schedule-board',
  title: 'Schedule Board Tour',
  description: 'Build weekly schedules with drag-and-drop',
  steps: [
    {
      popover: {
        title: 'Build Schedules by Dragging Blocks',
        description: 'No more typing numbers into a spreadsheet. This tour shows you how to build next week&apos;s schedule in minutes.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Shift Palette',
        description: 'The palette on the left holds your preset shifts: Morning, Full Day, Afternoon, and any custom shifts you&apos;ve created. Grab one to start.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Drop onto an Employee Row',
        description: 'Drag any shift block from the palette and drop it onto an employee&apos;s row for the day you want. The shift snaps into place.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Click to Edit or Delete',
        description: 'Click any shift block on the board to edit the start and end times or remove it. The ratio calculator updates in real time as you make changes.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Copy Last Week',
        description: 'If schedules don&apos;t change much week to week, use Copy Last Week to duplicate the entire schedule in one click. Then make your adjustments.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Publish the Schedule',
        description: 'Switch to the Publish tab when you&apos;re done. Publishing sends the schedule to all staff so they can see their shifts in the employee portal.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Photo Review Tour - Admin Portal (4 steps)
// ============================================
export const photoReviewTour: TourConfig = {
  id: 'photo-review',
  title: 'Photo Review Tour',
  description: 'Review and approve staff photo uploads',
  steps: [
    {
      popover: {
        title: 'You Approve Before Parents See Anything',
        description: 'Staff upload photos. They come here first. Nothing reaches families until you approve it. This tour shows you the review workflow.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Today&apos;s Uploads by Classroom',
        description: 'Photos are grouped by classroom so you can review each room&apos;s batch together. The upload time and staff name are shown for each photo.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Approve or Reject',
        description: 'Click Approve to send it to the parent portal or Reject to remove it. Rejected photos don&apos;t notify the staff member unless you add a note.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Bulk Actions and Stats',
        description: 'Use Select All when a batch looks good and you want to approve everything at once. The stats bar at the top shows pending, approved, and rejected counts for the day.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Newsletter Builder Tour - Admin Portal (6 steps)
// ============================================
export const newsletterBuilderTour: TourConfig = {
  id: 'newsletter-builder',
  title: 'Newsletter Builder Tour',
  description: 'Build and send family newsletters',
  steps: [
    {
      popover: {
        title: 'A Newsletter Builder Built Into Your Platform',
        description: 'Create, design, and send newsletters to families without leaving the platform. This tour covers everything from writing to sending.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'input',
      popover: {
        title: 'Write Your Subject Line',
        description: 'The subject line is what families see in their inbox. Keep it specific and timely: "March Newsletter: Spring Events and Classroom Updates".',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Add Sections',
        description: 'Build your newsletter by adding sections: Photo Highlights, Upcoming Events, Classroom Spotlight, and Announcements. Each section has its own content area.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Rich Text Editor',
        description: 'Each section uses a full editor: bold, italic, headings, images, and links. Write naturally and format as you go.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Drag to Reorder',
        description: 'Drag sections up or down to change the order before you send. Put the most important content at the top.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Preview, Send, or Schedule',
        description: 'Toggle Preview to see exactly what families will receive. Then choose Send Now to send immediately, Schedule for later to pick a date and time, or Download as PDF to print copies.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Task Kanban Tour - Admin Portal (4 steps)
// ============================================
export const taskKanbanTour: TourConfig = {
  id: 'task-kanban',
  title: 'Task Kanban Tour',
  description: 'See and manage everything that needs doing',
  steps: [
    {
      popover: {
        title: 'Everything in One Board',
        description: 'See every task, who&apos;s handling it, and where it stands. No more wondering what&apos;s in progress or what got dropped.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Three Columns, Drag Between Them',
        description: 'To Do, In Progress, and Done. Drag any card to move it between columns as work progresses. The board updates for everyone in real time.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'What Each Card Shows',
        description: 'Task name, who it&apos;s assigned to, estimated time, priority level, and category. Everything you need to understand the work without opening the card.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Filter and Switch to Insights',
        description: 'Use filters to view tasks by category, person, or center. Switch to the Insights tab to see a breakdown of where your team&apos;s time is actually going.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Cross-Site Ops Tour - Admin Portal (3 steps)
// ============================================
export const crossSiteOpsTour: TourConfig = {
  id: 'cross-site-ops',
  title: 'Cross-Site Operations Tour',
  description: 'Monitor both centers from one view',
  steps: [
    {
      popover: {
        title: 'Both Centers at Once',
        description: 'See Crystal Center and Brooklyn Park side by side without driving between them. This tour shows you how to read the dashboard and act on what you see.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Side-by-Side Status',
        description: 'Each center shows kids present, staff on duty, and ratio compliance right now. You can compare at a glance and see which site needs attention.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Color Codes and Weekly Trends',
        description: 'Green means everything is fine. Yellow means something needs attention soon. Red means act now. Switch to the Weekly Trends tab to see patterns across the full week for both sites.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Knowledge Base Tour - Admin Portal (5 steps)
// ============================================
export const knowledgeBaseTour: TourConfig = {
  id: 'knowledge-base',
  title: 'Knowledge Base Tour',
  description: 'Build institutional memory that stays when staff leave',
  steps: [
    {
      popover: {
        title: 'Stop Losing Knowledge When Staff Leave',
        description: 'When a great employee leaves, their routines, tricks, and procedures leave with them. The knowledge base is how you keep that knowledge inside the center.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Browse by Category',
        description: 'Entries are organized by type: procedures, protocols, daily routines, templates, and checklists. Browse the category that matches what you need.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'input',
      popover: {
        title: 'Search Across Everything',
        description: 'Type any keyword to search all entries at once. Searching "nap" or "allergy" pulls up every relevant entry across all categories.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Create New Entries',
        description: 'Click New Entry to add a procedure, routine, or checklist. The rich text editor supports headings, bullet lists, and numbered steps.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Tag as Required Reading',
        description: 'Mark any entry as required reading for new hires. When you assign a new employee to an onboarding template, they&apos;ll see these entries in their checklist.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Onboarding Tour - Admin Portal (5 steps)
// ============================================
export const onboardingTour: TourConfig = {
  id: 'onboarding',
  title: 'Onboarding Tour',
  description: 'Take new hires from hired to classroom-ready',
  steps: [
    {
      popover: {
        title: 'From Hire to Classroom-Ready',
        description: 'A scrambled first two weeks costs you time and sets new hires up to fail. This tour shows you how to turn onboarding into a structured, trackable path.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Four-Phase Templates',
        description: 'Build onboarding templates with four phases: Pre-Start (before day one), Day 1, Week 1, and Month 1. Each phase holds its own tasks, readings, and checkpoints.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Assign to a New Hire',
        description: 'Select a template and a new hire, enter their start date, and assign. The system calculates all the phase deadlines automatically.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Track Their Progress',
        description: 'Each new hire shows a status: ahead of schedule, on track, behind, or blocked. You can see at a glance who needs a check-in.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'New Hires See Their Own Checklist',
        description: 'New employees log in and see their personal onboarding checklist. They can self-check items as they complete them, so you don&apos;t have to track every step manually.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Enrollment Funnel Tour - Admin Portal (5 steps)
// ============================================
export const enrollmentFunnelTour: TourConfig = {
  id: 'enrollment-funnel',
  title: 'Enrollment Funnel Tour',
  description: 'Track every prospective family from contact to enrolled',
  steps: [
    {
      popover: {
        title: 'No More Leads Falling Through Cracks',
        description: 'Every prospective family from first contact to enrolled, tracked in one place. This tour shows you how the funnel works.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Funnel Chart',
        description: 'The funnel chart shows how many families are at each stage and the conversion rate between stages. A big drop at one stage tells you where to focus.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Pipeline Board',
        description: 'Each prospective family is a card you can advance through stages: inquiry, tour scheduled, tour complete, application submitted, enrolled.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Lead Source Tracking',
        description: 'See which sources actually convert: website, referral, drive-by, social media, community event. Focus your marketing on what&apos;s working.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Revenue Projection',
        description: 'The revenue projection shows how much money is in your pipeline weighted by probability. Great for forecasting and justifying enrollment investment.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Tour Manager Tour - Admin Portal (4 steps)
// ============================================
export const tourManagerTour: TourConfig = {
  id: 'tour-manager',
  title: 'Tour Manager Tour',
  description: 'Schedule and track center tours for prospective families',
  steps: [
    {
      popover: {
        title: 'Every Tour Should Feel the Same',
        description: 'A great center tour is one of your best enrollment tools. This tour shows you how to schedule, run, and follow up on tours consistently.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Schedule a Tour',
        description: 'Enter the parent&apos;s contact info, preferred date and time, and which center. The system adds it to your calendar and sends a confirmation to the family.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Follow the 8-Step Checklist',
        description: 'During the tour, pull up the 8-step checklist on your phone. It keeps you consistent: welcome, safety overview, classroom visits, Q and A, next steps.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Follow Up and Track Conversion',
        description: 'After the tour, send a follow-up email with one click. Track each family through: tour complete, follow-up sent, application received. See your tour-to-enrollment rate.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Revenue Forecast Tour - Admin Portal (5 steps)
// ============================================
export const revenueForecastTour: TourConfig = {
  id: 'revenue-forecast',
  title: 'Revenue Forecast Tour',
  description: 'See your financial picture 6 months out',
  steps: [
    {
      popover: {
        title: 'Stop Being Surprised by Your Finances',
        description: 'The revenue forecast gives you a clear view of what&apos;s coming so you can plan, not react. This tour covers every section.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Financial Health Indicators',
        description: 'Three key numbers: revenue per child (how efficiently you&apos;re monetizing enrollment), operating margin (how much you keep), and break-even enrollment (how many kids you need to cover costs).',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Cash Flow Chart',
        description: 'Six months of projected revenue versus expenses on one chart. See where you&apos;re comfortable and where months look tight.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Scenario Modeling',
        description: 'Slide enrollment numbers up or down and watch the financial impact update in real time. Model the difference between 80% and 90% capacity.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Save and Compare Scenarios',
        description: 'Save up to three scenarios and compare them side by side. Useful for board presentations or deciding whether to expand.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Incident Log Tour - Admin Portal (5 steps)
// ============================================
export const incidentLogTour: TourConfig = {
  id: 'incident-log',
  title: 'Incident Log Tour',
  description: 'Document incidents properly and stay compliant',
  steps: [
    {
      popover: {
        title: 'Document Every Incident Properly',
        description: 'Proper incident documentation protects you, protects the child, and satisfies DCYF. This tour shows you the full workflow.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Structured Form, Required Fields',
        description: 'The form requires all critical fields: what happened, when, where, who was involved, what action was taken, and how the parent was notified. Nothing gets skipped.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Notify Parent with One Click',
        description: 'The Notify Parent button generates the notification message using incident details and sends it via the parent&apos;s preferred channel. The timestamp is logged automatically.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Incident Timeline',
        description: 'All incidents are listed with filters by classroom, date, and type. A red flag appears on any incident where the 24-hour parent notification deadline is approaching.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Pattern Analytics',
        description: 'The Analytics tab shows patterns: which classrooms have the most incidents, what times of day, and whether frequency is trending up or down. Use it for targeted prevention.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Meeting Efficiency Tour - Admin Portal (5 steps)
// ============================================
export const meetingEfficiencyTour: TourConfig = {
  id: 'meeting-efficiency',
  title: 'Meeting Efficiency Tour',
  description: 'Run meetings that end on time and produce results',
  steps: [
    {
      popover: {
        title: 'Meetings That Actually End on Time',
        description: 'This tool turns your meeting into a structured, timed session with real action items. This tour shows you all of it.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'form',
      popover: {
        title: 'Build the Agenda',
        description: 'Add agenda items with time allocations. The calculator at the bottom warns you if your total exceeds the meeting length before you even start.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Live Timer During the Meeting',
        description: 'During the meeting, each agenda item has a countdown timer. It turns yellow at 80% and red when time is up. The group sees it, so everyone moves.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Capture Decisions and Action Items',
        description: 'As decisions get made and action items are assigned, record them in real time. Each action item gets an owner and a due date.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Meeting Effectiveness Score',
        description: 'After the meeting, the system calculates an effectiveness score based on whether action items from previous meetings got done. It&apos;s honest feedback on whether your meetings are working.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Inventory Tour - Admin Portal (4 steps)
// ============================================
export const inventoryTour: TourConfig = {
  id: 'inventory',
  title: 'Inventory Tour',
  description: 'Track supplies and reorder before you run out',
  steps: [
    {
      popover: {
        title: 'Never Run Out of Supplies Again',
        description: 'Track stock levels, reorder automatically, and see what you&apos;re spending. This tour covers the full inventory system.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Color-Coded Stock Levels',
        description: 'Every item shows its current quantity with a color indicator: green (well stocked), yellow (running low), red (below threshold, order now).',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'button',
      popover: {
        title: 'Reorder Generator',
        description: 'Click Generate Reorder List to get a ready-made list of everything below its reorder threshold. Export it with one click to send to your supplier.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: 'h1',
      popover: {
        title: 'Supply Spend by Category',
        description: 'The spend chart shows monthly supply costs broken down by category: art supplies, cleaning products, food, office supplies. Useful for budget reviews.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

// ============================================
// Staff Development Tour - Admin Portal (4 steps)
// ============================================
export const staffDevelopmentTour: TourConfig = {
  id: 'staff-development',
  title: 'Staff Development Tour',
  description: 'Track certifications and training hours for your whole team',
  steps: [
    {
      popover: {
        title: 'Certifications Expire. Training Hours Are Required.',
        description: 'This tab tracks it all so nothing falls through the cracks. This tour shows you the three main sections.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: 'table',
      popover: {
        title: 'Certification Grid',
        description: 'Every employee across every required certification: CPR, First Aid, Food Handler, and State License. Status is color-coded. Expiration dates are sortable.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '.space-y-4',
      popover: {
        title: 'Training Hours Log',
        description: 'Track hours per employee against the annual state requirement. The progress bar fills as hours are logged. Anyone below pace is flagged.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Development Plans',
        description: 'Professional goals set during performance reviews live here. Staff can update their progress. You can track goal completion across your whole team from this one tab.',
        side: 'top',
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
  'meal-count': mealCountTour,
  'photo-upload': photoUploadTour,
  'nap-tasks': napTasksTour,
  'supply-request': supplyRequestTour,
  'my-development': myDevelopmentTour,
  'my-schedule': myScheduleTour,
  'parent-photos': parentPhotosTour,
  'parent-newsletter': parentNewsletterTour,
  'notification-prefs': notificationPrefsTour,
  'food-counts-compliance': foodCountsComplianceTour,
  'schedule-board': scheduleBoardTour,
  'photo-review': photoReviewTour,
  'newsletter-builder': newsletterBuilderTour,
  'task-kanban': taskKanbanTour,
  'cross-site-ops': crossSiteOpsTour,
  'knowledge-base': knowledgeBaseTour,
  'onboarding': onboardingTour,
  'enrollment-funnel': enrollmentFunnelTour,
  'tour-manager': tourManagerTour,
  'revenue-forecast': revenueForecastTour,
  'incident-log': incidentLogTour,
  'meeting-efficiency': meetingEfficiencyTour,
  'inventory': inventoryTour,
  'staff-development': staffDevelopmentTour,
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
