'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface DecisionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  mode: 'approve' | 'deny';
  recommendationTitle: string;
}

export function DecisionDialog({ open, onClose, onConfirm, mode, recommendationTitle }: DecisionDialogProps) {
  const [reason, setReason] = useState('');
  const isDeny = mode === 'deny';
  const isValid = isDeny ? reason.trim().length >= 10 : true;

  function handleSubmit() {
    if (!isValid) return;
    onConfirm(reason.trim());
    setReason('');
  }

  function handleClose() {
    setReason('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isDeny ? 'Deny Recommendation' : 'Approve Recommendation'}</DialogTitle>
          <DialogDescription className="font-body">
            {recommendationTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="text-sm font-medium font-body">
            {isDeny ? 'Why are you denying this? (required, min 10 characters)' : 'Add a note (optional)'}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isDeny ? 'Explain why this recommendation does not apply...' : 'Optional note...'}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {isDeny && reason.trim().length > 0 && reason.trim().length < 10 && (
            <p className="text-xs text-christina-coral font-body">
              {10 - reason.trim().length} more characters needed
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className={isDeny ? 'bg-christina-coral hover:bg-christina-coral/90' : 'bg-christina-green hover:bg-christina-green/90'}
          >
            {isDeny ? 'Deny' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
