'use client';

import { useEffect, useState } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from '@/components/ui/button';
import { Play, HelpCircle } from 'lucide-react';
import { getTourById, type TourConfig } from '@/lib/tour-config';

interface TourButtonProps {
  tourId: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function TourButton({ tourId, variant = 'default', className = '' }: TourButtonProps) {
  const [tourConfig, setTourConfig] = useState<TourConfig | null>(null);
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);

  useEffect(() => {
    const config = getTourById(tourId);
    if (config) {
      setTourConfig(config);
    }
  }, [tourId]);

  useEffect(() => {
    if (tourConfig) {
      const driverObj = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: tourConfig.steps,
        popoverClass: 'christina-tour-popover',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Done',
        progressText: '{{current}} of {{total}}',
        onDestroyStarted: () => {
          driverObj.destroy();
        },
      });
      setDriverInstance(driverObj);
    }

    return () => {
      driverInstance?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourConfig]);

  const startTour = () => {
    if (driverInstance) {
      driverInstance.drive();
    }
  };

  if (!tourConfig) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={startTour}
        className={`text-muted-foreground hover:text-primary ${className}`}
        title={`Start ${tourConfig.title}`}
      >
        <HelpCircle className="w-4 h-4 mr-1" />
        Tour
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startTour}
      className={`gap-2 ${className}`}
    >
      <Play className="w-4 h-4" />
      Start Tour
    </Button>
  );
}

// Custom CSS for the tour popovers - add to globals.css or include inline
export const tourStyles = `
  .christina-tour-popover {
    --driver-popover-max-width: 320px;
    --driver-popover-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }

  .christina-tour-popover .driver-popover-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .christina-tour-popover .driver-popover-description {
    color: #6b6b6b;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .christina-tour-popover .driver-popover-progress-text {
    color: #999;
    font-size: 0.75rem;
  }

  .christina-tour-popover .driver-popover-prev-btn,
  .christina-tour-popover .driver-popover-next-btn {
    background: #1a1a1a;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .christina-tour-popover .driver-popover-prev-btn:hover,
  .christina-tour-popover .driver-popover-next-btn:hover {
    background: #333;
  }

  .christina-tour-popover .driver-popover-close-btn {
    color: #999;
  }

  .christina-tour-popover .driver-popover-close-btn:hover {
    color: #333;
  }
`;
