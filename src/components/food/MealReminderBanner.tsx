'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, UtensilsCrossed, X } from 'lucide-react';
import { getCurrentMealWindow, getMissingMealCounts } from '@/lib/food-storage';
import { MEAL_TYPE_LABELS, MealType } from '@/types/food';

interface MealReminderBannerProps {
  onQuickEntry?: (mealType: MealType) => void;
}

export function MealReminderBanner({ onQuickEntry }: MealReminderBannerProps) {
  const [mealWindow, setMealWindow] = useState<{
    mealType: MealType;
    isActive: boolean;
    minutesUntilDeadline: number;
  } | null>(null);
  const [missingCount, setMissingCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function update() {
      const window = getCurrentMealWindow();
      setMealWindow(window);
    }

    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function checkMissing() {
      if (!mealWindow?.isActive) return;
      const today = new Date().toISOString().split('T')[0];
      const missing = await getMissingMealCounts(today);
      const missingForMeal = missing.filter(m => m.meal_type === mealWindow.mealType);
      setMissingCount(missingForMeal.length);
    }

    checkMissing();
    const interval = setInterval(checkMissing, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [mealWindow]);

  if (dismissed || !mealWindow || !mealWindow.isActive || missingCount === 0) {
    return null;
  }

  const isUrgent = mealWindow.minutesUntilDeadline <= 15;

  return (
    <Card className={`border-2 ${isUrgent ? 'border-christina-coral bg-red-50' : 'border-christina-yellow bg-yellow-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isUrgent ? 'bg-christina-coral/20' : 'bg-christina-yellow/20'}`}>
              {isUrgent ? (
                <Bell className="h-5 w-5 text-christina-coral animate-pulse" />
              ) : (
                <UtensilsCrossed className="h-5 w-5 text-yellow-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`font-medium ${isUrgent ? 'text-red-800' : 'text-yellow-800'}`}>
                  {MEAL_TYPE_LABELS[mealWindow.mealType]} counts needed
                </p>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {mealWindow.minutesUntilDeadline} min left
                </Badge>
              </div>
              <p className={`text-sm ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
                {missingCount} classroom{missingCount !== 1 ? 's' : ''} still missing counts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onQuickEntry && (
              <Button
                size="sm"
                variant={isUrgent ? 'destructive' : 'default'}
                onClick={() => onQuickEntry(mealWindow.mealType)}
              >
                Enter Counts
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
