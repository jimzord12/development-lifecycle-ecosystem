import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const cliRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = path.join(cliRoot, 'fixtures/valid-minimal');

describe('packaged CLI validation', () => {
  it('validates using bundled schemas without the monorepo contract tree', () => {
    execFileSync('pnpm', ['exec', 'tsc', '-p', 'tsconfig.json'], {
      cwd: cliRoot,
      shell: true,
    });
    execFileSync(
      process.execPath,
      [path.join(cliRoot, 'scripts/copy-schemas.mjs')],
      {
        cwd: cliRoot,
      },
    );

    expect(
      existsSync(path.join(cliRoot, 'dist/schemas/v2/roadmap.schema.json')),
    ).toBe(true);

    const packDir = mkdtempSync(path.join(os.tmpdir(), 'delivery-pack-'));
    cpSync(path.join(cliRoot, 'dist'), path.join(packDir, 'dist'), {
      recursive: true,
    });
    writeFileSync(
      path.join(packDir, 'package.json'),
      JSON.stringify({
        name: 'delivery-pack-test',
        type: 'module',
        dependencies: { ajv: '8.17.1' },
      }),
    );
    execFileSync('pnpm', ['install', '--ignore-workspace'], {
      cwd: packDir,
      shell: true,
    });

    const projectDir = path.join(packDir, 'project');
    mkdirSync(projectDir, { recursive: true });
    cpSync(path.join(fixture, 'delivery'), path.join(projectDir, 'delivery'), {
      recursive: true,
    });

    const stdout = execFileSync(
      process.execPath,
      [path.join(packDir, 'dist/bin.js'), 'validate', '--json'],
      {
        cwd: projectDir,
        encoding: 'utf8',
      },
    );

    const envelope = JSON.parse(stdout) as {
      ok: boolean;
      result?: { valid?: boolean };
    };
    expect(envelope.ok).toBe(true);
    expect(envelope.result?.valid).toBe(true);
    expect(existsSync(path.join(packDir, 'contract'))).toBe(false);
  });
});
