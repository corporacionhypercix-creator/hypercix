#!/usr/bin/env node
/* Build estatico para Cloudflare Pages.
 * Copia solo los archivos servibles del frontend a ./dist
 * (excluye server.js, node_modules, database, logs, scripts, etc).
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');

const DIRS = ['public', 'admin', 'tienda', 'css', 'js', 'img', 'icons'];
const FILES = [
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'og-image.svg',
  '_redirects',
  '_headers',
];

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

console.log('[build-pages] limpiando ./dist');
rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });

for (const dir of DIRS) {
  const src = path.join(ROOT, dir);
  if (!fs.existsSync(src)) { console.warn('  - omitido (no existe):', dir); continue; }
  console.log('  + copiando', dir);
  copyDir(src, path.join(OUT, dir));
}

for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (!fs.existsSync(src)) { console.warn('  - omitido (no existe):', f); continue; }
  console.log('  + copiando', f);
  fs.copyFileSync(src, path.join(OUT, f));
}

console.log('[build-pages] OK -> ./dist');
