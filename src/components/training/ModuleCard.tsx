'use client';

import { ModuleProgressInfo } from '@/types/training';
import { Check, Lock, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ModuleCardProps {
  info: ModuleProgressInfo;
}

export function ModuleCard({ info }: ModuleCardProps) {
  const { module, status } = info;
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const content = (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 font-body">M{String(module.number).padStart(2, '0')}</span>
        {isCompleted && <Check className="h-4 w-4 text-christina-green" />}
        {isInProgress && <Circle className="h-3 w-3 fill-christina-coral text-christina-coral" />}
        {isLocked && <Lock className="h-3 w-3 text-gray-300" />}
      </div>
      <h3 className="text-sm font-heading font-bold leading-tight mb-1">
        {module.title}
      </h3>
      <p className="text-xs italic text-christina-coral/80 font-body leading-snug mb-2 line-clamp-2">
        {isLocked ? 'Complete the previous module to unlock' : module.contextBridge}
      </p>
      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-body">
        <Clock className="h-3 w-3" />
        <span>{module.format}</span>
      </div>
    </>
  );

  if (isLocked) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-dashed border-gray-200 p-3 opacity-40',
          'cursor-not-allowed select-none'
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/training/module/${module.id}`}
      className={cn(
        'rounded-lg border p-3 transition-all hover:shadow-md block',
        isCompleted && 'border-christina-green/30 bg-green-50/50',
        isInProgress && 'border-christina-coral/30 bg-orange-50/30',
        !isCompleted && !isInProgress && 'border-gray-200 hover:border-christina-blue/30'
      )}
    >
      {content}
    </Link>
  );
}
