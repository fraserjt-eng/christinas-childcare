import { type DriveStep } from 'driver.js';

export interface TourConfig {
  id: string;
  title: string;
  description: string;
  steps: DriveStep[];
}

// Lesson Builder Tour - Comprehensive
export const lessonBuilderTour: TourConfig = {
  id: 'lesson-builder',
  title: 'Lesson Builder Tour',
  description: 'Learn how to create AI-powered lesson plans',
  steps: [
    {
      popover: {
        title: 'Welcome to Lesson Builder! 🎓',
        description: 'This tool helps you create engaging, age-appropriate lesson plans using AI. Let\'s walk through how it works.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="lesson-form"]',
      popover: {
        title: 'The Lesson Builder',
        description: 'This is your main workspace for creating lessons. You\'ll fill in a few details, and AI will generate a complete lesson plan.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="new"]',
      popover: {
        title: 'New Lesson Tab',
        description: 'Start here to create a new lesson from scratch. The AI will help you generate objectives, activities, and materials.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="library"]',
      popover: {
        title: 'Your Library',
        description: 'All your saved lessons appear here. You can search, filter by age or domain, and mark favorites for quick access.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="remix"]',
      popover: {
        title: 'Remix Lessons',
        description: 'Take any existing lesson and adapt it for a different age group or focus. Great for reusing successful lessons across classrooms.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="analytics"]',
      popover: {
        title: 'Analytics',
        description: 'See statistics about your lessons: how many you\'ve created, which domains you focus on, and trends over time.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Creating Your First Lesson',
        description: 'Let\'s walk through creating a lesson. You\'ll select an age group, enter a topic, choose a learning domain, and set the duration.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="age-group"]',
      popover: {
        title: '1. Select Age Group',
        description: 'Choose who the lesson is for: Infant, Toddler, Preschool, or School Age. The AI adapts vocabulary, complexity, and activities based on this.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="topic-input"]',
      popover: {
        title: '2. Enter Your Topic',
        description: 'Type what you want to teach about. Be specific ("Butterflies") or broad ("Nature"). Examples: Colors, Counting, Community Helpers, Weather.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="domain-select"]',
      popover: {
        title: '3. Choose Learning Domain',
        description: 'Select the primary focus: Cognitive Development, Language & Literacy, Physical Development, Social-Emotional, or Creative Arts.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="duration-select"]',
      popover: {
        title: '4. Set Duration',
        description: 'How long should the lesson run? 15, 30, 45, or 60 minutes. Shorter durations work better for younger children.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="context-input"]',
      popover: {
        title: '5. Additional Context (Optional)',
        description: 'Add any special instructions: "Include outdoor activities", "We have a child with nut allergies", "Tie into our field trip". This helps customize the lesson.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generate-btn"]',
      popover: {
        title: '6. Generate with AI',
        description: 'Click this button and the AI will create your complete lesson plan in about 10-30 seconds. You can regenerate if you want a different approach.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lesson-preview"]',
      popover: {
        title: 'Review Your Lesson',
        description: 'The generated lesson appears here with objectives, materials, step-by-step activities, and assessment ideas. You can edit any part before saving.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="save-btn"]',
      popover: {
        title: 'Save to Library',
        description: 'Happy with your lesson? Save it to access anytime. You can also download as PDF, share with colleagues, or remix later.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'You\'re Ready! 🎉',
        description: 'That\'s the Lesson Builder! Try creating a lesson now, or explore the Library to see example lessons. Visit /training for more detailed guides.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// Curriculum Library Tour - Comprehensive
export const curriculumLibraryTour: TourConfig = {
  id: 'curriculum-library',
  title: 'Curriculum Library Tour',
  description: 'Navigate and manage your lesson collection',
  steps: [
    {
      popover: {
        title: 'Welcome to the Curriculum System! 📚',
        description: 'This page helps you manage curriculum by classroom, track developmental milestones, and keep assessments organized.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[value="Infant"]',
      popover: {
        title: 'Room Tabs',
        description: 'Switch between rooms to see curriculum for each age group. Each room has its own milestones, activities, lessons, and assessments.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="standards"]',
      popover: {
        title: 'Developmental Standards',
        description: 'See developmental milestones for the room. Track which skills are mastered, developing, or emerging. Great for parent conversations.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="activities"]',
      popover: {
        title: 'Weekly Activities',
        description: 'View the weekly activity schedule. See what\'s planned for each day, including domain focus and duration.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="lessons"]',
      popover: {
        title: 'Lesson Plans',
        description: 'Access detailed lesson plans with objectives, materials, and step-by-step instructions. These can be printed for teachers.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="assessments"]',
      popover: {
        title: 'Assessments',
        description: 'Track individual child assessments with rubric-based scoring. Document progress over time for each developmental area.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="feedback"]',
      popover: {
        title: 'Teacher Observations',
        description: 'Read and add observation notes about children. These anecdotal records capture important moments and developmental progress.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[value="reports"]',
      popover: {
        title: 'Family Reports',
        description: 'Generate progress reports to share with families. These summarize assessments and observations in a parent-friendly format.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Explore Each Room',
        description: 'Try clicking through different rooms and tabs to see the curriculum for each age group. Visit /training for detailed guides on using each feature.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// Staff Management Tour
export const staffManagementTour: TourConfig = {
  id: 'staff-management',
  title: 'Staff Management Tour',
  description: 'Manage your team and their information',
  steps: [
    {
      popover: {
        title: 'Staff Management 👥',
        description: 'This is where you manage team profiles, track certifications, and assign staff to classrooms.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="staff-list"]',
      popover: {
        title: 'Staff Directory',
        description: 'See all team members at a glance. The colored indicators show certification status: green is current, yellow expires soon, red is expired.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="add-staff"]',
      popover: {
        title: 'Add Staff Member',
        description: 'Click here to add a new team member. You\'ll enter their contact info, role, classroom assignment, and upload certifications.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="staff-card"]',
      popover: {
        title: 'Staff Profile Cards',
        description: 'Click any staff member to view their full profile, including certifications, assigned classrooms, and schedule.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="certifications"]',
      popover: {
        title: 'Certification Tracking',
        description: 'The system tracks expiration dates for CPR, First Aid, background checks, and training. You\'ll get alerts before anything expires.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="classroom-assignment"]',
      popover: {
        title: 'Classroom Assignment',
        description: 'Assign staff to specific classrooms. This affects ratio calculations and determines which children they can manage.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Stay Compliant',
        description: 'Keep certifications current and assignments accurate to maintain DCYF compliance. The system helps you track everything automatically.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// Attendance Tour
export const attendanceTour: TourConfig = {
  id: 'attendance',
  title: 'Attendance Tour',
  description: 'Track daily attendance and ratios',
  steps: [
    {
      popover: {
        title: 'Attendance Tracking 📋',
        description: 'Track daily check-ins and check-outs, monitor staff-to-child ratios in real-time, and generate attendance reports.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="date-picker"]',
      popover: {
        title: 'Date Selection',
        description: 'Today is selected by default. Use the date picker to view or edit attendance for any date - great for corrections or historical records.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="classroom-tabs"]',
      popover: {
        title: 'Classroom View',
        description: 'Switch between classrooms to manage attendance for each room. Each tab shows only children enrolled in that classroom.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="child-list"]',
      popover: {
        title: 'Child List',
        description: 'See all enrolled children with their current status: checked in, checked out, or not yet arrived.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="check-in"]',
      popover: {
        title: 'Check In / Check Out',
        description: 'Click to check a child in when they arrive or out when they\'re picked up. The exact time is recorded automatically.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="ratio-display"]',
      popover: {
        title: 'Ratio Monitor',
        description: 'Real-time staff-to-child ratios. Green means compliant, yellow is approaching limit, red means over ratio - take action immediately.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="attendance-reports"]',
      popover: {
        title: 'Reports',
        description: 'Generate attendance reports for billing, parent records, or DCYF compliance. Export as PDF or Excel.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Maintain Compliance',
        description: 'Accurate attendance records are essential for licensing. The system makes it easy to track and document everything.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
};

// Reports Tour
export const reportsTour: TourConfig = {
  id: 'reports',
  title: 'Reports Tour',
  description: 'Generate insights and compliance reports',
  steps: [
    {
      popover: {
        title: 'Reports & Analytics 📊',
        description: 'Generate the reports you need for billing, parent communication, and DCYF compliance visits.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="report-categories"]',
      popover: {
        title: 'Report Categories',
        description: 'Reports are organized by type: Attendance, Enrollment, Financial, Staff, and Compliance. Each has pre-built reports for common needs.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="report-types"]',
      popover: {
        title: 'Available Reports',
        description: 'Select the specific report you need. Options vary by category - attendance summaries, payment records, certification status, and more.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="date-range"]',
      popover: {
        title: 'Date Range',
        description: 'Choose the time period: today, this week, this month, or a custom range. Most reports let you pick any dates.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="filters"]',
      popover: {
        title: 'Filters',
        description: 'Narrow your report by classroom, age group, or staff member. Get exactly the data you need.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generate-report"]',
      popover: {
        title: 'Generate',
        description: 'Click to create your report. Most appear instantly. The report displays on screen where you can review and sort.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="export-options"]',
      popover: {
        title: 'Export Options',
        description: 'Download as PDF for printing, Excel for analysis, or CSV for importing elsewhere. PDFs include your center\'s branding.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="schedule-report"]',
      popover: {
        title: 'Schedule Reports',
        description: 'Set up automatic reports that generate and email on a schedule - daily, weekly, or monthly.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Ready for Any Request',
        description: 'Whether it\'s a DCYF visit, parent meeting, or billing reconciliation, you can generate professional reports in seconds.',
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
