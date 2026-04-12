'use client';

import { useState } from 'react';
import { ScenarioOption } from '@/types/training';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioActivityProps {
  title: string;
  situation: string;
  options: ScenarioOption[];
  onComplete: () => void;
}

export function ScenarioActivity({ situation, options, onComplete }: ScenarioActivityProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const selectedOption = selected !== null ? options[selected] : null;
  const isCorrect = selectedOption?.isCorrect ?? false;

  return (
    <div className="space-y-4">
      {/* Scenario prompt */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs uppercase tracking-widest text-amber-600 font-body mb-1">Scenario</p>
        <p className="text-sm font-body text-gray-800 leading-relaxed">{situation}</p>
      </div>

      <p className="text-xs text-gray-500 font-body font-semibold">What would you do?</p>

      {/* Options */}
      <div className="space-y-2">
        {options.map((option, i) => {
          const isSelected = selected === i;
          const showCorrect = revealed && option.isCorrect;
          const showIncorrect = revealed && isSelected && !option.isCorrect;

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={cn(
                'w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-3',
                !revealed && isSelected && 'border-christina-blue bg-blue-50',
                !revealed && !isSelected && 'border-gray-200 hover:border-gray-300',
                showCorrect && 'border-christina-green bg-green-50',
                showIncorrect && 'border-christina-coral bg-red-50',
                revealed && !showCorrect && !showIncorrect && 'border-gray-200 opacity-50'
              )}
            >
              <span className={cn(
                'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                !revealed && isSelected && 'border-christina-blue text-christina-blue',
                !revealed && !isSelected && 'border-gray-300 text-gray-400',
                showCorrect && 'border-christina-green text-white bg-christina-green',
                showIncorrect && 'border-christina-coral text-white bg-christina-coral'
              )}>
                {showCorrect ? <Check className="h-3.5 w-3.5" /> :
                 showIncorrect ? <X className="h-3.5 w-3.5" /> :
                 String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm font-body">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {revealed && selectedOption && (
        <div className={cn(
          'rounded-lg p-3 text-sm font-body',
          isCorrect ? 'bg-green-50 text-green-800 border border-green-200' :
                      'bg-red-50 text-red-800 border border-red-200'
        )}>
          <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
          <p>{selectedOption.feedback}</p>
        </div>
      )}

      {/* Actions */}
      {!revealed && selected !== null && (
        <Button onClick={handleReveal} className="w-full bg-christina-red hover:bg-christina-red/90 text-sm">
          Check Answer
        </Button>
      )}
      {revealed && (
        <Button onClick={onComplete} className="w-full bg-christina-green hover:bg-christina-green/90 text-sm">
          <Check className="h-4 w-4 mr-1" />
          Continue
        </Button>
      )}
    </div>
  );
}
