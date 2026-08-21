import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '../docs/topics');
const destination = join(here, '../dist/docs/topics');

mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });
