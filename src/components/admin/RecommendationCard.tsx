'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ClipboardList } from 'lucide-react';
import { AIRecommendation } from '@/lib/intelligence/types';

const PRIORITY_BORDER = {
  high: 'border-l-christina-coral',
  medium: 'border-l-christina-yellow',
  low: 'border-l-christina-green',
} as const;

const PRIORITY_BADGE = {
  high: 'bg-christina-coral/10 text-christina-coral',
  medium: 'bg-christina-yellow/10 text-christina-yellow',
  low: 'bg-christina-green/10 text-christina-green',
} as const;

const CATEGORY_BADGE = {
  training: 'bg-christina-blue/10 text-christina-blue',
  staffing: 'bg-purple-100 text-purple-700',
  operations: 'bg-christina-yellow/10 text-christina-yellow',
  compliance: 'bg-christina-coral/10 text-christina-coral',
  revenue: 'bg-christina-green/10 text-christina-green',
} as const;

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  onRespond?: (id: string, title: string) => void;
}

export function RecommendationCard({ recommendation, onApprove, onDeny, onRespond }: RecommendationCardProps) {
  const decided = recommendation.status !== 'pending';

  return (
    <Card className={`border-l-4 ${PRIORITY_BORDER[recommendation.priority]} ${decided ? 'opacity-70' : ''}`}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className={`${CATEGORY_BADGE[recommendation.category]} border-0 text-xs`}>
                {recommendation.category}
              </Badge>
              <Badge className={`${PRIORITY_BADGE[recommendation.priority]} border-0 text-xs`}>
                {recommendation.priority}
              </Badge>
              {decided && (
                <Badge className={`border-0 text-xs ${recommendation.status === 'approved' ? 'bg-christina-green/10 text-christina-green' : 'bg-christina-coral/10 text-christina-coral'}`}>
                  {recommendation.status === 'approved' ? 'Approved' : 'Denied'}
                </Badge>
              )}
            </div>
            <p className="font-semibold text-sm mb-1">{recommendation.title}</p>
            <p className="text-sm text-muted-foreground font-body">{recommendation.recommendation}</p>
            {recommendation.basedOn.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground font-body">Based on:</p>
                <ul className="mt-1 space-y-0.5">
                  {recommendation.basedOn.map((source, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {!decided && (
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-christina-green border-christina-green/30 hover:bg-christina-green/10"
                onClick={() => onApprove(recommendation.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-christina-coral border-christina-coral/30 hover:bg-christina-coral/10"
                onClick={() => onDeny(recommendation.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Deny
              </Button>
              {onRespond && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-christina-blue border-christina-blue/30 hover:bg-christina-blue/10"
                  onClick={() => onRespond(recommendation.id, recommendation.title)}
                >
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Respond
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
