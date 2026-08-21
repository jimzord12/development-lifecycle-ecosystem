# Co-located project DLE namespace

**Status:** discussion draft. Next-session handoff. Not an accepted contract.

Do not implement from this file. Do not treat it as overriding DLE Component Standard V1, DLE CLI Standard V1, DSF 1.2.0, IRS 1.3.0, or DWF Protocol 031.

---

## Paste this into a new chat

```text
Continue DLE from docs/proposals/co-located-project-dle-namespace.md.

This is a design session, not implementation. Do not run Phase 7. Do not
implement from this proposal. Do not read workspace-migration/sessions/.

Load AGENTS.md and the Public Contracts named in that handoff. Then orient
and wait for me to choose NORMAL or FAST before the first design question.
```

---

## What this session is

Decide how a **project that already uses DLE** should host design, Delivery, and related artifacts when those artifacts live **next to the implementation repositories**, so a co-worker can continue work without generating a Portable Implementation Package (PIP).

This is DLE consumption-model design. It may change DWF, DSF, IRS, or all three. It is not originating-product domain design, not Delivery CLI domain commands, and not Host CLI.

## What just happened (do not redo)

This public repository already hosts:

| Component              | Version                                         | Path                                          |
| ---------------------- | ----------------------------------------------- | --------------------------------------------- |
| DLE Component Standard | V1                                              | `docs/standards/dle-component-standard-v1.md` |
| DLE CLI Standard       | V1                                              | `docs/standards/dle-cli-standard-v1.md`       |
| DSF                    | 1.2.0, consumer contract 3, Definition schema 2 | `packages/dsf/`                               |
| Delivery CLI           | 0.1.0, read-only `validate` + `docs`            | `packages/dsf/cli/`                           |
| IRS                    | 1.3.0, tracker state 3                          | `packages/implementation-record-system/`      |
| DWF                    | 0.1.0-local.32, Protocol 031                    | `packages/dwf/`                               |

That was the extraction program (P-001–P-006). `workspace-migration/` is gitignored local empirical material. Do not commit it. Do not read `workspace-migration/sessions/`. Sessions are historical discussion, not specs. Planned and parked sessions are not valid.

**Phase 7 is not this session.** Phase 7 would pin today's published DLE releases into the originating Design Workspace so that workspace becomes a DLE _consumer_ under the **current** PIP / `.framework/` model. That pin is the wrong next step if this session changes how a project hosts DLE artifacts. Leave Phase 7 parked until this design is accepted or explicitly deferred.

## The user's question

A co-worker should be able to continue an in-flight multi-repo product using DLE.

Today the originating instance works like this:

1. long-running design lives in a Design Workspace (ZIP / extracted tree);
2. implementation is handed off by **generating a PIP**;
3. IRS records the run beside that PIP and the implementation repositories;
4. Design Gaps that change packaged truth use **Package Amendments**, because the PIP is a separate mutable lineage from the Design Workspace.

The desired direction:

- The whole platform is several implementation repositories plus a **DLE namespace** (a directory, sibling tree, or parent/namespace — exact shape is a decision).
- That namespace already contains design, Delivery, and whatever else implementation needs.
- A co-worker is given that namespace plus the repositories. They should **not** need a generated PIP, because nothing is being transported across a gap.
- Amendments may also be unnecessary, because there is no detached package lineage to reconstruct. Project-owned truth would be edited in place, next to the code, under ordinary Git.

PIP and Amendments existed because design and implementation used to be **separated** (workspace ZIP → portable package → repos). If they are **co-located**, that transport/provenance machinery may be the wrong default.

Keep the design **framework-generic**. The originating instance is a three-repository platform with an existing Design Workspace, PIP, and IRS run. Do not copy that product's domain truth, private repository identities, or delivery JSON into this public repo.

## What a co-worker needs today (current contracts)

Until this session accepts a new model, the current public contracts still apply. A co-worker continuing **implementation** needs:

1. the current PIP (or a freshly materialized one from the Design Workspace);
2. the IRS skill from `packages/implementation-record-system/` and the existing `implementation-record/` if a run already exists;
3. the implementation repositories named by the Delivery Definition;
4. the DLE public contracts if they must interpret framework vocabulary (DWF `.framework/README.md`, DSF `.framework/README.md` / `packages/dsf/README.md`).

A co-worker continuing **design** still needs the Design Workspace (complete ZIP or extract), not the PIP. The PIP is not a recoverable Design Workspace.

Do not invent a coworker bootstrap that this session has not accepted.

## Why PIP and Amendments exist today

Authoritative current meaning:

- DWF Protocol 031: PIP is the ordinary implementation handoff. It installs pinned DWF under `design/.framework/` and DSF under `delivery/.framework/`. It exports a bounded `design/` projection, not the whole Design Workspace. Historical sessions and protocol machinery stay out of the PIP.
- DSF `packages/dsf/contract/docs/package-updates.md`: PIP is a self-contained handoff, not a new design authority. Project-owned packaged truth changes only after explicit human resolution of a Design Gap. Each material mutation appends immutable `AM-*` provenance. `.framework/**` and existing `AM-*` records are immutable. Framework upgrades rematerialize a new lineage.
- IRS 1.3.0: PIP is implementation authority; IRS is mutable run state. Expected shape is PIP, `implementation-record/`, and implementation repos as siblings. Tracker stores package id/origin/digest/Amendment head.

Amendments are not "Git history." They exist because a **detached package lineage** must prove exactly which predecessor bytes a human-authorized truth change replaced, without mutating pinned frameworks.

If the live project tree **is** the lineage, Git may already provide predecessor bytes. That is a hypothesis, not an accepted replacement for `AM-*`.

## Hypothesized future (not accepted)

```text
<platform-or-namespace>/
├── <dle-namespace>/          # name/layout undecided
│   ├── design/               # project design truth (not a generated PIP)
│   ├── delivery/             # Delivery Definition
│   └── ?                     # IRS? pinned DLE releases? protocol?
├── <repo-a>/
├── <repo-b>/
└── <repo-c>/
```

Possible consequences, to pressure-test rather than assume:

- materializing a PIP becomes unnecessary for same-team continuation;
- Design Workspace ZIP may remain for chat/design, or design may move into the namespace;
- Package Amendments may shrink to Git commits, a smaller provenance record, or stay for Design Gaps;
- IRS `authoritativePackage` may need a successor identity (tree digest, Git tree, namespace revision);
- pinned DLE releases still have to live _somewhere_ so the project does not fork DSF/DWF/IRS source;
- a co-worker recipe becomes: clone namespace + repos, load IRS, continue.

## Decisions this session must make

Ask the user. Do not fill these from habit.

1. **What is the DLE namespace physically?** Sibling directory, parent meta-repo, fourth repository, or a folder inside one of the implementation repos.
2. **What lives in it?** Design only, design+delivery, also IRS, also pinned `.framework/` releases, also protocol/skills.
3. **Where is canonical design truth after co-location?** Design Workspace ZIP, the namespace `design/`, or both with an explicit projection rule.
4. **Is PIP still a product?** Same-team default off; still required for zero-context external handoff; or retired.
5. **What replaces Amendments for in-place Design Gaps?** Ordinary Git; a smaller `AM-*`; nothing; or Amendments only when exporting a PIP.
6. **How does IRS identify authority** without `packageId` / origin / digest / Amendment head.
7. **How are DLE framework releases pinned** so the namespace consumes `packages/dsf`, `packages/dwf`, and `packages/implementation-record-system` instead of editing them.
8. **What exact kit is given to a co-worker** on day one of the new model (paths, skills, first command).
9. **Does this change published SemVer** of DWF, DSF, and/or IRS, or is it an additional consumption profile.

If a required meaning is missing or only exists in old session prose, stop and ask.

## Authority for this session

Read only materialized contracts, in this order:

1. `AGENTS.md`
2. `docs/standards/dle-component-standard-v1.md`
3. `docs/standards/dle-cli-standard-v1.md`
4. `packages/dwf/README.md` and `packages/dwf/WORKSPACE-PROTOCOL.md` (Implementation Handoff Boundary)
5. `packages/dwf/skills/prepare-implementation-package/SKILL.md`
6. `packages/dsf/README.md` and `packages/dsf/contract/docs/package-updates.md`
7. `packages/implementation-record-system/README.md` and `SKILL.md`
8. this file

Optional empirical context, local and uncommitted: the gitignored Design Workspace extract. Use it only to remember how PIP/IRS were used. Do not copy product files into this repo. Do not read its `sessions/` directory.

`docs/proposals/` remains discussion only, including this file.

## Out of scope

- Implementing a namespace layout in this repo or in the originating product
- Phase 7 workspace cutover
- Delivery CLI `phase` / `init` / mutable engine
- Host CLI, exclusive distro, Deno
- IRS default-router proposal
- Inventing missing semantic contracts to make co-location convenient

## Suggested first design question

After orientation and Design Pace (`NORMAL` or `FAST`):

> For same-team continuation, is the DLE namespace the canonical implementation-facing design+delivery home, with PIP demoted to an export for outsiders — or is PIP still the implementation authority even when files sit next to the repos?
