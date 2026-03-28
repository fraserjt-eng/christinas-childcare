// HTML sanitization utility for Christina's Child Care Center
// Strips dangerous tags and attributes from user-generated HTML content.
// Used for newsletter bodies, announcement text, and any rich-text fields
// that accept HTML input before rendering or storing.

// ─── Dangerous tag patterns ───────────────────────────────────────────

// Full tags to remove entirely (tag + all content inside)
const DANGEROUS_TAGS_WITH_CONTENT: RegExp[] = [
  /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,
  /<object\b[^>]*>[\s\S]*?<\/object>/gi,
  /<embed\b[^>]*\/?>/gi,
];

// Self-closing or open dangerous tags to strip
const DANGEROUS_OPEN_TAGS: RegExp[] = [
  /<(script|iframe|object|embed|applet|base|form|input|button|meta|link)\b[^>]*>/gi,
];

// ─── Dangerous attribute patterns ─────────────────────────────────────

// Event handler attributes (onclick, onerror, onload, etc.)
const EVENT_HANDLERS = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

// javascript: URIs in href/src/action attributes
const JAVASCRIPT_URIS = /(\bhref\s*=\s*["']?\s*javascript\s*:[^"'\s>]*["']?)/gi;

// data: URIs in src attributes (can carry executable content)
const DATA_URIS = /(\bsrc\s*=\s*["']?\s*data\s*:[^"'\s>]*["']?)/gi;

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Strips dangerous tags and attributes from an HTML string.
 * This is a regex-based sanitizer suitable for newsletter and message content.
 * It does NOT provide full XSS protection for untrusted third-party HTML.
 * For high-security contexts, prefer DOMPurify with a DOM environment.
 *
 * Patterns removed:
 * - script, iframe, object, embed tags (with their content)
 * - applet, base, form, input, button, meta, link tags
 * - All on* event handler attributes (onclick, onerror, etc.)
 * - javascript: URI schemes
 * - data: URI schemes in src attributes
 *
 * @param html - Raw HTML string from user input or a rich text editor
 * @returns Sanitized HTML string safe for innerHTML rendering
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let result = html;

  // Remove tags that carry executable content (with their inner content)
  for (const pattern of DANGEROUS_TAGS_WITH_CONTENT) {
    result = result.replace(pattern, '');
  }

  // Remove dangerous open/self-closing tags
  for (const pattern of DANGEROUS_OPEN_TAGS) {
    result = result.replace(pattern, '');
  }

  // Strip event handler attributes
  result = result.replace(EVENT_HANDLERS, '');

  // Strip javascript: URIs
  result = result.replace(JAVASCRIPT_URIS, '');

  // Strip data: URIs in src attributes
  result = result.replace(DATA_URIS, '');

  return result;
}
