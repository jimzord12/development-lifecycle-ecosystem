# Playbook — Migrate an implementation run

Use to upgrade/install a target IRS rollout and optionally replace/reconcile the PIP while preserving one existing implementation run.

Every response during the migration shows a tiny marker such as **`Migration: 0/4`**.

## Read-only orientation — `Migration: 0/4`

Search first. Do not move/change files.

1. Find/validate current IRS, current PIP, repositories, target IRS rollout, and target PIP when already nearby.
2. Read the target rollout README, `dle-component.json`, `rollout.json`, and required migration playbooks/scripts.
3. Validate current/target IRS state versions and resolve a supported migration chain.
4. Discover where this harness keeps the user's DLE/IRS skills. The DLE does not prescribe one location.
5. If something cannot be found safely, ask briefly. If target folders are missing, ask the user to place them in the implementation workspace or give their paths. If skill location is unknown and the user needs guidance, recommend the harness's normal user-scope skill directory.
6. Report what was found, the four steps, and the first requested approval.

The target rollout itself is the entrypoint when the installed IRS is too old to contain this playbook.

## Step 1 — Archive old files

Before change, explain the whole step briefly and ask once. After approval:

- create a unique sibling `DLE Legacy Files/<migration-id>/`;
- preserve replaced IRS/PIP/skill material needed for recovery;
- create `migration-state.json` with source/target facts, migration chain, `activeStep: 1`, and `lastCompletedStep: 0`;
- never silently delete earlier legacy records.

Finish with **`Migration: 1/4`** and request approval for Step 2.

## Step 2 — Install/update/replace/reconcile IRS + PIP

Ask once, then perform the complete IRS/PIP install, update, replacement, and package reconciliation against the existing run. Do not convert the Progress Tracker schema yet; that belongs to Step 3. Use target rollout paths rather than hard-coded project/harness paths. Keep the old run usable until replacement validation passes. Record completed step and show **`Migration: 2/4`**.

## Step 3 — Migrate IRS state

Ask once, then execute the target-owned state migration chain in order. Agent-readable instructions are normal; use supplied deterministic scripts when required. Preserve run ID, package history, Phase/Milestone/Review/Remediation/repair history, evidence, Git anchors, Design Gaps, and user-owned fields. Never invent old Milestone PASS/CLOSED state. Record completion and show **`Migration: 3/4`**.

## Step 4 — Final verification + cleanup

Ask once, then validate:

- target component identity from `dle-component.json`;
- target IRS state version and tracker invariants;
- PIP identity and package reconciliation;
- environment paths and repository Git facts;
- active work resumability;
- `RUN.md`/router bootstrap;
- recoverability from DLE Legacy Files.

Perform only safe temporary/staging cleanup. Do not delete legacy backups. Mark the migration complete, show **`Migration: 4/4`**, state the next safe work action, and end with one short reminder: old DLE Legacy Files may be deleted manually if they start piling up.

## Resume after interruption

An unfinished migration blocks normal IRS state changes. Read `migration-state.json`, then revalidate actual files before trusting its step number. Continue only from the first incomplete safe step and request the normal step approval. Keep the record small; do not add a per-file event log.
