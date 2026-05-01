// Whitelist of Supabase tables included in v2 backup snapshots.
//
// Why a whitelist (not "all tables"): some tables hold ephemeral or sensitive
// audit data (error_logs, training_progress) that we don't want to round-trip
// through restore. Others (storage.* schemas) shouldn't be touched by app
// snapshots at all. Adding a new table to a backup is a deliberate decision.
//
// Restore order matters when foreign keys exist. Centers must come back
// before classrooms, families before family_children, etc. We order this list
// so a sequential upsert respects dependencies.

export interface BackupTableSpec {
  name: string;
  /** Column to use for upsert conflict resolution. Default 'id'. */
  conflictColumn?: string;
  /** Skip during restore (snapshot only). Useful for read-only history. */
  restoreOnly?: false | true;
}

export const BACKUP_TABLES: BackupTableSpec[] = [
  // Foundation
  { name: 'centers' },
  { name: 'classrooms' },
  { name: 'employees' },

  // Families (parent table before children)
  { name: 'families' },
  { name: 'family_parents' },
  { name: 'family_children' },

  // Operational
  { name: 'attendance' },
  { name: 'staff_schedules' },
  { name: 'food_counts' },
  { name: 'cacfp_compliance' },
  { name: 'daily_photos' },
  { name: 'photo_reactions' },

  // Communications
  { name: 'communications' },
  { name: 'communication_reads' },
  { name: 'newsletters' },
  { name: 'parent_conversations' },
  { name: 'news_updates' },
  { name: 'center_announcements' },

  // Pipeline + tours
  { name: 'enrollment_inquiries' },
  { name: 'tour_requests' },

  // Compliance + HR
  { name: 'incident_reports' },
  { name: 'hr_documents' },
  { name: 'training_records' },

  // Financial
  { name: 'financial_records' },
  { name: 'revenue_scenarios' },

  // Site config
  { name: 'app_settings' },
  { name: 'site_content' },

  // Subs (newer tables)
  { name: 'substitutes' },
  { name: 'sub_assignments' },
];

// Tables that should NEVER be restored (snapshot may capture them but restore
// is destructive or pointless). These are read-only history.
export const RESTORE_BLOCKLIST = new Set<string>([
  'error_logs',
  'training_progress',
  'training_knowledge_checks',
  'training_gate_assessments',
  'training_gate_overrides',
  'training_unit_unlocks',
  'research_findings',
]);
