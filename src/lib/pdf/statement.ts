// Family co-payment statement PDF.
// Send-only document: shows the amount due for a period. NOT a request for
// online payment (the center does not process payments in-app). Runs in the
// browser via jsPDF and triggers a download, matching parent-letter.ts.

import jsPDF from 'jspdf';

const CHRISTINA_RED = '#C62828';
const GRAY = '#6B7280';

export interface StatementData {
  parentName: string;
  familyEmail: string;
  periodLabel: string;
  amount: number;
  note?: string;
  issuedDate?: string; // ISO; defaults to today
}

function money(n: number): string {
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

export function generateStatementPDF(data: StatementData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  let y = 20;

  // Header band
  doc.setFillColor(CHRISTINA_RED);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", pageWidth / 2, 13, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Co-Payment Statement', pageWidth / 2, 22, { align: 'center' });

  y = 44;

  // Issued date (right) + Billed to (left)
  const issued = data.issuedDate ? new Date(data.issuedDate) : new Date();
  doc.setTextColor(GRAY);
  doc.setFontSize(10);
  doc.text(
    `Issued: ${issued.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageWidth - margin,
    y,
    { align: 'right' }
  );

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed to', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y += 7;
  doc.text(data.parentName || 'Family', margin, y);
  if (data.familyEmail) {
    y += 6;
    doc.setTextColor(GRAY);
    doc.setFontSize(10);
    doc.text(data.familyEmail, margin, y);
  }

  y += 14;

  // Statement period
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement period', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.periodLabel, margin + 50, y);

  y += 12;

  // Amount due box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin - 5, y - 6, pageWidth - margin * 2 + 10, 20, 3, 3, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount due', margin, y + 6);
  doc.setTextColor(CHRISTINA_RED);
  doc.setFontSize(16);
  doc.text(money(data.amount), pageWidth - margin, y + 7, { align: 'right' });

  y += 30;

  // Note
  if (data.note && data.note.trim()) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Note', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const noteLines = doc.splitTextToSize(data.note.trim(), pageWidth - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 5 + 8;
  }

  // Payment instruction / disclaimer
  doc.setTextColor(GRAY);
  doc.setFontSize(9);
  const disclaimer =
    'This is a statement of the co-payment due for the period shown. It is not a request for online payment. Please arrange payment directly with the center using your usual method. Questions? Contact the office.';
  const discLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
  doc.text(discLines, margin, Math.max(y, 250));

  // Footer
  doc.setTextColor(GRAY);
  doc.setFontSize(8);
  doc.text(
    "Christina's Child Care Center",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  const safeName = (data.parentName || 'family').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safePeriod = (data.periodLabel || 'statement').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`statement-${safeName}-${safePeriod}.pdf`);
}
