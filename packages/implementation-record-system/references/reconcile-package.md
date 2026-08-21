# Playbook — Reconcile a PIP identity transition

Use when an existing run deliberately adopts a different/rematerialized PIP outside an active Design-Gap Amendment transaction.

## Steps

1. Read the latest tracker and validate current/target PIP identities, including Amendment heads.
2. Compare material project-contract changes separately from framework/navigation-only changes.
3. Preserve Phase results, Review/closure history, Remediations, repairs, Git heads/anchors, evidence, Design Gaps, and user-owned fields.
4. Refresh copied Delivery metadata only as convenience; DSF remains authority.
5. Reconcile active work explicitly when materially affected. Do not silently continue it.
6. Preserve historical PASS/CLOSED facts. A package change does **not** automatically stale every old Phase or closed Milestone.
7. Determine material effect:
   - changed Phase contract → flag that Phase for judgment/revalidation;
   - changed Milestone Review/closure contract or invalidated evidence → set that Milestone `OPEN` for proportional revalidation/full Review as needed;
   - no material effect → keep old result current.
8. Move old `authoritativePackage.current` into history and set the validated target as current.
9. Update each affected active/current work item package digest/head only after it is actually reconciled.
10. Update `environment.local.json` only when the local PIP path changed.
11. Reread before writing and never rewrite `RUN.md` merely for a package version change.

Return a compact summary of adopted identity, material effects, and exact work needing attention.
