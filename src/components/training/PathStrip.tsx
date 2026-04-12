'use client';

import { UnitProgressInfo } from '@/types/training';
import { UnitCard } from './UnitCard';

interface PathStripProps {
  unitProgress: UnitProgressInfo[];
  compact?: boolean;
}

export function PathStrip({ unitProgress, compact }: PathStripProps) {
  if (unitProgress.length === 0) return null;

  return (
    <div className={compact ? '' : 'mb-6'}>
      {!compact && (
        <p className="text-xs uppercase tracking-widest text-gray-500 font-body mb-3">
          Learning and Development Path
        </p>
      )}
      <div className="flex items-center overflow-x-auto pb-2 gap-0 scrollbar-thin">
        {unitProgress.map((info, idx) => (
          <UnitCard
            key={info.unit.id}
            info={info}
            isLast={idx === unitProgress.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
