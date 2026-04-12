import { ModuleContent } from '@/types/training';

export const M13Content: ModuleContent = {
  moduleId: 'M13',
  activities: [
    {
      id: 'M13-A1',
      type: 'spotlight',
      title: 'Critical Alerts Cannot Be Turned Off',
      spotlight: {
        concept: 'Some notifications are mandatory (incidents, emergencies, schedule changes). Others are configurable.',
        detail: 'The notification system balances keeping people informed with preventing alert fatigue. Incident reports, emergency closures, and schedule changes always push through. Photo updates, daily reports, and newsletters can be configured by the user. Each notification type supports push, email, or both as delivery methods.',
        whyItMatters: 'A parent who turns off all notifications will miss an incident report about their child. An employee who disables task notifications will miss urgent assignments. The mandatory/configurable split ensures safety-critical information always reaches the right people.',
      },
    },
    {
      id: 'M13-A2',
      type: 'walkthrough',
      title: 'Configure Your Notification Preferences',
      steps: [
        {
          instruction: 'Go to /dashboard/notifications (parents) or your profile notification settings (employees). At the top, you see your unread notifications.',
          tryItLink: '/dashboard/notifications',
        },
        {
          instruction: 'Tap "Preferences" to manage your notification settings. You will see a list of notification types, each with a toggle and delivery method selector.',
        },
        {
          instruction: 'For each configurable notification (photos, newsletters, daily reports, calendar events), choose your delivery method: push, email, or both. For critical items, "both" is recommended.',
        },
        {
          instruction: 'Notice the mandatory notifications that cannot be turned off: Incident Reports, Emergency Closures, and Schedule Changes. These always come through regardless of your preferences.',
        },
      ],
    },
    {
      id: 'M13-A3',
      type: 'walkthrough',
      title: 'Review Notification Settings (Directors)',
      steps: [
        {
          instruction: 'Go to /admin/notifications. The director view shows notification delivery status across all users.',
          tryItLink: '/admin/notifications',
        },
        {
          instruction: 'Check which parents have push notifications enabled. If many parents have notifications disabled, they may be missing important updates.',
        },
        {
          instruction: 'Review employee notification settings to ensure all staff have task assignments, schedule changes, and incident alerts enabled.',
        },
      ],
    },
    {
      id: 'M13-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'You are an employee who turned off task assignment notifications because you felt you were getting too many alerts. The director assigns you an urgent task at 10 AM. You do not see it until your lunch break at noon. The task was due at 11 AM. What went wrong?',
        options: [
          {
            text: 'The director should have told you in person',
            isCorrect: false,
            feedback: 'The task system is the official way work gets assigned. Directors should not need to track down every employee in person. That defeats the purpose of the system.',
          },
          {
            text: 'You should not have turned off task notifications. Turn them back on and check your task board at shift start.',
            isCorrect: true,
            feedback: 'Correct. Task notifications are not noise. They are how work reaches you. Keep them on and build a habit of checking your task board within 5 minutes of clocking in.',
          },
          {
            text: 'The system should make task notifications mandatory',
            isCorrect: false,
            feedback: 'Task notifications are configurable because frequency varies by role. But turning them off entirely means you miss assignments. The solution is to keep them on and manage the volume.',
          },
          {
            text: 'Two hours is not that long. The task can wait.',
            isCorrect: false,
            feedback: 'A task marked as urgent with an 11 AM deadline was time-sensitive. Missing it by an hour could affect children, compliance, or operations.',
          },
        ],
      },
    },
    {
      id: 'M13-A5',
      type: 'explore',
      title: 'Notification Pages',
      pages: [
        { path: '/dashboard/notifications', name: 'Parent Notifications', description: 'All parent alerts in one place with preference configuration' },
        { path: '/admin/notifications', name: 'Admin Notifications', description: 'Director view of notification delivery status across all users' },
      ],
    },
    {
      id: 'M13-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What is the minimum set of notifications every parent should keep on? What about every employee? Why?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'You are a parent who turned off photo notifications because you "get too many." What might you miss?',
    'You are an employee who turned off task assignment notifications. What happens when a director assigns you an urgent task?',
    'What is the minimum set of notifications every parent should keep on? (Answer: messages, incident reports, emergency closures, and schedule changes)',
  ],
  commonMistakes: [
    {
      mistake: 'Turning off all notifications',
      prevention: 'Keep mandatory notifications on; adjust the optional ones',
    },
    {
      mistake: 'Not enabling push notifications in your browser',
      prevention: 'When prompted to "Allow Notifications," say yes',
    },
    {
      mistake: 'Ignoring the weekly digest',
      prevention: 'Pick one day per week to read the digest (Sunday evening works well)',
    },
    {
      mistake: 'Having email notifications go to spam',
      prevention: 'Add the center\'s email to your contacts or whitelist it',
    },
  ],
};
