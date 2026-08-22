---
id: PROP-007
title: DLE proposal identity, dependency, and work-state governance
status: implemented
priority: 1
summary: >-
  Introduce immutable PROP-NNN identifiers, YAML-owned proposal metadata, an acyclic dependency graph, explicit priority, and separate conversational work state. Derive the proposal index and next-work recommendation from proposal files and validate the model deterministically.
dependsOn: []
supersedes: []
decisionAuthority: repository-owner
lastReconciledAgainst: main@b14120ec965a0a46c845bfddd9bab167062703d9
affectedComponents:
  - dle
---

# Proposal: DLE Proposal Identity, Dependency, and Work-State Governance

## Summary

Introduce a small deterministic governance model for DLE proposals. Every proposal receives an immutable `PROP-NNN` identity and canonical YAML frontmatter for lifecycle, work continuity, priority, summary, and direct dependency edges. The proposal index and dependency DAG are derived from proposal files rather than maintained as competing manual truth.

## Problem

The current proposal directory uses descriptive filenames and prose metadata. That is readable, but it cannot reliably answer:

- which proposal has stable identity across renames;
- which proposal depends on which;
- whether the dependency graph contains a cycle;
- which interrupted proposal should be resumed;
- which planned proposal should be selected next;
- which proposals are parked or blocked;
- which accepted proposals are ready to materialize; or
- whether the README index has drifted from the proposal files.

Fresh-agent and returning-user orientation therefore depends too heavily on memory and ad hoc interpretation.

## Accepted Decisions

### Immutable proposal identity

- Proposal IDs use `PROP-NNN`.
- IDs are monotonic, immutable, and never reused.
- Filenames use `PROP-NNN-<slug>.md`.
- Renaming a proposal does not change its ID.

### Canonical frontmatter

Proposal YAML frontmatter owns:

- `id`
- `title`
- `status`
- `workState` when applicable
- `priority`
- `summary`
- `dependsOn`
- `supersedes`
- `decisionAuthority`
- `lastReconciledAgainst`
- `affectedComponents`
- `nextAction` when applicable

The proposal body remains ordinary Markdown and owns the design substance.

### Lifecycle and work continuity

`status` remains the authority/materialization lifecycle:

- `exploration`
- `design-draft`
- `implementation-ready`
- `implemented`
- `superseded`
- `rejected`

`workState` is separate and describes only unfinished design-conversation continuity:

- `PLANNED`
- `CHECKPOINTED`
- `PARKED`

`ACTIVE` is chat-local and is never persisted.

`nextAction` is required for `CHECKPOINTED` and `PARKED`. `workState` and `nextAction` are removed once the proposal is `implementation-ready`, `implemented`, `superseded`, or `rejected`.

### Summary

Every proposal has a required one-to-three-sentence frontmatter summary. Orientation and the derived index use this source rather than inventing new descriptions.

### Dependency graph

- `dependsOn` contains only direct proposal IDs.
- Reverse dependency information is derived.
- There is no second graph file.
- Unknown IDs, self-dependencies, and cycles are validation failures.
- Standards, released components, and other non-proposal constraints remain in the body or reconciliation metadata rather than becoming fake graph nodes.

### Priority and scheduling

Priority is an integer from `1` through `5`, where `1` is highest.

Among dependency-eligible unfinished design proposals:

1. `CHECKPOINTED`
2. `PLANNED`
3. exclude `PARKED`
4. lower priority number
5. lower proposal ID

A dependency is satisfied when its proposal is `implementation-ready` or `implemented`.

`implementation-ready` proposals are displayed separately as **Ready to Materialize** rather than treated as unfinished design work. When no unfinished design proposal is eligible, recommendation falls back to the highest-priority Ready to Materialize proposal, then lowest ID.

### Derived index

`docs/proposals/README.md` is a generated or deterministically checked navigation surface. Proposal files remain the sole metadata authority.

## Normative Frontmatter Shape

```yaml
---
id: PROP-012
title: Example proposal
status: design-draft
workState: CHECKPOINTED
priority: 3
summary: >-
  A concise one-to-three-sentence summary used by orientation and indexes.
dependsOn:
  - PROP-004
supersedes: []
decisionAuthority: repository-owner
lastReconciledAgainst: main@<commit-sha>
affectedComponents:
  - dwf
nextAction: Decide the remaining validation boundary.
---
```

## Initial Migration

Assign current proposal IDs deterministically:

| ID         | Current proposal                               |
| ---------- | ---------------------------------------------- |
| `PROP-001` | DLE agent UX and harness agnosticism           |
| `PROP-002` | DLE project instance consumption profile       |
| `PROP-003` | DWF project-instance mode                      |
| `PROP-004` | IRS project-instance mode                      |
| `PROP-005` | DLE Host and distribution                      |
| `PROP-006` | IRS default router invocation                  |
| `PROP-007` | This proposal                                  |
| `PROP-008` | DLE Blueprint and Distribution Kit terminology |

For the initial migration:

- preserve existing lifecycle statuses;
- use `PLANNED` for existing `exploration`/`design-draft` proposals unless a real saved continuation requires another state;
- omit `workState` for `implementation-ready`;
- set existing proposals to neutral `priority: 3` unless already accepted repository authority provides another value;
- use the pre-change `main` SHA in `lastReconciledAgainst`;
- preserve historical supersession references;
- migrate only proposal-to-proposal dependencies into `dependsOn`;
- keep other constraints in the body.

## Dependency Correction During Migration

The current Project Instance Consumption and Host/Distribution proposals form a reciprocal dependency.

Correct it as follows:

```text
PROP-002 → no hard dependency on PROP-005
PROP-005 → depends on PROP-002
```

Also reconcile PROP-002 promotion wording so exact Distribution Kit implementation details are downstream rather than a prerequisite that prevents the blueprint proposal from becoming accepted. PROP-002 may require a clear abstract integration boundary, but PROP-005 owns the concrete distribution, composition, install, bind, and CLI design.

## Target Surfaces

At minimum:

- `docs/proposals/README.md`
- `docs/proposals/TEMPLATE.md`
- all current proposal files under `docs/proposals/`
- new `PROP-007` and `PROP-008` proposal files
- repository links that reference renamed proposal files
- the smallest deterministic proposal validation/index tooling
- root package scripts needed to include proposal validation in `pnpm validate`
- focused tests/fixtures for valid metadata, missing IDs, duplicate IDs, missing dependencies, self-dependency, cycle detection, work-state rules, priority bounds, and stale derived index

## Validation Contract

Deterministic validation must fail on at least:

- malformed or missing required frontmatter;
- invalid/duplicate ID;
- filename/ID mismatch;
- invalid status;
- invalid work state;
- missing `nextAction` for `CHECKPOINTED` or `PARKED`;
- work state retained on a status where design work is complete;
- priority outside `1..5`;
- empty summary or a summary outside the required one-to-three-sentence shape;
- unknown dependency ID;
- self-dependency;
- dependency cycle;
- stale derived README/index.

Use a maintained YAML parser rather than inventing an unsafe general YAML parser. Keep the implementation dependency-light and scoped to repository proposal governance.

## Non-Goals

This proposal does not:

- change DWF, DSF, IRS, or AOS semantics;
- make proposals runtime authority after implementation;
- create a general project-management system;
- add estimates, confidence scores, assignees, or sprint machinery;
- store chat transcripts in proposals;
- persist `ACTIVE`;
- create a second graph/index authority;
- decide the substance of existing proposal open questions; or
- commit ChatGPT Project Protocol 008 into the DLE repository.

## Compatibility and Versioning

This is repository governance and tooling. It does not change a first-class component public contract by itself and does not require coordinated component version bumps.

File renames must preserve Git history and all repository links must be updated atomically.

## Implementation Sequence

1. Add deterministic proposal parser/validator tests.
2. Add ID/frontmatter/index support.
3. Rename and migrate current proposals.
4. Apply the reciprocal-dependency correction.
5. Add PROP-007 and PROP-008.
6. Regenerate/check `docs/proposals/README.md`.
7. Update repository links and agent guidance where needed.
8. Run `pnpm validate`.
9. Mark this proposal `implemented` and complete its promotion record in the same final change only after all acceptance criteria pass.

## Acceptance Criteria

1. Every current proposal has one unique immutable `PROP-NNN` ID.
2. Every filename begins with its ID.
3. All required metadata is in YAML frontmatter.
4. The proposal graph is acyclic.
5. PROP-002 no longer hard-depends on PROP-005; PROP-005 depends on PROP-002.
6. The derived index accurately reflects proposal files.
7. Scheduling can deterministically identify checkpointed, planned, parked, dependency-blocked, and ready-to-materialize proposals.
8. Validation covers all required failure cases.
9. All renamed-file links resolve.
10. `pnpm validate` passes.
11. This proposal is promoted to `implemented` with the landing commit recorded.

## Open Questions

None that block implementation.

## Promotion Record

Implemented by commit `e2010a0f849584a76390e52581c1ee7b075171dd` (`feat: add deterministic proposal governance`).

Authoritative repository surfaces:

- proposal identity and metadata in `docs/proposals/PROP-*.md`;
- authoring rules in `docs/proposals/TEMPLATE.md`;
- the derived orientation index in `docs/proposals/README.md`;
- deterministic parsing, validation, scheduling, and index generation in `scripts/proposals.mjs`;
- governance tests and fixtures under `scripts/`; and
- root package commands, including proposal checking in `pnpm validate`.
