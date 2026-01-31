'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Delete, ArrowRight } from 'lucide-react';

interface PinPadProps {
  onSubmit: (pin: string) => void;
  maxLength?: number;
  error?: string;
  loading?: boolean;
  className?: string;
}

export function PinPad({
  onSubmit,
  maxLength = 4,
  error,
  loading = false,
  className,
}: PinPadProps) {
  const [pin, setPin] = React.useState('');

  const handleNumberClick = (num: string) => {
    if (pin.length < maxLength) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = () => {
    if (pin.length >= maxLength) {
      onSubmit(pin);
    }
  };

  // Auto-submit when max length is reached
  React.useEffect(() => {
    if (pin.length === maxLength) {
      onSubmit(pin);
    }
  }, [pin, maxLength, onSubmit]);

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* PIN Display */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-3">
          {Array.from({ length: maxLength }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-4 h-4 rounded-full border-2 transition-all duration-200',
                i < pin.length
                  ? 'bg-primary border-primary scale-110'
                  : 'bg-muted border-muted-foreground/30'
              )}
            />
          ))}
        </div>
        {error && (
          <p className="text-sm text-destructive font-medium animate-shake">
            {error}
          </p>
        )}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((num) => {
          if (num === 'C') {
            return (
              <Button
                key={num}
                variant="outline"
                size="lg"
                className="w-16 h-16 text-lg font-semibold"
                onClick={handleClear}
                disabled={loading || pin.length === 0}
              >
                C
              </Button>
            );
          }
          if (num === 'DEL') {
            return (
              <Button
                key={num}
                variant="outline"
                size="lg"
                className="w-16 h-16"
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
              >
                <Delete className="h-5 w-5" />
              </Button>
            );
          }
          return (
            <Button
              key={num}
              variant="outline"
              size="lg"
              className="w-16 h-16 text-2xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleNumberClick(num)}
              disabled={loading || pin.length >= maxLength}
            >
              {num}
            </Button>
          );
        })}
      </div>

      {/* Submit Button (optional, since auto-submit) */}
      <Button
        size="lg"
        className="w-full max-w-[220px] gap-2"
        onClick={handleSubmit}
        disabled={loading || pin.length < maxLength}
      >
        {loading ? (
          <span className="animate-pulse">Checking...</span>
        ) : (
          <>
            Clock In
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
