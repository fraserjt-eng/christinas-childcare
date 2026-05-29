'use client';

import { ReportIssueForm } from './ReportIssueForm';
import { MyTicketsList } from './MyTicketsList';

// Shared body for the per-portal "Report an Issue" page (owner, staff, parent).
export function SupportPageBody() {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-heading font-bold text-foreground">Report an Issue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See something wrong on the site? Tell us here. You can type it, record a quick voice memo,
          and add a screenshot. We will take a look and get it fixed.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Send a new report</h2>
        <div className="rounded-lg border bg-white p-4">
          <ReportIssueForm />
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Your reports</h2>
        <MyTicketsList />
      </section>
    </div>
  );
}
