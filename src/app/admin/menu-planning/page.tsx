'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UtensilsCrossed,
  Calendar,
  Plus,
  Loader2,
} from 'lucide-react';
import { MenuPlannerWeek } from '@/components/food/MenuPlannerWeek';
import {
  getMenuItems,
  seedFoodData,
} from '@/lib/food-storage';
import {
  MenuItem,
  MealType,
  MEAL_TYPE_LABELS,
  formatFoodCurrency,
} from '@/types/food';

export default function MenuPlanningPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await seedFoodData();
      loadMenuItems();
    }
    init();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    const items = await getMenuItems();
    setMenuItems(items);
    setLoading(false);
  };

  const mealTypes: MealType[] = ['breakfast', 'am_snack', 'lunch', 'pm_snack'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Menu Planning
          </h1>
          <p className="text-muted-foreground">
            Plan weekly menus and track food costs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="planner" className="space-y-4">
        <TabsList>
          <TabsTrigger value="planner" className="gap-2">
            <Calendar className="h-4 w-4" />
            Weekly Planner
          </TabsTrigger>
          <TabsTrigger value="items" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Menu Items
          </TabsTrigger>
        </TabsList>

        {/* Weekly Planner Tab */}
        <TabsContent value="planner" className="space-y-4">
          <MenuPlannerWeek />
        </TabsContent>

        {/* Menu Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Menu Items Library</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Menu Item
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {mealTypes.map((mealType) => {
                const items = menuItems.filter((i) => i.meal_type === mealType);
                if (items.length === 0) return null;

                return (
                  <Card key={mealType}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        {MEAL_TYPE_LABELS[mealType]}
                        <Badge variant="secondary">{items.length} items</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.cost_per_serving && (
                                <Badge variant="outline">
                                  {formatFoodCurrency(item.cost_per_serving)}/srv
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1 mt-3">
                              {item.is_vegetarian && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-green-100 text-green-700"
                                >
                                  Vegetarian
                                </Badge>
                              )}
                              {item.is_dairy_free && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-700"
                                >
                                  Dairy-Free
                                </Badge>
                              )}
                              {item.is_gluten_free && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-amber-100 text-amber-700"
                                >
                                  Gluten-Free
                                </Badge>
                              )}
                              {item.allergens?.map((allergen) => (
                                <Badge
                                  key={allergen}
                                  variant="outline"
                                  className="text-xs text-red-600 border-red-300"
                                >
                                  {allergen}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                              <span>Yields: {item.servings_yield} servings</span>
                              {item.prep_time_minutes && (
                                <span>{item.prep_time_minutes} min prep</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
