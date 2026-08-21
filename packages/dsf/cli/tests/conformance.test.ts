import os from 'node:os';

import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '../src/error-codes.js';
import {
  failureEnvelope,
  renderOutput,
  successEnvelope,
} from '../src/envelope.js';
import { parseEnvelope, run } from './helpers.js';

describe('DLE CLI Standard V1 conformance', () => {
  it('prints top-level help on stdout and exits 0', () => {
    const result = run(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('USAGE');
    expect(result.stdout).toContain('EXAMPLES');
    expect(result.stdout).toContain('--json');
    expect(result.stdout).toContain('validate');
    expect(result.stdout).toContain('docs');
    expect(result.stdout).toContain('SIDE EFFECTS');
  });

  it('accepts -h as a help alias', () => {
    const result = run(['-h']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('USAGE');
  });

  it('prints command help for validate, including inputs, defaults, side effects, and examples', () => {
    const result = run(['validate', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('USAGE');
    expect(result.stdout).toContain('ARGUMENTS');
    expect(result.stdout).toContain('DEFAULTS');
    expect(result.stdout).toContain('SIDE EFFECTS');
    expect(result.stdout).toContain('EXAMPLES');
    expect(result.stdout).toMatch(/None\. validate never repairs/i);
  });

  it('fails deterministically with no command and does not prompt', () => {
    const result = run([]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain(ERROR_CODES.MISSING_COMMAND);
    expect(result.stderr).not.toMatch(/\?$/);
  });

  it('emits a JSON failure envelope on stdout for a missing command', () => {
    const result = run(['--json']);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toBe('');
    const envelope = parseEnvelope(result.stdout);
    expect(envelope.ok).toBe(false);
    expect(envelope.error?.code).toBe(ERROR_CODES.MISSING_COMMAND);
  });

  it('never waits on stdin', () => {
    const result = run(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  });

  it('emits JSON help as a single success envelope', () => {
    const result = run(['--help', '--json']);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    const envelope = parseEnvelope(result.stdout);
    expect(envelope.ok).toBe(true);
    expect(envelope.command).toBe('help');
    expect(envelope.warnings).toEqual([]);
  });

  it('emits --version on stdout in human mode', () => {
    const result = run(['--version']);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('delivery 0.1.0');
    expect(result.stdout).toContain('component: dsf 1.1.1');
    expect(result.stdout).toContain('dleCliStandard: 1');
  });

  it('emits --version --json with CLI, component, and dleCliStandard identity', () => {
    const result = run(['--version', '--json']);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    const envelope = parseEnvelope(result.stdout);
    expect(envelope).toEqual({
      ok: true,
      command: 'version',
      result: {
        cli: { name: 'delivery', version: '0.1.0' },
        component: { id: 'dsf', version: '1.1.1' },
        dleCliStandard: 1,
      },
      warnings: [],
    });
    expect(typeof envelope.result?.['dleCliStandard']).toBe('number');
  });

  it('keeps JSON machine values locale-independent', () => {
    const previousLang = process.env['LANG'];
    const previousLcAll = process.env['LC_ALL'];
    process.env['LANG'] = 'de_DE.UTF-8';
    process.env['LC_ALL'] = 'de_DE.UTF-8';
    try {
      const result = run(['--version', '--json']);
      const envelope = parseEnvelope(result.stdout);
      expect(envelope.result?.['dleCliStandard']).toBe(1);
      expect(result.stdout).not.toContain('1,0');
    } finally {
      if (previousLang === undefined) {
        delete process.env['LANG'];
      } else {
        process.env['LANG'] = previousLang;
      }
      if (previousLcAll === undefined) {
        delete process.env['LC_ALL'];
      } else {
        process.env['LC_ALL'] = previousLcAll;
      }
    }
  });

  it('sends human validate errors to stderr and writes nothing', () => {
    const result = run(['validate'], { cwd: os.tmpdir() });
    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain(ERROR_CODES.VALIDATION_FAILED);
  });

  it('emits JSON validate failure on stdout with a non-zero exit', () => {
    const result = run(['validate', '--json'], { cwd: os.tmpdir() });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toBe('');
    const envelope = parseEnvelope(result.stdout);
    expect(envelope.ok).toBe(false);
    expect(envelope.command).toBe('validate');
    expect(envelope.error?.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    expect(envelope.error?.message).toEqual(expect.any(String));
    expect(envelope.warnings).toEqual([]);
  });

  it('does not guess typos for unknown commands', () => {
    const result = run(['validat', '--json']);
    expect(result.exitCode).not.toBe(0);
    const envelope = parseEnvelope(result.stdout);
    expect(envelope.error?.code).toBe(ERROR_CODES.UNKNOWN_COMMAND);
    expect(result.stdout.toLowerCase()).not.toContain('did you mean');
  });

  it('rejects unknown options even when --help is present', () => {
    const result = run(['--help', '--verbose', '--json']);
    expect(result.exitCode).not.toBe(0);
    const envelope = parseEnvelope(result.stdout);
    expect(envelope.error?.code).toBe(ERROR_CODES.UNKNOWN_OPTION);
  });

  it('rejects --version combined with a command', () => {
    const result = run(['validate', '--version', '--json']);
    expect(result.exitCode).not.toBe(0);
    expect(parseEnvelope(result.stdout).error?.code).toBe(
      ERROR_CODES.INVALID_INVOCATION,
    );
  });

  it('rejects unexpected validate arguments', () => {
    const result = run(['validate', 'extra', '--json']);
    expect(result.exitCode).not.toBe(0);
    expect(parseEnvelope(result.stdout).error?.code).toBe(
      ERROR_CODES.INVALID_INVOCATION,
    );
  });

  it('does not change process.cwd when a runner cwd option is supplied', () => {
    const before = process.cwd();
    const result = run(['--version'], { cwd: os.tmpdir() });
    expect(result.exitCode).toBe(0);
    expect(process.cwd()).toBe(before);
  });

  it('does not decorate JSON output even when the runner claims a TTY', () => {
    const result = run(['--version', '--json'], {
      stdoutIsTty: true,
      stderrIsTty: true,
    });
    expect(result.stdout.includes('\u001b[')).toBe(false);
    expect(result.stderr).toBe('');
  });

  it('keeps warnings structured and does not fail the command for warnings alone', () => {
    const envelope = successEnvelope('version', { okish: true }, [
      { code: 'EXAMPLE_WARNING', message: 'not fatal' },
    ]);
    const rendered = renderOutput(envelope, { json: true });
    expect(rendered.exitCode).toBe(0);
    const parsed = parseEnvelope(rendered.stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.warnings).toEqual([
      { code: 'EXAMPLE_WARNING', message: 'not fatal' },
    ]);
  });

  it('uses error.code rather than message text as the stable identity', () => {
    const envelope = failureEnvelope('validate', {
      code: ERROR_CODES.VALIDATION_FAILED,
      message: 'this prose may change',
    });
    const rendered = renderOutput(envelope, { json: true });
    const parsed = parseEnvelope(rendered.stdout);
    expect(parsed.error?.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    expect(parsed.error?.message).toBe('this prose may change');
  });
});
