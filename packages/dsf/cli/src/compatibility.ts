import { ERROR_CODES } from './error-codes.js';
import type { CliError } from './envelope.js';

export type WriteTarget = {
  definitionSchemaVersion?: string;
  cliStateSchemaVersion?: string;
};

export function assertWriteCompatibility(target: WriteTarget): {
  ok: false;
  error: CliError;
} {
  const details: Record<string, unknown> = {};
  if (target.definitionSchemaVersion !== undefined) {
    details['definitionSchemaVersion'] = target.definitionSchemaVersion;
  }
  if (target.cliStateSchemaVersion !== undefined) {
    details['cliStateSchemaVersion'] = target.cliStateSchemaVersion;
  }

  const error: CliError = {
    code: ERROR_CODES.COMPATIBILITY_UNSUPPORTED,
    message:
      'No Delivery write semantics are implemented in this bootstrap release. Unsupported target versions fail closed before mutation.',
  };
  if (Object.keys(details).length > 0) {
    error.details = details;
  }

  return { ok: false, error };
}
