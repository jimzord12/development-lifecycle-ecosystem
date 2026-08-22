---
id: PROP-003
title: DWF project-instance mode
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Add a DWF consumption mode that persists design work directly into project-owned design, delivery, and Topic files. Workspace ZIP transport is not the daily persistence mechanism, while accepted design and Delivery files remain canonical implementation-facing truth.
dependsOn:
  - PROP-002
supersedes:
  - DWF-on-instance and Topic portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner
lastReconciledAgainst: main@b14120ec965a0a46c845bfddd9bab167062703d9
affectedComponents:
  - dwf
nextAction: Finalize the Topic frontmatter and body contract and its validation rules.
---

# Proposal: DWF project-instance mode

## Summary

Add a DWF consumption mode for a live DLE project instance. In this mode, design work persists directly into project-owned `design/`, `delivery/`, and `topics/` files. Workspace ZIP transport is not the daily persistence mechanism. A Topic preserves resumable design context while accepted design and Delivery files remain the only canonical implementation-facing truth.

This is an additional mode under design, not a replacement for current DWF Protocol 031. Current Workspace ZIP, Design Session, Package, and PIP behavior remains authoritative until this proposal is accepted and released.

## Problem

Current DWF persistence assumes a canonical versioned Design Workspace transported as a complete Workspace ZIP. That works well for chat-to-chat recovery and bounded export, but it creates unnecessary packaging overhead when the same team operates a durable project instance next to the implementation repositories.

Project-instance mode needs to retain DWF's decision discipline and fresh-agent continuity while writing the real project files directly.

## Working model

### Canonical files

DWF operates on:

```text
<project-instance>/
├── design/
├── delivery/
└── topics/
```

`design/` and `delivery/` own accepted truth. Topics do not.

The implementation-facing design projection should retain the established ownership split, including accepted product decisions, technical decisions, Agent/Human PRD and SPEC outputs, Open Questions, and Open Decisions where applicable. This proposal does not redefine those schemas.

### Topic

A **DLE Topic** is the project-instance continuation unit for one bounded design area. It replaces Design Session only within this profile.

One Topic is stored as:

```text
topics/NNN-slug.md
```

Minimum frontmatter under discussion:

```yaml
status: PLANNED | CHECKPOINTED | PARKED | COMPLETE
nextAction: <short continuation instruction or null>
touches:
  - design/<path>
  - delivery/<path>
harness: <optional harness identity>
sessionId: <optional resumable chat/session identity>
duration: <optional user-recorded duration>
totalTokens: <optional user-owned value>
```

Rules:

- `ACTIVE` remains chat-local and is never persisted.
- Design Pace (`NORMAL` or `FAST`) remains chat-local and is never persisted.
- `sessionId` helps resume the original harness conversation but is never required for continuity.
- `totalTokens` is user-owned and must not be inferred.
- `touches` is navigation/impact metadata, not authority.
- The body is a lossless-enough distillate for a fresh capable agent, not a full transcript.
- A Topic must not duplicate full PRD, SPEC, or decision ledgers.

The final frontmatter schema and deterministic validation surface remain open.

### Orientation

The DWF skill should:

1. locate the bound project instance;
2. read the project entrypoint, current `design/`/`delivery/` orientation files, and Topic index/files needed to identify candidates;
3. rank eligible Topics using published DWF priority rules;
4. present candidates without auto-selecting one; and
5. accept ordinary-language user requests through the agent-mediated UX contract.

A fresh agent must be able to continue from canonical files plus the Topic distillate without prior chat history.

### Start and resume

After explicit Topic selection:

- `PLANNED` begins from its purpose, activation gate, and current canonical truth;
- `CHECKPOINTED` resumes from its continuation distillate;
- `PARKED` may be explicitly resumed but remains outside normal priority until selected;
- `COMPLETE` is historical and must not be silently reopened.

The agent resolves `NORMAL` or `FAST` before substantive design work unless the user already selected the pace.

### Direct persistence

Project-instance mode reuses DWF's conceptual operations but changes their transport effect:

| Operation  | Required effect                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Checkpoint | Promote only settled decisions that belong in canonical ledgers; refresh the Topic distillate; mark `CHECKPOINTED`; write the real files. |
| Park       | Apply the same safe persistence as Checkpoint; mark `PARKED`.                                                                             |
| Finalize   | Persist settled conclusions, regenerate required Agent then Human outputs in DWF order, update navigation, and mark `COMPLETE`.           |

Checkpoint, Park, and Finalize write the project instance directly. They do not increment an integer Workspace Revision or create a Workspace ZIP merely for persistence.

Git may provide collaboration and rollback, but it is not a DWF command, persistence prerequisite, or substitute for canonical file ownership.

### No silent semantic changes

Project-instance mode must preserve:

- explicit acceptance rules for product and technical decisions;
- FAST's bounded delegation limits;
- single-owner file rules;
- Agent-before-Human projection order;
- Maintenance/Audit distinctions;
- Open Question and Open Decision ownership;
- Design Package vs PIP distinction; and
- DWF's rule that historical continuation material cannot override accepted truth.

## Relationship to PIP and external handoff

This proposal does not decide whether or how a live instance produces a PIP. It only states that same-team persistence does not require one.

If external handoff remains a supported product, PIP generation must be a separate deterministic projection from the current live instance. It must not reintroduce a second mutable design tree or silently change DWF's fixed Design Package meaning.

## Deferred DWF capabilities

The first project-instance release should not automatically port every DWF capability. Explicitly deferred until separately specified:

- nine-file Design Package generation from the live instance;
- MiniCourse integration;
- Audit/Maintain behavior specific to Topics;
- historical Workspace ZIP import/export;
- automatic conversion of old Design Sessions into Topics; and
- PIP generation from the live instance.

These may be added later without blocking the core orientation/persistence loop if their absence is documented.

## Non-goals

This proposal does not:

- change DSF Delivery semantics;
- define IRS behavior without PIP;
- define Host installation or project binding;
- make Git mandatory;
- store full chat transcripts;
- persist chat-local `ACTIVE` or Design Pace;
- remove current Workspace ZIP mode; or
- authorize an existing project cutover.

## Compatibility and versioning

Project-instance mode is a public DWF capability. It requires a new DWF release and a protocol/public-contract revision or a separately versioned profile owned by DWF. The exact version is unresolved until the file/schema and backward-compatibility boundary are fixed.

The release must state whether one DWF installation supports both Workspace ZIP mode and project-instance mode, and how a consumer selects the mode without heuristic guessing.

## Promotion path

Before this proposal becomes `implementation-ready`:

1. Finalize the Topic frontmatter/body contract and validation rules.
2. Define the project-instance entrypoint and deterministic root discovery/binding contract.
3. Decide whether project-instance behavior is incorporated into the main Workspace Protocol or published as a separately versioned DWF profile.
4. Define mode selection and coexistence with current Workspace ZIP mode.
5. Define migration/cutover from an existing Design Workspace when requested.
6. Decide the minimal first-release treatment of Package, PIP, MiniCourse, and Maintenance/Audit.

## Acceptance criteria for a later implementation

1. A fresh capable agent can orient from a project instance and present eligible Topics without prior chat history.
2. Checkpoint, Park, and Finalize persist the correct canonical files and Topic status without creating a Workspace ZIP.
3. Topic content is sufficient for continuation but cannot override accepted design/Delivery truth.
4. `ACTIVE`, Design Pace, and machine-specific harness/session details do not become canonical product truth.
5. Current Workspace ZIP mode remains valid and its behavior is unchanged unless an explicitly accepted migration says otherwise.
6. Deterministic validation detects malformed Topic metadata, missing required project files, and ownership conflicts.
7. Provider/harness-neutral interaction conforms to [Agent UX and harness agnosticism](./PROP-001-dle-agent-ux-and-harness-agnosticism.md).

## Open questions

1. What exact Topic schema, required fields, and allowed status transitions are public?
2. Is project-instance mode part of Workspace Protocol 032+ or a separate DWF profile/standard?
3. How is the instance root discovered without unsafe recursive scanning?
4. How do existing Design Sessions migrate to Topics, if migration is offered?
5. Which derived capabilities ship in the first release: Package, PIP, MiniCourse, Audit/Maintain?
6. What deterministic validation command or script owns this mode?

## Promotion record

Not implemented.
