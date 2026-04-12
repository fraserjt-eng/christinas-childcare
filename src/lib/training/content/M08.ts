import { ModuleContent } from '@/types/training';

export const M08Content: ModuleContent = {
  moduleId: 'M08',
  activities: [
    {
      id: 'M08-A1',
      type: 'spotlight',
      title: 'Tasks Create Accountability',
      spotlight: {
        concept: 'The task system keeps daily operations organized with priority levels and real-time tracking',
        detail: 'Employees see their tasks and complete them. Directors create, assign, and monitor tasks. Tasks are sorted by priority (Critical, High, Normal, Low) and color-coded: red for critical, orange for high, blue for normal, gray for low. The nap-time task optimizer suggests which tasks to tackle first based on available time.',
        whyItMatters: 'Without a task system, directors spend 30+ minutes per day verbally assigning work and checking whether it was done. Written tasks with deadlines eliminate "I forgot" and "nobody told me." Task completion data also supports performance conversations with concrete evidence.',
      },
    },
    {
      id: 'M08-A2',
      type: 'walkthrough',
      title: 'Complete a Task as an Employee',
      steps: [
        {
          instruction: 'Go to /employee/tasks within 5 minutes of clocking in. Your task board shows tasks assigned to you, sorted by priority and due time.',
          tryItLink: '/employee/tasks',
        },
        {
          instruction: 'Read each task card. Note the priority level (color-coded), due time, and who assigned it.',
        },
        {
          instruction: 'Tap a task card to see the full details and instructions. Do the work described.',
        },
        {
          instruction: 'When finished, tap "Mark Complete." Add a note if anything unusual happened (e.g., "supply room was locked, completed after maintenance opened it"). Completed tasks move to the "Done" section.',
        },
      ],
    },
    {
      id: 'M08-A3',
      type: 'walkthrough',
      title: 'Create and Assign a Task (Directors)',
      steps: [
        {
          instruction: 'Go to /admin/tasks. The dashboard shows all tasks across the center by status, assignee, and priority.',
          tryItLink: '/admin/tasks',
        },
        {
          instruction: 'Tap "New Task." Enter a specific, actionable title (e.g., "Sanitize infant room toys" not "clean stuff"). Add a description with clear instructions.',
        },
        {
          instruction: 'Set the priority level (Critical, High, Normal, Low). Assign to a specific employee or role. Set a due date, time, and time block if applicable.',
        },
        {
          instruction: 'Tap "Create." The assigned employee sees the task on their /employee/tasks page immediately. Monitor completion from /admin/tasks. Overdue tasks show in red.',
        },
      ],
    },
    {
      id: 'M08-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is nap time. You have 90 minutes. Your task board shows 5 tasks. The top one is "High" priority and will take 45 minutes. The second is "Critical" priority but only takes 10 minutes. Which do you do first?',
        options: [
          {
            text: 'Start with the High priority task since it is listed first',
            isCorrect: false,
            feedback: 'Task board order can be misleading. Critical tasks always come before High tasks, regardless of position on the list. A 10-minute Critical task should be handled first.',
          },
          {
            text: 'Do the Critical task first since it outranks High and takes less time',
            isCorrect: true,
            feedback: 'Correct. Critical tasks take precedence. Completing a 10-minute Critical task first ensures the most urgent item is handled, and you still have 80 minutes for the High priority task.',
          },
          {
            text: 'Skip both and do the easiest tasks to build momentum',
            isCorrect: false,
            feedback: 'Priority levels exist for a reason. A Critical task left incomplete could affect child safety, licensing, or compliance. Do not skip it for easier work.',
          },
          {
            text: 'Ask the director which one to do first',
            isCorrect: false,
            feedback: 'The priority system already answers this question. Critical outranks High. Use the system to make decisions without needing to interrupt the director.',
          },
        ],
      },
    },
    {
      id: 'M08-A5',
      type: 'explore',
      title: 'Task Pages',
      pages: [
        { path: '/admin/tasks', name: 'Task Dashboard', description: 'Create, assign, and monitor all tasks across the center with priority filtering' },
        { path: '/employee/tasks', name: 'My Tasks', description: 'Your assigned to-do list sorted by priority and due time' },
        { path: '/employee/nap-tasks', name: 'Nap-Time Tasks', description: 'Tasks optimized for the nap window, ordered by priority and estimated time' },
      ],
    },
    {
      id: 'M08-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What makes a well-written task? What makes a poorly-written one? Think of an example of each from your own experience.',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'It\'s nap time. You have 90 minutes. Your task board shows 5 tasks. The top one is "High" priority but will take 45 minutes. The second is "Critical" but only takes 10 minutes. Which do you do first and why?',
    'A task says "organize supply closet" but you can\'t find the supply closet key. What do you do? (Answer: add a note to the task, message the director, move on to the next task)',
    'What makes a well-written task? What makes a poorly-written one?',
    'How do you decide what to delegate vs. what to handle yourself?',
    'How would you use the task assessment data without making it feel punitive?',
  ],
  commonMistakes: [
    {
      mistake: 'Not checking the task board at shift start',
      prevention: 'Open /employee/tasks within 5 minutes of clocking in',
    },
    {
      mistake: 'Marking a task complete without doing it',
      prevention: 'Only mark complete when the work is actually done',
    },
    {
      mistake: 'Creating vague tasks (directors)',
      prevention: 'Write specific, actionable titles: who, what, where',
    },
    {
      mistake: 'Over-assigning to one person',
      prevention: 'Check the assignee view before creating new tasks',
    },
    {
      mistake: 'Ignoring overdue tasks (directors)',
      prevention: 'Review overdue tasks daily; reassign or adjust deadlines',
    },
  ],
};
