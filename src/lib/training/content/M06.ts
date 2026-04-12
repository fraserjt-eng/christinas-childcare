import { ModuleContent } from '@/types/training';

export const M06Content: ModuleContent = {
  moduleId: 'M06',
  activities: [
    {
      id: 'M06-A1',
      type: 'spotlight',
      title: 'Every Missed Count Is Lost Revenue',
      spotlight: {
        concept: 'CACFP reimburses $2-8 per child per day, but only if you submit the count on time',
        detail: 'For a center with 40 children, CACFP reimbursement can total $40,000-80,000 per year. Each meal count has a hard submission deadline. After the deadline passes, the count cannot be submitted or corrected. There is no way to recover a missed count. The federal program does not accept late submissions.',
        whyItMatters: 'Missing one lunch count for 30 children costs $60-120 in a single day. Missing one lunch per week for a year costs $3,000-6,000. This is not a bonus; it is core revenue that pays for food, staff, and supplies.',
      },
    },
    {
      id: 'M06-A2',
      type: 'walkthrough',
      title: 'Submit a Meal Count',
      steps: [
        {
          instruction: 'Go to /employee/meal-count on your phone. Select the meal you are submitting (Breakfast, Lunch, AM Snack, PM Snack).',
          tryItLink: '/employee/meal-count',
        },
        {
          instruction: 'The system pre-fills the form with children who are checked in at the kiosk. Review the list carefully. All present children are marked as "served" by default.',
        },
        {
          instruction: 'Uncheck any child who was not served this meal (sick, sleeping, arrived after the meal). Add notes if needed, such as "arrived at 10:15, missed breakfast."',
        },
        {
          instruction: 'Tap "Submit." Verify the green confirmation message with the count and timestamp. This should take 30 seconds, not 5 minutes.',
        },
      ],
    },
    {
      id: 'M06-A3',
      type: 'walkthrough',
      title: 'Monitor Meal Counts as a Director',
      steps: [
        {
          instruction: 'Go to /admin/food-counts. The dashboard shows today\'s meal counts by classroom and meal type.',
          tryItLink: '/admin/food-counts',
        },
        {
          instruction: 'Check the color coding: green means submitted on time, yellow means deadline approaching, red means deadline passed and count missed.',
        },
        {
          instruction: 'Tap any classroom to see individual child counts. Use the date range selector to review historical submissions and identify patterns.',
        },
        {
          instruction: 'Check the weekly/monthly submission rate at the bottom. Look at the estimated reimbursement amount. Anything below 95% submission rate triggers a yellow warning.',
          tryItLink: '/admin/compliance',
        },
      ],
    },
    {
      id: 'M06-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'A substitute teacher is covering your classroom today. It is 1:20 PM and you get a notification that the lunch count has not been submitted. The deadline is 1:30 PM. What do you do?',
        options: [
          {
            text: 'Assume the substitute will figure it out',
            isCorrect: false,
            feedback: 'Substitutes often do not know the meal count process. In 10 minutes the deadline passes and lunch reimbursement for every child in that classroom is lost.',
          },
          {
            text: 'Call or message the substitute immediately and walk them through submitting the count',
            isCorrect: true,
            feedback: 'Correct. Time is critical. Walk them through /employee/meal-count, select Lunch, review the pre-filled list, and tap Submit. Ten minutes is enough if you guide them.',
          },
          {
            text: 'Wait until tomorrow and try to submit a late count',
            isCorrect: false,
            feedback: 'There is no late submission. Once the deadline passes, that reimbursement is gone permanently. You cannot recover a missed count.',
          },
          {
            text: 'Let it go since it is only one meal for one day',
            isCorrect: false,
            feedback: 'One missed lunch for 30 children costs $60-120. Multiply that across a few missed counts per month and you are looking at thousands in lost annual revenue.',
          },
        ],
      },
    },
    {
      id: 'M06-A5',
      type: 'explore',
      title: 'Meal Count Pages',
      pages: [
        { path: '/admin/food-counts', name: 'Food Count Dashboard', description: 'Director view of meal count submissions by classroom with deadline tracking' },
        { path: '/employee/meal-count', name: 'Meal Count Form', description: 'Employee form for submitting meal counts with attendance pre-fill' },
        { path: '/admin/compliance', name: 'Compliance Dashboard', description: 'CACFP audit readiness score and submission rate tracking' },
      ],
    },
    {
      id: 'M06-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'You serve breakfast at 8:00 AM. When should you submit the count? Why is waiting until 9:29 AM risky even though the deadline is 9:30?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'You serve breakfast at 8:00 AM. When should you submit the count? (Answer: by 8:15 AM, not at 9:29 AM)',
    'A substitute teacher doesn\'t know how to submit meal counts. It\'s 1:20 PM and lunch counts haven\'t been submitted. What do you do?',
    'The center missed 5 lunch counts last month. Using the rate of $4 per child and 30 children per lunch, how much revenue was lost? (Answer: 5 x 30 x $4 = $600)',
  ],
  commonMistakes: [
    {
      mistake: 'Waiting until the deadline to submit',
      prevention: 'Submit within 15 minutes of meal end',
    },
    {
      mistake: 'Submitting without reviewing pre-fill',
      prevention: 'Spend 30 seconds reviewing the list before tapping Submit',
    },
    {
      mistake: 'Not knowing the deadlines',
      prevention: 'Post the deadline chart in every classroom',
    },
    {
      mistake: 'Forgetting AM/PM snack counts',
      prevention: 'Snack deadlines are just as real as meal deadlines',
    },
    {
      mistake: 'Counting children who arrived after the meal',
      prevention: 'Only count children who were physically served',
    },
  ],
};
