import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveSchemaDirectory(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const bundled = join(moduleDir, '..', 'schemas', 'v2');
  if (existsSync(join(bundled, 'roadmap.schema.json'))) {
    return bundled;
  }

  const fromSource = join(
    moduleDir,
    '..',
    '..',
    '..',
    'contract',
    'schemas',
    'v2',
  );
  if (existsSync(join(fromSource, 'roadmap.schema.json'))) {
    return fromSource;
  }

  throw new Error(
    'DSF Delivery Definition schema v2 files are not available to this CLI build.',
  );
}
