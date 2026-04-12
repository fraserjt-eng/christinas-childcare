'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReflectionActivityProps {
  title: string;
  prompt: string;
  onComplete: () => void;
}

const MIN_WORDS = 15;

export function ReflectionActivity({ prompt, onComplete }: ReflectionActivityProps) {
  const [text, setText] = useState('');

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const meetsMinimum = wordCount >= MIN_WORDS;

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-christina-blue/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-christina-blue" />
        </div>
        <p className="text-sm font-body text-gray-800 leading-relaxed pt-1">{prompt}</p>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your reflection here..."
        className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg text-sm font-body text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-christina-blue/30 focus:border-christina-blue/50"
      />

      {/* Word count */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs font-body transition-colors',
          meetsMinimum ? 'text-christina-green' : 'text-gray-400'
        )}>
          {wordCount} / {MIN_WORDS} words {meetsMinimum ? '(minimum met)' : ''}
        </span>
        <Button
          onClick={onComplete}
          disabled={!meetsMinimum}
          size="sm"
          className="bg-christina-green hover:bg-christina-green/90 text-xs disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Submit Reflection
        </Button>
      </div>
    </div>
  );
}
