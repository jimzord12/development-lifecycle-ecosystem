import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { format, resolveConfig } from 'prettier';
import { parseDocument } from 'yaml';

const lifecycleStatuses = new Set([
  'exploration',
  'design-draft',
  'implementation-ready',
  'implemented',
  'superseded',
  'rejected',
]);
const unfinishedStatuses = new Set(['exploration', 'design-draft']);
const completedDesignStatuses = new Set([
  'implementation-ready',
  'implemented',
  'superseded',
  'rejected',
]);
const workStates = new Set(['PLANNED', 'CHECKPOINTED', 'PARKED']);
const satisfiedDependencyStatuses = new Set([
  'implementation-ready',
  'implemented',
]);
const requiredFields = [
  'id',
  'title',
  'status',
  'priority',
  'summary',
  'dependsOn',
  'supersedes',
  'decisionAuthority',
  'lastReconciledAgainst',
  'affectedComponents',
];
const proposalIdPattern = /^PROP-\d{3}$/;
const proposalFilenamePattern = /^PROP-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function issue(file, message) {
  return { file, message };
}

function parseFrontmatter(filename, contents) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return {
      metadata: null,
      issues: [issue(filename, 'proposal must begin with YAML frontmatter')],
    };
  }

  const document = parseDocument(match[1], { uniqueKeys: true });
  if (document.errors.length > 0) {
    return {
      metadata: null,
      issues: [
        issue(
          filename,
          `malformed YAML frontmatter: ${document.errors[0].message}`,
        ),
      ],
    };
  }

  const metadata = document.toJS();
  if (
    metadata === null ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return {
      metadata: null,
      issues: [issue(filename, 'YAML frontmatter must be a mapping')],
    };
  }

  return { metadata, issues: [] };
}

function sentenceCount(summary) {
  const trimmed = summary.trim();
  if (!trimmed) {
    return 0;
  }

  const terminators = trimmed.match(/[.!?]+(?:["')\]])?(?=\s|$)/g);
  return terminators?.length ?? 0;
}

function validateStringArray(filename, metadata, field, issues) {
  const value = metadata[field];
  if (!Array.isArray(value)) {
    issues.push(issue(filename, `${field} must be an array`));
    return false;
  }
  if (value.some((entry) => typeof entry !== 'string' || !entry.trim())) {
    issues.push(issue(filename, `${field} entries must be non-empty strings`));
    return false;
  }
  return true;
}

function validateMetadata(filename, metadata) {
  const issues = [];

  for (const field of requiredFields) {
    if (!hasOwn(metadata, field)) {
      issues.push(issue(filename, `missing required field ${field}`));
    }
  }

  if (typeof metadata.id !== 'string' || !proposalIdPattern.test(metadata.id)) {
    issues.push(issue(filename, 'id must match PROP-NNN'));
  } else {
    if (!proposalFilenamePattern.test(filename)) {
      issues.push(
        issue(filename, 'filename must match PROP-NNN-lowercase-slug.md'),
      );
    }
    if (!filename.startsWith(`${metadata.id}-`)) {
      issues.push(issue(filename, `filename must start with ${metadata.id}-`));
    }
  }

  for (const field of ['title', 'decisionAuthority', 'lastReconciledAgainst']) {
    if (
      typeof metadata[field] !== 'string' ||
      metadata[field].trim().length === 0
    ) {
      issues.push(issue(filename, `${field} must be a non-empty string`));
    }
  }

  if (!lifecycleStatuses.has(metadata.status)) {
    issues.push(issue(filename, `invalid status ${String(metadata.status)}`));
  }

  if (unfinishedStatuses.has(metadata.status)) {
    if (!hasOwn(metadata, 'workState')) {
      issues.push(issue(filename, `${metadata.status} requires workState`));
    } else if (!workStates.has(metadata.workState)) {
      issues.push(
        issue(filename, `invalid workState ${String(metadata.workState)}`),
      );
    }
  } else if (
    completedDesignStatuses.has(metadata.status) &&
    hasOwn(metadata, 'workState')
  ) {
    issues.push(issue(filename, `${metadata.status} must omit workState`));
  }

  if (unfinishedStatuses.has(metadata.status)) {
    if (
      typeof metadata.nextAction !== 'string' ||
      metadata.nextAction.trim().length === 0
    ) {
      issues.push(
        issue(
          filename,
          `${String(metadata.workState)} requires a non-empty nextAction`,
        ),
      );
    } else if (sentenceCount(metadata.nextAction) !== 1) {
      issues.push(
        issue(filename, 'nextAction must contain exactly one sentence'),
      );
    }
  }
  if (
    completedDesignStatuses.has(metadata.status) &&
    hasOwn(metadata, 'nextAction')
  ) {
    issues.push(issue(filename, `${metadata.status} must omit nextAction`));
  }

  if (
    !Number.isInteger(metadata.priority) ||
    metadata.priority < 1 ||
    metadata.priority > 5
  ) {
    issues.push(
      issue(filename, 'priority must be an integer from 1 through 5'),
    );
  }

  if (
    typeof metadata.summary !== 'string' ||
    sentenceCount(metadata.summary) < 1 ||
    sentenceCount(metadata.summary) > 3
  ) {
    issues.push(issue(filename, 'summary must contain one to three sentences'));
  }

  validateStringArray(filename, metadata, 'dependsOn', issues);
  validateStringArray(filename, metadata, 'supersedes', issues);
  if (
    validateStringArray(filename, metadata, 'affectedComponents', issues) &&
    metadata.affectedComponents.length === 0
  ) {
    issues.push(
      issue(filename, 'affectedComponents must contain at least one entry'),
    );
  }

  return issues;
}

function validateRelationships(proposals) {
  const issues = [];
  const proposalsById = new Map();

  for (const proposal of proposals) {
    if (!proposalIdPattern.test(proposal.id)) {
      continue;
    }
    const existing = proposalsById.get(proposal.id);
    if (existing) {
      issues.push(
        issue(
          proposal.filename,
          `duplicate proposal ID ${proposal.id}; also used by ${existing.filename}`,
        ),
      );
      continue;
    }
    proposalsById.set(proposal.id, proposal);
  }

  for (const proposal of proposalsById.values()) {
    if (!Array.isArray(proposal.dependsOn)) {
      continue;
    }
    const seenDependencies = new Set();
    for (const dependency of proposal.dependsOn) {
      if (seenDependencies.has(dependency)) {
        issues.push(
          issue(
            proposal.filename,
            `duplicate dependency ${String(dependency)}`,
          ),
        );
      }
      seenDependencies.add(dependency);

      if (dependency === proposal.id) {
        issues.push(
          issue(proposal.filename, `${proposal.id} must not depend on itself`),
        );
      } else if (
        typeof dependency === 'string' &&
        !proposalsById.has(dependency)
      ) {
        issues.push(
          issue(
            proposal.filename,
            `${proposal.id} depends on unknown proposal ${dependency}`,
          ),
        );
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  let cycle = null;

  function visit(id) {
    if (cycle || visited.has(id)) {
      return;
    }
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      cycle = [...stack.slice(start), id];
      return;
    }

    visiting.add(id);
    stack.push(id);
    const dependencies = proposalsById.get(id)?.dependsOn ?? [];
    for (const dependency of dependencies) {
      if (proposalsById.has(dependency) && dependency !== id) {
        visit(dependency);
      }
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of [...proposalsById.keys()].sort()) {
    visit(id);
  }

  if (cycle) {
    issues.push(
      issue(
        proposalsById.get(cycle[0]).filename,
        `dependency cycle: ${cycle.join(' -> ')}`,
      ),
    );
  }

  return issues;
}

export async function validateProposalDirectory(directory) {
  const directoryEntries = await readdir(directory, { withFileTypes: true });
  const filenames = directoryEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        entry.name !== 'README.md' &&
        entry.name !== 'TEMPLATE.md',
    )
    .map(({ name }) => name)
    .sort();
  const proposals = [];
  const issues = [];

  for (const filename of filenames) {
    const contents = await readFile(path.join(directory, filename), 'utf8');
    const parsed = parseFrontmatter(filename, contents);
    issues.push(...parsed.issues);
    if (!parsed.metadata) {
      continue;
    }

    issues.push(...validateMetadata(filename, parsed.metadata));
    proposals.push({
      ...parsed.metadata,
      filename,
    });
  }

  issues.push(...validateRelationships(proposals));
  return {
    proposals: proposals.sort((left, right) =>
      String(left.id ?? left.filename).localeCompare(
        String(right.id ?? right.filename),
      ),
    ),
    issues,
  };
}

function proposalNumber(id) {
  return Number(id.slice('PROP-'.length));
}

function schedulingOrder(left, right) {
  const workStateOrder = { CHECKPOINTED: 0, PLANNED: 1 };
  return (
    (workStateOrder[left.workState] ?? 2) -
      (workStateOrder[right.workState] ?? 2) ||
    left.priority - right.priority ||
    proposalNumber(left.id) - proposalNumber(right.id)
  );
}

function priorityOrder(left, right) {
  return (
    left.priority - right.priority ||
    proposalNumber(left.id) - proposalNumber(right.id)
  );
}

export function deriveProposalSchedule(proposals) {
  const proposalsById = new Map(
    proposals.map((proposal) => [proposal.id, proposal]),
  );
  const unfinishedDesign = proposals
    .filter((proposal) => unfinishedStatuses.has(proposal.status))
    .map((proposal) => {
      const unsatisfiedDependencies = proposal.dependsOn.filter(
        (dependency) =>
          !satisfiedDependencyStatuses.has(
            proposalsById.get(dependency)?.status,
          ),
      );
      return { ...proposal, unsatisfiedDependencies };
    });
  const eligibleDesign = unfinishedDesign
    .filter(
      (proposal) =>
        proposal.workState !== 'PARKED' &&
        proposal.unsatisfiedDependencies.length === 0,
    )
    .sort(schedulingOrder);
  const readyToMaterialize = proposals
    .filter(({ status }) => status === 'implementation-ready')
    .sort(priorityOrder);

  return {
    unfinishedDesign: unfinishedDesign.sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    eligibleDesign,
    readyToMaterialize,
    recommended: eligibleDesign[0] ?? readyToMaterialize[0] ?? null,
  };
}

function proposalEligibility(proposal, unsatisfiedDependencies) {
  if (unfinishedStatuses.has(proposal.status)) {
    if (proposal.workState === 'PARKED') {
      return 'parked';
    }
    return unsatisfiedDependencies.length > 0 ? 'blocked' : 'eligible';
  }
  if (proposal.status === 'implementation-ready') {
    return 'ready-to-materialize';
  }
  return 'terminal';
}

function orientProposal(proposal, proposalsById) {
  const unsatisfiedDependencies = proposal.dependsOn.filter(
    (dependency) =>
      !satisfiedDependencyStatuses.has(proposalsById.get(dependency)?.status),
  );
  return {
    id: proposal.id,
    title: proposal.title,
    status: proposal.status,
    workState: unfinishedStatuses.has(proposal.status)
      ? proposal.workState
      : null,
    priority: proposal.priority,
    dependsOn: proposal.dependsOn,
    unsatisfiedDependencies,
    eligibility: proposalEligibility(proposal, unsatisfiedDependencies),
    nextAction: unfinishedStatuses.has(proposal.status)
      ? proposal.nextAction
      : proposal.status === 'implementation-ready'
        ? 'Materialize the accepted proposal into its target authoritative surfaces.'
        : null,
  };
}

export function deriveProposalOrientation(proposals, explicitId = null) {
  const schedule = deriveProposalSchedule(proposals);
  const proposalsById = new Map(
    proposals.map((proposal) => [proposal.id, proposal]),
  );
  const selected = explicitId
    ? proposalsById.get(explicitId)
    : schedule.recommended;
  if (explicitId && !selected) {
    throw new Error(`unknown proposal ${explicitId}`);
  }

  const winningTier =
    schedule.eligibleDesign.length > 0
      ? schedule.eligibleDesign
      : schedule.readyToMaterialize;
  const orientedProposal = selected
    ? orientProposal(selected, proposalsById)
    : null;

  return {
    schemaVersion: 1,
    mode: explicitId ? 'proposal' : 'queue',
    proposal: orientedProposal,
    readyAlternatives: winningTier
      .filter(({ id }) => id !== selected?.id)
      .map(({ id }) => id),
    needsHumanDecision:
      orientedProposal?.workState === 'PARKED'
        ? orientedProposal.nextAction
        : null,
    mutationPerformed: false,
  };
}

function orientationReason(orientation) {
  const proposal = orientation.proposal;
  if (!proposal) {
    return 'No eligible unfinished or implementation-ready proposal exists.';
  }
  if (orientation.mode === 'proposal') {
    return `Explicit selection reports the requested proposal regardless of automatic scheduling; it is ${proposal.eligibility}.`;
  }
  if (proposal.eligibility === 'eligible') {
    return 'Selected first from eligible unfinished proposals by work state, priority, and proposal ID.';
  }
  return 'No eligible unfinished proposal exists; selected first from implementation-ready proposals by priority and proposal ID.';
}

function renderOrientedDependencies(proposal) {
  if (!proposal || proposal.dependsOn.length === 0) {
    return 'none';
  }
  const unsatisfied = new Set(proposal.unsatisfiedDependencies);
  return proposal.dependsOn
    .map(
      (dependency) =>
        `${dependency} (${unsatisfied.has(dependency) ? 'unsatisfied' : 'satisfied'})`,
    )
    .join(', ');
}

export function renderProposalOrientationHuman(orientation) {
  const proposal = orientation.proposal;
  return `Proposal orientation
Proposal: ${proposal ? `${proposal.id} — ${proposal.title}` : 'none'}
Lifecycle: ${proposal?.status ?? 'not applicable'}
Work state: ${proposal?.workState ?? 'not applicable'}
Priority: ${proposal?.priority ?? 'not applicable'}
Dependencies: ${renderOrientedDependencies(proposal)}
Eligibility: ${proposal?.eligibility ?? 'not applicable'}

Next action: ${proposal?.nextAction ?? 'none'}
Why: ${orientationReason(orientation)}
Ready alternatives: ${orientation.readyAlternatives.join(', ') || 'none'}
Needs human decision: ${orientation.needsHumanDecision ?? 'none'}
Mutation performed: no
`;
}

export function renderProposalOrientationJson(orientation) {
  return `${JSON.stringify(orientation, null, 2)}\n`;
}

function escapeTableCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function proposalLink(proposal) {
  return `[${proposal.id} — ${proposal.title}](./${proposal.filename})`;
}

function renderDependencies(proposal) {
  return proposal.dependsOn.length === 0
    ? 'none'
    : proposal.dependsOn.map((id) => `\`${id}\``).join(', ');
}

function renderProposalTable(proposals, columns) {
  if (proposals.length === 0) {
    return 'None.\n';
  }

  const headers = columns.map(({ header }) => header);
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];
  for (const proposal of proposals) {
    lines.push(
      `| ${columns
        .map(({ value }) => escapeTableCell(value(proposal)))
        .join(' | ')} |`,
    );
  }
  return `${lines.join('\n')}\n`;
}

function renderProposalIndexSource(proposals) {
  const schedule = deriveProposalSchedule(proposals);
  const implemented = proposals.filter(
    ({ status }) => status === 'implemented',
  );
  const inactive = proposals.filter(({ status }) =>
    ['superseded', 'rejected'].includes(status),
  );
  const recommended = schedule.recommended;
  const recommendation = recommended
    ? `Recommended next work: ${proposalLink(recommended)} (priority ${recommended.priority}).`
    : 'Recommended next work: none.';
  const commonColumns = [
    { header: 'Proposal', value: proposalLink },
    { header: 'Status', value: ({ status }) => `\`${status}\`` },
    { header: 'Priority', value: ({ priority }) => String(priority) },
    { header: 'Direct dependencies', value: renderDependencies },
    { header: 'Summary', value: ({ summary }) => summary },
  ];
  const unfinishedColumns = [
    commonColumns[0],
    commonColumns[1],
    { header: 'Work state', value: ({ workState }) => `\`${workState}\`` },
    commonColumns[2],
    commonColumns[3],
    {
      header: 'Eligibility',
      value: (proposal) => {
        if (proposal.workState === 'PARKED') {
          return 'parked';
        }
        if (proposal.unsatisfiedDependencies.length > 0) {
          return `blocked by ${proposal.unsatisfiedDependencies.join(', ')}`;
        }
        return 'eligible';
      },
    },
    commonColumns[4],
  ];

  return `<!-- Generated by \`pnpm proposals:index\`. Do not edit manually. -->

# Proposals

\`docs/proposals/\` contains public, framework-generic design and implementation proposals for DLE itself. Proposal files are the sole metadata and dependency-graph authority; this index is deterministically generated from their YAML frontmatter.

A proposal is not automatically runtime authority. Published standards, component Public Contracts, schemas, fixtures, tests, and released code remain authoritative until accepted substance is promoted into those surfaces.

## Lifecycle

| Status | Meaning |
| --- | --- |
| \`exploration\` | Early investigation; boundaries or major decisions remain unresolved. |
| \`design-draft\` | A coherent change is under design but is not yet authorized for implementation. |
| \`implementation-ready\` | The human design authority accepted the proposal for materialization. |
| \`implemented\` | The accepted substance was promoted into authoritative repository surfaces. |
| \`superseded\` | A newer proposal replaced this proposal. |
| \`rejected\` | The proposal was deliberately declined. |

Only the human design authority may promote a proposal to \`implementation-ready\`, \`rejected\`, or \`superseded\`. Implementation-ready proposals authorize their stated implementation but do not override current released authority by themselves.

## Work state

Unfinished \`exploration\` and \`design-draft\` proposals also carry conversational continuity state:

| Work state | Meaning |
| --- | --- |
| \`PLANNED\` | Coherent work exists but no saved active continuation takes precedence. |
| \`CHECKPOINTED\` | Interrupted work has a durable continuation and should be resumed first when eligible. |
| \`PARKED\` | Work is deliberately excluded from automatic next-work selection until explicitly resumed. |

\`ACTIVE\` is chat-local and must never be persisted. Every unfinished proposal requires a non-empty, one-sentence \`nextAction\` whose meaning matches its work state. Completed design lifecycle states omit both \`workState\` and \`nextAction\`.

## Identity, dependencies, and scheduling

- IDs use immutable, monotonic \`PROP-NNN\` values and are never reused.
- Filenames use \`PROP-NNN-<slug>.md\`; a title or slug rename never changes the ID.
- \`dependsOn\` contains direct proposal IDs only. Reverse relationships are derived, and there is no separate graph authority.
- Dependencies must exist, must not reference the proposal itself, and must form an acyclic graph.
- Priority is an integer from \`1\` (highest) through \`5\` (lowest).
- An unfinished proposal is dependency-eligible when every direct dependency is \`implementation-ready\` or \`implemented\`.
- Eligible work sorts by \`CHECKPOINTED\`, then \`PLANNED\`; excludes \`PARKED\`; then sorts by lower priority number and lower proposal ID.
- \`implementation-ready\` work appears separately as **Ready to Materialize**. It becomes the fallback recommendation only when no unfinished design proposal is eligible.

Validate metadata, graph integrity, and this derived index with:

\`\`\`bash
pnpm proposals:check
\`\`\`

Regenerate the index after intentional proposal metadata changes with:

\`\`\`bash
pnpm proposals:index
\`\`\`

Use [\`TEMPLATE.md\`](./TEMPLATE.md) when creating a proposal.

## Current orientation

${recommendation}

## Unfinished design work

${renderProposalTable(schedule.unfinishedDesign, unfinishedColumns)}
## Ready to Materialize

${renderProposalTable(schedule.readyToMaterialize, commonColumns)}
## Implemented

${renderProposalTable(implemented, commonColumns)}
## Superseded or Rejected

${renderProposalTable(inactive, commonColumns)}`;
}

export async function renderProposalIndex(
  proposals,
  readmePath = path.resolve('docs', 'proposals', 'README.md'),
) {
  const prettierConfig = (await resolveConfig(readmePath)) ?? {};
  return format(renderProposalIndexSource(proposals), {
    ...prettierConfig,
    filepath: readmePath,
  });
}

export async function checkProposalIndex(proposals, readmePath) {
  const expected = await renderProposalIndex(proposals, readmePath);
  let actual = null;
  try {
    actual = await readFile(readmePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  return { current: actual === expected, expected };
}

export async function writeProposalIndex(proposals, readmePath) {
  const expected = await renderProposalIndex(proposals, readmePath);
  await writeFile(readmePath, expected, 'utf8');
}

function parseArguments(arguments_) {
  const options = {
    mode: 'check',
    directory: path.resolve('docs', 'proposals'),
    proposalId: null,
    json: false,
  };
  const modes = [];
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === '--check') {
      modes.push('check');
    } else if (argument === '--write') {
      modes.push('write');
    } else if (argument === '--orient') {
      modes.push('orient');
    } else if (argument === '--directory') {
      if (arguments_[index + 1] === undefined) {
        throw new Error('--directory requires a path');
      }
      options.directory = path.resolve(arguments_[index + 1]);
      index += 1;
    } else if (argument === '--index') {
      if (arguments_[index + 1] === undefined) {
        throw new Error('--index requires a path');
      }
      options.index = path.resolve(arguments_[index + 1]);
      index += 1;
    } else if (argument === '--json') {
      options.json = true;
    } else if (argument.startsWith('-')) {
      throw new Error(`unknown option ${argument}`);
    } else if (options.proposalId) {
      throw new Error('orientation accepts at most one proposal ID');
    } else {
      options.proposalId = argument;
    }
  }
  if (modes.length > 1) {
    throw new Error('choose exactly one of --check, --write, or --orient');
  }
  options.mode = modes[0] ?? 'check';
  if (options.json && options.mode !== 'orient') {
    throw new Error('--json is available only with --orient');
  }
  if (options.proposalId && options.mode !== 'orient') {
    throw new Error('a proposal ID is available only with --orient');
  }
  options.index ??= path.join(options.directory, 'README.md');
  return options;
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }
  const result = await validateProposalDirectory(options.directory);
  if (result.issues.length > 0) {
    for (const validationIssue of result.issues) {
      console.error(`${validationIssue.file}: ${validationIssue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (options.mode === 'write') {
    await writeProposalIndex(result.proposals, options.index);
    console.log(
      `Wrote proposal index for ${result.proposals.length} proposals.`,
    );
    return;
  }

  const indexCheck = await checkProposalIndex(result.proposals, options.index);
  if (!indexCheck.current) {
    console.error(
      `Proposal index is stale: ${options.index}. Run pnpm proposals:index.`,
    );
    process.exitCode = 1;
    return;
  }

  if (options.mode === 'orient') {
    let orientation;
    try {
      orientation = deriveProposalOrientation(
        result.proposals,
        options.proposalId,
      );
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      options.json
        ? renderProposalOrientationJson(orientation)
        : renderProposalOrientationHuman(orientation),
    );
    return;
  }

  console.log(
    `Validated ${result.proposals.length} proposals: unique IDs, acyclic graph, current index.`,
  );
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await main();
}
