'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import {
  SEGMENT_LABELS,
  type Lesson,
  type LessonSegmentItem,
} from '@/types/curriculum';

interface SegmentRefinePanelProps {
  lesson: Lesson | null;
  segmentIndex: number | null;
  open: boolean;
  onClose: () => void;
  onApplied: (newSegment: LessonSegmentItem) => void;
}

const PRESET_NOTES: { label: string; text: string }[] = [
  { label: 'More sensory', text: 'Add more sensory exploration. Children should touch, smell, hear, and see.' },
  { label: 'Lower verbal load', text: 'Reduce the amount of verbal instruction. Show, don\'t tell. Use gestures and modeling.' },
  { label: 'Extend for advanced learners', text: 'Add a stretch activity for children who finish early or are ready for more challenge.' },
  { label: 'Simplify for younger', text: 'Make this simpler for the youngest in the age band. Shorter steps, more familiar materials.' },
  { label: 'More movement', text: 'Add more whole-body movement. The current version is too sedentary.' },
  { label: 'Quieter / calmer', text: 'Lower the energy. Make this segment calmer and more focused.' },
];

export function SegmentRefinePanel({
  lesson,
  segmentIndex,
  open,
  onClose,
  onApplied,
}: SegmentRefinePanelProps) {
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetSegment =
    lesson && segmentIndex !== null ? lesson.segments[segmentIndex] : null;

  const handlePreset = (text: string) => {
    setNotes((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const handleClose = () => {
    setNotes('');
    setError(null);
    setBusy(false);
    onClose();
  };

  const handleRegenerate = async () => {
    if (!lesson || segmentIndex === null) return;
    if (notes.trim().length < 3) {
      setError('Add a short note describing what to change.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/lessons/regenerate-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson,
          segmentIndex,
          adjustmentNotes: notes.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error ?? `Regeneration failed (HTTP ${res.status}).`);
        setBusy(false);
        return;
      }
      onApplied(body.segment as LessonSegmentItem);
      handleClose();
    } catch (e) {
      setError(`Network error: ${(e as Error).message}`);
      setBusy(false);
    }
  };

  if (!lesson || !targetSegment) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-christina-red" />
            Refine {SEGMENT_LABELS[targetSegment.segment]} Segment
          </DialogTitle>
          <DialogDescription>
            Tell the AI what to change. The other segments stay as they are.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current segment summary */}
          <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
            <div className="font-semibold">{targetSegment.title}</div>
            <div className="text-xs text-muted-foreground">
              {targetSegment.duration} min · {SEGMENT_LABELS[targetSegment.segment]}
            </div>
            <p className="text-sm mt-2">{targetSegment.description}</p>
          </div>

          {/* Preset adjustment chips */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Quick adjustments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_NOTES.map((p) => (
                <Badge
                  key={p.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-christina-red hover:text-white transition-colors"
                  onClick={() => handlePreset(p.text)}
                >
                  + {p.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Adjustment notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What should the AI change about this segment?"
              rows={4}
              className="text-sm"
              disabled={busy}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 text-red-700 text-sm p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handleRegenerate}
            disabled={busy || notes.trim().length < 3}
            className="bg-christina-red hover:bg-christina-red/90 text-white"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate Segment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
