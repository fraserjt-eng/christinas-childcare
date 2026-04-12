import { ModuleContent } from '@/types/training';

export const M21Content: ModuleContent = {
  moduleId: 'M21',
  activities: [
    {
      id: 'M21-A1',
      type: 'spotlight',
      title: 'Turnover Costs $3,000-5,000 Per Hire',
      spotlight: {
        concept: 'Structured onboarding reduces staff turnover by 25%',
        detail: 'Staff turnover in childcare averages 30-40% annually. Every new hire costs $3,000-5,000 in recruiting, training, and lost productivity. The onboarding system provides role-specific checklists with automatic reminders. Minnesota licensing requires specific training and documentation before a new employee can be counted in ratios. If onboarding is incomplete, that employee cannot legally supervise children alone.',
        whyItMatters: 'A new teacher who arrives to a disorganized first week is 3x more likely to quit within 90 days. Structured onboarding turns the first 30 days from chaotic to productive, protecting your investment in recruiting and training.',
      },
    },
    {
      id: 'M21-A2',
      type: 'walkthrough',
      title: 'Create an Onboarding Pathway',
      steps: [
        {
          instruction: 'Go to /admin/hr/onboarding. The dashboard shows active onboarding pathways, completed pathways, and the template library.',
          tryItLink: '/admin/hr/onboarding',
        },
        {
          instruction: 'Click "New Pathway." Choose from built-in templates: Lead Teacher (21 days, 35 tasks), Assistant Teacher (14 days, 25 tasks), Floater/Substitute (7 days, 18 tasks), or Kitchen Staff (10 days, 20 tasks).',
        },
        {
          instruction: 'Assign the pathway to the new hire. The system pre-fills tasks, deadlines, and responsible parties. Assign a mentor from the existing staff.',
        },
        {
          instruction: 'Review compliance items (flagged with a shield icon). These cannot be skipped: background check clearance, CPR/First Aid, mandated reporter training, health screening, and DHS orientation.',
        },
      ],
    },
    {
      id: 'M21-A3',
      type: 'walkthrough',
      title: 'Track Onboarding Progress (New Employee View)',
      steps: [
        {
          instruction: 'Go to /employee/onboarding. You see your personalized checklist with tasks organized by phase: Pre-boarding, Day 1, Week 1, and Month 1.',
          tryItLink: '/employee/onboarding',
        },
        {
          instruction: 'Complete tasks as you go. Each task shows what to do, when it is due, and who can help. Overdue tasks appear in red.',
        },
        {
          instruction: 'Upload required documents (certifications, background check clearance) directly through the system. Your director verifies and approves each one.',
        },
      ],
    },
    {
      id: 'M21-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'A new assistant teacher started Monday. It is now Friday. She has completed her building tour, met the team, and shadowed for 2 days. But her background check has not cleared yet. Can she work in the Toddler Room alone on Monday?',
        options: [
          {
            text: 'Yes, she has been here all week and seems responsible',
            isCorrect: false,
            feedback: 'Character impressions do not replace licensing requirements. Without a cleared background check, she cannot be in unsupervised contact with children. This is non-negotiable.',
          },
          {
            text: 'No. She must continue shadowing with a cleared staff member until the background check is processed',
            isCorrect: true,
            feedback: 'Correct. Compliance items are mandatory before independent work. She can continue learning alongside a cleared employee while the background check processes.',
          },
          {
            text: 'Check with the licensing agency to see if there is an exception',
            isCorrect: false,
            feedback: 'There is no exception for background check requirements. The system flags this as a compliance blocker. She stays supervised until it clears.',
          },
          {
            text: 'Have her work in the kitchen instead since it is not a classroom',
            isCorrect: false,
            feedback: 'Background check requirements apply to all staff with access to children, not just classroom teachers. Kitchen staff also need cleared checks.',
          },
        ],
      },
    },
    {
      id: 'M21-A5',
      type: 'explore',
      title: 'Onboarding Pages',
      pages: [
        { path: '/admin/hr/onboarding', name: 'Onboarding Dashboard', description: 'Create and manage onboarding pathways with templates, compliance tracking, and progress bars' },
        { path: '/employee/onboarding', name: 'My Onboarding', description: 'New employee view of their personalized checklist with task completion tracking' },
      ],
    },
    {
      id: 'M21-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Think about the last person you hired. What fell through the cracks during their first month? How would a checklist with automatic reminders have changed that?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Think about the last person you hired. What fell through the cracks during their first month? How would a checklist with automatic reminders have changed that?',
    'What is one thing you wish every new hire knew by the end of their first week that they currently do not learn until month two or three?',
    'How do you currently track whether a new hire has completed all required compliance training before they work unsupervised? What is the risk if something is missed?',
  ],
  commonMistakes: [
    {
      mistake: 'Skipping the pre-boarding phase',
      prevention: 'Pre-boarding tasks should begin the moment the offer is accepted. Portal access, paperwork, and schedule should be ready before day 1.',
    },
    {
      mistake: 'Not assigning a mentor',
      prevention: 'Assign a specific mentor for every new hire. Mentorship is the single strongest predictor of retention.',
    },
    {
      mistake: 'Marking compliance items complete without verification',
      prevention: 'Compliance items require documentation upload. The system does not accept a checkbox alone.',
    },
    {
      mistake: 'Using the same template for every role',
      prevention: 'A kitchen staff onboarding is fundamentally different from a lead teacher onboarding. Use role-specific templates.',
    },
    {
      mistake: 'Abandoning the pathway after week 1',
      prevention: 'The 30-day check-in catches problems that week 1 cannot reveal. Complete the full pathway.',
    },
  ],
};
