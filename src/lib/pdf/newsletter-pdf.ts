/**
 * Branded Newsletter PDF Generator
 * Creates a professional PDF newsletter for Christina's Child Care Center.
 * AI generates data-driven sections; admin fills in personal content.
 */

import jsPDF from 'jspdf';

const CHRISTINA_RED = '#C62828';
const CHRISTINA_BLUE = '#2196F3';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F3F4F6';

export interface NewsletterSection {
  title: string;
  content: string;
  type: 'ai_generated' | 'manual';
}

export interface NewsletterData {
  title: string;
  dateRange: string;
  sections: NewsletterSection[];
  centerName?: string;
  tagline?: string;
}

export function generateNewsletterPDF(data: NewsletterData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const centerName = data.centerName || "Christina's Child Care Center";
  const tagline = data.tagline || 'Where Learning And Growth Become One';

  function checkPageBreak(neededHeight: number): void {
    if (y + neededHeight > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
  }

  // Header banner
  doc.setFillColor(CHRISTINA_RED);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(centerName, pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`"${tagline}"`, pageWidth / 2, 23, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.dateRange, pageWidth / 2, 31, { align: 'center' });

  y = 45;

  // Newsletter title
  doc.setTextColor(CHRISTINA_RED);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 8;

  // Divider
  doc.setDrawColor(CHRISTINA_RED);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Sections
  for (const section of data.sections) {
    checkPageBreak(40);

    // Section header
    if (section.type === 'ai_generated') {
      // AI sections get a subtle blue accent
      doc.setFillColor(LIGHT_GRAY);
      doc.roundedRect(margin - 2, y - 4, contentWidth + 4, 12, 2, 2, 'F');
      doc.setTextColor(CHRISTINA_BLUE);
    } else {
      doc.setTextColor(CHRISTINA_RED);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, y + 4);
    y += 14;

    // Section content
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const contentLines = doc.splitTextToSize(section.content, contentWidth);

    for (const line of contentLines) {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 5;
    }

    y += 8;
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(CHRISTINA_RED);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setTextColor(GRAY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${centerName} | Crystal: (763) 390-5870 | Brooklyn Park: 555-555-5555`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    '5510 W Broadway Ave, Crystal, MN 55428 | Mon-Fri 6:30 AM - 6:00 PM',
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  doc.save(`${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_Newsletter.pdf`);
}
