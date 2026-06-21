#!/usr/bin/env python3
# Make the prod cutover bundle re-runnable and fail-safe (gate Blocker A + B).
#   1. DROP POLICY IF EXISTS before every CREATE POLICY (Postgres has no
#      CREATE POLICY IF NOT EXISTS, so a re-run otherwise aborts with 42710).
#   2. Replace the hardcoded-UUID Brooklyn Park backfill with a DO block that
#      aborts the WHOLE bundle if that center id is not present in prod, so no
#      real BP row is ever stamped with a phantom center it cannot resolve.
#   3. Wrap the bundle in BEGIN; ... COMMIT; so a partway failure rolls back
#      clean (verified: no transaction-incompatible DDL in the file).
# Changes zero rows. Idempotent to run on the file itself.

import re, sys

PATH = "docs/cutover/030-043-prod-bundle.sql"
src = open(PATH).read()

if src.lstrip().startswith("BEGIN;"):
    print("already transformed; nothing to do")
    sys.exit(0)

# 1. Fail-safe BP backfill -------------------------------------------------
backfill_re = re.compile(
    r"UPDATE public\.family_children\s+SET center_id = '3104ae69[^\n]*\n"
    r"UPDATE public\.families\s+SET center_id = '3104ae69[^\n]*\n"
    r"UPDATE public\.child_daily_entries\s+SET center_id = '3104ae69[^\n]*"
)
do_block = (
    "DO $$\n"
    "BEGIN\n"
    "  -- Fail SAFE: if prod's Brooklyn Park center is not this canonical id (the\n"
    "  -- app's OPERATING_CENTER_ID), abort the WHOLE bundle BEFORE backfilling so\n"
    "  -- no real Brooklyn Park row is stamped with a phantom center it cannot\n"
    "  -- resolve. The transaction wrapper rolls everything back on this abort.\n"
    "  IF NOT EXISTS (SELECT 1 FROM public.centers WHERE id = '3104ae69-4f26-4c1e-a767-3ff45b534860') THEN\n"
    "    RAISE EXCEPTION 'STOP: Brooklyn Park center 3104ae69-4f26-4c1e-a767-3ff45b534860 not found in public.centers. Run: SELECT id, name FROM public.centers; If prod BP has a different id, re-point this bundle AND src/lib/current-center.ts before applying. Nothing was changed.';\n"
    "  END IF;\n"
    "  UPDATE public.family_children     SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;\n"
    "  UPDATE public.families            SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;\n"
    "  UPDATE public.child_daily_entries SET center_id = '3104ae69-4f26-4c1e-a767-3ff45b534860' WHERE center_id IS NULL;\n"
    "END $$;"
)
src, n = backfill_re.subn(do_block, src)
assert n == 1, f"backfill block matched {n} times (expected 1)"

# 2. DROP POLICY IF EXISTS before each CREATE POLICY -----------------------
cre = re.compile(r'^\s*CREATE POLICY "(.+?)" ON public\.(\w+)')
out, added = [], 0
for line in src.split("\n"):
    m = cre.match(line)
    if m:
        drop = f'DROP POLICY IF EXISTS "{m.group(1)}" ON public.{m.group(2)};'
        if not (out and out[-1].strip() == drop):
            out.append(drop)
            added += 1
    out.append(line)
src = "\n".join(out)

# 3. Transaction wrapper ---------------------------------------------------
header = (
    "-- TRANSACTIONAL + RE-RUNNABLE bundle (fixed per cutover gate, 2026-06-21).\n"
    "-- Wrapped in BEGIN/COMMIT: a partway failure rolls back clean. Every policy\n"
    "-- is DROP-guarded so a re-run cannot abort on 'policy already exists'. The BP\n"
    "-- backfill aborts safely if the canonical center id is missing on prod.\n\n"
    "BEGIN;\n\n"
)
src = header + src.rstrip() + "\n\nCOMMIT;\n"

open(PATH, "w").write(src)
print(f"OK: added {added} DROP POLICY guards, fail-safe BP backfill, BEGIN/COMMIT wrapper")
