#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error(
    'Usage: node scripts/validate-course-brief.mjs <course-brief.json>',
  );
  process.exit(2);
}

const absolute = path.resolve(file);
if (!fs.existsSync(absolute)) {
  console.error(`Course Brief not found: ${absolute}`);
  process.exit(2);
}

let brief;
try {
  brief = JSON.parse(fs.readFileSync(absolute, 'utf8'));
} catch (error) {
  console.error(`Invalid JSON: ${error.message}`);
  process.exit(1);
}

const errors = [];
for (const key of [
  'title',
  'subject',
  'audience',
  'desiredCapabilities',
  'timeBudgetMinutes',
  'scope',
  'delivery',
]) {
  if (brief[key] === undefined || brief[key] === null || brief[key] === '') {
    errors.push(`Missing required field: ${key}`);
  }
}

if (
  !Array.isArray(brief.desiredCapabilities) ||
  brief.desiredCapabilities.length === 0
) {
  errors.push('desiredCapabilities must be a non-empty array');
}

if (!Number.isFinite(brief.timeBudgetMinutes) || brief.timeBudgetMinutes <= 0) {
  errors.push('timeBudgetMinutes must be a positive number');
} else if (brief.timeBudgetMinutes > 20160) {
  errors.push('timeBudgetMinutes exceeds the 14-day mini-course ceiling');
}

if (typeof brief.audience !== 'object' || Array.isArray(brief.audience)) {
  errors.push(
    'audience must be an object describing learner profile/prior knowledge',
  );
}

if (typeof brief.scope !== 'object' || Array.isArray(brief.scope)) {
  errors.push(
    'scope must be an object describing coverage/emphasis/exclusions',
  );
}

if (typeof brief.delivery !== 'object' || Array.isArray(brief.delivery)) {
  errors.push('delivery must be an object');
} else {
  if (brief.delivery.format !== 'source-zip')
    errors.push('delivery.format must be source-zip for this skill version');
  if (brief.delivery.buildOutput !== 'single-html')
    errors.push('delivery.buildOutput must be single-html');
}

if (errors.length) {
  console.error('Course Brief validation failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}

console.log(
  `PASS course brief: ${brief.title} (${brief.timeBudgetMinutes} min budget)`,
);
