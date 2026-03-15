// Schedule PDF Generation — Christina's Child Care Center
// Uses jsPDF (v4) with dynamic import to avoid SSR issues.

import { getShifts, shiftHours } from '@/lib/schedule-optimizer-storage';

const CHRISTINA_RED_RGB: [number, number, number] = [198, 40, 40];
const HEADER_GRAY_RGB: [number, number, number] = [80, 80, 80];
const ROW_ALT_RGB: [number, number, number] = [249, 245, 244];
const BORDER_RGB: [number, number, number] = [220, 214, 213];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function formatTimePdf(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${period}`;
}

function getMondayOfWeek(weekStart: string): Date {
  return new Date(weekStart + 'T12:00:00');
}

function dateStrFromMonday(monday: Date, offset: number): string {
  const d = new Date(monday);
  d.setDate(monday.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatWeekRangePdf(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const start = monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const end = friday.toLocaleDateString('en-US', opts);
  return `${start} – ${end}`;
}

export async function generateWeeklySchedulePdf(weekStart: string): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });

  const monday = getMondayOfWeek(weekStart);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...CHRISTINA_RED_RGB);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", margin, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Weekly Staff Schedule', margin, 17);

  doc.setTextColor(255, 220, 220);
  doc.setFontSize(9);
  doc.text(`Week of ${formatWeekRangePdf(monday)}`, pageWidth - margin, 10, { align: 'right' });

  // ── Collect Data ─────────────────────────────────────────────────────────────
  const weekShifts = getShifts({ week_start: weekStart });
  const dates = DAY_NAMES.map((_, i) => dateStrFromMonday(monday, i));

  const STAFF_IDS = ['emp-oz', 'emp-cf', 'emp-ms', 'emp-jr', 'emp-sk', 'emp-dc', 'emp-lj', 'emp-sz'];
  const STAFF_NAMES: Record<string, string> = {
    'emp-oz': 'Ophelia Zeogar',
    'emp-cf': 'Christina Fraser',
    'emp-ms': 'Maria Santos',
    'emp-jr': 'James Robinson',
    'emp-sk': 'Sarah Kim',
    'emp-dc': 'David Chen',
    'emp-lj': 'Lisa Johnson',
    'emp-sz': 'Stephen Zeogar',
  };

  // ── Table ────────────────────────────────────────────────────────────────────
  const tableTop = 28;
  const colWidths = [44, 33, 33, 33, 33, 33, 28]; // Employee, Mon-Fri, Total
  const headers = ['Employee', ...DAY_NAMES, 'Total Hrs'];
  const rowHeight = 10;

  // Table header row
  doc.setFillColor(...HEADER_GRAY_RGB);
  doc.rect(margin, tableTop, contentWidth, rowHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  let cx = margin;
  headers.forEach((h, i) => {
    doc.text(h, cx + 2, tableTop + 7);
    cx += colWidths[i];
  });

  // Data rows
  let y = tableTop + rowHeight;

  STAFF_IDS.forEach((empId, rowIdx) => {
    const empShifts = weekShifts.filter(s => s.employee_id === empId);
    const totalHours = empShifts.reduce((sum, s) => sum + shiftHours(s), 0);
    const isOvertimeEmployee = totalHours > 40;

    // Alternating row background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(...ROW_ALT_RGB);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    // Row border
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, contentWidth, rowHeight);

    // Employee name
    doc.setTextColor(...HEADER_GRAY_RGB);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(STAFF_NAMES[empId] || empId, margin + 2, y + 7);

    // Day cells
    let dcx = margin + colWidths[0];
    dates.forEach((date, di) => {
      const dayShifts = empShifts.filter(s => s.date === date);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(50, 50, 50);

      if (dayShifts.length > 0) {
        const s = dayShifts[0];
        const label = `${formatTimePdf(s.start_time)}-${formatTimePdf(s.end_time)}`;
        doc.text(label, dcx + 2, y + 5);
        const hrs = shiftHours(s);
        doc.setTextColor(130, 130, 130);
        doc.text(`${hrs.toFixed(1)}h`, dcx + 2, y + 9);
      } else {
        doc.setTextColor(200, 200, 200);
        doc.text('—', dcx + colWidths[di + 1] / 2, y + 7, { align: 'center' });
      }
      dcx += colWidths[di + 1];
    });

    // Total hours
    const totalX = margin + colWidths[0] + colWidths[1] * 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    if (isOvertimeEmployee) {
      doc.setTextColor(198, 40, 40);
    } else {
      doc.setTextColor(50, 100, 50);
    }
    doc.text(`${totalHours.toFixed(1)}h`, totalX + 2, y + 7);

    y += rowHeight;
  });

  // ── Footer ────────────────────────────────────────────────────────────────────
  const generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(`Generated on ${generatedAt}`, margin, pageHeight - 8);
  doc.text('Christina\'s Child Care Center — Confidential', pageWidth - margin, pageHeight - 8, { align: 'right' });

  // ── Download ──────────────────────────────────────────────────────────────────
  const filename = `schedule-week-of-${weekStart}.pdf`;
  doc.save(filename);
}

export async function generateMonthlySchedulePdf(month: string): Promise<void> {
  // month format: YYYY-MM
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const [year, monthNum] = month.split('-').map(Number);
  const monthDate = new Date(year, monthNum - 1, 1);
  const monthLabel = formatMonthYear(monthDate);

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...CHRISTINA_RED_RGB);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", margin, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Schedule — ${monthLabel}`, margin, 17);

  // ── Collect Data ─────────────────────────────────────────────────────────────
  // Collect all shifts for the month by iterating weeks
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const allShifts = getShifts().filter(s => s.date.startsWith(month));

  const STAFF_IDS = ['emp-oz', 'emp-cf', 'emp-ms', 'emp-jr', 'emp-sk', 'emp-dc', 'emp-lj', 'emp-sz'];
  const STAFF_NAMES: Record<string, string> = {
    'emp-oz': 'Ophelia Zeogar',
    'emp-cf': 'Christina Fraser',
    'emp-ms': 'Maria Santos',
    'emp-jr': 'James Robinson',
    'emp-sk': 'Sarah Kim',
    'emp-dc': 'David Chen',
    'emp-lj': 'Lisa Johnson',
    'emp-sz': 'Stephen Zeogar',
  };

  // ── Summary Table ─────────────────────────────────────────────────────────────
  let y = 30;

  doc.setTextColor(...HEADER_GRAY_RGB);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Staff Summary', margin, y);
  y += 6;

  const summaryColWidths = [52, 28, 26, 28, 36];
  const summaryHeaders = ['Employee', 'Total Hrs', 'Shifts', 'OT Hrs', 'Est. Cost'];
  const summaryRowH = 9;

  // Summary header
  doc.setFillColor(...HEADER_GRAY_RGB);
  doc.rect(margin, y, summaryColWidths.reduce((a, b) => a + b, 0), summaryRowH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  let scx = margin;
  summaryHeaders.forEach((h, i) => {
    doc.text(h, scx + 2, y + 6);
    scx += summaryColWidths[i];
  });
  y += summaryRowH;

  STAFF_IDS.forEach((empId, rowIdx) => {
    const empShifts = allShifts.filter(s => s.employee_id === empId);
    const totalHours = empShifts.reduce((sum, s) => sum + shiftHours(s), 0);
    const overtimeHours = empShifts.filter(s => s.is_overtime).reduce((sum, s) => sum + shiftHours(s), 0);
    const rate = empShifts[0]?.hourly_rate || 0;
    const estCost = totalHours * rate;

    if (rowIdx % 2 === 0) {
      doc.setFillColor(...ROW_ALT_RGB);
      doc.rect(margin, y, summaryColWidths.reduce((a, b) => a + b, 0), summaryRowH, 'F');
    }
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, summaryColWidths.reduce((a, b) => a + b, 0), summaryRowH);

    let scx2 = margin;
    const cells = [
      STAFF_NAMES[empId],
      `${totalHours.toFixed(1)}h`,
      `${empShifts.length}`,
      overtimeHours > 0 ? `${overtimeHours.toFixed(1)}h` : '—',
      rate > 0 ? `$${estCost.toFixed(0)}` : '—',
    ];

    cells.forEach((val, ci) => {
      doc.setFont('helvetica', ci === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      if (ci === 3 && overtimeHours > 0) {
        doc.setTextColor(198, 40, 40);
      } else {
        doc.setTextColor(60, 60, 60);
      }
      doc.text(val, scx2 + 2, y + 6);
      scx2 += summaryColWidths[ci];
    });

    y += summaryRowH;
  });

  y += 8;

  // ── Shift Detail Table ────────────────────────────────────────────────────────
  doc.setTextColor(...HEADER_GRAY_RGB);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('All Shifts', margin, y);
  y += 6;

  const detailColWidths = [52, 28, 28, 28, 28];
  const detailHeaders = ['Employee', 'Date', 'Start', 'End', 'Hours'];
  const detailRowH = 8;

  doc.setFillColor(...HEADER_GRAY_RGB);
  doc.rect(margin, y, detailColWidths.reduce((a, b) => a + b, 0), detailRowH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  let dhcx = margin;
  detailHeaders.forEach((h, i) => {
    doc.text(h, dhcx + 2, y + 5.5);
    dhcx += detailColWidths[i];
  });
  y += detailRowH;

  const sortedShifts = Array.from(allShifts).sort((a, b) => a.date.localeCompare(b.date) || a.employee_name.localeCompare(b.employee_name));

  sortedShifts.forEach((shift, rowIdx) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    if (rowIdx % 2 === 0) {
      doc.setFillColor(...ROW_ALT_RGB);
      doc.rect(margin, y, detailColWidths.reduce((a, b) => a + b, 0), detailRowH, 'F');
    }
    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, detailColWidths.reduce((a, b) => a + b, 0), detailRowH);

    const dateLabel = new Date(shift.date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', weekday: 'short',
    });
    const cells2 = [
      shift.employee_name,
      dateLabel,
      formatTimePdf(shift.start_time),
      formatTimePdf(shift.end_time),
      `${shiftHours(shift).toFixed(1)}h`,
    ];

    let dcx2 = margin;
    cells2.forEach((val, ci) => {
      doc.setFont('helvetica', ci === 0 ? 'bold' : 'normal');
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      doc.text(val, dcx2 + 2, y + 5.5);
      dcx2 += detailColWidths[ci];
    });

    y += detailRowH;
  });

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setPage(doc.getNumberOfPages());
  const generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(`Generated on ${generatedAt}`, margin, pageHeight - 8);
  doc.text(`${daysInMonth} days — ${allShifts.length} total shifts`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  // ── Download ──────────────────────────────────────────────────────────────────
  doc.save(`schedule-month-of-${month}.pdf`);
}
