import { ModuleContent } from '@/types/training';

export const M02Content: ModuleContent = {
  moduleId: 'M02',
  activities: [
    {
      id: 'M02-A1',
      type: 'spotlight',
      title: 'The Two-Click Rule',
      spotlight: {
        concept: 'Every important page is reachable in two taps or fewer',
        detail: 'The platform uses a bottom tab bar on mobile and a sidebar on desktop. Dashboard alerts are color-coded by urgency. Three portals serve three audiences: parents see /dashboard, staff see /employee, directors and the owner see /admin. Each portal organizes its navigation around the tasks that role performs daily.',
        whyItMatters: 'When staff spend time hunting for pages, children go unsupervised. A teacher who cannot find the meal count page in 10 seconds will skip the submission. That missed count costs $60-120 in lost CACFP reimbursement per day.',
      },
    },
    {
      id: 'M02-A2',
      type: 'walkthrough',
      title: 'Navigate the Admin Portal',
      steps: [
        {
          instruction: 'Open the admin portal by going to /admin. You should see the cross-center overview with key metrics at the top.',
          tryItLink: '/admin',
        },
        {
          instruction: 'Find the bottom navigation bar (mobile) or sidebar (desktop). Identify the main sections: Attendance, Food Counts, Ratios, Tasks, Incidents, Staff, Scheduling, Communications, Pipeline, Financial, Compliance, Reports, Settings.',
        },
        {
          instruction: 'Tap "Attendance" to navigate to /admin/attendance. Notice that you reached an operational page in one tap from the admin home.',
          tryItLink: '/admin/attendance',
        },
        {
          instruction: 'Now go back to /admin and look at the alert banners at the top. Read the colored banners before doing anything else. Red means immediate action. Yellow means watch closely. Green means normal.',
          tryItLink: '/admin',
        },
      ],
    },
    {
      id: 'M02-A3',
      type: 'walkthrough',
      title: 'Navigate the Employee Portal',
      steps: [
        {
          instruction: 'Open the employee portal at /employee. Your dashboard shows today\'s schedule, assigned tasks, and alerts.',
          tryItLink: '/employee',
        },
        {
          instruction: 'Find the navigation tabs. Identify the key sections: Meal Count, Tasks, Schedule, Profile, Training, and Messages.',
        },
        {
          instruction: 'Tap "Tasks" to see your assigned to-do list. Then tap back to the dashboard. You should be able to get to any page and back in two taps.',
        },
      ],
    },
    {
      id: 'M02-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'You log in to the employee portal at 8:00 AM. There is a red alert banner at the top of your dashboard and 3 tasks listed below it. What do you do first?',
        options: [
          {
            text: 'Start working on the first task in the list',
            isCorrect: false,
            feedback: 'Tasks are important, but a red alert means something needs immediate attention. Always read alerts before starting tasks.',
          },
          {
            text: 'Read the red alert banner to understand what needs immediate attention',
            isCorrect: true,
            feedback: 'Correct. Red alerts indicate urgent items like ratio concerns, missed meal count deadlines, or incident follow-ups. Handle them before routine tasks.',
          },
          {
            text: 'Go to the meal count page since it is almost breakfast deadline',
            isCorrect: false,
            feedback: 'Meal counts matter, but the red alert could be about something more urgent. Read the alert first, then prioritize.',
          },
          {
            text: 'Close the banner and check it later',
            isCorrect: false,
            feedback: 'Dismissing alerts without reading them creates blind spots. The alert could be about a ratio violation or a safety issue.',
          },
        ],
      },
    },
    {
      id: 'M02-A5',
      type: 'explore',
      title: 'Find Your Way Around',
      pages: [
        { path: '/admin', name: 'Admin Home', description: 'Cross-center overview with key metrics and alert banners' },
        { path: '/employee', name: 'Employee Home', description: 'Your daily schedule, assigned tasks, and classroom alerts' },
        { path: '/dashboard', name: 'Parent Dashboard', description: 'Daily summary, photos, messages, and child profiles' },
      ],
    },
    {
      id: 'M02-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What are the three pages you expect to visit most often in your role? Find them now and count how many taps it takes to reach each one.',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What are the three pages you expect to visit most often in your role? Find them now.',
    'How would you get from the employee portal to your schedule in two taps?',
    '(For directors/owner) What is the fastest way to check current ratios right now?',
  ],
  commonMistakes: [
    {
      mistake: 'Ignoring dashboard alerts',
      prevention: 'Make checking the dashboard your first action every morning',
    },
    {
      mistake: 'Searching for pages manually',
      prevention: 'Learn the bottom nav tabs; everything branches from there',
    },
    {
      mistake: 'Not switching to admin when needed',
      prevention: 'Know when to switch portals based on the task',
    },
    {
      mistake: 'Scrolling past the alert banner',
      prevention: 'Read the colored banners before doing anything else',
    },
  ],
};
