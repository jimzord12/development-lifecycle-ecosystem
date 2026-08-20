import { describe, expect, it } from 'vitest';

import { failureEnvelope, renderOutput } from '../src/envelope.js';
import { redactSecrets } from '../src/redact.js';
import { parseEnvelope, run } from './helpers.js';

describe('secret-output safety', () => {
  it('redacts secret-bearing details from JSON envelopes', () => {
    const envelope = failureEnvelope('validate', {
      code: 'VALIDATION_FAILED',
      message: 'invalid configuration',
      details: {
        apiToken: 'super-secret-token',
        password: 'hunter2',
        privateKey: '-----BEGIN PRIVATE KEY-----',
        path: 'delivery/roadmap.json',
      },
    });
    const rendered = renderOutput(envelope, { json: true });
    expect(rendered.stdout).not.toContain('super-secret-token');
    expect(rendered.stdout).not.toContain('hunter2');
    expect(rendered.stdout).not.toContain('BEGIN PRIVATE KEY');
    const parsed = parseEnvelope(rendered.stdout);
    expect(parsed.error?.details).toEqual({
      apiToken: '[redacted]',
      password: '[redacted]',
      privateKey: '[redacted]',
      path: 'delivery/roadmap.json',
    });
  });

  it('refuses to emit secret environment values', () => {
    expect(() =>
      run(['--version', '--json'], { env: { API_TOKEN: 'leak-me-now' } }),
    ).not.toThrow();
    const result = run(['--version', '--json'], {
      env: { API_TOKEN: 'leak-me-now' },
    });
    expect(result.stdout).not.toContain('leak-me-now');
  });

  it('does not treat --json as a secret-leaking escape hatch', () => {
    const leaked = redactSecrets({
      result: { authorization: 'Bearer abc', nested: { credential: 'xyz' } },
    });
    expect(leaked).toEqual({
      result: {
        authorization: '[redacted]',
        nested: { credential: '[redacted]' },
      },
    });
  });
});
