# DLE Proposal Workflow V1

This document is the public Development Lifecycle Ecosystem (DLE) Proposal Workflow V1.

It defines how humans and coding agents orient to, select, advance, pause, promote, materialize, and close repository proposals. It is repository governance and agent-operating guidance, not a first-class component runtime contract or a project-management system.

## 1. Authority and scope

Proposal files own proposal-specific design, metadata, and historical records. The generated proposal index is a deterministic projection of recursively discovered proposals and is never a second metadata authority. Proposal IDs are stable identity; a path changes when lifecycle metadata projects a terminal record into its required archive.

A proposal does not become runtime or component authority by itself. An `implementation-ready` status authorizes the proposal's accepted substance to be materialized into standards, public contracts, schemas, fixtures, tests, code, or other authoritative repository surfaces. Those destinations become authoritative only when materialization is complete and recorded.

This workflow owns:

- proposal-work session boundaries;
- queue and explicit selection behavior;
- durable continuation state;
- read-only orientation output;
- lifecycle-transition preconditions and human gates;
- materialization and closure; and
- the operating sequence used by conforming agents.

Proposal identity, lifecycle, dependency, priority, and work-state metadata remain governed by the proposal governance rules encoded in `scripts/proposals.mjs`, proposal fixtures and tests, and the authoring template.

## 2. Proposal lifecycle inputs

V1 recognizes these lifecycle statuses:

| Status                 | Workflow meaning                                                                     | Required location                     |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| `exploration`          | Unfinished design with major boundaries or decisions still open.                     | `docs/proposals/`                     |
| `design-draft`         | Unfinished coherent design that is not authorized for implementation.                | `docs/proposals/`                     |
| `implementation-ready` | Human-accepted design authorized for materialization.                                | `docs/proposals/`                     |
| `implemented`          | Accepted substance is present in authoritative surfaces and its landing is recorded. | `docs/proposals/archive/implemented/` |
| `superseded`           | Terminal proposal replaced by a newer proposal.                                      | `docs/proposals/archive/superseded/`  |
| `rejected`             | Terminal proposal deliberately declined.                                             | `docs/proposals/archive/rejected/`    |

Lifecycle frontmatter is authoritative; directory placement is a validated projection. Work state, priority, component, assignee, year, and topic do not create directories. Create a terminal directory only when its first proposal moves there, without placeholder files.

Only `exploration` and `design-draft` are unfinished. They must persist exactly one `workState`: `PLANNED`, `CHECKPOINTED`, or `PARKED`.

`ACTIVE` is conversation-local. It must never be persisted in proposal metadata.

An unfinished proposal's direct dependency is satisfied only when the referenced proposal is `implementation-ready` or `implemented`. Dependencies are proposal IDs, not paths, and queue eligibility uses direct dependencies only.

## 3. Starting proposal work

A proposal-working session starts with validation and read-only orientation:

```text
pnpm proposals:check
pnpm proposals:orient
```

When the user names a proposal, use explicit orientation:

```text
pnpm proposals:orient PROP-NNN
```

Use `--json` for the stable machine result:

```text
pnpm proposals:orient PROP-NNN --json
```

Validation and orientation must complete before design substance changes. After selection, read the selected proposal and only the standards, contracts, decisions, or other authority needed for its stated next action.

Before changing design substance, identify any contradiction, missing semantic contract, or decision that requires human authority. Do not infer a missing product decision merely to keep work moving.

## 4. Selection and eligibility

Queue selection and local continuation answer different questions:

1. Queue selection determines which proposal should receive work.
2. Local continuation determines the exact next action within that proposal.

### 4.1 Explicit selection

An explicitly named proposal takes precedence over the automatic recommendation. Orientation reports that proposal even when it is blocked, parked, implementation-ready, or terminal. It must not silently substitute another proposal.

Explicit selection resolves the immutable proposal ID across both the active root and terminal archives. An archived terminal result has `eligibility: terminal`, `workState: null`, and `nextAction: null`; orientation recommends no mutation.

Explicit selection does not change queue ordering. `readyAlternatives` is still derived from the automatic queue tier and excludes the explicitly selected ID when that ID belongs to the tier.

### 4.2 Automatic queue selection

Automatic selection uses two tiers:

1. eligible unfinished proposals; then
2. implementation-ready proposals, only when the first tier is empty.

Eligible unfinished proposals:

- exclude `PARKED`;
- have no unsatisfied direct dependency;
- sort `CHECKPOINTED` before `PLANNED`;
- then sort by lower priority number; and
- then sort by lower proposal ID.

Implementation-ready proposals sort by lower priority number and then lower proposal ID.

`readyAlternatives` contains the remaining selectable proposal IDs from the winning tier only, in that tier's deterministic order. It does not mix implementation-ready fallback work into a non-empty unfinished tier.

When neither tier contains a proposal, orientation succeeds with no recommendation. It must not invent work.

Terminal proposals never participate in either automatic selection tier.

### 4.3 Reported eligibility

Orientation reports one of:

| Eligibility            | Meaning                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| `eligible`             | Unfinished, not parked, and all direct dependencies are satisfied.         |
| `blocked`              | Unfinished with at least one unsatisfied direct dependency.                |
| `parked`               | Unfinished and deliberately excluded from automatic selection.             |
| `ready-to-materialize` | Human-accepted proposal whose substance may be promoted into authority.    |
| `terminal`             | Implemented, superseded, or rejected; no proposal-local next work remains. |

For unfinished work, `PARKED` takes reporting precedence over dependency blockage because the persisted resumption condition is the relevant local continuation.

## 5. Durable continuation

Every unfinished proposal must persist a non-empty, actionable `nextAction` containing exactly one sentence.

| Work state     | Required meaning of `nextAction`                               |
| -------------- | -------------------------------------------------------------- |
| `PLANNED`      | The first concrete action to take when selecting the proposal. |
| `CHECKPOINTED` | The exact continuation action from the saved work boundary.    |
| `PARKED`       | The condition or decision needed before useful work resumes.   |

Do not persist generic instructions such as "continue work," multi-step plans, chat transcripts, or inferred product decisions.

`implementation-ready`, `implemented`, `superseded`, and `rejected` proposals must omit both `workState` and `nextAction`. Orientation derives the materialization action for `implementation-ready` proposals and reports no next action for terminal proposals.

Terminal proposals do not reopen. Further design uses a new monotonic proposal ID and records historical replacement with `supersedes` when applicable.

## 6. Read-only orientation contract

Orientation must not modify a proposal, generated index, timestamp, cache, or any other repository state. Every successful human and JSON result reports that no mutation occurred.

Before emitting a recommendation, orientation must validate proposal metadata and the dependency graph and confirm that the generated index is current. Invalid metadata, a graph cycle, a stale index, or an unknown explicit ID fails with a non-zero result and no recommendation.

Validation recursively discovers proposal Markdown files below `docs/proposals/`, excluding recognized navigation and template files. It validates unique IDs and dependency relationships across the complete set, exact lifecycle location, local Markdown links from both root and archived proposal files, and index links derived from each discovered relative path. Discovery order must not affect validation, scheduling, orientation, the next monotonic ID, or generated output.

### 6.1 Human result

Human output contains these semantic facts; exact explanatory wording may vary:

```text
Proposal orientation
Proposal: <id and title or none>
Lifecycle: <status or not applicable>
Work state: <state or not applicable>
Priority: <1..5 or not applicable>
Dependencies: <direct IDs and satisfaction or none>
Eligibility: <eligibility or not applicable>

Next action: <action or none>
Why: <deterministic scheduling or lifecycle reason>
Ready alternatives: <IDs or none>
Needs human decision: <exact decision or none>
Mutation performed: no
```

For an explicitly selected parked proposal, `Needs human decision` contains its persisted resumption condition. Other V1 results use `none`; agents must not parse free-form action text to invent an authority gate.

### 6.2 JSON result

JSON output uses this exact top-level shape:

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
    "nextAction": "Decide the PIP relationship for external and zero-context handoff."
  },
  "readyAlternatives": ["PROP-006", "PROP-008"],
  "needsHumanDecision": null,
  "mutationPerformed": false
}
```

`mode` is `queue` without an explicit ID and `proposal` with one. For a selected nonunfinished proposal, `workState` is `null`. For a terminal proposal, `nextAction` is `null`. Every nullable field is present and uses JSON `null`, never omission.

A successful no-work queue result uses:

```json
{
  "schemaVersion": 1,
  "mode": "queue",
  "proposal": null,
  "readyAlternatives": [],
  "needsHumanDecision": null,
  "mutationPerformed": false
}
```

Backward-incompatible changes to JSON fields or meanings require a new schema version and an accepted update to this standard.

## 7. Working and ending a session

After orientation, a conforming agent must:

1. honor an explicit selection or present the deterministic recommendation and reason;
2. read the selected proposal plus only the authority needed for its next action;
3. identify contradictions, authority gaps, and required human decisions before changing design substance;
4. perform only the authorized work while keeping `ACTIVE` conversation-local;
5. persist exactly one allowed durable outcome before stopping;
6. regenerate the proposal index after a metadata mutation;
7. run proposal validation; and
8. run broader validation required by any changed authoritative surface.

A proposal-working session ends in exactly one durable outcome:

- return unfinished work to `PLANNED` with a concrete first action;
- save unfinished continuation as `CHECKPOINTED` with the exact next action;
- defer unfinished work as `PARKED` with its resumption condition;
- record a human-authorized lifecycle transition;
- complete materialization and mark the proposal `implemented`; or
- leave the proposal unchanged when the session was read-only.

Metadata mutation requires:

```text
pnpm proposals:index
pnpm proposals:check
```

Do not stop after changing proposal metadata while leaving the generated index stale.

When the durable outcome is terminal, metadata, body record, path, links, and generated navigation form one coherent transition. Use a Git-aware move into the exact status directory, update every repository link to the new path, and do not push an intermediate metadata/path mismatch.

## 8. Human authority gates

Only the human design authority may set a proposal to:

- `implementation-ready`;
- `rejected`; or
- `superseded`.

An agent may assess promotion readiness, identify unmet gates, and prepare exact proposed edits. Validation success, user silence, or apparent design completeness does not grant authority to cross one of these gates.

An agent may record `implemented` only after all of the following are true:

- accepted substance exists in every required authoritative destination;
- proposal-specific and repository-required validation succeeds;
- the implementation-completing commit exists; and
- the Promotion Record names that commit and the authoritative surfaces.

## 9. Materialization and closure

Materializing an `implementation-ready` proposal means implementing only its accepted scope in its named target surfaces. The proposal itself remains a design and historical record; it does not replace those surfaces.

Use this closeout sequence:

1. implement the accepted substance;
2. regenerate derived proposal navigation after metadata changes;
3. run focused proposal link/metadata checks and full required validation;
4. commit the implementation-completing authoritative change;
5. change the proposal status to `implemented` and remove continuation metadata;
6. complete its Promotion Record with the implementation commit and authoritative destinations;
7. use `git mv` to move the proposal into `docs/proposals/archive/implemented/`;
8. update every repository link to its new path;
9. regenerate the index and repeat focused plus full validation; and
10. commit the Promotion Record, lifecycle change, move, link updates, and generated index together.

Do not mark a proposal `implemented` because work merely started, tests partially pass, or an implementation plan exists.

Human-authorized `superseded` and `rejected` transitions use the same atomic metadata/body/link/index/move discipline and their matching archive directory. Never leave a terminal proposal at the root, move unfinished work into an archive, restore a terminal proposal to the root, or add redirect stubs, duplicate copies, symlinks, junctions, generated mirrors, or an ID-to-path registry.

## 10. Compatibility and non-goals

This workflow does not change a first-class component public contract and does not require a component version bump.

V1 does not add:

- assignees, estimates, confidence scores, sprint fields, or due dates;
- a general project-management or orchestration engine;
- automatic human approval or lifecycle promotion;
- persisted `ACTIVE` state;
- automatic work execution after orientation;
- a mutating proposal CLI;
- model-generated priority, dependencies, or product decisions; or
- chat transcripts in proposal files.
