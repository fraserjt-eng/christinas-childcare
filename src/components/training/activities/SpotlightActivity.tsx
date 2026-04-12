'use client';

import { Button } from '@/components/ui/button';
import { Lightbulb, Check } from 'lucide-react';

interface SpotlightActivityProps {
  title: string;
  concept: string;
  detail: string;
  whyItMatters: string;
  onComplete: () => void;
}

export function SpotlightActivity({ concept, detail, whyItMatters, onComplete }: SpotlightActivityProps) {
  return (
    <div className="space-y-4">
      {/* Key concept card */}
      <div className="bg-gradient-to-br from-christina-red/5 to-christina-coral/5 border border-christina-red/20 rounded-xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-christina-red/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-christina-red" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-gray-900 text-base">{concept}</h4>
            <p className="text-sm font-body text-gray-700 leading-relaxed mt-1">{detail}</p>
          </div>
        </div>
      </div>

      {/* Why it matters */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs uppercase tracking-widest text-amber-600 font-body mb-1">Why this matters</p>
        <p className="text-sm font-body text-gray-700">{whyItMatters}</p>
      </div>

      <Button onClick={onComplete} className="w-full bg-christina-red hover:bg-christina-red/90 text-sm">
        <Check className="h-4 w-4 mr-1" />
        Got it
      </Button>
    </div>
  );
}
