'use client';

import { HelpdeskInbox } from '@/components/support/HelpdeskInbox';

// Owner/admin Helpdesk inbox. The admin route group already gates access; the
// list + media + status APIs independently re-check the admin role, so access
// is enforced twice.
export default function HelpdeskPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Helpdesk</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Site issues reported by owners, staff, and parents. Open one to read it, play the voice
        memo, view the screenshot, and move it through New, In progress, and Resolved.
      </p>
      <HelpdeskInbox />
    </div>
  );
}
