import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const cliRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('packaged CLI docs', () => {
  it(
    'retrieves packaged topics without the monorepo docs tree',
    { timeout: 20_000 },
    () => {
      execFileSync('pnpm', ['exec', 'tsc', '-p', 'tsconfig.json'], {
        cwd: cliRoot,
        shell: true,
      });
      execFileSync(
        process.execPath,
        [path.join(cliRoot, 'scripts/copy-docs.mjs')],
        {
          cwd: cliRoot,
        },
      );

      expect(
        existsSync(path.join(cliRoot, 'dist/docs/topics/topics.json')),
      ).toBe(true);
      expect(
        existsSync(path.join(cliRoot, 'dist/docs/topics/validation.md')),
      ).toBe(true);

      const packDir = mkdtempSync(
        path.join(os.tmpdir(), 'delivery-docs-pack-'),
      );
      cpSync(path.join(cliRoot, 'dist'), path.join(packDir, 'dist'), {
        recursive: true,
      });
      writeFileSync(
        path.join(packDir, 'package.json'),
        JSON.stringify({
          name: 'delivery-docs-pack-test',
          type: 'module',
          dependencies: { ajv: '8.17.1' },
        }),
      );
      execFileSync('pnpm', ['install', '--ignore-workspace'], {
        cwd: packDir,
        shell: true,
      });

      const projectDir = mkdtempSync(
        path.join(os.tmpdir(), 'delivery-docs-cwd-'),
      );
      const stdout = execFileSync(
        process.execPath,
        [path.join(packDir, 'dist/bin.js'), 'docs', 'validation', '--json'],
        {
          cwd: projectDir,
          encoding: 'utf8',
        },
      );

      const envelope = JSON.parse(stdout) as {
        ok: boolean;
        command: string;
        result?: {
          mode?: string;
          topic?: { id?: string; content?: string };
        };
      };
      expect(envelope.ok).toBe(true);
      expect(envelope.command).toBe('docs');
      expect(envelope.result?.mode).toBe('topic');
      expect(envelope.result?.topic?.id).toBe('validation');
      expect(envelope.result?.topic?.content).toContain(
        'validate does not mean ready to start',
      );
      expect(existsSync(path.join(packDir, 'docs'))).toBe(false);
      expect(existsSync(path.join(packDir, 'packages'))).toBe(false);
    },
  );
});
