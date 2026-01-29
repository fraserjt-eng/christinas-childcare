// Parent Letter PDF Generator
// Creates a take-home letter for parents with activities and conversation starters

import jsPDF from 'jspdf';
import {
  Lesson,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
} from '@/types/curriculum';

const CHRISTINA_RED = '#C62828';
const CHRISTINA_BLUE = '#2196F3';
const GRAY = '#6B7280';

export function generateParentLetter(lesson: Lesson): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  let y = 20;

  // Header with logo placeholder
  doc.setFillColor(CHRISTINA_RED);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Family Connection Newsletter', pageWidth / 2, 22, { align: 'center' });

  y = 40;

  // Date
  doc.setTextColor(GRAY);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), margin, y);
  y += 10;

  // Greeting
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Dear Families,', margin, y);
  y += 10;

  // Introduction paragraph
  const introText = `We're excited to share what your child is learning! This week we're exploring "${lesson.title}" as part of our ${DOMAIN_LABELS[lesson.domain]} curriculum for our ${AGE_GROUP_LABELS[lesson.ageGroup].split(' ')[0]} classroom.`;

  const introLines = doc.splitTextToSize(introText, pageWidth - margin * 2);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 10;

  // Learning Goals section
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin - 5, y - 5, pageWidth - margin * 2 + 10, 8 + lesson.objectives.length * 6, 3, 3, 'F');

  doc.setTextColor(CHRISTINA_RED);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('What We\'re Learning', margin, y + 3);
  y += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  lesson.objectives.forEach((obj) => {
    doc.text(`★ ${obj}`, margin + 3, y);
    y += 6;
  });
  y += 10;

  // Activities at Home section
  doc.setTextColor(CHRISTINA_BLUE);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Try This at Home!', margin, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Generate home activities based on lesson content
  const homeActivities = generateHomeActivities(lesson);
  homeActivities.forEach((activity, index) => {
    const activityLines = doc.splitTextToSize(`${index + 1}. ${activity}`, pageWidth - margin * 2);
    doc.text(activityLines, margin, y);
    y += activityLines.length * 5 + 3;
  });
  y += 7;

  // Conversation Starters
  doc.setTextColor(CHRISTINA_RED);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ask Your Child...', margin, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const questions = generateConversationStarters(lesson);
  questions.forEach((q) => {
    doc.text(`• "${q}"`, margin + 3, y);
    y += 6;
  });
  y += 10;

  // Materials you can send (if applicable)
  if (lesson.materials.length > 0) {
    doc.setTextColor(CHRISTINA_BLUE);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Items to Contribute (Optional)', margin, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const contributionText = `If you have any of the following items at home and would like to share, we'd love to use them in class: ${lesson.materials.slice(0, 3).join(', ')}.`;
    const contribLines = doc.splitTextToSize(contributionText, pageWidth - margin * 2);
    doc.text(contribLines, margin, y);
    y += contribLines.length * 5 + 10;
  }

  // Closing
  y = Math.max(y, 220);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Thank you for being partners in your child\'s learning journey!', margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.text('Warmly,', margin, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Your Teaching Team', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(CHRISTINA_RED);
  doc.text("Christina's Child Care Center", margin, y);

  // Footer
  doc.setTextColor(GRAY);
  doc.setFontSize(8);
  doc.text(
    `${lesson.title} | ${AGE_GROUP_LABELS[lesson.ageGroup]} | ${DOMAIN_LABELS[lesson.domain]}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  // Save
  const filename = `parent-letter-${lesson.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}

function generateHomeActivities(lesson: Lesson): string[] {
  const activities: string[] = [];

  // Generate based on domain
  const domainActivities: Record<string, string[]> = {
    'math': [
      'Count everyday objects together during meals or playtime.',
      'Sort toys by color, size, or type.',
      'Look for shapes around your home and neighborhood.',
    ],
    'literacy': [
      'Read together for at least 15 minutes each day.',
      'Point out letters and words on signs when you\'re out.',
      'Let your child "read" a familiar book to you.',
    ],
    'science': [
      'Go on a nature walk and observe plants and animals.',
      'Explore cause and effect with water play or building blocks.',
      'Ask "what if" questions about the world around you.',
    ],
    'social-emotional': [
      'Talk about feelings when they come up naturally.',
      'Practice taking turns during family game time.',
      'Read books about emotions and discuss the characters.',
    ],
    'physical': [
      'Have a dance party in the living room!',
      'Practice throwing and catching soft balls.',
      'Set up an obstacle course with pillows and cushions.',
    ],
    'creative': [
      'Set up an art station with paper, crayons, and safe scissors.',
      'Make up songs together during daily routines.',
      'Build with blocks, boxes, or other materials.',
    ],
    'language': [
      'Describe what you\'re doing throughout the day.',
      'Sing songs and rhymes together.',
      'Ask open-ended questions that encourage conversation.',
    ],
    'cognitive': [
      'Play simple matching or memory games.',
      'Work on puzzles together.',
      'Sort objects by different attributes (color, size, shape).',
    ],
  };

  activities.push(...(domainActivities[lesson.domain] || domainActivities['cognitive']));

  // Add one specific to the lesson theme
  if (lesson.theme) {
    activities.push(`Explore more about "${lesson.theme}" with books from the library.`);
  }

  return activities.slice(0, 4);
}

function generateConversationStarters(lesson: Lesson): string[] {
  const starters: string[] = [];

  // Based on objectives
  if (lesson.objectives.length > 0) {
    starters.push(`What did you learn about ${lesson.title.toLowerCase()} today?`);
    starters.push(`Can you show me what you did in class?`);
  }

  // Domain-specific questions
  const domainQuestions: Record<string, string[]> = {
    'math': ['Can you count these for me?', 'What shapes do you see?'],
    'literacy': ['What was your favorite part of the story?', 'Can you find the letter...?'],
    'science': ['What did you discover today?', 'Why do you think that happened?'],
    'social-emotional': ['How did that make you feel?', 'How do you think your friend felt?'],
    'physical': ['What was the most fun thing you did with your body today?'],
    'creative': ['Tell me about what you made!', 'What colors did you use?'],
    'language': ['What new words did you learn?', 'Can you tell me about...?'],
    'cognitive': ['How did you solve that problem?', 'What would happen if...?'],
  };

  starters.push(...(domainQuestions[lesson.domain] || ['What was the best part of your day?']));

  return starters.slice(0, 4);
}
