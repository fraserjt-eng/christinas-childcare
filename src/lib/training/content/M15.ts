import { ModuleContent } from '@/types/training';

export const M15Content: ModuleContent = {
  moduleId: 'M15',
  activities: [
    {
      id: 'M15-A1',
      type: 'spotlight',
      title: 'Ratio Violations Are Immediate Fines',
      spotlight: {
        concept: 'A single documented ratio violation during a licensing inspection can result in a $500-5,000 fine or license suspension',
        detail: 'Staff-to-child ratios are set by state law. Minnesota requires 1:4 for infants, 1:7 for toddlers, 1:10 for preschool, and 1:15 for school-age. The platform monitors ratios in real time with color-coded indicators: green (compliant), yellow (one change away from violation), and red (at or over the limit). Ratios apply during nap time too.',
        whyItMatters: 'The cost of a ratio violation is immediate and severe. Beyond the fine, a corrective action plan restricts your flexibility, and repeat violations can suspend your license. Real-time monitoring lets you act before a violation happens, not after an inspector finds one.',
      },
    },
    {
      id: 'M15-A2',
      type: 'walkthrough',
      title: 'Monitor Ratios in Real Time',
      steps: [
        {
          instruction: 'Go to /admin/ratios. The dashboard shows every classroom as a card with the classroom name, age group, children present, staff present, current ratio, and status color.',
          tryItLink: '/admin/ratios',
        },
        {
          instruction: 'Look at the Projection View. This shows how ratios will change throughout the day based on scheduled arrivals, departures, and staff shift changes. Use this to anticipate problems before they happen.',
        },
        {
          instruction: 'Check when alerts trigger: yellow at 90% of ratio capacity, red when the limit is met or exceeded, and immediate alerts when a staff member clocks out or is marked absent.',
        },
      ],
    },
    {
      id: 'M15-A3',
      type: 'walkthrough',
      title: 'Check Attendance Impact on Ratios',
      steps: [
        {
          instruction: 'Go to /admin/attendance. Each classroom card shows staff assigned vs. staff present and children present vs. enrolled, with the current ratio color-coded.',
          tryItLink: '/admin/attendance',
        },
        {
          instruction: 'Notice how attendance changes throughout the day affect ratios. Morning arrivals, staff breaks, and afternoon departures all shift the numbers.',
        },
        {
          instruction: 'If a classroom shows yellow or red, take action: move a child to another room, send another staff member, or call for backup coverage. Do not wait.',
        },
      ],
    },
    {
      id: 'M15-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is 2:30 PM. One of your two preschool teachers just left for the day. You have 18 preschool children present. The required ratio is 1:10. What is your ratio, and what do you do?',
        options: [
          {
            text: 'You are at 1:18, which is over ratio. Move 8 children to another room immediately.',
            isCorrect: false,
            feedback: 'You should not move children between rooms without director approval. And the correct action is to add staff, not relocate children, unless the director decides otherwise.',
          },
          {
            text: 'You are at 1:18, which is over ratio. Stay in the room, contact the director immediately, and wait for either another staff member or for some children to be moved.',
            isCorrect: true,
            feedback: 'Correct. You are at 1:18 with one teacher and 18 children. The limit is 1:10. Do not leave the room. Contact the director immediately. They will send coverage or redistribute children.',
          },
          {
            text: 'You are at 1:18 but nap time is about to start, so it is fine',
            isCorrect: false,
            feedback: 'Ratios apply during nap time. There is no exception for sleeping children. You are over ratio regardless of what the children are doing.',
          },
          {
            text: 'You are close to ratio but probably fine until the next teacher arrives',
            isCorrect: false,
            feedback: '1:18 is nearly double the 1:10 requirement. This is not "close." It is a clear violation that must be addressed immediately.',
          },
        ],
      },
    },
    {
      id: 'M15-A5',
      type: 'explore',
      title: 'Ratio Pages',
      pages: [
        { path: '/admin/ratios', name: 'Ratio Dashboard', description: 'Real-time ratio monitoring by classroom with projection view and automated alerts' },
        { path: '/admin/attendance', name: 'Attendance Dashboard', description: 'Attendance data that feeds into ratio calculations with staff tracking' },
      ],
    },
    {
      id: 'M15-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'During nap time, can one teacher leave the room while another watches all 14 toddlers? Why or why not?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'It is 2:30 PM. One of your two preschool teachers just left for the day. You have 18 preschool children present. What is your ratio? Are you in compliance? What do you do?',
    'A parent drops off unexpectedly at 10 AM with a child who wasn\'t on today\'s attendance list. Does this affect your ratios?',
    'During nap time, can one teacher leave the room while another watches all 14 toddlers? (Answer: No. Ratios apply during nap time.)',
  ],
  commonMistakes: [
    {
      mistake: 'Assuming nap time doesn\'t count',
      prevention: 'Ratios are 24/7 while children are present',
    },
    {
      mistake: 'Not accounting for staff breaks',
      prevention: 'Stagger breaks so coverage is maintained',
    },
    {
      mistake: 'Ignoring the yellow warning',
      prevention: 'Address yellow immediately; don\'t wait for red',
    },
    {
      mistake: 'Moving children between rooms without telling the director',
      prevention: 'All room moves go through the director',
    },
    {
      mistake: 'Relying on memory instead of the dashboard',
      prevention: 'Check /admin/ratios at every transition point',
    },
  ],
};
