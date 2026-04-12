import { ModuleContent } from '@/types/training';

export const M11Content: ModuleContent = {
  moduleId: 'M11',
  activities: [
    {
      id: 'M11-A1',
      type: 'spotlight',
      title: 'Consistency Beats Perfection',
      spotlight: {
        concept: 'Every Friday by 3 PM, a newsletter goes out. No exceptions.',
        detail: 'Newsletters keep families connected on a predictable rhythm. Parents learn to expect the Friday update and start looking for it. Announcements are separate: they handle time-sensitive, urgent notices (closures, weather, emergencies) and bypass the newsletter template. Read receipts let you track who opened each newsletter.',
        whyItMatters: 'A center that communicates consistently retains families. A 40% open rate means 60% of families are not reading your updates. Tracking open rates reveals which families are disengaged and may need a different communication approach before they quietly leave.',
      },
    },
    {
      id: 'M11-A2',
      type: 'walkthrough',
      title: 'Create a Weekly Newsletter',
      steps: [
        {
          instruction: 'Go to /admin/communications and tap "New Newsletter." Select a template or start from blank.',
          tryItLink: '/admin/communications',
        },
        {
          instruction: 'Add sections using the building blocks: a header photo from the week, 2-3 sentences of welcome text, highlights from the week, upcoming events, menu preview, and reminders.',
        },
        {
          instruction: 'Keep each section to 2-3 sentences. Parents skim. Put the most important item first. Include at least 2 photos.',
        },
        {
          instruction: 'Preview the newsletter to see how it looks on a phone. Then choose "Schedule" and set delivery for Friday at 3 PM. Write it Thursday, let it send Friday.',
        },
      ],
    },
    {
      id: 'M11-A3',
      type: 'walkthrough',
      title: 'Send an Urgent Announcement',
      steps: [
        {
          instruction: 'Go to /admin/communications and tap "New Announcement." This is for time-sensitive information only: weather closures, health alerts, emergency schedule changes.',
          tryItLink: '/admin/news',
        },
        {
          instruction: 'Write the message. Keep it short and clear. Select the audience: all families, a specific classroom, or staff only.',
        },
        {
          instruction: 'Choose delivery method: push notification + email (recommended for urgent items). Tap "Send Now." Announcements bypass the newsletter template and go out immediately.',
        },
      ],
    },
    {
      id: 'M11-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is Friday at 2:45 PM. You have not started the weekly newsletter. Nothing unusual happened this week. What do you do?',
        options: [
          {
            text: 'Skip the newsletter this week since nothing special happened',
            isCorrect: false,
            feedback: 'Skipping breaks the rhythm. Parents who expect the Friday update will notice its absence. Even "this week was calm and productive" is a message worth sending.',
          },
          {
            text: 'Send a quick newsletter with 3 sections: a classroom highlight, next week\'s events, and a thank-you',
            isCorrect: true,
            feedback: 'Correct. A short newsletter that arrives on time builds more trust than a detailed one that arrives late or not at all. Three sections takes 10 minutes.',
          },
          {
            text: 'Send it Monday morning instead when you have more time',
            isCorrect: false,
            feedback: 'Consistency means Friday by 3 PM. Moving to Monday breaks the pattern families rely on. Write it now and keep it brief.',
          },
          {
            text: 'Send an announcement instead since it is faster',
            isCorrect: false,
            feedback: 'Announcements are for emergencies and closures. Using them for routine updates trains parents to ignore them when a real emergency happens.',
          },
        ],
      },
    },
    {
      id: 'M11-A5',
      type: 'explore',
      title: 'Communication Pages',
      pages: [
        { path: '/admin/news', name: 'News Management', description: 'Create and manage announcements and news items for families' },
        { path: '/admin/communications', name: 'Communications Hub', description: 'Newsletter builder with templates, scheduling, and read receipt tracking' },
        { path: '/dashboard/news', name: 'Parent News Feed', description: 'What parents see: newsletters, announcements, and center updates' },
      ],
    },
    {
      id: 'M11-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'A newsletter has a 40% open rate. What does that tell you? What would you change to reach the 60% of families who are not reading it?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What should always be in a weekly newsletter? What should never be in one?',
    'A newsletter has a 40% open rate. What does that tell you? What would you change?',
    'How do you balance being informative with being too long? (Answer: 3-5 sections, each 2-3 sentences. Parents skim; put the most important item first.)',
  ],
  commonMistakes: [
    {
      mistake: 'Sending newsletters on random days',
      prevention: 'Every Friday by 3 PM. No exceptions. Consistency builds the habit.',
    },
    {
      mistake: 'Writing paragraphs',
      prevention: '2-3 sentences per section. Use headers. Parents skim.',
    },
    {
      mistake: 'Forgetting photos',
      prevention: 'Include at least 2 photos per newsletter',
    },
    {
      mistake: 'Not using announcements for closures',
      prevention: 'Closures and emergencies get announcements (push + email), not newsletters',
    },
    {
      mistake: 'Skipping newsletters during slow weeks',
      prevention: 'There\'s always something to share. Even "this week was calm and productive" is a message.',
    },
  ],
};
