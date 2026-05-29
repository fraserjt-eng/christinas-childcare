'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LifeBuoy } from 'lucide-react';
import { ReportIssueForm } from './ReportIssueForm';

// Global "Report an issue" entry point. Mounted in the shared dashboard header
// so it appears in all three portals (owner, staff, parent).
export function ReportIssueButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <LifeBuoy className="h-4 w-4" />
          <span className="hidden sm:inline">Report an issue</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report a site issue</DialogTitle>
          <DialogDescription>
            See something wrong on the site? Tell us here. Type it, record a quick voice memo, or
            add a screenshot.
          </DialogDescription>
        </DialogHeader>
        <ReportIssueForm onSubmitted={() => window.setTimeout(() => setOpen(false), 2500)} />
      </DialogContent>
    </Dialog>
  );
}
