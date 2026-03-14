'use client';

import { KnowledgeContribution } from '@/components/employee/KnowledgeContribution';
import { Lightbulb } from 'lucide-react';

export default function EmployeeKnowledgePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-christina-coral" />
          Share Knowledge
        </h1>
        <p className="text-muted-foreground">
          Add a tip, procedure, or piece of know-how to the team knowledge base.
        </p>
      </div>
      <KnowledgeContribution />
    </div>
  );
}
