import { ModuleContent } from '@/types/training';

export const M01Content: ModuleContent = {
  moduleId: 'M01',
  activities: [
    {
      id: 'M01-A1',
      type: 'spotlight',
      title: 'Role-Based Access',
      spotlight: {
        concept: 'Every person gets their own login with role-based access',
        detail: 'The platform has three portal entry points. Parents see /dashboard. Staff see /employee. Directors and the owner see /admin. You only see what you need for your role. If you try to access a portal you do not have permission for, you will see the access-denied page.',
        whyItMatters: 'Every login support call costs Christina 5-10 minutes. With 15 staff across two centers, even one call per person per month adds up to 2.5 hours of wasted director time monthly.',
      },
    },
    {
      id: 'M01-A2',
      type: 'walkthrough',
      title: 'Log In to Your Portal',
      steps: [
        {
          instruction: 'Open your phone browser and go to christinas-childcare.vercel.app',
          screenshotCaption: 'Christina\'s homepage with login buttons',
          tryItLink: '/',
        },
        {
          instruction: 'Find the login button for your role. Parents tap "Parent Login." Staff tap "Staff Login." Directors and the owner also use "Staff Login" but will have access to the admin portal.',
          screenshotCaption: 'Login page with email and password fields',
        },
        {
          instruction: 'Enter your email address and the temporary password from your welcome packet. Then tap "Sign In."',
          tryItLink: '/employee-login',
        },
        {
          instruction: 'You should now see your portal dashboard. This is your home base. Bookmark this page right now: tap the share icon, then "Add to Home Screen." It will work like an app.',
          screenshotCaption: 'Employee dashboard after successful login',
        },
      ],
    },
    {
      id: 'M01-A3',
      type: 'walkthrough',
      title: 'Reset Your Password',
      steps: [
        {
          instruction: 'On the login screen, tap "Forgot Password" below the sign-in button.',
          tryItLink: '/employee-login',
        },
        {
          instruction: 'Enter your email address and tap "Send Reset Link."',
        },
        {
          instruction: 'Check your inbox (and spam folder) for the reset link. Click it.',
        },
        {
          instruction: 'Create a new password (at least 8 characters, one number). You can now log in with the new password.',
        },
      ],
    },
    {
      id: 'M01-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'It is 7:00 AM and your shift starts in 15 minutes. You try to log in but your password is not working. You reset it yesterday and it worked fine. What do you do?',
        options: [
          {
            text: 'Wait until Christina arrives and ask her to fix it',
            isCorrect: false,
            feedback: 'Waiting wastes your shift start time and puts you out of ratio. There are faster options.',
          },
          {
            text: 'Use the "Forgot Password" link to reset it again right now',
            isCorrect: true,
            feedback: 'Correct. A password reset takes 2 minutes. You can be logged in before your shift starts without needing anyone else.',
          },
          {
            text: 'Use a coworker\'s login to clock in',
            isCorrect: false,
            feedback: 'Sharing credentials creates security issues and incorrect time records. Every person must use their own account.',
          },
          {
            text: 'Skip the platform today and use paper',
            isCorrect: false,
            feedback: 'Paper records miss CACFP claims and create compliance gaps. Reset your password instead.',
          },
        ],
      },
    },
    {
      id: 'M01-A5',
      type: 'explore',
      title: 'Find Your Portal',
      pages: [
        { path: '/', name: 'Homepage', description: 'The public homepage with login buttons for each role' },
        { path: '/employee-login', name: 'Staff Login', description: 'Where employees and directors sign in with email/PIN' },
        { path: '/login', name: 'Parent Login', description: 'Where parents and families sign in' },
        { path: '/admin-login', name: 'Admin Login', description: 'Where directors and owner access the admin portal' },
      ],
    },
    {
      id: 'M01-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What does "role-based access" mean in plain language? Why is it important that not everyone can see everything on the platform?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What does "role-based access" mean in plain language? Why can\'t everyone see everything?',
    'When would you use your phone vs. a computer to access the platform?',
    'What should you do if you can\'t log in and it\'s the start of your shift?',
  ],
  commonMistakes: [
    { mistake: 'Using the wrong portal URL', prevention: 'Always start from your bookmarked link' },
    { mistake: 'Sharing login credentials', prevention: 'Every person gets their own account, no exceptions' },
    { mistake: 'Forgetting to bookmark', prevention: 'Add to home screen on day one' },
    { mistake: 'Using an old browser', prevention: 'Update Chrome or Safari before training' },
  ],
};
