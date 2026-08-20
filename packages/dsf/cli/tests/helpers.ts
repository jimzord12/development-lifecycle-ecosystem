import { expect } from 'vitest';

import { runCli, type RunCliOptions, type RunCliResult } from '../src/cli.js';

export function run(
  argv: readonly string[],
  options?: RunCliOptions,
): RunCliResult {
  return runCli(argv, options);
}

export function parseEnvelope(stdout: string): {
  ok: boolean;
  command: string;
  result?: Record<string, unknown>;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  warnings: unknown[];
} {
  expect(stdout.startsWith('\uFEFF')).toBe(false);
  expect(stdout.endsWith('\n')).toBe(true);
  expect(stdout.includes('\u001b[')).toBe(false);
  expect(stdout).not.toMatch(/spinner|please wait/i);
  return JSON.parse(stdout) as {
    ok: boolean;
    command: string;
    result?: Record<string, unknown>;
    error?: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
    warnings: unknown[];
  };
}
