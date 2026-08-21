# Playbook — Review and close a Milestone

Use for a ready or already-active `M-XXX::REVIEW`, including its active `M-XXX::FIX-NNN` Remediations.

## Start or resume

1. Reread the latest tracker, environment binding, PIP identity, and package reconciliation state.
2. Do not start while a Phase implementation is active. Finish/stabilize that Phase first.
3. Read the target Milestone, derive member Phases from `phase.milestoneId`, and verify readiness from current facts. Do not trust a copied member list.
4. If several independent Reviews are ready, use `milestoneOrder`, then Milestone ID, unless the user selected one.
5. Review the **current integrated repository heads** and record them. Do not rebuild an old Milestone-only snapshot.
6. Create a new evidence attempt directory such as `evidence/M-001/review-001/` and mark the Review `IN_PROGRESS`, stage `TESTING` before material work.

## Main Review Agent and fresh specialists

The main Review Agent owns the final judgment and stays responsible across the whole Review.

- **Testing Specialist:** use fresh context when existing tests do not clearly prove the Milestone. Keep the specialist available for short back-and-forth when the harness supports it. It may add E2E tests, integration tests, fixtures, and test utilities needed for credible proof.
- **Capability Reviewer:** use a separate fresh perspective after technical verification passes. Give it the Milestone contract, integrated heads, relevant design authority, and test evidence—not unnecessary implementation chatter. Ask whether the real user-observable capability works and whether the integrated code is realistic, reachable, coherent, and maintainable.
- **Simplification Specialist:** use fresh context when practical for bounded behavior-preserving cleanup.

If the harness supports only disposable sub-agents, save a small context packet with assignment, findings, current heads/diff, evidence, and the next question so another fresh worker can continue the same logical thread. Actual concurrency is not required.

## Ordered stages

### `TESTING`

1. Judge current test adequacy against every Milestone verification/evidence clause.
2. Reuse valid Phase evidence where appropriate, but do not treat Phase PASS as Milestone proof.
3. Add missing Milestone-wide E2E/integration coverage and required support utilities.
4. Run the integrated verification surface.
5. If an observable behavior defect is found, create the smallest coherent `M-XXX::FIX-NNN` Remediation. Keep the Review `IN_PROGRESS`.

### Remediation inside Review

A Remediation records the finding, bounded scope, governing authority, repositories, verification, evidence, package identity, and Git facts. It uses Phase-like execution/integration statuses but is not an authored Phase.

- Tests/test utilities and behavior-preserving cleanup may stay inside the Review.
- Observable behavior fixes must use a Remediation.
- The Review Agent may create/drive it without human approval when existing authority clearly determines the fix.
- Missing/conflicting authority routes to `resolve-design-gap` with the Remediation or Review as active work item.
- Integrate the fix, record stable Git anchors/heads, then continue the same Review.

### `CAPABILITY_REVIEW`

After tests pass, perform senior integrated code review and ask whether the Milestone's real observable capability works as intended. Check cross-Phase seams, reachability/usability, error paths, duplicated/conflicting mechanisms, and big-picture correctness.

### `SIMPLIFICATION`

Perform one bounded Milestone-scoped behavior-preserving simplification/refactor pass. Remove needless complexity or duplication that became visible only after integration. Do not redesign accepted behavior or clean unrelated code.

### `REVERIFICATION`

Rerun the affected tests and normally the full Milestone E2E/integration surface after production-code/refactor changes. All required proof must pass at the final reviewed heads.

### `CLOSURE`

Write a short report plus machine-readable results under the Review evidence directory. Record:

- PASS/FAIL/BLOCKED;
- exact package ID/origin/digest/Amendment head;
- exact reviewed repository branches/heads;
- member Phase closure facts;
- evidence references;
- material findings and completed Remediations;
- stable Git History Anchors.

Set the Milestone `CLOSED` only after Review `PASSED`. Keep older attempts as history and point `latestClosure` to the current result.

## Pause/resume

A paused working session keeps Review status `IN_PROGRESS`; no `PAUSED` state is needed. Store coarse stage, active Remediation IDs, exact Git continuation facts, and one short resume note. Detailed specialist context may live in evidence, but the tracker must still show the next safe action.

Always use `finish-session` before stopping.
