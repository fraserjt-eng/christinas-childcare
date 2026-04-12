import { ModuleContent } from '@/types/training';

export const M22Content: ModuleContent = {
  moduleId: 'M22',
  activities: [
    {
      id: 'M22-A1',
      type: 'spotlight',
      title: 'Every Empty Spot Costs $800-1,200 Per Month',
      spotlight: {
        concept: 'Most centers lose 30-50% of inquiries because nobody follows up within 48 hours',
        detail: 'The enrollment pipeline transforms enrollment from "waiting for the phone to ring" to active pipeline management. A kanban board tracks every family through five stages: Inquiry, Tour Scheduled, Tour Complete, Paperwork, and Enrolled. Each card shows the family name, child age, inquiry date, and days in the current stage. Stalled leads turn yellow at 5 days and red at 10 days.',
        whyItMatters: 'An empty classroom spot generates zero revenue for every day it sits unfilled. With tuition at $200-300/week, a spot empty for one month costs $800-1,200. The pipeline ensures no inquiry falls through the cracks and every family gets timely follow-up.',
      },
    },
    {
      id: 'M22-A2',
      type: 'walkthrough',
      title: 'Add an Inquiry to the Pipeline',
      steps: [
        {
          instruction: 'Go to /admin/pipeline. The kanban board shows five columns: Inquiry, Tour Scheduled, Tour Complete, Paperwork, and Enrolled.',
          tryItLink: '/admin/pipeline',
        },
        {
          instruction: 'Click "Add Inquiry" at the top of the Inquiry column. Fill in parent name and contact info, child name and date of birth, how they heard about you, preferred start date, and notes from the initial conversation.',
        },
        {
          instruction: 'Set a follow-up reminder for 24 hours. Every inquiry should get a response within one day.',
        },
      ],
    },
    {
      id: 'M22-A3',
      type: 'walkthrough',
      title: 'Manage Stalled Leads',
      steps: [
        {
          instruction: 'Go to /admin/pipeline and look for yellow (5+ days in one stage) and red (10+ days) cards. These families are at risk of dropping off.',
          tryItLink: '/admin/pipeline/enrollment',
        },
        {
          instruction: 'Click any stalled card to see the last action taken, communication history, and suggested next action.',
        },
        {
          instruction: 'Send a follow-up message. A simple "Just checking in" re-opens 20-30% of stalled leads. If no response after two follow-ups, archive the card.',
        },
        {
          instruction: 'Click "Metrics" in the top toolbar to see conversion rates: Inquiry-to-Tour, Tour-to-Enroll, average days to enroll, and lead source breakdown.',
          tryItLink: '/admin/inquiries',
        },
      ],
    },
    {
      id: 'M22-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'A parent walks in the door and asks about enrollment for their 2-year-old. You are in the middle of handling a staff scheduling issue. What do you do?',
        options: [
          {
            text: 'Tell them to call back later when you are less busy',
            isCorrect: false,
            feedback: 'A family who walks in is the highest-intent lead you can get. Telling them to call back means most of them will not. You just lost a potential $10,000+ in annual revenue.',
          },
          {
            text: 'Spend 2 minutes getting their name, phone, and child\'s age. Add them to the pipeline immediately. Offer to schedule a tour.',
            isCorrect: true,
            feedback: 'Correct. A 2-minute interaction captures the lead. Add them to the pipeline within the hour and schedule a tour. The scheduling issue can wait 2 minutes.',
          },
          {
            text: 'Give them a flyer and your business card',
            isCorrect: false,
            feedback: 'A flyer is passive. You have no way to follow up because you did not get their contact information. The family goes home, the flyer goes on a pile, and you never hear from them.',
          },
          {
            text: 'Have a staff member give them a tour right now',
            isCorrect: false,
            feedback: 'An unplanned tour might work, but the classrooms may not be tour-ready. Better to capture the lead, schedule a proper tour, and ensure a good first impression.',
          },
        ],
      },
    },
    {
      id: 'M22-A5',
      type: 'explore',
      title: 'Enrollment Pipeline Pages',
      pages: [
        { path: '/admin/pipeline', name: 'Pipeline Board', description: 'Kanban board tracking families from inquiry to enrollment with stage timing' },
        { path: '/admin/pipeline/enrollment', name: 'Enrollment Status', description: 'Detailed enrollment tracking with stalled lead alerts and follow-up reminders' },
        { path: '/admin/inquiries', name: 'Inquiry Management', description: 'All inquiries with referral source tracking and conversion metrics' },
      ],
    },
    {
      id: 'M22-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Walk through the last 5 families who inquired but did not enroll. At what stage did they drop off? Was there a follow-up that did not happen?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Walk through the last 5 families who inquired but did not enroll. At what stage did they drop off? Was there a follow-up that did not happen?',
    'If your tour-to-enroll rate is 40%, and you want to add 5 new families this quarter, how many tours do you need to schedule?',
    'Which lead source has produced your most loyal families? How does that compare to where you spend the most marketing energy?',
  ],
  commonMistakes: [
    {
      mistake: 'Not logging walk-in inquiries',
      prevention: 'Every person who walks through the door and asks about enrollment is a lead. Log them immediately.',
    },
    {
      mistake: 'Moving cards to "Enrolled" before paperwork is complete',
      prevention: 'A family is not enrolled until all paperwork and payment are received.',
    },
    {
      mistake: 'Ignoring stalled cards',
      prevention: 'A simple "Just checking in" message re-opens 20-30% of stalled leads.',
    },
    {
      mistake: 'Not tracking referral sources',
      prevention: 'Referral source data tells you where to invest marketing dollars.',
    },
  ],
};
