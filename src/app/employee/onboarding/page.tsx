'use client';

import { OnboardingChecklist } from '@/components/employee/OnboardingChecklist';
import { ClipboardList } from 'lucide-react';

export default function EmployeeOnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-christina-blue" />
          My Onboarding
        </h1>
        <p className="text-muted-foreground">
          Complete each task as you go. Check off self-check items yourself and request sign-offs from your director.
        </p>
      </div>
      <OnboardingChecklist />
    </div>
  );
}
