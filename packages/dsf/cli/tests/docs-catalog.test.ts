import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { validateCatalog, type TopicCatalog } from '../src/docs/catalog.js';
import { queryCatalog } from '../src/docs/query.js';

const topicsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../docs/topics',
);

const validCatalog: TopicCatalog = {
  catalogVersion: 1,
  topics: [
    { id: 'root', title: 'Root', file: 'root.md', order: 10 },
    {
      id: 'root.child',
      title: 'Child',
      file: 'root.child.md',
      order: 20,
      summary: 'Choose this when the title is not enough.',
    },
    {
      id: 'root.child.leaf',
      title: 'Leaf',
      file: 'root.child.leaf.md',
      order: 30,
    },
    { id: 'other', title: 'Other', file: 'other.md', order: 40 },
  ],
};

const files = new Set(validCatalog.topics.map((topic) => topic.file));

function clone(
  catalog: TopicCatalog,
  mutate: (topics: TopicCatalog['topics']) => void,
): TopicCatalog {
  const copy: TopicCatalog = {
    catalogVersion: catalog.catalogVersion,
    topics: catalog.topics.map((topic) => ({ ...topic })),
  };
  mutate(copy.topics);
  return copy;
}

describe('docs catalog integrity', () => {
  it('accepts the Delivery CLI packaged catalog', () => {
    const catalog = JSON.parse(
      readFileSync(path.join(topicsDir, 'topics.json'), 'utf8'),
    ) as TopicCatalog;
    const existing = new Set(readdirSync(topicsDir));
    expect(validateCatalog(catalog, existing)).toEqual([]);
    expect(catalog.topics.map((topic) => topic.id)).toEqual([
      'overview',
      'definition',
      'definition.roadmap',
      'definition.milestone',
      'definition.milestone.review',
      'definition.phase',
      'definition.design-gap',
      'validation',
      'validation.schema',
      'validation.graph',
      'compatibility',
      'tracking',
      'authority',
    ]);
  });

  it('accepts a well-formed catalog', () => {
    expect(validateCatalog(validCatalog, files)).toEqual([]);
  });

  it('rejects duplicate topic IDs', () => {
    const catalog = clone(validCatalog, (topics) => {
      topics[3] = { ...topics[3]!, id: 'root', order: 50 };
    });
    expect(
      validateCatalog(catalog, files).some((error) =>
        error.message.includes('duplicate'),
      ),
    ).toBe(true);
  });

  it('rejects IDs that violate the grammar', () => {
    const catalog = clone(validCatalog, (topics) => {
      topics[3] = { ...topics[3]!, id: 'Phase.Start', file: 'phase.md' };
    });
    const errors = validateCatalog(catalog, new Set([...files, 'phase.md']));
    expect(errors.some((error) => error.message.includes('grammar'))).toBe(
      true,
    );
  });

  it('rejects a declared file that is missing', () => {
    const errors = validateCatalog(validCatalog, new Set(['root.md']));
    expect(errors.some((error) => error.message.includes('missing'))).toBe(
      true,
    );
  });

  it('rejects multi-line summaries', () => {
    const catalog = clone(validCatalog, (topics) => {
      topics[1] = {
        ...topics[1]!,
        summary: 'first line\nsecond line',
      };
    });
    expect(
      validateCatalog(catalog, files).some((error) =>
        error.message.includes('summary'),
      ),
    ).toBe(true);
  });

  it('rejects duplicate order values', () => {
    const catalog = clone(validCatalog, (topics) => {
      topics[3] = { ...topics[3]!, order: 10 };
    });
    expect(
      validateCatalog(catalog, files).some((error) =>
        error.message.includes('order'),
      ),
    ).toBe(true);
  });

  it('rejects a child whose parent is not addressable', () => {
    const catalog: TopicCatalog = {
      catalogVersion: 1,
      topics: [
        {
          id: 'orphan.child',
          title: 'Orphan',
          file: 'orphan.child.md',
          order: 1,
        },
      ],
    };
    expect(
      validateCatalog(catalog, new Set(['orphan.child.md'])).some((error) =>
        error.message.includes('parent'),
      ),
    ).toBe(true);
  });
});

describe('docs query selection', () => {
  const bodies: Record<string, string> = {
    'root.md': '# Root body',
    'root.child.md': '# Child body',
    'root.child.leaf.md': '# Leaf body',
    'other.md': '# Other body',
  };

  function loadBody(file: string): string {
    const body = bodies[file];
    if (body === undefined) {
      throw new Error(`unexpected body load: ${file}`);
    }
    return body;
  }

  it('does not load markdown bodies in index mode', () => {
    const result = queryCatalog(validCatalog.topics, { mode: 'index' }, () => {
      throw new Error('index mode must not load topic bodies');
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mode).toBe('index');
      expect(result.scope).toBeNull();
      expect(result.topics.map((topic) => topic.id)).toEqual([
        'root',
        'root.child',
        'root.child.leaf',
        'other',
      ]);
    }
  });

  it('does not load markdown bodies in scoped index mode', () => {
    const result = queryCatalog(
      validCatalog.topics,
      { mode: 'index', topic: 'root.child' },
      () => {
        throw new Error('scoped index must not load topic bodies');
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok && result.mode === 'index') {
      expect(result.scope).toBe('root.child');
      expect(result.topics.map((topic) => topic.id)).toEqual([
        'root.child',
        'root.child.leaf',
      ]);
    }
  });

  it('loads only the selected topic body and lists immediate children', () => {
    const loaded: string[] = [];
    const result = queryCatalog(
      validCatalog.topics,
      { mode: 'topic', topic: 'root' },
      (file) => {
        loaded.push(file);
        return loadBody(file);
      },
    );
    expect(loaded).toEqual(['root.md']);
    expect(result.ok).toBe(true);
    if (result.ok && result.mode === 'topic') {
      expect(result.topic.content).toBe('# Root body');
      expect(result.topic.children.map((child) => child.id)).toEqual([
        'root.child',
      ]);
    }
  });

  it('loads every descendant body for scoped all, including nested leaves', () => {
    const loaded: string[] = [];
    const result = queryCatalog(
      validCatalog.topics,
      { mode: 'all', topic: 'root' },
      (file) => {
        loaded.push(file);
        return loadBody(file);
      },
    );
    expect(loaded).toEqual(['root.md', 'root.child.md', 'root.child.leaf.md']);
    expect(result.ok).toBe(true);
    if (result.ok && result.mode === 'all') {
      expect(result.topics.map((topic) => topic.id)).toEqual([
        'root',
        'root.child',
        'root.child.leaf',
      ]);
    }
  });
});
