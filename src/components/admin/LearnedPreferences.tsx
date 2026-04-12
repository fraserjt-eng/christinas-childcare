'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ThumbsUp, ThumbsDown } from 'lucide-react';

export interface LearnedData {
  preferences: string[];
  avoids: string[];
  summary: string;
}

interface LearnedPreferencesProps {
  learned: LearnedData | null;
  loading: boolean;
  decisionCount: number;
}

export function LearnedPreferences({ learned, loading, decisionCount }: LearnedPreferencesProps) {
  if (decisionCount === 0) return null;

  if (loading) {
    return (
      <Card className="border-christina-blue/20">
        <CardContent className="py-4 text-sm text-muted-foreground font-body text-center">
          Analyzing your decision patterns...
        </CardContent>
      </Card>
    );
  }

  if (!learned) return null;

  const hasContent = learned.preferences.length > 0 || learned.avoids.length > 0;

  return (
    <Card className="border-christina-blue/20 bg-christina-blue/5">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-christina-blue" />
          <p className="text-sm font-semibold">What the system has learned</p>
          <Badge className="bg-christina-blue/10 text-christina-blue border-0 text-xs">
            {decisionCount} decision{decisionCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground font-body mb-3">{learned.summary}</p>

        {hasContent && (
          <div className="grid gap-4 md:grid-cols-2">
            {learned.preferences.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ThumbsUp className="h-3.5 w-3.5 text-christina-green" />
                  <p className="text-xs font-semibold text-christina-green uppercase">Priorities</p>
                </div>
                <ul className="space-y-1">
                  {learned.preferences.map((pref, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-body flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-christina-green inline-block mt-1.5 shrink-0" />
                      {pref}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {learned.avoids.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ThumbsDown className="h-3.5 w-3.5 text-christina-coral" />
                  <p className="text-xs font-semibold text-christina-coral uppercase">Avoids</p>
                </div>
                <ul className="space-y-1">
                  {learned.avoids.map((avoid, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-body flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-christina-coral inline-block mt-1.5 shrink-0" />
                      {avoid}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
