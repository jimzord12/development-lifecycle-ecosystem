import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  compileDefinitionSchemas,
  schemaDialect,
} from '../src/validation/schema.js';

const repoDsf = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

describe('DSF schema publication', () => {
  const files = [
    'roadmap.schema.json',
    'milestone.schema.json',
    'phase.schema.json',
    'design-gap.schema.json',
  ];

  it('publishes valid JSON Schema documents under DSF ownership', () => {
    for (const fileName of files) {
      const raw = readFileSync(
        path.join(repoDsf, 'contract/schemas/v2', fileName),
        'utf8',
      );
      const parsed = JSON.parse(raw) as { $schema?: string };
      expect(parsed.$schema).toBe(
        'https://json-schema.org/draft/2020-12/schema',
      );
    }
  });

  it('compiles every published schema with the selected validator', () => {
    expect(() => compileDefinitionSchemas()).not.toThrow();
    expect(schemaDialect()).toBe(
      'https://json-schema.org/draft/2020-12/schema',
    );
  });

  it('is declared by the DSF Public Contract README', () => {
    const readme = readFileSync(path.join(repoDsf, 'README.md'), 'utf8');
    expect(readme).toContain('schemas/v2/roadmap.schema.json');
    expect(readme).toContain('Delivery Definition schema version: **2**');
    expect(readme).not.toMatch(/schemas are not published/i);
  });
});
