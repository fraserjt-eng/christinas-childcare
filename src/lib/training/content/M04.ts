import { ModuleContent } from '@/types/training';

export const M04Content: ModuleContent = {
  moduleId: 'M04',
  activities: [
    {
      id: 'M04-A1',
      type: 'spotlight',
      title: 'Every Check-In Is Revenue',
      spotlight: {
        concept: 'Accurate kiosk check-ins drive CACFP meal reimbursement',
        detail: 'The digital kiosk replaces the paper sign-in binder. It timestamps every check-in and check-out to the minute. A child who is not checked in does not appear on the meal count form, which means their meals cannot be claimed for federal reimbursement. Each child\'s daily attendance is worth $2-5 in CACFP funding.',
        whyItMatters: 'With 40 children, missed check-ins can cost $80-200 per day in lost reimbursement. Over a year, sloppy check-in habits can cost the center $10,000 or more. The kiosk eliminates illegible handwriting, missing entries, and unverified times.',
      },
    },
    {
      id: 'M04-A2',
      type: 'walkthrough',
      title: 'Check In a Child at the Kiosk',
      steps: [
        {
          instruction: 'Walk up to the kiosk at the front entrance. The screen shows a PIN entry keypad.',
          tryItLink: '/kiosk',
        },
        {
          instruction: 'Enter your 4-digit family PIN (printed on your quick-start card). The screen displays your children\'s names with a "Check In" button next to each one.',
        },
        {
          instruction: 'Tap "Check In" next to each child you are dropping off. The screen confirms: "[Child Name] checked in at [time]."',
        },
        {
          instruction: 'If you have multiple children, check in each one before walking away. The screen resets automatically after a few seconds of inactivity.',
        },
      ],
    },
    {
      id: 'M04-A3',
      type: 'walkthrough',
      title: 'Check Out a Child at Pickup',
      steps: [
        {
          instruction: 'Enter your PIN at the kiosk. This time, your children show a "Check Out" button instead of "Check In."',
          tryItLink: '/kiosk',
        },
        {
          instruction: 'Tap "Check Out" next to each child you are picking up. The screen confirms the checkout time.',
        },
        {
          instruction: 'If someone else is picking up (authorized on your child\'s profile), they use their own PIN. Anyone not on the authorized pickup list will be turned away.',
        },
      ],
    },
    {
      id: 'M04-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'You arrive at 7:15 AM to drop off your child. The kiosk screen is dark and unresponsive. Your child\'s classroom is right down the hall. What do you do?',
        options: [
          {
            text: 'Skip the check-in and go straight to the classroom',
            isCorrect: false,
            feedback: 'Skipping check-in means your child will not appear on the attendance record or the meal count form. Breakfast reimbursement is lost, and the center has no record your child is present.',
          },
          {
            text: 'Notify the front desk staff immediately so they can log the arrival manually',
            isCorrect: true,
            feedback: 'Correct. The backup process is to notify staff immediately. The director will enter the check-in time manually and troubleshoot the kiosk.',
          },
          {
            text: 'Wait in the lobby until the kiosk comes back online',
            isCorrect: false,
            feedback: 'Waiting wastes your time and delays your child\'s arrival in the classroom. Staff can record the check-in manually while the kiosk is fixed.',
          },
          {
            text: 'Text the teacher and drop your child off without checking in',
            isCorrect: false,
            feedback: 'A text is not a check-in. The attendance system needs an official record. Always notify front desk staff for manual entry.',
          },
        ],
      },
    },
    {
      id: 'M04-A5',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'Why is the exact check-in time important? How does a missed check-in affect the center financially and operationally?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What should you do if the kiosk is down when you arrive? (Answer: notify staff immediately; use the paper backup, then the director will enter the time manually)',
    'Why is the exact check-in time important? (Answer: CACFP reimbursement requires attendance records that match meal counts)',
    'What happens if your sister picks up your child but isn\'t on the authorized pickup list? (Answer: staff cannot release the child; this is a safety and licensing requirement)',
  ],
  commonMistakes: [
    {
      mistake: 'Forgetting your PIN',
      prevention: 'Keep your quick-start card in your wallet or phone case',
    },
    {
      mistake: 'Walking past the kiosk without checking in',
      prevention: 'Make check-in part of your drop-off routine: kiosk first, then classroom',
    },
    {
      mistake: 'Checking in but forgetting to check out',
      prevention: 'Staff should remind at pickup; directors should review unclosed check-ins at 6 PM',
    },
    {
      mistake: 'Letting another parent use your PIN',
      prevention: 'Your PIN is yours alone; unauthorized pickup is a safety issue',
    },
    {
      mistake: 'Not checking in all children',
      prevention: 'Always verify each child\'s name shows "checked in" before walking away',
    },
  ],
};
