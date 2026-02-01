'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Save, Loader2 } from 'lucide-react';
import {
  MealType,
  CLASSROOMS,
  MEAL_TYPE_LABELS,
} from '@/types/food';
import { getFoodCounts, upsertFoodCount } from '@/lib/food-storage';

interface FoodCountGridProps {
  date: string;
  onSave?: () => void;
}

type CountData = Record<string, Record<MealType, { children: number; adults: number }>>;

export function FoodCountGrid({ date, onSave }: FoodCountGridProps) {
  const [counts, setCounts] = useState<CountData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function loadCounts() {
      setLoading(true);
      const existingCounts = await getFoodCounts({ date });

      // Initialize with zeros for all classrooms
      const initialData: CountData = {};
      for (const classroom of CLASSROOMS) {
        initialData[classroom.id] = {
          breakfast: { children: 0, adults: 0 },
          am_snack: { children: 0, adults: 0 },
          lunch: { children: 0, adults: 0 },
          pm_snack: { children: 0, adults: 0 },
        };
      }

      // Fill in existing data
      for (const count of existingCounts) {
        if (initialData[count.classroom_id]) {
          initialData[count.classroom_id][count.meal_type] = {
            children: count.child_count,
            adults: count.adult_count,
          };
        }
      }

      setCounts(initialData);
      setLoading(false);
      setSaved(false);
      setHasChanges(false);
    }

    loadCounts();
  }, [date]);

  const updateCount = (
    classroomId: string,
    mealType: MealType,
    field: 'children' | 'adults',
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setCounts((prev) => ({
      ...prev,
      [classroomId]: {
        ...prev[classroomId],
        [mealType]: {
          ...prev[classroomId][mealType],
          [field]: numValue,
        },
      },
    }));
    setSaved(false);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      for (const classroom of CLASSROOMS) {
        for (const mealType of ['breakfast', 'am_snack', 'lunch', 'pm_snack'] as MealType[]) {
          const countData = counts[classroom.id]?.[mealType];
          if (countData && (countData.children > 0 || countData.adults > 0)) {
            await upsertFoodCount({
              date,
              classroom_id: classroom.id,
              classroom_name: classroom.name,
              meal_type: mealType,
              child_count: countData.children,
              adult_count: countData.adults,
            });
          }
        }
      }

      setSaved(true);
      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error('Error saving food counts:', error);
    } finally {
      setSaving(false);
    }
  };

  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];

  // Calculate totals
  const totals: Record<MealType, { children: number; adults: number }> = {
    breakfast: { children: 0, adults: 0 },
    am_snack: { children: 0, adults: 0 },
    lunch: { children: 0, adults: 0 },
    pm_snack: { children: 0, adults: 0 },
  };

  for (const classroom of CLASSROOMS) {
    for (const mealType of mealTypes) {
      totals[mealType].children += counts[classroom.id]?.[mealType]?.children || 0;
      totals[mealType].adults += counts[classroom.id]?.[mealType]?.adults || 0;
    }
  }

  const grandTotal =
    Object.values(totals).reduce((sum, t) => sum + t.children + t.adults, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Meal Counts by Classroom</CardTitle>
        <div className="flex items-center gap-2">
          {hasChanges && !saved && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Counts
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium min-w-[150px]">Classroom</th>
              {mealTypes.map((meal) => (
                <th key={meal} className="text-center p-3 font-medium min-w-[100px]">
                  <div>{MEAL_TYPE_LABELS[meal]}</div>
                  <div className="text-xs text-muted-foreground font-normal mt-1">
                    Kids / Adults
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLASSROOMS.map((classroom) => (
              <tr key={classroom.id} className="border-b last:border-0">
                <td className="p-3">
                  <p className="font-medium">{classroom.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {classroom.age_group.replace('_', ' ')} • Cap: {classroom.capacity}
                  </p>
                </td>
                {mealTypes.map((meal) => (
                  <td key={meal} className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        value={counts[classroom.id]?.[meal]?.children || 0}
                        onChange={(e) =>
                          updateCount(classroom.id, meal, 'children', e.target.value)
                        }
                        className="w-14 text-center h-8"
                      />
                      <span className="text-muted-foreground">/</span>
                      <Input
                        type="number"
                        min="0"
                        value={counts[classroom.id]?.[meal]?.adults || 0}
                        onChange={(e) =>
                          updateCount(classroom.id, meal, 'adults', e.target.value)
                        }
                        className="w-14 text-center h-8"
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {/* Totals row */}
            <tr className="bg-muted/30 font-bold">
              <td className="p-3">Totals</td>
              {mealTypes.map((meal) => (
                <td key={meal} className="p-3 text-center">
                  <span className="text-primary">{totals[meal].children}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-muted-foreground">{totals[meal].adults}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total children today:{' '}
            <span className="font-bold text-foreground">
              {Object.values(totals).reduce((sum, t) => sum + t.children, 0)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Grand total (children + adults):{' '}
            <span className="font-bold text-foreground">{grandTotal}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
