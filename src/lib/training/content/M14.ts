import { ModuleContent } from '@/types/training';

export const M14Content: ModuleContent = {
  moduleId: 'M14',
  activities: [
    {
      id: 'M14-A1',
      type: 'spotlight',
      title: 'CACFP Reimbursement Is Core Revenue',
      spotlight: {
        concept: 'Your center\'s CACFP reimbursement likely totals $40,000-80,000 per year. An audit failure can suspend it entirely.',
        detail: 'CACFP (Child and Adult Care Food Program) reimburses centers for serving nutritious meals to enrolled children. The compliance dashboard tracks your Audit Readiness Score across five components: meal count accuracy, attendance alignment, menu compliance, documentation completeness, and staff training. A score below 75% puts you at risk of audit failure.',
        whyItMatters: 'A CACFP suspension means covering all food costs out of pocket while the suspension is active. For a center spending $3,000-5,000/month on food, that hits immediately. Some centers never recover financially from a suspension. Weekly compliance checks prevent this.',
      },
    },
    {
      id: 'M14-A2',
      type: 'walkthrough',
      title: 'Read the Compliance Dashboard',
      steps: [
        {
          instruction: 'Go to /admin/compliance. The top section shows your overall Audit Readiness Score (0-100%). Green is 90-100% (audit-ready). Yellow is 75-89% (has gaps). Red is below 75% (at risk).',
          tryItLink: '/admin/compliance',
        },
        {
          instruction: 'Look at the component breakdowns: Meal Count Accuracy, Attendance Alignment, Menu Compliance, Documentation Completeness, and Staff Training. Each is color-coded independently.',
        },
        {
          instruction: 'Tap any component to see specific items that need attention. The Timeline View shows your score trend over weeks and months.',
        },
        {
          instruction: 'Check the estimated reimbursement section. Compare projected vs. actual to identify where money is being left on the table.',
        },
      ],
    },
    {
      id: 'M14-A3',
      type: 'walkthrough',
      title: 'Generate a Compliance Report',
      steps: [
        {
          instruction: 'From /admin/compliance, tap "Generate Report." Select the date range: weekly, monthly, or custom.',
          tryItLink: '/admin/compliance',
        },
        {
          instruction: 'The report includes meal count submission rates by classroom, attendance-to-meal-count alignment percentage, missing or incomplete records, estimated reimbursement, and items flagged for corrective action.',
        },
        {
          instruction: 'Export as PDF for your records or for sharing with your CACFP sponsor. Save a copy every month.',
          tryItLink: '/admin/food-counts',
        },
      ],
    },
    {
      id: 'M14-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'Your audit readiness score dropped from 92% to 78% in two weeks. A CACFP reviewer calls and says they will visit next Thursday. What are your first three actions?',
        options: [
          {
            text: 'Panic, then try to fix everything the night before',
            isCorrect: false,
            feedback: 'Last-minute fixes create errors. You have a week of lead time. Use it systematically by identifying the specific components that dropped and addressing them in order of impact.',
          },
          {
            text: 'Check which components dropped, fix missing documentation first, then verify meal count alignment, and run a compliance report to confirm improvement',
            isCorrect: true,
            feedback: 'Correct. Open the dashboard, identify the red and yellow components, address documentation gaps first (these are the easiest to fix), verify attendance-meal count alignment, and generate a fresh report to confirm your score is recovering.',
          },
          {
            text: 'Call the reviewer and ask to reschedule',
            isCorrect: false,
            feedback: 'Rescheduling looks evasive and does not fix the underlying problems. Use the time you have to address the actual compliance gaps.',
          },
          {
            text: 'Blame the staff for missing meal counts and hold an emergency meeting',
            isCorrect: false,
            feedback: 'Blame does not fix compliance gaps. The dashboard shows you exactly what is wrong. Fix the data first, then build better habits to prevent recurrence.',
          },
        ],
      },
    },
    {
      id: 'M14-A5',
      type: 'explore',
      title: 'Compliance Pages',
      pages: [
        { path: '/admin/compliance', name: 'Compliance Dashboard', description: 'Audit readiness score, component breakdowns, and trend timeline' },
        { path: '/admin/food-counts', name: 'Food Count Dashboard', description: 'Daily meal count submissions with deadline tracking and reimbursement estimates' },
      ],
    },
    {
      id: 'M14-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Why is the attendance-to-meal-count alignment so important? What happens if a child is marked absent but has a meal count, or vice versa?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Your audit readiness score dropped from 92% to 78% in two weeks. What are the first three things you check?',
    'A CACFP reviewer calls and says they will visit next Thursday. What do you do between now and then?',
    'Why is the attendance-to-meal-count alignment so important? (Answer: if a child is marked absent but has a meal count, that is fraud. If a child is present but has no meal count, that is lost revenue. Either way, you lose.)',
  ],
  commonMistakes: [
    {
      mistake: 'Only checking compliance before an audit',
      prevention: 'Check the compliance dashboard every Monday morning',
    },
    {
      mistake: 'Ignoring yellow-flagged items',
      prevention: 'Address every yellow item within the same week',
    },
    {
      mistake: 'Not training substitutes on CACFP procedures',
      prevention: 'Include CACFP basics in every substitute orientation',
    },
    {
      mistake: 'Assuming attendance and meal counts match automatically',
      prevention: 'Run the alignment check weekly',
    },
    {
      mistake: 'Not saving compliance reports',
      prevention: 'Generate and save a monthly report every month',
    },
  ],
};
