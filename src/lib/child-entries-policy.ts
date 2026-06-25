// Shared policy for who can change child_daily_entries. Lives in lib (not the
// route file) because Next.js route modules may only export route handlers.

// Staff (teacher rank) may edit/delete these everyday types within the window.
export const STAFF_EDITABLE_TYPES = [
  'note',
  'nap',
  'meal',
  'bottle',
  'bathroom',
  'diaper',
  'toileting',
  'accident',
  'activity',
  'photo',
] as const;

// Compliance-sensitive: only admin/owner/superadmin may change these.
export const ADMIN_ONLY_TYPES = ['medication', 'incident'] as const;

// How far back a non-admin may correct their own entries: 48 hours.
export const STAFF_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

// Roles that bypass the type + time limits (mirror require-auth ranks).
export const ADMIN_ROLES = ['admin', 'owner', 'superadmin'];

// Classroom scoping for teachers. OFF for now: staff float between rooms
// during the day, so any staff member sees every child and can log a daily
// report from whichever room they walk into. Flip to true to re-enable
// room-scoped teacher access; the enforcement code in the routes is intact
// and the admin assignment UI + classroom_id stamping keep working either way.
export const CLASSROOM_SCOPING_ENABLED = false;
