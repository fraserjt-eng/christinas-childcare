// HTML sanitization utility for Christina's Child Care Center
// Uses DOMPurify (via isomorphic-dompurify) for robust XSS protection.
// Used for newsletter bodies, announcement text, and any rich-text fields
// that accept HTML input before rendering or storing.

import DOMPurify from 'isomorphic-dompurify';

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Sanitizes an HTML string using DOMPurify with a strict allowlist.
 *
 * Allowed tags: standard rich-text formatting elements plus tables and images.
 * Allowed attributes: href, target, rel, src, alt, width, height, class, style.
 * data-* attributes are blocked to prevent data exfiltration via attribute channels.
 *
 * @param html - Raw HTML string from user input or a rich text editor
 * @returns Sanitized HTML string safe for innerHTML rendering
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  });
}
