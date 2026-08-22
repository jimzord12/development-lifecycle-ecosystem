---
id: PROP-003
title: DWF project instance workflow
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Define the future DWF workflow that persists design work directly into the
  canonical project-instance design, Delivery, and Topic files and migrates
  legacy DWF workspaces without retaining PIP as a permanent mode.
dependsOn:
  - PROP-002
  - PROP-005
supersedes:
  - DWF-on-instance and Topic portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner
lastReconciledAgainst: main@b01da4fb01b94b0d3d626d404197bf0696b7c512
affectedComponents:
  - dwf
nextAction: Finalize the Topic file contract, direct-persistence validation rules, and one-way migration from legacy DWF workspaces.
---

# Proposal: DWF Project Instance Workflow

## Summary

Define DWF's future workflow for the [DLE project instance model](./PROP-002-dle-project-instance-model.md). DWF persists design work directly into project-owned `design/`, `delivery/`, and `topics/` files. Accepted design and Delivery files remain canonical implementation-facing truth; Topics preserve bounded continuation context and never override that truth.

This workflow is the breaking replacement line for the released Workspace ZIP, Package, and PIP-centered DWF model, not an additional permanent mode. Current released DWF behavior remains materialized authority for legacy projects until this proposal is implemented. Legacy workspaces and PIPs become one-way migration inputs.

## Problem

The released DWF flow treats a versioned Design Workspace as its persistence container and materializes a separate PIP for implementation handoff. In the accepted project instance model, that creates duplicate authority and packaging work around files that already have one durable project owner.

DWF needs to preserve its design discipline and fresh-agent continuity while writing canonical project files directly, declaring which files participate in design/Delivery change detection, and migrating legacy workspace truth without recreating package authority.

## Future DWF Model

DWF operates on these project-instance surfaces:

```text
<project-instance>/
├── design/
├── delivery/
└── topics/
```

- `design/` contains DWF-owned canonical product and technical design truth.
- `delivery/` contains the DSF-owned canonical Delivery Definition that DWF may prepare through the DSF public contract.
- `topics/` contains DWF-owned continuation records for bounded design work, not product authority.

Workspace ZIP and PIP are not future alternatives to this layout. DWF does not generate PIPs, Package Amendments, framework copies, or a renamed implementation package in the new line.

## Canonical Ownership and Change Detection

DWF must publish the exact membership and normalization rules for every canonical design file that participates in the umbrella `designDeliveryManifest`. DSF remains the sole owner of the corresponding Delivery membership and serialization contract.

The DWF contract must:

- identify required and optional canonical design paths;
- identify canonical projections even when they are generated;
- define portable text normalization where DWF owns the format;
- reject overlapping canonical owners;
- keep Topics, caches, temporary work, and noncanonical generated artifacts out of the manifest; and
- provide deterministic structural validation that can be invoked during continuation and project-change review.

DWF declares file membership and validates design meaning. The Distribution Kit and IRS may consume the resulting manifest evidence through their own public boundaries, but neither may infer DWF membership from directory scanning alone.

## Topic Continuation Contract

A Topic is one bounded, non-authoritative design-work continuation record. A likely project shape remains:

```text
topics/NNN-slug.md
```

The exact frontmatter and body contract remains to be finalized here. It must preserve these accepted rules:

- persisted states are bounded equivalents of `PLANNED`, `CHECKPOINTED`, `PARKED`, and terminal completion;
- `ACTIVE` remains conversation-local;
- Design Pace (`NORMAL` or `FAST`) remains conversation-local;
- harness/session identity is optional convenience metadata, never required authority;
- user-owned token or duration data is never inferred;
- touched paths are navigation/impact hints, not authority;
- the body is sufficient for a fresh capable agent to resume without a transcript; and
- accepted conclusions are promoted into canonical design or Delivery files rather than duplicated in the Topic.

A completed Topic is historical and cannot silently reopen. A stale Topic never overrides current canonical files.

## Orientation and Direct Persistence

After the Distribution Kit has located and validated the project root and component requirements, the DWF skill may orient to canonical design/Delivery navigation and the minimum Topic set needed to present eligible work. It must not guess the project root through unsafe recursive discovery.

After explicit Topic selection, DWF retains the established lifecycle behavior:

- `PLANNED` begins from the Topic purpose, activation gate, and current canonical truth;
- `CHECKPOINTED` resumes from its continuation distillate;
- `PARKED` remains outside normal priority until explicitly selected; and
- terminal Topics remain historical.

Checkpoint, Park, and Finalize write the project instance directly. Their exact write sets and validation rules must be defined before promotion. They do not increment a Workspace revision, produce a Workspace ZIP, or generate a PIP merely for persistence or transfer.

Git may support collaboration and recovery, but it is not a DWF command, persistence prerequisite, or substitute for canonical ownership.

## Preserved DWF Decisions

The new persistence model does not weaken DWF method constraints. It preserves:

- explicit product and technical decision acceptance;
- NORMAL and FAST boundaries, including FAST's bounded delegation rules;
- one canonical owner per fact;
- Agent projections before Human projections;
- Maintenance and Audit distinctions;
- Open Question and Open Decision ownership;
- deterministic derived navigation; and
- the rule that continuation history cannot override accepted truth.

The exact project-instance file set may differ from legacy package projections, but ownership semantics remain explicit.

## One-Way Legacy Migration

DWF owns conversion of available legacy design material during `Upgrade this project`. Its detailed migration contract must:

1. validate the source Workspace and all available DWF-owned package projections;
2. compare canonical Workspace truth with accepted later PIP or Package Amendment projections so no accepted design change is silently lost;
3. stop and recommend a human resolution when sources conflict beyond accepted deterministic rules;
4. write canonical project-instance design, Delivery, and truthful Topic continuation into a new migration target;
5. preserve the legacy Workspace and package material as historical evidence until coordinated cutover succeeds; and
6. provide no automatic reverse conversion.

Migration must not invent missing Topics, design-session history, or decisions. The Distribution Kit owns target-root creation and coordinated cutover; IRS owns conversion of implementation records.

## Component Boundaries

DWF owns design method, design-file membership, Topic contracts, direct design persistence, validation, and legacy DWF migration. It does not own:

- the project metadata path, `projectId`, `dleComponents`, install/store, or local binding schema, which belong to [DLE Distribution Kit](./PROP-005-dle-distribution-kit.md);
- Delivery semantics or canonical Delivery serialization, which remain DSF-owned;
- `implementationBaseline`, repository continuation, implementation revalidation, or IRS tracker migration, which belong to [IRS project instance runs](./PROP-004-irs-project-instance-runs.md); or
- a shared DLE runtime or provider-specific skill installation contract.

When implementation reveals a Design Gap, IRS records the active gap and its implementation consequences. Human-authorized design resolution then returns through DWF to update canonical design and, through DSF boundaries where required, Delivery.

## Compatibility and Release

The project-instance workflow is a breaking replacement for DWF's Workspace ZIP/PIP-centered current line. A new DWF release must expose one unambiguous project-instance public contract and one-way migration path; it must not keep two permanent authority architectures or heuristic mode selection.

Released legacy DWF versions remain immutable and usable for projects that have not upgraded. Their Workspace ZIP and PIP behavior is not edited by this proposal.

The Distribution Kit must define project composition and binding first. DWF then releases the direct workflow as part of the coordinated compatible release set described by PROP-002.

## Promotion Path

Before this proposal becomes `implementation-ready`:

1. Finalize the Topic frontmatter, body, status, and validation contract.
2. Specify exact canonical design-file membership and portable normalization for `designDeliveryManifest`.
3. Define deterministic root-relative direct-persistence write sets, validation, and recovery behavior.
4. Define orientation, Checkpoint, Park, Finalize, Maintenance, and Audit behavior for project-instance files.
5. Define one-way migration from legacy Workspaces and comparison with available PIP/Amendment projections.
6. Specify fresh-agent, cross-platform, and migration evaluations.
7. Define the breaking DWF release and its place in the coordinated release set.

## Acceptance Criteria for a Later Implementation

1. A fresh agent can orient from a validated project instance and present eligible Topics without prior chat history.
2. Checkpoint, Park, and Finalize update the correct canonical files and Topic state without producing Workspace ZIP or PIP artifacts.
3. The published DWF membership contract makes `designDeliveryManifest` deterministic and excludes Topics and non-authoritative files.
4. Topic content supports continuation but cannot override canonical design or Delivery.
5. NORMAL/FAST, single-owner, Agent-before-Human, and Topic-continuation rules remain intact.
6. One-way migration preserves every determinable accepted legacy decision, stops on genuine conflicts, and never mutates the active legacy source in place.
7. The new release contains no PIP generation, Package Amendment, dual-mode routing, or renamed package equivalent.
8. Project root, component distribution, Delivery meaning, and IRS state remain with their owning contracts.

## Open Questions

1. What exact Topic schema, required fields, body sections, and status transitions are public?
2. Which design files and canonical projections participate in `designDeliveryManifest`, and what normalization does each format require?
3. What atomicity and recovery rules govern multi-file direct persistence?
4. How do Checkpoint, Park, Finalize, Maintenance, and Audit differ in their project-instance write sets?
5. What deterministic comparison resolves or reports legacy Workspace versus amended-PIP differences?
6. Which fixtures and evaluations prove fresh-agent continuation and one-way migration across supported operating systems?

## Promotion Record

Not implemented.
