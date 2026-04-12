import { ModuleContent } from '@/types/training';

export const M03Content: ModuleContent = {
  moduleId: 'M03',
  activities: [
    {
      id: 'M03-A1',
      type: 'spotlight',
      title: 'Profiles Are Safety Infrastructure',
      spotlight: {
        concept: 'Incomplete profiles create safety risks, licensing gaps, and communication failures',
        detail: 'Every role has required fields. Emergency contact information, allergy data, and certification records all flow through the profile system to the people who need them. When a parent updates an allergy, teachers see it immediately. When an employee uploads a renewed CPR card, the scheduling system knows they are eligible. Profiles must be 100% complete.',
        whyItMatters: 'During a licensing inspection, incomplete profiles trigger findings. A missing emergency contact means the center cannot reach anyone if a child is hurt. A missing allergy record means a child could be served food that harms them. Each profile gap is a liability.',
      },
    },
    {
      id: 'M03-A2',
      type: 'walkthrough',
      title: 'Complete Your Employee Profile',
      steps: [
        {
          instruction: 'Go to /employee/profile and find the "Personal Info" section. Verify your name, phone, email, and address are current.',
          tryItLink: '/employee/profile',
        },
        {
          instruction: 'Scroll to "Emergency Contacts." Add at least one emergency contact with their full name, relationship, and phone number.',
        },
        {
          instruction: 'Find the "Certifications" section. Upload your current CPR/First Aid certificate and background check. Enter expiry dates for each.',
        },
        {
          instruction: 'Upload a headshot photo. Parents see this when viewing classroom staff, so choose a clear, professional image.',
        },
        {
          instruction: 'Tap "Save" after each section. Then check your profile completion percentage at the top of the page. Target: 100%.',
        },
      ],
    },
    {
      id: 'M03-A3',
      type: 'walkthrough',
      title: 'Configure Your Notification Preferences',
      steps: [
        {
          instruction: 'From your profile or settings page, find the notification preferences section.',
          tryItLink: '/dashboard',
        },
        {
          instruction: 'Turn on notifications for messages, incident reports, and schedule changes at minimum. These are critical for daily operations.',
        },
        {
          instruction: 'Choose your delivery method for each notification type: push notification, email, or both. For urgent items, choose both.',
        },
      ],
    },
    {
      id: 'M03-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'You moved to a new apartment last weekend. Your old phone number still works, but your address has changed. When should you update your profile?',
        options: [
          {
            text: 'Update it when you have free time, maybe next week',
            isCorrect: false,
            feedback: 'Every day with outdated information is a day the center cannot reach you in an emergency or send important mail to the right address.',
          },
          {
            text: 'Wait until the next staff meeting and tell the director in person',
            isCorrect: false,
            feedback: 'Telling the director verbally does not update the system. Your profile still shows the old address until you change it.',
          },
          {
            text: 'Update the platform the same day you move, before your next shift',
            isCorrect: true,
            feedback: 'Correct. Update the platform the same day anything changes. The system is the source of truth for all contact information.',
          },
          {
            text: 'Only update it if the director asks about it',
            isCorrect: false,
            feedback: 'The director should not need to ask. Profile accuracy is your responsibility. Outdated records create safety and compliance gaps.',
          },
        ],
      },
    },
    {
      id: 'M03-A5',
      type: 'explore',
      title: 'Profile and Settings Pages',
      pages: [
        { path: '/employee/profile', name: 'Employee Profile', description: 'Personal info, emergency contacts, certifications, and photo upload' },
        { path: '/dashboard', name: 'Parent Dashboard', description: 'Access child profiles, allergy info, and emergency contacts from here' },
        { path: '/admin/settings', name: 'Admin Settings', description: 'Center-level settings: users, roles, security, audit logs, and backup' },
      ],
    },
    {
      id: 'M03-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Why does the platform need emergency contacts from both parents and staff? What happens during a licensing visit if a child\'s allergy info is incomplete in the system?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'Why does the platform need emergency contacts from both parents and staff?',
    'What happens during a licensing visit if a child\'s allergy info is incomplete in the system?',
    'When should you update your profile? (Answer: immediately when anything changes, and review quarterly)',
  ],
  commonMistakes: [
    {
      mistake: 'Leaving allergy fields blank',
      prevention: 'Fill allergies on day one, before the child\'s first meal',
    },
    {
      mistake: 'Only listing one emergency contact',
      prevention: 'Minimum 2 contacts; 3 is better',
    },
    {
      mistake: 'Skipping the photo upload',
      prevention: 'Upload your headshot during onboarding',
    },
    {
      mistake: 'Not updating after a move or phone change',
      prevention: 'Update the platform the same day anything changes',
    },
    {
      mistake: 'Ignoring notification settings',
      prevention: 'Spend 2 minutes configuring preferences during setup',
    },
  ],
};
