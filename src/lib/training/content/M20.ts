import { ModuleContent } from '@/types/training';

export const M20Content: ModuleContent = {
  moduleId: 'M20',
  activities: [
    {
      id: 'M20-A1',
      type: 'spotlight',
      title: 'Small Discrepancies Compound Fast',
      spotlight: {
        concept: 'Ten minutes per day per employee across 8 staff equals 6.5 hours per week of unplanned labor cost',
        detail: 'The payroll dashboard flags overtime, missed punches, and time entry discrepancies automatically. It compares scheduled hours vs. actual hours for every employee in every pay period. The system does not replace your payroll service or accountant; it catches errors before the numbers leave the building.',
        whyItMatters: 'Most owners are 70-80% confident their payroll is accurate. That 20-30% gap costs real money. A 10-minute daily discrepancy per employee adds up to $5,000-10,000 per year in unplanned labor cost. The system targets 95%+ confidence.',
      },
    },
    {
      id: 'M20-A2',
      type: 'walkthrough',
      title: 'Review Payroll for the Pay Period',
      steps: [
        {
          instruction: 'Go to /admin/payroll. The dashboard shows current pay period dates, total hours logged, total projected labor cost, and flags for overtime, missed punches, and discrepancies.',
          tryItLink: '/admin/payroll',
        },
        {
          instruction: 'Click "Time Entries" for the detailed view. Each row shows one staff member with scheduled vs. actual hours, clock times, and a variance column. Sort by variance to find the biggest discrepancies first.',
        },
        {
          instruction: 'Review overtime flags. If overtime was pre-approved, mark it as "Approved." If unplanned, investigate: was this a coverage issue, a scheduling mistake, or a time entry error?',
        },
        {
          instruction: 'Resolve missed punches the same day they occur. Click the incomplete entry to add the missing time. The system logs who made the correction and when.',
        },
      ],
    },
    {
      id: 'M20-A3',
      type: 'walkthrough',
      title: 'View Your Pay Stubs (Employees)',
      steps: [
        {
          instruction: 'Go to /employee/pay-stubs. You see your pay history with dates, regular hours, overtime hours, deductions, and net pay.',
          tryItLink: '/employee/pay-stubs',
        },
        {
          instruction: 'Review each pay stub for accuracy. If you notice a discrepancy between your expected hours and what was paid, message the director through the messaging system with the specific dates and times in question.',
        },
      ],
    },
    {
      id: 'M20-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is Friday afternoon. You are reviewing payroll and notice that one employee has been clocking in 10-12 minutes early every day this week. Their scheduled start is 7:00 AM but they are clocking in at 6:48-6:50 AM. Over the pay period, this adds up to nearly 2 extra hours. What do you do?',
        options: [
          {
            text: 'Ignore it since 10 minutes per day is not a big deal',
            isCorrect: false,
            feedback: 'Ten minutes per day, five days a week, is 50 minutes. Over 52 weeks, that is 43 extra hours of pay. For a $15/hour employee, that is $645 per year from one person. Multiply across 8 staff and it is significant.',
          },
          {
            text: 'Adjust the time entries to the scheduled start time without telling the employee',
            isCorrect: false,
            feedback: 'Silently editing time entries creates trust issues and potential legal problems. All corrections should be transparent and communicated.',
          },
          {
            text: 'Discuss the pattern with the employee, clarify expectations about clock-in times, and adjust the entries for this pay period with the employee\'s knowledge',
            isCorrect: true,
            feedback: 'Correct. Have a direct conversation. Clarify whether they should start at 7:00 (and clock in at 7:00) or if the earlier start is needed and should be scheduled. Then adjust entries transparently.',
          },
          {
            text: 'Change their schedule to start at 6:45 AM to match their behavior',
            isCorrect: false,
            feedback: 'Adjusting the schedule to match unapproved early starts increases labor cost without a business reason. Clarify expectations first, then adjust the schedule only if the earlier start is actually needed.',
          },
        ],
      },
    },
    {
      id: 'M20-A5',
      type: 'explore',
      title: 'Payroll Pages',
      pages: [
        { path: '/admin/payroll', name: 'Payroll Dashboard', description: 'Pay period overview with time entries, variance flags, and overtime tracking' },
        { path: '/employee/pay-stubs', name: 'My Pay Stubs', description: 'Employee view of pay history, hours, deductions, and net pay' },
      ],
    },
    {
      id: 'M20-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'How confident are you right now that every hour on last week\'s payroll was accurate? What would it take to get to 95% confidence?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What is one payroll error you have caught (or wish you had caught) in the past year? How much did it cost, and how would this system have flagged it?',
    'If you could see overtime building by Wednesday every week, how would that change the way you manage Thursday and Friday staffing?',
    'How do you currently verify that scheduled hours match actual hours worked? What falls through the cracks?',
  ],
  commonMistakes: [
    {
      mistake: 'Approving payroll without reviewing variances',
      prevention: 'Block 30 minutes every Friday for payroll review. Never approve without checking the variance column.',
    },
    {
      mistake: 'Ignoring small time discrepancies',
      prevention: 'Ten minutes per day per employee across 8 staff = 6.5 hours/week of unplanned labor cost.',
    },
    {
      mistake: 'Not correcting missed punches promptly',
      prevention: 'Correct missed punches the same day. Memory fades; accuracy drops with every day of delay.',
    },
    {
      mistake: 'Generating pay stubs before resolving all flags',
      prevention: 'The system warns you if unresolved flags exist. Resolve every flag before generating.',
    },
  ],
};
