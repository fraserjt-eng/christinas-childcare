'use client';

import { UnitProgressInfo } from '@/types/training';
import { Lock, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UnitCardProps {
  info: UnitProgressInfo;
  isLast?: boolean;
}

export function UnitCard({ info, isLast }: UnitCardProps) {
  const { unit, status, completedModules, totalModules, progressPercent } = info;

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  return (
    <div className="flex items-center flex-shrink-0">
      {isLocked ? (
        <div
          className={cn(
            'relative w-40 rounded-lg border-2 border-dashed border-gray-300 p-3 opacity-40',
            'cursor-not-allowed select-none'
          )}
        >
          <CardContent unit={unit} completedModules={completedModules} totalModules={totalModules} progressPercent={progressPercent} isLocked />
        </div>
      ) : (
        <Link
          href={`/training/unit/${unit.id}`}
          className={cn(
            'relative w-40 rounded-lg border-2 p-3 transition-all hover:shadow-md',
            isCompleted && 'border-l-4 border-l-christina-green border-christina-green/30 bg-green-50',
            isActive && 'border-l-4 border-l-christina-coral border-christina-coral/30 bg-orange-50'
          )}
        >
          <CardContent unit={unit} completedModules={completedModules} totalModules={totalModules} progressPercent={progressPercent} isCompleted={isCompleted} />
        </Link>
      )}

      {!isLast && (
        <ChevronRight className="mx-1 h-4 w-4 text-gray-300 flex-shrink-0" />
      )}
    </div>
  );
}

function CardContent({
  unit,
  completedModules,
  totalModules,
  progressPercent,
  isLocked,
  isCompleted,
}: {
  unit: UnitProgressInfo['unit'];
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  isLocked?: boolean;
  isCompleted?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-body">Unit {unit.number}</span>
        {isLocked && <Lock className="h-3 w-3 text-gray-400" />}
        {isCompleted && <Check className="h-3 w-3 text-christina-green" />}
      </div>
      <p className="text-sm font-heading font-semibold leading-tight mb-2 line-clamp-2">
        {unit.title}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>{completedModules}/{totalModules}</span>
        <span>{progressPercent}%</span>
      </div>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isCompleted ? 'bg-christina-green' : 'bg-christina-coral'
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </>
  );
}
