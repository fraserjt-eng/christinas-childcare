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
} from '@/components/ui/dialog';
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
  const [action, setAction] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || !assignedTo || !dueDate) return;

    createActionPlan(recommendationId, action, assignedTo, dueDate);
    setAction('');
    setAssignedTo('');
    setDueDate('');
    onOpenChange(false);
    onCreated();
  };

  // Default due date to 7 days from now
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);
  const defaultDueStr = defaultDue.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Action Plan</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-2">
          Responding to: <span className="font-medium text-foreground">{recommendationTitle}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">What action will you take?</Label>
            <Textarea
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Describe the specific action..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign to</Label>
            <Input
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Staff member name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due by</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate || defaultDueStr}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Plan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
