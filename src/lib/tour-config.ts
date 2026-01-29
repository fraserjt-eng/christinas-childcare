import { type DriveStep } from 'driver.js';

export interface TourConfig {
  id: string;
  title: string;
  description: string;
  steps: DriveStep[];
}

// Lesson Builder Tour
export const lessonBuilderTour: TourConfig = {
  id: 'lesson-builder',
  title: 'Lesson Builder Tour',
  description: 'Learn how to create AI-powered lesson plans',
  steps: [
    {
      element: '[data-tour="lesson-form"]',
      popover: {
        title: 'Lesson Builder',
        description: 'This is where you create new lessons. Fill in the details and let AI help you generate engaging activities.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="age-group"]',
      popover: {
        title: 'Select Age Group',
        description: 'Choose the age group for your lesson. This helps the AI tailor activities appropriately.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="topic-input"]',
      popover: {
        title: 'Enter Your Topic',
        description: 'Type the theme or topic for your lesson (e.g., "Weather", "Animals", "Colors").',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generate-btn"]',
      popover: {
        title: 'Generate Lesson',
        description: 'Click here to have AI create a complete lesson plan with activities, materials, and learning objectives.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lesson-preview"]',
      popover: {
        title: 'Preview Your Lesson',
        description: 'Review the generated lesson here. You can edit any section before saving.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="save-btn"]',
      popover: {
        title: 'Save to Library',
        description: 'Save your lesson to access it anytime from your curriculum library.',
        side: 'left',
        align: 'start',
      },
    },
  ],
};

// Curriculum Library Tour
export const curriculumLibraryTour: TourConfig = {
  id: 'curriculum-library',
  title: 'Curriculum Library Tour',
  description: 'Navigate and manage your lesson collection',
  steps: [
    {
      element: '[data-tour="search-bar"]',
      popover: {
        title: 'Search Lessons',
        description: 'Quickly find lessons by keyword, topic, or activity type.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="filters"]',
      popover: {
        title: 'Filter Options',
        description: 'Narrow results by age group, topic category, or date created.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lesson-card"]',
      popover: {
        title: 'Lesson Cards',
        description: 'Each card shows a lesson preview. Click to view details or use the menu for quick actions.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="remix-btn"]',
      popover: {
        title: 'Remix Lesson',
        description: 'Create a copy of any lesson and customize it for your needs.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="collections"]',
      popover: {
        title: 'Collections',
        description: 'Organize lessons into collections for easy access (e.g., "Fall Themes", "STEM Activities").',
        side: 'bottom',
        align: 'start',
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
      element: '[data-tour="staff-list"]',
      popover: {
        title: 'Staff Directory',
        description: 'View all team members with their roles and current status.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="add-staff"]',
      popover: {
        title: 'Add Staff Member',
        description: 'Click here to add a new team member. You\'ll enter their contact info, role, and certifications.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="staff-card"]',
      popover: {
        title: 'Staff Profile Card',
        description: 'Click any staff member to view their full profile, including certifications and schedule.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="certifications"]',
      popover: {
        title: 'Certification Tracking',
        description: 'Monitor expiring certifications and set reminders for renewals.',
        side: 'bottom',
        align: 'start',
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
      element: '[data-tour="date-picker"]',
      popover: {
        title: 'Select Date',
        description: 'Choose the date to view or edit attendance records.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="classroom-tabs"]',
      popover: {
        title: 'Classroom Selection',
        description: 'Switch between classrooms to manage attendance for each group.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="check-in"]',
      popover: {
        title: 'Check In/Out',
        description: 'Click to mark a child as checked in or out. Times are recorded automatically.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="ratio-display"]',
      popover: {
        title: 'Ratio Monitor',
        description: 'See real-time staff-to-child ratios. The system alerts you if ratios exceed limits.',
        side: 'left',
        align: 'start',
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
      element: '[data-tour="report-types"]',
      popover: {
        title: 'Report Types',
        description: 'Choose from attendance, enrollment, financial, or compliance reports.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="date-range"]',
      popover: {
        title: 'Date Range',
        description: 'Select the time period for your report.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generate-report"]',
      popover: {
        title: 'Generate Report',
        description: 'Click to generate your report. Most reports are ready in seconds.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="export-options"]',
      popover: {
        title: 'Export Options',
        description: 'Download reports as PDF or Excel, or share directly via email.',
        side: 'left',
        align: 'start',
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
