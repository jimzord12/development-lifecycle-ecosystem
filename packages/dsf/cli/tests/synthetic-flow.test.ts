import { mkdtemp, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '../src/error-codes.js';
import { parseEnvelope, run } from './helpers.js';

const fixtureDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/synthetic-p001-p002',
);

const DOMAIN_COMMANDS = [
  'status',
  'init',
  'phase',
  'milestone',
  'blocker',
  'design-gap',
  'baseline',
  'schema',
];

describe('synthetic P-001 → DG-001 → P-002 flow', () => {
  it('does not stub domain commands as successful engines', () => {
    for (const command of DOMAIN_COMMANDS) {
      const result = run([command, '--json']);
      expect(result.exitCode).not.toBe(0);
      expect(parseEnvelope(result.stdout).error?.code).toBe(
        ERROR_CODES.UNKNOWN_COMMAND,
      );
    }
  });

  it('keeps validate read-only against the synthetic fixture directory', async () => {
    const before = await snapshot(fixtureDirectory);
    const result = run(['validate', '--json']);
    expect(result.exitCode).not.toBe(0);
    expect(parseEnvelope(result.stdout).error?.code).toBe(
      ERROR_CODES.DELIVERY_ENGINE_NOT_IMPLEMENTED,
    );
    expect(await snapshot(fixtureDirectory)).toEqual(before);
  });

  it('does not mutate a workspace when validate fails closed', async () => {
    const directory = await mkdtemp(
      path.join(os.tmpdir(), 'delivery-validate-'),
    );
    const marker = path.join(directory, 'marker.json');
    await writeFile(marker, '{"ok":true}', 'utf8');
    const before = await readFile(marker, 'utf8');
    run(['validate'], { cwd: directory });
    expect(await readFile(marker, 'utf8')).toBe(before);
    expect(await readdir(directory)).toEqual(['marker.json']);
  });

  it.todo('P-001 prepare/start under current baseline');
  it.todo('DG-001 discovered without CLI inventing a design answer');
  it.todo('canonical resolution changes baseline-participating truth');
  it.todo('current baseline reconciliation and acknowledgement');
  it.todo('submission candidate is frozen and remains immutable');
  it.todo('phase acceptance/completion');
  it.todo('downstream P-002 readiness reconciles');
});

async function snapshot(directory: string): Promise<Record<string, string>> {
  const entries = await readdir(directory);
  const out: Record<string, string> = {};
  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isFile()) {
      out[entry] = await readFile(fullPath, 'utf8');
    }
  }
  return out;
}
