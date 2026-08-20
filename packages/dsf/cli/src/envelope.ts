import type { ErrorCode } from './error-codes.js';
import { redactSecrets } from './redact.js';

export type Warning = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type CliError = {
  code: ErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
};

export type SuccessEnvelope = {
  ok: true;
  command: string;
  result: Record<string, unknown>;
  warnings: Warning[];
};

export type FailureEnvelope = {
  ok: false;
  command: string;
  error: CliError;
  warnings: Warning[];
};

export type Envelope = SuccessEnvelope | FailureEnvelope;

export type RunCliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export function successEnvelope(
  command: string,
  result: Record<string, unknown>,
  warnings: Warning[] = [],
): SuccessEnvelope {
  return { ok: true, command, result, warnings };
}

export function failureEnvelope(
  command: string,
  error: CliError,
  warnings: Warning[] = [],
): FailureEnvelope {
  return { ok: false, command, error, warnings };
}

export function renderOutput(
  envelope: Envelope,
  options: { json: boolean; humanText?: string },
): RunCliResult {
  const safe = redactSecrets(envelope);

  if (options.json) {
    return {
      exitCode: safe.ok ? 0 : 1,
      stdout: `${JSON.stringify(safe)}\n`,
      stderr: '',
    };
  }

  if (safe.ok) {
    const text = options.humanText ?? '';
    return {
      exitCode: 0,
      stdout: text.endsWith('\n') || text.length === 0 ? text : `${text}\n`,
      stderr: '',
    };
  }

  return {
    exitCode: 1,
    stdout: '',
    stderr: `delivery: ${safe.error.code}: ${safe.error.message}\n`,
  };
}
