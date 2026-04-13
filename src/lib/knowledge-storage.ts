// Knowledge Base Storage Module for Christina's Child Care Center
// localStorage for demo mode, designed for Supabase migration

export type KnowledgeCategory =
  | 'strategic_foundation'
  | 'daily_procedures'
  | 'emergency_protocols'
  | 'classroom_routines'
  | 'parent_templates'
  | 'compliance_checklists'
  | 'vendor_contacts'
  | 'equipment_instructions';

export const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  strategic_foundation: 'Strategic Foundation',
  daily_procedures: 'Daily Procedures',
  emergency_protocols: 'Emergency Protocols',
  classroom_routines: 'Classroom Routines',
  parent_templates: 'Parent Templates',
  compliance_checklists: 'Compliance Checklists',
  vendor_contacts: 'Vendor Contacts',
  equipment_instructions: 'Equipment Instructions',
};

export const CATEGORY_DESCRIPTIONS: Record<KnowledgeCategory, string> = {
  strategic_foundation: 'Mission, vision, values, and the philosophy that shapes how we run',
  daily_procedures: 'The routines that keep the day running without drift',
  emergency_protocols: 'What we do when things go sideways — fast',
  classroom_routines: 'Age-specific rhythms for infants, toddlers, preschool, school age',
  parent_templates: 'Pre-written communications that sound like us, not corporate',
  compliance_checklists: 'State, licensing, CACFP — what must be true and when',
  vendor_contacts: 'Who to call and for what',
  equipment_instructions: 'How the building works',
};

export const CATEGORY_ORDER: KnowledgeCategory[] = [
  'strategic_foundation',
  'daily_procedures',
  'classroom_routines',
  'emergency_protocols',
  'compliance_checklists',
  'parent_templates',
  'vendor_contacts',
  'equipment_instructions',
];

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: KnowledgeCategory;
  content_html: string;
  author_name: string;
  status: 'draft' | 'published';
  is_onboarding_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeVersion {
  id: string;
  entry_id: string;
  content_html: string;
  edited_by: string;
  edited_at: string;
}

export interface KnowledgeRead {
  id: string;
  entry_id: string;
  employee_id: string;
  read_at: string;
}

const ENTRIES_KEY = 'christinas_knowledge_base';
const VERSIONS_KEY = 'christinas_knowledge_versions';
const READS_KEY = 'christinas_knowledge_reads';

function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function seedIfEmpty(): void {
  const existing = getFromStorage<KnowledgeEntry>(ENTRIES_KEY);
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const strategicSeed: KnowledgeEntry[] = [
    {
      id: 'kb_strategic_mission',
      title: 'Mission — Who we are and why we exist',
      category: 'strategic_foundation',
      content_html: '<h2>Mission</h2><p>Placeholder. This is where the center\'s reason for being gets written in plain language. Not a slogan. Not a wall decal. The one sentence every staff member can repeat and every family can feel.</p><p><em>(To be finalized in summer strategic planning.)</em></p>',
      author_name: 'Leadership',
      status: 'draft',
      is_onboarding_required: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'kb_strategic_vision',
      title: 'Vision — Where we\'re going',
      category: 'strategic_foundation',
      content_html: '<h2>Vision</h2><p>Placeholder. The picture of what this center looks like in five years. Specific enough to steer decisions, ambitious enough to pull the work forward.</p><p><em>(To be finalized in summer strategic planning.)</em></p>',
      author_name: 'Leadership',
      status: 'draft',
      is_onboarding_required: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'kb_strategic_values',
      title: 'Values — What we commit to',
      category: 'strategic_foundation',
      content_html: '<h2>Values</h2><p>Placeholder. Four or five commitments we make to children, families, staff, and each other. Short enough to memorize. Sharp enough to hold ourselves to.</p><p><em>(To be finalized in summer strategic planning.)</em></p>',
      author_name: 'Leadership',
      status: 'draft',
      is_onboarding_required: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'kb_strategic_philosophy',
      title: 'Operations Philosophy — How we run (High Warmth + High Structure)',
      category: 'strategic_foundation',
      content_html: '<h2>Operations Philosophy</h2><p>High warmth and high structure, together, not as a tradeoff. Kids feel loved and know what comes next. Staff feel supported and know what\'s expected. Families trust us because they can see the system working.</p><p><em>(To be finalized in summer strategic planning.)</em></p>',
      author_name: 'Leadership',
      status: 'draft',
      is_onboarding_required: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'kb_strategic_drift',
      title: 'Drift Prevention — Systems that hold the line',
      category: 'strategic_foundation',
      content_html: '<h2>Drift Prevention</h2><p>Drift is what happens when standards slip one small step at a time. This page names the systems we use to catch drift before it becomes normal: weekly walk-throughs, monthly review of the operations handbook, staff check-ins that surface friction early.</p><p><em>(To be finalized in summer strategic planning.)</em></p>',
      author_name: 'Leadership',
      status: 'draft',
      is_onboarding_required: true,
      created_at: now,
      updated_at: now,
    },
  ];

  const seed: KnowledgeEntry[] = [
    ...strategicSeed,
    {
      id: 'kb_seed_1',
      title: 'Morning Opening Checklist',
      category: 'daily_procedures',
      content_html: '<h2>Morning Opening Checklist</h2><p>Complete these steps every morning before children arrive:</p><ol><li>Unlock front door and deactivate alarm (code: see director)</li><li>Check all classrooms for safety hazards</li><li>Turn on lights and adjust thermostat to 68-72°F</li><li>Set out breakfast items per CACFP menu</li><li>Review sign-in sheet from previous day</li><li>Check voicemail for absences</li><li>Unlock outdoor play area gate</li></ol><p><strong>Note:</strong> Document any issues in the daily log book.</p>',
      author_name: 'Christina Fraser',
      status: 'published',
      is_onboarding_required: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'kb_seed_2',
      title: 'Fire Evacuation Procedure',
      category: 'emergency_protocols',
      content_html: '<h2>Fire Evacuation Procedure</h2><p><strong>When the fire alarm sounds:</strong></p><ol><li>Remain calm and announce "Fire drill" or "Fire evacuation" in a calm voice</li><li>Each teacher takes their classroom roster</li><li>Walk children to the nearest exit — do NOT use elevators</li><li>Meet at the assembly point: the far corner of the parking lot</li><li>Take attendance against the roster immediately</li><li>Call 911 if real fire</li><li>Do not re-enter until fire department gives all-clear</li></ol><p><strong>Assembly point map is posted in every classroom.</strong></p>',
      author_name: 'Ophelia Zeogar',
      status: 'published',
      is_onboarding_required: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'kb_seed_3',
      title: 'Infant Room Daily Routine',
      category: 'classroom_routines',
      content_html: '<h2>Infant Room Daily Routine</h2><p>Infants thrive on consistency. Follow this schedule as closely as possible:</p><ul><li><strong>7:00–8:30 AM</strong> — Arrival, greet parents, review daily sheet from home</li><li><strong>8:30–9:00 AM</strong> — Morning feeding (breast milk or formula per parent instructions)</li><li><strong>9:00–10:30 AM</strong> — Floor play, tummy time, sensory exploration</li><li><strong>10:30–12:00 PM</strong> — Morning nap (per individual schedule)</li><li><strong>12:00–12:30 PM</strong> — Lunch feeding</li><li><strong>12:30–3:00 PM</strong> — Afternoon nap</li><li><strong>3:00–5:30 PM</strong> — Afternoon play, parent pickup</li></ul><p>Complete the daily communication sheet for each infant before pickup.</p>',
      author_name: 'Maria Santos',
      status: 'published',
      is_onboarding_required: false,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'kb_seed_4',
      title: 'HVAC System Instructions',
      category: 'equipment_instructions',
      content_html: '<h2>HVAC System Instructions</h2><p>The building uses a Honeywell commercial HVAC system. Here is what staff need to know:</p><h3>Temperature Settings</h3><ul><li>Occupied hours: 68–72°F</li><li>After hours: 60°F (winter), 78°F (summer)</li></ul><h3>Adjusting the Thermostat</h3><p>Thermostats are in the hallway outside each classroom. Press the up/down arrows to adjust. Do not change "schedule" settings — those are set by the director.</p><h3>If the System is Not Working</h3><p>Contact HVAC vendor: <strong>Arctic Air Services — (651) 555-0199</strong><br>Emergency line available 24/7.</p>',
      author_name: 'Ophelia Zeogar',
      status: 'draft',
      is_onboarding_required: false,
      created_at: now,
      updated_at: now,
    },
  ];

  saveToStorage(ENTRIES_KEY, seed);
}

// ─── Entries CRUD ─────────────────────────────────────────────────────────────

export async function getEntries(filters?: {
  category?: KnowledgeCategory;
  status?: 'draft' | 'published';
  is_onboarding_required?: boolean;
}): Promise<KnowledgeEntry[]> {
  seedIfEmpty();
  let entries = getFromStorage<KnowledgeEntry>(ENTRIES_KEY);

  if (filters) {
    if (filters.category) {
      entries = entries.filter(e => e.category === filters.category);
    }
    if (filters.status) {
      entries = entries.filter(e => e.status === filters.status);
    }
    if (filters.is_onboarding_required !== undefined) {
      entries = entries.filter(e => e.is_onboarding_required === filters.is_onboarding_required);
    }
  }

  entries.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  return entries;
}

export async function createEntry(
  data: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>
): Promise<KnowledgeEntry> {
  seedIfEmpty();
  const entries = getFromStorage<KnowledgeEntry>(ENTRIES_KEY);
  const now = new Date().toISOString();

  const entry: KnowledgeEntry = {
    ...data,
    id: generateId('kb'),
    created_at: now,
    updated_at: now,
  };

  entries.push(entry);
  saveToStorage(ENTRIES_KEY, entries);
  return entry;
}

export async function updateEntry(
  id: string,
  updates: Partial<KnowledgeEntry>,
  edited_by?: string
): Promise<KnowledgeEntry | null> {
  const entries = getFromStorage<KnowledgeEntry>(ENTRIES_KEY);
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) return null;

  const previous = entries[index];

  // Save version before overwriting content
  if (updates.content_html && updates.content_html !== previous.content_html) {
    const versions = getFromStorage<KnowledgeVersion>(VERSIONS_KEY);
    versions.push({
      id: generateId('kbv'),
      entry_id: id,
      content_html: previous.content_html,
      edited_by: edited_by || 'Unknown',
      edited_at: new Date().toISOString(),
    });
    saveToStorage(VERSIONS_KEY, versions);
  }

  entries[index] = {
    ...previous,
    ...updates,
    id: previous.id,
    created_at: previous.created_at,
    updated_at: new Date().toISOString(),
  };

  saveToStorage(ENTRIES_KEY, entries);
  return entries[index];
}

export async function deleteEntry(id: string): Promise<boolean> {
  const entries = getFromStorage<KnowledgeEntry>(ENTRIES_KEY);
  const filtered = entries.filter(e => e.id !== id);
  if (filtered.length === entries.length) return false;
  saveToStorage(ENTRIES_KEY, filtered);
  return true;
}

export async function publishEntry(id: string): Promise<KnowledgeEntry | null> {
  return updateEntry(id, { status: 'published' });
}

// ─── Version history ──────────────────────────────────────────────────────────

export async function getVersions(entryId: string): Promise<KnowledgeVersion[]> {
  const versions = getFromStorage<KnowledgeVersion>(VERSIONS_KEY);
  return versions
    .filter(v => v.entry_id === entryId)
    .sort((a, b) => b.edited_at.localeCompare(a.edited_at));
}

export async function rollbackToVersion(
  entryId: string,
  version: KnowledgeVersion,
  rolled_back_by: string
): Promise<KnowledgeEntry | null> {
  return updateEntry(entryId, { content_html: version.content_html }, rolled_back_by);
}

// ─── Read tracking ────────────────────────────────────────────────────────────

export async function trackRead(entryId: string, employeeId: string): Promise<void> {
  const reads = getFromStorage<KnowledgeRead>(READS_KEY);
  const exists = reads.find(r => r.entry_id === entryId && r.employee_id === employeeId);
  if (exists) return;

  reads.push({
    id: generateId('kbr'),
    entry_id: entryId,
    employee_id: employeeId,
    read_at: new Date().toISOString(),
  });
  saveToStorage(READS_KEY, reads);
}

export async function getReadStatus(entryId: string): Promise<KnowledgeRead[]> {
  const reads = getFromStorage<KnowledgeRead>(READS_KEY);
  return reads.filter(r => r.entry_id === entryId);
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchEntries(query: string): Promise<KnowledgeEntry[]> {
  seedIfEmpty();
  const entries = getFromStorage<KnowledgeEntry>(ENTRIES_KEY);
  const q = query.toLowerCase();
  return entries
    .filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.content_html.toLowerCase().includes(q) ||
      e.author_name.toLowerCase().includes(q) ||
      CATEGORY_LABELS[e.category].toLowerCase().includes(q)
    )
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}
