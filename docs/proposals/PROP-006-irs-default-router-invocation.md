---
id: PROP-006
title: IRS default router invocation
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  When IRS is invoked without an operation or mutation request, perform bounded read-only orientation and recommend the next safe operation supported by durable run state. Expose ambiguity instead of guessing and perform no mutation.
dependsOn:
  - PROP-001
supersedes:
  - previous contents of this file
decisionAuthority: repository owner
lastReconciledAgainst: main@b14120ec965a0a46c845bfddd9bab167062703d9, IRS 1.3.0 / tracker state 3
affectedComponents:
  - implementation-record-system
nextAction: Define the bounded workspace and run discovery rule.
---

# Proposal: IRS default router invocation

## Summary

When a user invokes IRS without naming an operation or requesting mutation, IRS should perform bounded read-only orientation of the current implementation workspace and recommend the next safe IRS operation supported by durable run state. It must expose ambiguity rather than guess and must not begin implementation, migration, review, repair, reconciliation, adoption, Git work, or any other mutation.

The behavior belongs in the IRS router because selecting the appropriate playbook is routing responsibility. It does not create a second advisory skill or turn the router into an execution engine.

This draft targets the current PIP-based IRS run profile. A future project-instance IRS profile requires its own profile-aware routing branch.

## Problem

IRS 1.3.0 has a strong operation-specific router. When the user explicitly asks for `implement-phase`, `review-milestone`, `migrate-run`, or another operation, the path is deterministic.

A bare or ordinary-language invocation such as:

```text
Use IRS and tell me what should happen next.
```

still leaves room for agent-specific behavior. One agent may inspect the run, another may ask the user to pick a playbook, and another may start work. Fresh-agent continuity should not depend on personality or hidden chat history.

## Invocation boundary

Use default orientation only when all of the following are true:

1. IRS was explicitly invoked, or the user clearly asked IRS to inspect the current run and determine the next safe action.
2. The user did not name an IRS operation or concrete work item.
3. The user did not clearly request execution or mutation.

Examples that use default orientation:

```text
Use IRS.
Use IRS and tell me what is next.
Inspect this implementation run.
What should I do next in this run?
```

Examples that bypass default orientation and route to the requested operation:

```text
Continue P-004.
Review M-002.
Migrate this run using the supplied rollout.
Finish the current implementation session.
```

Plain language counts as explicit intent. Formal playbook names are not required.

## Read-only orientation

The router should perform the smallest bounded read necessary to identify the run and derive a recommendation:

1. Locate the current implementation workspace and its `implementation-record/RUN.md` through a deterministic, documented discovery rule.
2. Read `RUN.md`, the latest `progress-tracker.json`, and the local environment binding it identifies.
3. Read installed IRS identity and the minimum PIP/Delivery metadata needed to validate recorded package identity, stored-state compatibility, active work, readiness, and completion.
4. Detect incomplete IRS migration before considering ordinary work.
5. Validate that paths, package identity, referenced durable artifacts, and active-work state are sufficiently coherent for a recommendation.
6. Consult only the smallest operation-specific playbook needed to interpret the state.
7. Return the recommendation and perform no mutation.

Do not recursively audit repositories, load the complete design corpus, run tests, inspect unrelated worktrees, or reconstruct detailed implementation history merely to answer “what next?”. The selected operation performs deeper revalidation after the user authorizes it.

## Routing precedence

The first applicable condition wins:

1. **Incomplete IRS migration** — recommend resuming `migrate-run`; normal IRS mutation remains blocked.
2. **Run cannot be identified safely** — report no run or the bounded candidates and ask the user to select/initialize; do not guess.
3. **Invalid or relocated local binding** — recommend `adopt-run` when shared run/package state is coherent but local paths are not.
4. **Unreconciled PIP identity** — recommend `reconcile-package` when recorded package state and the current/supplied PIP differ semantically. A machine-path change alone is not reconciliation.
5. **Active Design Gap** — recommend `resolve-design-gap` for the affected active work item.
6. **Active Milestone Review or Remediation** — recommend `review-milestone` and identify the active item.
7. **Active Phase** — recommend `implement-phase` and identify the Phase.
8. **Ready Milestone Review with accepted precedence** — recommend `review-milestone`.
9. **Dependency-ready Phase work** — recommend `implement-phase` and identify the next item derivable from accepted Delivery/scheduling authority.
10. **Delivery complete** — report that no implementation or Review work remains under the current package state.

When accepted authority permits several equally valid ready items and defines no priority, return the bounded alternatives and ask the user. Do not invent product priority, graph edges, scheduler order, or confidence scores.

## Output contract

The human response should be short and include these semantic facts:

```text
IRS orientation
Run: <run id or unresolved>
IRS: <component version / tracker state version>
Package: <recorded identity and validation result>
Current work: <active item or none>

Recommended next action: <playbook> — <work item if applicable>
Why: <durable-state basis>
Ready alternatives: <none or bounded list>
Needs user decision: <none or exact question>
Mutation performed: no
```

Exact prose is delegated. The response must identify:

- which run and package were inspected;
- any safety, compatibility, migration, or binding problem;
- the recommended operation and work item;
- the durable authority supporting the recommendation;
- equally valid alternatives or missing decisions; and
- an explicit statement that no mutation occurred.

If a machine-readable orientation result is later introduced, its schema and compatibility must be specified independently rather than inferred from this conceptual human shape.

## Safety boundaries

Default orientation must not:

- create or initialize a run;
- change tracker, evidence, local binding, PIP, or repositories;
- start/resume a Phase, Review, Remediation, migration, adoption, or reconciliation;
- resolve a Design Gap;
- run `finish-session` merely because the current prompt ends;
- create Git branches, commits, worktrees, or remote changes;
- choose among genuinely equal work items; or
- reinterpret invalid state into a plausible run.

A follow-up authorization routes to the recommended playbook. That playbook rereads and revalidates current state before mutation.

## Router and discovery changes

If accepted, update at least:

```text
packages/implementation-record-system/README.md
packages/implementation-record-system/SKILL.md
packages/implementation-record-system/dle-component.json
```

Add the smallest deterministic evaluation/fixture surface needed to test default orientation. Modify operation playbooks only where the router needs a stable read-only decision rule; do not duplicate complete playbook logic in `SKILL.md`.

The skill description should include wording equivalent to:

> Inspect an implementation run and determine or recommend the next safe IRS work item.

The description must not imply that bare invocation executes the recommendation.

## Evaluation cases

At minimum, evaluate fresh-agent behavior for:

1. one valid run, no active work, one ready Milestone Review;
2. one active Phase;
3. one active Review or Remediation;
4. one active Design Gap;
5. incomplete migration;
6. semantic PIP identity mismatch;
7. relocated run with invalid local paths;
8. no run;
9. multiple plausible runs;
10. several equally ready Phases with no accepted priority;
11. completed Delivery; and
12. explicit operation/work item supplied, which bypasses default orientation.

Every default-orientation case must assert read-only behavior.

## Non-goals

- a new DLE component or separate advisor skill;
- automatic execution after recommendation;
- a product-priority or orchestration engine;
- new tracker fields or state version;
- automatic recovery from corrupted/ambiguous state;
- repository-wide reconnaissance;
- a generic project-instance router; or
- replacing operation-specific IRS playbooks.

## Compatibility and versioning

This is a backward-compatible public IRS behavior addition and does not require tracker state migration.

If [Agent UX and harness agnosticism](./PROP-001-dle-agent-ux-and-harness-agnosticism.md) is implemented first, this proposal should target IRS `1.3.1` and release as IRS `1.4.0`, retaining tracker state version `3`. If that ordering changes, determine the final version from the actual combined public-contract diff; do not issue two releases that conflict or duplicate the same router edits.

Existing explicit operation invocation remains unchanged.

## Promotion path

Before this proposal becomes `implementation-ready`:

1. Define the bounded workspace/run discovery rule.
2. Confirm the exact Delivery/IRS rule that gives a ready Milestone Review precedence over later Phase work.
3. Define the minimum read-only validation that distinguishes binding relocation from PIP reconciliation.
4. Choose the deterministic evaluation/fixture format and exact target files.
5. Reconcile version ordering with any already-implemented IRS patch proposals.

## Acceptance criteria for a later implementation

1. Every evaluation case produces the expected recommendation or bounded ambiguity without mutation.
2. Explicit user execution intent bypasses default orientation and routes normally.
3. The router loads only bounded state and does not perform repository-wide work.
4. Recommendation precedence is derived from accepted IRS/DSF authority and is covered by tests/evals.
5. Fresh agents produce consistent routing without prior chat history.
6. IRS Public Contract, router description, component version, and release metadata agree.
7. Tracker state remains `3` and no migration is introduced solely for this feature.
8. `pnpm validate` and IRS-specific structural validation pass.

## Open questions

1. What exact bounded root-discovery rule locates `implementation-record/RUN.md`?
2. Which published IRS/DSF rule establishes ready-Review precedence, and what happens when it does not apply?
3. What minimum checks distinguish invalid local binding from changed PIP identity?
4. What repository format owns the evaluation cases for a Markdown/skill-based component?

## Promotion record

Not implemented.
