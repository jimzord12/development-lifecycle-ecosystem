import { describe, expect, it } from 'vitest';

import { assertWriteCompatibility } from '../src/compatibility.js';
import { ERROR_CODES } from '../src/error-codes.js';

describe('write compatibility', () => {
  it('fails closed before mutation for unsupported target versions', () => {
    const result = assertWriteCompatibility({
      definitionSchemaVersion: '1',
      cliStateSchemaVersion: '1',
    });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe(ERROR_CODES.COMPATIBILITY_UNSUPPORTED);
    expect(result.error.details).toEqual({
      definitionSchemaVersion: '1',
      cliStateSchemaVersion: '1',
    });
  });
});
