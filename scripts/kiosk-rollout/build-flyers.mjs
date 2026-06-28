// Renders the Crystal flyers to PDF via headless Chromium (playwright).
//   node scripts/kiosk-rollout/build-flyers.mjs --sample [surname]   one flyer -> SAMPLE-flyer.pdf
//   node scripts/kiosk-rollout/build-flyers.mjs                      all flyers -> Crystal-Family-Flyers.pdf
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { renderDocument, flyerSection, HEAD_STYLES } from './flyer-template.mjs';

const ARGV = process.argv.slice(2);
const SAMPLE = ARGV.includes('--sample');
const pickArg = ARGV.find((a) => !a.startsWith('--'));
const DIR = join(homedir(), 'Desktop', 'christina-kiosk-rollout');
const { families } = JSON.parse(readFileSync(join(DIR, 'crystal-families.json'), 'utf8'));

let html, htmlPath, pdfPath, list;
if (SAMPLE) {
  const f = (pickArg && families.find((x) => x.surname.toLowerCase() === pickArg.toLowerCase()))
    || families.find((x) => x.emailUsable) || families[0];
  list = [f];
  html = `<!doctype html><html><head><meta charset="utf-8"><style>${HEAD_STYLES}</style></head><body>${flyerSection(f)}</body></html>`;
  htmlPath = join(DIR, 'SAMPLE-flyer.html');
  pdfPath = join(DIR, 'SAMPLE-flyer.pdf');
} else {
  list = families;
  html = renderDocument(families);
  htmlPath = join(DIR, 'Crystal-Family-Flyers.html');
  pdfPath = join(DIR, 'Crystal-Family-Flyers.pdf');
}
writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`${SAMPLE ? 'SAMPLE' : list.length + ' flyers'} -> ${pdfPath}`);
