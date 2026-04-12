'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getUnitById } from '@/lib/training/units';

interface CarryoverStripProps {
  unitNumber: number;
}

const carryoverSummaries: Record<number, string> = {
  2: 'You can log in, navigate your portal, manage your profile, and use the kiosk. Foundation skills are in place.',
  3: 'You track attendance, submit meal counts, upload photos, manage tasks, and review daily reports. The daily rhythm is established.',
  4: 'You communicate with families through messaging, newsletters, and the parent portal. Trust is being built.',
  5: 'You maintain CACFP compliance, monitor ratios, file incident reports, and track certifications. Safety systems are active.',
  6: 'You build schedules, manage HR documents, process payroll, and onboard new staff. Operations are running.',
  7: 'You manage the enrollment pipeline, conduct tours, track authorizations, and maintain the public website. Growth is happening.',
  8: 'You plan budgets, forecast revenue, and identify cost optimization opportunities. Financial intelligence is working.',
};

export function CarryoverStrip({ unitNumber }: CarryoverStripProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (unitNumber <= 1) return null;

  const prevUnit = getUnitById(`unit-${unitNumber - 1}`);
  const summary = carryoverSummaries[unitNumber];

  if (!summary || !prevUnit) return null;

  return (
    <div className="bg-green-50 border border-christina-green/20 rounded-lg p-3 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-heading font-semibold text-christina-green">
          Carried from Unit {unitNumber - 1}: {prevUnit.title}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-christina-green" />
        ) : (
          <ChevronDown className="h-4 w-4 text-christina-green" />
        )}
      </button>
      {isExpanded && (
        <p className="text-sm text-gray-600 font-body mt-2">{summary}</p>
      )}
    </div>
  );
}
