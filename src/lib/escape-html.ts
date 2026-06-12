/**
 * Escape user-provided text before interpolating it into an HTML email body.
 *
 * Public forms (enrollment inquiry, tour request) send a notification email to
 * the center owner built from the submitter's raw input. Without escaping, a
 * value like `<a href="...">` or `<img src=x onerror=...>` is rendered live in
 * the owner's inbox. This neutralizes all markup so submitted text shows as
 * text, never as HTML.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
