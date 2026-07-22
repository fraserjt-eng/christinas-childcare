// Reconcile a family's children list IN PLACE.
//
// WHY THIS EXISTS: both admin family-edit routes used to `delete` every
// family_children row and re-`insert` the submitted set. That gave every child
// a brand new UUID on every edit, while `attendance.child_id` (which has no
// foreign key) kept pointing at the old one. The roster join in the CCAP/DHS
// export then found nothing, so the child's date of birth came out BLANK -- and
// DOB is a required column in the Provider Hub import, which rejects the file.
// The same delete-and-reinsert also silently wiped allergies and medical notes,
// and forced a by-name photo-preservation hack that mis-assigns faces whenever
// two children in one family share a name.
//
// This helper updates the rows that already exist, inserts only genuinely new
// children, and deletes only children actually removed from the list. Child ids
// are stable, so attendance history, photos, allergies, and medical notes all
// survive an edit.
//
// MATCHING ORDER:
//   1. by id, when the payload carries a real id belonging to this family
//      (the admin pages have the id; unsaved rows carry a `child_...` sentinel);
//   2. by normalized name, so a legacy payload with no ids still lands in place
//      instead of orphaning attendance. Repeated names are matched in the order
//      they appear, which is deterministic rather than ambiguous;
//   3. anything left over is a new child and gets inserted.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ChildSyncInput {
  id?: string;
  name: string;
  date_of_birth?: string | null;
  classroom?: string | null;
  classroom_id?: string | null;
  allergies?: string[];
  medical_notes?: string | null;
  end_date?: string | null;
  end_reason?: string | null;
}

export interface ChildSyncResult {
  updated: number;
  inserted: number;
  deleted: number;
  error: string | null;
}

interface ExistingChild {
  id: string;
  name: string;
}

function normName(n: string): string {
  return (n || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// A real persisted row id. The admin forms generate `child_...` placeholders for
// rows the user just added, which must never be treated as an existing id.
function isPersistedId(id: string | undefined): id is string {
  return !!id && !id.startsWith('child_');
}

export async function syncFamilyChildren(
  supabase: SupabaseClient,
  familyId: string,
  incoming: ChildSyncInput[],
  centerId: string
): Promise<ChildSyncResult> {
  const result: ChildSyncResult = { updated: 0, inserted: 0, deleted: 0, error: null };

  const { data: existingRaw, error: readErr } = await supabase
    .from('family_children')
    .select('id, name')
    .eq('family_id', familyId);
  if (readErr) {
    result.error = 'Could not read the current children';
    return result;
  }
  const existing: ExistingChild[] = (existingRaw ?? []).map((r) => ({
    id: r.id as string,
    name: (r.name as string) || '',
  }));

  const byId = new Map(existing.map((e) => [e.id, e]));
  // Name buckets preserve insertion order so repeated names match predictably.
  const byName = new Map<string, string[]>();
  for (const e of existing) {
    const key = normName(e.name);
    const bucket = byName.get(key);
    if (bucket) bucket.push(e.id);
    else byName.set(key, [e.id]);
  }

  const claimed = new Set<string>();

  // Pass 1: explicit ids win, so a rename never lands on the wrong sibling.
  const matchedId: (string | null)[] = incoming.map((c) => {
    if (isPersistedId(c.id) && byId.has(c.id) && !claimed.has(c.id)) {
      claimed.add(c.id);
      return c.id;
    }
    return null;
  });

  // Pass 2: fall back to name for payloads that carry no id.
  incoming.forEach((c, i) => {
    if (matchedId[i]) return;
    const bucket = byName.get(normName(c.name));
    if (!bucket) return;
    const free = bucket.find((id) => !claimed.has(id));
    if (free) {
      claimed.add(free);
      matchedId[i] = free;
    }
  });

  // Update matched rows, touching only the fields the caller actually sent. A
  // payload that omits allergies or medical notes leaves them intact instead of
  // clearing them, which is how the old delete-and-reinsert lost them.
  for (let i = 0; i < incoming.length; i++) {
    const id = matchedId[i];
    if (!id) continue;
    const c = incoming[i];
    const patch: Record<string, unknown> = {
      name: c.name.trim(),
      // Every child stays bound to the family's center so the kiosk
      // cross-center guard (which fails open on NULL) cannot be widened.
      center_id: centerId,
    };
    if (c.date_of_birth !== undefined) patch.date_of_birth = c.date_of_birth || null;
    if (c.classroom !== undefined) patch.classroom = c.classroom || null;
    if (c.classroom_id !== undefined) patch.classroom_id = c.classroom_id || null;
    if (c.allergies !== undefined) patch.allergies = c.allergies || [];
    if (c.medical_notes !== undefined) patch.medical_notes = c.medical_notes || null;
    if (c.end_date !== undefined) patch.end_date = c.end_date || null;
    if (c.end_reason !== undefined) patch.end_reason = c.end_reason || null;

    const { error } = await supabase.from('family_children').update(patch).eq('id', id);
    if (error) {
      result.error = 'Could not update the children';
      return result;
    }
    result.updated++;
  }

  // Insert the genuinely new children.
  const newRows = incoming
    .map((c, i) => ({ c, i }))
    .filter(({ i }) => !matchedId[i])
    .map(({ c }) => ({
      family_id: familyId,
      name: c.name.trim(),
      date_of_birth: c.date_of_birth || null,
      classroom: c.classroom || null,
      classroom_id: c.classroom_id || null,
      allergies: c.allergies || [],
      medical_notes: c.medical_notes || null,
      end_date: c.end_date || null,
      end_reason: c.end_reason || null,
      center_id: centerId,
    }));
  if (newRows.length > 0) {
    const { error } = await supabase.from('family_children').insert(newRows);
    if (error) {
      result.error = 'Could not add the new children';
      return result;
    }
    result.inserted = newRows.length;
  }

  // Delete only the children removed from the list.
  const removed = existing.filter((e) => !claimed.has(e.id)).map((e) => e.id);
  if (removed.length > 0) {
    const { error } = await supabase.from('family_children').delete().in('id', removed);
    if (error) {
      result.error = 'Could not remove the deleted children';
      return result;
    }
    result.deleted = removed.length;
  }

  return result;
}
