---
name: implementation-record-system
description: Use whenever an implementation run involves IRS progress/evidence, Phase continuation, Milestone Review or repair, Design Gaps, Package Amendments, package reconciliation, run adoption, or IRS/PIP migration.
metadata:
  maturity: 'v1'
---

# Implementation Record System

## Purpose

Route implementation-run record work to one small operation-specific playbook.

The **Implementation Record System (IRS)** is an external portable record of one implementation run:

- **Progress Tracker** — small mutable continuation/current state;
- **Evidence Store** — proof, reports, detailed history, and specialist context.

The Portable Implementation Package (PIP) / Delivery Definition remains authority for what must be delivered. IRS records what happened, what package/code state was used, and what should happen next.

## Route to exactly one playbook

| Situation                                                       | Playbook                                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Create a new run                                                | [`references/initialize.md`](references/initialize.md)                 |
| Start/resume normal Phase work or choose the next work item     | [`references/implement-phase.md`](references/implement-phase.md)       |
| Run/resume a ready Milestone Review and its active Remediations | [`references/review-milestone.md`](references/review-milestone.md)     |
| Repair a human-found problem after Milestone closure            | [`references/repair-milestone.md`](references/repair-milestone.md)     |
| Resolve a genuine Design Gap for any active work item           | [`references/resolve-design-gap.md`](references/resolve-design-gap.md) |
| End/pause/hand off the current implementation session           | [`references/finish-session.md`](references/finish-session.md)         |
| Adopt a changed PIP identity                                    | [`references/reconcile-package.md`](references/reconcile-package.md)   |
| Move/receive an existing run on another machine/layout          | [`references/adopt-run.md`](references/adopt-run.md)                   |
| Upgrade/migrate IRS and optionally replace the PIP              | [`references/migrate-run.md`](references/migrate-run.md)               |

Load the smallest sequence that matches reality. Always use `finish-session` before normal Phase/Review work ends. An unfinished migration must resume through `migrate-run` before normal IRS state changes continue.

## Shared V1.3 rules

1. **PIP is implementation authority; IRS is mutable run state.** Never edit PIP truth merely to record progress.
2. **DSF owns derivable truth.** Milestone membership, Review readiness, graph edges, scheduler order, and proof contracts come from the Delivery Definition. Convenience copies in the tracker never override it.
3. **Tracker = current state. Evidence = detailed story.** Keep detailed old Reviews, findings, tests, reports, and repair history outside the tracker.
4. **Path-independent shared state.** Absolute paths belong only in `environment.local.json`.
5. **`RUN.md` is static.** Do not rewrite it for progress.
6. **Single writer.** Reread the latest tracker immediately before every mutation and preserve unrelated/user-owned fields.
7. **Phase statuses:** `NOT_STARTED`, `IN_PROGRESS`, `PASSED`, `FAILED`, `BLOCKED`.
8. **Integration statuses:** `NOT_INTEGRATED`, `PARTIALLY_INTEGRATED`, `INTEGRATED`.
9. **Milestone state:** `OPEN` or `CLOSED`.
10. **Review statuses:** `IN_PROGRESS`, `PASSED`, `FAILED`, `BLOCKED`. Readiness is calculated, not stored.
11. **Review stages:** `TESTING`, `CAPABILITY_REVIEW`, `SIMPLIFICATION`, `REVERIFICATION`, `CLOSURE`.
12. **Fixable Review findings do not fail the Review.** Keep it `IN_PROGRESS` while Remediations run.
13. **Design Gaps are interactive first.** Attach them to the active Phase, Review, or Remediation. Ask the responsible human while resolution is possible.
14. **Package truth changes need explicit human resolution.** Never mutate either pinned `.framework/**` tree or an existing `AM-*` record.
15. **Track exact package state.** Keep package ID/origin/digest/Amendment head and preserve prior identities in history.
16. **Git supports IRS history.** Record stable commits/integrated heads for meaningful completed units; do not force commits for trivial edits.
17. **Evidence stays external.** Store only small evidence paths/results in the tracker.
18. **`execution.totalTokens` belongs to the user.** Preserve it and never infer it.
19. **Completion has two meanings.** All Phases passed+integrated means Phase implementation is complete; all Milestones closed means the Delivery is fully reviewed/closed.
20. **Progressive Autonomy.** Use accumulated accepted authority/evidence for routine choices, but never invent missing product or architecture authority.
21. **Handoff test:** PIP + Progress Tracker must be enough to know the current state and next safe action without chat history.

## Expected local shape

```text
<implementation-workspace>/
├── <portable-implementation-package>/
├── implementation-record/
│   ├── RUN.md
│   ├── progress-tracker.json
│   ├── environment.local.json
│   └── evidence/
│       ├── P-001/
│       ├── M-001/
│       └── ...
├── DLE Legacy Files/          # created only by migration when needed
├── <repo-a>/
└── <repo-b>/
```

The exact names may vary. The package, IRS, repositories, and DLE Legacy Files are siblings conceptually.
