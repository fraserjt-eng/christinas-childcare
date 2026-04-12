import { ModuleContent } from '@/types/training';

export const M28Content: ModuleContent = {
  moduleId: 'M28',
  activities: [
    {
      id: 'M28-A1',
      type: 'spotlight',
      title: 'Optimization Is Not Cost Cutting',
      spotlight: {
        concept: 'Cost optimization finds waste and redirects resources. The goal is never to spend less on children.',
        detail: 'The platform reveals patterns that paper bookkeeping hides: overtime accumulating slowly, food waste from inaccurate meal counts, supply spending varying 3x between classrooms doing the same activities, and training budgets going unspent while certifications expire. The system generates optimization suggestions based on your actual data.',
        whyItMatters: 'A CACFP capture rate of 82% vs. 90% leaves $3,200/year on the table. Monthly overtime of $1,200 could be reduced to $400 by hiring a part-time floater at $800/month, saving $400/month and improving coverage. Small savings compound: $50/month across 3 categories is $1,800/year.',
      },
    },
    {
      id: 'M28-A2',
      type: 'walkthrough',
      title: 'Review the Expense Breakdown',
      steps: [
        {
          instruction: 'Go to /admin/financial and click the expense breakdown view. It shows total expenses by category, percentage of total, month-over-month trend, and per-child cost.',
          tryItLink: '/admin/financial',
        },
        {
          instruction: 'Check labor cost analysis: regular hours, overtime (highlighted separately), benefits, per-classroom labor cost, and labor as % of revenue. Target: 50-56%. Above 60% means either staffing is inefficient or revenue is too low.',
        },
        {
          instruction: 'Check the CACFP maximization section: maximum possible reimbursement, actual received, capture rate, and revenue left on the table. A capture rate below 90% means money is lost to missed counts or incomplete documentation.',
          tryItLink: '/admin/budget',
        },
      ],
    },
    {
      id: 'M28-A3',
      type: 'walkthrough',
      title: 'Review Optimization Suggestions',
      steps: [
        {
          instruction: 'Find the "Optimization Suggestions" panel on the financial dashboard. The system generates suggestions based on your data.',
          tryItLink: '/admin/financial',
        },
        {
          instruction: 'Review each suggestion. Examples: "Overtime cost was $1,200 last month. Hiring a part-time floater at $800/month would reduce overtime and improve coverage." Or: "CACFP capture rate is 82%. Improving to 90% would add $3,200/year."',
        },
        {
          instruction: 'For each optimization you choose to pursue, create a task (M08) with the current state, target, action, timeline, and owner. This creates accountability.',
          tryItLink: '/admin/supplies',
        },
      ],
    },
    {
      id: 'M28-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'The optimization dashboard shows that your CACFP capture rate is 85%. The system estimates you are leaving $6,400/year on the table. Where do you start?',
        options: [
          {
            text: 'Accept 85% as good enough',
            isCorrect: false,
            feedback: '$6,400/year is real money. Moving from 85% to 90% is achievable with better meal count habits. That $3,200 improvement requires no additional expense, just better process.',
          },
          {
            text: 'Drill into the data: identify which classrooms miss counts, which meals are missed most often, and whether the root cause is training, timing, or staffing',
            isCorrect: true,
            feedback: 'Correct. The capture rate gap has specific causes. Maybe the Toddler Room misses PM snack counts because the substitute does not know the process. Maybe breakfast counts are submitted late because staff arrive after the meal. Find the pattern, fix the cause.',
          },
          {
            text: 'Add more staff to handle meal count submissions',
            isCorrect: false,
            feedback: 'The problem is not staffing. Meal count submission takes 30 seconds. The problem is training, timing, or habit. Adding staff for a 30-second task is not cost optimization.',
          },
          {
            text: 'Switch to paper meal counts to simplify the process',
            isCorrect: false,
            feedback: 'Paper counts create more problems: illegible handwriting, lost forms, no timestamp verification. The digital system is faster and more accurate. The issue is adoption, not the tool.',
          },
        ],
      },
    },
    {
      id: 'M28-A5',
      type: 'explore',
      title: 'Cost Optimization Pages',
      pages: [
        { path: '/admin/financial', name: 'Financial Dashboard', description: 'Expense breakdown, labor analysis, CACFP maximization, and optimization suggestions' },
        { path: '/admin/budget', name: 'Budget Dashboard', description: 'Budget vs. actual with variance tracking and category-level analysis' },
        { path: '/admin/supplies', name: 'Supply Management', description: 'Track supply spending by classroom and identify bulk purchasing opportunities' },
      ],
    },
    {
      id: 'M28-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Look at your labor cost as a percentage of revenue. Is it where you want it to be? If it is above 60%, what would need to change to bring it to 55% without reducing quality?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Look at your labor cost as a percentage of revenue. Is it where you want it to be? If it is 60%, what would need to change to bring it to 55% without reducing quality?',
    'What is one expense category where you suspect waste but have never had the data to prove it? Let\'s look at the data right now.',
    'The platform shows that your CACFP capture rate is 85%. What is the root cause, and what would it take to get to 95%?',
  ],
  commonMistakes: [
    {
      mistake: 'Cutting training budget to save money',
      prevention: 'Cutting training leads to expired certifications, which leads to staffing crises. Training is insurance.',
    },
    {
      mistake: 'Ignoring small savings',
      prevention: '$50/month x 12 months x 3 categories = $1,800/year. Small savings compound.',
    },
    {
      mistake: 'Reducing staff to save on labor',
      prevention: 'Reducing below required ratios is illegal. Optimizing schedules (M18) to reduce overtime is effective.',
    },
    {
      mistake: 'Looking at cost optimization once a year',
      prevention: 'Cost patterns shift monthly. Quarterly review catches problems before they become annual surprises.',
    },
  ],
};
