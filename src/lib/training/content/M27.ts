import { ModuleContent } from '@/types/training';

export const M27Content: ModuleContent = {
  moduleId: 'M27',
  activities: [
    {
      id: 'M27-A1',
      type: 'spotlight',
      title: 'Forecasting Tells You Where Money Is Going',
      spotlight: {
        concept: 'Budget tracking shows where money went. Forecasting shows where it is going. Together, they give you control.',
        detail: 'The forecasting dashboard projects monthly revenue for the next 12 months based on enrollment, CACFP reimbursement, authorized care, registration fees, and late pickup fees. The "what-if" scenario tool models decisions before you commit: enrollment changes, rate adjustments, staffing changes, and program additions.',
        whyItMatters: 'A healthy childcare center operates at 10-15% net margin. Below 5% means one bad month creates a cash crisis. The scenario tool shows you exactly what happens if you lose 3 children, raise rates by $25/week, or hire a floater. Decisions based on data prevent decisions based on panic.',
      },
    },
    {
      id: 'M27-A2',
      type: 'walkthrough',
      title: 'Review Your Revenue Forecast',
      steps: [
        {
          instruction: 'Go to /admin/financial/forecasting. The dashboard shows monthly revenue projection for the next 12 months, revenue by source, enrollment trend line, and monthly P&L summary.',
          tryItLink: '/admin/financial/forecasting',
        },
        {
          instruction: 'Click any revenue source in the breakdown to see the underlying data: tuition (enrollment count x weekly rate), CACFP (meal counts x reimbursement rate), authorized care (authorization count x rate), and fees.',
        },
        {
          instruction: 'Check the P&L view: total revenue, total expenses, net income, net margin, and monthly trend. Is your margin above 10%?',
        },
      ],
    },
    {
      id: 'M27-A3',
      type: 'walkthrough',
      title: 'Run a What-If Scenario',
      steps: [
        {
          instruction: 'Click "Scenarios" in the top toolbar. Choose a scenario type: Enrollment Change, Rate Adjustment, Staffing Change, or Program Change.',
          tryItLink: '/admin/financial/forecasting',
        },
        {
          instruction: 'For an enrollment change: adjust the slider to model losing or gaining children. The system recalculates monthly revenue, identifies break-even enrollment, and shows how many months until the change is fully felt.',
        },
        {
          instruction: 'Each scenario shows a side-by-side comparison: "Current state" vs. "With this change." Review the net impact before making the real decision.',
        },
      ],
    },
    {
      id: 'M27-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'Enrollment drops by 3 children next month. Your current net margin is 8%. You need to understand the financial impact quickly. What do you do?',
        options: [
          {
            text: 'Cut one staff position immediately to reduce costs',
            isCorrect: false,
            feedback: 'Cutting staff without modeling the impact could put you out of ratio. Run the scenario first to see the actual revenue impact and whether you can absorb it or need to adjust staffing carefully.',
          },
          {
            text: 'Run the enrollment change scenario in the forecasting tool to see the revenue impact, check how many months of margin you have, and then decide on staffing adjustments',
            isCorrect: true,
            feedback: 'Correct. The scenario tool shows the exact revenue impact, how long your margin holds, and whether you need to adjust staffing, rates, or enrollment efforts. Data first, decisions second.',
          },
          {
            text: 'Raise rates immediately to offset the revenue loss',
            isCorrect: false,
            feedback: 'A rate increase takes time to implement and could push more families away. Model the rate increase scenario first to see the break-even point: how many families would leave before the increase costs more than it earns.',
          },
          {
            text: 'Wait and hope enrollment recovers next month',
            isCorrect: false,
            feedback: 'Hope is not a financial strategy. The scenario tool gives you concrete numbers. At 8% margin, 3 lost children could push you below 5%, which is the danger zone. Know the numbers.',
          },
        ],
      },
    },
    {
      id: 'M27-A5',
      type: 'explore',
      title: 'Forecasting Pages',
      pages: [
        { path: '/admin/financial/forecasting', name: 'Revenue Forecasting', description: '12-month revenue projection with what-if scenarios, P&L summary, and seasonal patterns' },
      ],
    },
    {
      id: 'M27-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'You are considering a $25/week rate increase. What is the break-even point: how many families would need to leave before the increase costs you money? Run the scenario and find out.',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'If enrollment drops by 3 children next month, how many months of savings do you have before payroll becomes a problem? Run the scenario and find out.',
    'You are considering a $25/week rate increase. What is the break-even point: how many families would need to leave before the increase costs you money?',
    'What is your net margin right now? Is it where you want it to be? What is one lever you could pull to improve it by 2 percentage points?',
  ],
  commonMistakes: [
    {
      mistake: 'Never running scenarios',
      prevention: 'Run at least one scenario per month. The 5 minutes it takes prevents decisions based on gut feeling alone.',
    },
    {
      mistake: 'Ignoring CACFP revenue in projections',
      prevention: 'CACFP can represent $40,000-80,000/year. Undercounting it skews your entire forecast.',
    },
    {
      mistake: 'Making rate decisions without modeling',
      prevention: 'Model the rate increase first. See the impact. Then decide.',
    },
    {
      mistake: 'Not accounting for seasonal patterns',
      prevention: 'Summer enrollment dips are predictable. Plan staffing reductions or camp programs to match.',
    },
  ],
};
