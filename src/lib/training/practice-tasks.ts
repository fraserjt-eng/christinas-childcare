import { PracticeTask } from '@/types/training';

export const practiceTasks: PracticeTask[] = [
  // M01: Welcome and Login
  { id: 'M01-P01', moduleId: 'M01', text: 'Log in to the correct portal for your role' },
  { id: 'M01-P02', moduleId: 'M01', text: 'Bookmark your portal URL on your phone or tablet' },
  { id: 'M01-P03', moduleId: 'M01', text: 'Reset your PIN or password successfully' },

  // M02: Navigating Your Portal
  { id: 'M02-P01', moduleId: 'M02', text: 'Find 5 different pages from your dashboard in under 2 minutes' },
  { id: 'M02-P02', moduleId: 'M02', text: 'Use a quick-action button on the dashboard' },
  { id: 'M02-P03', moduleId: 'M02', text: 'Navigate using sidebar (desktop) or bottom tabs (mobile)' },

  // M03: Profile and Settings
  { id: 'M03-P01', moduleId: 'M03', text: 'Update your personal information (address, phone)' },
  { id: 'M03-P02', moduleId: 'M03', text: 'Add or update emergency contacts' },
  { id: 'M03-P03', moduleId: 'M03', text: 'Upload a profile photo' },
  { id: 'M03-P04', moduleId: 'M03', text: 'Set your notification preferences' },

  // M04: Kiosk Check-In/Check-Out
  { id: 'M04-P01', moduleId: 'M04', text: 'Enter your PIN on the kiosk' },
  { id: 'M04-P02', moduleId: 'M04', text: 'Check in at the kiosk with a supervisor watching' },
  { id: 'M04-P03', moduleId: 'M04', text: 'Check out at the kiosk before leaving' },

  // M05: Attendance Tracking
  { id: 'M05-P01', moduleId: 'M05', text: 'View real-time attendance by classroom' },
  { id: 'M05-P02', moduleId: 'M05', text: 'Identify absent children on the attendance dashboard' },
  { id: 'M05-P03', moduleId: 'M05', text: 'Check attendance at 9:30 AM after the arrival rush' },
  { id: 'M05-P04', moduleId: 'M05', text: 'Flag a discrepancy between physical headcount and digital count' },

  // M06: Meal Count Submission
  { id: 'M06-P01', moduleId: 'M06', text: 'Submit breakfast count before 9:30 AM deadline' },
  { id: 'M06-P02', moduleId: 'M06', text: 'Submit lunch count before 1:30 PM deadline' },
  { id: 'M06-P03', moduleId: 'M06', text: 'Use the pre-fill feature and adjust for absent children' },
  { id: 'M06-P04', moduleId: 'M06', text: 'Submit all 4 meal types on time for 3 consecutive days' },

  // M07: Daily Photo Upload
  { id: 'M07-P01', moduleId: 'M07', text: 'Upload 3 photos with activity tags' },
  { id: 'M07-P02', moduleId: 'M07', text: 'Write descriptive captions for uploaded photos' },
  { id: 'M07-P03', moduleId: 'M07', text: 'Submit photos through the approval workflow' },

  // M08: Task Management
  { id: 'M08-P01', moduleId: 'M08', text: 'Check the task board at start of shift' },
  { id: 'M08-P02', moduleId: 'M08', text: 'Complete an assigned task and mark it done with timestamp' },
  { id: 'M08-P03', moduleId: 'M08', text: 'Use the nap-time optimizer to sequence tasks' },
  { id: 'M08-P04', moduleId: 'M08', text: 'Create and delegate a task to another staff member (directors only)' },

  // M09: Daily Reports
  { id: 'M09-P01', moduleId: 'M09', text: 'View a child\'s daily summary (meals, naps, activities)' },
  { id: 'M09-P02', moduleId: 'M09', text: 'Filter reports by classroom and date' },
  { id: 'M09-P03', moduleId: 'M09', text: 'Review daily reports at 4 PM before parent pickup' },

  // M10: Parent-Staff Messaging
  { id: 'M10-P01', moduleId: 'M10', text: 'Send a practice message through the platform' },
  { id: 'M10-P02', moduleId: 'M10', text: 'View conversation history' },
  { id: 'M10-P03', moduleId: 'M10', text: 'Check messages at start and end of day' },

  // M11: Newsletters
  { id: 'M11-P01', moduleId: 'M11', text: 'Create a newsletter with 3+ sections' },
  { id: 'M11-P02', moduleId: 'M11', text: 'Schedule a newsletter send time' },
  { id: 'M11-P03', moduleId: 'M11', text: 'Check read receipts after sending' },

  // M12: Parent Portal Mastery
  { id: 'M12-P01', moduleId: 'M12', text: 'View your child\'s daily photos and progress reports' },
  { id: 'M12-P02', moduleId: 'M12', text: 'Check the center calendar for upcoming events' },
  { id: 'M12-P03', moduleId: 'M12', text: 'Update family information and emergency contacts' },
  { id: 'M12-P04', moduleId: 'M12', text: 'Ensure all children are added with allergies documented' },

  // M13: Notification Management
  { id: 'M13-P01', moduleId: 'M13', text: 'Configure your notification preferences' },
  { id: 'M13-P02', moduleId: 'M13', text: 'Verify critical notifications (incidents, schedule changes) are enabled' },

  // M14: CACFP Compliance Deep Dive
  { id: 'M14-P01', moduleId: 'M14', text: 'Check the compliance dashboard and interpret green/yellow/red statuses' },
  { id: 'M14-P02', moduleId: 'M14', text: 'Achieve 90%+ audit readiness score' },
  { id: 'M14-P03', moduleId: 'M14', text: 'Generate a compliance report for auditors' },
  { id: 'M14-P04', moduleId: 'M14', text: 'Address a yellow or red compliance item same day' },

  // M15: Ratio Monitoring
  { id: 'M15-P01', moduleId: 'M15', text: 'Read the ratio dashboard and check each classroom\'s compliance' },
  { id: 'M15-P02', moduleId: 'M15', text: 'Respond to a simulated ratio violation within 15 minutes' },
  { id: 'M15-P03', moduleId: 'M15', text: 'Check ratios at arrival, nap, and departure transitions' },

  // M16: Incident Reporting
  { id: 'M16-P01', moduleId: 'M16', text: 'File a complete practice incident report with all required fields' },
  { id: 'M16-P02', moduleId: 'M16', text: 'Select the correct severity level for a scenario' },
  { id: 'M16-P03', moduleId: 'M16', text: 'Send a parent notification through the incident system' },

  // M17: Certifications Tracking
  { id: 'M17-P01', moduleId: 'M17', text: 'Verify all your certifications are entered in the system' },
  { id: 'M17-P02', moduleId: 'M17', text: 'Check expiration dates and respond to any alerts' },
  { id: 'M17-P03', moduleId: 'M17', text: 'Log a training hour in the system' },

  // M18: Staff Scheduling
  { id: 'M18-P01', moduleId: 'M18', text: 'Build a one-week schedule using drag-and-drop' },
  { id: 'M18-P02', moduleId: 'M18', text: 'Verify ratio compliance for every time block' },
  { id: 'M18-P03', moduleId: 'M18', text: 'Check labor cost projection and adjust to stay under budget' },
  { id: 'M18-P04', moduleId: 'M18', text: 'Publish the schedule to staff' },

  // M19: HR and Documents
  { id: 'M19-P01', moduleId: 'M19', text: 'Create an HR document from a template' },
  { id: 'M19-P02', moduleId: 'M19', text: 'Track a document through the workflow (draft to completed)' },

  // M20: Payroll Management
  { id: 'M20-P01', moduleId: 'M20', text: 'Review time entries from the kiosk' },
  { id: 'M20-P02', moduleId: 'M20', text: 'Generate a pay stub with correct calculations' },
  { id: 'M20-P03', moduleId: 'M20', text: 'Identify and flag overtime before the pay period closes' },

  // M21: Staff Onboarding
  { id: 'M21-P01', moduleId: 'M21', text: 'Create a digital onboarding pathway for a new hire' },
  { id: 'M21-P02', moduleId: 'M21', text: 'Assign checklist tasks with due dates' },
  { id: 'M21-P03', moduleId: 'M21', text: 'Track new hire progress from the admin view' },

  // M22: Enrollment Pipeline
  { id: 'M22-P01', moduleId: 'M22', text: 'Move a mock prospect through the enrollment funnel' },
  { id: 'M22-P02', moduleId: 'M22', text: 'Identify stalled leads (no movement in 5+ days)' },
  { id: 'M22-P03', moduleId: 'M22', text: 'Set follow-up reminders for active inquiries' },

  // M23: Tour Management
  { id: 'M23-P01', moduleId: 'M23', text: 'Schedule a tour using the calendar system' },
  { id: 'M23-P02', moduleId: 'M23', text: 'Use the digital tour checklist during a mock visit' },
  { id: 'M23-P03', moduleId: 'M23', text: 'Send a follow-up template within 2 hours of tour' },

  // M24: Authorization Tracking
  { id: 'M24-P01', moduleId: 'M24', text: 'Check authorization status for all enrolled children' },
  { id: 'M24-P02', moduleId: 'M24', text: 'Identify all authorizations expiring within 60 days' },
  { id: 'M24-P03', moduleId: 'M24', text: 'Start the renewal process at the 60-day alert' },

  // M25: Website and Marketing
  { id: 'M25-P01', moduleId: 'M25', text: 'Review public website pages for accuracy' },
  { id: 'M25-P02', moduleId: 'M25', text: 'Check enrollment form submissions' },

  // M26: Budget Planning
  { id: 'M26-P01', moduleId: 'M26', text: 'Set an annual budget by category' },
  { id: 'M26-P02', moduleId: 'M26', text: 'Review budget vs. actual and identify variances over 10%' },
  { id: 'M26-P03', moduleId: 'M26', text: 'Export budget data for your accountant' },

  // M27: Revenue Forecasting
  { id: 'M27-P01', moduleId: 'M27', text: 'Run a revenue forecast based on current enrollment' },
  { id: 'M27-P02', moduleId: 'M27', text: 'Run a what-if scenario (e.g., 3 children leave next month)' },

  // M28: Cost Optimization
  { id: 'M28-P01', moduleId: 'M28', text: 'Review the expense breakdown by category' },
  { id: 'M28-P02', moduleId: 'M28', text: 'Identify 3 cost optimization opportunities' },
  { id: 'M28-P03', moduleId: 'M28', text: 'Check labor cost as percentage of revenue' },

  // M29: Cross-Site Operations
  { id: 'M29-P01', moduleId: 'M29', text: 'Monitor both centers from the cross-site dashboard' },
  { id: 'M29-P02', moduleId: 'M29', text: 'Compare performance metrics between sites' },
  { id: 'M29-P03', moduleId: 'M29', text: 'Identify one trend that differs between centers' },

  // M30: Strategic Planning
  { id: 'M30-P01', moduleId: 'M30', text: 'Complete a SWOT analysis using platform data' },
  { id: 'M30-P02', moduleId: 'M30', text: 'Set 3 strategic priorities with timelines' },
  { id: 'M30-P03', moduleId: 'M30', text: 'Create action items that feed the task board' },
  { id: 'M30-P04', moduleId: 'M30', text: 'Use the meeting efficiency tool for a leadership meeting' },
];

export function getPracticeTasksForModule(moduleId: string): PracticeTask[] {
  return practiceTasks.filter(t => t.moduleId === moduleId);
}
