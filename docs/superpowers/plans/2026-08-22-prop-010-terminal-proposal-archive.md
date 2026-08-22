# PROP-010 Terminal Proposal Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Materialize PROP-010 so actionable proposals remain at `docs/proposals/` while terminal proposals are recursively discovered, validated, linked, oriented, and stored in status-specific archives.

**Architecture:** Keep lifecycle frontmatter as the only status authority and make each proposal's normalized path a validated projection. Refactor the existing proposal CLI around deterministic recursive discovery, then reuse the discovered relative path for relationship validation, link checks, index links, scheduling, and explicit orientation. Migrate terminal records with Git-aware moves only after focused behavior is green, and close PROP-010 in a second commit that records the first commit.

**Tech Stack:** Node.js 24 ESM, `node:fs/promises`, `node:test`, YAML, Prettier, pnpm 11, Git.

**Spec:** `docs/proposals/PROP-010-dle-proposal-active-root-and-terminal-archive.md`

## Global Constraints

- Proposal IDs, filenames, titles, priorities, dependencies, and design substance remain unchanged during path migration.
- `exploration`, `design-draft`, and `implementation-ready` proposals live directly in `docs/proposals/`.
- `implemented`, `superseded`, and `rejected` proposals live exactly in `docs/proposals/archive/<status>/`.
- Work states never create directories; parked proposals remain at the root and outside automatic selection.
- Proposal discovery and output are recursive and deterministic, and dependency resolution remains ID-based.
- Terminal transitions use Git-aware moves and preserve Git history; no redirect, duplicate, registry, placeholder, symlink, or junction is added.
- No first-class component contract, source, manifest, or version changes.
- The implementation-completing commit and the PROP-010 closeout commit are separate; `main` is pushed only after both validate.

---

### Task 1: Specify recursive discovery and archive behavior

**Files:**

- Modify: `scripts/proposals.test.mjs`
- Create: nested files under `scripts/fixtures/proposals/valid/archive/implemented/`
- Modify: `scripts/fixtures/proposals/valid/*.md` only where the fixture lifecycle/path must agree

**Interfaces:**

- Consumes: `validateProposalDirectory(directory)`, `renderProposalIndex(proposals, readmePath)`, and the orientation CLI.
- Produces: failing behavioral coverage for normalized recursive paths, cross-directory identity/graph behavior, lifecycle/path validation, generated archive links, local Markdown link validation, and terminal explicit-ID orientation.

- [ ] **Step 1: Extend the test directory utilities for nested paths**

Update `createProposalDirectory` so each fixture file creates its parent directory before `writeFile`, and update snapshots to walk nested files recursively. Keep all filesystem effects inside the per-test temporary root.

- [ ] **Step 2: Add recursive discovery and deterministic-index tests**

Create a root `design-draft`, an archived `implemented` dependency, and input files in deliberately non-ID order. Assert literal discovered relative paths such as `archive/implemented/PROP-001-alpha.md`, ID-based dependency satisfaction, a `PROP-004` next ID, and an index link of `./archive/implemented/PROP-001-alpha.md`.

- [ ] **Step 3: Add cross-directory validation tests**

Add cases that place the same `PROP-001` ID at the root and under `archive/implemented/`, place `implemented` at the root, place unfinished work in the archive, and place a terminal proposal in the wrong terminal directory. Assert duplicate-ID and exact required-location failures.

- [ ] **Step 4: Add proposal-link validation tests**

Use root and archived proposal bodies containing relative Markdown links. Assert that valid links resolve from each proposal's own directory and that a broken root or archived link produces an issue naming its normalized source path and target.

- [ ] **Step 5: Add terminal CLI orientation coverage**

Create a current generated index for a nested terminal proposal, run `--orient PROP-001 --json`, and assert exit zero, `eligibility: "terminal"`, `nextAction: null`, no automatic recommendation of the terminal record, and a byte-for-byte unchanged recursive directory snapshot.

- [ ] **Step 6: Run the focused tests and verify RED**

Run: `pnpm test:proposals`

Expected: the new tests fail because discovery is currently root-only, nested paths are not validated or linked, and archived explicit lookup cannot find the proposal. Existing tests remain diagnostic rather than failing from malformed setup.

### Task 2: Implement recursive proposal tooling

**Files:**

- Modify: `scripts/proposals.mjs`
- Modify: `scripts/proposals.test.mjs` only for test refactoring that preserves the new assertions
- Modify: nested proposal fixtures under `scripts/fixtures/proposals/`

**Interfaces:**

- Produces: proposal records with `filename` as the basename and `relativePath` as a normalized `/`-separated path relative to the proposal root.
- Produces: `deriveNextProposalId(proposals): string`, used by generated navigation and directly testable with root/archive records.
- Preserves: `validateProposalDirectory`, schedule/orientation renderers, index check/write functions, and CLI arguments.

- [ ] **Step 1: Implement deterministic recursive discovery**

Walk directories with `readdir(..., { withFileTypes: true })`, sort entries before traversal, collect `.md` files recursively, and exclude only files named `README.md` and `TEMPLATE.md`. Normalize stored relative paths with `/` while using native paths for reads.

- [ ] **Step 2: Validate lifecycle against exact relative directory**

Map unfinished and implementation-ready statuses to `.`, and terminal statuses to `archive/implemented`, `archive/superseded`, or `archive/rejected`. Report the proposal's normalized relative path plus its required directory; validate filename/ID agreement against the basename.

- [ ] **Step 3: Validate local proposal Markdown links**

Extract local Markdown destinations from every discovered proposal body, ignore anchors and absolute URI schemes, resolve paths relative to the source proposal, reject paths that do not resolve to a file or directory, and report broken links without changing files.

- [ ] **Step 4: Generate path-correct navigation and the global next ID**

Render every proposal link from `relativePath` using `/`, calculate one plus the greatest recursive `PROP-NNN` number, and show the literal next ID in the generated root index. Preserve lifecycle grouping and scheduling semantics.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `pnpm test:proposals`

Expected: all proposal tests pass, including nested duplicate, path mismatch, link, index, queue, and terminal orientation cases.

- [ ] **Step 6: Refactor with tests green**

Remove duplicated traversal/path helpers, keep public data names consistent, run `pnpm test:proposals` again, and confirm zero failures and no warnings.

### Task 3: Materialize guidance and migrate existing terminal records

**Files:**

- Modify: `AGENTS.md`
- Modify: `docs/standards/dle-proposal-workflow-v1.md`
- Modify: `docs/proposals/TEMPLATE.md`
- Move: `docs/proposals/PROP-007-proposal-governance.md` to `docs/proposals/archive/implemented/PROP-007-proposal-governance.md`
- Move: `docs/proposals/PROP-009-dle-proposal-workflow.md` to `docs/proposals/archive/implemented/PROP-009-dle-proposal-workflow.md`
- Modify: proposal files whose relative Markdown links change
- Regenerate: `docs/proposals/README.md`
- Include: `docs/superpowers/plans/2026-08-22-prop-010-terminal-proposal-archive.md`

**Interfaces:**

- Consumes: the recursive/path/link behavior from Task 2.
- Produces: authoritative workflow and authoring guidance for active-root placement, atomic terminal transition, Git-aware moves, link updates, non-reopening, and recursive orientation.

- [ ] **Step 1: Update repository and authoring guidance**

State that actionable proposals stay at the root, terminal proposals move to their exact archive directory, IDs remain stable while paths move, and metadata/path/body/link/index changes form one coherent terminal transition. State that terminal proposals cannot reopen and that follow-up design uses a new monotonic ID.

- [ ] **Step 2: Update DLE Proposal Workflow V1**

Add the status/location table, recursive discovery/index behavior, explicit archived-ID orientation, and the Git-aware terminal closeout sequence. Preserve the human authority gates and two-commit implementation closure contract.

- [ ] **Step 3: Git-move existing implemented proposals**

Create `docs/proposals/archive/implemented/` through the first `git mv`, then run the two exact moves listed in this task. Do not create empty `superseded` or `rejected` directories.

- [ ] **Step 4: Update affected relative links and regenerate**

Update repository Markdown links whose targets moved, run `pnpm proposals:index`, and inspect the generated links for both root and archived records.

- [ ] **Step 5: Run focused and full verification**

Run `pnpm test:proposals`, `pnpm proposals:check`, `pnpm proposals:orient PROP-007 --json`, `pnpm proposals:orient PROP-009 --json`, and `pnpm validate`. Expected: all commands exit zero; both explicit orientations are terminal with null next actions; archive index links resolve; no component version changes appear.

- [ ] **Step 6: Review the scoped diff and commit implementation**

Check `git diff --check`, inspect `git status --short`, review the full diff against all PROP-010 acceptance criteria, obtain code review, fix critical/important findings, rerun `pnpm validate`, and commit all implementation surfaces with `feat: materialize terminal proposal archive`.

### Task 4: Close PROP-010 and publish both commits

**Files:**

- Move: `docs/proposals/PROP-010-dle-proposal-active-root-and-terminal-archive.md` to `docs/proposals/archive/implemented/PROP-010-dle-proposal-active-root-and-terminal-archive.md`
- Regenerate: `docs/proposals/README.md`

**Interfaces:**

- Consumes: the full SHA of Task 3's implementation commit.
- Produces: an implemented PROP-010 Promotion Record naming that commit and its authoritative destinations.

- [ ] **Step 1: Record the proven implementation**

Change PROP-010 status from `implementation-ready` to `implemented`. Replace `Not implemented.` with the full implementation commit SHA, its subject, and a list of the proposal tooling/tests/fixtures, Proposal Workflow V1, template/root guidance, recursive index, and archived proposal records.

- [ ] **Step 2: Git-move PROP-010 into the implemented archive**

Use the exact `git mv` listed in this task, preserving ID, filename, title, metadata other than authorized lifecycle closure, and body design substance.

- [ ] **Step 3: Regenerate and verify closeout**

Run `pnpm proposals:index`, `pnpm proposals:check`, `pnpm proposals:orient PROP-010 --json`, and `pnpm validate`. Expected: PROP-010 is found recursively, reports `terminal` and `nextAction: null`, every validation command exits zero, and the root contains only nonterminal proposals plus navigation/template/archive entries.

- [ ] **Step 4: Commit the closeout separately**

Review `git diff --check`, confirm only PROP-010 lifecycle/Promotion Record/path and the generated index differ from the implementation commit, and commit with `docs: close PROP-010`.

- [ ] **Step 5: Push and verify repository state**

Push `main` to its configured remote. Then run `git status --short --branch` and `git log -2 --oneline`; confirm the worktree is clean, `main` is synchronized with `origin/main`, and the two required commits are in order.

## Self-review

- Spec coverage: Tasks 1-4 cover recursive deterministic discovery, ID/graph validation, lifecycle/path agreement, link checking, correct generated paths, next-ID calculation, scheduling/orientation, guidance, Git-aware initial migration, full validation, two-commit promotion, and push.
- Placeholder scan: the plan contains no deferred implementation placeholder; angle-bracket path notation appears only where it is the proposal's normative generic convention.
- Type consistency: Task 2 defines `relativePath` and `deriveNextProposalId(proposals)` once; all later index, validation, and orientation steps consume those exact concepts.
- Scope: only root proposal governance/tooling/docs and proposal records change; component packages and versions remain untouched.
