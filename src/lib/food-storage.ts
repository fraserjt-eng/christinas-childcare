// Food Storage Module for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

import {
  FoodCount,
  FoodCountCreate,
  InventoryItem,
  InventoryItemCreate,
  MenuItem,
  MenuItemCreate,
  WeeklyMenu,
  WeeklyMenuCreate,
  DailyFoodSummary,
  CACFPDailyReport,
  CACFPMonthlyReport,
  InventoryAlert,
  FoodProjection,
  MealType,
  CLASSROOMS,
  generateFoodCountId,
  generateInventoryId,
  generateMenuItemId,
  generateWeeklyMenuId,
  getWeekStart,
  getWeekEnd,
  isExpiringSoon,
  isExpired,
  isLowStock,
} from '@/types/food';

// Storage keys
const STORAGE_KEYS = {
  foodCounts: 'christinas_food_counts',
  inventory: 'christinas_inventory',
  menuItems: 'christinas_menu_items',
  weeklyMenus: 'christinas_weekly_menus',
  foodCosts: 'christinas_food_costs',
};

// ============================================================================
// Generic Storage Helpers
// ============================================================================

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// ============================================================================
// Food Count CRUD
// ============================================================================

export async function getFoodCounts(filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  classroom_id?: string;
  meal_type?: MealType;
}): Promise<FoodCount[]> {
  let counts = getFromStorage<FoodCount>(STORAGE_KEYS.foodCounts);

  if (filters) {
    if (filters.date) {
      counts = counts.filter((c) => c.date === filters.date);
    }
    if (filters.startDate) {
      counts = counts.filter((c) => c.date >= filters.startDate!);
    }
    if (filters.endDate) {
      counts = counts.filter((c) => c.date <= filters.endDate!);
    }
    if (filters.classroom_id) {
      counts = counts.filter((c) => c.classroom_id === filters.classroom_id);
    }
    if (filters.meal_type) {
      counts = counts.filter((c) => c.meal_type === filters.meal_type);
    }
  }

  // Sort by date descending, then classroom, then meal
  counts.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    if (a.classroom_name !== b.classroom_name) return a.classroom_name.localeCompare(b.classroom_name);
    return a.meal_type.localeCompare(b.meal_type);
  });

  return counts;
}

export async function getFoodCount(id: string): Promise<FoodCount | null> {
  const counts = getFromStorage<FoodCount>(STORAGE_KEYS.foodCounts);
  return counts.find((c) => c.id === id) || null;
}

export async function createFoodCount(data: FoodCountCreate): Promise<FoodCount> {
  const counts = getFromStorage<FoodCount>(STORAGE_KEYS.foodCounts);
  const now = new Date().toISOString();

  const newCount: FoodCount = {
    ...data,
    id: generateFoodCountId(),
    created_at: now,
    updated_at: now,
  };

  counts.push(newCount);
  saveToStorage(STORAGE_KEYS.foodCounts, counts);
  return newCount;
}

export async function updateFoodCount(id: string, updates: Partial<FoodCount>): Promise<FoodCount | null> {
  const counts = getFromStorage<FoodCount>(STORAGE_KEYS.foodCounts);
  const index = counts.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updatedCount: FoodCount = {
    ...counts[index],
    ...updates,
    id: counts[index].id,
    created_at: counts[index].created_at,
    updated_at: new Date().toISOString(),
  };

  counts[index] = updatedCount;
  saveToStorage(STORAGE_KEYS.foodCounts, counts);
  return updatedCount;
}

export async function deleteFoodCount(id: string): Promise<boolean> {
  const counts = getFromStorage<FoodCount>(STORAGE_KEYS.foodCounts);
  const index = counts.findIndex((c) => c.id === id);

  if (index === -1) return false;

  counts.splice(index, 1);
  saveToStorage(STORAGE_KEYS.foodCounts, counts);
  return true;
}

// Upsert a food count for a specific date/classroom/meal
export async function upsertFoodCount(data: FoodCountCreate): Promise<FoodCount> {
  const counts = getFromStorage<FoodCount>(STORAGE_KEYS.foodCounts);
  const index = counts.findIndex(
    (c) =>
      c.date === data.date &&
      c.classroom_id === data.classroom_id &&
      c.meal_type === data.meal_type
  );

  const now = new Date().toISOString();

  if (index !== -1) {
    // Update existing
    const updatedCount: FoodCount = {
      ...counts[index],
      ...data,
      id: counts[index].id,
      created_at: counts[index].created_at,
      updated_at: now,
    };
    counts[index] = updatedCount;
    saveToStorage(STORAGE_KEYS.foodCounts, counts);
    return updatedCount;
  } else {
    // Create new
    const newCount: FoodCount = {
      ...data,
      id: generateFoodCountId(),
      created_at: now,
      updated_at: now,
    };
    counts.push(newCount);
    saveToStorage(STORAGE_KEYS.foodCounts, counts);
    return newCount;
  }
}

// ============================================================================
// CACFP Reporting
// ============================================================================

export async function getDailyFoodSummary(date: string): Promise<DailyFoodSummary[]> {
  const counts = await getFoodCounts({ date });
  const summaryMap: Record<string, DailyFoodSummary> = {};

  // Initialize for all classrooms
  for (const classroom of CLASSROOMS) {
    summaryMap[classroom.id] = {
      date,
      classroom_id: classroom.id,
      classroom_name: classroom.name,
      counts: {
        breakfast: { children: 0, adults: 0 },
        am_snack: { children: 0, adults: 0 },
        lunch: { children: 0, adults: 0 },
        pm_snack: { children: 0, adults: 0 },
      },
      total_meals_served: 0,
    };
  }

  // Fill in actual counts
  for (const count of counts) {
    if (summaryMap[count.classroom_id]) {
      summaryMap[count.classroom_id].counts[count.meal_type] = {
        children: count.child_count,
        adults: count.adult_count,
      };
      summaryMap[count.classroom_id].total_meals_served += count.child_count + count.adult_count;
    }
  }

  return Object.values(summaryMap);
}

export async function getCACFPDailyReport(date: string): Promise<CACFPDailyReport> {
  const summaries = await getDailyFoodSummary(date);

  const totals: Record<MealType, { children: number; adults: number }> = {
    breakfast: { children: 0, adults: 0 },
    am_snack: { children: 0, adults: 0 },
    lunch: { children: 0, adults: 0 },
    pm_snack: { children: 0, adults: 0 },
  };

  let grandTotal = 0;

  for (const summary of summaries) {
    for (const mealType of ['breakfast', 'am_snack', 'lunch', 'pm_snack'] as MealType[]) {
      totals[mealType].children += summary.counts[mealType].children;
      totals[mealType].adults += summary.counts[mealType].adults;
      grandTotal += summary.counts[mealType].children + summary.counts[mealType].adults;
    }
  }

  return {
    date,
    totals,
    by_classroom: summaries,
    grand_total: grandTotal,
  };
}

export async function getCACFPMonthlyReport(month: string): Promise<CACFPMonthlyReport> {
  const year = parseInt(month.split('-')[0]);
  const monthNum = parseInt(month.split('-')[1]);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const startDate = `${month}-01`;
  const endDate = `${month}-${daysInMonth.toString().padStart(2, '0')}`;

  const counts = await getFoodCounts({ startDate, endDate });

  const dailyTotals: Record<string, Record<MealType, number>> = {};
  const mealTotals: Record<MealType, number> = {
    breakfast: 0,
    am_snack: 0,
    lunch: 0,
    pm_snack: 0,
  };
  let grandTotal = 0;

  for (const count of counts) {
    if (!dailyTotals[count.date]) {
      dailyTotals[count.date] = { breakfast: 0, am_snack: 0, lunch: 0, pm_snack: 0 };
    }
    const mealCount = count.child_count + count.adult_count;
    dailyTotals[count.date][count.meal_type] += mealCount;
    mealTotals[count.meal_type] += mealCount;
    grandTotal += mealCount;
  }

  const daysWithData = Object.keys(dailyTotals).length;
  const averageDaily = daysWithData > 0 ? grandTotal / daysWithData : 0;

  return {
    month,
    daily_totals: dailyTotals,
    meal_totals: mealTotals,
    grand_total: grandTotal,
    average_daily: Math.round(averageDaily * 10) / 10,
  };
}

// ============================================================================
// Inventory CRUD
// ============================================================================

export async function getInventoryItems(filters?: {
  category?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}): Promise<InventoryItem[]> {
  let items = getFromStorage<InventoryItem>(STORAGE_KEYS.inventory);

  if (filters) {
    if (filters.category) {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters.lowStock) {
      items = items.filter((i) => isLowStock(i.quantity, i.reorder_threshold));
    }
    if (filters.expiringSoon) {
      items = items.filter((i) => isExpiringSoon(i.expiration_date) || isExpired(i.expiration_date));
    }
  }

  // Sort by category, then name
  items.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return items;
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  const items = getFromStorage<InventoryItem>(STORAGE_KEYS.inventory);
  return items.find((i) => i.id === id) || null;
}

export async function createInventoryItem(data: InventoryItemCreate): Promise<InventoryItem> {
  const items = getFromStorage<InventoryItem>(STORAGE_KEYS.inventory);
  const now = new Date().toISOString();

  const newItem: InventoryItem = {
    ...data,
    id: generateInventoryId(),
    created_at: now,
    updated_at: now,
  };

  items.push(newItem);
  saveToStorage(STORAGE_KEYS.inventory, items);
  return newItem;
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem | null> {
  const items = getFromStorage<InventoryItem>(STORAGE_KEYS.inventory);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) return null;

  const updatedItem: InventoryItem = {
    ...items[index],
    ...updates,
    id: items[index].id,
    created_at: items[index].created_at,
    updated_at: new Date().toISOString(),
  };

  items[index] = updatedItem;
  saveToStorage(STORAGE_KEYS.inventory, items);
  return updatedItem;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const items = getFromStorage<InventoryItem>(STORAGE_KEYS.inventory);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) return false;

  items.splice(index, 1);
  saveToStorage(STORAGE_KEYS.inventory, items);
  return true;
}

// Get inventory alerts
export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  const items = await getInventoryItems();
  const alerts: InventoryAlert[] = [];

  for (const item of items) {
    // Low stock alert
    if (isLowStock(item.quantity, item.reorder_threshold)) {
      alerts.push({
        item_id: item.id,
        item_name: item.name,
        alert_type: 'low_stock',
        current_value: item.quantity,
        threshold_value: item.reorder_threshold,
        message: `${item.name} is low on stock (${item.quantity} ${item.unit} remaining)`,
      });
    }

    // Expired alert
    if (isExpired(item.expiration_date)) {
      alerts.push({
        item_id: item.id,
        item_name: item.name,
        alert_type: 'expired',
        current_value: item.expiration_date!,
        threshold_value: 'today',
        message: `${item.name} has expired (${item.expiration_date})`,
      });
    }
    // Expiring soon alert
    else if (isExpiringSoon(item.expiration_date)) {
      alerts.push({
        item_id: item.id,
        item_name: item.name,
        alert_type: 'expiring_soon',
        current_value: item.expiration_date!,
        threshold_value: '7 days',
        message: `${item.name} expires on ${item.expiration_date}`,
      });
    }
  }

  return alerts;
}

// ============================================================================
// Menu Item CRUD
// ============================================================================

export async function getMenuItems(filters?: { meal_type?: MealType }): Promise<MenuItem[]> {
  let items = getFromStorage<MenuItem>(STORAGE_KEYS.menuItems);

  if (filters?.meal_type) {
    items = items.filter((i) => i.meal_type === filters.meal_type);
  }

  // Sort by meal type, then name
  items.sort((a, b) => {
    if (a.meal_type !== b.meal_type) return a.meal_type.localeCompare(b.meal_type);
    return a.name.localeCompare(b.name);
  });

  return items;
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const items = getFromStorage<MenuItem>(STORAGE_KEYS.menuItems);
  return items.find((i) => i.id === id) || null;
}

export async function createMenuItem(data: MenuItemCreate): Promise<MenuItem> {
  const items = getFromStorage<MenuItem>(STORAGE_KEYS.menuItems);
  const now = new Date().toISOString();

  const newItem: MenuItem = {
    ...data,
    id: generateMenuItemId(),
    created_at: now,
    updated_at: now,
  };

  items.push(newItem);
  saveToStorage(STORAGE_KEYS.menuItems, items);
  return newItem;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  const items = getFromStorage<MenuItem>(STORAGE_KEYS.menuItems);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) return null;

  const updatedItem: MenuItem = {
    ...items[index],
    ...updates,
    id: items[index].id,
    created_at: items[index].created_at,
    updated_at: new Date().toISOString(),
  };

  items[index] = updatedItem;
  saveToStorage(STORAGE_KEYS.menuItems, items);
  return updatedItem;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const items = getFromStorage<MenuItem>(STORAGE_KEYS.menuItems);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) return false;

  items.splice(index, 1);
  saveToStorage(STORAGE_KEYS.menuItems, items);
  return true;
}

// ============================================================================
// Weekly Menu CRUD
// ============================================================================

export async function getWeeklyMenus(filters?: {
  week_start?: string;
  status?: 'draft' | 'published';
}): Promise<WeeklyMenu[]> {
  let menus = getFromStorage<WeeklyMenu>(STORAGE_KEYS.weeklyMenus);

  if (filters) {
    if (filters.week_start) {
      menus = menus.filter((m) => m.week_start === filters.week_start);
    }
    if (filters.status) {
      menus = menus.filter((m) => m.status === filters.status);
    }
  }

  // Sort by week_start descending
  menus.sort((a, b) => b.week_start.localeCompare(a.week_start));

  return menus;
}

export async function getWeeklyMenu(id: string): Promise<WeeklyMenu | null> {
  const menus = getFromStorage<WeeklyMenu>(STORAGE_KEYS.weeklyMenus);
  return menus.find((m) => m.id === id) || null;
}

export async function getCurrentWeeklyMenu(): Promise<WeeklyMenu | null> {
  const weekStart = getWeekStart();
  const menus = await getWeeklyMenus({ week_start: weekStart });
  return menus[0] || null;
}

export async function createWeeklyMenu(data: WeeklyMenuCreate): Promise<WeeklyMenu> {
  const menus = getFromStorage<WeeklyMenu>(STORAGE_KEYS.weeklyMenus);
  const now = new Date().toISOString();

  const newMenu: WeeklyMenu = {
    ...data,
    id: generateWeeklyMenuId(),
    created_at: now,
    updated_at: now,
  };

  menus.push(newMenu);
  saveToStorage(STORAGE_KEYS.weeklyMenus, menus);
  return newMenu;
}

export async function updateWeeklyMenu(id: string, updates: Partial<WeeklyMenu>): Promise<WeeklyMenu | null> {
  const menus = getFromStorage<WeeklyMenu>(STORAGE_KEYS.weeklyMenus);
  const index = menus.findIndex((m) => m.id === id);

  if (index === -1) return null;

  const updatedMenu: WeeklyMenu = {
    ...menus[index],
    ...updates,
    id: menus[index].id,
    created_at: menus[index].created_at,
    updated_at: new Date().toISOString(),
  };

  menus[index] = updatedMenu;
  saveToStorage(STORAGE_KEYS.weeklyMenus, menus);
  return updatedMenu;
}

export async function deleteWeeklyMenu(id: string): Promise<boolean> {
  const menus = getFromStorage<WeeklyMenu>(STORAGE_KEYS.weeklyMenus);
  const index = menus.findIndex((m) => m.id === id);

  if (index === -1) return false;

  menus.splice(index, 1);
  saveToStorage(STORAGE_KEYS.weeklyMenus, menus);
  return true;
}

// ============================================================================
// Projections
// ============================================================================

export async function getFoodProjection(period: 'week' | 'month'): Promise<FoodProjection> {
  const today = new Date();
  let periodStart: string;
  let periodEnd: string;
  let daysToProject: number;

  if (period === 'week') {
    periodStart = getWeekStart(today);
    periodEnd = getWeekEnd(today);
    daysToProject = 5; // Weekdays
  } else {
    const year = today.getFullYear();
    const month = today.getMonth();
    periodStart = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    periodEnd = `${year}-${(month + 1).toString().padStart(2, '0')}-${daysInMonth}`;
    daysToProject = Math.ceil(daysInMonth * 5 / 7); // Approximate weekdays
  }

  // Get historical data (last 30 days)
  const historicalStart = new Date(today);
  historicalStart.setDate(historicalStart.getDate() - 30);
  const historicalCounts = await getFoodCounts({
    startDate: historicalStart.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  });

  // Calculate daily averages by meal type
  const mealTotals: Record<MealType, number> = {
    breakfast: 0,
    am_snack: 0,
    lunch: 0,
    pm_snack: 0,
  };

  const datesWithData = new Set<string>();

  for (const count of historicalCounts) {
    mealTotals[count.meal_type] += count.child_count;
    datesWithData.add(count.date);
  }

  const historicalDays = datesWithData.size || 1;

  const projectedMeals: Record<MealType, number> = {
    breakfast: Math.round((mealTotals.breakfast / historicalDays) * daysToProject),
    am_snack: Math.round((mealTotals.am_snack / historicalDays) * daysToProject),
    lunch: Math.round((mealTotals.lunch / historicalDays) * daysToProject),
    pm_snack: Math.round((mealTotals.pm_snack / historicalDays) * daysToProject),
  };

  const totalProjectedMeals = Object.values(projectedMeals).reduce((a, b) => a + b, 0);

  // Estimate cost (placeholder - would need actual cost data)
  const costPerMeal = 2.5; // Estimated average
  const estimatedCost = totalProjectedMeals * costPerMeal;

  return {
    period,
    period_start: periodStart,
    period_end: periodEnd,
    projected_meals: projectedMeals,
    total_projected_meals: totalProjectedMeals,
    estimated_cost: Math.round(estimatedCost * 100) / 100,
    inventory_needed: [], // Would need menu/recipe integration
    based_on_days: historicalDays,
  };
}

// ============================================================================
// Sample Data
// ============================================================================

const SAMPLE_INVENTORY: InventoryItemCreate[] = [
  {
    name: 'Whole Milk',
    category: 'dairy',
    quantity: 8,
    unit: 'gallons',
    reorder_threshold: 4,
    cost_per_unit: 4.29,
    supplier: 'Kemps',
    expiration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Cheese Sticks',
    category: 'dairy',
    quantity: 48,
    unit: 'units',
    reorder_threshold: 24,
    cost_per_unit: 0.35,
    supplier: 'Sysco',
    expiration_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Chicken Nuggets',
    category: 'protein',
    quantity: 200,
    unit: 'servings',
    reorder_threshold: 100,
    cost_per_unit: 0.45,
    supplier: 'Tyson',
  },
  {
    name: 'Turkey Slices',
    category: 'protein',
    quantity: 3,
    unit: 'lbs',
    reorder_threshold: 5,
    cost_per_unit: 6.99,
    supplier: 'Deli',
    expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Whole Wheat Bread',
    category: 'grains',
    quantity: 6,
    unit: 'loaves',
    reorder_threshold: 4,
    cost_per_unit: 3.49,
    supplier: "Sara Lee",
    expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Goldfish Crackers',
    category: 'snacks',
    quantity: 12,
    unit: 'bags',
    reorder_threshold: 6,
    cost_per_unit: 2.99,
    supplier: 'Pepperidge Farm',
  },
  {
    name: 'Apple Slices',
    category: 'fruits',
    quantity: 100,
    unit: 'servings',
    reorder_threshold: 50,
    cost_per_unit: 0.25,
    supplier: 'Sysco',
  },
  {
    name: 'Baby Carrots',
    category: 'vegetables',
    quantity: 5,
    unit: 'lbs',
    reorder_threshold: 3,
    cost_per_unit: 2.49,
    supplier: 'Sysco',
    expiration_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Juice Boxes',
    category: 'beverages',
    quantity: 4,
    unit: 'cases',
    reorder_threshold: 2,
    cost_per_unit: 5.99,
    supplier: 'Mott\'s',
  },
  {
    name: 'Napkins',
    category: 'supplies',
    quantity: 3,
    unit: 'boxes',
    reorder_threshold: 2,
    cost_per_unit: 4.99,
    supplier: 'Sysco',
  },
];

const SAMPLE_MENU_ITEMS: MenuItemCreate[] = [
  {
    name: 'Scrambled Eggs with Toast',
    description: 'Fluffy scrambled eggs served with whole wheat toast',
    meal_type: 'breakfast',
    ingredients: [],
    servings_yield: 20,
    cost_per_serving: 0.75,
    allergens: ['eggs', 'wheat'],
    prep_time_minutes: 15,
  },
  {
    name: 'Oatmeal with Fruit',
    description: 'Warm oatmeal topped with fresh seasonal fruit',
    meal_type: 'breakfast',
    ingredients: [],
    servings_yield: 25,
    cost_per_serving: 0.50,
    is_vegetarian: true,
    prep_time_minutes: 10,
  },
  {
    name: 'Cheese & Crackers',
    description: 'Cheese sticks with whole grain crackers',
    meal_type: 'am_snack',
    ingredients: [],
    servings_yield: 30,
    cost_per_serving: 0.40,
    allergens: ['dairy', 'wheat'],
    is_vegetarian: true,
    prep_time_minutes: 5,
  },
  {
    name: 'Apple Slices with Yogurt',
    description: 'Fresh apple slices with vanilla yogurt dip',
    meal_type: 'am_snack',
    ingredients: [],
    servings_yield: 25,
    cost_per_serving: 0.45,
    allergens: ['dairy'],
    is_vegetarian: true,
    prep_time_minutes: 10,
  },
  {
    name: 'Chicken Nuggets with Veggies',
    description: 'Baked chicken nuggets with steamed broccoli and carrots',
    meal_type: 'lunch',
    ingredients: [],
    servings_yield: 24,
    cost_per_serving: 1.25,
    prep_time_minutes: 25,
  },
  {
    name: 'Turkey & Cheese Sandwich',
    description: 'Turkey and cheese on whole wheat with fruit',
    meal_type: 'lunch',
    ingredients: [],
    servings_yield: 20,
    cost_per_serving: 1.15,
    allergens: ['dairy', 'wheat'],
    prep_time_minutes: 20,
  },
  {
    name: 'Goldfish & Juice',
    description: 'Goldfish crackers with 100% fruit juice',
    meal_type: 'pm_snack',
    ingredients: [],
    servings_yield: 30,
    cost_per_serving: 0.35,
    allergens: ['wheat'],
    is_vegetarian: true,
    prep_time_minutes: 5,
  },
  {
    name: 'Veggies & Hummus',
    description: 'Baby carrots and cucumber with hummus',
    meal_type: 'pm_snack',
    ingredients: [],
    servings_yield: 25,
    cost_per_serving: 0.50,
    is_vegetarian: true,
    is_dairy_free: true,
    prep_time_minutes: 10,
  },
];

export async function seedFoodData(): Promise<{
  inventory: number;
  menuItems: number;
  foodCounts: number;
}> {
  // Check if data already exists
  const existingInventory = await getInventoryItems();
  if (existingInventory.length > 0) {
    return { inventory: 0, menuItems: 0, foodCounts: 0 };
  }

  let inventoryCount = 0;
  let menuItemCount = 0;
  let foodCountCount = 0;

  // Seed inventory
  for (const item of SAMPLE_INVENTORY) {
    await createInventoryItem(item);
    inventoryCount++;
  }

  // Seed menu items
  for (const item of SAMPLE_MENU_ITEMS) {
    await createMenuItem(item);
    menuItemCount++;
  }

  // Seed food counts for the past 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateString = date.toISOString().split('T')[0];

    for (const classroom of CLASSROOMS) {
      // Random counts based on classroom capacity
      const baseCount = Math.floor(classroom.capacity * 0.7);

      for (const mealType of ['breakfast', 'am_snack', 'lunch', 'pm_snack'] as MealType[]) {
        const variance = Math.floor(Math.random() * 4) - 2;
        const childCount = Math.max(0, baseCount + variance);

        await createFoodCount({
          date: dateString,
          classroom_id: classroom.id,
          classroom_name: classroom.name,
          meal_type: mealType,
          child_count: childCount,
          adult_count: mealType === 'lunch' ? 1 : 0, // 1 teacher at lunch
        });
        foodCountCount++;
      }
    }
  }

  return {
    inventory: inventoryCount,
    menuItems: menuItemCount,
    foodCounts: foodCountCount,
  };
}

// Clear all food data (for testing)
export async function clearAllFoodData(): Promise<void> {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  });
}
