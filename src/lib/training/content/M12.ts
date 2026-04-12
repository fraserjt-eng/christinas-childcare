import { ModuleContent } from '@/types/training';

export const M12Content: ModuleContent = {
  moduleId: 'M12',
  activities: [
    {
      id: 'M12-A1',
      type: 'spotlight',
      title: 'Your Data Flows to Everyone Who Needs It',
      spotlight: {
        concept: 'What parents enter in their portal directly affects what teachers and directors see',
        detail: 'When you update your child\'s allergy, teachers see it immediately on their classroom roster. When you add an emergency contact, the front desk can reach them within minutes during an emergency. When you update pickup authorization, staff know who can and cannot take your child. The system is the source of truth. Outdated information is worse than no information, because staff will trust what the system says.',
        whyItMatters: 'A parent who does not update a new peanut allergy puts their child at risk during the next meal. A parent who does not add a new emergency contact creates a gap during a crisis. Profile updates take 2 minutes and prevent situations that could harm your child.',
      },
    },
    {
      id: 'M12-A2',
      type: 'walkthrough',
      title: 'Navigate Your Parent Dashboard',
      steps: [
        {
          instruction: 'Log in and go to /dashboard. This is your home screen. It shows today\'s summary card for your child: check-in time, meals served, activities, and any teacher notes.',
          tryItLink: '/dashboard',
        },
        {
          instruction: 'Look at the alerts banner at the top. This shows anything that needs your attention: missing forms, upcoming events, or unread messages. Handle these first.',
        },
        {
          instruction: 'Find the quick action buttons: messaging, photos, and calendar. These are the pages you will use most often.',
        },
      ],
    },
    {
      id: 'M12-A3',
      type: 'walkthrough',
      title: 'Update Your Child\'s Profile',
      steps: [
        {
          instruction: 'Go to /dashboard/children. Tap your child\'s name to open their profile.',
          tryItLink: '/dashboard/children',
        },
        {
          instruction: 'Review and update each section: Basic Info (legal name, DOB), Allergies (list every allergy with severity), Medical (medications, doctor info), Emergency Contacts (at least 2 beyond yourself), and Authorized Pickup (everyone allowed to pick up your child).',
        },
        {
          instruction: 'Tap "Save" after each section. Anyone not on the Authorized Pickup list will be turned away at the door. This is a licensing requirement.',
        },
      ],
    },
    {
      id: 'M12-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'Your mother-in-law is picking up your child on Thursday. She is not currently on the authorized pickup list. It is Tuesday evening. What needs to happen before Thursday?',
        options: [
          {
            text: 'Call the center Thursday morning and tell them she is coming',
            isCorrect: false,
            feedback: 'A verbal notification is not enough. The authorized pickup list is a digital record that staff check at the door. Your mother-in-law will be turned away if she is not on the list.',
          },
          {
            text: 'Add her to the authorized pickup list in your child\'s profile at /dashboard/children right now',
            isCorrect: true,
            feedback: 'Correct. Update the authorized pickup list in the portal immediately. The change takes effect as soon as you save. Staff will see her name when she arrives Thursday.',
          },
          {
            text: 'Send a message to the teacher through the messaging system',
            isCorrect: false,
            feedback: 'Messaging the teacher is a courtesy, but the official record is the authorized pickup list. Staff check the list, not message history, when releasing a child.',
          },
          {
            text: 'Have your mother-in-law bring her ID and explain at the door',
            isCorrect: false,
            feedback: 'An ID does not override the authorized pickup list. Staff are trained to deny release to anyone not on the list, regardless of ID or relationship claims.',
          },
        ],
      },
    },
    {
      id: 'M12-A5',
      type: 'explore',
      title: 'Parent Portal Pages',
      pages: [
        { path: '/dashboard', name: 'Dashboard Home', description: 'Daily summary, alerts, and quick actions for your child\'s day' },
        { path: '/dashboard/photos', name: 'Photo Gallery', description: 'Approved photos from your child\'s classroom organized by date' },
        { path: '/dashboard/progress', name: 'Progress Tracking', description: 'Developmental milestones, assessment results, and growth over time' },
        { path: '/dashboard/children', name: 'My Children', description: 'Child profiles with allergies, emergency contacts, and authorized pickup' },
      ],
    },
    {
      id: 'M12-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'You discover your child developed a new food allergy over the weekend. Where do you update this, and how quickly should you do it?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'You discover your child developed a new food allergy over the weekend. Where do you update this, and how quickly should you do it? (Answer: /dashboard/children, allergy section, immediately before the next school day)',
    'Your mother-in-law is picking up your child on Thursday. She is not on the authorized pickup list. What needs to happen before Thursday?',
    'You notice the emergency contact phone number for your spouse is their old number. What is the risk of not updating it?',
  ],
  commonMistakes: [
    {
      mistake: 'Treating allergy info as optional',
      prevention: 'Fill this out before your child\'s first day, period',
    },
    {
      mistake: 'Only listing yourself as emergency contact',
      prevention: 'At least 2 additional contacts besides yourself',
    },
    {
      mistake: 'Not checking the portal for a week',
      prevention: 'Check 2-3 times per week; Monday, Wednesday, Friday is a good rhythm',
    },
    {
      mistake: 'Assuming the center already knows about changes',
      prevention: 'If it changes in your life, update it in the portal',
    },
    {
      mistake: 'Not reviewing documents when prompted',
      prevention: 'When you see a document alert, review and sign that day',
    },
  ],
};
