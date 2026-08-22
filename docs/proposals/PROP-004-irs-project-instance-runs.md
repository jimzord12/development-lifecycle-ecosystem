---
id: PROP-004
title: IRS project instance runs
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Define IRS run state, evidence, implementation baselines, repository
  continuation, project-change review, and one-way legacy migration for the
  DLE project instance model.
dependsOn:
  - PROP-002
  - PROP-003
  - PROP-005
supersedes:
  - IRS-without-PIP portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner
lastReconciledAgainst: main@b01da4fb01b94b0d3d626d404197bf0696b7c512
affectedComponents:
  - implementation-record-system
nextAction: Define the exact tracker fields and state-transition rules for `projectId`, `implementationBaseline`, project-change review, and legacy IRS migration.
---

# Proposal: IRS Project Instance Runs

## Summary

Define IRS runs for the [DLE project instance model](./PROP-002-dle-project-instance-model.md). IRS records implementation progress and evidence against canonical project-instance design and Delivery, binds the run to `projectId`, verifies exact repositories and Git continuation commits, and owns `implementationBaseline` plus explicit project-change review.

This is the breaking replacement line for PIP-based IRS authority, not a second permanent run profile. IRS 1.3.0 and tracker state 3 remain the current materialized PIP-based authority until this proposal is implemented. Their package identity and reconciliation surfaces become legacy migration inputs and history only.

## Problem

IRS 1.3.0 records exact PIP identity, Package Amendment lineage, and package-reconciliation state. Those fields correctly describe its released authority but cannot simply be omitted or renamed for a mutable project instance.

The future contract needs explicit project identity, design/Delivery change evidence, repository continuation, review transitions, migration safety, and outcome recommendations. Without those contracts, agents could continue against changed authority, silently replace a baseline, or confuse machine relocation with project change.

## IRS Authority and Layout

IRS remains the implementation-run recorder:

- canonical project-instance `design/` and `delivery/` define what must be delivered;
- IRS tracker and evidence record what happened, current work, proof, findings, exact repository/Git state, and the next safe action; and
- DWF and DSF retain exclusive ownership of design and Delivery meaning.

The logical project layout contains IRS state under:

```text
<project-instance>/
└── implementation-record/
    ├── RUN.md
    ├── progress-tracker.json
    └── evidence/
```

Exact filenames and the new tracker-state generation remain to be decided here. Machine-specific absolute paths belong only in non-committed local binding state governed by the Distribution Kit contract.

## Run and Project Identity

Every project-instance run records its association with immutable `projectId`. A project path or display name must never substitute for that identity.

The tracker must also retain IRS-owned run identity, implementation-repository identities, exact continuation commits, active work, evidence relationships, and tracker-schema identity. Legacy package identifiers may be preserved in migration provenance but do not remain current run authority.

The new line has no package authority mode, PIP adoption/replacement, Amendment head, `reconcile-package`, or dual-profile router. It must fail closed on mixed legacy and project-instance authority state.

## Implementation Baseline

`implementationBaseline` is the exact project state against which current implementation progress has been checked. Its detailed tracker representation must record or reference:

- `projectId`;
- the baseline `designDeliveryDigest`;
- the corresponding `designDeliveryManifest` entries needed for changed-file reporting;
- relevant expected DWF and DSF entries from `dleComponents`; and
- exact IRS-owned repository identities and continuation anchors.

IRS may update the baseline only:

1. when initializing a run against a fully validated project state; or
2. after a successful explicit `Review project changes` operation.

It must not replace the baseline merely because canonical files were edited, saved, checkpointed, transferred, or validated. A new observed digest is evidence of a possible change, not permission to bless that change.

## Pre-Mutation Verification

Before ordinary implementation or any mutation that depends on project authority, IRS must cooperate with the setup result from [DLE Distribution Kit](./PROP-005-dle-distribution-kit.md) and verify:

- the same `projectId` associated with the run;
- a valid new-generation tracker and no incomplete migration;
- exact implementation-repository identities;
- each recorded continuation commit and whether local `HEAD` equals, is ahead of, is behind, or has diverged from it;
- working-tree state;
- current `designDeliveryDigest` and individual manifest evidence;
- relevant current DWF and DSF requirements from `dleComponents`; and
- structural validation results required by DWF and DSF.

Branch names are context only. Exact commits remain authoritative continuation evidence.

If all required state matches `implementationBaseline`, IRS may orient to ordinary work. Any relevant mismatch blocks ordinary implementation until the prescribed review, repair, binding, repository, or migration action completes.

## Review Project Changes

`Review project changes` is the explicit IRS operation for changed canonical authority or changed DWF/DSF interpretation requirements. It must:

1. compare the baseline and current manifests and report added, removed, and changed files;
2. compare the relevant baseline and current `dleComponents` entries;
3. invoke DWF or DSF validation and interpretation only through their public contracts;
4. determine effects on completed, active, and upcoming work;
5. preserve completed progress, evidence, and Git continuation facts;
6. record specific required revalidation and any blocked work;
7. establish one next safe action; and
8. update `implementationBaseline` only after every required review step succeeds.

IRS records implementation impact but does not decide unresolved product or architecture authority. A genuine Design Gap remains attached to the affected Phase, Review, or Remediation until human authority resolves it through DWF/DSF-owned persistence.

The review must not automatically mark every completed Phase or closed Milestone stale. Revalidation follows actual impact under accepted Delivery and IRS rules.

## Repository Continuation and Local Adoption

Portable IRS state records repository identities and exact commits, not local absolute paths. The Distribution Kit owns machine-local binding schema and repository-location repair. IRS consumes those validated bindings and owns run-specific continuation checks.

Adoption on another machine must distinguish:

- the expected repository at the recorded commit;
- the expected repository safely ahead of that commit;
- a repository behind or diverged from the commit;
- a wrong repository identity;
- uncommitted local work; and
- a missing repository.

Each state receives a primary recommended next action. Relocation alone is a binding change, not a design/Delivery authority change or a reason to rewrite the implementation baseline.

## Operation Model

Project-instance IRS retains the implementation methods whose meaning remains valid:

| Operation area     | Future treatment                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Initialize         | Create a run only against a validated project instance and establish the first `implementationBaseline`.                  |
| Implement Phase    | Load current canonical authority, verify baseline and repository state, then record work and evidence.                    |
| Review Milestone   | Preserve the accepted Review method against current validated Delivery truth.                                             |
| Repair Milestone   | Preserve post-closure remediation with exact evidence and continuation.                                                   |
| Resolve Design Gap | Record implementation impact; DWF/DSF persist the human-authorized design resolution; review changes before continuation. |
| Finish session     | Persist sufficient project-instance, tracker, evidence, repository, and next-action state for a fresh agent.              |
| Adopt run          | Verify project and repository identity and consume repaired local bindings without changing authority automatically.      |
| Migrate legacy run | Perform the one-way conversion defined below; do not reuse package-replacement semantics.                                 |

Package reconciliation and profile switching do not exist in the new line.

## Outcome and Recommendation Contract

Every IRS continuation, validation, review, migration, and orientation result must include:

```text
Outcome: <what happened>
Why: <short durable-state explanation>
Recommended next action: <one concrete primary action>
```

The detailed contract must define recommendations for ready continuation, missing or mismatched repositories, every relevant Git relation, uncommitted changes, changed design/Delivery, changed or unavailable DWF/DSF requirements, invalid canonical files, missing run state, incomplete migration, active gaps/reviews/phases, ready work, completed Delivery, and genuine human-authority decisions.

Bounded alternatives may be reported, but IRS must still recommend the safest default whenever accepted authority supports one. It never ends with an unexplained refusal.

## One-Way Legacy IRS Migration

During `Upgrade this project`, IRS owns migration of PIP-based tracker state and evidence into the project-instance run contract. The operation must:

1. checkpoint progress, evidence, active work, repository commits, uncommitted work, and the next safe action;
2. validate legacy tracker state, package identity, Amendment history, evidence, and repository anchors;
3. cooperate with DWF migration to compare legacy Workspace and amended-PIP truth;
4. stop before cutover with an exact recommendation when authority or repository facts conflict;
5. create new-generation IRS state in the new project instance;
6. preserve legacy run/package identity as provenance only;
7. establish repository anchors and the initial `implementationBaseline` from the validated migrated project;
8. retain legacy IRS and PIP artifacts as evidence until coordinated validation succeeds; and
9. activate the new run only when one next safe action is known.

The migration must truthfully handle absent or invalid legacy IRS state. It must not synthesize evidence or claim completed work that cannot be established.

## Tracker Generation

The removal of `authoritativePackage`, package history, Amendment lineage, and reconciliation state requires an explicit new tracker-state and Public Contract generation. The exact version number is deliberately unresolved until the complete field and transition design is accepted.

Before implementation, this proposal must specify:

- all `projectId`, baseline, manifest-evidence, component-requirement, repository, migration, and revalidation fields;
- state invariants and atomic transitions;
- failure recovery for interrupted review and migration;
- validation of mixed, incomplete, or corrupted state; and
- the relationship between installed IRS version and persisted tracker migration.

Component installation is Distribution Kit work. Persisted IRS state migration remains IRS work.

## Relationship to IRS Next-Action Orientation

[IRS next-action orientation](./PROP-006-irs-next-action-orientation.md) depends on this proposal because it must read the actual project-instance tracker contract rather than assume PIP-based state 3. PROP-006 may define read-only precedence only after this proposal fixes the required fields and state meanings.

The top-level DLE router locates and sets up the project. IRS orientation begins after enough project and local-binding context is available and recommends the next IRS action without mutation.

## Compatibility and Release

Project-instance runs are a breaking replacement for the current PIP-based IRS line. Legacy IRS 1.3.0/tracker-state-3 releases remain immutable and usable for projects that have not migrated. The new line does not maintain two permanent profiles or silently infer which authority model to use.

IRS releases after DWF's direct project-instance workflow and the foundational Distribution Kit contract are available. The final Distribution Kit compatible set pins the exact tested IRS release rather than selecting the nearest version.

## Promotion Path

Before this proposal becomes `implementation-ready`:

1. Define the exact new tracker-state and Public Contract generation.
2. Specify `projectId`, `implementationBaseline`, manifest evidence, DWF/DSF requirement, and repository-continuation fields.
3. Specify pre-mutation comparison and every `Review project changes` transition, including interrupted-review recovery.
4. Define local adoption and repository-state outcomes with primary recommendations.
5. Specify project-instance versions of initialization, Design Gap resolution, finish-session, and read-only discovery.
6. Specify one-way migration from all supported and malformed legacy IRS/PIP shapes.
7. Define deterministic validation, fixtures, and fresh-agent evaluations.
8. Define the breaking release and coordinated rollout order.

## Acceptance Criteria for a Later Implementation

1. A fresh agent deterministically associates an IRS run with the correct `projectId` without using a PIP.
2. Every ordinary mutation verifies `implementationBaseline`, relevant `dleComponents`, repository identity/commit state, and required DWF/DSF validation.
3. Changed files are reported from retained manifest evidence even without shared Git history.
4. Baselines update only after validated initialization or successful explicit project-change review.
5. Project-change review preserves progress/evidence and records precise affected-work revalidation without making IRS design authority.
6. Repository relocation, wrong identity, ahead/behind/diverged commits, and uncommitted work produce distinct safe recommendations.
7. One-way migration preserves truthful legacy progress and evidence, stops on conflicts, and creates no dual authority.
8. The new tracker fails closed on package-era, mixed, incomplete, or corrupted authority state.
9. Every outcome includes one primary recommended next action.
10. IRS 1.3.0 and its released artifacts remain untouched and truthfully documented as current legacy authority until migration.

## Open Questions

1. What exact tracker-state generation and schema replace state 3?
2. Which fields retain the manifest evidence and DWF/DSF requirements needed by `implementationBaseline`?
3. What atomic transitions and recovery markers govern project-change review?
4. How is affected completed, active, and upcoming work represented without duplicating Delivery authority?
5. What exact local-adoption and repository-state rules are public IRS behavior versus Distribution Kit behavior?
6. What deterministic mappings migrate each supported legacy tracker/package shape?

## Promotion Record

Not implemented.
