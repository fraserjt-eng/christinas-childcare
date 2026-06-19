-- Migration 035: knowledge base module → Supabase table
-- Backs the knowledge-storage dual-write module. One table holds the module's
-- three record kinds (entries, versions, reads) discriminated by `record_type`,
-- each row's fields in a JSONB `data` column (matches the migration-031 supplies
-- fast-migration shape). Schema can be normalized later.
--
-- SAFETY: additive only. CREATE TABLE IF NOT EXISTS + permissive RLS policies
-- consistent with the existing dual-write tables (anon client writes). No DROP,
-- no DELETE, no row mutation. Idempotent.

CREATE TABLE IF NOT EXISTS public.knowledge (
  id text PRIMARY KEY,
  center_id uuid REFERENCES public.centers(id),
  record_type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_record_type
  ON public.knowledge(record_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_center
  ON public.knowledge(center_id);

-- Enable RLS
ALTER TABLE public.knowledge ENABLE ROW LEVEL SECURITY;

-- Permissive policies consistent with the existing dual-write pattern
-- (the dual-write uses the anon client)
CREATE POLICY "Allow all for authenticated" ON public.knowledge
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.knowledge
  FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.knowledge IS 'Knowledge base module: entries, versions, and reads (record_type discriminator), data in JSONB';
