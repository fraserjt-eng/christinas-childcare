'use client';

import { useState } from 'react';
import { ExplorePage } from '@/types/training';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExploreActivityProps {
  title: string;
  pages: ExplorePage[];
  onComplete: () => void;
}

export function ExploreActivity({ pages, onComplete }: ExploreActivityProps) {
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const minRequired = Math.min(3, pages.length);
  const canComplete = visited.size >= minRequired;

  const handleVisit = (path: string) => {
    window.open(path, '_blank', 'noopener,noreferrer');
    setVisited(prev => new Set(prev).add(path));
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 font-body">
        Visit at least {minRequired} of these pages to continue. Click each one to open it in a new tab.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pages.map(page => {
          const isVisited = visited.has(page.path);
          return (
            <button
              key={page.path}
              onClick={() => handleVisit(page.path)}
              className={cn(
                'text-left p-3 rounded-lg border-2 transition-all group',
                isVisited
                  ? 'border-christina-green/40 bg-green-50/50'
                  : 'border-gray-200 hover:border-christina-blue/40 hover:bg-blue-50/30'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isVisited ? (
                      <Check className="h-3.5 w-3.5 text-christina-green flex-shrink-0" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    )}
                    <p className="text-sm font-heading font-semibold text-gray-800 truncate">{page.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 font-body mt-0.5 line-clamp-2">{page.description}</p>
                  <p className="text-xs font-mono text-christina-blue/60 mt-1">{page.path}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-christina-blue flex-shrink-0 mt-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-body">
          {visited.size} of {minRequired} required pages visited
        </span>
        <Button
          onClick={onComplete}
          disabled={!canComplete}
          size="sm"
          className="bg-christina-green hover:bg-christina-green/90 text-xs disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Done Exploring
        </Button>
      </div>
    </div>
  );
}
