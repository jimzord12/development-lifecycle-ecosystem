import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveAgainstCwd } from '../src/paths.js';

describe('relative path resolution', () => {
  it('resolves relative paths against the provided process CWD', () => {
    const cwd = path.resolve('/tmp', 'delivery-project');
    expect(resolveAgainstCwd('roadmap.json', cwd)).toBe(
      path.resolve(cwd, 'roadmap.json'),
    );
  });

  it('keeps absolute paths absolute', () => {
    const absolute = path.resolve('/var', 'delivery', 'roadmap.json');
    expect(resolveAgainstCwd(absolute, path.resolve('/tmp'))).toBe(absolute);
  });
});
