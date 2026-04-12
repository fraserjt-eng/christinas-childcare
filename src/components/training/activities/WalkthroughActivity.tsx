'use client';

import { useState } from 'react';
import { WalkthroughStep } from '@/types/training';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronRight, Check, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalkthroughActivityProps {
  title: string;
  steps: WalkthroughStep[];
  onComplete: () => void;
}

export function WalkthroughActivity({ steps, onComplete }: WalkthroughActivityProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const allVisited = visitedSteps.size === steps.length;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      const next = currentStep + 1;
      setCurrentStep(next);
      setVisitedSteps(prev => new Set(prev).add(next));
    }
  };

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <div className="flex items-center gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              i < currentStep ? 'bg-christina-green' :
              i === currentStep ? 'bg-christina-red' :
              'bg-gray-200'
            )}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 font-body">
        Step {currentStep + 1} of {steps.length}
      </p>

      {/* Current step */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="text-sm font-body text-gray-800 leading-relaxed">
          {step.instruction}
        </p>

        {/* Screenshot placeholder */}
        {step.screenshotCaption && (
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <Image className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-xs text-gray-500 font-body">{step.screenshotCaption}</p>
          </div>
        )}

        {/* Try it link */}
        {step.tryItLink && (
          <a
            href={step.tryItLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-christina-blue hover:text-christina-blue/80 transition-colors"
          >
            Try it: {step.tryItLink}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="text-xs"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          size="sm"
          className={cn(
            'text-xs',
            isLastStep && allVisited
              ? 'bg-christina-green hover:bg-christina-green/90'
              : 'bg-christina-red hover:bg-christina-red/90'
          )}
        >
          {isLastStep ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              Done
            </>
          ) : (
            <>
              Next Step
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
