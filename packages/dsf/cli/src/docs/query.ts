import { parentTopicId, sortTopics, type CatalogTopic } from './catalog.js';

export type DocsRequest = {
  mode: 'index' | 'topic' | 'all';
  topic?: string;
};

export type IndexEntry = {
  id: string;
  title: string;
  summary?: string;
};

export type DocsQueryResult =
  | {
      ok: true;
      mode: 'index';
      scope: string | null;
      topics: IndexEntry[];
    }
  | {
      ok: true;
      mode: 'topic';
      topic: {
        id: string;
        title: string;
        content: string;
        children: IndexEntry[];
      };
    }
  | {
      ok: true;
      mode: 'all';
      scope: string | null;
      topics: Array<{ id: string; title: string; content: string }>;
    }
  | {
      ok: false;
      code: 'DOCS_TOPIC_NOT_FOUND';
      message: string;
      details: { topic: string; suggestions?: string[] };
    };

export function queryCatalog(
  topics: readonly CatalogTopic[],
  request: DocsRequest,
  loadBody: (file: string) => string,
): DocsQueryResult {
  const ordered = sortTopics(topics);
  const byId = new Map(ordered.map((topic) => [topic.id, topic]));
  const scope = request.topic;
  if (scope !== undefined && !byId.has(scope)) {
    return topicNotFound(scope, ordered);
  }

  if (request.mode === 'index') {
    return {
      ok: true,
      mode: 'index',
      scope: scope ?? null,
      topics: scopedTopics(ordered, scope).map(toIndexEntry),
    };
  }

  if (request.mode === 'topic') {
    if (scope === undefined) {
      throw new Error('docs topic mode requires a topic id');
    }
    const selected = byId.get(scope);
    if (selected === undefined) {
      return topicNotFound(scope, ordered);
    }
    return {
      ok: true,
      mode: 'topic',
      topic: {
        id: selected.id,
        title: selected.title,
        content: loadBody(selected.file),
        children: immediateChildren(ordered, selected.id).map(toIndexEntry),
      },
    };
  }

  return {
    ok: true,
    mode: 'all',
    scope: scope ?? null,
    topics: scopedTopics(ordered, scope).map((topic) => ({
      id: topic.id,
      title: topic.title,
      content: loadBody(topic.file),
    })),
  };
}

function scopedTopics(
  ordered: readonly CatalogTopic[],
  scope: string | undefined,
): CatalogTopic[] {
  if (scope === undefined) {
    return [...ordered];
  }
  return ordered.filter(
    (topic) => topic.id === scope || topic.id.startsWith(`${scope}.`),
  );
}

function immediateChildren(
  ordered: readonly CatalogTopic[],
  parentId: string,
): CatalogTopic[] {
  const prefix = `${parentId}.`;
  return ordered.filter((topic) => {
    if (!topic.id.startsWith(prefix)) {
      return false;
    }
    return parentTopicId(topic.id) === parentId;
  });
}

function toIndexEntry(topic: CatalogTopic): IndexEntry {
  const entry: IndexEntry = { id: topic.id, title: topic.title };
  if (topic.summary !== undefined) {
    entry.summary = topic.summary;
  }
  return entry;
}

function topicNotFound(
  topic: string,
  ordered: readonly CatalogTopic[],
): Extract<DocsQueryResult, { ok: false }> {
  const details: { topic: string; suggestions?: string[] } = { topic };
  const suggestions = suggestTopics(
    topic,
    ordered.map((item) => item.id),
  );
  if (suggestions.length > 0) {
    details.suggestions = suggestions;
  }
  return {
    ok: false,
    code: 'DOCS_TOPIC_NOT_FOUND',
    message: `Documentation topic not found: ${topic}`,
    details,
  };
}

function suggestTopics(requested: string, ids: readonly string[]): string[] {
  const root = requested.split('.')[0];
  if (root === undefined) {
    return [];
  }
  return ids.filter((id) => id === root || id.startsWith(`${root}.`));
}
