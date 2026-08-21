# Playbook — Start/resume Phase work or choose the next work item

This is a thin dispatcher, not an engineering workflow engine.

## Orientation

1. Read the latest Progress Tracker and local environment binding. If an incomplete `migration-state.json` identifies an active migration, route to `migrate-run` before normal IRS mutation.
2. Validate PIP identity against `authoritativePackage.current`.
3. Route to `adopt-run` for path-only change, `reconcile-package` for package change, or `migrate-run` for an IRS/rollout upgrade.
4. Load only the PIP/Delivery context needed for current work.

## Determine work

1. Resume trustworthy active work first:
   - active Phase → continue here;
   - active Milestone Review/Remediation → route to `review-milestone`;
   - active post-closure repair → route to `repair-milestone`;
   - active Design Gap → route to `resolve-design-gap`.
2. Do not start a Milestone Review while a Phase is already active. Finish or safely stabilize that Phase first.
3. Derive ready Milestone Reviews from current DSF + tracker state. A Review is ready only when all member Phases are `PASSED` and `INTEGRATED`, no contradicting Design Gap/material package reconciliation remains, and prerequisite Milestones are `CLOSED`.
4. If a Review is ready, strongly recommend it before another Phase. The user may explicitly continue independent Phase implementation; do not turn the recommendation into a hidden dependency.
5. Otherwise derive dependency-ready incomplete Phases from authored Phase edges. Milestone closure does not gate Phase readiness.
6. If several candidates remain, follow accepted scheduling policy. Do not invent edges or project priority.
7. If all Phases are `PASSED` + `INTEGRATED` but Milestones remain `OPEN`, report: **All Phases complete; Milestone Reviews remain.** Do not call the Delivery fully closed.

## Phase work

Before code, read the Phase, governing references, supporting Concepts, repository orientation, relevant code, and recorded Git state. When starting, mark `IN_PROGRESS` and record current package digest/Amendment head plus useful branch/head facts.

Keep the tracker truthful only when material continuation facts change. Store proof in the Phase Evidence Store. Track `PASSED` separately from `INTEGRATED`, and record exact long-lived target heads after integration.

Always route to `finish-session` before stopping.
