'use client';

import { useEffect, useState, useCallback } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { getTourById, type TourConfig } from '@/lib/tour-config';
import {
  isTourCompleted,
  completeTour,
  updateTourProgress,
  resetTourProgress,
  getTourCompletionPercentage,
} from '@/lib/tour-progress';

interface TourButtonProps {
  tourId: string;
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
  showCompletionBadge?: boolean;
}

export function TourButton({
  tourId,
  variant = 'default',
  className = '',
  showCompletionBadge = true,
}: TourButtonProps) {
  const [tourConfig, setTourConfig] = useState<TourConfig | null>(null);
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionPercent, setCompletionPercent] = useState(0);

  // Load tour config and completion status
  useEffect(() => {
    const config = getTourById(tourId);
    if (config) {
      setTourConfig(config);
      setIsCompleted(isTourCompleted(tourId));
      setCompletionPercent(getTourCompletionPercentage(tourId));
    }
  }, [tourId]);

  // Initialize driver instance
  useEffect(() => {
    if (!tourConfig) return;

    const totalSteps = tourConfig.steps.length;

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: tourConfig.steps,
      popoverClass: 'christina-tour-popover',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Complete!',
      progressText: 'Step {{current}} of {{total}}',
      animate: true,
      overlayOpacity: 0.6,
      stagePadding: 8,
      stageRadius: 8,
      allowClose: true,
      onHighlightStarted: (element, step) => {
        const currentIndex = tourConfig.steps.findIndex(s => s === step) + 1;
        updateTourProgress(tourId, currentIndex, totalSteps);
      },
      onDestroyStarted: () => {
        // Check if we completed all steps
        const currentProgress = getTourCompletionPercentage(tourId);
        if (currentProgress === 100) {
          setIsCompleted(true);
        }
        setCompletionPercent(currentProgress);
        driverObj.destroy();
      },
      onDestroyed: () => {
        // Final completion check
        const completed = isTourCompleted(tourId);
        setIsCompleted(completed);
        setCompletionPercent(getTourCompletionPercentage(tourId));
      },
      onNextClick: () => {
        if (!driverObj.hasNextStep()) {
          // User clicked next on final step - mark as complete
          completeTour(tourId, totalSteps);
          setIsCompleted(true);
          setCompletionPercent(100);
        }
        driverObj.moveNext();
      },
    });

    setDriverInstance(driverObj);

    return () => {
      driverObj.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourConfig, tourId]);

  const startTour = useCallback(() => {
    if (driverInstance) {
      driverInstance.drive();
    }
  }, [driverInstance]);

  const handleRestart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    resetTourProgress(tourId);
    setIsCompleted(false);
    setCompletionPercent(0);
    startTour();
  }, [tourId, startTour]);

  if (!tourConfig) {
    return null;
  }

  // Compact variant - just an icon button
  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={startTour}
        className={`text-muted-foreground hover:text-primary ${className}`}
        title={`Start ${tourConfig.title}`}
      >
        {isCompleted && showCompletionBadge ? (
          <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
        ) : (
          <HelpCircle className="w-4 h-4 mr-1" />
        )}
        Tour
      </Button>
    );
  }

  // Hero variant - larger with more info
  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-start gap-2 ${className}`}>
        <Button
          size="lg"
          onClick={startTour}
          className={`gap-2 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Tour Completed
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Interactive Tour
            </>
          )}
        </Button>
        {isCompleted && (
          <Button variant="ghost" size="sm" onClick={handleRestart} className="gap-1 text-muted-foreground">
            <RotateCcw className="w-3 h-3" />
            Take tour again
          </Button>
        )}
        {!isCompleted && completionPercent > 0 && (
          <span className="text-xs text-muted-foreground">
            {completionPercent}% completed
          </span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Button
        variant={isCompleted ? 'outline' : 'default'}
        size="sm"
        onClick={startTour}
        className="gap-2"
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Tour Complete
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Start Tour
          </>
        )}
      </Button>
      {isCompleted && showCompletionBadge && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRestart}
          className="h-8 w-8"
          title="Restart tour"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      )}
      {!isCompleted && completionPercent > 0 && (
        <Badge variant="secondary" className="text-xs">
          {completionPercent}%
        </Badge>
      )}
    </div>
  );
}

/**
 * Tour Progress Badge - shows completion status
 */
export function TourProgressBadge({ tourId }: { tourId: string }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionPercent, setCompletionPercent] = useState(0);

  useEffect(() => {
    setIsCompleted(isTourCompleted(tourId));
    setCompletionPercent(getTourCompletionPercentage(tourId));
  }, [tourId]);

  if (isCompleted) {
    return (
      <Badge variant="default" className="bg-green-600 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </Badge>
    );
  }

  if (completionPercent > 0) {
    return (
      <Badge variant="secondary" className="gap-1">
        {completionPercent}% done
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Play className="w-3 h-3" />
      Not started
    </Badge>
  );
}
