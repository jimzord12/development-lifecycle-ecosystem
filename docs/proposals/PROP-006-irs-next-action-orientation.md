---
id: PROP-006
title: IRS next-action orientation
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Define bounded read-only orientation that inspects a project-instance IRS run
  and always recommends one next safe action without beginning mutation.
dependsOn:
  - PROP-001
  - PROP-004
supersedes:
  - previous contents of this file
decisionAuthority: repository owner
lastReconciledAgainst: main@b01da4fb01b94b0d3d626d404197bf0696b7c512
affectedComponents:
  - implementation-record-system
nextAction: Define bounded project-instance discovery and the exact read-only recommendation precedence after `PROP-004` fixes the new tracker contract.
---

# Proposal: IRS Next-Action Orientation

## Summary

When a user invokes IRS without naming an operation or requesting mutation, IRS performs bounded read-only orientation of a project-instance run and recommends one next safe action supported by durable state. It exposes ambiguity and invalid state rather than guessing, but it never ends without a primary recommendation for resolving or advancing the situation.

This proposal targets [IRS project instance runs](./PROP-004-irs-project-instance-runs.md), not PIP-based tracker state 3. PROP-004 owns the exact tracker fields and transitions that orientation will read.

## Boundary with the DLE Router

The top-level DLE router and IRS orientation answer different questions:

- the DLE router and [DLE Distribution Kit](./PROP-005-dle-distribution-kit.md) locate the project, validate `projectId` and `dleComponents`, establish or repair local bindings, and coordinate bounded component owners; while
- IRS next-action orientation inspects an IRS run after enough validated project context is available and recommends the next IRS-owned action.

IRS orientation does not become a generic project bootstrapper, component installer, or second umbrella router. The behavior belongs in the IRS router because choosing among IRS playbooks is IRS routing responsibility.

## Invocation Boundary

Use default orientation only when all of the following are true:

1. IRS was explicitly invoked, or the user clearly asked what should happen next in the implementation run.
2. The user did not name an IRS operation or concrete work item.
3. The user did not clearly request execution or mutation.

Plain language counts as explicit intent. A request to continue a named Phase, review a Milestone, repair a result, resolve a Design Gap, finish a session, adopt a run, review project changes, or upgrade legacy state routes to that operation instead.

Orientation recommends; a follow-up execution request invokes the owning playbook, which rereads and revalidates state before mutation.

## Bounded Read-Only Discovery

After the Distribution Kit supplies validated project context, orientation reads only what is necessary to identify the run and derive a recommendation:

1. locate `implementation-record/` through the documented project-instance contract;
2. read the IRS entrypoint and latest tracker state;
3. inspect the validated local binding result without repairing it;
4. read `projectId`, migration state, `implementationBaseline`, current design/Delivery evidence, relevant DWF/DSF requirements, repository continuation summaries, and active-work state;
5. consult the smallest operation-specific IRS rule needed to interpret the first applicable condition; and
6. return the result without mutation.

The exact bounded file set and discovery rules must follow PROP-004's new tracker contract. Orientation must not recursively search arbitrary directories, audit complete repositories, load the entire design corpus, run implementation tests, reconstruct history, or mutate bindings merely to answer “what next?”.

## Recommendation Precedence

The first applicable condition wins. The detailed proposal must fix exact predicates and recommendations for this precedence:

1. **Incomplete legacy migration** — recommend the exact safe step for resuming or resolving `Upgrade this project`; ordinary IRS mutation remains blocked.
2. **Project instance or run cannot be identified safely** — recommend the exact bounded selection, setup, or initialization step; never guess among candidates.
3. **Invalid local binding** — recommend returning to Distribution Kit setup or adoption repair.
4. **Project identity mismatch** — recommend the identity-resolution or correct-project action; never rewrite the run association automatically.
5. **Invalid repository continuation** — recommend the primary action for a missing/wrong repository, missing commit, behind/diverged state, or uncommitted work.
6. **Invalid design or Delivery** — recommend the owning validation/repair action before review or implementation.
7. **Changed design/Delivery or DWF/DSF requirements** — recommend `Review project changes` before implementation after current authority passes structural validation.
8. **Active Design Gap** — recommend the gap-resolution operation for its affected work item.
9. **Active Milestone Review or Remediation** — recommend the owning review or repair operation and identify the item.
10. **Active Phase** — recommend implementation continuation and identify the Phase.
11. **Ready Milestone Review with accepted precedence** — recommend the Review.
12. **Dependency-ready implementation work** — recommend the next item derivable from accepted Delivery and scheduling authority.
13. **Completed Delivery** — report completion and recommend the accepted closeout or no-further-work action.

The exact ordering between states that cannot coexist, and the authoritative Delivery/IRS rule for ready-work selection, remain detailed design work. Orientation may present bounded alternatives when authority leaves several choices equal, but it still recommends the safest primary action when an accepted default exists.

There is no PIP identity, Package Amendment, `reconcile-package`, package replacement, or dual-profile branch in this precedence model.

## Output Contract

Every result includes these semantic fields:

```text
Outcome: <what was found>
Why: <short durable-state explanation>
Recommended next action: <one concrete primary action>
```

A fuller human result may also identify:

```text
Run: <run id or unresolved>
Project: <projectId or unresolved>
IRS state: <component/tracker identity or invalid>
Current work: <active item or none>
Ready alternatives: <none or bounded list>
Needs user decision: <none or exact decision>
Mutation performed: no
```

The recommendation must be concrete even when continuation is blocked. For example, “cannot continue” is not sufficient; the result must recommend locating a repository, repairing a binding, reviewing project changes, resolving an authority decision, completing migration, or another exact safe step.

Any machine-readable schema requires an independently accepted versioned contract rather than inference from the illustrative human fields.

## Read-Only Safety

Default orientation must not:

- create, initialize, adopt, repair, upgrade, or mutate a run;
- update `implementationBaseline`;
- change tracker state, evidence, bindings, canonical project files, or repositories;
- start or resume a Phase, Review, Remediation, migration, or Design Gap operation;
- perform Git mutation;
- choose product priority or invent scheduling edges; or
- reinterpret incomplete or corrupted state into a plausible run.

It may invoke bounded read-only validators when their cost and ownership are specified by the final contract. Deeper revalidation belongs to the recommended operation after user authorization.

## Relationship to Project-Change Review

Orientation compares current `designDeliveryDigest` and relevant DWF/DSF entries from `dleComponents` with `implementationBaseline` only to determine whether review is required. It does not perform the review or update the baseline.

When a mismatch exists, the primary recommendation is `Review project changes` unless an earlier safety condition—such as incomplete migration, invalid identity, invalid binding, unusable repository state, or invalid design/Delivery—must be resolved first.

## Router and Evaluation Surfaces

If accepted, materialization updates the IRS Public Contract, router skill, component metadata, and the smallest deterministic evaluation/fixture surface needed for the behavior. Operation playbooks change only where the router needs a stable read-only decision rule; full playbook logic must not be duplicated in the router.

At minimum, fresh-agent evaluations cover:

1. incomplete legacy migration;
2. no project instance or no run;
3. multiple bounded candidates;
4. invalid local binding;
5. `projectId` mismatch;
6. missing/wrong repository and each relevant commit relationship;
7. uncommitted repository work;
8. changed `designDeliveryDigest`;
9. changed or unavailable DWF/DSF requirements;
10. invalid design or Delivery;
11. active Design Gap;
12. active Review or Remediation;
13. active Phase;
14. one ready Milestone Review;
15. one dependency-ready Phase;
16. several equally valid ready items;
17. completed Delivery; and
18. an explicit operation/work item that bypasses default orientation.

Every default-orientation case asserts read-only behavior and one primary recommendation.

## Compatibility and Release

This proposal follows PROP-004's breaking project-instance tracker and Public Contract generation. It makes no IRS 1.4.0 or tracker-state-3 assumption and introduces no independent state migration.

Legacy IRS releases retain their current PIP-era behavior. The new line contains only project-instance orientation and no package reconciliation branch.

## Promotion Path

Before this proposal becomes `implementation-ready`:

1. Consume PROP-004's exact project-instance tracker fields and state meanings.
2. Define bounded project/run discovery after Distribution Kit setup.
3. Fix the complete first-applicable recommendation predicates and precedence.
4. Define minimum read-only validation and the boundary with deeper owning operations.
5. Define exact human and optional machine-readable output contracts.
6. Choose the deterministic evaluation/fixture format and authoritative target files.
7. Reconcile release timing with PROP-001 and PROP-004 materialization.

## Acceptance Criteria for a Later Implementation

1. Every evaluation returns the expected primary recommendation or exact human-decision step without mutation.
2. Explicit execution intent bypasses default orientation and routes normally.
3. Discovery is bounded to the supplied project context and does not perform repository-wide reconnaissance.
4. Recommendation precedence is derived only from accepted IRS/DSF/DWF/Distribution Kit contracts.
5. Changed project authority recommends review without updating `implementationBaseline`.
6. Invalid binding, identity, repository, migration, design/Delivery, active-work, ready-work, and completion states remain distinguishable.
7. No PIP identity or package-reconciliation branch appears in the new line.
8. Fresh agents produce consistent results without prior chat history.

## Open Questions

1. Which exact PROP-004 tracker fields form the minimum orientation read set?
2. What bounded project-instance/run discovery rule applies after Distribution Kit setup?
3. Which accepted Delivery/IRS rule establishes ready-Review versus Phase precedence?
4. What minimum checks distinguish binding, repository, identity, canonical-authority, and migration failures?
5. What stable error and optional JSON schema represent each recommendation outcome?
6. What repository fixture format best evaluates a Markdown/skill-based component router?

## Promotion Record

Not implemented.
