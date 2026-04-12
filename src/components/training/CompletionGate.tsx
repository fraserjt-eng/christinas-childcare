'use client';

import { useState } from 'react';
import { Competency, CompetencyLevel, TrainingGateAssessment, TrainingRole } from '@/types/training';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletionGateProps {
  competencies: Competency[];
  assessments: TrainingGateAssessment[];
  onSelfRate: (competencyId: string, rating: CompetencyLevel) => Promise<void>;
  role: TrainingRole;
}

export function CompletionGate({ competencies, assessments, onSelfRate, role }: CompletionGateProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const relevantCompetencies = competencies.filter(c => c.roles.includes(role));

  return (
    <div className="space-y-3">
      {relevantCompetencies.map(competency => {
        const assessment = assessments.find(a => a.competency_id === competency.id);
        const isExpanded = expandedId === competency.id;
        const selfRating = assessment?.self_rating;
        const adminRating = assessment?.admin_rating;

        const selfOk = selfRating === 'independent' || selfRating === 'mentor';
        const adminOk = adminRating === 'independent' || adminRating === 'mentor';
        const isPassed = selfOk && adminOk;

        return (
          <Card key={competency.id} className={cn(
            isPassed && 'border-christina-green/30 bg-green-50/30'
          )}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : competency.id)}
                    className="flex items-center gap-1 text-left w-full"
                  >
                    <span className="text-xs text-gray-400 font-mono mr-1">
                      {competency.number}.
                    </span>
                    <span className="text-sm font-heading font-semibold flex-1">
                      {competency.title}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Self rating */}
                  <div className="w-32">
                    <Select
                      value={selfRating || ''}
                      onValueChange={async (value) => {
                        setSubmitting(competency.id);
                        await onSelfRate(competency.id, value as CompetencyLevel);
                        setSubmitting(null);
                      }}
                      disabled={submitting === competency.id}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Self-rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guided">Guided</SelectItem>
                        <SelectItem value="independent">Independent</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Admin rating */}
                  <div className="w-24 text-center">
                    {adminRating ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          adminOk && 'border-christina-green text-christina-green',
                          !adminOk && 'border-christina-coral text-christina-coral'
                        )}
                      >
                        {adminRating}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Pass indicator */}
                  {isPassed && (
                    <Check className="h-4 w-4 text-christina-green" />
                  )}
                </div>
              </div>

              {/* Expanded indicators */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  {(['guided', 'independent', 'mentor'] as CompetencyLevel[]).map(level => (
                    <div key={level} className="flex items-start gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs flex-shrink-0 w-24 justify-center',
                          level === 'guided' && 'border-christina-coral/50',
                          level === 'independent' && 'border-christina-blue/50',
                          level === 'mentor' && 'border-christina-green/50'
                        )}
                      >
                        {level}
                      </Badge>
                      <p className="text-xs text-gray-600 font-body">
                        {competency.levels[level]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
