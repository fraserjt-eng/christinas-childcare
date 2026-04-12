import { ModuleContent } from '@/types/training';

export const M23Content: ModuleContent = {
  moduleId: 'M23',
  activities: [
    {
      id: 'M23-A1',
      type: 'spotlight',
      title: 'Tours Are 3-5x More Likely to Convert',
      spotlight: {
        concept: 'A family who tours is 3-5x more likely to enroll than one who only calls',
        detail: 'Families decide in the first 5 minutes whether they feel welcome. The tour management system provides a digital checklist, self-scheduling links, follow-up templates, and outcome tracking. Tours should cover Welcome (5 min), Classroom Tour (15 min), Facility Tour (10 min), and Closing (5 min).',
        whyItMatters: 'A tour without a follow-up is a wasted opportunity. The thank-you template sent within 2 hours closes the loop while the family\'s positive impressions are still fresh. Waiting 3+ days lets competing centers step in. The "sorry we missed you" template recovers 15-20% of no-shows.',
      },
    },
    {
      id: 'M23-A2',
      type: 'walkthrough',
      title: 'Schedule and Prepare for a Tour',
      steps: [
        {
          instruction: 'Go to /admin/pipeline/tours. The tour calendar shows upcoming tours, past tours with outcomes, and available tour slots.',
          tryItLink: '/admin/pipeline/tours',
        },
        {
          instruction: 'From the pipeline board, click a family\'s card and select "Schedule Tour." Fill in the preferred date and time (the system shows available slots), assign a tour guide, and add any special notes.',
        },
        {
          instruction: 'Copy the self-scheduling link from "Self-Schedule Settings." Share this on your website enrollment page, in email responses, and on social media so families can book their own tours.',
        },
        {
          instruction: 'Before the tour: review the family\'s pipeline card (names, ages, concerns), confirm with the tour guide, ensure classrooms are tour-ready, and have enrollment packets ready.',
        },
      ],
    },
    {
      id: 'M23-A3',
      type: 'walkthrough',
      title: 'Run the Tour with the Digital Checklist',
      steps: [
        {
          instruction: 'On the day of the tour, open the tour card and click "Start Checklist." The checklist walks you through every stop.',
        },
        {
          instruction: 'Welcome (5 min): Greet by name, introduce yourself, ask about their child, offer an overview. Classroom Tour (15 min): Visit the age-appropriate classroom, introduce the lead teacher, point out safety features.',
        },
        {
          instruction: 'Facility Tour (10 min): Kitchen, outdoor play space, nap area, drop-off procedures, show the kiosk. Closing (5 min): Answer questions, explain enrollment process, provide packet, set a follow-up date.',
        },
      ],
    },
    {
      id: 'M23-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'A family toured your center on Tuesday. It is now Thursday afternoon and no follow-up has been sent. You just realized this while reviewing the pipeline. What do you do?',
        options: [
          {
            text: 'Send the follow-up now with an apology for the delay',
            isCorrect: false,
            feedback: 'Apologizing draws attention to the gap. A warm, genuine follow-up at 48 hours is still within a reasonable window. Send it without the apology.',
          },
          {
            text: 'Send the 48-hour "Gentle Nudge" template immediately. Update the pipeline card. Set a 7-day final follow-up reminder.',
            isCorrect: true,
            feedback: 'Correct. The 48-hour template is designed for this moment. Send it now, update the card with your notes from the tour, and schedule the 7-day final follow-up as a safety net.',
          },
          {
            text: 'Wait until the family contacts you since they seemed interested',
            isCorrect: false,
            feedback: 'Even interested families get busy. Without a follow-up, they may tour a competitor and enroll there. The center that follows up first usually wins.',
          },
          {
            text: 'Call them on the phone instead of sending a message',
            isCorrect: false,
            feedback: 'A phone call can be effective but a message is less intrusive and gives the family time to respond. Use the template first; call if they do not respond within 48 hours.',
          },
        ],
      },
    },
    {
      id: 'M23-A5',
      type: 'explore',
      title: 'Tour Management Pages',
      pages: [
        { path: '/admin/pipeline/tours', name: 'Tour Calendar', description: 'Schedule tours, track outcomes, manage self-scheduling links, and send follow-ups' },
      ],
    },
    {
      id: 'M23-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What is the one thing you want every family to remember about your center after a tour? Is that thing currently part of your tour routine, or does it happen by accident?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What is the one thing you want every family to remember about your center after a tour? Is that thing currently part of your tour routine, or does it happen by accident?',
    'How many tours in the past 6 months ended with no follow-up? What is the revenue impact of those missed connections?',
  ],
  commonMistakes: [
    {
      mistake: 'Giving tours without the checklist',
      prevention: 'Even experienced directors miss items under pressure. The checklist is a safety net, not a script.',
    },
    {
      mistake: 'Waiting 3+ days for follow-up',
      prevention: 'Send the thank-you template within 2 hours. It takes 60 seconds. Delay kills momentum.',
    },
    {
      mistake: 'Not tracking no-shows',
      prevention: 'The "sorry we missed you" template recovers 15-20% of no-shows.',
    },
    {
      mistake: 'Scheduling tours during chaotic times',
      prevention: 'Avoid drop-off (7:30-9:00) or pick-up (3:30-5:30). Mid-morning after activities start is ideal.',
    },
  ],
};
