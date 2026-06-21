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

// The admin "Combined" view (the cross-center comparison). The CenterSwitcher
// sets a separate cc_view cookie so that pages which have NOT been taught to
// aggregate still fall back to a real center via currentCenterId() above (they
// show one center rather than breaking). Pages/routes that DO support combined
// check this and aggregate across centers. The server reads the same signal
// from the request cookies (cc_view) when a director has it on.
export const COMBINED_VIEW = 'all';

export function isCombinedView(): boolean {
  if (typeof document === 'undefined') return false;
  return /(?:^|;\s*)cc_view=combined(?:;|$)/.test(document.cookie);
}
