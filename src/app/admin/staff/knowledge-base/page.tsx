'use client';

import { KnowledgeBaseEditor } from '@/components/admin/KnowledgeBaseEditor';
import { Building2 } from 'lucide-react';

export default function OrganizationalOperationsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-7 w-7 text-christina-red" /> Organizational Operations
        </h1>
        <p className="text-muted-foreground text-base">
          Operations, Organizational Handbook, Systems, and Policies and Practices that Minimize Drift
        </p>
        <p className="text-sm text-muted-foreground max-w-3xl pt-2">
          This is the page for all we do, practices we commit to, operations that keep us in flow,
          systems that communicate, and policies that guide us.
        </p>
      </div>
      <KnowledgeBaseEditor />
    </div>
  );
}
