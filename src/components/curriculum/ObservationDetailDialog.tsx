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
import { FileText, MessageSquare, Calendar, User } from 'lucide-react';
import jsPDF from 'jspdf';

interface Observation {
  child: string;
  date: string;
  note: string;
  teacher: string;
}

interface ObservationDetailDialogProps {
  observation: Observation | null;
  room: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateObservationPDF(observation: Observation, room: string) {
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
  doc.text('Observation Report', pageWidth / 2, 25, { align: 'center' });

  y = 45;

  // Child Info Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(observation.child, margin + 10, y + 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#6B7280');
  doc.text(`Room: ${room}`, margin + 10, y + 18);
  doc.text(`Date: ${observation.date}`, margin + 80, y + 18);
  doc.text(`Observer: ${observation.teacher}`, margin + 10, y + 25);

  y += 40;

  // Observation Notes
  doc.setTextColor('#C62828');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Observation Notes', margin, y);
  y += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const noteLines = doc.splitTextToSize(observation.note, pageWidth - margin * 2);
  doc.text(noteLines, margin, y);
  y += noteLines.length * 6 + 15;

  // Follow-up section
  doc.setTextColor('#2196F3');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Follow-Up Actions', margin, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const actions = [
    '☐ Share with family',
    '☐ Add to child\'s portfolio',
    '☐ Discuss with teaching team',
    '☐ Plan follow-up activity',
    '☐ Document in developmental record',
  ];
  actions.forEach((action) => {
    doc.text(action, margin + 5, y);
    y += 6;
  });

  y += 10;

  // Additional notes lines
  doc.setTextColor('#C62828');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Additional Notes', margin, y);
  y += 8;

  doc.setDrawColor(230, 230, 230);
  for (let i = 0; i < 8; i++) {
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor('#6B7280');
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} | ${observation.child} - ${observation.date}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`observation-${observation.child.toLowerCase().replace(/\s+/g, '-')}-${observation.date.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export function ObservationDetailDialog({ observation, room, open, onOpenChange }: ObservationDetailDialogProps) {
  if (!observation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-christina-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="h-5 w-5 text-christina-blue" />
            </div>
            <div>
              <DialogTitle>{observation.child}</DialogTitle>
              <DialogDescription>Teacher Observation — {room} Room</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{observation.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{observation.teacher}</span>
          </div>
          <Badge variant="outline" className="text-xs">{room} Room</Badge>
        </div>

        {/* Observation Note */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Observation</h4>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{observation.note}</p>
          </div>
        </div>

        {/* PDF Button */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full"
            onClick={() => generateObservationPDF(observation, room)}
          >
            <FileText className="h-4 w-4" />
            Download Observation Report PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
