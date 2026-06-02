// Shared policy for who can change child_daily_entries. Lives in lib (not the
// route file) because Next.js route modules may only export route handlers.

// Staff (teacher rank) may edit/delete these everyday types within the window.
export const STAFF_EDITABLE_TYPES = [
  'note',
  'nap',
  'meal',
  'bathroom',
  'diaper',
  'activity',
  'photo',
] as const;

// Compliance-sensitive: only admin/owner/superadmin may change these.
export const ADMIN_ONLY_TYPES = ['medication', 'incident'] as const;

// How far back a non-admin may correct their own entries: 48 hours.
export const STAFF_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

// Roles that bypass the type + time limits (mirror require-auth ranks).
export const ADMIN_ROLES = ['admin', 'owner', 'superadmin'];
