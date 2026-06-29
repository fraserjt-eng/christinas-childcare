// Canonical room bucketing for attendance views. Centers record the free-text
// family_children.classroom inconsistently ("School Aged" vs "School Age
// (Trailblazers)", "toddler" vs "Toddler"); collapse them so by-room views group
// cleanly. Mirrors the helper in /api/admin/attendance/summary so both stay in
// sync; keep them identical if either changes.

export const ROOM_ORDER = ['Infant', 'Toddler', 'Preschool', 'Kindergarten Prep', 'School Age'];

export function canonicalRoom(raw: string | null | undefined): string {
  const s = (raw || '').toLowerCase().trim();
  if (!s) return 'Unassigned';
  if (s.includes('infant')) return 'Infant';
  if (s.includes('toddler')) return 'Toddler';
  if (s.includes('school age') || s.includes('school aged') || s.includes('trailblazer') || s.includes('summer')) return 'School Age';
  if (s.includes('kinder')) return 'Kindergarten Prep'; // before 'pre' ("preparatory" contains "pre")
  if (s.includes('pre')) return 'Preschool';
  return (raw || '').trim();
}

export function roomRank(name: string): number {
  const i = ROOM_ORDER.indexOf(name);
  if (i >= 0) return i;
  return name === 'Unassigned' ? 999 : 500;
}
