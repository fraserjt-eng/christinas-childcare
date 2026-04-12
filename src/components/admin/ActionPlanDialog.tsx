'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Target, Search } from 'lucide-react';
import { createActionPlan } from '@/lib/intelligence/action-plan-storage';

interface ActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendationId: string;
  recommendationTitle: string;
  onCreated: () => void;
}

export function ActionPlanDialog({
  open,
  onOpenChange,
  recommendationId,
  recommendationTitle,
  onCreated,
}: ActionPlanDialogProps) {
  // Root cause analysis
  const [problemStatement, setProblemStatement] = useState('');
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const [identifiedRootCause, setIdentifiedRootCause] = useState('');

  // Action plan
  const [action, setAction] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [successMeasure, setSuccessMeasure] = useState('');
  const [notes, setNotes] = useState('');

  // Default due date: 7 days out
  const defaultDue = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();

  function resetForm() {
    setProblemStatement('');
    setWhys(['', '', '', '', '']);
    setIdentifiedRootCause('');
    setAction('');
    setAssignedTo('');
    setDueDate('');
    setSuccessMeasure('');
    setNotes('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!action.trim() || !assignedTo.trim()) return;

    createActionPlan({
      recommendationId,
      action: action.trim(),
      assignedTo: assignedTo.trim(),
      dueDate: dueDate || defaultDue,
      problemStatement: problemStatement.trim() || undefined,
      whys: whys.some((w) => w.trim()) ? whys.map((w) => w.trim()) : undefined,
      identifiedRootCause: identifiedRootCause.trim() || undefined,
      successMeasure: successMeasure.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    resetForm();
    onOpenChange(false);
    onCreated();
  }

  function updateWhy(index: number, value: string) {
    setWhys((prev) => prev.map((w, i) => (i === index ? value : w)));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-christina-red" />
            Create Action Plan
          </DialogTitle>
          <DialogDescription className="text-xs">
            Responding to: <span className="font-medium">{recommendationTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Root Cause Analysis Section */}
          <div className="rounded-lg border border-christina-blue/30 bg-christina-blue/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-christina-blue" />
              <h3 className="font-semibold text-sm text-christina-blue uppercase tracking-wide">
                Root Cause Analysis
              </h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Name the real problem before jumping to the solution. Optional but
              recommended.
            </p>

            <div className="space-y-2">
              <Label htmlFor="problem-statement">Problem Statement</Label>
              <Textarea
                id="problem-statement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="What does the data tell us? What is the gap?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>5 Whys</Label>
              <div className="space-y-2">
                {whys.map((why, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christina-blue text-white text-xs font-semibold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <Input
                      value={why}
                      onChange={(e) => updateWhy(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Why is this happening?' : 'Why?'}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="root-cause">Identified Root Cause</Label>
              <Input
                id="root-cause"
                value={identifiedRootCause}
                onChange={(e) => setIdentifiedRootCause(e.target.value)}
                placeholder="The underlying systemic reason..."
              />
            </div>
          </div>

          {/* Action Plan Section */}
          <div className="rounded-lg border border-christina-red/30 bg-christina-red/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-christina-red" />
              <h3 className="font-semibold text-sm text-christina-red uppercase tracking-wide">
                Action Plan
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">
                What will we do? <span className="text-christina-red">*</span>
              </Label>
              <Textarea
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Describe the specific action..."
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="assigned-to">
                  Who? <span className="text-christina-red">*</span>
                </Label>
                <Input
                  id="assigned-to"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Staff name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">By when?</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate || defaultDue}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success-measure">Success measure?</Label>
                <Input
                  id="success-measure"
                  value={successMeasure}
                  onChange={(e) => setSuccessMeasure(e.target.value)}
                  placeholder="How we know"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional context..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-christina-red hover:bg-christina-red/90"
              disabled={!action.trim() || !assignedTo.trim()}
            >
              Create Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
