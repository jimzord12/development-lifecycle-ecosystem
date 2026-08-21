# Playbook — Finish or hand off an implementation session

Use before an implementation session ends for any reason.

## Steps

1. Reread the latest tracker immediately before writing. Preserve unrelated state and user-owned token values.
2. Identify the active work item: Phase, Milestone Review, Remediation, repair, Design Gap, or migration.
3. Make its state truthful. `BLOCKED` means a durable stop; a live human Design-Gap conversation normally remains `IN_PROGRESS`.
4. Record exact current package identity/reconciliation state.
5. Record useful Git continuation facts and stable integration heads/anchors.
6. For an active Review, record its coarse stage, active Remediations, and one short resume note. A dirty worktree is useful evidence but not enough by itself.
7. Record short blockers, Design-Gap state, important findings, and resolving Amendment when relevant.
8. Preserve evidence. Keep detailed old history outside the tracker.
9. Create/update a short report when the work item reached a meaningful stop/result. Keep it readable in about two minutes or less.
10. Never infer or overwrite `execution.totalTokens`.
11. Do not rewrite static `RUN.md`.
12. Run the handoff test: PIP + Progress Tracker must expose exact package state, active work, Git continuation, and next safe action without this chat.

If a Phase just passed/integrated, calculate whether a Milestone Review became ready and leave a short recommendation. Do not auto-start it or mark it `IN_PROGRESS` merely because it is ready.
