# Playbook — Repair a closed Milestone

Use when a developer/human finds a real gap after a Milestone was already closed. Keep the user-facing ceremony small.

## Entry

The user may simply identify the Milestone, explain the problem, and point to existing changes/commits when already fixed. Search the current IRS/PIP/repositories first; ask only for missing facts.

## Steps

1. Validate the current closed Milestone record, package identity, exact old reviewed heads, and current repository state.
2. Confirm whether the correction is already determined by accepted authority.
   - yes → create/adopt the next `M-XXX::FIX-NNN` with source `HUMAN_POST_CLOSURE_REVIEW`;
   - no → route to `resolve-design-gap`.
3. Preserve the old closure as history and set current Milestone state `OPEN` while repair is active.
4. Adopt existing developer work when trustworthy; do not force it to be rewritten through IRS.
5. Implement/verify/integrate the fix and record evidence plus stable Git anchors.
6. Choose revalidation depth from risk/evidence:
   - bounded effect → remediation tests + affected Milestone regression/E2E surface;
   - broad/unclear effect, changed capability meaning, major cross-Phase refactor, or invalidated closure evidence → run a full `review-milestone` attempt.
7. Check dependent closed Milestones for **material effect only**. Do not reopen them automatically because an earlier Milestone changed.
8. Record a revalidation/Review result and close the Milestone again only after PASS.

The original closure timestamp, evidence, package identity, and heads remain true historical facts.
