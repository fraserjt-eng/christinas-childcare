/**
 * Tour Progress Tracking
 * Tracks which tours the user has completed using localStorage
 */

const STORAGE_KEY = 'christina-tour-progress';

export interface TourProgress {
  tourId: string;
  completedAt: string;
  lastStepReached: number;
  totalSteps: number;
}

export interface TourProgressState {
  tours: Record<string, TourProgress>;
  lastUpdated: string;
}

/**
 * Get all tour progress from localStorage
 */
export function getTourProgress(): TourProgressState {
  if (typeof window === 'undefined') {
    return { tours: {}, lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading tour progress:', error);
  }

  return { tours: {}, lastUpdated: new Date().toISOString() };
}

/**
 * Check if a specific tour has been completed
 */
export function isTourCompleted(tourId: string): boolean {
  const progress = getTourProgress();
  const tour = progress.tours[tourId];
  return tour?.lastStepReached === tour?.totalSteps;
}

/**
 * Get progress for a specific tour
 */
export function getTourProgressById(tourId: string): TourProgress | null {
  const progress = getTourProgress();
  return progress.tours[tourId] || null;
}

/**
 * Update tour progress (called on each step)
 */
export function updateTourProgress(
  tourId: string,
  currentStep: number,
  totalSteps: number
): void {
  if (typeof window === 'undefined') return;

  try {
    const progress = getTourProgress();
    const existing = progress.tours[tourId];

    // Only update if current step is higher than previously recorded
    if (!existing || currentStep > existing.lastStepReached) {
      progress.tours[tourId] = {
        tourId,
        completedAt: currentStep === totalSteps ? new Date().toISOString() : existing?.completedAt || '',
        lastStepReached: currentStep,
        totalSteps,
      };
      progress.lastUpdated = new Date().toISOString();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch (error) {
    console.error('Error saving tour progress:', error);
  }
}

/**
 * Mark a tour as fully completed
 */
export function completeTour(tourId: string, totalSteps: number): void {
  if (typeof window === 'undefined') return;

  try {
    const progress = getTourProgress();
    progress.tours[tourId] = {
      tourId,
      completedAt: new Date().toISOString(),
      lastStepReached: totalSteps,
      totalSteps,
    };
    progress.lastUpdated = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error completing tour:', error);
  }
}

/**
 * Reset progress for a specific tour
 */
export function resetTourProgress(tourId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const progress = getTourProgress();
    delete progress.tours[tourId];
    progress.lastUpdated = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error resetting tour progress:', error);
  }
}

/**
 * Reset all tour progress
 */
export function resetAllTourProgress(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting all tour progress:', error);
  }
}

/**
 * Get completion percentage for a tour
 */
export function getTourCompletionPercentage(tourId: string): number {
  const tour = getTourProgressById(tourId);
  if (!tour) return 0;
  return Math.round((tour.lastStepReached / tour.totalSteps) * 100);
}

/**
 * Get all completed tour IDs
 */
export function getCompletedTourIds(): string[] {
  const progress = getTourProgress();
  return Object.keys(progress.tours).filter(tourId => isTourCompleted(tourId));
}

/**
 * Get summary stats for all tours
 */
export function getTourStats(): {
  totalStarted: number;
  totalCompleted: number;
  tourIds: string[];
} {
  const progress = getTourProgress();
  const tourIds = Object.keys(progress.tours);
  const completedIds = tourIds.filter(id => isTourCompleted(id));

  return {
    totalStarted: tourIds.length,
    totalCompleted: completedIds.length,
    tourIds,
  };
}
