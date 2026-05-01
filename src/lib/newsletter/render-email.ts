// Render a newsletter (sections + blocks) into a single HTML email body.
// Inline styles only (most email clients strip <style>). Mobile-friendly.
//
// Two block-shape inputs are supported because we're in transition:
//   - Newsletter.sections (current shape used by /admin/communications)
//   - Newsletter.body_html (raw HTML override; takes precedence if present)
//
// The future Plate-based block editor will produce a `blocks` JSONB
// property; renderBlocks() handles that shape too.

import { sanitizeHTML } from '@/lib/sanitize';
import type { Newsletter, NewsletterSection } from '@/lib/newsletter-storage';

interface RenderOptions {
  centerName: string;
  unsubscribeUrl: string;
  preheader?: string;
}

const BASE_STYLES = {
  body: 'margin:0;padding:0;background:#faf6f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1f2937;',
  wrapper: 'max-width:600px;margin:0 auto;background:#ffffff;padding:32px 24px;',
  h1: 'font-size:24px;font-weight:700;margin:0 0 16px 0;color:#C62828;',
  h2: 'font-size:18px;font-weight:700;margin:24px 0 8px 0;color:#1f2937;',
  text: 'font-size:15px;line-height:1.6;margin:0 0 12px 0;color:#374151;',
  divider: 'border:none;border-top:1px solid #e5e7eb;margin:24px 0;',
  footer: 'font-size:12px;color:#9ca3af;text-align:center;margin-top:32px;line-height:1.6;',
  button: 'display:inline-block;padding:12px 24px;background:#C62828;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;margin:8px 0;',
};

interface RenderableBlock {
  type: string;
  text?: string;
  level?: number;
  url?: string;
  title?: string;
  blocks?: RenderableBlock[];
}

function renderBlock(block: RenderableBlock): string {
  switch (block.type) {
    case 'header': {
      const level = block.level ?? 1;
      const style = level === 1 ? BASE_STYLES.h1 : BASE_STYLES.h2;
      return `<h${Math.min(level, 6)} style="${style}">${escapeText(block.text ?? '')}</h${Math.min(level, 6)}>`;
    }
    case 'text':
      return `<p style="${BASE_STYLES.text}">${escapeText(block.text ?? '')}</p>`;
    case 'divider':
      return `<hr style="${BASE_STYLES.divider}" />`;
    case 'button':
      if (!block.url) return '';
      return `<p><a href="${escapeAttr(block.url)}" style="${BASE_STYLES.button}">${escapeText(block.text ?? 'Learn More')}</a></p>`;
    case 'section': {
      const inner = (block.blocks ?? []).map(renderBlock).join('');
      return `<div><h2 style="${BASE_STYLES.h2}">${escapeText(block.title ?? '')}</h2>${inner}</div>`;
    }
    default:
      return '';
  }
}

function escapeText(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function renderSections(sections: NewsletterSection[]): string {
  if (!sections || sections.length === 0) return '';
  return sections
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => {
      const safeContent = sanitizeHTML(s.content_html || '');
      return `<div style="margin-bottom:20px;"><h2 style="${BASE_STYLES.h2}">${escapeText(s.title)}</h2>${safeContent}</div>`;
    })
    .join('');
}

export function renderNewsletterEmail(
  newsletter: Newsletter,
  opts: RenderOptions
): { subject: string; html: string } {
  const subject = newsletter.subject || newsletter.title || `Update from ${opts.centerName}`;

  // Body assembly: prefer Plate-shaped blocks if present, otherwise fall back
  // to legacy sections, otherwise body_html as raw HTML.
  let bodyContent = '';
  const blocks = (newsletter as unknown as { blocks?: RenderableBlock[] }).blocks;
  if (blocks && Array.isArray(blocks) && blocks.length > 0) {
    bodyContent = blocks.map(renderBlock).join('');
  } else if (newsletter.sections && newsletter.sections.length > 0) {
    bodyContent = renderSections(newsletter.sections);
  } else if (newsletter.body_html) {
    bodyContent = sanitizeHTML(newsletter.body_html);
  } else {
    bodyContent = `<p style="${BASE_STYLES.text}">No content yet.</p>`;
  }

  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeText(opts.preheader)}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeText(subject)}</title>
</head>
<body style="${BASE_STYLES.body}">
${preheader}
<div style="${BASE_STYLES.wrapper}">
  <h1 style="${BASE_STYLES.h1}">${escapeText(subject)}</h1>
  ${bodyContent}
  <div style="${BASE_STYLES.footer}">
    Sent by ${escapeText(opts.centerName)}.<br />
    <a href="${escapeAttr(opts.unsubscribeUrl)}" style="color:#9ca3af;">Unsubscribe</a> from these emails.
  </div>
</div>
</body>
</html>`;

  return { subject, html };
}
