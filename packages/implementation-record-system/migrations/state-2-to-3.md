# IRS state migration 2 → 3

Run inside `migrate-run` Step 3 after the old IRS has been archived and the target rollout installed.

1. Reread and back up the current tracker.
2. Set tracker `schemaVersion` to `3` only after the converted state validates.
3. Preserve implementation run ID, exact package current/history, every Phase result/integration/Git/evidence/Design-Gap fact, repositories, reports, and user-owned token values.
4. Add one small current Milestone entry per authored Milestone with `state`, `currentReview`, `activeRemediations`, and `latestClosure`.
5. Do **not** infer a historical Review PASS or `CLOSED` merely because member Phases passed/integrated. Existing explicit trustworthy Milestone review evidence may be migrated; otherwise initialize `OPEN`.
6. Add current Review/Remediation fields only when trustworthy existing state requires them. Readiness remains derived.
7. Move bulky historical Milestone detail into relative Evidence Store paths when needed; keep enough current state in the tracker for handoff.
8. Preserve all shared paths as relative. Do not move machine paths from `environment.local.json` into the tracker.
9. Validate PIP + tracker handoff, active work continuation, and single-writer preservation before completing the step.
