// Lesson Generator Module for Christina's Child Care Center
// Claude API integration for AI-powered lesson generation

import {
  Lesson,
  LessonSegmentItem,
  AgeGroup,
  LearningDomain,
  LESSON_SEGMENTS,
  SEGMENT_LABELS,
  AGE_GROUP_LABELS,
  DOMAIN_LABELS,
} from '@/types/curriculum';

// ============================================================================
// Types
// ============================================================================

export interface GenerateRequest {
  topic: string;
  ageGroup: AgeGroup;
  domain: LearningDomain;
  duration: number;
  additionalContext?: string;
}

export interface RemixRequest {
  baseLesson: Lesson;
  newAgeGroup: AgeGroup;
  newDuration?: number;
  newDomain?: LearningDomain;
  adaptationNotes?: string;
}

// ClaudeMessage type for future streaming support
// interface ClaudeMessage {
//   role: 'user' | 'assistant';
//   content: string;
// }

// ============================================================================
// Age-Appropriate Guidelines
// ============================================================================

const AGE_GUIDELINES: Record<AgeGroup, string> = {
  'infant': `
For infants (0-12 months):
- Activities should be sensory-focused (touch, sound, sight)
- Duration per activity: 2-5 minutes max
- Emphasize caregiver interaction and bonding
- Use simple, repetitive language
- Focus on tummy time, grasping, tracking objects
- Safety is paramount - no small parts
- Responsive caregiving during all activities`,

  'toddler': `
For toddlers (1-3 years):
- Activities should allow movement and exploration
- Duration per activity: 5-10 minutes
- Simple 2-3 step instructions
- Lots of repetition and routine
- Parallel play is normal - don't force sharing
- Use concrete, familiar objects
- Allow mess and exploration
- Short attention spans are normal`,

  'preschool': `
For preschoolers (3-5 years):
- Activities can include simple rules and structure
- Duration per activity: 10-15 minutes
- Use open-ended questions
- Encourage social interaction and cooperation
- Support emerging literacy and numeracy
- Allow choice and autonomy
- Build on interests and curiosity
- Dramatic play is powerful for learning`,

  'school-age': `
For school-age children (5+ years):
- Activities can be more complex with multiple steps
- Duration per activity: 15-30 minutes
- Encourage problem-solving and critical thinking
- Support peer collaboration and teamwork
- Connect to real-world applications
- Allow leadership opportunities
- Differentiate for varying skill levels
- Include reflection and self-assessment`,
};

// ============================================================================
// Prompt Templates
// ============================================================================

function buildGenerationPrompt(request: GenerateRequest): string {
  const ageGuideline = AGE_GUIDELINES[request.ageGroup];
  const ageLabel = AGE_GROUP_LABELS[request.ageGroup];
  const domainLabel = DOMAIN_LABELS[request.domain];

  return `You are an expert early childhood educator creating lesson plans for Christina's Child Care Center.

Generate a complete ${request.duration}-minute lesson plan for ${ageLabel} children about "${request.topic}" focusing on ${domainLabel}.

${ageGuideline}

IMPORTANT STRUCTURE:
Create exactly 5 segments in this order:
1. INTRO - Hook attention, preview learning, gather materials
2. EXPLORE - Guided discovery and hands-on exploration
3. PRACTICE - Apply new skills through structured activities
4. REFLECT - Discussion, sharing, and meaning-making
5. CLOSE - Summarize, celebrate, and prepare for transition

The total duration across all segments must equal ${request.duration} minutes.

${request.additionalContext ? `Additional context: ${request.additionalContext}` : ''}

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "title": "Engaging lesson title",
  "objectives": ["Learning objective 1", "Learning objective 2", "Learning objective 3"],
  "materials": ["Material 1", "Material 2", "Material 3"],
  "theme": "Optional theme or unit connection",
  "segments": [
    {
      "segment": "INTRO",
      "title": "Engaging segment title",
      "duration": <number of minutes>,
      "description": "What happens in this segment",
      "teacherActions": "Specific actions the teacher takes",
      "childActions": "Expected child behaviors and engagement",
      "materials": ["Materials used in this segment"],
      "adaptations": {
        "simplify": "How to simplify for struggling learners",
        "extend": "How to extend for advanced learners"
      },
      "assessmentOpportunity": "What to observe or document (optional)"
    },
    ... (repeat for EXPLORE, PRACTICE, REFLECT, CLOSE)
  ],
  "tags": ["relevant", "searchable", "tags"]
}`;
}

function buildRemixPrompt(request: RemixRequest): string {
  const newAgeGuideline = AGE_GUIDELINES[request.newAgeGroup];
  const newAgeLabel = AGE_GROUP_LABELS[request.newAgeGroup];
  const originalAgeLabel = AGE_GROUP_LABELS[request.baseLesson.ageGroup];
  const targetDuration = request.newDuration || request.baseLesson.duration;
  const targetDomain = request.newDomain || request.baseLesson.domain;

  return `You are an expert early childhood educator adapting a lesson plan for a different age group.

ORIGINAL LESSON:
Title: ${request.baseLesson.title}
Age Group: ${originalAgeLabel}
Domain: ${DOMAIN_LABELS[request.baseLesson.domain]}
Duration: ${request.baseLesson.duration} minutes
Objectives: ${request.baseLesson.objectives.join(', ')}
Materials: ${request.baseLesson.materials.join(', ')}

ADAPTATION TARGET:
New Age Group: ${newAgeLabel}
New Duration: ${targetDuration} minutes
New Domain: ${DOMAIN_LABELS[targetDomain]}
${request.adaptationNotes ? `Teacher Notes: ${request.adaptationNotes}` : ''}

${newAgeGuideline}

Adapt this lesson for the new age group while:
- Keeping the core concept and theme
- Adjusting complexity, vocabulary, and expectations
- Modifying materials to be age-appropriate
- Adjusting segment durations to total ${targetDuration} minutes
- Ensuring developmental appropriateness

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "title": "Adapted lesson title (can modify slightly)",
  "objectives": ["Age-appropriate objective 1", "Objective 2", "Objective 3"],
  "materials": ["Age-appropriate material 1", "Material 2"],
  "theme": "Theme connection",
  "segments": [
    {
      "segment": "INTRO",
      "title": "Segment title",
      "duration": <number>,
      "description": "Description",
      "teacherActions": "Teacher actions",
      "childActions": "Child actions",
      "materials": ["Segment materials"],
      "adaptations": {
        "simplify": "Simplification",
        "extend": "Extension"
      },
      "assessmentOpportunity": "What to observe"
    },
    ... (all 5 segments)
  ],
  "tags": ["tags"]
}`;
}

// ============================================================================
// JSON Parsing with Repair
// ============================================================================

function repairJSON(jsonString: string): string {
  // Remove markdown code blocks if present
  let cleaned = jsonString.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Fix common issues
  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // Fix unescaped quotes in strings (simple heuristic)
  // This is a basic fix - complex cases may still fail

  return cleaned;
}

function parseGeneratedLesson(
  response: string,
  request: GenerateRequest | RemixRequest,
  isRemix: boolean
): Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> {
  const cleaned = repairJSON(response);

  let parsed: {
    title: string;
    objectives: string[];
    materials: string[];
    theme?: string;
    segments: LessonSegmentItem[];
    tags: string[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Response was:', cleaned.substring(0, 500));
    throw new Error('Failed to parse AI response. Please try again.');
  }

  // Validate required fields
  if (!parsed.title || !parsed.objectives || !parsed.segments) {
    throw new Error('AI response missing required fields. Please try again.');
  }

  // Ensure exactly 5 segments
  if (parsed.segments.length !== 5) {
    throw new Error(`Expected 5 segments, got ${parsed.segments.length}. Please try again.`);
  }

  // Validate segment order
  for (let i = 0; i < LESSON_SEGMENTS.length; i++) {
    if (parsed.segments[i].segment !== LESSON_SEGMENTS[i]) {
      // Try to fix segment order
      const segment = LESSON_SEGMENTS[i];
      const found = parsed.segments.find((s) => s.segment === segment);
      if (found) {
        parsed.segments[i] = found;
      } else {
        parsed.segments[i].segment = segment;
      }
    }
  }

  const ageGroup = isRemix
    ? (request as RemixRequest).newAgeGroup
    : (request as GenerateRequest).ageGroup;

  const domain = isRemix
    ? (request as RemixRequest).newDomain || (request as RemixRequest).baseLesson.domain
    : (request as GenerateRequest).domain;

  const duration = isRemix
    ? (request as RemixRequest).newDuration || (request as RemixRequest).baseLesson.duration
    : (request as GenerateRequest).duration;

  return {
    title: parsed.title,
    ageGroup,
    domain,
    duration,
    objectives: parsed.objectives,
    materials: parsed.materials,
    segments: parsed.segments.map((s, i) => ({
      ...s,
      segment: LESSON_SEGMENTS[i],
      title: s.title || SEGMENT_LABELS[LESSON_SEGMENTS[i]],
      materials: s.materials || [],
      adaptations: s.adaptations || { simplify: '', extend: '' },
    })),
    createdBy: 'ai',
    isFavorite: false,
    tags: parsed.tags || [],
    theme: parsed.theme,
    remixedFrom: isRemix ? (request as RemixRequest).baseLesson.id : undefined,
  };
}

// ============================================================================
// Claude API Call
// ============================================================================

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.content || data.content.length === 0) {
    throw new Error('Empty response from Claude');
  }

  return data.content[0].text;
}

// ============================================================================
// Public API
// ============================================================================

export async function generateLesson(
  request: GenerateRequest,
  apiKey: string
): Promise<Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>> {
  const systemPrompt = `You are an expert early childhood educator creating developmentally appropriate lesson plans.
Always respond with valid JSON only. No markdown formatting, no explanations - just the JSON object.`;

  const userPrompt = buildGenerationPrompt(request);

  const response = await callClaude(systemPrompt, userPrompt, apiKey);

  return parseGeneratedLesson(response, request, false);
}

export async function remixLesson(
  request: RemixRequest,
  apiKey: string
): Promise<Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>> {
  const systemPrompt = `You are an expert early childhood educator adapting lesson plans for different age groups.
Always respond with valid JSON only. No markdown formatting, no explanations - just the JSON object.`;

  const userPrompt = buildRemixPrompt(request);

  const response = await callClaude(systemPrompt, userPrompt, apiKey);

  return parseGeneratedLesson(response, request, true);
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateGenerateRequest(request: GenerateRequest): string | null {
  if (!request.topic || request.topic.trim().length < 3) {
    return 'Topic must be at least 3 characters';
  }
  if (!request.ageGroup) {
    return 'Age group is required';
  }
  if (!request.domain) {
    return 'Learning domain is required';
  }
  if (!request.duration || request.duration < 5 || request.duration > 120) {
    return 'Duration must be between 5 and 120 minutes';
  }
  return null;
}

export function validateRemixRequest(request: RemixRequest): string | null {
  if (!request.baseLesson) {
    return 'Base lesson is required';
  }
  if (!request.newAgeGroup) {
    return 'New age group is required';
  }
  if (request.newDuration && (request.newDuration < 5 || request.newDuration > 120)) {
    return 'Duration must be between 5 and 120 minutes';
  }
  return null;
}
