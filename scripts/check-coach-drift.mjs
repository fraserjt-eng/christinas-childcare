#!/usr/bin/env node
// Drift gate for the Coach's canonical knowledge.
//
// The Coach now derives its reference from TILE_CATALOG + trainingModules. That
// kills "the Coach forgot a feature" drift, but introduces the opposite risk: a
// tile or module pointing at a page that was renamed or deleted, so the Coach
// confidently sends an owner to a dead route. This asserts every href / portal
// page resolves to a real route under src/app. Read-only; run in CI or by hand.
//
// Usage: node scripts/check-coach-drift.mjs   (exit 0 = clean, 2 = drift found)

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(REPO, 'src', 'app');

// Build the set of REAL URL routes by walking src/app for page.tsx/route.ts,
// stripping Next route-group segments "(group)" (which don't appear in the URL)
// and treating dynamic "[param]" segments as wildcards.
function buildRouteSet() {
  const exact = new Set();
  const dynamicPrefixes = [];
  function walk(dir, urlParts) {
    let entries;
    try { entries = readdirSync(dir); } catch { return; }
    const hasPage = entries.some((e) => e === 'page.tsx' || e === 'page.ts' || e === 'route.ts');
    if (hasPage) {
      const path = '/' + urlParts.filter(Boolean).join('/');
      if (urlParts.some((p) => p.startsWith('['))) {
        dynamicPrefixes.push(urlParts.findIndex((p) => p.startsWith('[')));
        // record the static prefix before the first dynamic segment
        const cut = urlParts.findIndex((p) => p.startsWith('['));
        exact.add('/' + urlParts.slice(0, cut).filter(Boolean).join('/'));
      } else {
        exact.add(path === '/' ? '/' : path);
      }
    }
    for (const e of entries) {
      const full = join(dir, e);
      let isDir = false;
      try { isDir = statSync(full).isDirectory(); } catch { /* ignore */ }
      if (!isDir) continue;
      // route group "(x)" is invisible in the URL; dynamic "[x]" is a wildcard segment
      if (e.startsWith('(') && e.endsWith(')')) walk(full, urlParts);
      else walk(full, [...urlParts, e]);
    }
  }
  walk(APP, []);
  return exact;
}
const REAL_ROUTES = buildRouteSet();

// Pull the literal href / portalPages strings out of the source (no TS runtime).
function routesFrom(file, keys) {
  const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const found = new Set();
  for (const key of keys) {
    // matches:  href: "/x"   |   portalPages: ['/a', '/b']
    const re = new RegExp(`${key}\\s*:\\s*(\\[[^\\]]*\\]|["'\`][^"'\`]+["'\`])`, 'g');
    let m;
    while ((m = re.exec(text))) {
      const chunk = m[1];
      for (const r of chunk.match(/["'`](\/[^"'`]*)["'`]/g) || []) {
        found.add(r.slice(1, -1));
      }
    }
  }
  return [...found];
}

// A route resolves if it (or a static prefix of it, for dynamic routes) is a real
// URL route discovered by the walk, with Next route groups already stripped.
function routeExists(route) {
  const clean = (route.split('?')[0].split('#')[0].replace(/\/$/, '')) || '/';
  if (REAL_ROUTES.has(clean)) return true;
  // allow a deeper canonical link to match a real parent route (e.g. a tab/anchor)
  const parts = clean.split('/').filter(Boolean);
  for (let i = parts.length - 1; i >= 1; i--) {
    if (REAL_ROUTES.has('/' + parts.slice(0, i).join('/'))) return true;
  }
  return false;
}

const tileRoutes = routesFrom(join(REPO, 'src/lib/tile-catalog.ts'), ['href']);
const moduleRoutes = routesFrom(join(REPO, 'src/lib/training/modules.ts'), ['portalPages']);
const all = [...new Set([...tileRoutes, ...moduleRoutes])];

const dead = all.filter((r) => !routeExists(r));
console.log(`Coach drift check: ${all.length} canonical routes (${tileRoutes.length} tiles, ${moduleRoutes.length} module pages).`);
if (dead.length === 0) {
  console.log('OK — every tile/module route resolves to a real page.');
  process.exit(0);
}
console.log(`\nDEAD ROUTES (Coach would send owners to a missing page): ${dead.length}`);
for (const r of dead.sort()) console.log(`  - ${r}`);
console.log('\nFix the tile/module to point at a real route, or remove it.');
process.exit(2);
