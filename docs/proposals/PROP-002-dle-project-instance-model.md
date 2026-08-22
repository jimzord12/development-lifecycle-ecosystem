---
id: PROP-002
title: DLE project instance model
status: implementation-ready
priority: 3
summary: >-
  Establish the durable DLE project instance as the sole project authority and
  handoff unit, retire PIP from future DLE architecture, and define project
  identity, design/Delivery change detection, exact component requirements,
  new-machine continuation, one-way legacy migration, and coordinated release
  boundaries.
dependsOn: []
supersedes:
  - project-layout, authority, bootstrap-boundary, and agent-skills portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner; accepted in the 2026-08-22 design discussion
lastReconciledAgainst: main@b01da4fb01b94b0d3d626d404197bf0696b7c512
affectedComponents:
  - dle
  - dwf
  - dsf
  - implementation-record-system
---

# Proposal: DLE Project Instance Model

## Summary

Establish the **DLE project instance model** as the sole future project-level operating model. One durable project instance owns canonical design, Delivery, Topics, and implementation records and is the default same-team, external, different-machine, and zero-context handoff unit.

The accepted target design retires the Portable Implementation Package (PIP) and Package Amendment lineage from future DLE architecture. It replaces duplicated package authority with stable project identity, deterministic design/Delivery change evidence, readable exact component requirements, explicit local binding, and coordinated continuation and migration operations.

This proposal is an accepted umbrella blueprint, not component materialization. Current released DWF and IRS contracts remain PIP-based materialized authority until the downstream proposals are implemented and released. Those releases become legacy migration sources; they are not silently rewritten by this proposal.

## Problem

The current released flow creates a PIP as a separate implementation authority, copies framework material into it, and asks IRS to track package identity and Amendment lineage. That serves the released contracts, but it creates four problems for a durable project:

- canonical design and Delivery can be duplicated between a workspace, project files, and a package;
- a separate package authority creates reconciliation and mode-selection questions;
- packaging work is required merely to transfer or resume a complete project; and
- portability depends on copied framework payloads and package metadata instead of explicit project identity, component requirements, and local rebinding.

Renaming the package or making PIP one optional permanent mode would retain the dual architecture. The target design instead uses one durable authority and provides a one-way migration from legacy material.

## The Sole Project Model

Every future DLE project uses this logical layout:

```text
<project-instance>/
├── README.md
├── design/
├── delivery/
├── topics/
└── implementation-record/
```

The project instance is:

- the sole durable project container;
- the sole ordinary design and Delivery authority location;
- the default handoff unit across people, teams, machines, and agent contexts; and
- portable through Git, a copied directory, or an archive without changing identity or authority.

Implementation repositories remain separately bound paths. Their physical placement relative to the instance is deliberately unconstrained.

### Ownership inside the instance

| Surface                  | Authority                                                                    |
| ------------------------ | ---------------------------------------------------------------------------- |
| `README.md`              | Human and agent entrypoint for the project instance.                         |
| `design/`                | Canonical product and technical design truth in DWF-owned shapes.            |
| `delivery/`              | Canonical Delivery Definition under DSF's public contract.                   |
| `topics/`                | Non-authoritative DWF continuation records for bounded design work.          |
| `implementation-record/` | IRS-owned mutable implementation progress, evidence, and continuation state. |

Topics and implementation evidence may explain history or continuation, but neither overrides canonical design or Delivery truth.

## PIP Retirement

The future DLE architecture has no PIP mode and no equivalent package under another name. It removes:

- package IDs, origins, package digests, and package manifests as run authority;
- Package Amendment chains;
- project-instance/PIP authority modes and mode switching;
- PIP adoption, replacement, and reconciliation as ordinary future operations;
- `design/.framework/` and `delivery/.framework/` copies created merely for portability;
- deterministic PIP materialization as a future DWF responsibility; and
- any export-package concept that recreates PIP authority.

Released PIP-era DWF and IRS versions remain immutable and available for projects that have not migrated. PIP, Workspace ZIP, Package Amendment, and package identity may therefore appear in migration code and historical records, but not as optional or permanent target-design paths.

## Stable Project Identity

Every project instance receives one immutable, randomly generated `projectId`.

- Moving, cloning, copying, or archiving the same instance preserves `projectId`.
- A filesystem path or display name is not identity.
- Creating a genuinely independent project or fork requires an explicit operation that generates a new `projectId`.
- Portable truth records project identity; local binding records where that identity is located on one machine.

The exact metadata path, representation, and schema are owned downstream, primarily by [DLE Distribution Kit](./PROP-005-dle-distribution-kit.md).

## Design and Delivery Change Evidence

The project records a deterministic `designDeliveryManifest` and aggregate `designDeliveryDigest`.

`designDeliveryManifest` is the file-by-file inventory of every canonical authority file that DWF and DSF declare under `design/` and `delivery/`. Each entry contains a normalized relative path and the file digest. Canonical projections are included even when generated; only non-authoritative material is excluded.

The abstract deterministic contract requires:

- POSIX-style normalized relative paths;
- sorting paths before aggregate hashing;
- a versioned manifest and digest algorithm;
- SHA-256 unless a later accepted contract deliberately changes it;
- canonical portable text bytes, including UTF-8 and LF where the owning contract defines text normalization;
- retention of individual file digests so changed files can be reported without shared Git history; and
- one aggregate `designDeliveryDigest` calculated from the deterministic manifest.

Excluded material includes `topics/`, `implementation-record/` and its evidence, local binding state, implementation repositories, caches, temporary files, and generated artifacts not declared canonical by an owning contract.

DWF owns declaration and normalization rules for canonical design files. DSF owns the corresponding Delivery membership and serialization rules. The umbrella model defines their combined evidence contract without taking ownership of either domain.

## Exact Component Requirements

`dleComponents` is the readable project record of exact released DLE components required to operate the instance. It records component identities, exact versions, release locators, and integrity information rather than hashing the DLE development repository or hiding requirements behind an opaque fingerprint.

At minimum, DWF and DSF entries identify the exact contracts that interpret canonical design and Delivery files. The Distribution Kit proposal owns the complete schema and decides whether the record also lists IRS and future components.

A changed DWF or DSF requirement can require review even when `designDeliveryDigest` is unchanged because the interpretation rules may have changed. IRS version and tracker-state migration remain IRS-owned concerns and must not be hidden inside a design/Delivery digest.

## Implementation Baseline

`implementationBaseline` is the exact project state against which current implementation progress has been checked. Conceptually, it records or references:

- `projectId`;
- `designDeliveryDigest` and the corresponding `designDeliveryManifest` evidence;
- the relevant expected DWF and DSF entries from `dleComponents`; and
- IRS-owned repository continuation anchors required by the final IRS contract.

IRS updates `implementationBaseline` only when a run is initialized against a validated project state or after a successful explicit review of project changes. Saving, checkpointing, transferring, or editing design and Delivery files must never replace the baseline automatically.

## Continue This Project

The primary new-machine and resumed-project entrypoint is ordinary language equivalent to:

```text
Continue this project
```

It is one coordinated experience with bounded component ownership:

1. Distribution Kit or umbrella `dle` tooling locates and validates the project instance, resolves `dleComponents`, and creates or repairs local bindings.
2. IRS verifies run state, repository continuation anchors, and `implementationBaseline`.
3. DWF or DSF is consulted only when its owned validation or project-change interpretation is required.
4. Control returns to IRS to establish the next implementation action.
5. The router presents one final outcome and one recommended next action.

The router owns no DWF, DSF, or IRS playbooks and does not become a mandatory shared runtime. Formal component invocation remains available.

## Local Binding and Repository Verification

Portable project truth contains repository identities and exact continuation anchors, never machine-specific absolute paths or credentials. Local, non-committed binding state may contain the project-instance path, implementation-repository paths, the local Distribution Kit/component-store location, and non-authoritative cache paths.

During setup or adoption, `Continue this project` must:

1. locate and validate the project root and `projectId`;
2. resolve exact required `dleComponents` releases and integrity;
3. locate each implementation repository deterministically or ask only when safe discovery fails;
4. verify repository identity;
5. verify the recorded exact continuation commit;
6. report whether `HEAD` equals, is safely ahead of, is behind, or has diverged from that commit;
7. inspect working-tree state;
8. recompute `designDeliveryManifest` and `designDeliveryDigest`;
9. compare current state with `implementationBaseline`;
10. run required DWF and DSF structural validation; and
11. report one next safe action.

The exact commit is authoritative continuation evidence. A branch name is context only because branches move and may be renamed.

## Review Project Changes

Before implementation mutates state, IRS compares current design/Delivery evidence and relevant DWF/DSF requirements with `implementationBaseline`.

When everything matches, implementation may continue. When anything differs, normal implementation is blocked until an explicit operation equivalent to:

```text
Review project changes
```

The review must:

- identify changed files from the two manifests;
- validate current design and Delivery;
- determine whether changes affect completed, active, or upcoming work;
- preserve completed progress, evidence, and Git continuation facts;
- record required revalidation without making IRS the design authority;
- establish one next safe action; and
- update `implementationBaseline` only after the review succeeds.

A design edit does not automatically invalidate every completed Phase or closed Milestone. Actual impact is evaluated through the accepted DWF, DSF, and IRS contracts.

## Mandatory Outcome Contract

Every continuation, setup, validation, migration, and project-change result includes:

```text
Outcome: <what happened>
Why: <short durable-state explanation>
Recommended next action: <one concrete primary action>
```

A result never ends only with “cannot continue.” Bounded alternatives may be included, but the agent still recommends the safest default when accepted authority supports one.

The downstream contracts must define a primary recommendation for at least:

- ready to continue;
- a missing implementation repository;
- a wrong, missing, ahead, behind, or diverged repository commit;
- uncommitted repository changes;
- changed design or Delivery;
- a changed or unavailable DWF or DSF release;
- invalid design or Delivery;
- a missing IRS run;
- incomplete legacy migration;
- completed Delivery; and
- a genuine human-authority decision.

## Upgrade This Project

Legacy conversion is a one-way user-facing operation equivalent to:

```text
Upgrade this project
```

Migration must:

1. checkpoint current IRS progress, evidence, repository commits, uncommitted work, and next safe action before conversion;
2. validate every available legacy DWF Workspace, current amended PIP, IRS state/evidence, and implementation repository;
3. compare Workspace and amended-PIP truth so accepted legacy changes are not silently lost;
4. stop before cutover when genuine authority conflicts need a human choice and recommend the exact resolution action;
5. create the project instance in a new empty location rather than destructively converting active legacy material in place;
6. create `projectId`, canonical design/Delivery/Topics/implementation-record state, repository identities and anchors, `dleComponents`, `designDeliveryManifest`, `designDeliveryDigest`, and the initial `implementationBaseline`;
7. preserve legacy Workspace, PIP, Amendment, and IRS artifacts as migration evidence until cutover is proven;
8. activate the new instance only after all required validation succeeds and a next safe action is known; and
9. provide no automatic reverse conversion, so legacy behavior can be restored only from the untouched legacy backup.

Migration supports Workspace + PIP + IRS, PIP + IRS only, Workspace only, project files/repositories without a valid IRS run, and conflicting or corrupted legacy material that stops before cutover. It must state limitations truthfully and must not invent missing Topics or design-process history.

## Component Ownership

| Owner                | Responsibility in the project instance model                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| DLE umbrella model   | Project-level authority, identity, portability, orchestration boundaries, and coordinated release requirements.                       |
| DWF                  | Canonical design files, Topics, direct persistence, design validation, and migration from legacy DWF workspaces.                      |
| DSF                  | Canonical Delivery semantics, membership, serialization, and validation; no schema change merely because PIP is removed.              |
| IRS                  | Run state/evidence, `implementationBaseline`, repository continuation, project-change review, and migration from PIP-based IRS state. |
| DLE Distribution Kit | `dleComponents`, release integrity, compatible sets, immutable installation, local binding, bootstrap/adoption, and setup routing.    |

Cross-component dependencies remain directional and contract-only. Monorepo co-location grants no permission to import component internals.

## Downstream Proposals and Release Order

This proposal is materialized through bounded downstream designs:

- [DWF project instance workflow](./PROP-003-dwf-project-instance-workflow.md) owns Topic contracts, direct persistence and validation, and legacy Workspace migration.
- [IRS project instance runs](./PROP-004-irs-project-instance-runs.md) owns tracker fields and transitions, implementation baselines, repository continuation, project-change review, and IRS migration.
- [DLE Distribution Kit](./PROP-005-dle-distribution-kit.md) owns composition, integrity, installation, binding, bootstrap/adoption, router discovery, and setup checks.
- [IRS next-action orientation](./PROP-006-irs-next-action-orientation.md) owns bounded read-only IRS recommendation after the project-instance tracker contract is fixed.
- [DLE agent UX and harness agnosticism](./PROP-001-dle-agent-ux-and-harness-agnosticism.md) owns provider-neutral interaction and capability profiles.

Components remain independently versioned, but the model launches through one tested compatible release set in this order:

1. PROP-005 defines composition, integrity, binding, bootstrap/adoption, and discovery.
2. DWF ships the direct project-instance workflow as a breaking replacement for its Workspace ZIP/PIP-centered line.
3. IRS ships project-instance runs as a breaking replacement for PIP authority and introduces the tracker-state generation its detailed design requires.
4. DSF changes only if actual Delivery semantics, schemas, or documentation require it.
5. The Distribution Kit publishes the exact tested compatible release set last and never substitutes a nearby version.

Legacy PIP-based releases remain immutable and usable until a project migrates. The new release line does not create PIPs or Package Amendments and does not maintain two permanent architectures.

## Compatibility

The project instance model changes project-level and component contracts deliberately, but it does not synchronize independent component versions or make the DLE repository a runtime dependency. Each component publishes its own breaking or compatible change according to its actual public diff. The Distribution Kit then records one exact, tested compatible set.

The current released DWF, DSF, and IRS surfaces remain authoritative for their existing consumers until their respective downstream changes are implemented. This proposal itself does not modify those surfaces.

## Non-Goals

This proposal does not:

- choose exact project metadata paths, JSON schemas, or CLI syntax;
- choose the final IRS tracker-state version number;
- implement DWF, DSF, IRS, the Distribution Kit, migrations, or router operations;
- change released component files or remove released PIP artifacts;
- add a shared DLE runtime;
- prescribe implementation-repository placement;
- introduce a package replacement, public registry, plugin marketplace, dependency solver, or provider-specific installation contract; or
- invent Topics or design-process history during migration.

## Materialization Requirements

Before the project instance model is released:

1. PROP-005 must define exact `dleComponents`, binding, store, integrity, and setup/check contracts.
2. PROP-003 must define the Topic file contract, canonical design membership, direct-persistence validation, and legacy Workspace migration.
3. PROP-004 must define the new IRS tracker generation, `implementationBaseline`, repository continuation, project-change review, outcome recommendations, and legacy IRS migration.
4. PROP-006 must align default IRS orientation with the accepted project-instance run contract.
5. The independently versioned implementations must pass their component validation and one coordinated cross-platform continuation and migration test set.

Exact filenames, schemas, state numbers, CLI spellings, and migration storage are delegated to those proposals and are not umbrella-level open decisions.

## Implementation Acceptance Criteria

1. One project instance remains the sole ordinary design/Delivery authority through Git, directory-copy, and archive handoffs.
2. Moving the same instance preserves `projectId`, while an explicit independent-fork operation creates a new one.
3. `designDeliveryManifest` and `designDeliveryDigest` deterministically detect canonical design/Delivery changes and report changed files without shared Git history.
4. `dleComponents` exposes readable, exact, integrity-checked requirements and fails closed when a required release is unavailable or changed.
5. `implementationBaseline` changes only at validated initialization or after successful explicit project-change review.
6. `Continue this project` validates identity, exact components, bindings, repositories, commits, worktrees, design/Delivery, and IRS state before recommending one next action.
7. `Review project changes` records actual impact and required revalidation without automatically invalidating all completed work or making IRS design authority.
8. Every required success, mismatch, invalid-state, migration, completion, and human-decision outcome includes an outcome, durable reason, and primary recommended next action.
9. `Upgrade this project` preserves all available legacy truth and evidence, cuts over atomically into a new location, and never mutates the active legacy source in place.
10. The new DWF and IRS lines contain no PIP authority, Package Amendment, dual-profile routing, or renamed package equivalent.
11. DWF, DSF, IRS, and Distribution Kit ownership remains bounded and contract-only, with no mandatory shared runtime.
12. The exact compatible release set passes Windows, macOS, and Ubuntu continuation and migration scenarios before publication.

## Promotion Record

Not implemented.
