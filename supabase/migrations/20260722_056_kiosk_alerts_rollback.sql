-- Rollback for migration 056 (kiosk alerts). Drops the table and its history.
DROP TABLE IF EXISTS public.kiosk_alerts;
