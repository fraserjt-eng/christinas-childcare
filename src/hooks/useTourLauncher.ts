'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Import all tours from tour-config
import { tours } from '@/lib/tour-config';
import { completeTour } from '@/lib/tour-progress';

/**
 * Hook that checks for ?tour=tourId in the URL and auto-launches
 * the corresponding driver.js tour after a brief delay.
 *
 * Usage: Add `useTourLauncher()` to any page component.
 * The guide page links to /admin/food-counts?tour=food-counts-compliance
 * and this hook picks it up and starts the tour.
 */
export function useTourLauncher() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const tourId = searchParams.get('tour');
    if (!tourId) return;

    // Find the tour config
    const tourConfig = tours[tourId];
    if (!tourConfig) {
      console.warn(`Tour "${tourId}" not found in tour-config.ts`);
      return;
    }

    // Delay to let the page render first
    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        showButtons: ['next', 'previous', 'close'],
        steps: tourConfig.steps,
        popoverClass: 'christina-tour-popover',
        onDestroyStarted: () => {
          // Mark tour as completed when user finishes or closes
          completeTour(tourId, tourConfig.steps.length);
          driverObj.destroy();

          // Clean the URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete('tour');
          window.history.replaceState({}, '', url.toString());
        },
      });

      driverObj.drive();
    }, 1000); // 1 second delay for page to fully render

    return () => clearTimeout(timeout);
  }, [searchParams]);
}
