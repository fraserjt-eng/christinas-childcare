import { ModuleContent } from '@/types/training';

export const M07Content: ModuleContent = {
  moduleId: 'M07',
  activities: [
    {
      id: 'M07-A1',
      type: 'spotlight',
      title: 'Photos Build Parent Trust',
      spotlight: {
        concept: 'Daily photos are the primary way parents see their child\'s day',
        detail: 'Each classroom should upload 3-5 tagged, captioned photos per activity block. Photos go through an approval workflow: teachers upload, directors review, and only approved photos become visible to parents. This ensures quality control and privacy protection. Parents who see regular photo updates feel connected and are more likely to stay enrolled.',
        whyItMatters: 'Centers that share daily photos have measurably higher parent satisfaction. A parent who sees their child engaged in activities trusts the care more deeply. A center with no photos feels opaque. When parents feel disconnected, they start looking elsewhere.',
      },
    },
    {
      id: 'M07-A2',
      type: 'walkthrough',
      title: 'Upload and Tag Photos',
      steps: [
        {
          instruction: 'During an activity (art, outdoor play, circle time, meals), take 3-5 photos on your phone. Check quality before uploading: no blurry shots, no name tags or sign-in sheets visible in the background.',
        },
        {
          instruction: 'Open the platform and navigate to the photo upload section from your employee dashboard.',
          tryItLink: '/employee/photos',
        },
        {
          instruction: 'Tap "Upload Photos" and select up to 5 photos from your camera roll.',
        },
        {
          instruction: 'For each photo, select an activity tag (Art, Outdoor Play, Circle Time, Meal, Free Play, Music, Science, Reading) and write a brief caption (1-2 sentences, e.g., "Maya and Jordan built a tower in the block area today").',
        },
        {
          instruction: 'Tap "Submit." The photos go to the approval queue. A director reviews them before they become visible to parents.',
        },
      ],
    },
    {
      id: 'M07-A3',
      type: 'walkthrough',
      title: 'Review and Approve Photos (Directors)',
      steps: [
        {
          instruction: 'Go to /admin/communications/photos. The approval queue shows submitted photos with tags, captions, and timestamps.',
          tryItLink: '/admin/communications/photos',
        },
        {
          instruction: 'For each photo, choose one action: Approve (photo becomes visible to parents), Reject (blurry, identifiable info visible, or inappropriate), or Edit Caption (fix typos or add detail before approving).',
        },
        {
          instruction: 'Approved photos appear in the parent gallery at /dashboard/photos within minutes.',
        },
      ],
    },
    {
      id: 'M07-A4',
      type: 'scenario',
      title: 'What Would You Do?',
      scenario: {
        situation: 'You took a great photo of children playing outside, but you notice a child\'s last name is visible on a cubby label in the background. The photo is already selected for upload. What do you do?',
        options: [
          {
            text: 'Upload it anyway since only parents in the classroom can see it',
            isCorrect: false,
            feedback: 'Even within the parent gallery, other children\'s identifying information should not be visible. Privacy protection applies to all photos.',
          },
          {
            text: 'Crop or retake the photo to remove the identifying information before uploading',
            isCorrect: true,
            feedback: 'Correct. Check every photo for name tags, sign-in sheets, medical info, or any identifying information in the background before uploading.',
          },
          {
            text: 'Skip uploading that photo entirely',
            isCorrect: false,
            feedback: 'You do not need to discard the photo. Cropping removes the problem while keeping a good image of children at play.',
          },
          {
            text: 'Upload it and let the director decide during approval',
            isCorrect: false,
            feedback: 'Catching privacy issues before upload is better than relying on the approval step. The director may not notice a small name tag in the background.',
          },
        ],
      },
    },
    {
      id: 'M07-A5',
      type: 'explore',
      title: 'Photo Pages',
      pages: [
        { path: '/employee/photos', name: 'Photo Upload', description: 'Upload, tag, and caption photos from your classroom activities' },
        { path: '/admin/communications/photos', name: 'Photo Approval Queue', description: 'Review, approve, or reject submitted photos before parents see them' },
        { path: '/dashboard/photos', name: 'Parent Photo Gallery', description: 'What parents see: approved photos organized by date with activity tags' },
      ],
    },
    {
      id: 'M07-A6',
      type: 'reflection',
      title: 'Quick Reflection',
      prompt: 'What makes a good classroom photo? Why does the approval step exist before parents can see photos?',
    },
  ],
  learnSections: [],
  discussionQuestions: [
    'What makes a good classroom photo? (Answer: shows children engaged in activity, faces visible, good lighting, no identifying documents in background)',
    'How many photos per day is a reasonable target for each classroom? (Answer: 3-5 per activity block; aim for variety)',
    'Why does the approval step exist? (Answer: quality control, privacy protection, professional presentation)',
  ],
  commonMistakes: [
    {
      mistake: 'Taking photos only during special events',
      prevention: 'Take 3-5 photos during every activity block',
    },
    {
      mistake: 'Uploading blurry or dark photos',
      prevention: 'Check the photo quality before uploading',
    },
    {
      mistake: 'Forgetting to tag and caption',
      prevention: 'Always add a tag and at least one sentence',
    },
    {
      mistake: 'Uploading photos with other children\'s names visible',
      prevention: 'Check backgrounds for name tags, sign-in sheets, etc.',
    },
    {
      mistake: 'Waiting until end of week to upload',
      prevention: 'Upload during transitions or nap time',
    },
  ],
};
