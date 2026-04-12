import { ModuleContent } from '@/types/training';

export const M25Content: ModuleContent = {
  moduleId: 'M25',
  activities: [
    {
      id: 'M25-A1',
      type: 'spotlight',
      title: 'The Website Is the Top of the Funnel',
      spotlight: {
        concept: 'If the website is outdated, families form an impression before they ever call',
        detail: 'The public website includes Home, About, Programs, Gallery, Enrollment, FAQ, and Contact pages. When a family submits the enrollment inquiry form, it appears as a new card on the pipeline board. A 24-hour response time converts 2x better than 48 hours. The gallery pulls from approved photos uploaded through the daily photo system.',
        whyItMatters: 'Most families visit your website on their phone before they call or visit. If the site shows last year\'s photos, outdated hours, or incorrect rates, the family moves on to the next center in the search results. A monthly site review takes 15 minutes and prevents this.',
      },
    },
    {
      id: 'M25-A2',
      type: 'walkthrough',
      title: 'Review Your Public Website',
      steps: [
        {
          instruction: 'Open your website on your phone (not a computer, since that is how most parents see it). Go to the homepage.',
          tryItLink: '/',
        },
        {
          instruction: 'Check that all information is accurate: hours of operation, contact phone number, location address. Tap through to About, Programs, and Enrollment pages.',
          tryItLink: '/about',
        },
        {
          instruction: 'Visit the Programs page. Verify that age group descriptions, curriculum overview, and daily schedule are current.',
          tryItLink: '/programs',
        },
        {
          instruction: 'Visit the Enrollment page. Submit a test inquiry (use a test email) and verify it appears on the pipeline board within minutes.',
          tryItLink: '/enroll',
        },
      ],
    },
    {
      id: 'M25-A3',
      type: 'walkthrough',
      title: 'Manage Enrollment Submissions',
      steps: [
        {
          instruction: 'Check the notification bell in your admin portal for new enrollment submissions. Review submissions daily.',
        },
        {
          instruction: 'For each submission, respond within 24 hours. Offer to schedule a tour. If the family is ready, move their card from Inquiry to Tour Scheduled on the pipeline board.',
        },
        {
          instruction: 'Track referral sources: when families enter the pipeline, record how they found you (Google, social media, current family referral, drive-by, website direct). Review this data monthly.',
        },
      ],
    },
    {
      id: 'M25-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'A parent visits your website and submits an enrollment inquiry form on Saturday afternoon. You do not check submissions until Monday morning. By then, the parent has already toured a competitor and enrolled there. What should have been different?',
        options: [
          {
            text: 'Nothing. Weekends are personal time.',
            isCorrect: false,
            feedback: 'Enrollment inquiries do not follow business hours. A 48-hour gap from Saturday to Monday is when competitors respond first. You do not need to work all weekend, but a 2-minute acknowledgment on Saturday costs you nothing.',
          },
          {
            text: 'Set up a daily 9 AM check of enrollment submissions, including weekends, and send an immediate auto-acknowledgment when forms are submitted',
            isCorrect: true,
            feedback: 'Correct. An auto-acknowledgment ("Thanks for your interest. We will be in touch within 24 hours.") buys time. A daily check, even a 2-minute phone check on weekends, prevents 48-hour gaps.',
          },
          {
            text: 'Hire someone to handle weekend inquiries',
            isCorrect: false,
            feedback: 'You do not need to hire someone. An auto-acknowledgment and a 2-minute daily check are free solutions that cover the gap.',
          },
          {
            text: 'Take the enrollment form offline on weekends',
            isCorrect: false,
            feedback: 'Removing the form prevents families from reaching you at all. Most parents research childcare on evenings and weekends. The form should always be available.',
          },
        ],
      },
    },
    {
      id: 'M25-A5',
      type: 'explore',
      title: 'Public Website Pages',
      pages: [
        { path: '/', name: 'Homepage', description: 'First impression with value proposition and call to action' },
        { path: '/about', name: 'About Us', description: 'Mission, philosophy, and director bios' },
        { path: '/programs', name: 'Programs', description: 'Age group descriptions, curriculum overview, and daily schedule' },
        { path: '/enroll', name: 'Enrollment', description: 'Inquiry form, tuition information, and availability' },
      ],
    },
    {
      id: 'M25-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'If a parent visits your website right now, does it accurately represent what they would experience on a tour? What is the biggest gap between the site and reality?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'If a parent visits your website right now, does it accurately represent what they would experience on a tour? What is the biggest gap between the site and reality?',
    'How quickly do you currently respond to online enrollment inquiries? What would it take to respond within 4 hours every time?',
  ],
  commonMistakes: [
    {
      mistake: 'Letting the gallery go stale',
      prevention: 'Designate one person to review gallery-eligible photos every Friday. 10 minutes.',
    },
    {
      mistake: 'Not responding to web inquiries for days',
      prevention: 'Set up a daily 9 AM check of enrollment submissions. First thing, every morning.',
    },
    {
      mistake: 'Ignoring referral source tracking',
      prevention: 'Track it for 3 months, then review. Your assumptions may be wrong.',
    },
  ],
};
