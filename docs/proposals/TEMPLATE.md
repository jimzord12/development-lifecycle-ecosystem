---
id: PROP-NNN
title: <title>
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Write a concise one-to-three-sentence summary used for orientation and the derived proposal index.
dependsOn:
  - PROP-NNN
supersedes: []
decisionAuthority: <human/project authority>
lastReconciledAgainst: <branch-or-release>@<commit-or-version>
affectedComponents:
  - <component-id-or-dle>
nextAction: null
---

# Proposal: <title>

## Frontmatter rules

- Replace `PROP-NNN` with the next monotonic proposal ID. IDs are immutable and never reused; filenames use `PROP-NNN-<slug>.md`.
- `summary` is required and contains one to three sentences.
- `dependsOn` lists direct proposal IDs only. Use `[]` when there are no proposal dependencies; keep standards, releases, and other non-proposal constraints in the body.
- `priority` is an integer from `1` (highest) through `5` (lowest).
- `workState` is required for unfinished `exploration` and `design-draft` proposals and is one of `PLANNED`, `CHECKPOINTED`, or `PARKED`. Never persist `ACTIVE`.
- `nextAction` must be a non-empty string for `CHECKPOINTED` and `PARKED`; it may be `null` or omitted for `PLANNED`.
- Omit both `workState` and `nextAction` for `implementation-ready`, `implemented`, `superseded`, and `rejected` proposals.
- An `implementation-ready` proposal must name exact target surfaces, normative requirements, non-goals, compatibility/versioning expectations, and deterministic acceptance criteria, with no blocking open question.

## Summary

State the proposed outcome in one paragraph.

## Problem

Describe the concrete problem and why current authority does not already solve it.

## Accepted decisions

List only decisions that have actually been accepted. Keep unresolved ideas under **Open questions**.

## Normative requirements

Use testable `must`, `must not`, `should`, and `may` statements. Keep the proposal framework-generic.

## Target surfaces

Name the exact standards, component contracts, schemas, fixtures, tests, code, migrations, and documentation expected to change.

## Non-goals

State nearby work that this proposal deliberately excludes.

## Compatibility and versioning

Describe public-contract impact, migration needs, release/version expectations, and compatibility boundaries.

## Implementation sequence

Give the smallest safe order of work. Omit this section for early exploration when sequencing is premature.

## Acceptance criteria

Provide deterministic checks that prove the change is complete. An `implementation-ready` proposal must have this section.

## Open questions

List unresolved decisions. An implementation-ready proposal must have no open question that blocks its stated implementation.

## Promotion record

When implemented, record the authoritative destination, release/version, and commit or pull request. Until then, write `Not implemented`.
