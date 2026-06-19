// The center the current browser is acting in.
//
// Multi-center reads/writes need one shared answer to "which center am I?" so a
// back-office tool shows ONE center's records, never both mixed. The portal's
// /start picker sets the cc_center cookie (a real center UUID); this reads it.
// When there is no cookie (a single-center setup, or a context that never went
// through /start) it falls back to the operating center (Brooklyn Park), so the
// existing single-center behavior is unchanged.
//
// Client-only: the cc_center cookie is set with document.cookie (not HttpOnly),
// so it is readable here. Server routes derive the center from the session
// instead (see /api/portal/center-data), never from this helper.

export const OPERATING_CENTER_ID = '3104ae69-4f26-4c1e-a767-3ff45b534860';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function currentCenterId(): string {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)cc_center=([^;]+)/);
    const value = match ? decodeURIComponent(match[1]) : '';
    if (UUID_PATTERN.test(value)) return value;
  }
  return OPERATING_CENTER_ID;
}
