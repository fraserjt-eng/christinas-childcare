# Real-data-only purge — DB row deletion list (needs J's approval)

The CODE side is done (commit J2): every demo seeder is gated off and the admin
pages show real data or empty states (`NEXT_PUBLIC_SEED_DEMO_DATA=false`). So the
app no longer *generates* fake records.

This file is the DATA side: the demo rows that may already sit in a database.
**Nothing here is deleted automatically.** The flow is: run the SELECTs, review
the rows, approve, then run the matching DELETEs. Real Brooklyn Park data is
never matched by these (they key on demo-only markers).

How to run: paste into the Supabase SQL editor for the target project. For the
TEST DB it's safe to delete freely. For PROD (`dkzxcxwjhhxqfgksynjb`) review the
SELECT output first and delete only on your go.

## 1. Highest-confidence markers (safe — no human types these)

```sql
-- Seed-id prefixes (review)
SELECT 'authorizations' t, count(*) FROM authorizations WHERE id::text LIKE 'auth_seed_%'
UNION ALL SELECT 'meetings', count(*) FROM meetings WHERE id::text LIKE 'meet_seed_%'
UNION ALL SELECT 'knowledge', count(*) FROM knowledge WHERE id::text LIKE 'kb_seed_%'
UNION ALL SELECT 'onboarding', count(*) FROM onboarding WHERE id::text LIKE 'assign_demo_%'
UNION ALL SELECT 'center_announcements', count(*) FROM center_announcements WHERE id IN ('ann-spring-event','ann-weather-reminder')
UNION ALL SELECT 'parent_conversations', count(*) FROM parent_conversations WHERE id LIKE 'conv-ophelia%' OR id LIKE 'conv-maria%' OR id LIKE 'conv-james%'
UNION ALL SELECT 'lessons', count(*) FROM lessons WHERE title IN ('Rainbow Counting Adventure','Feelings Faces');

-- After review, delete:
DELETE FROM authorizations       WHERE id::text LIKE 'auth_seed_%';
DELETE FROM meetings             WHERE id::text LIKE 'meet_seed_%';
DELETE FROM knowledge            WHERE id::text LIKE 'kb_seed_%' OR id::text LIKE 'kb_strategic_%';
DELETE FROM onboarding           WHERE id::text LIKE 'assign_demo_%';
DELETE FROM center_announcements WHERE id IN ('ann-spring-event','ann-weather-reminder');
DELETE FROM parent_conversations WHERE id LIKE 'conv-ophelia%' OR id LIKE 'conv-maria%' OR id LIKE 'conv-james%';
DELETE FROM lessons              WHERE title IN ('Rainbow Counting Adventure','Feelings Faces');
```

## 2. Placeholder-email markers (safe — real families never use these)

```sql
SELECT id, email FROM families WHERE email ~* '@demo\.com$|@family\.test$|@example\.com$';
-- (roster stubs use @roster.local and are REAL Crystal kids -- do NOT delete those)
-- After review:
DELETE FROM families WHERE email ~* '@demo\.com$|@family\.test$|@example\.com$';
DELETE FROM family_parents  WHERE email ~* '@demo\.com$|@family\.test$|@example\.com$';
```

## 3. Name-based markers (REVIEW ONLY — do not auto-delete; may overlap real staff)

```sql
SELECT * FROM employees WHERE (first_name,last_name) IN
 (('Maria','Lopez'),('Aaliyah','Johnson'),('Ben','Carter'),('Priya','Patel'),
  ('Sam','Nguyen'),('Grace','Kim'),('Dana','Reed'),('Ophelia','Zeogar'),
  ('Stephen','Zeogar'),('Maria','Santos'),('James','Robinson'),('Sarah','Kim'),
  ('David','Chen'),('Lisa','Johnson'));
SELECT * FROM family_children WHERE name IN
 ('Noah Brown','Ava Brown','Sofia Garcia');
```
Keep the real owner (Christina) and J's admin login. Delete name-based rows only
after you confirm each is demo, not a real staff member.

## Recommended order
1. (done) Ship the code fixes so nothing re-seeds — J2.
2. Run section 1 + 2 SELECTs on the target DB; eyeball the rows.
3. On your go, run the section 1 + 2 DELETEs.
4. Hand-review section 3, delete only confirmed-demo rows.
5. The real Crystal roster (@roster.local) and real Brooklyn Park data stay.
