// Food Count, Inventory, Menu, and CACFP Types for Christina's Child Care Center
// Uses localStorage for persistence, designed for easy Supabase migration

// ============================================================================
// Food Count Types (CACFP Reporting)
// ============================================================================

export type MealType = 'breakfast' | 'am_snack' | 'lunch' | 'pm_snack';

export interface FoodCount {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  classroom_id: string;
  classroom_name: string;
  meal_type: MealType;
  child_count: number;
  adult_count: number;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export type FoodCountCreate = Omit<FoodCount, 'id' | 'created_at' | 'updated_at'>;

// Daily summary for a classroom
export interface DailyFoodSummary {
  date: string;
  classroom_id: string;
  classroom_name: string;
  counts: Record<MealType, { children: number; adults: number }>;
  total_meals_served: number;
}

// CACFP Reporting
export interface CACFPDailyReport {
  date: string;
  totals: Record<MealType, { children: number; adults: number }>;
  by_classroom: DailyFoodSummary[];
  grand_total: number;
}

export interface CACFPMonthlyReport {
  month: string; // YYYY-MM
  daily_totals: Record<string, Record<MealType, number>>; // date -> meal -> count
  meal_totals: Record<MealType, number>;
  grand_total: number;
  average_daily: number;
}

// ============================================================================
// Inventory Types
// ============================================================================

export type InventoryCategory =
  | 'dairy'
  | 'protein'
  | 'grains'
  | 'fruits'
  | 'vegetables'
  | 'beverages'
  | 'snacks'
  | 'supplies';

export type InventoryUnit =
  | 'units'
  | 'oz'
  | 'lbs'
  | 'gallons'
  | 'servings'
  | 'cases'
  | 'loaves'
  | 'bags'
  | 'boxes';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: InventoryUnit;
  reorder_threshold: number;
  expiration_date?: string; // ISO date
  cost_per_unit?: number;
  supplier?: string;
  storage_location?: string;
  notes?: string;
  last_restocked?: string; // ISO date
  created_at: string;
  updated_at: string;
}

export type InventoryItemCreate = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;

// Inventory alerts
export interface InventoryAlert {
  item_id: string;
  item_name: string;
  alert_type: 'low_stock' | 'expiring_soon' | 'expired';
  current_value: number | string;
  threshold_value: number | string;
  message: string;
}

// ============================================================================
// Menu Planning Types
// ============================================================================

export interface MenuIngredient {
  item_id: string;
  item_name: string;
  quantity: number;
  unit: InventoryUnit;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  meal_type: MealType;
  ingredients: MenuIngredient[];
  servings_yield: number;
  cost_per_serving?: number;
  nutrition_info?: {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  };
  allergens?: string[];
  is_vegetarian?: boolean;
  is_dairy_free?: boolean;
  is_gluten_free?: boolean;
  prep_time_minutes?: number;
  created_at: string;
  updated_at: string;
}

export type MenuItemCreate = Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;

export interface DailyMenuEntry {
  date: string;
  meal_type: MealType;
  menu_item_id: string;
  menu_item_name: string;
  notes?: string;
}

export interface WeeklyMenu {
  id: string;
  week_start: string; // ISO date (Monday)
  week_end: string; // ISO date (Sunday)
  meals: DailyMenuEntry[];
  status: 'draft' | 'published';
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type WeeklyMenuCreate = Omit<WeeklyMenu, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// Food Cost Tracking Types
// ============================================================================

export interface FoodCostEntry {
  id: string;
  date: string;
  category: InventoryCategory;
  description: string;
  amount: number;
  vendor?: string;
  receipt_ref?: string;
  created_at: string;
}

export interface FoodCostSummary {
  period: 'week' | 'month';
  period_start: string;
  period_end: string;
  total_cost: number;
  by_category: Record<InventoryCategory, number>;
  meals_served: number;
  cost_per_meal: number;
}

// ============================================================================
// Projections Types
// ============================================================================

export interface FoodProjection {
  period: 'week' | 'month';
  period_start: string;
  period_end: string;
  projected_meals: Record<MealType, number>;
  total_projected_meals: number;
  estimated_cost: number;
  inventory_needed: {
    item_id: string;
    item_name: string;
    quantity_needed: number;
    current_quantity: number;
    to_order: number;
  }[];
  based_on_days: number; // Number of historical days used for projection
}

// ============================================================================
// Classroom Types (for food counts)
// ============================================================================

export type AgeGroup = 'infant' | 'toddler' | 'preschool' | 'school_age';

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  age_group: AgeGroup;
  building_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ClassroomCreate = Omit<Classroom, 'id' | 'created_at' | 'updated_at'>;

// Default classrooms (used for initial seeding)
export const DEFAULT_CLASSROOMS: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Classroom 1', capacity: 12, age_group: 'infant', is_active: true },
  { name: 'Classroom 2', capacity: 12, age_group: 'toddler', is_active: true },
  { name: 'Classroom 3', capacity: 16, age_group: 'toddler', is_active: true },
  { name: 'Classroom 4', capacity: 20, age_group: 'preschool', is_active: true },
  { name: 'Classroom 5', capacity: 20, age_group: 'preschool', is_active: true },
  { name: 'Classroom 6', capacity: 24, age_group: 'school_age', is_active: true },
];

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  infant: 'Infant',
  toddler: 'Toddler',
  preschool: 'Preschool',
  school_age: 'School Age',
};

export function generateClassroomId(): string {
  return `cls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Meal type display names
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  am_snack: 'AM Snack',
  lunch: 'Lunch',
  pm_snack: 'PM Snack',
};

// Inventory category display names
export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  dairy: 'Dairy',
  protein: 'Protein',
  grains: 'Grains',
  fruits: 'Fruits',
  vegetables: 'Vegetables',
  beverages: 'Beverages',
  snacks: 'Snacks',
  supplies: 'Supplies',
};

// ============================================================================
// Utility Functions
// ============================================================================

export function generateFoodCountId(): string {
  return `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateInventoryId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMenuItemId(): string {
  return `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateWeeklyMenuId(): string {
  return `wmenu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateFoodCostId(): string {
  return `fcost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get the start of the week (Monday)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// Get the end of the week (Sunday)
export function getWeekEnd(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// Format meal type for display
export function formatMealType(mealType: MealType): string {
  return MEAL_TYPE_LABELS[mealType] || mealType;
}

// Format category for display
export function formatCategory(category: InventoryCategory): string {
  return CATEGORY_LABELS[category] || category;
}

// Check if item is expiring soon (within 7 days)
export function isExpiringSoon(expirationDate?: string, daysThreshold: number = 7): boolean {
  if (!expirationDate) return false;
  const expDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= daysThreshold;
}

// Check if item is expired
export function isExpired(expirationDate?: string): boolean {
  if (!expirationDate) return false;
  const expDate = new Date(expirationDate);
  const today = new Date();
  return expDate < today;
}

// Check if item is low on stock
export function isLowStock(quantity: number, reorderThreshold: number): boolean {
  return quantity <= reorderThreshold;
}

// Format currency
export function formatFoodCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
