---
id: PROP-008
title: DLE Blueprint and Distribution Kit terminology
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Replace two overly long or misleading DLE proposal names with terminology that reflects their actual responsibilities. The distribution name is settled as DLE Distribution Kit; the exact shorter name for the project namespace blueprint remains to be chosen.
dependsOn:
  - PROP-007
supersedes: []
decisionAuthority: repository-owner
lastReconciledAgainst: main@b14120ec965a0a46c845bfddd9bab167062703d9
affectedComponents:
  - dle
nextAction: Obtain human acceptance of the exact shorter Blueprint name.
---

# Proposal: DLE Blueprint and Distribution Kit Terminology

## Summary

Rename two DLE design concepts without changing their semantics.

The project-level namespace specification needs a shorter name containing **Blueprint**. The current “DLE Host and distribution” concept should be renamed **DLE Distribution Kit**, because the CLI is only one part of its distribution, installation, composition, validation, binding, and skill-discovery responsibility.

## Problem

The current names make the concepts harder to understand than necessary.

### Project Instance Consumption Profile

This concept is the blueprint and operating contract for the project-level DLE namespace. It defines the expected project directories, what each directory owns, and how DWF, DSF, IRS, and future components use the namespace.

“Project Instance Consumption Profile” is four words, abstract, and does not immediately communicate that it is the blueprint for the namespace.

### DLE Host and Distribution

This concept includes more than a host and more than a CLI. It covers the curated DLE distribution, exact component pins, integrity, compatibility, installation, local binding, project bootstrap, validation, documentation, skill discovery, and an umbrella CLI.

Calling the concept “Host and Distribution” over-emphasizes one implementation surface and under-describes the complete kit.

## Accepted Decisions

- The project namespace concept must receive a shorter name than `Project Instance Consumption Profile`.
- The new project namespace name must contain the word `Blueprint`.
- The concept remains the specification and operating contract for the project-level DLE namespace; the rename must not change its behavior.
- `DLE Host and Distribution` should be renamed **DLE Distribution Kit**.
- The DLE umbrella CLI is part of the Distribution Kit, not the name or whole identity of the kit.

## Recommended Blueprint Name

Recommended candidate:

```text
DLE Project Blueprint
```

This is a recommendation only. It is not yet an accepted final name.

## Target Surfaces After Final Acceptance

The later rename should update, atomically:

- proposal titles;
- proposal filenames/slugs while preserving `PROP-NNN` IDs;
- proposal frontmatter titles/summaries;
- `docs/proposals/README.md`;
- links between proposals;
- references in standards, component READMEs, repository README, and agent guidance;
- future Host/Distribution terminology in proposal bodies; and
- any validation fixtures or tests that encode the old names.

The rename must preserve Git history.

## Non-Goals

This proposal does not:

- change the project namespace layout;
- change DWF, DSF, IRS, or AOS responsibilities;
- decide Distribution Kit implementation;
- rename a first-class DLE component;
- make the umbrella CLI a first-class component;
- change proposal IDs;
- implement project-instance mode; or
- alter any public runtime contract merely to improve terminology.

## Compatibility and Versioning

Proposal/document renames are repository documentation changes until the terminology appears in a released public contract. If already materialized contract text uses an old name, the implementing change must assess whether a component or standard version update is required.

Stable proposal IDs remain unchanged through renames.

## Implementation Sequence

Do not implement the complete rename until the exact Blueprint name is accepted.

After acceptance:

1. refresh `main` and search all references;
2. rename PROP-002 while preserving its ID;
3. rename PROP-005 to DLE Distribution Kit while preserving its ID;
4. update all metadata, links, and derived indexes;
5. run proposal validation and full repository validation;
6. record the rename in this proposal's promotion record.

## Acceptance Criteria

1. The final Blueprint name is explicitly accepted.
2. The final name is shorter than `Project Instance Consumption Profile`.
3. The final name contains `Blueprint`.
4. `DLE Distribution Kit` is used consistently for the former Host/Distribution concept.
5. Proposal IDs remain unchanged.
6. No repository reference uses the superseded names except deliberate historical provenance.
7. Proposal/index validation and `pnpm validate` pass.

## Open Questions

1. Is the final project namespace name **DLE Project Blueprint**, **Project Blueprint**, or another accepted shorter name containing `Blueprint`?
2. Should explanatory prose retain “project instance” as a generic lowercase term after the formal concept is renamed?

## Promotion Record

Not implemented.
