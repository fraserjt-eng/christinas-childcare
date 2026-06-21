// Render an HTML file to PDF via headless Chromium (playwright devDependency).
// Usage: node scripts/html-to-pdf.mjs <input.html> <output.pdf>
import { chromium } from 'playwright';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) { console.error('usage: html-to-pdf.mjs <in.html> <out.pdf>'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + inPath, { waitUntil: 'networkidle' });
await page.pdf({ path: outPath, printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('PDF -> ' + outPath);
