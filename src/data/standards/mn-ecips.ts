// Minnesota Early Childhood Indicators of Progress (ECIPS)
//
// Eight domains, components, and age-banded indicators. The framework is the
// state standard for early learning programs (birth through kindergarten
// entry) published by the Minnesota Department of Education.
//
// This file is the single source of truth for the indicator tree the lesson
// builder aligns against and the curriculum page filters by. The migration
// `015_ecips_standards.sql` seeds the `ecips_indicators` table from this
// data so the database matches.
//
// Indicator codes follow the convention DOMAIN.COMPONENT.AGE.SEQ
//   - DOMAIN: 2-3 letter domain code
//   - COMPONENT: numeric within domain
//   - AGE: age band code (yi/oi/yt/ot/yp/op = young infant ... older preschool)
//   - SEQ: sequential within (component, age band)
//
// To extend: add new indicators to the appropriate domain.components array
// and re-run the seed migration. The shape is stable.

import type { AgeGroup } from '@/types/curriculum';

export const ECIPS_AGE_BANDS = [
  { code: 'yi', label: 'Young Infant',     range: '6 weeks - 8 months',  ageGroup: 'infant'     as AgeGroup },
  { code: 'oi', label: 'Older Infant',     range: '8 - 16 months',       ageGroup: 'infant'     as AgeGroup },
  { code: 'yt', label: 'Young Toddler',    range: '16 - 24 months',      ageGroup: 'toddler'    as AgeGroup },
  { code: 'ot', label: 'Older Toddler',    range: '24 - 33 months',      ageGroup: 'toddler'    as AgeGroup },
  { code: 'yp', label: 'Young Preschool',  range: '33 months - 4 years', ageGroup: 'preschool'  as AgeGroup },
  { code: 'op', label: 'Older Preschool',  range: '4 - 5 years',         ageGroup: 'preschool'  as AgeGroup },
] as const;

export type EcipsAgeBandCode = typeof ECIPS_AGE_BANDS[number]['code'];

export interface EcipsIndicator {
  code: string;             // e.g. "SED.1.yp.1"
  ageBand: EcipsAgeBandCode;
  description: string;
}

export interface EcipsComponent {
  number: number;
  name: string;
  indicators: EcipsIndicator[];
}

export interface EcipsDomain {
  code: string;             // e.g. "SED"
  name: string;
  shortName: string;
  description: string;
  // Map back to the curriculum's existing learning-domain taxonomy so a teacher
  // filtering by "social-emotional" sees ECIPS SED indicators surfaced.
  curriculumDomains: import('@/types/curriculum').LearningDomain[];
  components: EcipsComponent[];
}

// ─── The framework ─────────────────────────────────────────────────────────

export const MN_ECIPS: EcipsDomain[] = [
  {
    code: 'SED',
    name: 'Social and Emotional Development',
    shortName: 'Social-Emotional',
    description:
      'Self-awareness, self-regulation, relationships with adults and peers, and understanding of social roles.',
    curriculumDomains: ['social-emotional'],
    components: [
      {
        number: 1,
        name: 'Self-Awareness',
        indicators: [
          { code: 'SED.1.yi.1', ageBand: 'yi', description: 'Responds to own name and familiar faces.' },
          { code: 'SED.1.oi.1', ageBand: 'oi', description: 'Recognizes self in mirror or photo.' },
          { code: 'SED.1.yt.1', ageBand: 'yt', description: 'Uses own name to refer to self.' },
          { code: 'SED.1.ot.1', ageBand: 'ot', description: 'Identifies feelings in self with simple labels (happy, sad, mad).' },
          { code: 'SED.1.yp.1', ageBand: 'yp', description: 'Describes self by physical features, abilities, and preferences.' },
          { code: 'SED.1.op.1', ageBand: 'op', description: 'Identifies personal strengths and areas of growing competence.' },
        ],
      },
      {
        number: 2,
        name: 'Self-Regulation',
        indicators: [
          { code: 'SED.2.yi.1', ageBand: 'yi', description: 'Calms with caregiver support and predictable routines.' },
          { code: 'SED.2.oi.1', ageBand: 'oi', description: 'Begins to use comfort objects to self-soothe.' },
          { code: 'SED.2.yt.1', ageBand: 'yt', description: 'Manages transitions with caregiver support and predictable cues.' },
          { code: 'SED.2.ot.1', ageBand: 'ot', description: 'Begins to use words to express feelings instead of acting them out.' },
          { code: 'SED.2.yp.1', ageBand: 'yp', description: 'Uses simple strategies (deep breath, ask for help) to manage strong emotions.' },
          { code: 'SED.2.op.1', ageBand: 'op', description: 'Selects and applies regulation strategies independently in familiar situations.' },
        ],
      },
      {
        number: 3,
        name: 'Relationships with Adults',
        indicators: [
          { code: 'SED.3.yi.1', ageBand: 'yi', description: 'Forms secure attachment to consistent caregivers.' },
          { code: 'SED.3.oi.1', ageBand: 'oi', description: 'Seeks caregiver for comfort and shared exploration.' },
          { code: 'SED.3.yt.1', ageBand: 'yt', description: 'Uses caregiver as a base for exploration.' },
          { code: 'SED.3.ot.1', ageBand: 'ot', description: 'Engages in back-and-forth conversation and play with familiar adults.' },
          { code: 'SED.3.yp.1', ageBand: 'yp', description: 'Seeks help from teachers and trusts adults to support problem solving.' },
          { code: 'SED.3.op.1', ageBand: 'op', description: 'Maintains positive relationships with multiple adults across contexts.' },
        ],
      },
      {
        number: 4,
        name: 'Relationships with Peers',
        indicators: [
          { code: 'SED.4.oi.1', ageBand: 'oi', description: 'Notices and shows interest in other children.' },
          { code: 'SED.4.yt.1', ageBand: 'yt', description: 'Engages in parallel play near other children.' },
          { code: 'SED.4.ot.1', ageBand: 'ot', description: 'Begins simple cooperative play with one other child.' },
          { code: 'SED.4.yp.1', ageBand: 'yp', description: 'Takes turns and shares materials with adult support.' },
          { code: 'SED.4.op.1', ageBand: 'op', description: 'Cooperates in small groups, negotiates roles, and resolves simple conflicts.' },
        ],
      },
    ],
  },
  {
    code: 'APL',
    name: 'Approaches to Learning',
    shortName: 'Approaches to Learning',
    description:
      'Curiosity, persistence, problem solving, and engagement that shape how children encounter new experiences.',
    curriculumDomains: ['cognitive'],
    components: [
      {
        number: 1,
        name: 'Curiosity and Initiative',
        indicators: [
          { code: 'APL.1.yi.1', ageBand: 'yi', description: 'Tracks novel sights and sounds.' },
          { code: 'APL.1.oi.1', ageBand: 'oi', description: 'Reaches for and explores unfamiliar objects.' },
          { code: 'APL.1.yt.1', ageBand: 'yt', description: 'Initiates exploration of new materials and spaces.' },
          { code: 'APL.1.ot.1', ageBand: 'ot', description: 'Asks "what?" and "why?" about familiar events.' },
          { code: 'APL.1.yp.1', ageBand: 'yp', description: 'Chooses activities based on personal interest and pursues them.' },
          { code: 'APL.1.op.1', ageBand: 'op', description: 'Generates own questions and seeks resources to investigate.' },
        ],
      },
      {
        number: 2,
        name: 'Persistence and Attention',
        indicators: [
          { code: 'APL.2.oi.1', ageBand: 'oi', description: 'Repeats actions to produce desired effects.' },
          { code: 'APL.2.yt.1', ageBand: 'yt', description: 'Returns to a task after brief interruption.' },
          { code: 'APL.2.ot.1', ageBand: 'ot', description: 'Stays with self-chosen activities for several minutes.' },
          { code: 'APL.2.yp.1', ageBand: 'yp', description: 'Tolerates frustration and tries multiple approaches to reach a goal.' },
          { code: 'APL.2.op.1', ageBand: 'op', description: 'Plans steps, monitors progress, and adjusts strategy when needed.' },
        ],
      },
      {
        number: 3,
        name: 'Problem Solving and Reasoning',
        indicators: [
          { code: 'APL.3.yt.1', ageBand: 'yt', description: 'Uses trial and error to solve simple physical problems.' },
          { code: 'APL.3.ot.1', ageBand: 'ot', description: 'Asks for help when a problem is too hard to solve alone.' },
          { code: 'APL.3.yp.1', ageBand: 'yp', description: 'Compares two outcomes and explains a simple cause and effect.' },
          { code: 'APL.3.op.1', ageBand: 'op', description: 'Generates multiple solutions and predicts likely outcomes.' },
        ],
      },
    ],
  },
  {
    code: 'LLC',
    name: 'Language, Literacy, and Communications',
    shortName: 'Language and Literacy',
    description:
      'Listening, speaking, vocabulary, comprehension, phonological awareness, alphabet knowledge, and emergent writing.',
    curriculumDomains: ['language', 'literacy'],
    components: [
      {
        number: 1,
        name: 'Listening and Understanding',
        indicators: [
          { code: 'LLC.1.yi.1', ageBand: 'yi', description: 'Turns toward familiar voices.' },
          { code: 'LLC.1.oi.1', ageBand: 'oi', description: 'Responds to simple words and gestures.' },
          { code: 'LLC.1.yt.1', ageBand: 'yt', description: 'Follows simple one-step directions in routine contexts.' },
          { code: 'LLC.1.ot.1', ageBand: 'ot', description: 'Follows two-step related directions.' },
          { code: 'LLC.1.yp.1', ageBand: 'yp', description: 'Follows multi-step directions and answers simple questions about a story.' },
          { code: 'LLC.1.op.1', ageBand: 'op', description: 'Recalls key story details and makes inferences with prompts.' },
        ],
      },
      {
        number: 2,
        name: 'Speaking and Communicating',
        indicators: [
          { code: 'LLC.2.yi.1', ageBand: 'yi', description: 'Coos and babbles to engage caregivers.' },
          { code: 'LLC.2.oi.1', ageBand: 'oi', description: 'Uses gestures and a few words to express needs.' },
          { code: 'LLC.2.yt.1', ageBand: 'yt', description: 'Combines two words to make simple statements.' },
          { code: 'LLC.2.ot.1', ageBand: 'ot', description: 'Uses three- to four-word sentences to share ideas.' },
          { code: 'LLC.2.yp.1', ageBand: 'yp', description: 'Holds a back-and-forth conversation on a familiar topic.' },
          { code: 'LLC.2.op.1', ageBand: 'op', description: 'Tells a story with a beginning, middle, and end.' },
        ],
      },
      {
        number: 3,
        name: 'Phonological Awareness',
        indicators: [
          { code: 'LLC.3.yp.1', ageBand: 'yp', description: 'Recognizes rhyming words in familiar songs.' },
          { code: 'LLC.3.yp.2', ageBand: 'yp', description: 'Claps syllables in own name and short words.' },
          { code: 'LLC.3.op.1', ageBand: 'op', description: 'Identifies the beginning sound of familiar words.' },
          { code: 'LLC.3.op.2', ageBand: 'op', description: 'Generates rhymes and substitutes initial sounds in simple words.' },
        ],
      },
      {
        number: 4,
        name: 'Print and Alphabet Knowledge',
        indicators: [
          { code: 'LLC.4.yp.1', ageBand: 'yp', description: 'Recognizes own name in print.' },
          { code: 'LLC.4.yp.2', ageBand: 'yp', description: 'Holds books right-side up and turns pages.' },
          { code: 'LLC.4.op.1', ageBand: 'op', description: 'Names most upper- and lowercase letters.' },
          { code: 'LLC.4.op.2', ageBand: 'op', description: 'Connects some letters to the sounds they make.' },
        ],
      },
      {
        number: 5,
        name: 'Emergent Writing',
        indicators: [
          { code: 'LLC.5.ot.1', ageBand: 'ot', description: 'Makes scribbles and marks with intention.' },
          { code: 'LLC.5.yp.1', ageBand: 'yp', description: 'Draws pictures to represent ideas and dictates a caption.' },
          { code: 'LLC.5.op.1', ageBand: 'op', description: 'Writes own name and a few familiar words using letter approximations.' },
        ],
      },
    ],
  },
  {
    code: 'ART',
    name: 'The Arts',
    shortName: 'Creative Arts',
    description:
      'Music, dance, visual arts, and dramatic play as ways of expressing ideas and exploring culture.',
    curriculumDomains: ['creative'],
    components: [
      {
        number: 1,
        name: 'Music and Movement',
        indicators: [
          { code: 'ART.1.yi.1', ageBand: 'yi', description: 'Calms or brightens in response to music and rhythm.' },
          { code: 'ART.1.yt.1', ageBand: 'yt', description: 'Moves body to a beat with adult modeling.' },
          { code: 'ART.1.yp.1', ageBand: 'yp', description: 'Sings familiar songs and explores instruments.' },
          { code: 'ART.1.op.1', ageBand: 'op', description: 'Creates simple musical patterns and responds to changes in tempo or volume.' },
        ],
      },
      {
        number: 2,
        name: 'Visual Arts',
        indicators: [
          { code: 'ART.2.ot.1', ageBand: 'ot', description: 'Explores art materials with sensory focus.' },
          { code: 'ART.2.yp.1', ageBand: 'yp', description: 'Uses art materials to create representations of people, places, or events.' },
          { code: 'ART.2.op.1', ageBand: 'op', description: 'Selects materials with intention and describes own creative choices.' },
        ],
      },
      {
        number: 3,
        name: 'Dramatic Play',
        indicators: [
          { code: 'ART.3.yt.1', ageBand: 'yt', description: 'Imitates familiar actions with toys and props.' },
          { code: 'ART.3.yp.1', ageBand: 'yp', description: 'Acts out familiar roles in pretend play.' },
          { code: 'ART.3.op.1', ageBand: 'op', description: 'Sustains cooperative dramatic play with assigned roles and a simple story.' },
        ],
      },
    ],
  },
  {
    code: 'MTH',
    name: 'Mathematics',
    shortName: 'Mathematics',
    description:
      'Number sense, patterns, measurement, geometry, and data analysis appropriate to early childhood.',
    curriculumDomains: ['math', 'cognitive'],
    components: [
      {
        number: 1,
        name: 'Number Sense and Counting',
        indicators: [
          { code: 'MTH.1.ot.1', ageBand: 'ot', description: 'Recites some number words in sequence.' },
          { code: 'MTH.1.yp.1', ageBand: 'yp', description: 'Counts up to 10 objects with one-to-one correspondence.' },
          { code: 'MTH.1.op.1', ageBand: 'op', description: 'Counts to 20, recognizes written numerals to 10, and understands that the last number names the total.' },
        ],
      },
      {
        number: 2,
        name: 'Patterns and Sorting',
        indicators: [
          { code: 'MTH.2.yp.1', ageBand: 'yp', description: 'Sorts objects by one attribute (color, size, shape).' },
          { code: 'MTH.2.op.1', ageBand: 'op', description: 'Identifies, copies, and extends simple AB and ABC patterns.' },
        ],
      },
      {
        number: 3,
        name: 'Geometry and Spatial Sense',
        indicators: [
          { code: 'MTH.3.yp.1', ageBand: 'yp', description: 'Names common shapes (circle, square, triangle).' },
          { code: 'MTH.3.op.1', ageBand: 'op', description: 'Uses positional language (above, below, beside) to describe location.' },
        ],
      },
      {
        number: 4,
        name: 'Measurement',
        indicators: [
          { code: 'MTH.4.yp.1', ageBand: 'yp', description: 'Compares objects by size (bigger, smaller, longer, shorter).' },
          { code: 'MTH.4.op.1', ageBand: 'op', description: 'Uses non-standard units (blocks, hands) to measure length or capacity.' },
        ],
      },
    ],
  },
  {
    code: 'SCI',
    name: 'Scientific Thinking',
    shortName: 'Science and Discovery',
    description:
      'Observing, predicting, experimenting, and reasoning about the natural and physical world.',
    curriculumDomains: ['science', 'cognitive'],
    components: [
      {
        number: 1,
        name: 'Observation and Inquiry',
        indicators: [
          { code: 'SCI.1.ot.1', ageBand: 'ot', description: 'Notices and points out changes in the immediate environment.' },
          { code: 'SCI.1.yp.1', ageBand: 'yp', description: 'Uses senses to gather information and describe properties of objects.' },
          { code: 'SCI.1.op.1', ageBand: 'op', description: 'Forms predictions and tests them through simple experiments.' },
        ],
      },
      {
        number: 2,
        name: 'Living Things',
        indicators: [
          { code: 'SCI.2.yp.1', ageBand: 'yp', description: 'Identifies basic needs of plants and animals.' },
          { code: 'SCI.2.op.1', ageBand: 'op', description: 'Describes life cycles and habitats of familiar organisms.' },
        ],
      },
      {
        number: 3,
        name: 'Earth and Sky',
        indicators: [
          { code: 'SCI.3.yp.1', ageBand: 'yp', description: 'Notices weather and seasonal changes.' },
          { code: 'SCI.3.op.1', ageBand: 'op', description: 'Describes properties of natural materials (water, soil, rocks).' },
        ],
      },
    ],
  },
  {
    code: 'SOC',
    name: 'Social Systems Understanding',
    shortName: 'Social Systems',
    description:
      'Family, community, culture, geography, and civic understanding at developmentally appropriate scales.',
    curriculumDomains: ['social-emotional', 'cognitive'],
    components: [
      {
        number: 1,
        name: 'Family and Community',
        indicators: [
          { code: 'SOC.1.yp.1', ageBand: 'yp', description: 'Talks about own family members and their roles.' },
          { code: 'SOC.1.op.1', ageBand: 'op', description: 'Describes familiar community helpers and the work they do.' },
        ],
      },
      {
        number: 2,
        name: 'Culture and Diversity',
        indicators: [
          { code: 'SOC.2.yp.1', ageBand: 'yp', description: 'Notices similarities and differences in people, foods, and traditions.' },
          { code: 'SOC.2.op.1', ageBand: 'op', description: 'Shows respect and curiosity for the cultures and languages of peers.' },
        ],
      },
    ],
  },
  {
    code: 'PMD',
    name: 'Physical and Movement Development',
    shortName: 'Physical Development',
    description:
      'Gross motor, fine motor, healthy practices, and body awareness.',
    curriculumDomains: ['physical'],
    components: [
      {
        number: 1,
        name: 'Gross Motor',
        indicators: [
          { code: 'PMD.1.yi.1', ageBand: 'yi', description: 'Lifts head and pushes up during tummy time.' },
          { code: 'PMD.1.oi.1', ageBand: 'oi', description: 'Crawls, pulls to stand, and cruises along furniture.' },
          { code: 'PMD.1.yt.1', ageBand: 'yt', description: 'Walks steadily and climbs low structures.' },
          { code: 'PMD.1.ot.1', ageBand: 'ot', description: 'Runs, jumps in place, and kicks a stationary ball.' },
          { code: 'PMD.1.yp.1', ageBand: 'yp', description: 'Hops, balances on one foot briefly, and catches a large ball.' },
          { code: 'PMD.1.op.1', ageBand: 'op', description: 'Skips, gallops, and coordinates body movements in games and sports.' },
        ],
      },
      {
        number: 2,
        name: 'Fine Motor',
        indicators: [
          { code: 'PMD.2.oi.1', ageBand: 'oi', description: 'Uses pincer grasp to pick up small objects.' },
          { code: 'PMD.2.yt.1', ageBand: 'yt', description: 'Stacks 2-3 blocks and turns pages of board books.' },
          { code: 'PMD.2.yp.1', ageBand: 'yp', description: 'Uses crayons, scissors, and simple tools with control.' },
          { code: 'PMD.2.op.1', ageBand: 'op', description: 'Cuts along a line, copies simple shapes, and writes recognizable letters.' },
        ],
      },
      {
        number: 3,
        name: 'Health and Self-Care',
        indicators: [
          { code: 'PMD.3.ot.1', ageBand: 'ot', description: 'Participates in handwashing and dressing routines with support.' },
          { code: 'PMD.3.yp.1', ageBand: 'yp', description: 'Manages toileting, washes hands, and feeds self independently.' },
          { code: 'PMD.3.op.1', ageBand: 'op', description: 'Identifies healthy food choices and explains why hygiene matters.' },
        ],
      },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getAllIndicators(): EcipsIndicator[] {
  const out: EcipsIndicator[] = [];
  for (const domain of MN_ECIPS) {
    for (const comp of domain.components) {
      out.push(...comp.indicators);
    }
  }
  return out;
}

export function getIndicatorByCode(code: string): EcipsIndicator | undefined {
  for (const domain of MN_ECIPS) {
    for (const comp of domain.components) {
      const found = comp.indicators.find((i) => i.code === code);
      if (found) return found;
    }
  }
  return undefined;
}

export function getIndicatorsForAgeGroup(ageGroup: AgeGroup): EcipsIndicator[] {
  const bands = ECIPS_AGE_BANDS.filter((b) => b.ageGroup === ageGroup).map((b) => b.code);
  return getAllIndicators().filter((i) => bands.includes(i.ageBand));
}

export function getIndicatorMeta(code: string): {
  indicator: EcipsIndicator;
  domain: EcipsDomain;
  component: EcipsComponent;
} | null {
  for (const domain of MN_ECIPS) {
    for (const comp of domain.components) {
      const ind = comp.indicators.find((i) => i.code === code);
      if (ind) return { indicator: ind, domain, component: comp };
    }
  }
  return null;
}

export function getDomainsForCurriculumDomain(
  curriculumDomain: import('@/types/curriculum').LearningDomain
): EcipsDomain[] {
  return MN_ECIPS.filter((d) => d.curriculumDomains.includes(curriculumDomain));
}
