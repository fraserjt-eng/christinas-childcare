import { ModuleContent } from '@/types/training';

export const M05Content: ModuleContent = {
  moduleId: 'M05',
  activities: [
    {
      id: 'M05-A1',
      type: 'spotlight',
      title: 'Attendance Drives Everything',
      spotlight: {
        concept: 'Attendance tracking connects meal eligibility, ratio compliance, and CACFP reimbursement',
        detail: 'A child who arrives at 10:15 AM was not present for breakfast, so that meal cannot be claimed. The attendance record determines which meals are eligible for federal reimbursement, whether your classroom is within ratio, and whether the daily report is complete. Accurate attendance data is not optional.',
        whyItMatters: 'Inaccurate attendance creates a chain reaction. A missed check-in means a lost meal claim ($2-5). A wrong head count means a potential ratio violation ($500-5,000 fine). Over a month, sloppy attendance tracking can cost thousands in lost revenue and put your license at risk.',
      },
    },
    {
      id: 'M05-A2',
      type: 'walkthrough',
      title: 'Review Attendance as a Director',
      steps: [
        {
          instruction: 'Go to /admin/attendance. The top section shows center-wide numbers: total enrolled, present today, absent, and not yet arrived.',
          tryItLink: '/admin/attendance',
        },
        {
          instruction: 'Look at each classroom card below. Each shows the classroom name, staff assigned vs. present, children present vs. enrolled, and the current ratio (color-coded: green, yellow, or red).',
        },
        {
          instruction: 'Tap any classroom card to see the child-by-child list with individual check-in times.',
        },
        {
          instruction: 'Check the "Expected but Not Arrived" section. These are children with no check-in and no absence notification by 9:30 AM. Follow up on each one.',
        },
      ],
    },
    {
      id: 'M05-A3',
      type: 'walkthrough',
      title: 'Monitor Ratios from Attendance',
      steps: [
        {
          instruction: 'Go to /admin/ratios. This page shows the same attendance data but focused on staff-to-child ratios per classroom.',
          tryItLink: '/admin/ratios',
        },
        {
          instruction: 'Look at the color indicators for each classroom. Green means compliant. Yellow means one child or one staff change could trigger a violation. Red means you are at or over the limit.',
        },
        {
          instruction: 'If any classroom shows yellow or red, take action immediately: move a child, send another staff member, or call for coverage.',
        },
      ],
    },
    {
      id: 'M05-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is 9:45 AM. Three toddlers in your classroom have not arrived and nobody has called. Your meal count for breakfast is due, and you are not sure whether to count them. What do you do?',
        options: [
          {
            text: 'Include them in the breakfast count since they are enrolled',
            isCorrect: false,
            feedback: 'You can only count children who were physically present and served the meal. Counting absent children is a CACFP violation that could trigger an audit finding.',
          },
          {
            text: 'Submit the breakfast count for children who are present, then contact the director about the missing children',
            isCorrect: true,
            feedback: 'Correct. Submit the count for children actually served. Then follow up on the missing children. The director should check messages and call families who have not communicated.',
          },
          {
            text: 'Wait until the children arrive before submitting the count',
            isCorrect: false,
            feedback: 'The breakfast submission deadline is 9:30 AM. Waiting risks missing the deadline entirely, which loses reimbursement for every child who did eat.',
          },
          {
            text: 'Mark them as absent and move on without telling anyone',
            isCorrect: false,
            feedback: 'You should always notify the director when children are expected but not arrived with no communication. This could be a welfare concern or a pickup issue.',
          },
        ],
      },
    },
    {
      id: 'M05-A5',
      type: 'explore',
      title: 'Attendance Pages',
      pages: [
        { path: '/admin/attendance', name: 'Attendance Dashboard', description: 'Real-time attendance by classroom with check-in times and absence tracking' },
        { path: '/admin/ratios', name: 'Ratio Monitor', description: 'Staff-to-child ratio status by classroom with color-coded compliance indicators' },
      ],
    },
    {
      id: 'M05-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'A parent drops off at 10:30 AM and asks, "Did my child get counted for breakfast?" How do you answer, and where do you find the information?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'It\'s 9:45 AM and three children in the Toddler Room haven\'t arrived. No one has called. What do you do?',
    'A parent drops off at 10:30 AM and asks, "Did my child get counted for breakfast?" How do you answer?',
    'Why is the 9:30 AM attendance check a habit and not just a suggestion?',
  ],
  commonMistakes: [
    {
      mistake: 'Not checking attendance at 9:30 AM',
      prevention: 'Set a daily phone alarm for 9:30 AM',
    },
    {
      mistake: 'Assuming a child is absent without confirmation',
      prevention: 'Always verify: check messages, call the parent',
    },
    {
      mistake: 'Ignoring the ratio implications',
      prevention: 'Watch the ratio indicator on the attendance card',
    },
    {
      mistake: 'Not documenting late arrivals',
      prevention: 'The kiosk timestamps everything; make sure every late arrival goes through it',
    },
  ],
};
