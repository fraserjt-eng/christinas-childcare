'use client';

import { SectionType, SectionStatus } from '@/types/training';
import { Check, Lock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionTabsProps {
  activeSection: SectionType;
  sectionStatuses: Record<SectionType, SectionStatus>;
  onSectionChange: (section: SectionType) => void;
}

const sections: { type: SectionType; label: string }[] = [
  { type: 'learn', label: 'Learn' },
  { type: 'practice', label: 'Practice' },
  { type: 'check', label: 'Check' },
];

export function SectionTabs({ activeSection, sectionStatuses, onSectionChange }: SectionTabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      {sections.map(({ type, label }) => {
        const status = sectionStatuses[type];
        const isActive = activeSection === type;
        const isLocked = status === 'locked';
        const isCompleted = status === 'completed';

        return (
          <button
            key={type}
            onClick={() => !isLocked && onSectionChange(type)}
            disabled={isLocked}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-heading font-semibold transition-all border-b-2',
              isActive && 'border-christina-red text-christina-red',
              !isActive && !isLocked && 'border-transparent text-gray-500 hover:text-gray-700',
              isLocked && 'border-transparent text-gray-300 cursor-not-allowed'
            )}
          >
            {isCompleted && <Check className="h-3.5 w-3.5 text-christina-green" />}
            {isLocked && <Lock className="h-3 w-3" />}
            {!isCompleted && !isLocked && isActive && (
              <Circle className="h-2.5 w-2.5 fill-christina-coral text-christina-coral" />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
