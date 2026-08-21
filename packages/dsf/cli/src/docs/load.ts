import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCatalog, type TopicCatalog } from './catalog.js';
import {
  queryCatalog,
  type DocsRequest,
  type DocsQueryResult,
} from './query.js';

export function resolveDocsDirectory(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const bundled = join(moduleDir, 'topics');
  if (existsSync(join(bundled, 'topics.json'))) {
    return bundled;
  }

  const fromSource = join(moduleDir, '..', '..', 'docs', 'topics');
  if (existsSync(join(fromSource, 'topics.json'))) {
    return fromSource;
  }

  throw new Error(
    'Delivery CLI documentation topics are not available to this CLI build.',
  );
}

export function loadTopicBody(directory: string, file: string): string {
  return readFileSync(join(directory, file), 'utf8');
}

export function runDocs(request: DocsRequest): DocsQueryResult {
  const directory = resolveDocsDirectory();
  const catalog = JSON.parse(
    readFileSync(join(directory, 'topics.json'), 'utf8'),
  ) as TopicCatalog;
  const files = new Set(readdirSync(directory));
  const errors = validateCatalog(catalog, files);
  if (errors[0] !== undefined) {
    throw new Error(`Invalid documentation catalog: ${errors[0].message}`);
  }
  return queryCatalog(catalog.topics, request, (file) =>
    loadTopicBody(directory, file),
  );
}
