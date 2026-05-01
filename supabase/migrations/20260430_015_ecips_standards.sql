-- Migration: 015_ecips_standards
-- Minnesota Early Childhood Indicators of Progress (ECIPS) tables.
--
-- Two tables:
--   ecips_indicators        — the framework tree (domain → component → indicator)
--   lesson_ecips_alignments — many-to-many between lessons and the indicators
--                              they intentionally hit (or that the AI generator
--                              identified during the alignment pass).
--
-- The indicator data is seeded from src/data/standards/mn-ecips.ts. Seeds use
-- ON CONFLICT (code) DO UPDATE so re-running picks up edits without duplicating.

CREATE TABLE IF NOT EXISTS public.ecips_indicators (
  code           text         PRIMARY KEY,
  domain_code    text         NOT NULL,
  domain_name    text         NOT NULL,
  component_num  int          NOT NULL,
  component_name text         NOT NULL,
  age_band       text         NOT NULL,
  description    text         NOT NULL,
  created_at     timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ecips_indicators_domain_idx
  ON public.ecips_indicators (domain_code, component_num);

CREATE INDEX IF NOT EXISTS ecips_indicators_age_band_idx
  ON public.ecips_indicators (age_band);

ALTER TABLE public.ecips_indicators ENABLE ROW LEVEL SECURITY;

-- Reference data: anyone can read.
DROP POLICY IF EXISTS "anon_read_ecips" ON public.ecips_indicators;
CREATE POLICY "anon_read_ecips"
  ON public.ecips_indicators
  FOR SELECT
  TO anon
  USING (true);

-- Lesson alignment table. lesson_id is text to match the existing
-- localStorage-id shape (lessons aren't yet in Supabase). When lessons move
-- to a real table we'll convert to a uuid FK in a follow-up migration.
CREATE TABLE IF NOT EXISTS public.lesson_ecips_alignments (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       text          NOT NULL,
  indicator_code  text          NOT NULL REFERENCES public.ecips_indicators(code) ON DELETE CASCADE,
  source          text          NOT NULL DEFAULT 'ai',  -- 'ai' | 'teacher'
  confidence      numeric(3,2)  NULL,                   -- 0.00 - 1.00 from AI
  created_at      timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, indicator_code)
);

CREATE INDEX IF NOT EXISTS lesson_ecips_lesson_idx
  ON public.lesson_ecips_alignments (lesson_id);

CREATE INDEX IF NOT EXISTS lesson_ecips_indicator_idx
  ON public.lesson_ecips_alignments (indicator_code);

ALTER TABLE public.lesson_ecips_alignments ENABLE ROW LEVEL SECURITY;

-- Same access pattern as the rest of the app: API routes use service role.
-- Anon read is allowed for in-app filters.
DROP POLICY IF EXISTS "anon_read_alignments" ON public.lesson_ecips_alignments;
CREATE POLICY "anon_read_alignments"
  ON public.lesson_ecips_alignments
  FOR SELECT
  TO anon
  USING (true);

-- ─── Seed data (mirrors src/data/standards/mn-ecips.ts) ──────────────────

INSERT INTO public.ecips_indicators (code, domain_code, domain_name, component_num, component_name, age_band, description)
VALUES
  -- Social and Emotional Development
  ('SED.1.yi.1','SED','Social and Emotional Development',1,'Self-Awareness','yi','Responds to own name and familiar faces.'),
  ('SED.1.oi.1','SED','Social and Emotional Development',1,'Self-Awareness','oi','Recognizes self in mirror or photo.'),
  ('SED.1.yt.1','SED','Social and Emotional Development',1,'Self-Awareness','yt','Uses own name to refer to self.'),
  ('SED.1.ot.1','SED','Social and Emotional Development',1,'Self-Awareness','ot','Identifies feelings in self with simple labels (happy, sad, mad).'),
  ('SED.1.yp.1','SED','Social and Emotional Development',1,'Self-Awareness','yp','Describes self by physical features, abilities, and preferences.'),
  ('SED.1.op.1','SED','Social and Emotional Development',1,'Self-Awareness','op','Identifies personal strengths and areas of growing competence.'),
  ('SED.2.yi.1','SED','Social and Emotional Development',2,'Self-Regulation','yi','Calms with caregiver support and predictable routines.'),
  ('SED.2.oi.1','SED','Social and Emotional Development',2,'Self-Regulation','oi','Begins to use comfort objects to self-soothe.'),
  ('SED.2.yt.1','SED','Social and Emotional Development',2,'Self-Regulation','yt','Manages transitions with caregiver support and predictable cues.'),
  ('SED.2.ot.1','SED','Social and Emotional Development',2,'Self-Regulation','ot','Begins to use words to express feelings instead of acting them out.'),
  ('SED.2.yp.1','SED','Social and Emotional Development',2,'Self-Regulation','yp','Uses simple strategies (deep breath, ask for help) to manage strong emotions.'),
  ('SED.2.op.1','SED','Social and Emotional Development',2,'Self-Regulation','op','Selects and applies regulation strategies independently in familiar situations.'),
  ('SED.3.yi.1','SED','Social and Emotional Development',3,'Relationships with Adults','yi','Forms secure attachment to consistent caregivers.'),
  ('SED.3.oi.1','SED','Social and Emotional Development',3,'Relationships with Adults','oi','Seeks caregiver for comfort and shared exploration.'),
  ('SED.3.yt.1','SED','Social and Emotional Development',3,'Relationships with Adults','yt','Uses caregiver as a base for exploration.'),
  ('SED.3.ot.1','SED','Social and Emotional Development',3,'Relationships with Adults','ot','Engages in back-and-forth conversation and play with familiar adults.'),
  ('SED.3.yp.1','SED','Social and Emotional Development',3,'Relationships with Adults','yp','Seeks help from teachers and trusts adults to support problem solving.'),
  ('SED.3.op.1','SED','Social and Emotional Development',3,'Relationships with Adults','op','Maintains positive relationships with multiple adults across contexts.'),
  ('SED.4.oi.1','SED','Social and Emotional Development',4,'Relationships with Peers','oi','Notices and shows interest in other children.'),
  ('SED.4.yt.1','SED','Social and Emotional Development',4,'Relationships with Peers','yt','Engages in parallel play near other children.'),
  ('SED.4.ot.1','SED','Social and Emotional Development',4,'Relationships with Peers','ot','Begins simple cooperative play with one other child.'),
  ('SED.4.yp.1','SED','Social and Emotional Development',4,'Relationships with Peers','yp','Takes turns and shares materials with adult support.'),
  ('SED.4.op.1','SED','Social and Emotional Development',4,'Relationships with Peers','op','Cooperates in small groups, negotiates roles, and resolves simple conflicts.'),

  -- Approaches to Learning
  ('APL.1.yi.1','APL','Approaches to Learning',1,'Curiosity and Initiative','yi','Tracks novel sights and sounds.'),
  ('APL.1.oi.1','APL','Approaches to Learning',1,'Curiosity and Initiative','oi','Reaches for and explores unfamiliar objects.'),
  ('APL.1.yt.1','APL','Approaches to Learning',1,'Curiosity and Initiative','yt','Initiates exploration of new materials and spaces.'),
  ('APL.1.ot.1','APL','Approaches to Learning',1,'Curiosity and Initiative','ot','Asks "what?" and "why?" about familiar events.'),
  ('APL.1.yp.1','APL','Approaches to Learning',1,'Curiosity and Initiative','yp','Chooses activities based on personal interest and pursues them.'),
  ('APL.1.op.1','APL','Approaches to Learning',1,'Curiosity and Initiative','op','Generates own questions and seeks resources to investigate.'),
  ('APL.2.oi.1','APL','Approaches to Learning',2,'Persistence and Attention','oi','Repeats actions to produce desired effects.'),
  ('APL.2.yt.1','APL','Approaches to Learning',2,'Persistence and Attention','yt','Returns to a task after brief interruption.'),
  ('APL.2.ot.1','APL','Approaches to Learning',2,'Persistence and Attention','ot','Stays with self-chosen activities for several minutes.'),
  ('APL.2.yp.1','APL','Approaches to Learning',2,'Persistence and Attention','yp','Tolerates frustration and tries multiple approaches to reach a goal.'),
  ('APL.2.op.1','APL','Approaches to Learning',2,'Persistence and Attention','op','Plans steps, monitors progress, and adjusts strategy when needed.'),
  ('APL.3.yt.1','APL','Approaches to Learning',3,'Problem Solving and Reasoning','yt','Uses trial and error to solve simple physical problems.'),
  ('APL.3.ot.1','APL','Approaches to Learning',3,'Problem Solving and Reasoning','ot','Asks for help when a problem is too hard to solve alone.'),
  ('APL.3.yp.1','APL','Approaches to Learning',3,'Problem Solving and Reasoning','yp','Compares two outcomes and explains a simple cause and effect.'),
  ('APL.3.op.1','APL','Approaches to Learning',3,'Problem Solving and Reasoning','op','Generates multiple solutions and predicts likely outcomes.'),

  -- Language, Literacy, and Communications
  ('LLC.1.yi.1','LLC','Language, Literacy, and Communications',1,'Listening and Understanding','yi','Turns toward familiar voices.'),
  ('LLC.1.oi.1','LLC','Language, Literacy, and Communications',1,'Listening and Understanding','oi','Responds to simple words and gestures.'),
  ('LLC.1.yt.1','LLC','Language, Literacy, and Communications',1,'Listening and Understanding','yt','Follows simple one-step directions in routine contexts.'),
  ('LLC.1.ot.1','LLC','Language, Literacy, and Communications',1,'Listening and Understanding','ot','Follows two-step related directions.'),
  ('LLC.1.yp.1','LLC','Language, Literacy, and Communications',1,'Listening and Understanding','yp','Follows multi-step directions and answers simple questions about a story.'),
  ('LLC.1.op.1','LLC','Language, Literacy, and Communications',1,'Listening and Understanding','op','Recalls key story details and makes inferences with prompts.'),
  ('LLC.2.yi.1','LLC','Language, Literacy, and Communications',2,'Speaking and Communicating','yi','Coos and babbles to engage caregivers.'),
  ('LLC.2.oi.1','LLC','Language, Literacy, and Communications',2,'Speaking and Communicating','oi','Uses gestures and a few words to express needs.'),
  ('LLC.2.yt.1','LLC','Language, Literacy, and Communications',2,'Speaking and Communicating','yt','Combines two words to make simple statements.'),
  ('LLC.2.ot.1','LLC','Language, Literacy, and Communications',2,'Speaking and Communicating','ot','Uses three- to four-word sentences to share ideas.'),
  ('LLC.2.yp.1','LLC','Language, Literacy, and Communications',2,'Speaking and Communicating','yp','Holds a back-and-forth conversation on a familiar topic.'),
  ('LLC.2.op.1','LLC','Language, Literacy, and Communications',2,'Speaking and Communicating','op','Tells a story with a beginning, middle, and end.'),
  ('LLC.3.yp.1','LLC','Language, Literacy, and Communications',3,'Phonological Awareness','yp','Recognizes rhyming words in familiar songs.'),
  ('LLC.3.yp.2','LLC','Language, Literacy, and Communications',3,'Phonological Awareness','yp','Claps syllables in own name and short words.'),
  ('LLC.3.op.1','LLC','Language, Literacy, and Communications',3,'Phonological Awareness','op','Identifies the beginning sound of familiar words.'),
  ('LLC.3.op.2','LLC','Language, Literacy, and Communications',3,'Phonological Awareness','op','Generates rhymes and substitutes initial sounds in simple words.'),
  ('LLC.4.yp.1','LLC','Language, Literacy, and Communications',4,'Print and Alphabet Knowledge','yp','Recognizes own name in print.'),
  ('LLC.4.yp.2','LLC','Language, Literacy, and Communications',4,'Print and Alphabet Knowledge','yp','Holds books right-side up and turns pages.'),
  ('LLC.4.op.1','LLC','Language, Literacy, and Communications',4,'Print and Alphabet Knowledge','op','Names most upper- and lowercase letters.'),
  ('LLC.4.op.2','LLC','Language, Literacy, and Communications',4,'Print and Alphabet Knowledge','op','Connects some letters to the sounds they make.'),
  ('LLC.5.ot.1','LLC','Language, Literacy, and Communications',5,'Emergent Writing','ot','Makes scribbles and marks with intention.'),
  ('LLC.5.yp.1','LLC','Language, Literacy, and Communications',5,'Emergent Writing','yp','Draws pictures to represent ideas and dictates a caption.'),
  ('LLC.5.op.1','LLC','Language, Literacy, and Communications',5,'Emergent Writing','op','Writes own name and a few familiar words using letter approximations.'),

  -- The Arts
  ('ART.1.yi.1','ART','The Arts',1,'Music and Movement','yi','Calms or brightens in response to music and rhythm.'),
  ('ART.1.yt.1','ART','The Arts',1,'Music and Movement','yt','Moves body to a beat with adult modeling.'),
  ('ART.1.yp.1','ART','The Arts',1,'Music and Movement','yp','Sings familiar songs and explores instruments.'),
  ('ART.1.op.1','ART','The Arts',1,'Music and Movement','op','Creates simple musical patterns and responds to changes in tempo or volume.'),
  ('ART.2.ot.1','ART','The Arts',2,'Visual Arts','ot','Explores art materials with sensory focus.'),
  ('ART.2.yp.1','ART','The Arts',2,'Visual Arts','yp','Uses art materials to create representations of people, places, or events.'),
  ('ART.2.op.1','ART','The Arts',2,'Visual Arts','op','Selects materials with intention and describes own creative choices.'),
  ('ART.3.yt.1','ART','The Arts',3,'Dramatic Play','yt','Imitates familiar actions with toys and props.'),
  ('ART.3.yp.1','ART','The Arts',3,'Dramatic Play','yp','Acts out familiar roles in pretend play.'),
  ('ART.3.op.1','ART','The Arts',3,'Dramatic Play','op','Sustains cooperative dramatic play with assigned roles and a simple story.'),

  -- Mathematics
  ('MTH.1.ot.1','MTH','Mathematics',1,'Number Sense and Counting','ot','Recites some number words in sequence.'),
  ('MTH.1.yp.1','MTH','Mathematics',1,'Number Sense and Counting','yp','Counts up to 10 objects with one-to-one correspondence.'),
  ('MTH.1.op.1','MTH','Mathematics',1,'Number Sense and Counting','op','Counts to 20, recognizes written numerals to 10, and understands that the last number names the total.'),
  ('MTH.2.yp.1','MTH','Mathematics',2,'Patterns and Sorting','yp','Sorts objects by one attribute (color, size, shape).'),
  ('MTH.2.op.1','MTH','Mathematics',2,'Patterns and Sorting','op','Identifies, copies, and extends simple AB and ABC patterns.'),
  ('MTH.3.yp.1','MTH','Mathematics',3,'Geometry and Spatial Sense','yp','Names common shapes (circle, square, triangle).'),
  ('MTH.3.op.1','MTH','Mathematics',3,'Geometry and Spatial Sense','op','Uses positional language (above, below, beside) to describe location.'),
  ('MTH.4.yp.1','MTH','Mathematics',4,'Measurement','yp','Compares objects by size (bigger, smaller, longer, shorter).'),
  ('MTH.4.op.1','MTH','Mathematics',4,'Measurement','op','Uses non-standard units (blocks, hands) to measure length or capacity.'),

  -- Scientific Thinking
  ('SCI.1.ot.1','SCI','Scientific Thinking',1,'Observation and Inquiry','ot','Notices and points out changes in the immediate environment.'),
  ('SCI.1.yp.1','SCI','Scientific Thinking',1,'Observation and Inquiry','yp','Uses senses to gather information and describe properties of objects.'),
  ('SCI.1.op.1','SCI','Scientific Thinking',1,'Observation and Inquiry','op','Forms predictions and tests them through simple experiments.'),
  ('SCI.2.yp.1','SCI','Scientific Thinking',2,'Living Things','yp','Identifies basic needs of plants and animals.'),
  ('SCI.2.op.1','SCI','Scientific Thinking',2,'Living Things','op','Describes life cycles and habitats of familiar organisms.'),
  ('SCI.3.yp.1','SCI','Scientific Thinking',3,'Earth and Sky','yp','Notices weather and seasonal changes.'),
  ('SCI.3.op.1','SCI','Scientific Thinking',3,'Earth and Sky','op','Describes properties of natural materials (water, soil, rocks).'),

  -- Social Systems Understanding
  ('SOC.1.yp.1','SOC','Social Systems Understanding',1,'Family and Community','yp','Talks about own family members and their roles.'),
  ('SOC.1.op.1','SOC','Social Systems Understanding',1,'Family and Community','op','Describes familiar community helpers and the work they do.'),
  ('SOC.2.yp.1','SOC','Social Systems Understanding',2,'Culture and Diversity','yp','Notices similarities and differences in people, foods, and traditions.'),
  ('SOC.2.op.1','SOC','Social Systems Understanding',2,'Culture and Diversity','op','Shows respect and curiosity for the cultures and languages of peers.'),

  -- Physical and Movement Development
  ('PMD.1.yi.1','PMD','Physical and Movement Development',1,'Gross Motor','yi','Lifts head and pushes up during tummy time.'),
  ('PMD.1.oi.1','PMD','Physical and Movement Development',1,'Gross Motor','oi','Crawls, pulls to stand, and cruises along furniture.'),
  ('PMD.1.yt.1','PMD','Physical and Movement Development',1,'Gross Motor','yt','Walks steadily and climbs low structures.'),
  ('PMD.1.ot.1','PMD','Physical and Movement Development',1,'Gross Motor','ot','Runs, jumps in place, and kicks a stationary ball.'),
  ('PMD.1.yp.1','PMD','Physical and Movement Development',1,'Gross Motor','yp','Hops, balances on one foot briefly, and catches a large ball.'),
  ('PMD.1.op.1','PMD','Physical and Movement Development',1,'Gross Motor','op','Skips, gallops, and coordinates body movements in games and sports.'),
  ('PMD.2.oi.1','PMD','Physical and Movement Development',2,'Fine Motor','oi','Uses pincer grasp to pick up small objects.'),
  ('PMD.2.yt.1','PMD','Physical and Movement Development',2,'Fine Motor','yt','Stacks 2-3 blocks and turns pages of board books.'),
  ('PMD.2.yp.1','PMD','Physical and Movement Development',2,'Fine Motor','yp','Uses crayons, scissors, and simple tools with control.'),
  ('PMD.2.op.1','PMD','Physical and Movement Development',2,'Fine Motor','op','Cuts along a line, copies simple shapes, and writes recognizable letters.'),
  ('PMD.3.ot.1','PMD','Physical and Movement Development',3,'Health and Self-Care','ot','Participates in handwashing and dressing routines with support.'),
  ('PMD.3.yp.1','PMD','Physical and Movement Development',3,'Health and Self-Care','yp','Manages toileting, washes hands, and feeds self independently.'),
  ('PMD.3.op.1','PMD','Physical and Movement Development',3,'Health and Self-Care','op','Identifies healthy food choices and explains why hygiene matters.')

ON CONFLICT (code) DO UPDATE
  SET domain_code    = EXCLUDED.domain_code,
      domain_name    = EXCLUDED.domain_name,
      component_num  = EXCLUDED.component_num,
      component_name = EXCLUDED.component_name,
      age_band       = EXCLUDED.age_band,
      description    = EXCLUDED.description;
