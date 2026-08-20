import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '../src/error-codes.js';
import { commitCliOwnedState, persistAtomically } from '../src/persist.js';

describe('atomic CLI-owned persistence', () => {
  it('replaces the target file completely on success', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'delivery-cli-'));
    const target = path.join(directory, 'state.json');
    await writeFile(target, 'old', 'utf8');
    await persistAtomically(target, 'new');
    expect(await readFile(target, 'utf8')).toBe('new');
  });

  it('leaves previous semantic state unchanged when proposed-state validation fails', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'delivery-cli-'));
    const target = path.join(directory, 'state.json');
    await writeFile(target, 'old', 'utf8');

    const result = await commitCliOwnedState({
      path: target,
      proposed: 'new',
      validateProposed: () => ({
        ok: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: 'proposed state is invalid',
        },
      }),
    });

    expect(result.ok).toBe(false);
    expect(await readFile(target, 'utf8')).toBe('old');
  });

  it('commits proposed state only after validation succeeds', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'delivery-cli-'));
    const target = path.join(directory, 'state.json');
    await writeFile(target, 'old', 'utf8');

    const result = await commitCliOwnedState({
      path: target,
      proposed: 'new',
      validateProposed: () => ({ ok: true }),
    });

    expect(result.ok).toBe(true);
    expect(await readFile(target, 'utf8')).toBe('new');
  });
});
