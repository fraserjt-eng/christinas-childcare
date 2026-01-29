// Activity Cards PDF Generator
// Creates printable cards for each lesson segment

import jsPDF from 'jspdf';
import {
  Lesson,
  SEGMENT_LABELS,
  AGE_GROUP_LABELS,
} from '@/types/curriculum';

const CHRISTINA_RED = '#C62828';
const CHRISTINA_BLUE = '#2196F3';
const CHRISTINA_GREEN = '#4CAF50';
const CHRISTINA_YELLOW = '#FFD54F';
const CHRISTINA_CORAL = '#FF7043';

const SEGMENT_COLORS: Record<string, string> = {
  'INTRO': CHRISTINA_YELLOW,
  'EXPLORE': CHRISTINA_BLUE,
  'PRACTICE': CHRISTINA_GREEN,
  'REFLECT': '#9C27B0',
  'CLOSE': CHRISTINA_CORAL,
};

export function generateActivityCards(lesson: Lesson): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cardWidth = (pageWidth - 30) / 2;
  const cardHeight = (pageHeight - 30) / 2;
  const margin = 10;

  lesson.segments.forEach((segment, index) => {
    // Calculate card position (2x2 grid)
    const row = Math.floor((index % 4) / 2);
    const col = index % 2;

    // Add new page after 4 cards
    if (index > 0 && index % 4 === 0) {
      doc.addPage();
    }

    const x = margin + col * (cardWidth + 10);
    const y = margin + row * (cardHeight + 10);

    const segmentColor = SEGMENT_COLORS[segment.segment] || CHRISTINA_RED;

    // Card border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');

    // Header strip
    doc.setFillColor(segmentColor);
    doc.roundedRect(x, y, cardWidth, 15, 3, 3, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y + 12, cardWidth, 3, 'F');

    // Segment number and name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${SEGMENT_LABELS[segment.segment]}`, x + 5, y + 10);

    // Duration badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x + cardWidth - 25, y + 3, 22, 9, 2, 2, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`${segment.duration} min`, x + cardWidth - 23, y + 9);

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(segment.title, x + 5, y + 22);

    // Description
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(segment.description, cardWidth - 10);
    doc.text(descLines.slice(0, 3), x + 5, y + 30);

    let currentY = y + 30 + Math.min(descLines.length, 3) * 4;

    // Materials (if any)
    if (segment.materials.length > 0) {
      currentY += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(segmentColor);
      doc.text('MATERIALS:', x + 5, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const matsText = segment.materials.slice(0, 4).join(', ');
      const matsLines = doc.splitTextToSize(matsText, cardWidth - 10);
      doc.text(matsLines.slice(0, 2), x + 5, currentY + 4);
      currentY += 10;
    }

    // Teacher tip (abbreviated)
    if (segment.teacherActions && currentY < y + cardHeight - 20) {
      currentY += 3;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(CHRISTINA_RED);
      doc.text('TEACHER TIP:', x + 5, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const tipLines = doc.splitTextToSize(segment.teacherActions, cardWidth - 10);
      doc.text(tipLines.slice(0, 2), x + 5, currentY + 4);
    }

    // Footer - Lesson title and age group
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${lesson.title} | ${AGE_GROUP_LABELS[lesson.ageGroup].split(' ')[0]}`,
      x + 5,
      y + cardHeight - 3
    );

    // Cut line indicator (dashed)
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(x - 2, y + cardHeight / 2, x - 5, y + cardHeight / 2);
    doc.line(x + cardWidth + 2, y + cardHeight / 2, x + cardWidth + 5, y + cardHeight / 2);
    doc.setLineDashPattern([], 0);
  });

  // Save
  const filename = `activity-cards-${lesson.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
