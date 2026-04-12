import { ModuleContent } from '@/types/training';

export const M16Content: ModuleContent = {
  moduleId: 'M16',
  activities: [
    {
      id: 'M16-A1',
      type: 'spotlight',
      title: 'Thirty Minutes Is the Filing Window',
      spotlight: {
        concept: 'Every incident affecting a child\'s safety must be documented within 30 minutes, reported promptly, and tracked through resolution',
        detail: 'The incident system uses a severity decision tree (Level 1 Minor through Level 4 Critical) to determine filing urgency and parent notification timing. Every report is timestamped and audit-trailed: who created it, every edit, when the parent was notified, and when it was resolved. This protects both children and staff.',
        whyItMatters: 'Undocumented incidents create legal liability and licensing risk. A parent who discovers their child was hurt but never notified will question every other aspect of your care. A licensing inspector who finds unreported incidents will issue findings. The 30-minute window ensures documentation happens while details are fresh.',
      },
    },
    {
      id: 'M16-A2',
      type: 'walkthrough',
      title: 'File an Incident Report',
      steps: [
        {
          instruction: 'Go to /admin/incidents and tap "File New Incident." Select the child or children involved from the dropdown.',
          tryItLink: '/admin/incidents',
        },
        {
          instruction: 'Record the basics: date and time of the incident (not when you are filing), location, staff present, and any witnesses.',
        },
        {
          instruction: 'Describe what happened factually and chronologically. Good: "At 10:15 AM, Jordan fell from the second step of the climber. He landed on his left side on the rubber surface. He cried immediately. I was standing 4 feet away." Bad: "Jordan fell off something outside. He was fine."',
        },
        {
          instruction: 'Document injuries observed (location, size, color), action taken (first aid, ice, called parent), and assign the severity level using the decision tree: Level 4 Critical, Level 3 Serious, Level 2 Moderate, or Level 1 Minor.',
        },
      ],
    },
    {
      id: 'M16-A3',
      type: 'walkthrough',
      title: 'Review the Incident Log',
      steps: [
        {
          instruction: 'Go to /admin/incidents/log. This page shows all incidents, past and present. Filter by date range, severity, classroom, child, or status.',
          tryItLink: '/admin/incidents/log',
        },
        {
          instruction: 'Look for patterns: same child with repeated incidents (possible developmental concern or environmental issue), same location (possible safety hazard), same time of day (possible staffing gap).',
        },
        {
          instruction: 'Export incident data for licensing reviews or insurance claims. Review the log monthly to identify trends and address root causes.',
        },
      ],
    },
    {
      id: 'M16-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'During nap time, you notice a bruise on a child\'s arm that was not there at drop-off and did not happen at the center. What do you do?',
        options: [
          {
            text: 'Ignore it since it did not happen at the center',
            isCorrect: false,
            feedback: 'You are a mandated reporter. An unexplained bruise that did not occur at the center requires documentation and may require a report to county intake. Ignoring it violates your legal obligation.',
          },
          {
            text: 'Document it immediately, notify the director, and follow your mandated reporting obligations',
            isCorrect: true,
            feedback: 'Correct. Document what you observe (location, size, color, when you noticed it). Notify the director immediately. Follow your mandated reporter training. If abuse or neglect is suspected, report to county intake within 24 hours.',
          },
          {
            text: 'Ask the child what happened and then decide',
            isCorrect: false,
            feedback: 'You are not trained to investigate. Document what you see and notify the director. Questioning the child could compromise a potential investigation.',
          },
          {
            text: 'Wait until pickup and ask the parent about it',
            isCorrect: false,
            feedback: 'Do not wait. Document and notify the director now. If this is a mandated reporting situation, the parent should not be the first person you consult.',
          },
        ],
      },
    },
    {
      id: 'M16-A5',
      type: 'explore',
      title: 'Incident Pages',
      pages: [
        { path: '/admin/incidents', name: 'File Incident Report', description: 'Create new incident reports with severity levels and parent notification' },
        { path: '/admin/incidents/log', name: 'Incident Log', description: 'Historical incident data with filtering, pattern analysis, and export' },
      ],
    },
    {
      id: 'M16-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'A child gets a small scrape on their knee during outdoor play. No bleeding, no tears. Do you file a report? Why or why not?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'A child gets a small scrape on their knee during outdoor play. No bleeding, no tears. Do you file a report? (Answer: Level 1, yes. Document everything.)',
    'During nap time, you notice a bruise on a child\'s arm that was not there at drop-off and did not happen at the center. What do you do?',
    'You filed a report but realized you got the time wrong. Can you change it? (Answer: Yes, edit and correct. The original timestamp and the correction are both preserved in the audit trail.)',
  ],
  commonMistakes: [
    {
      mistake: 'Waiting until end of day to file',
      prevention: 'File within 30 minutes of the incident. Period.',
    },
    {
      mistake: 'Writing vague descriptions',
      prevention: 'Answer who, what, where, when, how. Be specific.',
    },
    {
      mistake: 'Guessing the severity level',
      prevention: 'Use the decision tree every time',
    },
    {
      mistake: 'Not notifying parents for Level 2+',
      prevention: 'Follow the notification protocol for every severity level',
    },
    {
      mistake: 'Editing reports to look better after the fact',
      prevention: 'File honestly the first time. Correct errors with notes, not deletions.',
    },
    {
      mistake: 'Not connecting repeated incidents to a pattern',
      prevention: 'Review the incident log monthly for patterns',
    },
  ],
};
