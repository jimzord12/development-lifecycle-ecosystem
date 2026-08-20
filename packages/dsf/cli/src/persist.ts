import { randomBytes } from 'node:crypto';
import { unlink, writeFile, rename } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import type { CliError } from './envelope.js';

export async function persistAtomically(
  targetPath: string,
  contents: string,
): Promise<void> {
  const directory = dirname(targetPath);
  const tempPath = join(
    directory,
    `.${basename(targetPath)}.${randomBytes(8).toString('hex')}.tmp`,
  );

  await writeFile(tempPath, contents, { encoding: 'utf8' });

  try {
    await renameReplace(tempPath, targetPath);
  } catch (error) {
    await unlink(tempPath).catch(() => undefined);
    throw error;
  }
}

async function renameReplace(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  try {
    await rename(sourcePath, destinationPath);
    return;
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : undefined;
    if (code !== 'EPERM' && code !== 'EEXIST') {
      throw error;
    }
  }

  const backupPath = `${destinationPath}.${randomBytes(4).toString('hex')}.bak`;
  await rename(destinationPath, backupPath);
  try {
    await rename(sourcePath, destinationPath);
  } catch (error) {
    await rename(backupPath, destinationPath).catch(() => undefined);
    throw error;
  }
  await unlink(backupPath);
}

export async function commitCliOwnedState(options: {
  path: string;
  proposed: string;
  validateProposed: (
    proposed: string,
  ) => { ok: true } | { ok: false; error: CliError };
}): Promise<{ ok: true } | { ok: false; error: CliError }> {
  const validated = options.validateProposed(options.proposed);
  if (!validated.ok) {
    return validated;
  }

  await persistAtomically(options.path, options.proposed);
  return { ok: true };
}
