'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import {
  MenuItem,
  WeeklyMenu,
  DailyMenuEntry,
  MealType,
  MEAL_TYPE_LABELS,
  getWeekStart,
  getWeekEnd,
  formatFoodCurrency,
} from '@/types/food';
import {
  getMenuItems,
  getWeeklyMenus,
  createWeeklyMenu,
  updateWeeklyMenu,
} from '@/lib/food-storage';

interface MenuPlannerWeekProps {
  onSave?: () => void;
}

export function MenuPlannerWeek({ onSave }: MenuPlannerWeekProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(getWeekStart());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null);
  const [meals, setMeals] = useState<DailyMenuEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(items);

      const menus = await getWeeklyMenus({ week_start: currentWeekStart });
      if (menus.length > 0) {
        setWeeklyMenu(menus[0]);
        setMeals(menus[0].meals);
      } else {
        setWeeklyMenu(null);
        setMeals([]);
      }
      setLoading(false);
      setHasChanges(false);
    }
    loadData();
  }, [currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeekStart);
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(current.toISOString().split('T')[0]);
  };

  const getDateForDay = (dayIndex: number): string => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split('T')[0];
  };

  const getMealForDayAndType = (
    dayIndex: number,
    mealType: MealType
  ): DailyMenuEntry | undefined => {
    const date = getDateForDay(dayIndex);
    return meals.find((m) => m.date === date && m.meal_type === mealType);
  };

  const getMenuItemById = (id: string): MenuItem | undefined => {
    return menuItems.find((m) => m.id === id);
  };

  const updateMeal = (dayIndex: number, mealType: MealType, menuItemId: string) => {
    const date = getDateForDay(dayIndex);
    const menuItem = menuItems.find((m) => m.id === menuItemId);

    setMeals((prev) => {
      // Remove existing entry for this date/meal
      const filtered = prev.filter(
        (m) => !(m.date === date && m.meal_type === mealType)
      );

      // Add new entry if a menu item was selected
      if (menuItemId && menuItem) {
        filtered.push({
          date,
          meal_type: mealType,
          menu_item_id: menuItemId,
          menu_item_name: menuItem.name,
        });
      }

      return filtered;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const weekEnd = getWeekEnd(new Date(currentWeekStart));

      if (weeklyMenu) {
        await updateWeeklyMenu(weeklyMenu.id, { meals });
      } else {
        await createWeeklyMenu({
          week_start: currentWeekStart,
          week_end: weekEnd,
          meals,
          status: 'draft',
        });
      }
      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error('Error saving menu:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatWeekRange = (): string => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 4);
    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  // Calculate weekly cost estimate
  const calculateWeeklyCost = (): number => {
    let total = 0;
    for (const meal of meals) {
      const menuItem = getMenuItemById(meal.menu_item_id);
      if (menuItem?.cost_per_serving) {
        // Assume average of 50 servings per meal
        total += menuItem.cost_per_serving * 50;
      }
    }
    return total;
  };

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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg">{formatWeekRange()}</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {weeklyMenu && (
            <Badge variant={weeklyMenu.status === 'published' ? 'default' : 'secondary'}>
              {weeklyMenu.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Menu
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium w-[100px]">Meal</th>
              {weekDays.map((day, index) => (
                <th key={day} className="text-center p-3 font-medium min-w-[150px]">
                  <div>{day}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    {new Date(getDateForDay(index)).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((mealType) => {
              const mealMenuItems = menuItems.filter(
                (m) => m.meal_type === mealType
              );
              return (
                <tr key={mealType} className="border-b last:border-0">
                  <td className="p-3 font-medium">
                    {MEAL_TYPE_LABELS[mealType]}
                  </td>
                  {weekDays.map((_, dayIndex) => {
                    const currentMeal = getMealForDayAndType(dayIndex, mealType);
                    return (
                      <td key={dayIndex} className="p-3">
                        <Select
                          value={currentMeal?.menu_item_id || '__none__'}
                          onValueChange={(value) =>
                            updateMeal(dayIndex, mealType, value === '__none__' ? '' : value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select meal..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {mealMenuItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                                {item.cost_per_serving && (
                                  <span className="text-muted-foreground ml-2">
                                    ({formatFoodCurrency(item.cost_per_serving)}/srv)
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Weekly Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Meals planned:{' '}
            <span className="font-bold text-foreground">{meals.length}</span> / 20
          </div>
          <div className="text-sm text-muted-foreground">
            Estimated weekly cost:{' '}
            <span className="font-bold text-foreground">
              {formatFoodCurrency(calculateWeeklyCost())}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
