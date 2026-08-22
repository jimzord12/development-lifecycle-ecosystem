---
id: PROP-010
title: DLE proposal active-root and terminal archive organization
status: implementation-ready
priority: 1
summary: >-
  Keep actionable proposals at the root of docs/proposals while moving implemented, superseded, and rejected proposals into status-specific terminal archive directories. Preserve stable proposal IDs, recursive discovery, valid links, deterministic orientation, and Git history through every terminal transition.
dependsOn:
  - PROP-007
  - PROP-009
supersedes: []
decisionAuthority: repository-owner; accepted in the 2026-08-22 design discussion
lastReconciledAgainst: main@5a7d280ebdefbacc418714f2e1cad3217c52d64f
affectedComponents:
  - dle
---

# Proposal: DLE Proposal Active-Root and Terminal Archive Organization

## Summary

Make the proposal directory useful as a direct work surface. Keep unfinished and ready-to-materialize proposals at its root, while moving terminal implemented, superseded, and rejected proposals into status-specific archive directories.

The layout is derived from lifecycle metadata rather than becoming a second status authority. Proposal IDs remain stable across moves, and validation must recursively discover every proposal, enforce path/status consistency, preserve resolvable links, and exclude terminal records from work selection.

## Problem

A flat proposal directory keeps history visible but mixes work candidates with completed or declined records. As the proposal set grows, a user opening `docs/proposals/` must mentally filter implemented, superseded, and rejected proposals before finding work that can still advance.

The current generated index performs that filtering semantically, but the filesystem itself does not. A lifecycle-aware directory policy can reduce navigation load as long as it avoids frequent path churn, duplicate registries, broken links, and status encoded independently in two places.

## Accepted Decisions

### Active root and terminal archive

Use this layout:

```text
docs/proposals/
├── README.md
├── TEMPLATE.md
├── PROP-NNN-<slug>.md
└── archive/
    ├── implemented/
    │   └── PROP-NNN-<slug>.md
    ├── superseded/
    │   └── PROP-NNN-<slug>.md
    └── rejected/
        └── PROP-NNN-<slug>.md
```

Location rules:

| Lifecycle status       | Required location                     |
| ---------------------- | ------------------------------------- |
| `exploration`          | `docs/proposals/`                     |
| `design-draft`         | `docs/proposals/`                     |
| `implementation-ready` | `docs/proposals/`                     |
| `implemented`          | `docs/proposals/archive/implemented/` |
| `superseded`           | `docs/proposals/archive/superseded/`  |
| `rejected`             | `docs/proposals/archive/rejected/`    |

Lifecycle frontmatter remains the authority. Directory placement is a validated projection of that status.

Create terminal directories when their first proposal is moved there. Do not add placeholder files merely to keep empty status directories in Git.

### Work state does not control location

`PLANNED`, `CHECKPOINTED`, and `PARKED` are conversational continuity states, not filesystem categories. All unfinished proposals remain at the proposal root.

A parked proposal remains visible because it is unfinished and may be explicitly resumed. Scheduling and orientation continue to exclude it from automatic selection.

Do not add work-state, priority, component, assignee, year, or topic directories.

### Recursive identity and discovery

Proposal tooling must recursively discover proposal Markdown files under `docs/proposals/`, excluding only recognized non-proposal navigation/template files.

Across the complete recursive set, validation must enforce:

- unique immutable `PROP-NNN` IDs;
- filename and ID agreement;
- the next monotonic ID across active and archived proposals;
- metadata and dependency validity;
- an acyclic graph;
- status-to-directory agreement; and
- current generated index links.

Archive directories must not create a second registry, graph, or metadata authority.

### Atomic terminal transition

Changing a proposal to `implemented`, `superseded`, or `rejected` must be one coherent change that:

1. records the human-authorized or implementation-proven terminal status;
2. removes `workState` and `nextAction`;
3. completes the Promotion, Supersession, or Rejection record in the proposal body;
4. uses a Git-aware move into the matching terminal directory;
5. updates every repository link to the new path;
6. regenerates the proposal index; and
7. runs proposal link checks, proposal validation, and the broader validation required by changed authoritative surfaces.

Do not leave a terminal proposal at the root, move an unfinished proposal into the archive, or split metadata and path updates across a pushed invalid state.

### Stable identity, movable path

The `PROP-NNN` ID is stable; the path is not an identity. A terminal move must retain the same ID, filename, title, metadata, body, and Git history except for the authorized lifecycle/closure changes.

Do not leave redirect stubs, duplicate copies, symlinks, junctions, generated mirrors, or an ID-to-path registry. They would add competing navigation surfaces or cross-platform behavior without preserving proposal authority.

### Terminal records do not reopen

An implemented, superseded, or rejected proposal is terminal. Further design must use a new monotonic proposal ID and express historical replacement through `supersedes` where applicable.

Do not move a terminal proposal back to the root or change it to an unfinished lifecycle status.

### Index and orientation behavior

The generated root `README.md` must continue to show all proposals, including archived records, grouped by lifecycle purpose. Links must use each proposal's recursively discovered relative path.

The PROP-009 orientation command must:

- exclude terminal proposals from automatic next-work selection;
- find an explicitly requested ID in the root or archive;
- report archived proposals as terminal with no next work action; and
- remain read-only.

The proposal root therefore supports quick filesystem orientation without hiding historical provenance from the generated index or explicit-ID lookup.

## Initial Migration

When this proposal is materialized:

- move every proposal already marked `implemented` into `archive/implemented/`;
- move any existing `superseded` proposal into `archive/superseded/`;
- move any existing `rejected` proposal into `archive/rejected/`;
- update all repository links atomically; and
- regenerate the root proposal index from recursive discovery.

The implementing proposal itself must move into `archive/implemented/` when its final status becomes `implemented`.

No proposal may change lifecycle, priority, dependency, title, or design substance merely because its path is reconciled.

## Normative Requirements

1. Proposal discovery must be recursive and deterministic.
2. Discovery order must not affect validation, scheduling, orientation, or generated output.
3. The validator must fail a proposal whose lifecycle status does not match its required directory.
4. Duplicate IDs must fail even when the duplicates are in different directories.
5. Dependency resolution must use IDs across the recursive proposal set, never relative paths.
6. The generated index must link to active and archived proposals using correct paths relative to `docs/proposals/README.md`.
7. Proposal link validation must cover root and archived proposal files.
8. Automatic next-work derivation must consider only unfinished and implementation-ready proposals.
9. Explicit-ID orientation must find terminal proposals and report terminal state without recommending mutation.
10. Terminal transitions must preserve Git history through Git-aware moves.
11. Terminal proposals must not be reopened; follow-up design uses a new proposal.
12. Empty archive status directories must not require placeholder files.

## Target Surfaces

At minimum:

- `docs/proposals/README.md` through deterministic generation;
- `docs/proposals/TEMPLATE.md` where path/closure guidance belongs;
- `docs/proposals/archive/<terminal-status>/` as required by current records;
- all proposal links affected by initial and later moves;
- `docs/standards/dle-proposal-workflow-v1.md` terminal-transition guidance;
- `scripts/proposals.mjs` recursive discovery, path validation, link generation, scheduling, and orientation behavior;
- proposal tests and nested fixtures under `scripts/`;
- root `AGENTS.md` proposal-location guidance; and
- root package validation wiring if link checking gains a dedicated command.

No first-class component source, contract, manifest, or version changes.

## Non-Goals

This proposal does not:

- create a directory for each work state or priority;
- group proposals by component, assignee, date, or topic;
- create redirect stubs, duplicate files, symlinks, or a path registry;
- hide archived proposals from the generated index or explicit lookup;
- delete implemented, superseded, or rejected proposals;
- reopen terminal proposals;
- change proposal IDs during a move;
- make proposal paths dependency identifiers;
- implement general document archiving outside `docs/proposals/`; or
- change any DLE component runtime contract.

## Compatibility and Versioning

This is a repository organization and governance change. It does not change a first-class DLE component public contract or require component version bumps.

Existing links to terminal proposals must be updated atomically because repository-relative Markdown paths change. Stable `PROP-NNN` IDs preserve conceptual identity, while Git-aware moves preserve file history.

The PROP-009 workflow standard and orientation behavior must be updated in the same materialization so agents do not assume a flat proposal directory.

## Implementation Sequence

1. Add failing nested fixtures and tests for recursive discovery, cross-directory duplicate IDs, status/path mismatch, archived links, and terminal orientation.
2. Refactor proposal discovery to return deterministic paths relative to `docs/proposals/`.
3. Add status-to-directory validation and recursive link generation/checking.
4. Update scheduling and PROP-009 orientation to consume recursive discovery.
5. Update DLE Proposal Workflow V1, the template, and agent guidance.
6. Git-move existing terminal proposals into their required directories and update all links.
7. Regenerate the proposal index and run focused tests plus `pnpm validate`.
8. Mark this proposal `implemented`, complete its Promotion Record, Git-move it into `archive/implemented/`, regenerate again, and repeat validation.
9. Commit and push only a path-consistent, fully validated tree.

## Acceptance Criteria

1. The root of `docs/proposals/` contains only nonterminal proposals plus navigation/template files and `archive/`.
2. Every implemented proposal is under `archive/implemented/`.
3. Every superseded proposal is under `archive/superseded/`.
4. Every rejected proposal is under `archive/rejected/`.
5. Parked proposals remain at the root and outside automatic selection.
6. Recursive validation detects duplicate IDs, unknown dependencies, self-dependencies, cycles, and status/path mismatch.
7. The next monotonic ID considers root and archived proposals.
8. All proposal and repository links resolve after terminal moves.
9. The generated root index includes correct links to archived records.
10. Queue orientation excludes terminal proposals; explicit-ID orientation finds and accurately reports them.
11. Terminal moves preserve proposal IDs and Git history.
12. No redirect stub, duplicate registry, placeholder, symlink, or junction is added.
13. Terminal proposals cannot validate at the root, and unfinished proposals cannot validate in the archive.
14. `pnpm validate` passes and no component version changes.
15. This proposal finishes under `archive/implemented/` with its landing commit recorded.

## Open Questions

None that block implementation.

## Promotion Record

Not implemented.
