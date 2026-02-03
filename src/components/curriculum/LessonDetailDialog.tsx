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
import { Clock, FileText, Users, BookOpen, Download } from 'lucide-react';
import {
  Lesson,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
  SEGMENT_LABELS,
  getSegmentColor,
} from '@/types/curriculum';
import { generateLessonPDF } from '@/lib/pdf/lesson-pdf';
import { generateActivityCards } from '@/lib/pdf/activity-cards';
import { generateParentLetter } from '@/lib/pdf/parent-letter';
import { generateAssessmentChecklist } from '@/lib/pdf/assessment-checklist';

interface LessonDetailDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonDetailDialog({ lesson, open, onOpenChange }: LessonDetailDialogProps) {
  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-christina-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="h-5 w-5 text-christina-red" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {AGE_GROUP_LABELS[lesson.ageGroup]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {DOMAIN_LABELS[lesson.domain]}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {lesson.duration} min
                </Badge>
                {lesson.theme && (
                  <Badge variant="outline" className="text-xs">
                    {lesson.theme}
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Objectives */}
        <div className="mt-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Learning Objectives</h4>
          <ul className="space-y-1">
            {lesson.objectives.map((obj) => (
              <li key={obj} className="flex items-start gap-2 text-sm">
                <span className="text-christina-red mt-0.5">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Materials */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Materials</h4>
          <div className="flex flex-wrap gap-1.5">
            {lesson.materials.map((m) => (
              <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
            ))}
          </div>
        </div>

        {/* Segments */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Lesson Segments</h4>
          <div className="space-y-4">
            {lesson.segments.map((segment, index) => (
              <div key={segment.segment} className="border rounded-lg overflow-hidden">
                <div className={`${getSegmentColor(segment.segment)} px-4 py-2 flex items-center justify-between`}>
                  <span className="font-semibold text-sm text-white">
                    {index + 1}. {SEGMENT_LABELS[segment.segment]}
                  </span>
                  <Badge className="bg-white/20 text-white text-xs">{segment.duration} min</Badge>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm">{segment.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase mb-1">Teacher Actions</p>
                      <p className="text-sm">{segment.teacherActions}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-1">Child Actions</p>
                      <p className="text-sm">{segment.childActions}</p>
                    </div>
                  </div>

                  {segment.materials.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Materials</p>
                      <div className="flex flex-wrap gap-1">
                        {segment.materials.map((m) => (
                          <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase mb-1">Simplify</p>
                      <p className="text-sm">{segment.adaptations.simplify}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase mb-1">Extend</p>
                      <p className="text-sm">{segment.adaptations.extend}</p>
                    </div>
                  </div>

                  {segment.assessmentOpportunity && (
                    <div className="bg-christina-red/5 rounded-lg p-3">
                      <p className="text-xs font-semibold text-christina-red uppercase mb-1">Assessment Opportunity</p>
                      <p className="text-sm">{segment.assessmentOpportunity}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Download Buttons */}
        <div className="border-t pt-4 mt-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Download PDFs</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => generateLessonPDF(lesson)}
            >
              <FileText className="h-4 w-4" />
              Lesson Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => generateActivityCards(lesson)}
            >
              <Download className="h-4 w-4" />
              Activity Cards
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => generateParentLetter(lesson)}
            >
              <Users className="h-4 w-4" />
              Parent Letter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => generateAssessmentChecklist(lesson)}
            >
              <BookOpen className="h-4 w-4" />
              Assessment Checklist
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
