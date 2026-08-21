import { parentTopicId } from './catalog.js';
import type { IndexEntry } from './query.js';

export function renderIndexHuman(topics: readonly IndexEntry[]): string {
  const ids = new Set(topics.map((topic) => topic.id));
  const lines: string[] = [];
  for (const topic of topics) {
    const indent = '  '.repeat(ancestorDepth(topic.id, ids));
    lines.push(`${indent}${topic.id}`);
    if (topic.summary !== undefined) {
      lines.push(`${indent}  ${topic.summary}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

export function renderTopicHuman(topic: {
  content: string;
  children: readonly IndexEntry[];
}): string {
  const body = topic.content.trimEnd();
  if (topic.children.length === 0) {
    return `${body}\n`;
  }
  const childLines = topic.children.flatMap((child) => {
    const lines = [`  ${child.id}`];
    if (child.summary !== undefined) {
      lines.push(`    ${child.summary}`);
    }
    return lines;
  });
  return `${body}\n\nImmediate children:\n${childLines.join('\n')}\n`;
}

export function renderAllHuman(
  topics: ReadonlyArray<{ content: string }>,
): string {
  return `${topics.map((topic) => topic.content.trimEnd()).join('\n\n')}\n`;
}

function ancestorDepth(id: string, ids: ReadonlySet<string>): number {
  let depth = 0;
  let parent = parentTopicId(id);
  while (parent !== undefined && ids.has(parent)) {
    depth += 1;
    parent = parentTopicId(parent);
  }
  return depth;
}
