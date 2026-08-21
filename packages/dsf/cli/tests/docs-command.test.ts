import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { ERROR_CODES } from '../src/error-codes.js';
import { parseEnvelope, run } from './helpers.js';

const PHRASES = {
  overview: 'optional companion CLI owned by DSF',
  definition: 'declarative project truth under delivery/',
  roadmap: 'Roadmap artifact is delivery/roadmap.json',
  milestone: 'Milestone identifiers match M-',
  milestoneReview:
    'Every Milestone implies one derived first-class Review node',
  phase: 'Phase identifiers match P-',
  designGap: 'Design Gaps remain human/design-authority decisions',
  validation: 'validate does not mean ready to start',
  schema: 'structural JSON Schema Draft 2020-12 checking',
  graph: 'reference existence, identifier uniqueness, and dependency cycles',
  compatibility: 'four independent version axes',
  tracking: 'Do not mutate Delivery Definition files merely to record progress',
  authority: 'docs is a retrieval surface, not a new source of truth',
} as const;

const ROOT_TOPIC_IDS = [
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
] as const;

type IndexTopic = {
  id: string;
  title: string;
  summary?: string;
  content?: unknown;
};

function jsonDocs(argv: readonly string[]) {
  const result = run(argv);
  return { result, envelope: parseEnvelope(result.stdout) };
}

function indexTopics(envelope: ReturnType<typeof parseEnvelope>): IndexTopic[] {
  const topics = envelope.result?.['topics'];
  expect(Array.isArray(topics)).toBe(true);
  return topics as IndexTopic[];
}

describe('delivery docs', () => {
  it('is listed in top-level help and has command help', () => {
    const top = run(['--help']);
    expect(top.exitCode).toBe(0);
    expect(top.stdout).toContain('docs');
    expect(top.stdout).toContain('delivery docs');
    expect(top.stdout).toContain('delivery docs --index');
    expect(top.stdout).toContain('delivery docs validation');
    expect(top.stdout).toContain('delivery docs --all');

    const help = run(['docs', '--help']);
    expect(help.exitCode).toBe(0);
    expect(help.stderr).toBe('');
    expect(help.stdout).toContain('USAGE');
    expect(help.stdout).toContain('<topic>');
    expect(help.stdout).toMatch(/--index|-i/);
    expect(help.stdout).toMatch(/--all|-a/);
    expect(help.stdout).toContain('--json');
    expect(help.stdout).toContain('EXAMPLES');
    expect(help.stdout).toContain('SIDE EFFECTS');
    expect(help.stdout).not.toContain(PHRASES.schema);
    expect(help.stdout).not.toContain(PHRASES.authority);
  });

  it('treats docs as a known command while leaving domain commands unknown', () => {
    const docs = jsonDocs(['docs', '--json']);
    expect(docs.result.exitCode).toBe(0);
    expect(docs.envelope.ok).toBe(true);
    expect(docs.envelope.command).toBe('docs');

    const phase = jsonDocs(['phase', '--json']);
    expect(phase.result.exitCode).not.toBe(0);
    expect(phase.envelope.error?.code).toBe(ERROR_CODES.UNKNOWN_COMMAND);
  });

  it('equates docs, docs --index, and docs -i as the root compact index', () => {
    const bare = jsonDocs(['docs', '--json']);
    const long = jsonDocs(['docs', '--index', '--json']);
    const short = jsonDocs(['docs', '-i', '--json']);

    expect(bare.envelope).toEqual(long.envelope);
    expect(long.envelope).toEqual(short.envelope);
    expect(bare.envelope.result?.['mode']).toBe('index');
    expect(bare.envelope.result?.['scope']).toBeNull();

    const topics = indexTopics(bare.envelope);
    expect(topics.map((topic) => topic.id)).toEqual([...ROOT_TOPIC_IDS]);
    for (const topic of topics) {
      expect(topic.content).toBeUndefined();
      expect(typeof topic.id).toBe('string');
      expect(typeof topic.title).toBe('string');
      if (topic.summary !== undefined) {
        expect(topic.summary).not.toMatch(/\r?\n/);
        expect(topic.summary.length).toBeGreaterThan(0);
      }
    }
  });

  it('returns the exact topic body plus immediate children only', () => {
    const { result, envelope } = jsonDocs(['docs', 'validation', '--json']);
    expect(result.exitCode).toBe(0);
    expect(envelope.result?.['mode']).toBe('topic');
    const topic = envelope.result?.['topic'] as {
      id: string;
      title: string;
      content: string;
      children: IndexTopic[];
    };
    expect(topic.id).toBe('validation');
    expect(topic.content).toContain(PHRASES.validation);
    expect(topic.content).not.toContain(PHRASES.schema);
    expect(topic.content).not.toContain(PHRASES.overview);
    expect(topic.children.map((child) => child.id)).toEqual([
      'validation.schema',
      'validation.graph',
    ]);
    for (const child of topic.children) {
      expect(child.content).toBeUndefined();
    }
  });

  it('returns a compact scoped subtree for docs <topic> --index and -i', () => {
    const long = jsonDocs(['docs', 'validation', '--index', '--json']);
    const short = jsonDocs(['docs', 'validation', '-i', '--json']);
    expect(long.envelope).toEqual(short.envelope);
    expect(long.envelope.result?.['mode']).toBe('index');
    expect(long.envelope.result?.['scope']).toBe('validation');
    const topics = indexTopics(long.envelope);
    expect(topics.map((topic) => topic.id)).toEqual([
      'validation',
      'validation.schema',
      'validation.graph',
    ]);
    expect(topics.some((topic) => topic.content !== undefined)).toBe(false);
    expect(JSON.stringify(long.envelope)).not.toContain(PHRASES.schema);
    expect(JSON.stringify(long.envelope)).not.toContain(PHRASES.overview);
  });

  it('returns every descendant body for scoped --all and -a', () => {
    const long = jsonDocs(['docs', 'validation', '--all', '--json']);
    const short = jsonDocs(['docs', 'validation', '-a', '--json']);
    expect(long.envelope).toEqual(short.envelope);
    expect(long.envelope.result?.['mode']).toBe('all');
    expect(long.envelope.result?.['scope']).toBe('validation');
    const topics = indexTopics(long.envelope);
    expect(topics.map((topic) => topic.id)).toEqual([
      'validation',
      'validation.schema',
      'validation.graph',
    ]);
    expect(topics[0]?.content).toContain(PHRASES.validation);
    expect(topics[1]?.content).toContain(PHRASES.schema);
    expect(topics[2]?.content).toContain(PHRASES.graph);
    expect(JSON.stringify(long.envelope)).not.toContain(PHRASES.overview);
    expect(JSON.stringify(long.envelope)).not.toContain(PHRASES.roadmap);
  });

  it('returns the entire corpus once in catalog order for docs --all and -a', () => {
    const long = jsonDocs(['docs', '--all', '--json']);
    const short = jsonDocs(['docs', '-a', '--json']);
    expect(long.envelope).toEqual(short.envelope);
    expect(long.envelope.result?.['mode']).toBe('all');
    expect(long.envelope.result?.['scope']).toBeNull();
    const topics = indexTopics(long.envelope);
    expect(topics.map((topic) => topic.id)).toEqual([...ROOT_TOPIC_IDS]);
    const seen = new Set(topics.map((topic) => topic.id));
    expect(seen.size).toBe(ROOT_TOPIC_IDS.length);
    expect(topics[0]?.content).toContain(PHRASES.overview);
    expect(
      topics.some((topic) => String(topic.content).includes(PHRASES.schema)),
    ).toBe(true);
    expect(
      topics.some((topic) => String(topic.content).includes(PHRASES.authority)),
    ).toBe(true);
  });

  it('rejects --index combined with --all', () => {
    const { result, envelope } = jsonDocs([
      'docs',
      '--index',
      '--all',
      '--json',
    ]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toBe('');
    expect(envelope.ok).toBe(false);
    expect(envelope.command).toBe('docs');
    expect(envelope.error?.code).toBe(ERROR_CODES.INVALID_INVOCATION);
  });

  it('rejects an extra positional after the topic', () => {
    const { envelope } = jsonDocs(['docs', 'validation', 'extra', '--json']);
    expect(envelope.error?.code).toBe(ERROR_CODES.INVALID_INVOCATION);
  });

  it('rejects -idx as an unknown option', () => {
    const { result, envelope } = jsonDocs(['docs', '-idx', '--json']);
    expect(result.exitCode).not.toBe(0);
    expect(envelope.error?.code).toBe(ERROR_CODES.UNKNOWN_OPTION);
    expect(String(envelope.error?.message)).toContain('-idx');
  });

  it('fails unknown topics with DOCS_TOPIC_NOT_FOUND and does not fuzzy-select', () => {
    const missing = jsonDocs(['docs', 'does.not.exist', '--json']);
    expect(missing.result.exitCode).not.toBe(0);
    expect(missing.result.stderr).toBe('');
    expect(missing.envelope.ok).toBe(false);
    expect(missing.envelope.command).toBe('docs');
    expect(missing.envelope.error?.code).toBe(ERROR_CODES.DOCS_TOPIC_NOT_FOUND);
    expect(missing.envelope.error?.details?.['topic']).toBe('does.not.exist');
    const suggestions = missing.envelope.error?.details?.['suggestions'];
    if (suggestions !== undefined) {
      expect(Array.isArray(suggestions)).toBe(true);
      expect(missing.envelope.ok).toBe(false);
    }

    const typo = jsonDocs(['docs', 'validationn', '--json']);
    expect(typo.envelope.error?.code).toBe(ERROR_CODES.DOCS_TOPIC_NOT_FOUND);
    expect(JSON.stringify(typo.envelope.result ?? {})).not.toContain(
      PHRASES.validation,
    );
    expect(typo.envelope.error?.details?.['topic']).toBe('validationn');
  });

  it('rejects malformed topic IDs without normalizing them', () => {
    const { envelope } = jsonDocs(['docs', 'Phase.Start', '--json']);
    expect(envelope.error?.code).toBe(ERROR_CODES.INVALID_INVOCATION);
    expect(JSON.stringify(envelope)).not.toContain(PHRASES.phase);
  });

  it('keeps JSON success and failure on stdout as one document', () => {
    const success = jsonDocs(['docs', '--json']);
    expect(success.result.stderr).toBe('');
    expect(success.result.stdout.endsWith('\n')).toBe(true);
    expect(success.result.stdout.trimStart().startsWith('{')).toBe(true);
    expect(success.result.exitCode).toBe(0);

    const failure = jsonDocs(['docs', 'does.not.exist', '--json']);
    expect(failure.result.stderr).toBe('');
    expect(failure.result.stdout.endsWith('\n')).toBe(true);
    expect(failure.result.exitCode).not.toBe(0);
  });

  it('sends human success to stdout and human failure to stderr', () => {
    const success = run(['docs']);
    expect(success.exitCode).toBe(0);
    expect(success.stderr).toBe('');
    expect(success.stdout).toContain('validation');
    expect(success.stdout).toContain('validation.schema');
    expect(success.stdout).not.toContain(PHRASES.schema);

    const topic = run(['docs', 'validation']);
    expect(topic.exitCode).toBe(0);
    expect(topic.stderr).toBe('');
    expect(topic.stdout).toContain(PHRASES.validation);
    expect(topic.stdout).toContain('validation.schema');
    expect(topic.stdout).not.toContain(PHRASES.schema);

    const failure = run(['docs', 'does.not.exist']);
    expect(failure.exitCode).not.toBe(0);
    expect(failure.stdout).toBe('');
    expect(failure.stderr).toContain(ERROR_CODES.DOCS_TOPIC_NOT_FOUND);
  });

  it('is deterministic across equivalent invocations', () => {
    const first = jsonDocs(['docs', 'definition', '--all', '--json']);
    const second = jsonDocs(['docs', 'definition', '--all', '--json']);
    expect(first.envelope).toEqual(second.envelope);
    expect(indexTopics(first.envelope).map((topic) => topic.id)).toEqual([
      'definition',
      'definition.roadmap',
      'definition.milestone',
      'definition.milestone.review',
      'definition.phase',
      'definition.design-gap',
    ]);
  });

  it('is cwd-independent and does not write files', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'delivery-docs-'));
    const marker = path.join(directory, 'marker.json');
    await writeFile(marker, '{"ok":true}', 'utf8');
    const before = await readFile(marker, 'utf8');

    const result = run(['docs', '--json'], { cwd: directory });
    expect(result.exitCode).toBe(0);
    expect(parseEnvelope(result.stdout).ok).toBe(true);

    expect(await readFile(marker, 'utf8')).toBe(before);
    expect(await readdir(directory)).toEqual(['marker.json']);
  });

  it('keeps unknown options ahead of docs help', () => {
    const { envelope } = jsonDocs(['docs', '--help', '--bogus', '--json']);
    expect(envelope.error?.code).toBe(ERROR_CODES.UNKNOWN_OPTION);
  });

  it('does not treat --index as a validate option', () => {
    const { envelope } = jsonDocs(['validate', '--index', '--json']);
    expect(envelope.error?.code).toBe(ERROR_CODES.UNKNOWN_OPTION);
  });
});
