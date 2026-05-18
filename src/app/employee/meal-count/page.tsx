'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UtensilsCrossed,
  Check,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getClassrooms, getFoodCounts, upsertFoodCount } from '@/lib/food-storage';
import { getCurrentMealWindow } from '@/lib/food-storage';
import { useCurrentEmployee } from '@/lib/use-current-employee';
import { Classroom, MealType, MEAL_TYPE_LABELS } from '@/types/food';

type StepState = 'select-classroom' | 'count' | 'done';

export default function EmployeeMealCountPage() {
  const [step, setStep] = useState<StepState>('select-classroom');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [activeMeal, setActiveMeal] = useState<MealType>('lunch');
  const [count, setCount] = useState(0);
  const [adultCount, setAdultCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState<Record<string, MealType[]>>({});
  const [mealWindow, setMealWindow] = useState<{ mealType: MealType; isActive: boolean; minutesUntilDeadline: number } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const { employee } = useCurrentEmployee();

  useEffect(() => {
    async function load() {
      const rooms = await getClassrooms({ active_only: true });
      setClassrooms(rooms);

      // Check what's already submitted today
      const todayCounts = await getFoodCounts({ date: today });
      const submitted: Record<string, MealType[]> = {};
      for (const c of todayCounts) {
        if (c.child_count > 0) {
          if (!submitted[c.classroom_id]) submitted[c.classroom_id] = [];
          submitted[c.classroom_id].push(c.meal_type);
        }
      }
      setAlreadySubmitted(submitted);

      // Get current meal window
      const window = getCurrentMealWindow();
      if (window) {
        setActiveMeal(window.mealType);
        setMealWindow(window);
      }

      setLoading(false);
    }
    load();
  }, [today]);

  // Pre-fill count from yesterday when classroom is selected
  const selectClassroom = async (classroom: Classroom) => {
    setSelectedClassroom(classroom);

    // Try to pre-fill from yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayCounts = await getFoodCounts({
      date: yesterdayStr,
      classroom_id: classroom.id,
      meal_type: activeMeal,
    });

    if (yesterdayCounts.length > 0 && yesterdayCounts[0].child_count > 0) {
      setCount(yesterdayCounts[0].child_count);
      setAdultCount(yesterdayCounts[0].adult_count);
    } else {
      // Default to 85% of capacity
      setCount(Math.round(classroom.capacity * 0.85));
      setAdultCount(activeMeal === 'lunch' ? 1 : 0);
    }

    setStep('count');
  };

  const handleSubmit = async () => {
    if (!selectedClassroom) return;
    setSaving(true);

    await upsertFoodCount({
      date: today,
      classroom_id: selectedClassroom.id,
      classroom_name: selectedClassroom.name,
      meal_type: activeMeal,
      child_count: count,
      adult_count: adultCount,
      recorded_by: employee?.id,
    });

    setSaving(false);
    setStep('done');
  };

  const handleReset = () => {
    setStep('select-classroom');
    setSelectedClassroom(null);
    setCount(0);
    setAdultCount(1);
  };

  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-christina-red/10 mb-3">
          <UtensilsCrossed className="h-6 w-6 text-christina-red" />
        </div>
        <h1 className="text-xl font-bold">Meal Count</h1>
        {mealWindow && mealWindow.isActive && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-christina-blue" />
            <span className="text-sm text-christina-blue">
              {MEAL_TYPE_LABELS[mealWindow.mealType]} window open, {mealWindow.minutesUntilDeadline} min left
            </span>
          </div>
        )}
      </div>

      {/* Meal type selector */}
      <div className="flex gap-1 justify-center">
        {mealTypes.map((mt) => (
          <Button
            key={mt}
            variant={activeMeal === mt ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveMeal(mt);
              if (step === 'done') handleReset();
            }}
            className="text-xs"
          >
            {MEAL_TYPE_LABELS[mt]}
          </Button>
        ))}
      </div>

      {/* Step: Select Classroom */}
      {step === 'select-classroom' && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Select your classroom for {MEAL_TYPE_LABELS[activeMeal]}
          </p>
          {classrooms.map((classroom) => {
            const isSubmitted = alreadySubmitted[classroom.id]?.includes(activeMeal);
            return (
              <Card
                key={classroom.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSubmitted ? 'opacity-60' : 'hover:border-christina-red/30'
                }`}
                onClick={() => !isSubmitted && selectClassroom(classroom)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{classroom.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {classroom.age_group.replace('_', ' ')} &middot; Capacity: {classroom.capacity}
                    </p>
                  </div>
                  {isSubmitted ? (
                    <Badge className="bg-christina-green/10 text-christina-green">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Summary */}
          {Object.keys(alreadySubmitted).length > 0 && (
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                {Object.values(alreadySubmitted).filter(meals => meals.includes(activeMeal)).length} of {classrooms.length} classrooms
                reported {MEAL_TYPE_LABELS[activeMeal]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step: Enter Count */}
      {step === 'count' && selectedClassroom && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{selectedClassroom.name}</p>
              <p className="text-sm font-medium text-christina-red">
                {MEAL_TYPE_LABELS[activeMeal]}
              </p>
            </div>

            {/* Children counter */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Children present</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setCount((c) => Math.max(0, c - 1))}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="text-5xl font-bold tabular-nums min-w-[80px]">
                  {count}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setCount((c) => Math.min(selectedClassroom.capacity, c + 1))}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Capacity: {selectedClassroom.capacity}
              </p>
              {count > selectedClassroom.capacity && (
                <p className="text-xs text-christina-coral flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Over capacity
                </p>
              )}
            </div>

            {/* Adults counter (smaller) */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Adults</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAdultCount((c) => Math.max(0, c - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold tabular-nums w-8 text-center">
                  {adultCount}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAdultCount((c) => c + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={saving || count === 0}
                className="w-full h-12 text-base gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Submit {count} kids + {adultCount} adult{adultCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="w-full"
                size="sm"
              >
                Back to classrooms
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === 'done' && selectedClassroom && (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-christina-green/10">
              <CheckCircle className="h-10 w-10 text-christina-green" />
            </div>
            <div>
              <p className="text-lg font-bold">Count submitted</p>
              <p className="text-sm text-muted-foreground">
                {selectedClassroom.name} &middot; {MEAL_TYPE_LABELS[activeMeal]} &middot; {count} children
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={handleReset} className="w-full gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Enter another classroom
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
