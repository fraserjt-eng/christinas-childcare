// Assessment Checklist PDF Generator
// Creates an observation checklist for documenting child learning

import jsPDF from 'jspdf';
import {
  Lesson,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
} from '@/types/curriculum';

const CHRISTINA_RED = '#C62828';
const CHRISTINA_BLUE = '#2196F3';
const GRAY = '#6B7280';

export function generateAssessmentChecklist(lesson: Lesson, _multipleChildren = false): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // Header
  doc.setFillColor(CHRISTINA_RED);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", pageWidth / 2, 10, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Observation & Assessment Checklist', pageWidth / 2, 18, { align: 'center' });

  y = 32;

  // Lesson Info Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Lesson: ${lesson.title}`, margin + 5, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(GRAY);
  doc.text(
    `Age Group: ${AGE_GROUP_LABELS[lesson.ageGroup]} | Domain: ${DOMAIN_LABELS[lesson.domain]} | Duration: ${lesson.duration} min`,
    margin + 5,
    y + 14
  );

  y += 28;

  // Child Info Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Child Information', margin, y);
  y += 6;

  // Name field
  doc.setFont('helvetica', 'normal');
  doc.text('Name: ', margin, y);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 15, y, margin + 80, y);

  // Date field
  doc.text('Date: ', margin + 90, y);
  doc.line(margin + 105, y, margin + 155, y);
  y += 10;

  // Observer field
  doc.text('Observer: ', margin, y);
  doc.line(margin + 22, y, margin + 80, y);
  y += 12;

  // Assessment Scale Legend
  doc.setFillColor(CHRISTINA_BLUE);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
  doc.text('Assessment Scale', margin + 5, y + 5.5);

  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const scales = [
    { code: 'NY', label: 'Not Yet - Skill not observed or emerging' },
    { code: 'D', label: 'Developing - Skill demonstrated with support' },
    { code: 'M', label: 'Mastered - Skill demonstrated independently' },
  ];

  scales.forEach((scale) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${scale.code}:`, margin + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.text(scale.label, margin + 15, y);
    y += 5;
  });

  y += 8;

  // Learning Objectives Assessment
  doc.setFillColor(CHRISTINA_RED);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
  doc.text('Learning Objectives', margin + 5, y + 5.5);

  y += 14;

  doc.setTextColor(0, 0, 0);

  // Table header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Objective', margin, y);
  doc.text('NY', pageWidth - margin - 45, y, { align: 'center' });
  doc.text('D', pageWidth - margin - 30, y, { align: 'center' });
  doc.text('M', pageWidth - margin - 15, y, { align: 'center' });

  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Objectives rows
  doc.setFont('helvetica', 'normal');
  lesson.objectives.forEach((obj) => {
    const objLines = doc.splitTextToSize(obj, pageWidth - margin * 2 - 60);
    doc.text(objLines, margin, y);

    // Checkboxes
    const boxY = y - 3;
    doc.setDrawColor(150, 150, 150);
    doc.rect(pageWidth - margin - 48, boxY, 6, 6);
    doc.rect(pageWidth - margin - 33, boxY, 6, 6);
    doc.rect(pageWidth - margin - 18, boxY, 6, 6);

    y += objLines.length * 4 + 6;
  });

  y += 5;

  // Segment-specific assessment opportunities
  const segmentsWithAssessment = lesson.segments.filter((s) => s.assessmentOpportunity);

  if (segmentsWithAssessment.length > 0) {
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
    doc.setTextColor(CHRISTINA_BLUE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observation Opportunities by Segment', margin + 5, y + 5.5);
    y += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    segmentsWithAssessment.forEach((seg) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${seg.segment}:`, margin, y);
      doc.setFont('helvetica', 'normal');

      const assessLines = doc.splitTextToSize(
        seg.assessmentOpportunity || '',
        pageWidth - margin * 2 - 25
      );
      doc.text(assessLines, margin + 25, y);
      y += assessLines.length * 4 + 4;
    });

    y += 5;
  }

  // Notes section
  if (y < 220) {
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
    doc.setTextColor(CHRISTINA_RED);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observation Notes', margin + 5, y + 5.5);
    y += 12;

    // Notes lines
    doc.setDrawColor(230, 230, 230);
    const notesEndY = Math.min(y + 50, doc.internal.pageSize.getHeight() - 25);
    for (let lineY = y; lineY < notesEndY; lineY += 7) {
      doc.line(margin, lineY, pageWidth - margin, lineY);
    }

    y = notesEndY + 10;
  }

  // Follow-up section
  if (y < doc.internal.pageSize.getHeight() - 40) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Follow-Up Actions:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const followUps = [
      '☐ Share with parents',
      '☐ Add to portfolio',
      '☐ Plan individual support',
      '☐ Adjust lesson for group',
    ];

    followUps.forEach((item) => {
      doc.text(item, margin + 5, y);
      y += 5;
    });
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(GRAY);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} | ${lesson.title}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'center' }
  );

  // Save
  const filename = `assessment-${lesson.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}
