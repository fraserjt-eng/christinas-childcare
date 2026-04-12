import { ModuleContent } from '@/types/training';

export const M24Content: ModuleContent = {
  moduleId: 'M24',
  activities: [
    {
      id: 'M24-A1',
      type: 'spotlight',
      title: 'A Lapsed Authorization Stops Revenue Immediately',
      spotlight: {
        concept: 'County childcare assistance and state-funded program authorizations must be renewed before they expire',
        detail: 'The authorization dashboard tracks every child\'s funding source with color-coded status: Active (green, 60+ days), Attention (yellow, 30-60 days), Urgent (orange, 14-30 days), Critical (red, under 14 days or expired), and Pending Renewal (blue). Each card shows the child name, authorization type, dates, and monthly revenue value.',
        whyItMatters: 'A lapsed authorization means the center cannot bill for that child\'s care during the gap. The family may not even know their authorization is expiring. County offices can take 4-6 weeks to process renewals, so starting at 60 days is not early, it is necessary. Three lapsed authorizations can mean $3,600/month in sudden revenue loss.',
      },
    },
    {
      id: 'M24-A2',
      type: 'walkthrough',
      title: 'Monitor the Authorization Dashboard',
      steps: [
        {
          instruction: 'Go to /admin/pipeline/authorizations. The dashboard organizes authorizations by status: Active, Attention, Urgent, Critical, and Pending Renewal.',
          tryItLink: '/admin/pipeline/authorizations',
        },
        {
          instruction: 'Look at the sidebar: it shows total monthly revenue from authorized care, revenue from authorizations expiring in 30 and 60 days, and revenue currently at risk.',
        },
        {
          instruction: 'For any card in yellow or orange, click to see the authorization details: type (CCAP, CCDF, Head Start, Private Pay), start date, end date, and communication history with the family.',
        },
      ],
    },
    {
      id: 'M24-A3',
      type: 'walkthrough',
      title: 'Respond to Expiry Alerts',
      steps: [
        {
          instruction: 'At 60 days (yellow): contact the family to confirm they are aware of the upcoming renewal. Note what documents they need to gather. Set a follow-up reminder for 45 days.',
        },
        {
          instruction: 'At 30 days (orange): verify the family has started the renewal process. Offer to help with paperwork or connect them with their county worker. If no action, escalate to a phone call.',
        },
        {
          instruction: 'At 14 days (red): direct contact required. If renewal is submitted, move the card to "Pending Renewal" and track processing status. If no renewal action, calculate revenue at risk and flag to the owner.',
          tryItLink: '/admin/pipeline/authorizations',
        },
      ],
    },
    {
      id: 'M24-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'Three authorizations worth $3,600/month total are expiring in the next 30 days. One family says they submitted renewal paperwork. One family has not responded to your messages. One family says they forgot. What is your action plan?',
        options: [
          {
            text: 'Wait and see what happens. The county usually processes things on time.',
            isCorrect: false,
            feedback: 'County processing takes 4-6 weeks. With 30 days left, waiting guarantees a gap for at least some of these families. $3,600/month is not something you wait and see about.',
          },
          {
            text: 'Move family 1 to Pending Renewal and track weekly. Call family 2 today. Help family 3 start paperwork this week.',
            isCorrect: true,
            feedback: 'Correct. Family 1 is in process; track the status. Family 2 needs direct contact since messages are not working. Family 3 needs hands-on help to get started immediately.',
          },
          {
            text: 'Send a group email to all three families with renewal instructions',
            isCorrect: false,
            feedback: 'Each family is at a different stage. A generic email does not address family 1\'s tracking need, family 2\'s non-responsiveness, or family 3\'s need for direct assistance.',
          },
          {
            text: 'Focus on the largest authorization first and handle the others later',
            isCorrect: false,
            feedback: 'All three are at risk. A $900/month authorization that lapses costs the same as a $1,800/month one in terms of operational disruption. Address all three this week.',
          },
        ],
      },
    },
    {
      id: 'M24-A5',
      type: 'explore',
      title: 'Authorization Pages',
      pages: [
        { path: '/admin/pipeline/authorizations', name: 'Authorization Dashboard', description: 'Track all child care assistance authorizations with expiry alerts and revenue-at-risk calculations' },
      ],
    },
    {
      id: 'M24-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Have you ever had a child\'s authorization lapse without anyone noticing? What happened to the billing for that period, and how would the alert system have prevented it?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Have you ever had a child\'s authorization lapse without anyone noticing? What happened to the billing for that period?',
    'If three authorizations worth $3,600/month are expiring in the next 30 days, what is your action plan this week?',
    'How do you currently communicate with families about authorization renewals? Where does that communication break down?',
  ],
  commonMistakes: [
    {
      mistake: 'Waiting until 14 days to act',
      prevention: 'Check the authorization dashboard every Monday. Make it part of your pipeline review routine.',
    },
    {
      mistake: 'Assuming the family knows about renewal',
      prevention: 'County letters get lost, ignored, or misunderstood. Confirm directly with the family at 60 and 30 days.',
    },
    {
      mistake: 'Not tracking pending renewals',
      prevention: 'Processing delays are common. Track the status weekly until the new authorization is in hand.',
    },
    {
      mistake: 'Forgetting to update the system when a new authorization arrives',
      prevention: 'Update the system the same day the new authorization is received.',
    },
  ],
};
