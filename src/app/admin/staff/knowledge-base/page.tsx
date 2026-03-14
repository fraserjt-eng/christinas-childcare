'use client';

import { KnowledgeBaseEditor } from '@/components/admin/KnowledgeBaseEditor';
import { BookOpen } from 'lucide-react';

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Staff Knowledge Base
        </h1>
        <p className="text-muted-foreground">Capture and share institutional knowledge</p>
      </div>
      <KnowledgeBaseEditor />
    </div>
  );
}
