# Playbook — Initialize a new implementation run

Use only for a brand-new IRS created from a validated PIP. Initialization does not start implementation unless explicitly requested.

## Steps

1. Validate the PIP and record exact package ID, origin, digest, Amendment head, source reference, and useful framework identities.
2. Discover repositories from the Delivery Definition. For each, record logical identity, team-selected stable base branch, exact starting commit, and long-lived feature branch. Never assume `main`.
3. Create:

   ```text
   implementation-record/
   ├── RUN.md
   ├── progress-tracker.json
   ├── environment.local.json
   └── evidence/
   ```

4. Create Progress Tracker **schema/state version 3**.
   - Mint one stable run ID.
   - Record `authoritativePackage.current` and empty/known history.
   - Initialize Phase execution `NOT_STARTED`, integration `NOT_INTEGRATED`, `execution.totalTokens: null`, and nullable active Design-Gap state.
   - Initialize one small current Milestone record per authored Milestone:

     ```json
     {
       "state": "OPEN",
       "currentReview": null,
       "activeRemediations": [],
       "latestClosure": null
     }
     ```

   - Do not copy Review readiness, member lists, graph edges, acceptance clauses, or scheduler order into authoritative runtime fields.
   - Keep all shared paths relative.

5. Create machine-local `environment.local.json` with absolute PIP/repository paths. This file is disposable during handoff.
6. Create permissive Phase evidence directories. Create a Milestone directory only when Review/repair work begins or when the project prefers eager empty directories. Do not create ceremonial subfolder trees.
7. Create small static `RUN.md`:

   ```markdown
   # Implementation Run Entry Point

   1. Use the installed `implementation-record-system` skill.
   2. Read `progress-tracker.json` and `environment.local.json`.
   3. Validate the local PIP against `authoritativePackage.current`; use `adopt-run` for path changes and `reconcile-package` for package changes.
   4. Follow the PIP root orientation as needed.
   5. Use `implement-phase` to resume active work or derive the next safe work item.
   6. Use `review-milestone` for an active/ready Milestone Review, `repair-milestone` for a human-found post-closure gap, and `resolve-design-gap` for missing/conflicting authority.
   7. Always use `finish-session` before stopping.

   `RUN.md` is static. Dynamic truth belongs in the tracker/evidence.
   ```

8. Add/reconcile parent `AGENTS.md` guidance so agents start from `RUN.md`, use the IRS router, treat Design Gaps interactively, protect pinned frameworks/old Amendments, and always finish the session durably.
9. Validate that another capable agent can continue from PIP + Progress Tracker without chat history.

## Boundaries

- Do not modify the PIP merely to initialize IRS.
- Do not start work unless requested.
- Do not put absolute paths in portable shared state.
- Never invent historical Milestone PASS/CLOSED state from completed Phases.
