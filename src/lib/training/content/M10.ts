import { ModuleContent } from '@/types/training';

export const M10Content: ModuleContent = {
  moduleId: 'M10',
  activities: [
    {
      id: 'M10-A1',
      type: 'spotlight',
      title: 'Written Records Replace Phone Tag',
      spotlight: {
        concept: 'Every message is timestamped and preserved, replacing cubby notes and hallway conversations',
        detail: 'The messaging system creates a written, searchable record of every parent-staff conversation. Response time expectation is 4 hours during business hours (6:30 AM - 6:00 PM). Directors can view all conversations in their center for support and oversight. This protects both families and staff by documenting what was said and when.',
        whyItMatters: 'Without written records, disputes become "he said/she said." A timestamped message history shows exactly what was communicated and when. This is critical for licensing reviews, parent complaints, and protecting staff from unfounded allegations.',
      },
    },
    {
      id: 'M10-A2',
      type: 'walkthrough',
      title: 'Send and Reply to Messages',
      steps: [
        {
          instruction: 'Go to /admin/messaging (directors) or the Messages section from your employee dashboard. You see conversation threads listed by parent or staff member name.',
          tryItLink: '/admin/messaging',
        },
        {
          instruction: 'Tap a conversation to read the full thread. Scroll back to see the complete conversation history.',
        },
        {
          instruction: 'Type your response. Use a warm, professional tone. Use the child\'s name. Answer the actual question asked. Proofread before sending.',
        },
        {
          instruction: 'Tap "Send." The message is timestamped and added to the permanent conversation record.',
        },
      ],
    },
    {
      id: 'M10-A3',
      type: 'walkthrough',
      title: 'Monitor Unanswered Messages (Directors)',
      steps: [
        {
          instruction: 'Go to /admin/messaging. Filter by "Unanswered messages." This shows parent messages waiting more than 4 hours for a response.',
          tryItLink: '/admin/messaging',
        },
        {
          instruction: 'Review the unanswered count. This is your most important messaging metric. Any parent waiting more than 4 hours deserves a reply.',
        },
        {
          instruction: 'You can jump into any conversation to reply directly or coach a staff member on their response before they send it.',
        },
      ],
    },
    {
      id: 'M10-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'A parent sends a message at 9 AM: "My daughter has been saying another child is hitting her at recess. I need this addressed immediately." You are in the middle of circle time with 12 children. What do you do?',
        options: [
          {
            text: 'Reply immediately with a detailed response while managing the children',
            isCorrect: false,
            feedback: 'Typing a thoughtful response while supervising children splits your attention and likely produces a rushed reply. The children need your focus right now.',
          },
          {
            text: 'Acknowledge the message within 30 minutes, then provide a full response after circle time when you can give it proper attention',
            isCorrect: true,
            feedback: 'Correct. A brief acknowledgment ("I received your message and will look into this. I will follow up with you by noon.") shows the parent they are heard. Then respond fully when you can focus.',
          },
          {
            text: 'Forward the message to the director and do not respond yourself',
            isCorrect: false,
            feedback: 'Forwarding to the director is appropriate if the situation requires escalation, but the parent still needs an acknowledgment from you. Do both.',
          },
          {
            text: 'Wait until the 4-hour window and respond then',
            isCorrect: false,
            feedback: 'A message about a child\'s safety deserves faster acknowledgment than routine questions. The 4-hour window is the maximum, not the target.',
          },
        ],
      },
    },
    {
      id: 'M10-A5',
      type: 'explore',
      title: 'Messaging Pages',
      pages: [
        { path: '/admin/messaging', name: 'Messaging Hub', description: 'Director view of all conversations with filters for unanswered, classroom, and date range' },
        { path: '/dashboard/messages', name: 'Parent Messages', description: 'Parent view of conversation threads with teachers and directors' },
      ],
    },
    {
      id: 'M10-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What kinds of conversations belong in the messaging system vs. in person? When should you pick up the phone instead of typing?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'A parent messages at 9 AM asking if their child\'s rash has gotten worse. How quickly should this be answered? What if the classroom teacher is busy with the children?',
    'What kinds of conversations belong in the messaging system vs. in person? (Answer: routine updates, schedule questions, and quick check-ins belong in messaging. Serious behavior concerns, injury details, and sensitive family matters should happen face to face or by phone, then be documented)',
    'Why is written communication history important for the center? (Answer: creates a record, prevents "he said/she said" disputes, protects both families and staff)',
  ],
  commonMistakes: [
    {
      mistake: 'Not checking messages at start and end of shift',
      prevention: 'Build message check into your arrival and departure routine',
    },
    {
      mistake: 'Responding to emotional messages immediately',
      prevention: 'Read the message. Wait 10 minutes. Then respond.',
    },
    {
      mistake: 'Using informal language or abbreviations',
      prevention: 'Write in complete sentences. Proofread before sending.',
    },
    {
      mistake: 'Leaving a message unanswered for a full day',
      prevention: '4-hour response window, maximum',
    },
    {
      mistake: 'Having sensitive conversations in writing',
      prevention: 'Use messaging for routine topics; use phone or in-person for sensitive ones',
    },
  ],
};
