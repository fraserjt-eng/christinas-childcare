'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Save, Loader2, Copy, Users, Zap } from 'lucide-react';
import {
  MealType,
  Classroom,
  MEAL_TYPE_LABELS,
} from '@/types/food';
import { getFoodCounts, upsertFoodCount, getClassrooms } from '@/lib/food-storage';

interface FoodCountGridProps {
  date: string;
  onSave?: () => void;
}

type CountData = Record<string, Record<MealType, { children: number; adults: number }>>;

export function FoodCountGrid({ date, onSave }: FoodCountGridProps) {
  const [counts, setCounts] = useState<CountData>({});
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [fillSource, setFillSource] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Load classrooms first
      const loadedClassrooms = await getClassrooms({ active_only: true });
      setClassrooms(loadedClassrooms);

      const existingCounts = await getFoodCounts({ date });

      // Initialize with zeros for all classrooms
      const initialData: CountData = {};
      for (const classroom of loadedClassrooms) {
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
      setFillSource(null);
    }

    loadData();
  }, [date]);

  // Copy yesterday's counts into today's grid
  const handleCopyYesterday = async () => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayCounts = await getFoodCounts({ date: yesterdayStr });
    if (yesterdayCounts.length === 0) {
      // Try 2 days ago (skip weekend)
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgoStr = yesterday.toISOString().split('T')[0];
      const twoDaysAgoCounts = await getFoodCounts({ date: twoDaysAgoStr });
      if (twoDaysAgoCounts.length === 0) return;
      fillFromCounts(twoDaysAgoCounts);
      setFillSource(`Copied from ${new Date(twoDaysAgoStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`);
      return;
    }

    fillFromCounts(yesterdayCounts);
    setFillSource(`Copied from ${new Date(yesterdayStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`);
  };

  // Fill grid from a set of food count records
  const fillFromCounts = (records: { classroom_id: string; meal_type: MealType; child_count: number; adult_count: number }[]) => {
    setCounts((prev) => {
      const updated = { ...prev };
      for (const record of records) {
        if (updated[record.classroom_id]) {
          updated[record.classroom_id] = {
            ...updated[record.classroom_id],
            [record.meal_type]: {
              children: record.child_count,
              adults: record.adult_count,
            },
          };
        }
      }
      return updated;
    });
    setSaved(false);
    setHasChanges(true);
  };

  // Fill all classrooms with capacity-based estimate (85% of capacity)
  const handleFillFromCapacity = () => {
    setCounts((prev) => {
      const updated = { ...prev };
      for (const classroom of classrooms) {
        const estimate = Math.round(classroom.capacity * 0.85);
        for (const meal of ['breakfast', 'am_snack', 'lunch', 'pm_snack'] as MealType[]) {
          updated[classroom.id] = {
            ...updated[classroom.id],
            [meal]: {
              children: estimate,
              adults: meal === 'lunch' ? 1 : 0,
            },
          };
        }
      }
      return updated;
    });
    setSaved(false);
    setHasChanges(true);
    setFillSource('Filled from enrollment (85% of capacity). Adjust as needed.');
  };

  // Fill all classrooms to full capacity
  const handleEveryoneHere = () => {
    setCounts((prev) => {
      const updated = { ...prev };
      for (const classroom of classrooms) {
        for (const meal of ['breakfast', 'am_snack', 'lunch', 'pm_snack'] as MealType[]) {
          updated[classroom.id] = {
            ...updated[classroom.id],
            [meal]: {
              children: classroom.capacity,
              adults: meal === 'lunch' ? 1 : 0,
            },
          };
        }
      }
      return updated;
    });
    setSaved(false);
    setHasChanges(true);
    setFillSource('Filled to full capacity. Adjust rooms that are short.');
  };

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
      for (const classroom of classrooms) {
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

  for (const classroom of classrooms) {
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
        {/* Quick-fill buttons */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyYesterday}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Yesterday
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFillFromCapacity}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Fill from Enrollment
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEveryoneHere}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Everyone Here
          </Button>
          {fillSource && (
            <Badge variant="outline" className="text-christina-blue self-center">
              {fillSource}
            </Badge>
          )}
        </div>

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
            {classrooms.map((classroom) => (
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
