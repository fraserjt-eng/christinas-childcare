'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, History } from 'lucide-react';
import { RecommendationDecision } from '@/lib/intelligence/types';

interface DecisionLogProps {
  decisions: RecommendationDecision[];
}

export function DecisionLog({ decisions }: DecisionLogProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (decisions.length === 0) return null;

  const visible = showAll ? decisions : decisions.slice(0, 20);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold font-heading text-muted-foreground hover:text-foreground w-full"
      >
        <History className="h-4 w-4" />
        Decision Log ({decisions.length})
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {visible.map((d) => (
            <Card key={d.id} className="border-l-2 border-l-muted">
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge
                        className={`border-0 text-xs ${
                          d.decision === 'approved'
                            ? 'bg-christina-green/10 text-christina-green'
                            : 'bg-christina-coral/10 text-christina-coral'
                        }`}
                      >
                        {d.decision === 'approved' ? 'Approved' : 'Denied'}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-body">
                        {new Date(d.decidedAt).toLocaleDateString()} at{' '}
                        {new Date(d.decidedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{d.recommendationTitle}</p>
                    {d.reason && (
                      <p className="text-xs text-muted-foreground font-body mt-1">
                        Reason: {d.reason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {decisions.length > 20 && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setShowAll(true)}
            >
              Show all {decisions.length} decisions
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
