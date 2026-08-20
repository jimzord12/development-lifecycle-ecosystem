import { resolve } from 'node:path';

export function resolveAgainstCwd(inputPath: string, cwd: string): string {
  return resolve(cwd, inputPath);
}
