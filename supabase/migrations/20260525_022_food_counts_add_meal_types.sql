-- 20260525_022_food_counts_add_meal_types
-- Allow Supper and Evening Snack as meal types. food_counts.meal_type had a CHECK
-- constraint limited to the original four, so logging supper/evening snack would be
-- rejected at insert. Widen the constraint. No data change; existing rows still pass.

alter table public.food_counts drop constraint if exists food_counts_meal_type_check;

alter table public.food_counts
  add constraint food_counts_meal_type_check
  check (meal_type = any (array[
    'breakfast'::text,
    'am_snack'::text,
    'lunch'::text,
    'pm_snack'::text,
    'supper'::text,
    'evening_snack'::text
  ]));
