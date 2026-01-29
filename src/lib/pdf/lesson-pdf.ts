// Lesson Plan PDF Generator
// Creates a complete lesson plan PDF with all segments

import jsPDF from 'jspdf';
import {
  Lesson,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
} from '@/types/curriculum';

const CHRISTINA_RED = '#C62828';
const CHRISTINA_BLUE = '#2196F3';
const GRAY = '#6B7280';

export function generateLessonPDF(lesson: Lesson): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFillColor(CHRISTINA_RED);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Lesson Plan', pageWidth / 2, 25, { align: 'center' });

  y = 45;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(lesson.title, margin, y);
  y += 10;

  // Meta info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(GRAY);

  const metaInfo = [
    `Age Group: ${AGE_GROUP_LABELS[lesson.ageGroup]}`,
    `Domain: ${DOMAIN_LABELS[lesson.domain]}`,
    `Duration: ${lesson.duration} minutes`,
    lesson.theme ? `Theme: ${lesson.theme}` : '',
  ].filter(Boolean);

  doc.text(metaInfo.join(' | '), margin, y);
  y += 15;

  // Objectives
  doc.setTextColor(CHRISTINA_RED);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Learning Objectives', margin, y);
  y += 7;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  lesson.objectives.forEach((obj) => {
    const lines = doc.splitTextToSize(`• ${obj}`, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  });
  y += 5;

  // Materials
  doc.setTextColor(CHRISTINA_BLUE);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Materials Needed', margin, y);
  y += 7;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const materialsText = lesson.materials.map((m) => `☐ ${m}`).join('\n');
  const materialsLines = doc.splitTextToSize(materialsText, pageWidth - margin * 2);
  doc.text(materialsLines, margin, y);
  y += materialsLines.length * 5 + 10;

  // Segments
  lesson.segments.forEach((segment, index) => {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Segment header
    doc.setFillColor(CHRISTINA_RED);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${index + 1}. ${segment.title} (${segment.duration} min)`,
      margin + 3,
      y + 2
    );
    y += 12;

    // Segment content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    // Description
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', margin, y);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(segment.description, pageWidth - margin * 2 - 5);
    doc.text(descLines, margin + 5, y + 5);
    y += descLines.length * 4 + 8;

    // Teacher Actions
    doc.setFont('helvetica', 'bold');
    doc.text('Teacher Actions:', margin, y);
    doc.setFont('helvetica', 'normal');
    const teacherLines = doc.splitTextToSize(segment.teacherActions, pageWidth - margin * 2 - 5);
    doc.text(teacherLines, margin + 5, y + 5);
    y += teacherLines.length * 4 + 8;

    // Child Actions
    doc.setFont('helvetica', 'bold');
    doc.text('Child Actions:', margin, y);
    doc.setFont('helvetica', 'normal');
    const childLines = doc.splitTextToSize(segment.childActions, pageWidth - margin * 2 - 5);
    doc.text(childLines, margin + 5, y + 5);
    y += childLines.length * 4 + 8;

    // Adaptations
    if (segment.adaptations.simplify || segment.adaptations.extend) {
      doc.setFont('helvetica', 'bold');
      doc.text('Adaptations:', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      if (segment.adaptations.simplify) {
        const simplifyLines = doc.splitTextToSize(
          `Simplify: ${segment.adaptations.simplify}`,
          pageWidth - margin * 2 - 5
        );
        doc.text(simplifyLines, margin + 5, y);
        y += simplifyLines.length * 3.5 + 2;
      }

      if (segment.adaptations.extend) {
        const extendLines = doc.splitTextToSize(
          `Extend: ${segment.adaptations.extend}`,
          pageWidth - margin * 2 - 5
        );
        doc.text(extendLines, margin + 5, y);
        y += extendLines.length * 3.5 + 2;
      }
    }

    // Assessment opportunity
    if (segment.assessmentOpportunity) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(CHRISTINA_BLUE);
      doc.text('Assessment:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const assessLines = doc.splitTextToSize(
        segment.assessmentOpportunity,
        pageWidth - margin * 2 - 5
      );
      doc.text(assessLines, margin + 5, y + 5);
      y += assessLines.length * 4 + 5;
    }

    y += 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(GRAY);
    doc.text(
      `Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = `lesson-plan-${lesson.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
