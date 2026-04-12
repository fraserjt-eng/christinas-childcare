import { ModuleContent } from '@/types/training';

export const M17Content: ModuleContent = {
  moduleId: 'M17',
  activities: [
    {
      id: 'M17-A1',
      type: 'spotlight',
      title: 'Expired Certification Means Out of Ratio',
      spotlight: {
        concept: 'An employee with an expired certification cannot legally work in ratio',
        detail: 'Every staff member has required certifications: CPR, First Aid, background check, and annual training hours. The platform tracks expiry dates and sends automated reminders at 90, 60, and 30 days before expiration. After expiration, the employee\'s name appears in red on the scheduling tool, flagging that they cannot be counted toward ratio.',
        whyItMatters: 'An expired CPR certification discovered during a licensing inspection is an immediate finding. If that employee was the only teacher in the room, the center was out of ratio for every minute they worked. Renewal classes fill up fast, so scheduling at the 90-day alert prevents a crisis at day zero.',
      },
    },
    {
      id: 'M17-A2',
      type: 'walkthrough',
      title: 'Check Your Certifications',
      steps: [
        {
          instruction: 'Go to /employee/training or /employee/profile. Find the "Certifications" section. You see a list of your certifications with status (Current, Expiring Soon, Expired), expiry date, and days remaining.',
          tryItLink: '/employee/training',
        },
        {
          instruction: 'Check the color coding: green means 90+ days remaining, yellow means 30-89 days, red means under 30 days or expired.',
        },
        {
          instruction: 'If any certification shows yellow or red, schedule renewal now. Do not wait.',
        },
      ],
    },
    {
      id: 'M17-A3',
      type: 'walkthrough',
      title: 'Upload a Renewed Certification',
      steps: [
        {
          instruction: 'After completing a renewal class, go to /employee/training and tap the certification you renewed.',
          tryItLink: '/employee/development',
        },
        {
          instruction: 'Tap "Upload New Certificate." Take a photo of the certificate or select the file from your phone.',
        },
        {
          instruction: 'Enter the new expiry date and tap "Submit." The director will verify and approve the update. Your status changes from red or yellow to green.',
        },
      ],
    },
    {
      id: 'M17-A4',
      type: 'walkthrough',
      title: 'Monitor Staff Certifications (Directors)',
      steps: [
        {
          instruction: 'Go to /admin/staff/development. The certification dashboard shows all employees with their certification status: green (all current), yellow (expiring soon), or red (expired or missing).',
          tryItLink: '/admin/staff/development',
        },
        {
          instruction: 'Check the "Expiring Soon" panel for certifications coming due in the next 90 days. Check the "Expired" panel for certifications that have lapsed.',
        },
        {
          instruction: 'Use this view to plan training days, budget for renewal costs, and ensure you do not schedule an employee whose certification has lapsed into a ratio-counted position.',
        },
      ],
    },
    {
      id: 'M17-A5',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'Your CPR certification expires in 45 days. You check online and the next available renewal class is in 3 weeks, but it is on a Saturday. What do you do?',
        options: [
          {
            text: 'Wait for a weekday class to become available closer to the expiry date',
            isCorrect: false,
            feedback: 'Waiting is risky. Renewal classes fill up, and if the weekday class fills, you could expire with no backup plan. At 45 days, you have time but not unlimited time.',
          },
          {
            text: 'Sign up for the Saturday class immediately',
            isCorrect: true,
            feedback: 'Correct. Take the first available class. A Saturday inconvenience is far better than an expired certification that removes you from ratio and creates a staffing crisis.',
          },
          {
            text: 'Ask the director to extend the deadline since it is only 45 days away',
            isCorrect: false,
            feedback: 'The director cannot extend a state-mandated certification deadline. Expiry dates are set by the certifying organization, not the center.',
          },
          {
            text: 'Let the certification expire and renew it when a convenient class opens up',
            isCorrect: false,
            feedback: 'An expired certification means you cannot legally supervise children alone. The center loses a ratio-eligible staff member, and you may not be scheduled until you renew.',
          },
        ],
      },
    },
    {
      id: 'M17-A6',
      type: 'explore',
      title: 'Training and Certification Pages',
      pages: [
        { path: '/employee/training', name: 'My Training', description: 'Your certifications, training modules, and compliance status' },
        { path: '/employee/development', name: 'Professional Development', description: 'Growth tracking, completed modules, and development goals' },
        { path: '/admin/staff/development', name: 'Staff Development Dashboard', description: 'Director view of all employee certifications with expiry tracking' },
      ],
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Your CPR certification expires in 45 days. When should you schedule the renewal class? (Answer: now. Renewal classes fill up.)',
    'A staff member\'s background check expired last week. Can they still work? (Answer: they should not be counted in ratio and may not be allowed in unsupervised contact with children until renewed.)',
    'Who is responsible for tracking certifications: the employee or the director? (Answer: both. The employee renews. The director monitors and does not schedule someone whose certification has lapsed.)',
  ],
  commonMistakes: [
    {
      mistake: 'Ignoring the 90-day alert',
      prevention: 'Schedule renewal at the first alert',
    },
    {
      mistake: 'Not uploading the renewed cert',
      prevention: 'Upload the new certificate the same day you receive it',
    },
    {
      mistake: 'Scheduling an employee with an expired cert',
      prevention: 'Check /admin/staff/development before publishing the weekly schedule',
    },
    {
      mistake: 'Not budgeting for renewal costs',
      prevention: 'Budget certification costs annually; the dashboard shows upcoming renewals',
    },
    {
      mistake: 'Relying on employees to self-report',
      prevention: 'The system tracks it. Trust the system, not memory.',
    },
  ],
};
