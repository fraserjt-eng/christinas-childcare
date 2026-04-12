import { ModuleContent } from '@/types/training';

export const M19Content: ModuleContent = {
  moduleId: 'M19',
  activities: [
    {
      id: 'M19-A1',
      type: 'spotlight',
      title: 'If It Is Not Documented, It Did Not Happen',
      spotlight: {
        concept: 'HR documentation protects the center against wrongful termination claims, unemployment disputes, and licensing investigations',
        detail: 'The HR system provides templates for written warnings, performance improvement plans, attendance notices, policy acknowledgments, offer letters, and separation notices. Each document moves through a workflow: Draft, Sent, Signed, Filed. Discipline records have escalation tracking showing the progression from verbal warning to termination, with each step referencing the previous one.',
        whyItMatters: 'Without documentation, the center has no defense against claims. A verbal coaching conversation that was never written down does not exist in a legal proceeding. Templates include legally protective language that free-text writing often misses. Digital signatures create a verifiable record.',
      },
    },
    {
      id: 'M19-A2',
      type: 'walkthrough',
      title: 'Navigate the HR Dashboard',
      steps: [
        {
          instruction: 'Go to /admin/hr. The dashboard shows active employees with document status indicators, pending documents requiring signatures, expiring certifications, and recent HR actions.',
          tryItLink: '/admin/hr',
        },
        {
          instruction: 'Click any employee to see their complete document history: warnings, performance plans, policy acknowledgments, and certification records.',
        },
        {
          instruction: 'Note the escalation tracking for discipline records. The system shows the chain: verbal warning, written warning, final warning, termination. Each step references the previous one.',
        },
      ],
    },
    {
      id: 'M19-A3',
      type: 'walkthrough',
      title: 'Create a Document from a Template',
      steps: [
        {
          instruction: 'From /admin/hr, click "New Document." Choose a template: Written Warning, Performance Improvement Plan, Attendance Notice, Policy Acknowledgment, Offer Letter, or Separation Notice.',
          tryItLink: '/admin/staff',
        },
        {
          instruction: 'Select the employee and fill in the specifics. The template provides the structure and required legal language. You add the facts: date, what happened, what policy it relates to, what was discussed, what the employee said, and what happens next.',
        },
        {
          instruction: 'Save as draft, then send through the system. The employee receives the document on their portal and signs digitally. The signed document is filed automatically.',
        },
      ],
    },
    {
      id: 'M19-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'An employee has been arriving 10-15 minutes late three times in the past two weeks. You talked to them about it verbally last week, but the pattern continues. What is your next step?',
        options: [
          {
            text: 'Talk to them again verbally and hope it improves',
            isCorrect: false,
            feedback: 'You already tried verbal coaching. Repeating the same approach without documentation means if you eventually need to take formal action, you have no record of the pattern or your previous conversations.',
          },
          {
            text: 'Create a Written Warning using the Attendance Notice template, documenting the dates, times, the verbal conversation, and the expected change',
            isCorrect: true,
            feedback: 'Correct. The template captures the facts, references the previous verbal conversation, sets clear expectations, and starts the documentation chain. The employee signs, acknowledging they understand.',
          },
          {
            text: 'Skip the warning and move directly to termination',
            isCorrect: false,
            feedback: 'Jumping to termination without progressive documentation creates legal risk. The escalation chain (verbal, written, final, termination) protects both the employee and the center.',
          },
          {
            text: 'Adjust their schedule so the late arrivals do not matter',
            isCorrect: false,
            feedback: 'Accommodating the problem without addressing it sets a precedent. Other staff see that lateness has no consequences. Document the issue and set expectations.',
          },
        ],
      },
    },
    {
      id: 'M19-A5',
      type: 'explore',
      title: 'HR Pages',
      pages: [
        { path: '/admin/hr', name: 'HR Dashboard', description: 'Employee document tracking, pending signatures, and escalation management' },
        { path: '/admin/staff', name: 'Staff Directory', description: 'Employee directory with roles, assignments, and document status' },
      ],
    },
    {
      id: 'M19-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Think of a time when you wished you had written something down about a staff performance issue. What would have been different if that documentation existed?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Think of a time when you wished you had written something down about a staff performance issue. What would have been different if that documentation existed?',
    'How do you currently handle the gap between a verbal coaching conversation and a formal written warning? Where does information get lost?',
  ],
  commonMistakes: [
    {
      mistake: 'Backdating discipline records',
      prevention: 'Document the same day. If you missed it, note the actual date of the incident and the date of documentation separately.',
    },
    {
      mistake: 'Using free-text instead of templates',
      prevention: 'Templates include legally protective language. Free-text may miss critical elements.',
    },
    {
      mistake: 'Not getting signatures',
      prevention: 'Digital signatures are built in. Send through the system; the employee signs on their portal.',
    },
  ],
};
