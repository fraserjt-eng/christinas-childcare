import { ModuleContent } from '@/types/training';

export const M30Content: ModuleContent = {
  moduleId: 'M30',
  activities: [
    {
      id: 'M30-A1',
      type: 'spotlight',
      title: 'A Strategic Plan Is a Living List, Not a Filed Document',
      spotlight: {
        concept: 'Everything from Units 1-7 feeds into strategic planning. Budget data informs priorities. Pipeline data reveals growth opportunities. Staff metrics surface improvements.',
        detail: 'The strategic planning page has four sections: Foundation (mission, vision, values), Analysis (SWOT assessment with data-driven suggestions), Priorities (strategic goals with timelines and owners), and Action Items (tasks that flow directly to the task board). The meeting efficiency tool ensures leadership meetings produce decisions and accountability.',
        whyItMatters: 'A strategic plan with no dates is a wish list. A meeting with no action items is a conversation. The system connects planning to execution: every priority gets a measurable target, every action item gets an owner and a deadline, and the task board tracks completion.',
      },
    },
    {
      id: 'M30-A2',
      type: 'walkthrough',
      title: 'Build Your Strategic Plan',
      steps: [
        {
          instruction: 'Go to /admin/strategic. Start with the Foundation section: write your mission (what you do and who you serve, 1-2 sentences), vision (what success looks like in 3-5 years), and values (3-5 principles that guide decisions).',
          tryItLink: '/admin/strategic',
        },
        {
          instruction: 'Click "SWOT Analysis" to open the four-quadrant tool. Add items to Strengths, Weaknesses, Opportunities, and Threats. Review the data-driven suggestions the system generates from your platform data.',
        },
        {
          instruction: 'Click "Add Priority" to create strategic goals. Each priority needs: a specific goal statement, category (Growth, Operations, Financial, Quality, Compliance), timeline, owner, and key metrics. Start with 3-5 priorities for this quarter.',
        },
        {
          instruction: 'For each priority, create action items. These automatically appear on the task board with owners and deadlines. This is how "we talked about it" becomes "it actually happened."',
        },
      ],
    },
    {
      id: 'M30-A3',
      type: 'walkthrough',
      title: 'Run an Efficient Leadership Meeting',
      steps: [
        {
          instruction: 'Go to /admin/meetings. Click "New Meeting" and create an agenda with time blocks (5, 10, or 15 minutes per item). Assign agenda items to presenters.',
          tryItLink: '/admin/meetings',
        },
        {
          instruction: 'During the meeting: the timer tracks each agenda item. Add notes directly in the system. Create action items in real time. Use the parking lot for off-topic items.',
        },
        {
          instruction: 'After the meeting: the summary auto-generates with decisions, action items, and owners. Action items push to the task board. Follow-up reminders auto-send before the next meeting.',
          tryItLink: '/admin/meetings/efficiency',
        },
      ],
    },
    {
      id: 'M30-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'During your quarterly SWOT refresh, the system suggests: "Tour-to-enroll conversion is 32% (below 50% benchmark)." You have 3 strategic priorities already. Should you add a fourth?',
        options: [
          {
            text: 'Yes, add it immediately since 32% is well below benchmark',
            isCorrect: false,
            feedback: 'Adding a fourth priority without evaluating your current three risks spreading attention too thin. If everything is a priority, nothing is. Evaluate whether one of your existing priorities can absorb this, or whether it should replace one.',
          },
          {
            text: 'Review your current 3 priorities. If one is complete or no longer relevant, replace it. If all 3 are active and critical, note the conversion gap for next quarter.',
            isCorrect: true,
            feedback: 'Correct. Three to five priorities per quarter is the limit. If your current priorities are all active, log the conversion gap as a future priority. If one is complete, the tour conversion improvement is a strong candidate to replace it.',
          },
          {
            text: 'Ignore the suggestion since the system does not understand your context',
            isCorrect: false,
            feedback: 'The system is surfacing real data. A 32% conversion rate means you need 16 tours to enroll 5 families. Ignoring the data does not make the problem go away. Acknowledge it and plan for it.',
          },
          {
            text: 'Delegate it to the director without adding it as a formal priority',
            isCorrect: false,
            feedback: 'Delegation without priority status means it has no measurable target, no timeline, and no accountability. It will drift. Either make it a priority or plan it for next quarter.',
          },
        ],
      },
    },
    {
      id: 'M30-A5',
      type: 'explore',
      title: 'Strategic Planning Pages',
      pages: [
        { path: '/admin/strategic', name: 'Strategic Planning', description: 'Mission, vision, SWOT analysis, strategic priorities, and action items' },
        { path: '/admin/meetings', name: 'Meeting Tool', description: 'Agenda builder, meeting timer, action item tracking, and auto-generated summaries' },
        { path: '/admin/meetings/efficiency', name: 'Meeting Efficiency', description: 'Meeting analytics, action item completion rates, and time-per-agenda tracking' },
      ],
    },
    {
      id: 'M30-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What is the one strategic priority that, if you accomplished it in the next 90 days, would have the biggest impact on your business? Write it down right now with a number and a date.',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What is the one strategic priority that, if you accomplished it in the next 90 days, would have the biggest impact on your business? Write it down right now.',
    'How many leadership meetings in the past year produced action items that were actually completed? What is different about the ones that were?',
    'If you had to explain your 3-year vision for these two centers in two sentences, what would you say? Does your daily work align with that vision?',
  ],
  commonMistakes: [
    {
      mistake: 'Setting too many priorities',
      prevention: 'Three to five priorities per quarter. If everything is a priority, nothing is.',
    },
    {
      mistake: 'Writing vague goals',
      prevention: 'Every goal needs a number and a date. "Improve enrollment" becomes "Enroll 5 new families by June 30."',
    },
    {
      mistake: 'Conducting SWOT without data',
      prevention: 'Pull platform data first. Gut feeling confirms data; it does not replace it.',
    },
    {
      mistake: 'Skipping the quarterly review',
      prevention: 'Strategic drift is invisible until it is not. The quarterly review takes 60 minutes and prevents months of misalignment.',
    },
    {
      mistake: 'Creating action items without owners',
      prevention: 'No owner means nobody is accountable. Every action item gets a name and a date.',
    },
    {
      mistake: 'Having meetings without the meeting tool',
      prevention: 'Unstructured meetings run long and leave no record. The meeting tool is a 2-minute setup that saves 20 minutes.',
    },
  ],
};
