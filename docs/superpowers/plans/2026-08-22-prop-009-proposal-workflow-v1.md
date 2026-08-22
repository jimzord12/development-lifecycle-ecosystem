# PROP-009 Proposal Workflow V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Materialize PROP-009 as an authoritative DLE Proposal Workflow V1 standard with deterministic, read-only human and JSON orientation commands.

**Architecture:** Keep proposal parsing, validation, scheduling, orientation derivation, rendering, and CLI dispatch in the existing dependency-light `scripts/proposals.mjs` module. Derive both index and orientation from the same validated proposal objects and schedule, so the generated README and CLI cannot develop competing queue rules; publish human operating rules separately in the new standard.

**Tech Stack:** Node.js 24 ESM, `node:test`, `yaml`, Prettier, pnpm 11.

**Spec:** `docs/proposals/PROP-009-dle-proposal-workflow.md`

## Global Constraints

- Do not change a DWF, DSF, IRS, or other first-class component contract or version.
- `ACTIVE` remains chat-local and must never validate as proposal metadata.
- Every `exploration` or `design-draft` proposal must have a non-empty, actionable, one-sentence `nextAction`.
- Orientation is read-only and must fail before emitting a recommendation when metadata, the dependency graph, or the generated index is invalid.
- Queue selection continues to prefer eligible unfinished work over implementation-ready work; within each tier, reuse the ordering already owned by PROP-007.
- An explicit proposal ID selects that proposal without changing the queue recommendation or mutating repository state.
- JSON uses `schemaVersion: 1`, explicit `null` values, and the exact field names accepted in PROP-009.
- Human-only lifecycle transitions to `implementation-ready`, `rejected`, and `superseded` remain human authority gates.
- No new runtime dependency, component version, mutating proposal command, provider-specific instruction, or persisted `ACTIVE` field is introduced.
- Complete the work with `pnpm validate`, one atomic implementation commit on `main` containing the validator and metadata migration, a separate promotion-record commit, and a push of `main`.

---

### Task 1: Tighten unfinished-proposal continuation validation

**Files:**

- Modify: `scripts/proposals.test.mjs`
- Modify: `scripts/proposals.mjs`
- Modify: `scripts/fixtures/proposals/valid/PROP-002-beta.md`
- Modify: `scripts/fixtures/proposals/valid/PROP-003-gamma.md`
- Modify: `scripts/fixtures/proposals/invalid-cycle/PROP-001-alpha.md`
- Modify: `scripts/fixtures/proposals/invalid-cycle/PROP-002-beta.md`

**Interfaces:**

- Consumes: existing `validateProposalDirectory(directory)` and test `proposal(overrides)` helper.
- Produces: validation in which every unfinished proposal requires a trimmed, non-empty `nextAction`, while every completed-design status still rejects the field.

- [ ] **Step 1: Make valid generated test proposals include an actionable continuation by default**

Add this literal default to the `proposal()` helper metadata in `scripts/proposals.test.mjs`:

```js
nextAction: 'Resolve the first remaining alpha design boundary.',
```

Keep the existing serializer for `nextAction`; tests can still set it to `undefined`, `null`, or an empty string to exercise failures.

- [ ] **Step 2: Write the failing PLANNED validation test**

Replace the old conditional-next-action expectation with cases proving all unfinished states require the field:

```js
test('requires a non-empty nextAction for every unfinished proposal', async (t) => {
  const directory = await createProposalDirectory(t, {
    'PROP-001-planned.md': proposal({ nextAction: null }),
    'PROP-002-checkpointed.md': proposal({
      id: 'PROP-002',
      title: 'Checkpointed proposal',
      workState: 'CHECKPOINTED',
      nextAction: undefined,
    }),
    'PROP-003-parked.md': proposal({
      id: 'PROP-003',
      title: 'Parked proposal',
      workState: 'PARKED',
      nextAction: '',
    }),
  });

  const result = await validateProposalDirectory(directory);
  const messages = issueMessages(result).join('\n');

  assert.match(messages, /PLANNED requires a non-empty nextAction/);
  assert.match(messages, /CHECKPOINTED requires a non-empty nextAction/);
  assert.match(messages, /PARKED requires a non-empty nextAction/);
});
```

Production mutation caught: restoring PROP-007's behavior that allowed a `PLANNED` proposal to omit `nextAction`.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
node --test --test-name-pattern="requires a non-empty nextAction" scripts/proposals.test.mjs
```

Expected: FAIL because a `PLANNED` proposal with `nextAction: null` has no validation issue.

- [ ] **Step 4: Implement the minimal unified unfinished-status rule**

In `validateMetadata`, replace the state-specific `CHECKPOINTED`/`PARKED` branch with:

```js
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
  }
}
```

Retain the completed-design rule that rejects any persisted `nextAction`.

- [ ] **Step 5: Reconcile fixture continuations and run proposal tests**

Give each unfinished fixture one concrete sentence. Use these literals so fixtures express their own topic:

```yaml
nextAction: Resolve the first remaining beta design boundary.
```

```yaml
nextAction: Resolve the dependency needed to continue gamma design.
```

```yaml
nextAction: Resolve the alpha side of the known dependency cycle.
```

```yaml
nextAction: Resolve the beta side of the known dependency cycle.
```

Run:

```bash
pnpm test:proposals
```

Expected: all proposal tests pass, including the unchanged rejection of `nextAction` on an `implemented` proposal.

- [ ] **Step 6: Stage the validation increment for the atomic implementation commit**

```bash
git add scripts/proposals.mjs scripts/proposals.test.mjs scripts/fixtures/proposals
```

### Task 2: Add pure orientation derivation and renderers

**Files:**

- Modify: `scripts/proposals.test.mjs`
- Modify: `scripts/proposals.mjs`

**Interfaces:**

- Consumes: `deriveProposalSchedule(proposals)` and validated proposal metadata.
- Produces: `deriveProposalOrientation(proposals, explicitId)`, `renderProposalOrientationHuman(orientation)`, and `renderProposalOrientationJson(orientation)`.

- [ ] **Step 1: Write table-driven tests for lifecycle classification**

Add tests using literal proposal arrays for these cases:

```js
[
  ['PLANNED', [], 'eligible'],
  ['CHECKPOINTED', [], 'eligible'],
  ['PARKED', [], 'parked'],
  ['PLANNED', ['PROP-099'], 'blocked'],
];
```

Pair the blocked row with a real `PROP-099` proposal whose status is `design-draft`, so the test exercises the real dependency-status calculation rather than invalid fixture data. Add separate cases for `implementation-ready` → `ready-to-materialize` and `implemented`/`superseded`/`rejected` → `terminal`.

Production mutations caught: ignoring parked state, treating an unsatisfied dependency as eligible, or recommending a terminal proposal.

- [ ] **Step 2: Write the failing queue and explicit-selection tests**

Use a queue containing two eligible design proposals plus one implementation-ready proposal and assert these hand-derived values:

```js
assert.equal(queue.mode, 'queue');
assert.equal(queue.proposal.id, 'PROP-002');
assert.deepEqual(queue.readyAlternatives, ['PROP-006']);

assert.equal(explicit.mode, 'proposal');
assert.equal(explicit.proposal.id, 'PROP-001');
assert.equal(explicit.proposal.eligibility, 'ready-to-materialize');
```

The queue alternative list is the remaining selectable proposals from the winning tier only: eligible unfinished proposals when that tier is non-empty, otherwise implementation-ready proposals. Explicit mode reports the requested proposal while retaining the same queue-tier alternatives, excluding the explicit proposal if present.

Production mutations caught: selecting by ID instead of schedule in queue mode, silently replacing an explicit ID with the queue recommendation, or mixing the fallback tier into alternatives.

- [ ] **Step 3: Write the failing JSON and human-rendering tests**

Assert the complete literal JSON value, including nullable fields:

```js
assert.deepEqual(JSON.parse(renderProposalOrientationJson(queue)), {
  schemaVersion: 1,
  mode: 'queue',
  proposal: {
    id: 'PROP-002',
    title: 'Beta proposal',
    status: 'design-draft',
    workState: 'PLANNED',
    priority: 1,
    dependsOn: [],
    unsatisfiedDependencies: [],
    eligibility: 'eligible',
    nextAction: 'Resolve the first remaining beta design boundary.',
  },
  readyAlternatives: ['PROP-006'],
  needsHumanDecision: null,
  mutationPerformed: false,
});
```

For human output, assert each semantic label exactly once with tolerant value matching: `Proposal orientation`, `Proposal`, `Lifecycle`, `Work state`, `Priority`, `Dependencies`, `Eligibility`, `Next action`, `Why`, `Ready alternatives`, `Needs human decision`, and `Mutation performed: no`.

Production mutations caught: omitted nullable metadata, wrong schema version, missing required human facts, or a renderer claiming mutation.

- [ ] **Step 4: Write failing no-work and unknown-ID domain tests**

Assert that an empty queue derives:

```js
{
  schemaVersion: 1,
  mode: 'queue',
  proposal: null,
  readyAlternatives: [],
  needsHumanDecision: null,
  mutationPerformed: false,
}
```

Assert that `deriveProposalOrientation(proposals, 'PROP-999')` throws an error containing `unknown proposal PROP-999` rather than returning the queue recommendation.

Production mutations caught: inventing work for an empty queue or silently substituting a known proposal for an unknown explicit ID.

- [ ] **Step 5: Run the new derivation/rendering tests and verify RED**

Run:

```bash
node --test --test-name-pattern="orientation|lifecycle classification|no proposal work" scripts/proposals.test.mjs
```

Expected: FAIL because the three orientation exports do not exist.

- [ ] **Step 6: Implement the smallest pure orientation model**

Add lifecycle classification and normalized proposal projection without filesystem access. The projection must always contain:

```js
{
  id,
  title,
  status,
  workState: unfinishedStatuses.has(status) ? workState : null,
  priority,
  dependsOn,
  unsatisfiedDependencies,
  eligibility,
  nextAction: unfinishedStatuses.has(status)
    ? nextAction
    : status === 'implementation-ready'
      ? 'Materialize the accepted proposal into its target authoritative surfaces.'
      : null,
}
```

Set `needsHumanDecision` to the selected proposal's `nextAction` only when its work state is `PARKED`; otherwise use `null`. Derive `Why` from explicit selection, winning queue tier/order, blocked dependencies, parked state, ready-to-materialize state, terminal state, or the successful no-work result. Do not parse free-form action text to guess authority.

- [ ] **Step 7: Implement deterministic human and JSON renderers**

Use `JSON.stringify(orientation, null, 2)` plus a trailing newline for JSON. Build human output only from the normalized model, rendering absent values as `none` or `not applicable`, dependencies with their satisfied/unsatisfied state, and `Mutation performed: no`.

- [ ] **Step 8: Run all proposal tests and stage the orientation model**

```bash
pnpm test:proposals
git add scripts/proposals.mjs scripts/proposals.test.mjs
```

### Task 3: Expose read-only orientation through the repository CLI

**Files:**

- Modify: `scripts/proposals.test.mjs`
- Modify: `scripts/proposals.mjs`
- Modify: `package.json`

**Interfaces:**

- Consumes: Task 2 orientation derivation/renderers, `validateProposalDirectory`, and `checkProposalIndex`.
- Produces: `pnpm proposals:orient`, `pnpm proposals:orient PROP-NNN`, and `pnpm proposals:orient PROP-NNN --json`.

- [ ] **Step 1: Add a real CLI test helper**

Add a helper that invokes `process.execPath` with `scripts/proposals.mjs`, `--orient`, `--directory <fixture>`, and `--index <fixture README>`, plus optional ID/`--json` arguments. The helper must use `spawnSync` with `{ encoding: 'utf8' }` and assert only process output and filesystem state, not private CLI functions.

- [ ] **Step 2: Write failing CLI success tests**

Create a temporary proposal directory, write a current generated README with `renderProposalIndex`, snapshot every file's content, then assert:

```js
assert.equal(cli.status, 0);
assert.match(cli.stdout, /Proposal orientation/);
assert.match(cli.stdout, /Mutation performed: no/);
assert.equal(cli.stderr, '');
assert.deepEqual(await snapshotProposalDirectory(directory), before);
```

Add explicit-ID JSON coverage that parses stdout and checks `mode: 'proposal'`, the requested ID, explicit null fields, and `mutationPerformed: false`.

Production mutations caught: writing during orientation, ignoring explicit IDs, or emitting non-JSON output under `--json`.

- [ ] **Step 3: Write failing CLI guard tests**

Cover four separate controlled directories:

- malformed/invalid metadata;
- a dependency cycle;
- a stale `README.md`;
- an unknown explicit ID.

For each, snapshot files, assert a non-zero exit status, assert stderr names the actual fault, assert stdout contains no `Proposal orientation` and no proposal recommendation, and assert the snapshot is unchanged.

Production mutations caught: orienting after failed validation, orienting against a stale index, or falling back after an unknown ID.

- [ ] **Step 4: Write the successful no-work CLI test**

Use a current empty proposal index and assert status `0`, `proposal: null`, empty `readyAlternatives`, `mutationPerformed: false`, and unchanged files.

- [ ] **Step 5: Run the CLI tests and verify RED**

Run:

```bash
node --test --test-name-pattern="orientation CLI" scripts/proposals.test.mjs
```

Expected: FAIL because `--orient`, positional IDs, and `--json` are not dispatched.

- [ ] **Step 6: Extend argument parsing and CLI dispatch**

Parse modes with explicit precedence and validation:

```js
{
  mode: 'check' | 'write' | 'orient',
  directory,
  index,
  proposalId: string | null,
  json: boolean,
}
```

Reject more than one positional ID and unknown flags. In orient mode, perform these operations in order: validate directory, check current index, derive orientation, render requested format, write only to stdout. An error must set a non-zero exit code and return before rendering a recommendation.

- [ ] **Step 7: Add the package command and verify all CLI cases**

Add:

```json
"proposals:orient": "node scripts/proposals.mjs --orient"
```

Run:

```bash
pnpm test:proposals
pnpm proposals:orient --json
pnpm proposals:orient PROP-009 --json
```

Expected: tests pass; queue output reports the same recommendation as the generated index; explicit output reports PROP-009 as `ready-to-materialize`; both JSON documents report `mutationPerformed: false`.

- [ ] **Step 8: Stage the CLI increment**

```bash
git add scripts/proposals.mjs scripts/proposals.test.mjs package.json
```

### Task 4: Publish the workflow standard and reconcile repository guidance

**Files:**

- Create: `docs/standards/dle-proposal-workflow-v1.md`
- Modify: `docs/proposals/TEMPLATE.md`
- Modify: `docs/proposals/PROP-002-dle-project-instance-consumption.md`
- Modify: `docs/proposals/PROP-003-dwf-project-instance-mode.md`
- Modify: `docs/proposals/PROP-004-irs-project-instance-mode.md`
- Modify: `docs/proposals/PROP-005-dle-host-and-distribution.md`
- Modify: `docs/proposals/PROP-006-irs-default-router-invocation.md`
- Modify: `docs/proposals/PROP-008-dle-blueprint-and-distribution-kit-terminology.md`
- Modify: `docs/proposals/README.md` through `pnpm proposals:index`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/README.md`

**Interfaces:**

- Consumes: the accepted decisions and exact initial actions in PROP-009 plus the Task 3 CLI.
- Produces: the authoritative Proposal Workflow V1 and aligned author/agent navigation.

- [ ] **Step 1: Publish the authoritative standard**

Create `docs/standards/dle-proposal-workflow-v1.md` with these normative sections:

- scope and authority;
- lifecycle and work-state inputs inherited from proposal governance;
- queue selection versus explicit proposal selection;
- actionable `nextAction` requirements for PLANNED, CHECKPOINTED, and PARKED;
- read-only human and schema-version-1 JSON orientation contracts;
- the eight-step agent operating sequence from PROP-009;
- exactly-one durable session-ending outcome;
- human promotion gates;
- materialization and promotion-record requirements;
- invalid-state, stale-index, unknown-ID, and no-work behavior;
- compatibility and non-goals.

State the Task 2 derivations explicitly: alternatives come only from the winning scheduling tier, explicit selection never changes queue order, parked work reports its resumption condition as `needsHumanDecision`, and no-work uses `proposal: null`.

- [ ] **Step 2: Tighten the proposal template**

Require a non-empty, one-sentence `nextAction` for all unfinished statuses and document the three state-specific meanings. Add the session-ending and human-authority reminders, while retaining the rule that completed-design statuses omit `workState` and `nextAction`.

- [ ] **Step 3: Apply the accepted initial metadata reconciliation**

Add only these frontmatter values; do not alter lifecycle, work state, dependencies, priority, or proposal body design:

```yaml
PROP-002: Decide the PIP relationship for external and zero-context handoff.
PROP-003: Finalize the Topic frontmatter and body contract and its validation rules.
PROP-004: Define project-instance profile identity and authority-change semantics.
PROP-005: Specify the composition artifact path, schema, and canonical serialization.
PROP-006: Define the bounded workspace and run discovery rule.
PROP-008: Obtain human acceptance of the exact shorter Blueprint name.
```

- [ ] **Step 4: Align root agent and human navigation**

Add concise proposal routing to `AGENTS.md`: validate and orient first; explicit selection wins; read only the selected proposal and needed authority; keep `ACTIVE` chat-local; persist exactly one allowed session outcome; regenerate and validate after metadata mutation; never infer human promotion authority.

Link DLE Proposal Workflow V1 from the standards lists in root `README.md` and `docs/README.md` without changing component contract descriptions.

- [ ] **Step 5: Regenerate the derived index and format changed files**

Run:

```bash
pnpm proposals:index
pnpm exec prettier --write AGENTS.md README.md docs/README.md docs/standards/dle-proposal-workflow-v1.md docs/proposals/TEMPLATE.md docs/proposals/PROP-002-dle-project-instance-consumption.md docs/proposals/PROP-003-dwf-project-instance-mode.md docs/proposals/PROP-004-irs-project-instance-mode.md docs/proposals/PROP-005-dle-host-and-distribution.md docs/proposals/PROP-006-irs-default-router-invocation.md docs/proposals/PROP-008-dle-blueprint-and-distribution-kit-terminology.md docs/proposals/README.md
pnpm proposals:check
pnpm test:proposals
```

Expected: proposal metadata, graph, and generated index validate; all proposal tests pass.

- [ ] **Step 6: Stage the authoritative documentation increment**

```bash
git add AGENTS.md README.md docs/README.md docs/standards/dle-proposal-workflow-v1.md docs/proposals
```

### Task 5: Validate, review, and close PROP-009

**Files:**

- Modify: `docs/proposals/PROP-009-dle-proposal-workflow.md`
- Modify: `docs/proposals/README.md` through `pnpm proposals:index`

**Interfaces:**

- Consumes: all Task 1-4 commits and repository validation commands.
- Produces: a validated `implemented` proposal whose Promotion Record names the implementation-completing commit, followed by pushed `main`.

- [ ] **Step 1: Run focused behavioral verification**

Run:

```bash
pnpm proposals:check
pnpm proposals:orient --json
pnpm proposals:orient PROP-009 --json
pnpm test:proposals
```

Confirm queue/index recommendation equality, explicit PROP-009 selection, schema version 1, explicit nulls, and `mutationPerformed: false`.

- [ ] **Step 2: Run full repository validation**

Run:

```bash
pnpm validate
```

Expected: proposal check, formatting, lint, type-check, tests/coverage, and build all pass without component version changes.

- [ ] **Step 3: Review the complete implementation diff**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Verify all PROP-009 acceptance criteria are represented, no generated index was hand-edited, no component contract/version changed, and no unrelated file is included.

- [ ] **Step 4: Commit the atomic implementation and record its hash**

Stage the exact files named by Tasks 1-4, including `CONTRIBUTING.md` and this plan, then run:

```bash
git commit -m "feat: materialize proposal workflow v1"
git rev-parse HEAD
```

The implementation commit must contain the tightened validator and reconciled proposal metadata together.

- [ ] **Step 5: Record implementation using the completing commit**

Change PROP-009 frontmatter from `implementation-ready` to `implemented`. Replace `Not implemented.` with `Implemented by commit <full-hash> (`feat: materialize proposal workflow v1`).` and list the new standard, reconciled proposal metadata/template/index, proposal tooling/tests, package command, and repository guidance as authoritative surfaces.

- [ ] **Step 6: Regenerate, revalidate, and commit the promotion record**

Run:

```bash
pnpm proposals:index
pnpm proposals:check
pnpm proposals:orient PROP-009 --json
pnpm validate
git add docs/proposals/PROP-009-dle-proposal-workflow.md docs/proposals/README.md
git commit -m "docs: record proposal workflow implementation"
```

Expected: explicit PROP-009 orientation now reports `terminal`, the full validation passes, and the final commit contains only the proposal status/record and generated index update.

- [ ] **Step 7: Push and verify repository state**

```bash
git push origin main
git status --short --branch
```

Expected: `main` is synchronized with `origin/main` and the worktree is clean.

## Plan Self-Review

- Spec coverage: Tasks 1-5 cover every target surface, accepted decision, implementation-sequence item, and acceptance criterion in PROP-009.
- Placeholder scan: no TBD, deferred implementation, generic error-handling instruction, or unspecified test step remains.
- Type consistency: all tasks use the same normalized orientation field names and the same three exported orientation functions.
- Scope: this plan materializes PROP-009 only; PROP-010 should follow because it updates the workflow standard and proposal tooling created here, while PROP-001 remains an independent later materialization.
