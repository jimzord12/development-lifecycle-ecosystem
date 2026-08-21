#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
function value(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

const targetArg = value('--target');
const title = value('--title') || 'Interactive Technical Course';
const force = args.includes('--force');

if (!targetArg) {
  console.error(
    'Usage: node scripts/scaffold-course.mjs --target <dir> [--title <title>] [--force]',
  );
  process.exit(2);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(here, '..');
const source = path.join(skillRoot, 'assets', 'course-template');
const target = path.resolve(targetArg);

if (!fs.existsSync(source)) {
  console.error(`Bundled course template missing: ${source}`);
  process.exit(1);
}

if (fs.existsSync(target)) {
  const entries = fs.readdirSync(target);
  const safeExisting = entries.every((name) => name === 'course-brief.json');
  if (entries.length && !safeExisting && !force) {
    console.error(
      `Target directory contains files other than course-brief.json: ${target}\nUse --force only when replacing a disposable scaffold.`,
    );
    process.exit(1);
  }
} else {
  fs.mkdirSync(target, { recursive: true });
}

fs.cpSync(source, target, { recursive: true, force: true });

const packageName =
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'interactive-technical-course';

const replacements = [
  path.join(target, 'index.html'),
  path.join(target, 'src', 'course', 'course.ts'),
  path.join(target, 'package.json'),
  path.join(target, 'README.md'),
];
for (const file of replacements) {
  let text = fs.readFileSync(file, 'utf8');
  text = text
    .replaceAll('{{COURSE_TITLE}}', title)
    .replaceAll('{{PACKAGE_NAME}}', packageName);
  fs.writeFileSync(file, text);
}

console.log(`Scaffolded course at ${target}`);
console.log(
  'Next: create/validate course-brief.json, replace starter content, validate source, then package the source ZIP. Local developers can run npm install && npm run build.',
);
