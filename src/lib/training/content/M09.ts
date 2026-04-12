import { ModuleContent } from '@/types/training';

export const M09Content: ModuleContent = {
  moduleId: 'M09',
  activities: [
    {
      id: 'M09-A1',
      type: 'spotlight',
      title: 'Daily Reports Answer the Only Question Parents Have',
      spotlight: {
        concept: 'Data flows in automatically from attendance, meals, photos, and tasks to create each child\'s daily summary',
        detail: 'The daily report answers: "Was my child safe, fed, rested, and happy today?" Data pulls from kiosk check-ins (M04/M05), meal count submissions (M06), photo uploads (M07), and task completions (M08). Teachers add mood notes and milestones. Directors can export reports as PDF for individual families.',
        whyItMatters: 'Incomplete daily reports erode parent trust. When parents cannot see what happened during the day, they assume nobody is paying attention. This is the leading cause of families looking for a different center. A complete report takes 2 minutes per child if the underlying data is already in the system.',
      },
    },
    {
      id: 'M09-A2',
      type: 'walkthrough',
      title: 'Review and Complete Daily Reports',
      steps: [
        {
          instruction: 'Go to /admin/reports/daily. The dashboard shows summaries across all classrooms. Filter by classroom, date, or individual child.',
          tryItLink: '/admin/reports/daily',
        },
        {
          instruction: 'Check the "incomplete reports" alert. This shows which classrooms are missing data before end of day: missing meal counts, unrecorded nap times, or no activity notes.',
        },
        {
          instruction: 'Tap into a specific classroom. Review each child\'s summary: attendance, meals served, nap times, activities, and staff notes.',
        },
        {
          instruction: 'At 4:00 PM, scan every child\'s report. Flag anything that needs a parent conversation at pickup. Add 1-2 sentences per child about their mood, milestones, or notable moments.',
        },
      ],
    },
    {
      id: 'M09-A3',
      type: 'walkthrough',
      title: 'What Parents See on Their Dashboard',
      steps: [
        {
          instruction: 'Log in to a parent account and go to /dashboard. The daily summary card shows your child\'s check-in time, meals served, activities, and any teacher notes.',
          tryItLink: '/dashboard',
        },
        {
          instruction: 'Notice how the data comes from multiple sources: the check-in time from the kiosk, the meal checkmarks from the meal count form, and the photos from the photo gallery.',
        },
        {
          instruction: 'This is often the first thing a parent looks at when they pick up their phone after work. A complete report builds trust. A blank report raises questions.',
        },
      ],
    },
    {
      id: 'M09-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'A parent arrives at pickup and asks, "Did my child eat lunch today? She has been picky at home." You do not remember. What do you do?',
        options: [
          {
            text: 'Say "I think so" and move on',
            isCorrect: false,
            feedback: 'Guessing undermines parent trust. If you are wrong, the parent wonders what else you are guessing about. The data is in the system.',
          },
          {
            text: 'Open the daily report on your phone and check the meal count record for that child',
            isCorrect: true,
            feedback: 'Correct. The daily report shows exactly which meals were served. Pulling up the data takes 15 seconds and gives the parent a definitive answer with a timestamp.',
          },
          {
            text: 'Ask another teacher if they remember',
            isCorrect: false,
            feedback: 'Asking a colleague is slower and less reliable than checking the system. The meal count record is the source of truth.',
          },
          {
            text: 'Tell the parent to check their dashboard later tonight',
            isCorrect: false,
            feedback: 'The parent is standing in front of you and wants an answer now. Deflecting to the app feels dismissive. Check the report together.',
          },
        ],
      },
    },
    {
      id: 'M09-A5',
      type: 'explore',
      title: 'Daily Report Pages',
      pages: [
        { path: '/admin/reports/daily', name: 'Daily Reports Dashboard', description: 'Director view of daily summaries across all classrooms with incomplete data alerts' },
        { path: '/dashboard', name: 'Parent Dashboard', description: 'What parents see: daily summary cards with meals, naps, activities, and teacher notes' },
      ],
    },
    {
      id: 'M09-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Why is the 4 PM report review important? What happens to parent trust when daily reports are incomplete or missing?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'A parent arrives at pickup and asks, "Did my child eat lunch today? She\'s been picky at home." How do you find this information in the system?',
    'Why is the 4 PM report review important? (Answer: it gives you a chance to catch missing data, prepare for parent conversations, and address any concerns before families arrive)',
    'What happens to parent trust when daily reports are incomplete or missing? (Answer: parents assume nobody is paying attention; this erodes trust and increases the chance they look for a different center)',
  ],
  commonMistakes: [
    {
      mistake: 'Not adding notes to daily reports',
      prevention: 'Add 1-2 sentences per child per day: mood, milestones, cute moments',
    },
    {
      mistake: 'Skipping the 4 PM review',
      prevention: 'Build the 4 PM review into your daily routine',
    },
    {
      mistake: 'Relying on memory instead of the system',
      prevention: 'Check the report before answering any parent question',
    },
    {
      mistake: 'Leaving nap times unrecorded',
      prevention: 'Log nap start and end as it happens, not from memory later',
    },
    {
      mistake: 'Not reviewing incomplete report alerts (directors)',
      prevention: 'Check the "incomplete reports" alert before 5 PM daily',
    },
  ],
};
