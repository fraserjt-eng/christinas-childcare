// Generate the PWA app icons (192 + 512) the manifest references, from the
// Christina's logo (red disc + gold glyph), via headless Chromium. Static assets
// only. Usage: node scripts/make-icons.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const LOGO = `<svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#FFE082"/><stop offset="50%" stop-color="#FFD54F"/><stop offset="100%" stop-color="#FFC107"/>
  </linearGradient></defs>
  <circle cx="20" cy="20" r="20" fill="#C62828"/>
  <path d="M12,10 L28,10 Q30,10 29,12 L17,26 L28,26 Q30,26 30,28 Q30,30 28,30 L12,30 Q10,30 11,28 L23,14 L12,14 Q10,14 10,12 Q10,10 12,10 Z" fill="url(#g)"/>
  <circle cx="31" cy="9" r="1.5" fill="#FFE082" opacity="0.9"/>
</svg>`;

mkdirSync('public/images', { recursive: true });
const browser = await chromium.launch();
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px">${LOGO}</body></html>`);
  await page.screenshot({ path: `public/images/icon-${size}.png`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log(`wrote public/images/icon-${size}.png`);
}
await browser.close();
