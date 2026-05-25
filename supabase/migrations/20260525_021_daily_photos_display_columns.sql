-- 20260525_021_daily_photos_display_columns
-- Additive only: add the two denormalized display columns the photo UI + parent
-- route already expect (classroom_name, employee_name). The table had classroom_id
-- (uuid) but the read paths select classroom_name, so parent/admin photo reads were
-- erroring on a missing column. Nullable, no data change, cannot break existing rows.

alter table public.daily_photos add column if not exists classroom_name text;
alter table public.daily_photos add column if not exists employee_name text;
