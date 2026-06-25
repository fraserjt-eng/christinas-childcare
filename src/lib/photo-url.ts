// Child photo access: store the storage path, hand out short-lived signed URLs.
//
// Child photos live in the `child_photos` bucket. The app used to store a
// permanent public URL and render it directly, which meant anyone with the URL
// could see a child's photo with no login. These helpers turn a stored value
// (a path, or a legacy public/signed URL from an older row) into a fresh signed
// URL at read time, so the link expires and the bucket can be private.
//
// The helpers accept either format on the way in, so reads keep working before,
// during, and after the one-time data cleanup and the bucket-privacy flip.

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'child_photos';
// Eight hours: a full working day, so a photo opened in the morning still loads
// in the afternoon without a hard refresh. Still expires the same day, so a
// leaked link does not live forever.
const TTL_SECONDS = 60 * 60 * 8;

/**
 * Reduce any stored photo value to the bucket object path.
 * - bare path (`daily-report/<child>/<ts>.jpg`) -> returned as-is
 * - legacy public URL (`.../object/public/child_photos/<path>`) -> the `<path>`
 * - signed URL (`.../object/sign/child_photos/<path>?token=...`) -> the `<path>`
 * - data: URL or unknown external URL -> null (not a bucket object)
 */
export function toStoragePath(stored: string | null | undefined): string | null {
  if (!stored || typeof stored !== 'string') return null;
  if (stored.startsWith('data:')) return null;
  const marker = '/child_photos/';
  const i = stored.indexOf(marker);
  if (i !== -1) {
    let p = stored.slice(i + marker.length);
    const q = p.indexOf('?');
    if (q !== -1) p = p.slice(0, q);
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  }
  if (/^https?:\/\//i.test(stored)) return null;
  return stored.replace(/^\/+/, '');
}

/**
 * One stored value -> a signed URL. Inline data: images pass through unchanged;
 * an unresolvable value returns '' (no broken bucket link is ever emitted).
 */
export async function signPhoto(
  supabase: SupabaseClient,
  stored: string | null | undefined
): Promise<string> {
  if (!stored || typeof stored !== 'string') return '';
  if (stored.startsWith('data:')) return stored;
  const path = toStoragePath(stored);
  if (!path) return /^https?:\/\//i.test(stored) ? stored : '';
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL_SECONDS);
  return data?.signedUrl ?? '';
}

/**
 * Sign a list of stored values in a single round trip where possible. Preserves
 * order and length, so callers can map the result back onto their rows.
 */
export async function signPhotoList(
  supabase: SupabaseClient,
  stored: (string | null | undefined)[]
): Promise<string[]> {
  const paths = stored.map(toStoragePath);
  const real = Array.from(new Set(paths.filter((p): p is string => !!p)));
  const byPath = new Map<string, string>();
  if (real.length > 0) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(real, TTL_SECONDS);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) byPath.set(item.path, item.signedUrl);
    }
  }
  return stored.map((s, idx) => {
    if (typeof s === 'string' && s.startsWith('data:')) return s;
    const p = paths[idx];
    if (p && byPath.has(p)) return byPath.get(p)!;
    if (!p && typeof s === 'string' && /^https?:\/\//i.test(s)) return s;
    return '';
  });
}

interface EntryLike {
  type?: string;
  detail?: Record<string, unknown> | null;
}

/**
 * Sign the photo_url embedded in a child_daily_entries `detail` for photo
 * entries, returning a new entry object (no mutation of the input row). Non
 * photo entries pass through untouched.
 */
export async function signEntryPhoto<T extends EntryLike>(
  supabase: SupabaseClient,
  entry: T
): Promise<T> {
  if (!entry || entry.type !== 'photo' || !entry.detail) return entry;
  const url = entry.detail.photo_url;
  if (typeof url !== 'string' || !url) return entry;
  const signed = await signPhoto(supabase, url);
  return { ...entry, detail: { ...entry.detail, photo_url: signed } } as T;
}
