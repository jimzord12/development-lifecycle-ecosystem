import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { format } from 'prettier';

import {
  checkProposalIndex,
  deriveProposalSchedule,
  renderProposalIndex,
  validateProposalDirectory,
} from './proposals.mjs';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(scriptsDirectory, 'fixtures', 'proposals');

function proposal(overrides = {}) {
  const metadata = {
    id: 'PROP-001',
    title: 'Alpha proposal',
    status: 'design-draft',
    workState: 'PLANNED',
    priority: 3,
    summary: 'Define the alpha behavior for proposal governance.',
    dependsOn: [],
    supersedes: [],
    decisionAuthority: 'repository-owner',
    lastReconciledAgainst: 'main@abc1234',
    affectedComponents: ['dle'],
    ...overrides,
  };

  const lines = [
    '---',
    `id: ${metadata.id}`,
    `title: ${metadata.title}`,
    `status: ${metadata.status}`,
  ];

  if ('workState' in metadata && metadata.workState !== undefined) {
    lines.push(`workState: ${metadata.workState}`);
  }

  lines.push(
    `priority: ${metadata.priority}`,
    `summary: ${metadata.summary}`,
    metadata.dependsOn.length === 0 ? 'dependsOn: []' : 'dependsOn:',
    ...metadata.dependsOn.map((dependency) => `  - ${dependency}`),
    metadata.supersedes.length === 0 ? 'supersedes: []' : 'supersedes:',
    ...metadata.supersedes.map((entry) => `  - ${entry}`),
    `decisionAuthority: ${metadata.decisionAuthority}`,
    `lastReconciledAgainst: ${metadata.lastReconciledAgainst}`,
    'affectedComponents:',
    ...metadata.affectedComponents.map((component) => `  - ${component}`),
  );

  if ('nextAction' in metadata && metadata.nextAction !== undefined) {
    lines.push(
      metadata.nextAction === null
        ? 'nextAction: null'
        : `nextAction: ${metadata.nextAction}`,
    );
  }

  lines.push('---', '', `# Proposal: ${metadata.title}`, '');
  return lines.join('\n');
}

async function createProposalDirectory(t, files) {
  const root = await mkdtemp(path.join(tmpdir(), 'dle-proposals-'));
  const directory = path.join(root, 'docs', 'proposals');
  await mkdir(directory, { recursive: true });
  await Promise.all(
    Object.entries(files).map(([name, contents]) =>
      writeFile(path.join(directory, name), contents, 'utf8'),
    ),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  return directory;
}

function issueMessages(result) {
  return result.issues.map((issue) => issue.message);
}

test('accepts valid proposal metadata and derives dependency-eligible work', async () => {
  const directory = path.join(fixturesDirectory, 'valid');

  const result = await validateProposalDirectory(directory);

  assert.deepEqual(result.issues, []);
  const schedule = deriveProposalSchedule(result.proposals);
  assert.equal(schedule.recommended.id, 'PROP-002');
  assert.deepEqual(
    schedule.readyToMaterialize.map(({ id }) => id),
    ['PROP-001'],
  );
});

test('prioritizes checkpointed work, excludes parked work, and falls back to ready work', () => {
  const proposals = [
    {
      id: 'PROP-001',
      status: 'design-draft',
      workState: 'PLANNED',
      priority: 1,
      dependsOn: [],
    },
    {
      id: 'PROP-002',
      status: 'design-draft',
      workState: 'CHECKPOINTED',
      priority: 5,
      dependsOn: [],
    },
    {
      id: 'PROP-003',
      status: 'design-draft',
      workState: 'PARKED',
      priority: 1,
      dependsOn: [],
    },
    {
      id: 'PROP-004',
      status: 'implementation-ready',
      priority: 2,
      dependsOn: [],
    },
  ];

  const schedule = deriveProposalSchedule(proposals);

  assert.equal(schedule.recommended.id, 'PROP-002');
  assert.deepEqual(
    schedule.eligibleDesign.map(({ id }) => id),
    ['PROP-002', 'PROP-001'],
  );
  assert.equal(
    deriveProposalSchedule(proposals.slice(2)).recommended.id,
    'PROP-004',
  );
});

test('rejects a proposal without YAML frontmatter', async (t) => {
  const directory = await createProposalDirectory(t, {
    'proposal-without-id.md': '# Proposal without metadata\n',
  });

  const result = await validateProposalDirectory(directory);

  assert.match(issueMessages(result).join('\n'), /YAML frontmatter/);
});

test('reports a missing ID without crashing', async (t) => {
  const directory = await createProposalDirectory(t, {
    'missing-id.md': proposal().replace(/^id: .*\n/m, ''),
    'PROP-002-beta.md': proposal({
      id: 'PROP-002',
      title: 'Beta proposal',
    }),
  });

  const result = await validateProposalDirectory(directory);

  assert.match(issueMessages(result).join('\n'), /missing required field id/);
});

test('rejects malformed frontmatter and duplicate IDs', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-001-alpha.md': proposal(),
    'PROP-001-beta.md': proposal({ title: 'Beta proposal' }),
    'PROP-003-malformed.md': '---\nid: [PROP-003\n---\n# Broken\n',
  });

  const result = await validateProposalDirectory(directory);
  const messages = issueMessages(result).join('\n');

  assert.match(messages, /duplicate proposal ID PROP-001/);
  assert.match(messages, /malformed YAML frontmatter/);
});

test('rejects filename and ID mismatches', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-002-alpha.md': proposal(),
  });

  const result = await validateProposalDirectory(directory);

  assert.match(issueMessages(result).join('\n'), /must start with PROP-001-/);
});

test('rejects invalid lifecycle and work-state combinations', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-001-invalid-status.md': proposal({ status: 'accepted' }),
    'PROP-002-active.md': proposal({
      id: 'PROP-002',
      title: 'Active proposal',
      workState: 'ACTIVE',
    }),
    'PROP-003-missing-state.md': proposal({
      id: 'PROP-003',
      title: 'Missing state proposal',
      workState: undefined,
    }),
    'PROP-004-complete-state.md': proposal({
      id: 'PROP-004',
      title: 'Complete state proposal',
      status: 'implemented',
      workState: 'PLANNED',
    }),
  });

  const result = await validateProposalDirectory(directory);
  const messages = issueMessages(result).join('\n');

  assert.match(messages, /invalid status accepted/);
  assert.match(messages, /invalid workState ACTIVE/);
  assert.match(messages, /requires workState/);
  assert.match(messages, /must omit workState/);
});

test('enforces conditional nextAction rules', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-001-checkpointed.md': proposal({ workState: 'CHECKPOINTED' }),
    'PROP-002-parked.md': proposal({
      id: 'PROP-002',
      title: 'Parked proposal',
      workState: 'PARKED',
      nextAction: '',
    }),
    'PROP-003-implemented.md': proposal({
      id: 'PROP-003',
      title: 'Implemented proposal',
      status: 'implemented',
      workState: undefined,
      nextAction: 'Do more work.',
    }),
    'PROP-004-planned.md': proposal({
      id: 'PROP-004',
      title: 'Planned proposal',
      nextAction: null,
    }),
  });

  const result = await validateProposalDirectory(directory);
  const messages = issueMessages(result).join('\n');

  assert.match(messages, /CHECKPOINTED requires a non-empty nextAction/);
  assert.match(messages, /PARKED requires a non-empty nextAction/);
  assert.match(messages, /must omit nextAction/);
  assert.doesNotMatch(messages, /PROP-004.*nextAction/);
});

test('rejects priorities outside 1 through 5 and summaries outside one to three sentences', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-001-low-priority.md': proposal({ priority: 0 }),
    'PROP-002-high-priority.md': proposal({
      id: 'PROP-002',
      title: 'High priority proposal',
      priority: 6,
    }),
    'PROP-003-empty-summary.md': proposal({
      id: 'PROP-003',
      title: 'Empty summary proposal',
      summary: '',
    }),
    'PROP-004-long-summary.md': proposal({
      id: 'PROP-004',
      title: 'Long summary proposal',
      summary: 'One. Two. Three. Four.',
    }),
  });

  const result = await validateProposalDirectory(directory);
  const messages = issueMessages(result).join('\n');

  assert.match(messages, /priority must be an integer from 1 through 5/);
  assert.match(messages, /summary must contain one to three sentences/);
});

test('rejects unknown, duplicate, and self dependencies', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-001-alpha.md': proposal({
      dependsOn: ['PROP-001', 'PROP-999', 'PROP-999'],
    }),
  });

  const result = await validateProposalDirectory(directory);
  const messages = issueMessages(result).join('\n');

  assert.match(messages, /must not depend on itself/);
  assert.match(messages, /unknown proposal PROP-999/);
  assert.match(messages, /duplicate dependency PROP-999/);
});

test('known dependency-cycle fixture fails validation and the CLI exits non-zero', async () => {
  const directory = path.join(fixturesDirectory, 'invalid-cycle');

  const result = await validateProposalDirectory(directory);
  assert.match(issueMessages(result).join('\n'), /dependency cycle/);

  const cli = spawnSync(
    process.execPath,
    [
      path.join(scriptsDirectory, 'proposals.mjs'),
      '--check',
      '--directory',
      directory,
    ],
    { encoding: 'utf8' },
  );
  assert.notEqual(cli.status, 0);
  assert.match(cli.stderr, /dependency cycle/);
});

test('renders deterministic grouped index content from proposal metadata', async () => {
  const result = await validateProposalDirectory(
    path.join(fixturesDirectory, 'valid'),
  );

  const index = await renderProposalIndex(result.proposals);

  assert.match(index, /Recommended next work: \[PROP-002 — Beta proposal\]/);
  assert.match(index, /## Unfinished design work/);
  assert.match(index, /## Ready to Materialize/);
  assert.match(index, /blocked by PROP-002/);
  assert.equal(index, await format(index, { parser: 'markdown' }));
  assert.equal(index, await renderProposalIndex(result.proposals));
});

test('detects a stale derived index', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-001-alpha.md': proposal(),
    'README.md': '# Stale index\n',
  });
  const readmePath = path.join(directory, 'README.md');

  const result = await validateProposalDirectory(directory);
  const check = await checkProposalIndex(result.proposals, readmePath);

  assert.equal(check.current, false);
  assert.equal(await readFile(readmePath, 'utf8'), '# Stale index\n');
  assert.match(check.expected, /# Proposals/);
});
