import { ModuleContent } from '@/types/training';

export const M26Content: ModuleContent = {
  moduleId: 'M26',
  activities: [
    {
      id: 'M26-A1',
      type: 'spotlight',
      title: 'Visibility Replaces Surprises',
      spotlight: {
        concept: 'The budget tool replaces "shoebox receipts and quarterly surprises from the accountant"',
        detail: 'The budget dashboard uses plain categories (Payroll, Food, Supplies, Rent, Utilities, Insurance, Training, Other) instead of accounting codes. The owner enters expected monthly amounts, and the system tracks actuals as expenses are logged. Each category shows budgeted, actual, remaining, percentage consumed, and variance. If payroll exceeds 60% of total, the system flags it.',
        whyItMatters: 'Most owners cannot tell you their total expenses within $500 for last month. That is not a failure of attention; it is a visibility problem. A 10% variance in one category spotted in January prevents a $15,000 surprise in December.',
      },
    },
    {
      id: 'M26-A2',
      type: 'walkthrough',
      title: 'Set Up and Review Your Budget',
      steps: [
        {
          instruction: 'Go to /admin/budget. The dashboard shows current month at a glance: total budgeted vs. total actual, category-level breakdown with progress bars, and variance summary.',
          tryItLink: '/admin/budget',
        },
        {
          instruction: 'Click "Edit Budget." For each category, enter the monthly budgeted amount: Payroll & Benefits (50-60%), Food & Kitchen, Supplies, Rent, Utilities, Insurance, Professional Development, Marketing, Maintenance, and Other.',
        },
        {
          instruction: 'The system auto-calculates your annual total and shows a pie chart. Check that payroll does not exceed 60% of total.',
        },
        {
          instruction: 'Review the variance report: red means over budget by more than 10%, blue means under budget by more than 10%, green means within range. Investigate anything over 10%.',
          tryItLink: '/admin/financial',
        },
      ],
    },
    {
      id: 'M26-A3',
      type: 'walkthrough',
      title: 'Interpret Variance Reports',
      steps: [
        {
          instruction: 'Click "Variance Report" in the toolbar. Each category shows the dollar amount and percentage of variance.',
          tryItLink: '/admin/budget',
        },
        {
          instruction: 'Click any variance item to see trend data: is this a one-month spike or a 3-month pattern? A single spike may be a one-time expense. A 3-month pattern needs structural change.',
        },
        {
          instruction: 'If you operate multiple centers, click "Site Comparison" to view budgets side by side. The comparison shows per-child cost by category. This answers: "Why does one location spend $200 more per month on supplies?"',
        },
      ],
    },
    {
      id: 'M26-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is March. You review your budget and see that supplies spending has been 15% over budget for January, February, and March. The total overage is $450 across three months. What do you do?',
        options: [
          {
            text: 'Ignore it since $150/month is not significant',
            isCorrect: false,
            feedback: '$150/month over 12 months is $1,800/year. And a 3-month pattern suggests it will continue. Small overages compound. This deserves investigation.',
          },
          {
            text: 'Drill into the supply spending by classroom, identify which classroom is overspending, and investigate the cause before adjusting the budget or the behavior',
            isCorrect: true,
            feedback: 'Correct. Look at the classroom-level data. If one room is 2x the average, there may be waste, bulk purchasing opportunities, or a legitimate need. Investigate before deciding whether to adjust the budget or the spending.',
          },
          {
            text: 'Cut the supply budget by 15% to force compliance',
            isCorrect: false,
            feedback: 'Cutting without understanding the cause may reduce quality. Maybe the overspending is because enrollment increased and more supplies are needed. Data first, decisions second.',
          },
          {
            text: 'Increase the budget to match actual spending',
            isCorrect: false,
            feedback: 'Adjusting the budget to match spending without investigation just hides the problem. Understand why spending is up before deciding whether the budget or the spending needs to change.',
          },
        ],
      },
    },
    {
      id: 'M26-A5',
      type: 'explore',
      title: 'Budget Pages',
      pages: [
        { path: '/admin/budget', name: 'Budget Dashboard', description: 'Monthly budget vs. actual with category breakdowns, variance reports, and site comparison' },
        { path: '/admin/financial', name: 'Financial Overview', description: 'Consolidated financial view with expense breakdown and revenue tracking' },
      ],
    },
    {
      id: 'M26-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What is the single largest budget surprise you have experienced in the past year? With monthly tracking, how many months earlier could you have spotted it?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What is the single largest budget surprise you have experienced in the past year? With monthly tracking, how many months earlier could you have spotted it?',
    'Your accountant tells you that you were $15,000 over budget last year. With this system, at what point during the year would you have known that was happening?',
    'How do you decide when an over-budget category is a problem vs. a reasonable investment? What criteria do you use?',
  ],
  commonMistakes: [
    {
      mistake: 'Setting the budget once and never revisiting',
      prevention: 'Review budget vs. actual on the 1st of every month. The budget is a living document.',
    },
    {
      mistake: 'Not investigating variances',
      prevention: 'Any category over 10% deserves investigation. Five minutes of investigation prevents months of overspending.',
    },
    {
      mistake: 'Underbudgeting payroll',
      prevention: 'Budget payroll at 105% of calculated amount to account for overtime, coverage needs, and benefits.',
    },
    {
      mistake: 'Ignoring the site comparison',
      prevention: 'A $200/month supply cost difference across 12 months is $2,400. That adds up.',
    },
  ],
};
