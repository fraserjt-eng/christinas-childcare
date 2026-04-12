import { ModuleContent } from '@/types/training';

export const M29Content: ModuleContent = {
  moduleId: 'M29',
  activities: [
    {
      id: 'M29-A1',
      type: 'spotlight',
      title: 'Manage by Exception, Not by Presence',
      spotlight: {
        concept: 'An owner driving between two locations to "check on things" spends 10+ hours per week on oversight the dashboard handles from a phone screen',
        detail: 'The cross-site operations dashboard shows both centers side by side with real-time data: attendance, ratios, tasks, meal counts, staffing, incidents, and messages. A traffic light system (green/yellow/red) highlights exceptions that need attention. The morning routine: scan for red, address red, check yellow, ignore green.',
        whyItMatters: 'Traditional management reviews everything and checks on everyone. Management by exception reserves your attention for things that are off-track, unexpected, or require your authority. Three 5-minute dashboard checks per day replaces hours of driving and in-person supervision.',
      },
    },
    {
      id: 'M29-A2',
      type: 'walkthrough',
      title: 'Use the Operations Dashboard',
      steps: [
        {
          instruction: 'Go to /admin/operations. The dual-center view shows both locations side by side. Each panel displays attendance, ratio status, open tasks, meal count status, staffing, incidents, and messages.',
          tryItLink: '/admin/operations',
        },
        {
          instruction: 'Scan for red indicators first. These require immediate action: ratio violations, missed CACFP deadlines, or incident reports. Address these before anything else.',
        },
        {
          instruction: 'Check yellow indicators next. These are approaching thresholds or have minor issues. The director at that center should be able to handle these. Message them if needed.',
        },
        {
          instruction: 'Green means normal operations. Trust the system and your directors. No action needed.',
        },
      ],
    },
    {
      id: 'M29-A3',
      type: 'walkthrough',
      title: 'Compare Site Performance',
      steps: [
        {
          instruction: 'Click "Compare" on the operations dashboard for side-by-side metrics: average daily attendance, CACFP capture rate, incident response time, task completion rate, parent message response time, staff overtime, and budget variance.',
          tryItLink: '/admin',
        },
        {
          instruction: 'Look for gaps greater than 15% between sites. These indicate one center is performing significantly differently and warrants investigation.',
        },
        {
          instruction: 'Set custom alerts for non-negotiable items: ratio violations, incident reports, and CACFP deadline misses. These should always notify you regardless of which center they occur at.',
        },
      ],
    },
    {
      id: 'M29-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is 8:15 AM. You open the operations dashboard from home. Center A shows all green. Center B shows a yellow indicator on ratios (the Infant Room is one child away from the limit) and a red indicator (a meal count deadline was missed for breakfast). What do you do?',
        options: [
          {
            text: 'Drive to Center B immediately',
            isCorrect: false,
            feedback: 'The missed meal count is already gone; driving there does not recover it. The ratio concern is yellow, meaning the director can handle it. Your time is better spent on a phone call or message.',
          },
          {
            text: 'Message the Center B director about the missed breakfast count (find out why and prevent recurrence) and ask them to monitor the Infant Room ratio and send coverage if another child arrives',
            isCorrect: true,
            feedback: 'Correct. The red item (missed count) needs investigation: who was responsible, what happened, how to prevent it. The yellow item (ratio) needs monitoring and a plan. Both can be handled by the director with your guidance.',
          },
          {
            text: 'Ignore it since the director should handle it without your involvement',
            isCorrect: false,
            feedback: 'A red indicator means something failed. Ignoring it sends the message that missed deadlines are acceptable. Follow up, but trust the director to execute the fix.',
          },
          {
            text: 'Call an emergency staff meeting at Center B',
            isCorrect: false,
            feedback: 'One missed meal count does not warrant an emergency meeting. It warrants a conversation with the person responsible and a process check. Over-reacting creates anxiety without solving the root cause.',
          },
        ],
      },
    },
    {
      id: 'M29-A5',
      type: 'explore',
      title: 'Operations Pages',
      pages: [
        { path: '/admin/operations', name: 'Operations Dashboard', description: 'Dual-center view with traffic light status, site comparison, and exception drill-down' },
        { path: '/admin', name: 'Admin Home', description: 'Center-wide overview with key metrics and alert banners' },
      ],
    },
    {
      id: 'M29-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'How many hours per week do you currently spend physically present at each location? What would you do with 5 of those hours back?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'How many hours per week do you currently spend physically present at each location? What would you do with 5 of those hours back?',
    'Think about the last time you intervened at a center. Was it a genuine emergency, or could the director have handled it with the right tools and authority?',
    'What would need to be true for you to trust the dashboard enough to start your morning from home one day per week?',
  ],
  commonMistakes: [
    {
      mistake: 'Checking the dashboard every 15 minutes',
      prevention: 'Set specific check-in times: 8 AM, noon, 4 PM. Three checks per day is enough unless you receive an alert.',
    },
    {
      mistake: 'Overriding the director when a metric turns yellow',
      prevention: 'Yellow is the director\'s domain. Intervene only when yellow turns red or stays yellow for more than 4 hours.',
    },
    {
      mistake: 'Ignoring the dashboard because "I know my centers"',
      prevention: 'The dashboard knows them in real time. It catches things you miss when you are at the other location.',
    },
    {
      mistake: 'Using the dashboard for surveillance instead of support',
      prevention: 'Share the same view with directors so they see what you see. Transparency builds trust.',
    },
  ],
};
