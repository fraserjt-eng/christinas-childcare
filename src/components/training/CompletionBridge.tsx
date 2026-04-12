'use client';

import { ArrowRight } from 'lucide-react';

interface CompletionBridgeProps {
  bridgeText: string;
}

export function CompletionBridge({ bridgeText }: CompletionBridgeProps) {
  return (
    <div className="bg-orange-50 border border-christina-coral/20 rounded-lg p-4 mt-6">
      <div className="flex items-start gap-2">
        <ArrowRight className="h-4 w-4 text-christina-coral mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs uppercase tracking-widest text-christina-coral/70 font-body mb-1">
            What this produced &gt; what comes next
          </p>
          <p className="text-sm text-gray-700 font-body">{bridgeText}</p>
        </div>
      </div>
    </div>
  );
}
