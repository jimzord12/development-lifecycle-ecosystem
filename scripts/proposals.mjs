import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
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
const proposalNavigationFilenames = new Set(['README.md', 'TEMPLATE.md']);
const terminalStatusDirectories = new Map([
  ['implemented', 'archive/implemented'],
  ['superseded', 'archive/superseded'],
  ['rejected', 'archive/rejected'],
]);

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function issue(file, message) {
  return { file, message };
}

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join('/');
}

async function discoverProposalFiles(directory) {
  const discovered = [];

  async function visit(currentDirectory, relativeDirectory = '') {
    const entries = await readdir(currentDirectory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const relativePath = path.join(relativeDirectory, entry.name);
      const absolutePath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath, relativePath);
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        !proposalNavigationFilenames.has(entry.name)
      ) {
        discovered.push({
          absolutePath,
          filename: entry.name,
          relativePath: normalizeRelativePath(relativePath),
        });
      }
    }
  }

  await visit(directory);
  return discovered;
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

  return {
    body: contents.slice(match[0].length),
    metadata,
    issues: [],
  };
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
  const proposalFilename = path.posix.basename(filename);

  for (const field of requiredFields) {
    if (!hasOwn(metadata, field)) {
      issues.push(issue(filename, `missing required field ${field}`));
    }
  }

  if (typeof metadata.id !== 'string' || !proposalIdPattern.test(metadata.id)) {
    issues.push(issue(filename, 'id must match PROP-NNN'));
  } else {
    if (!proposalFilenamePattern.test(proposalFilename)) {
      issues.push(
        issue(filename, 'filename must match PROP-NNN-lowercase-slug.md'),
      );
    }
    if (!proposalFilename.startsWith(`${metadata.id}-`)) {
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
  } else {
    const actualDirectory = path.posix.dirname(filename);
    const terminalDirectory = terminalStatusDirectories.get(metadata.status);
    if (terminalDirectory && actualDirectory !== terminalDirectory) {
      issues.push(
        issue(filename, `${metadata.status} must be in ${terminalDirectory}`),
      );
    } else if (!terminalDirectory && actualDirectory !== '.') {
      issues.push(
        issue(filename, `${metadata.status} must be in the proposal root`),
      );
    }
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
          proposal.relativePath,
          `duplicate proposal ID ${proposal.id}; also used by ${existing.relativePath}`,
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
            proposal.relativePath,
            `duplicate dependency ${String(dependency)}`,
          ),
        );
      }
      seenDependencies.add(dependency);

      if (dependency === proposal.id) {
        issues.push(
          issue(
            proposal.relativePath,
            `${proposal.id} must not depend on itself`,
          ),
        );
      } else if (
        typeof dependency === 'string' &&
        !proposalsById.has(dependency)
      ) {
        issues.push(
          issue(
            proposal.relativePath,
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
        proposalsById.get(cycle[0]).relativePath,
        `dependency cycle: ${cycle.join(' -> ')}`,
      ),
    );
  }

  return issues;
}

function maskMarkdownCode(contents) {
  const lines = contents.split(/(?<=\n)/);
  let fence = null;
  const withoutFences = lines
    .map((line) => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/u)?.[1] ?? null;
      if (fence) {
        if (marker?.[0] === fence.character && marker.length >= fence.length) {
          fence = null;
        }
        return line.replace(/[^\r\n]/g, ' ');
      }
      if (marker) {
        fence = { character: marker[0], length: marker.length };
        return line.replace(/[^\r\n]/g, ' ');
      }
      if (/^(?: {4}|\t)/u.test(line)) {
        return line.replace(/[^\r\n]/g, ' ');
      }
      return line;
    })
    .join('');

  const characters = withoutFences.split('');
  for (let index = 0; index < characters.length; index += 1) {
    if (characters[index] !== '`') {
      continue;
    }
    let runLength = 1;
    while (characters[index + runLength] === '`') {
      runLength += 1;
    }
    const delimiter = '`'.repeat(runLength);
    const closingIndex = withoutFences.indexOf(delimiter, index + runLength);
    if (closingIndex === -1) {
      index += runLength - 1;
      continue;
    }
    for (
      let maskedIndex = index;
      maskedIndex < closingIndex + runLength;
      maskedIndex += 1
    ) {
      if (!['\r', '\n'].includes(characters[maskedIndex])) {
        characters[maskedIndex] = ' ';
      }
    }
    index = closingIndex + runLength - 1;
  }
  return characters.join('');
}

function parseMarkdownDestination(source, startIndex, inline) {
  let index = startIndex;
  while (/[ \t\r\n]/u.test(source[index] ?? '')) {
    index += 1;
  }
  if (source[index] === '<') {
    const targetStart = index + 1;
    index = targetStart;
    while (index < source.length) {
      if (source[index] === '\\') {
        index += 2;
      } else if (source[index] === '>') {
        return {
          endIndex: index + 1,
          target: source.slice(targetStart, index),
        };
      } else {
        index += 1;
      }
    }
    return null;
  }

  const targetStart = index;
  let parenthesisDepth = 0;
  while (index < source.length) {
    const character = source[index];
    if (character === '\\') {
      index += 2;
      continue;
    }
    if (character === '(') {
      parenthesisDepth += 1;
    } else if (character === ')') {
      if (inline && parenthesisDepth === 0) {
        break;
      }
      if (parenthesisDepth > 0) {
        parenthesisDepth -= 1;
      }
    } else if (/\s/u.test(character) && parenthesisDepth === 0) {
      break;
    }
    index += 1;
  }

  if (index === targetStart || parenthesisDepth !== 0) {
    return null;
  }
  return { endIndex: index, target: source.slice(targetStart, index) };
}

function localMarkdownTargets(contents) {
  const markdown = maskMarkdownCode(contents);
  const targets = [];

  for (let index = 0; index < markdown.length - 1; index += 1) {
    if (markdown[index] !== ']' || markdown[index + 1] !== '(') {
      continue;
    }
    const parsed = parseMarkdownDestination(markdown, index + 2, true);
    if (parsed) {
      targets.push(parsed.target);
      index = parsed.endIndex;
    }
  }

  const referenceDefinitionPattern = /^ {0,3}\[[^\]\r\n]+\]:[ \t]*/gmu;
  for (const match of markdown.matchAll(referenceDefinitionPattern)) {
    const parsed = parseMarkdownDestination(
      markdown,
      match.index + match[0].length,
      false,
    );
    if (parsed) {
      targets.push(parsed.target);
    }
  }

  return targets;
}

function classifyLocalTarget(target) {
  if (
    target.startsWith('#') ||
    target.startsWith('/') ||
    target.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/iu.test(target)
  ) {
    return null;
  }

  const encodedPath = target.split(/[?#]/u, 1)[0];
  if (!encodedPath) {
    return null;
  }
  try {
    const decodedPath = decodeURIComponent(encodedPath).replace(
      /\\([\\()[\]{}<> ])/gu,
      '$1',
    );
    return decodedPath.includes('\\')
      ? { malformed: true, target }
      : { pathOnly: decodedPath, target };
  } catch {
    return { malformed: true, target };
  }
}

function staysWithin(root, target) {
  const relativePath = path.relative(root, target);
  return (
    relativePath === '' ||
    (!path.isAbsolute(relativePath) &&
      relativePath !== '..' &&
      !relativePath.startsWith(`..${path.sep}`))
  );
}

async function isExactFileOrDirectory(targetPath, repositoryRoot, cache) {
  const relativePath = path.relative(repositoryRoot, targetPath);
  let currentPath = repositoryRoot;
  for (const segment of relativePath.split(path.sep).filter(Boolean)) {
    let names = cache.get(currentPath);
    if (!names) {
      try {
        names = new Set(await readdir(currentPath));
      } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
          return false;
        }
        throw error;
      }
      cache.set(currentPath, names);
    }
    if (!names.has(segment)) {
      return false;
    }
    currentPath = path.join(currentPath, segment);
  }

  try {
    const targetStat = await stat(currentPath);
    return targetStat.isFile() || targetStat.isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return false;
    }
    throw error;
  }
}

async function validateProposalLinks(directory, proposals, contentsByPath) {
  const issues = [];
  const repositoryRoot = path.resolve(directory, '..', '..');
  const directoryEntriesCache = new Map();

  for (const proposal of proposals) {
    const sourcePath = path.join(
      directory,
      ...proposal.relativePath.split('/'),
    );
    const contents = contentsByPath.get(proposal.relativePath);
    for (const target of localMarkdownTargets(contents)) {
      const localTarget = classifyLocalTarget(target);
      if (!localTarget) {
        continue;
      }
      if (localTarget.malformed) {
        issues.push(
          issue(proposal.relativePath, `malformed local link ${target}`),
        );
        continue;
      }

      const targetPath = path.resolve(
        path.dirname(sourcePath),
        localTarget.pathOnly,
      );
      if (
        !staysWithin(repositoryRoot, targetPath) ||
        !(await isExactFileOrDirectory(
          targetPath,
          repositoryRoot,
          directoryEntriesCache,
        ))
      ) {
        issues.push(
          issue(proposal.relativePath, `broken local link ${target}`),
        );
      }
    }
  }

  return issues;
}

export async function validateProposalDirectory(directory) {
  const discoveredFiles = await discoverProposalFiles(directory);
  const proposals = [];
  const issues = [];
  const contentsByPath = new Map();

  for (const { absolutePath, filename, relativePath } of discoveredFiles) {
    const contents = await readFile(absolutePath, 'utf8');
    const parsed = parseFrontmatter(relativePath, contents);
    issues.push(...parsed.issues);
    if (!parsed.metadata) {
      continue;
    }

    contentsByPath.set(relativePath, parsed.body);
    issues.push(...validateMetadata(relativePath, parsed.metadata));
    proposals.push({
      ...parsed.metadata,
      filename,
      relativePath,
    });
  }

  issues.push(...validateRelationships(proposals));
  const sortedProposals = proposals.sort((left, right) =>
    String(left.id ?? left.relativePath).localeCompare(
      String(right.id ?? right.relativePath),
    ),
  );
  issues.push(
    ...(await validateProposalLinks(
      directory,
      sortedProposals,
      contentsByPath,
    )),
  );
  return {
    proposals: sortedProposals,
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
  return `[${proposal.id} — ${proposal.title}](./${proposal.relativePath})`;
}

export function deriveNextProposalId(proposals) {
  const highestProposalNumber = proposals.reduce(
    (highest, proposal) =>
      proposalIdPattern.test(proposal.id)
        ? Math.max(highest, proposalNumber(proposal.id))
        : highest,
    0,
  );
  return `PROP-${String(highestProposalNumber + 1).padStart(3, '0')}`;
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
  const nextProposalId = deriveNextProposalId(proposals);
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

Actionable proposals remain at this directory root. Terminal proposals are retained under \`archive/implemented/\`, \`archive/superseded/\`, or \`archive/rejected/\` according to lifecycle metadata.

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
- Proposal discovery is recursive; paths may change on terminal transition, but IDs do not.
- \`dependsOn\` contains direct proposal IDs only. Reverse relationships are derived, and there is no separate graph authority.
- Dependencies must exist, must not reference the proposal itself, and must form an acyclic graph.
- Priority is an integer from \`1\` (highest) through \`5\` (lowest).
- An unfinished proposal is dependency-eligible when every direct dependency is \`implementation-ready\` or \`implemented\`.
- Eligible work sorts by \`CHECKPOINTED\`, then \`PLANNED\`; excludes \`PARKED\`; then sorts by lower priority number and lower proposal ID.
- \`implementation-ready\` work appears separately as **Ready to Materialize**. It becomes the fallback recommendation only when no unfinished design proposal is eligible.

Next proposal ID: \`${nextProposalId}\`.

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
    `Validated ${result.proposals.length} proposals: recursive paths, lifecycle locations, local links, unique IDs, acyclic graph, current index.`,
  );
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await main();
}
