import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '../src/error-codes.js';
import {
  CLI_NAME,
  CLI_VERSION,
  COMPONENT_ID,
  COMPONENT_VERSION,
  DLE_CLI_STANDARD,
} from '../src/identity.js';
import { parseEnvelope, run } from './helpers.js';

const here = path.dirname(fileURLToPath(import.meta.url));

describe('compiled identity and catalogues', () => {
  it('keeps package, manifest, and compiled identity aligned', () => {
    const pkg = JSON.parse(
      readFileSync(path.join(here, '../package.json'), 'utf8'),
    ) as {
      version: string;
      bin: { delivery: string };
    };
    const manifest = JSON.parse(
      readFileSync(path.join(here, '../../dle-component.json'), 'utf8'),
    ) as {
      id: string;
      version: string;
      cli: { name: string; version: string };
    };

    expect(pkg.bin.delivery).toBe('./dist/bin.js');
    expect(pkg.version).toBe(CLI_VERSION);
    expect(manifest.id).toBe(COMPONENT_ID);
    expect(manifest.version).toBe(COMPONENT_VERSION);
    expect(manifest.cli.name).toBe(CLI_NAME);
    expect(manifest.cli.version).toBe(CLI_VERSION);
    expect(DLE_CLI_STANDARD).toBe(1);
  });

  it('keeps the error-code catalogue in sync with the implementation', () => {
    const catalogue = JSON.parse(
      readFileSync(path.join(here, '../contract/error-codes.json'), 'utf8'),
    ) as Record<string, string>;
    expect(Object.keys(catalogue).sort()).toEqual(
      Object.values(ERROR_CODES).sort(),
    );
  });

  it('matches the checked-in version example fixture', () => {
    const example = JSON.parse(
      readFileSync(
        path.join(here, '../contract/examples/version-success.json'),
        'utf8',
      ),
    ) as unknown;
    const result = run(['--version', '--json']);
    expect(parseEnvelope(result.stdout)).toEqual(example);
  });

  it('matches the checked-in docs example fixtures', () => {
    const cases: Array<{ file: string; argv: string[] }> = [
      { file: 'docs-index-success.json', argv: ['docs', '--json'] },
      {
        file: 'docs-topic-success.json',
        argv: ['docs', 'validation', '--json'],
      },
      {
        file: 'docs-all-success.json',
        argv: ['docs', 'validation', '--all', '--json'],
      },
      {
        file: 'docs-topic-not-found.json',
        argv: ['docs', 'does.not.exist', '--json'],
      },
    ];
    for (const item of cases) {
      const example = JSON.parse(
        readFileSync(
          path.join(here, '../contract/examples', item.file),
          'utf8',
        ),
      ) as unknown;
      expect(parseEnvelope(run(item.argv).stdout)).toEqual(example);
    }
  });
});
