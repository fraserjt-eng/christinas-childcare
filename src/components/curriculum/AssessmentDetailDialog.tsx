'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Users } from 'lucide-react';
import jsPDF from 'jspdf';

interface Assessment {
  child: string;
  area: string;
  score: number;
  notes: string;
}

interface AssessmentDetailDialogProps {
  assessment: Assessment | null;
  room: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RUBRIC_LABELS: Record<number, { label: string; description: string }> = {
  1: { label: 'Beginning', description: 'Skill not yet observed or just emerging. Requires significant support.' },
  2: { label: 'Developing', description: 'Skill is developing with consistent adult support and scaffolding.' },
  3: { label: 'Approaching', description: 'Skill is demonstrated with occasional support. Becoming more consistent.' },
  4: { label: 'Meeting', description: 'Skill is demonstrated independently and consistently in familiar contexts.' },
  5: { label: 'Exceeding', description: 'Skill is demonstrated independently in new contexts. Child may help peers.' },
};

function generateAssessmentPDF(assessment: Assessment, room: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFillColor('#C62828');
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Christina's Child Care Center", pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Individual Assessment Report', pageWidth / 2, 25, { align: 'center' });

  y = 45;

  // Child Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.child, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#6B7280');
  doc.text(`Room: ${room} | Date: ${new Date().toLocaleDateString()}`, margin, y);
  y += 15;

  // Assessment Area
  doc.setTextColor('#C62828');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Developmental Area', margin, y);
  y += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(assessment.area, margin, y);
  y += 12;

  // Score & Rubric
  doc.setTextColor('#C62828');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Level', margin, y);
  y += 10;

  // Score boxes
  for (let s = 1; s <= 5; s++) {
    const x = margin + (s - 1) * 33;
    if (s <= assessment.score) {
      doc.setFillColor('#C62828');
      doc.roundedRect(x, y, 28, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setDrawColor('#D1D5DB');
      doc.roundedRect(x, y, 28, 12, 2, 2, 'S');
      doc.setTextColor('#9CA3AF');
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${s}`, x + 5, y + 8);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(RUBRIC_LABELS[s].label, x + 10, y + 8);
  }
  y += 18;

  const rubric = RUBRIC_LABELS[assessment.score];
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${assessment.score}/5 - ${rubric.label}`, margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#6B7280');
  doc.text(rubric.description, margin, y);
  y += 15;

  // Rubric Scale
  doc.setTextColor('#2196F3');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Rubric Scale', margin, y);
  y += 8;

  doc.setFontSize(9);
  for (let s = 1; s <= 5; s++) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${s} - ${RUBRIC_LABELS[s].label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#6B7280');
    const lines = doc.splitTextToSize(RUBRIC_LABELS[s].description, pageWidth - margin * 2 - 5);
    doc.text(lines, margin + 5, y + 5);
    y += 5 + lines.length * 4 + 3;
  }
  y += 10;

  // Teacher Notes
  doc.setTextColor('#C62828');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Observations', margin, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const noteLines = doc.splitTextToSize(assessment.notes, pageWidth - margin * 2);
  doc.text(noteLines, margin, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor('#6B7280');
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} | ${assessment.child} - ${assessment.area}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`assessment-${assessment.child.toLowerCase().replace(/\s+/g, '-')}-${assessment.area.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export function AssessmentDetailDialog({ assessment, room, open, onOpenChange }: AssessmentDetailDialogProps) {
  if (!assessment) return null;

  const rubric = RUBRIC_LABELS[assessment.score];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-christina-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="h-5 w-5 text-christina-red" />
            </div>
            <div>
              <DialogTitle>{assessment.child}</DialogTitle>
              <DialogDescription className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{assessment.area}</Badge>
                <Badge variant="outline" className="text-xs">{room} Room</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Score */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Performance Level</h4>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${
                  s <= assessment.score
                    ? 'bg-christina-red text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span>{s}</span>
              </div>
            ))}
            <span className="text-sm text-muted-foreground ml-2">{assessment.score}/5</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="font-semibold text-sm">{rubric.label}</p>
            <p className="text-sm text-muted-foreground">{rubric.description}</p>
          </div>
        </div>

        {/* Rubric */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Full Rubric</h4>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex items-start gap-2 p-2 rounded text-sm ${
                  s === assessment.score ? 'bg-christina-red/10 border border-christina-red/20' : 'bg-muted/30'
                }`}
              >
                <span className="font-bold w-4 flex-shrink-0">{s}</span>
                <div>
                  <span className="font-semibold">{RUBRIC_LABELS[s].label}</span>
                  <span className="text-muted-foreground"> — {RUBRIC_LABELS[s].description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Teacher Notes</h4>
          <p className="text-sm bg-muted/30 rounded-lg p-3">{assessment.notes}</p>
        </div>

        {/* PDF Button */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full"
            onClick={() => generateAssessmentPDF(assessment, room)}
          >
            <FileText className="h-4 w-4" />
            Download Assessment Report PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
