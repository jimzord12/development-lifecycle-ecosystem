#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || 'dist-release');
if (!fs.existsSync(dir)) {
  console.error(`Release directory not found: ${dir}`);
  process.exit(1);
}
const files = fs.readdirSync(dir, { withFileTypes: true });
if (
  files.length !== 1 ||
  !files[0].isFile() ||
  !files[0].name.toLowerCase().endsWith('.html')
) {
  console.error(
    `Expected exactly one HTML file in ${dir}; found: ${files.map((f) => f.name).join(', ')}`,
  );
  process.exit(1);
}
const file = path.join(dir, files[0].name);
const html = fs.readFileSync(file, 'utf8');
const failures = [];
if (/<script\b[^>]*\bsrc\s*=\s*["'][^"']+["']/i.test(html))
  failures.push('external script src');
if (
  /<link\b[^>]*\brel\s*=\s*["'](?:stylesheet|modulepreload)["'][^>]*\bhref\s*=\s*["'][^"']+["']/i.test(
    html,
  )
)
  failures.push('external stylesheet/modulepreload');
if (
  /<(?:img|audio|video|source|iframe|object|embed)\b[^>]*(?:src|data)\s*=\s*["'](?!data:|blob:|#)[^"']+["']/i.test(
    html,
  )
)
  failures.push('external/local media resource');
if (/url\(\s*["']?(?!data:|blob:|#)[^)"']+["']?\s*\)/i.test(html))
  failures.push('non-inlined CSS url() resource');
if (/\bfetch\s*\(\s*["'](?:\.\/|\.\.\/|\/)/.test(html))
  failures.push('local runtime fetch() call');
if (failures.length) {
  console.error(
    'Single-file release verification failed:\n- ' + failures.join('\n- '),
  );
  process.exit(1);
}
console.log(`PASS single-file release: ${file}`);
