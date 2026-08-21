#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/validate-course-source.mjs <course-dir>');
  process.exit(2);
}
const root = path.resolve(target);
const required = [
  'README.md',
  'package.json',
  'vite.config.ts',
  'index.html',
  'course-brief.json',
  'scripts/verify-release.mjs',
  'src/main.tsx',
  'src/App.tsx',
];
const errors = [];
for (const rel of required)
  if (!fs.existsSync(path.join(root, rel))) errors.push(`Missing ${rel}`);
for (const forbidden of ['node_modules', 'dist', 'dist-release', '.git'])
  if (fs.existsSync(path.join(root, forbidden)))
    errors.push(
      `Remove generated/dependency directory before packaging: ${forbidden}`,
    );
let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
} catch (e) {
  errors.push(`Invalid package.json: ${e.message}`);
}
if (pkg) {
  if (!pkg.scripts?.dev) errors.push('package.json must provide npm run dev');
  if (!pkg.scripts?.build)
    errors.push('package.json must provide npm run build');
  else if (
    !pkg.scripts.build.includes('--mode release') ||
    !pkg.scripts.build.includes('verify-release.mjs')
  )
    errors.push(
      'npm run build must build release mode and verify the single-file output',
    );
}
if (fs.existsSync(path.join(root, 'README.md'))) {
  const r = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  if (
    !r.includes('npm install') ||
    !r.includes('npm run build') ||
    !r.includes('dist-release')
  )
    errors.push(
      'README.md must document npm install, npm run build, and dist-release/index.html',
    );
}
if (fs.existsSync(path.join(root, 'index.html'))) {
  const h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  if (
    /<script[^>]+src=["']https?:/i.test(h) ||
    /<link[^>]+href=["']https?:/i.test(h)
  )
    errors.push('index.html must not require remote scripts/styles');
}
if (errors.length) {
  console.error('Course source validation failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`PASS course source: ${root}`);
