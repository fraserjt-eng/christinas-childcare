'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, UtensilsCrossed } from 'lucide-react';
import { getClassrooms, upsertFoodCount, getMissingMealCounts } from '@/lib/food-storage';
import { Classroom, MealType, MEAL_TYPE_LABELS } from '@/types/food';

interface QuickMealEntryProps {
  mealType?: MealType;
  onComplete?: () => void;
}

export function QuickMealEntry({ mealType, onComplete }: QuickMealEntryProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [missingClassrooms, setMissingClassrooms] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>(mealType || 'lunch');

  const today = new Date().toISOString().split('T')[0];
  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];

  useEffect(() => {
    async function load() {
      const rooms = await getClassrooms({ active_only: true });
      setClassrooms(rooms);

      const missing = await getMissingMealCounts(today);
      const missingForMeal = missing
        .filter(m => m.meal_type === activeMeal)
        .map(m => m.classroom_id);
      setMissingClassrooms(missingForMeal);

      // Initialize counts to 0 for missing classrooms
      const initial: Record<string, number> = {};
      for (const id of missingForMeal) {
        initial[id] = 0;
      }
      setCounts(initial);
      setSaved(false);
    }
    load();
  }, [activeMeal, today]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [classroomId, count] of Object.entries(counts)) {
        if (count > 0) {
          const classroom = classrooms.find(c => c.id === classroomId);
          await upsertFoodCount({
            date: today,
            classroom_id: classroomId,
            classroom_name: classroom?.name || '',
            meal_type: activeMeal,
            child_count: count,
            adult_count: activeMeal === 'lunch' ? 1 : 0,
          });
        }
      }
      setSaved(true);
      onComplete?.();
    } finally {
      setSaving(false);
    }
  };

  const hasAnyCounts = Object.values(counts).some(c => c > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Quick Meal Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Type Selector */}
        {!mealType && (
          <div className="flex gap-2 flex-wrap">
            {mealTypes.map((mt) => (
              <Button
                key={mt}
                variant={activeMeal === mt ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMeal(mt)}
              >
                {MEAL_TYPE_LABELS[mt]}
              </Button>
            ))}
          </div>
        )}

        {saved ? (
          <div className="p-6 text-center">
            <Check className="h-12 w-12 text-christina-green mx-auto mb-2" />
            <p className="font-medium text-green-800">Counts submitted</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setSaved(false)}
            >
              Enter more
            </Button>
          </div>
        ) : missingClassrooms.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Check className="h-8 w-8 text-christina-green mx-auto mb-2" />
            <p>All {MEAL_TYPE_LABELS[activeMeal]} counts are in for today.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {missingClassrooms.length} classroom{missingClassrooms.length !== 1 ? 's' : ''} missing{' '}
              <Badge variant="outline">{MEAL_TYPE_LABELS[activeMeal]}</Badge> counts
            </p>

            <div className="space-y-3">
              {classrooms
                .filter(c => missingClassrooms.includes(c.id))
                .map((classroom) => (
                  <div
                    key={classroom.id}
                    className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{classroom.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Capacity: {classroom.capacity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Children:</Label>
                      <Input
                        type="number"
                        min={0}
                        max={classroom.capacity}
                        value={counts[classroom.id] || 0}
                        onChange={(e) =>
                          setCounts(prev => ({
                            ...prev,
                            [classroom.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
            </div>

            <Button
              onClick={handleSave}
              disabled={!hasAnyCounts || saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit {MEAL_TYPE_LABELS[activeMeal]} Counts
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
