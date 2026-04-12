import { ModuleContent } from '@/types/training';

export const M18Content: ModuleContent = {
  moduleId: 'M18',
  activities: [
    {
      id: 'M18-A1',
      type: 'spotlight',
      title: 'Every Scheduling Decision Is a Financial Decision',
      spotlight: {
        concept: 'Labor is 56% of expenses. The scheduling tool checks ratios and costs in real time.',
        detail: 'Most directors spend 45 minutes to 2 hours building a weekly schedule manually. The drag-and-drop scheduling tool reduces that to 15 minutes. As you place staff, ratio bars update in real time, overtime indicators appear when someone approaches 40 hours, and the cost view shows projected labor expense per day and per week.',
        whyItMatters: 'A scheduling error that puts one employee into overtime costs $150-300 per week. A scheduling gap that creates a ratio violation costs $500-5,000 in fines. The tool catches both problems before you publish, turning invisible mistakes into visible warnings.',
      },
    },
    {
      id: 'M18-A2',
      type: 'walkthrough',
      title: 'Build a Weekly Schedule',
      steps: [
        {
          instruction: 'Go to /admin/scheduling. You see the current week\'s schedule in a grid view: classrooms across the top, time blocks down the side, staff names in the cells.',
          tryItLink: '/admin/scheduling',
        },
        {
          instruction: 'Click "Next Week" to start a new schedule. The system offers to copy the current week as a starting point. Accept this for your first time.',
        },
        {
          instruction: 'The staff roster appears in a sidebar panel. Each person shows their role, certified age groups, and weekly hours. Drag a name from the roster into a classroom/time block cell. Green means valid. Yellow means ratio concern. Red means violation.',
        },
        {
          instruction: 'Switch to "Cost View" in the toolbar. Check for overtime indicators (orange clock icon on anyone approaching 40 hours). Adjust assignments to avoid unplanned overtime.',
        },
        {
          instruction: 'When all cells are filled and all ratio indicators are green, click "Publish." Staff receive a notification on their employee portal.',
        },
      ],
    },
    {
      id: 'M18-A3',
      type: 'walkthrough',
      title: 'View Your Schedule (Employees)',
      steps: [
        {
          instruction: 'Go to /employee/schedule. You see your upcoming shifts with dates, times, and classroom assignments.',
          tryItLink: '/employee/schedule',
        },
        {
          instruction: 'Check your published schedule every Thursday after it is released. Look for any changes from the previous week.',
        },
        {
          instruction: 'If you need time off or a schedule change, use the Schedule Request section from the employee portal. Coverage requests go to the director\'s notification bell.',
        },
      ],
    },
    {
      id: 'M18-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'Someone calls in sick at 6 AM on Monday. You need coverage for their 7 AM to 3 PM shift in the Toddler Room. Your scheduling tool shows one available floater, but she has already worked 36 hours this week. What do you do?',
        options: [
          {
            text: 'Assign the floater for the full 8-hour shift',
            isCorrect: false,
            feedback: 'That puts her at 44 hours, triggering 4 hours of overtime at 1.5x pay. Check if there is a way to split the coverage.',
          },
          {
            text: 'Split the shift: assign the floater for 4 hours (staying at 40) and find a second person or adjust classroom assignments for the afternoon',
            isCorrect: true,
            feedback: 'Correct. Keeping the floater at 40 hours avoids overtime. For the afternoon, you can reassign a staff member from a lower-ratio room or call a substitute.',
          },
          {
            text: 'Leave the classroom short-staffed and hope the children behave',
            isCorrect: false,
            feedback: 'The Toddler Room requires 1:7 ratio. Running short-staffed is a licensing violation. Coverage is mandatory.',
          },
          {
            text: 'Call a parent to keep their child home today',
            isCorrect: false,
            feedback: 'Asking families to keep children home because of a staffing problem erodes trust and costs tuition revenue. Find coverage.',
          },
        ],
      },
    },
    {
      id: 'M18-A5',
      type: 'explore',
      title: 'Scheduling Pages',
      pages: [
        { path: '/admin/scheduling', name: 'Scheduling Dashboard', description: 'Drag-and-drop schedule builder with ratio checking and cost view' },
        { path: '/admin/schedule-optimizer', name: 'Schedule Optimizer', description: 'Automated suggestions for coverage gaps and overtime reduction' },
        { path: '/employee/schedule', name: 'My Schedule', description: 'Employee view of upcoming shifts, schedule requests, and time-off' },
      ],
    },
    {
      id: 'M18-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'If you could see that a staff member is heading toward overtime by Wednesday, what would you do differently for Thursday and Friday?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Right now, what happens when someone calls in sick at 6 AM? Walk through your current process from phone call to coverage. Where does it break down?',
    'If you could see that a staff member is heading toward overtime by Wednesday, what would you do differently for Thursday and Friday?',
    'How would you use the cost view to have a conversation with the owner about hiring a part-time floater?',
  ],
  commonMistakes: [
    {
      mistake: 'Scheduling the same person in two classrooms at once',
      prevention: 'System warns with a red overlap indicator. Always check the "Conflicts" panel before publishing.',
    },
    {
      mistake: 'Ignoring yellow ratio warnings',
      prevention: 'Yellow means one absence puts you out of compliance. Treat yellow as a problem to solve.',
    },
    {
      mistake: 'Publishing without checking overtime',
      prevention: 'Always switch to Cost View before publishing. Make it the last step every time.',
    },
    {
      mistake: 'Not using the copy-from-last-week feature',
      prevention: 'After your first good week, use "Copy Week" as your starting template.',
    },
  ],
};
