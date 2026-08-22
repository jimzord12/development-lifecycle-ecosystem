---
id: PROP-009
title: DLE Proposal Workflow V1
status: implemented
priority: 1
summary: >-
  Establish one explicit human-and-agent workflow for orienting, selecting, advancing, checkpointing, parking, promoting, materializing, and closing DLE proposals. Require an actionable continuation for every unfinished proposal and add deterministic read-only orientation in human and JSON forms.
dependsOn:
  - PROP-007
supersedes: []
decisionAuthority: repository-owner; accepted in the 2026-08-22 design discussion
lastReconciledAgainst: main@5a7d280ebdefbacc418714f2e1cad3217c52d64f
affectedComponents:
  - dle
---

# Proposal: DLE Proposal Workflow V1

## Summary

Define a small, explicit workflow that answers two separate questions: which proposal should receive work, and what exact action should happen next inside that proposal. Publish the workflow as a versioned DLE standard, require useful continuation metadata for all unfinished proposals, and provide deterministic read-only orientation for humans and agents.

The workflow builds on the identity, lifecycle, work-state, dependency, priority, and derived-index governance implemented by PROP-007. It does not create a project-management system or automate human design authority.

## Problem

Current governance can rank eligible proposals, but a user or fresh agent must still infer the correct operation and next action from proposal prose. This creates avoidable cognitive load and inconsistent behavior when starting, resuming, pausing, accepting, implementing, or closing proposal work.

In particular:

- `PLANNED` proposals may have a null `nextAction` even though they are eligible for selection;
- the index recommends a proposal but does not explain the local continuation action;
- no single authoritative procedure defines how a proposal-working session begins or ends;
- agents may persist state inconsistently when a conversation stops; and
- lifecycle promotion, implementation, and terminal closure are described across several surfaces rather than one operational standard.

## Accepted Decisions

### Separate queue selection from local continuation

The workflow must answer independently:

1. **Which proposal should receive work?** Derive this from lifecycle, work state, priority, and satisfied direct dependencies.
2. **What happens next inside it?** Read a required, actionable `nextAction` for unfinished proposals or derive the lifecycle-specific operation for implementation-ready and terminal proposals.

An explicitly selected proposal takes precedence over the automatic recommendation. The workflow must still report if that proposal is blocked, parked, ready to materialize, or terminal.

### Authoritative workflow standard

Create:

```text
docs/standards/dle-proposal-workflow-v1.md
```

The standard owns proposal-working operations, session boundaries, transition preconditions, human authority gates, orientation behavior, and closure requirements. Proposal files continue to own proposal-specific design and metadata.

### Work-state continuity

`ACTIVE` remains chat-local and must never be persisted.

Every unfinished `exploration` or `design-draft` proposal must persist:

- one of `PLANNED`, `CHECKPOINTED`, or `PARKED`; and
- a non-empty, actionable, one-sentence `nextAction`.

Meanings:

| Work state     | Required meaning of `nextAction`                               |
| -------------- | -------------------------------------------------------------- |
| `PLANNED`      | The first concrete action to take when selecting the proposal. |
| `CHECKPOINTED` | The exact continuation action from the saved work boundary.    |
| `PARKED`       | The condition or decision needed before useful work resumes.   |

Do not persist generic text such as “continue work,” a multi-step plan, a transcript, or an inferred product decision.

### Session-ending rule

A proposal-working session must end in exactly one durable outcome:

- return unfinished work to `PLANNED` with a concrete first action;
- save unfinished continuation as `CHECKPOINTED` with the next action;
- defer unfinished work as `PARKED` with the resumption condition;
- record a human-authorized lifecycle transition;
- complete materialization and mark the proposal `implemented`; or
- leave the file unchanged when the session was read-only.

The agent must regenerate and validate the proposal index after any metadata mutation.

### Human authority gates

Only the human design authority may set:

- `implementation-ready`;
- `rejected`; or
- `superseded`.

An agent may prepare a promotion-readiness assessment, identify unmet gates, and propose exact edits. It must not infer acceptance from silence or promote a proposal merely because validation passes.

`implemented` may be recorded only after the accepted substance is present in authoritative standards, contracts, schemas, fixtures, tests, or code; required validation succeeds; and the landing commit or authoritative release is recorded in the Promotion Record.

### Read-only orientation

Add these repository commands:

```text
pnpm proposals:orient
pnpm proposals:orient PROP-NNN
pnpm proposals:orient PROP-NNN --json
```

With no ID, orientation reports the deterministically recommended proposal. With an ID, it reports that proposal regardless of automatic scheduling. Orientation must perform no mutation.

Human output must include these semantic facts:

```text
Proposal orientation
Proposal: <id and title or none>
Lifecycle: <status>
Work state: <state or not applicable>
Priority: <1..5>
Dependencies: <direct IDs and satisfaction>
Eligibility: <eligible, blocked, parked, ready-to-materialize, or terminal>

Next action: <action or none>
Why: <deterministic scheduling or lifecycle reason>
Ready alternatives: <IDs or none>
Needs human decision: <exact decision or none>
Mutation performed: no
```

JSON output must use this shape:

```json
{
  "schemaVersion": 1,
  "mode": "queue",
  "proposal": {
    "id": "PROP-002",
    "title": "DLE project instance consumption profile",
    "status": "design-draft",
    "workState": "PLANNED",
    "priority": 3,
    "dependsOn": [],
    "unsatisfiedDependencies": [],
    "eligibility": "eligible",
    "nextAction": "Decide the first unresolved boundary."
  },
  "readyAlternatives": ["PROP-006", "PROP-008"],
  "needsHumanDecision": null,
  "mutationPerformed": false
}
```

`mode` is `queue` without an ID and `proposal` with an explicit ID. Nullable metadata must use JSON `null`, not omitted fields. Human wording may vary, but the semantic facts and JSON field names above are stable for V1.

Invalid proposal metadata, an invalid graph, a stale index, or an unknown explicit ID must fail orientation without a recommendation. No eligible unfinished or implementation-ready proposal is a successful “no recommended work” result rather than permission to invent work.

### Agent operating sequence

For proposal work, a conforming agent must:

1. run proposal validation and orientation;
2. honor an explicit proposal selection or present the deterministic recommendation and reason;
3. read the selected proposal plus only the authority needed for its `nextAction`;
4. identify contradictions, authority gaps, or required human decisions before changing design substance;
5. perform the authorized work while keeping `ACTIVE` chat-local;
6. persist exactly one allowed session outcome before stopping;
7. regenerate the derived index; and
8. run proposal validation and any broader validation required by changed authoritative surfaces.

## Initial Metadata Reconciliation

Materialization must give every current unfinished proposal a non-empty `nextAction` derived from its existing first unresolved promotion gate:

| Proposal   | Required initial `nextAction`                                               |
| ---------- | --------------------------------------------------------------------------- |
| `PROP-002` | Decide the PIP relationship for external and zero-context handoff.          |
| `PROP-003` | Finalize the Topic frontmatter and body contract and its validation rules.  |
| `PROP-004` | Define project-instance profile identity and authority-change semantics.    |
| `PROP-005` | Specify the composition artifact path, schema, and canonical serialization. |
| `PROP-006` | Define the bounded workspace and run discovery rule.                        |
| `PROP-008` | Obtain human acceptance of the exact shorter Blueprint name.                |

Do not change their lifecycle, work state, dependency, priority, or design substance merely to add continuation metadata.

## Target Surfaces

At minimum:

- `docs/standards/dle-proposal-workflow-v1.md`;
- `docs/proposals/TEMPLATE.md`;
- `docs/proposals/README.md` through deterministic generation;
- unfinished `docs/proposals/PROP-*.md` metadata;
- `scripts/proposals.mjs`;
- proposal tests and fixtures under `scripts/`;
- root `package.json` proposal commands and validation wiring; and
- concise proposal-routing guidance in root `AGENTS.md`.

No first-class component contract or version changes as part of this workflow.

## Non-Goals

This proposal does not add:

- assignees, estimates, confidence scores, sprint fields, or due dates;
- a general project-management or orchestration engine;
- automatic human approval or lifecycle promotion;
- persisted `ACTIVE` state;
- automatic execution after orientation;
- a mutating proposal CLI in V1;
- model-generated priority, dependencies, or product decisions;
- chat transcripts in proposal files; or
- changes to DWF, DSF, IRS, or other component runtime contracts.

## Compatibility and Versioning

This is repository governance and agent-operating guidance. It does not change a first-class DLE component public contract or require component version bumps.

The JSON orientation result is versioned by `schemaVersion: 1`. Backward-incompatible field or meaning changes require a new schema version and an accepted workflow-standard update.

Requiring non-empty `nextAction` for `PLANNED` proposals is an intentional tightening of PROP-007 governance. All existing unfinished proposals must be migrated atomically with the validator change.

## Implementation Sequence

1. Add failing tests for `PLANNED` next-action requirements and read-only orientation behavior.
2. Publish DLE Proposal Workflow V1.
3. Implement queue and explicit-ID orientation with human and JSON renderers.
4. Tighten `nextAction` validation for every unfinished proposal.
5. Reconcile existing unfinished proposal metadata with the accepted initial actions.
6. Update the template, generated index, package commands, and agent guidance.
7. Run proposal-specific tests, link checks, and `pnpm validate`.
8. Mark this proposal `implemented` and record the landing commit only after all authoritative surfaces and validation succeed.

## Acceptance Criteria

1. DLE Proposal Workflow V1 is published under `docs/standards/`.
2. Every unfinished proposal has a non-empty, actionable `nextAction`.
3. `ACTIVE` is never accepted as persisted metadata.
4. Queue orientation returns the same recommended proposal as the published scheduling rules.
5. Explicit-ID orientation reports the requested proposal without silently substituting another.
6. Human orientation contains every required semantic fact.
7. JSON orientation matches schema version 1 and uses explicit nulls.
8. Orientation is read-only in success, invalid-state, unknown-ID, and no-work cases.
9. Invalid metadata, graph cycles, and stale indexes fail orientation without a recommendation.
10. Agents have one explicit start, work, persistence, promotion, materialization, and closure sequence.
11. Tests cover planned, checkpointed, parked, blocked, ready-to-materialize, terminal, unknown-ID, invalid-state, and no-work cases.
12. `pnpm validate` passes and no component version changes.
13. This proposal is promoted to `implemented` with the authoritative landing commit recorded.

## Open Questions

None that block implementation.

## Promotion Record

Implemented by commit `e218686feb5d54f878dd0c63851183f6b5052ad0` (`feat: materialize proposal workflow v1`).

Authoritative repository surfaces:

- proposal-working operations, orientation behavior, session outcomes, authority gates, and closure rules in `docs/standards/dle-proposal-workflow-v1.md`;
- continuation authoring rules in `docs/proposals/TEMPLATE.md`;
- reconciled unfinished-proposal `nextAction` metadata and the generated `docs/proposals/README.md` index;
- deterministic continuation validation, scheduling, orientation derivation, human/JSON rendering, and CLI dispatch in `scripts/proposals.mjs`;
- behavior and read-only integration coverage in `scripts/proposals.test.mjs` and proposal fixtures under `scripts/fixtures/proposals/`;
- the root `proposals:orient` package command; and
- aligned agent and contributor guidance in `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, and `docs/README.md`.

No first-class component contract or version changed.
