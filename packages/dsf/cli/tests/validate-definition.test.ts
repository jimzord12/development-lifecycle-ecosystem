import { cpSync } from 'node:fs';
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '../src/error-codes.js';
import { parseEnvelope, run } from './helpers.js';

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures',
);

function validateFixture(name: string) {
  return run(['validate', '--json'], {
    cwd: path.join(fixtures, name),
  });
}

describe('delivery validate', () => {
  it('accepts a schema-valid minimal Definition', () => {
    const result = validateFixture('valid-minimal');
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(parseEnvelope(result.stdout)).toEqual({
      ok: true,
      command: 'validate',
      result: {
        valid: true,
        definitionSchemaVersion: 2,
        counts: { milestones: 1, phases: 1, designGaps: 0 },
      },
      warnings: [],
    });
  });

  it('accepts a multi-milestone Definition', () => {
    const result = validateFixture('valid-multi-milestone');
    expect(result.exitCode).toBe(0);
    const envelope = parseEnvelope(result.stdout);
    expect(envelope.ok).toBe(true);
    expect(envelope.result?.['counts']).toEqual({
      milestones: 2,
      phases: 2,
      designGaps: 0,
    });
  });

  it('fails structurally invalid Definitions with VALIDATION_FAILED', () => {
    const result = validateFixture('invalid-schema');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toBe('');
    const envelope = parseEnvelope(result.stdout);
    expect(envelope.error?.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    const findings = envelope.error?.details?.['findings'] as Array<{
      code: string;
      kind: string;
    }>;
    expect(findings.some((finding) => finding.kind === 'schema')).toBe(true);
  });

  it('fails missing cross-references with VALIDATION_FAILED', () => {
    const result = validateFixture('invalid-missing-reference');
    const envelope = parseEnvelope(result.stdout);
    expect(result.exitCode).not.toBe(0);
    expect(envelope.error?.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    const findings = envelope.error?.details?.['findings'] as Array<{
      code: string;
      message: string;
    }>;
    expect(
      findings.some((finding) => finding.code === 'REFERENCE_NOT_FOUND'),
    ).toBe(true);
    expect(JSON.stringify(findings)).toContain('P-999');
  });

  it('fails duplicate IDs', () => {
    const result = validateFixture('invalid-duplicate-id');
    const findings = (
      parseEnvelope(result.stdout).error?.details?.['findings'] as Array<{
        code: string;
      }>
    ).map((finding) => finding.code);
    expect(findings).toContain('DUPLICATE_ID');
  });

  it('fails prohibited Phase dependency cycles', () => {
    const result = validateFixture('invalid-dependency-cycle');
    const findings = parseEnvelope(result.stdout).error?.details?.[
      'findings'
    ] as Array<{ code: string }>;
    expect(
      findings.some((finding) => finding.code === 'DEPENDENCY_CYCLE'),
    ).toBe(true);
  });

  it('fails unsupported schema versions before mutation', () => {
    const result = validateFixture('unsupported-schema-version');
    expect(result.exitCode).not.toBe(0);
    expect(parseEnvelope(result.stdout).error?.code).toBe(
      ERROR_CODES.COMPATIBILITY_UNSUPPORTED,
    );
  });

  it('leaves Definition files unchanged', async () => {
    const copy = await mkdtemp(path.join(os.tmpdir(), 'delivery-ro-'));
    cpSync(path.join(fixtures, 'valid-minimal'), copy, { recursive: true });
    const before = await readFile(
      path.join(copy, 'delivery/roadmap.json'),
      'utf8',
    );
    const result = run(['validate', '--json'], { cwd: copy });
    expect(result.exitCode).toBe(0);
    expect(
      await readFile(path.join(copy, 'delivery/roadmap.json'), 'utf8'),
    ).toBe(before);
    expect(await readdir(path.join(copy, 'delivery'))).not.toContain('.cli');
  });

  it('emits deterministic finding order', () => {
    const first = validateFixture('invalid-missing-reference');
    const second = validateFixture('invalid-missing-reference');
    expect(first.stdout).toBe(second.stdout);
  });

  it('sends human success to stdout and human failure to stderr', () => {
    const success = run(['validate'], {
      cwd: path.join(fixtures, 'valid-minimal'),
    });
    expect(success.exitCode).toBe(0);
    expect(success.stderr).toBe('');
    expect(success.stdout).toContain('Delivery Definition is valid');

    const failure = run(['validate'], {
      cwd: path.join(fixtures, 'invalid-schema'),
    });
    expect(failure.exitCode).not.toBe(0);
    expect(failure.stdout).toBe('');
    expect(failure.stderr).toContain(ERROR_CODES.VALIDATION_FAILED);
  });

  it('does not write when the working directory has no delivery/', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'delivery-none-'));
    await writeFile(path.join(directory, 'marker.json'), '{"ok":true}', 'utf8');
    const result = run(['validate', '--json'], { cwd: directory });
    expect(result.exitCode).not.toBe(0);
    expect(parseEnvelope(result.stdout).error?.code).toBe(
      ERROR_CODES.VALIDATION_FAILED,
    );
    expect(await readFile(path.join(directory, 'marker.json'), 'utf8')).toBe(
      '{"ok":true}',
    );
    expect(await readdir(directory)).toEqual(['marker.json']);
  });
});
