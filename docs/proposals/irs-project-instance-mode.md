# Proposal: IRS project-instance mode

**Status:** `design-draft`  
**Decision authority:** repository owner  
**Last reconciled against:** `main@1924d05f036dfc26bc1435459208ecaf3c2c714e`  
**Depends on:** [Project instance consumption profile](./dle-project-instance-consumption.md), [DWF project-instance mode](./dwf-project-instance-mode.md), IRS 1.3.0, DSF 1.2.0  
**Supersedes:** the IRS-without-PIP portions of the removed `co-located-project-dle-namespace.md` draft  
**Affected contracts/components:** IRS Public Contract, router, playbooks, tracker state, environment binding, rollout/migration surface

## Summary

Add an IRS consumption mode for a live DLE project instance. In this mode, IRS records implementation progress and evidence against the instance's current `design/` and `delivery/` authority instead of against an immutable Portable Implementation Package identity and Amendment chain.

This is not yet an implementation brief. IRS 1.3.0 remains PIP-based and authoritative until this profile's identity, tracker, migration, and compatibility contracts are completed.

## Problem

IRS 1.3.0 deliberately records exact PIP identity:

- package id, origin, digest, and Amendment head;
- package history and reconciliation;
- PIP-relative implementation authority; and
- playbooks that adopt, reconcile, replace, and migrate packages.

A live project instance removes the package event that those fields describe. Simply ignoring `authoritativePackage` would leave ambiguous run identity and dead playbooks. Project-instance mode therefore requires an explicit IRS contract, not informal omission.

## Working decisions

### IRS remains the run recorder

IRS does not become the design tree or Delivery Definition. Its authority split remains:

- project instance `design/` + `delivery/` define what must be delivered;
- IRS tracker and evidence record what happened, current work, exact code/Git state, proof, findings, and next safe action.

Each IRS operation rereads the current instance design/Delivery authority needed for that operation. Convenience copies in the tracker never override it.

### Physical layout

IRS lives inside the project instance:

```text
<project-instance>/
├── design/
├── delivery/
├── topics/
└── implementation-record/
    ├── RUN.md
    ├── progress-tracker.json
    ├── environment.local.json
    └── evidence/
```

`environment.local.json` binds machine-local instance and repository paths. Shared state remains path-independent.

### No invented package-identity substitute

The earlier exploration deliberately did not invent a digest successor for a mutable live instance. This proposal preserves that restraint.

A future tracker must either:

- define an explicit, useful project-instance authority identity/version model; or
- formally remove package identity from this profile and document how changes trigger revalidation.

Do not rename `authoritativePackage` to `authoritativeInstance` while retaining package-like semantics without a real contract.

### Design changes and revalidation

A later Topic checkpoint/finalization does not automatically stale every PASSED Phase or CLOSED Milestone. The change must be evaluated against affected work. A human or accepted deterministic contract decides what must be revalidated.

The final profile needs a durable way to record that decision without turning IRS into design authority.

### Playbook map

The intended project-instance playbook behavior is:

| Current IRS 1.3 playbook | Project-instance treatment                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `initialize`             | Keep, but initialize from a validated project instance and its Delivery Definition rather than a PIP.                                            |
| `implement-phase`        | Keep; load current instance design/Delivery authority and record exact repository/Git state.                                                     |
| `review-milestone`       | Keep the accepted Review method; derive readiness and proof from current Delivery truth.                                                         |
| `repair-milestone`       | Keep the accepted post-closure repair method.                                                                                                    |
| `resolve-design-gap`     | Keep, but after human resolution DWF persists instance design/Delivery files directly; there is no Package Amendment operation in this profile.  |
| `finish-session`         | Keep; handoff sufficiency becomes project instance + tracker/evidence rather than PIP + tracker.                                                 |
| `adopt-run`              | Keep for machine/layout changes; rebind instance and repository paths.                                                                           |
| `reconcile-package`      | Not applicable when the run has no PIP lineage. Remove from this profile's route table.                                                          |
| `migrate-run`            | Current PIP-replacement semantics are not applicable. Component-code upgrades and tracker-schema migration need a new project-instance contract. |

The router must expose only operations valid for the selected consumption profile. It must not route a project-instance run into package reconciliation.

### DWF owns design persistence

When implementation reveals a genuine Design Gap:

1. IRS attaches the gap to the active Phase, Review, or Remediation.
2. The responsible human resolves missing product/architecture authority.
3. DWF project-instance persistence updates canonical `design/` and, where needed, `delivery/`.
4. IRS records the resolution, affected work, required revalidation, and continuation.

IRS must not edit design authority merely because it owns the active implementation work item.

### Component upgrades are not run work by default

Updating the installed IRS/DLE component release is a Host/distribution concern. Migrating persisted IRS state is an IRS concern.

Project-instance mode must distinguish:

- update installed component code/skills;
- migrate tracker state when its schema changes; and
- rebind a moved run.

Do not retain `migrate-run` as a catch-all for all three merely because IRS 1.3.0 used it for PIP-era rollout.

## Tracker implications

The current working hypothesis is a new tracker state generation, likely state version `4`, because `authoritativePackage`, package history, and package-reconciliation state are central to state version 3.

That is not yet accepted. Before choosing state v4, the design must specify:

- run identity in project-instance mode;
- authority-change/revalidation records;
- profile identity so a router can distinguish PIP and project-instance runs deterministically;
- migration from state 3 when requested; and
- whether one IRS release supports both profiles.

Do not implement a schema migration until those semantics are accepted.

## Relationship to the default-router proposal

[IRS default router invocation](./irs-default-router-invocation.md) currently targets the published PIP-based IRS run shape. If project-instance mode is released, the default router must become profile-aware and apply a separate precedence branch that never expects PIP identity or package reconciliation.

The two changes should not be silently merged while either profile contract remains unresolved.

## Non-goals

This proposal does not:

- reject or remove PIP-based IRS 1.3 behavior;
- define the project-instance composition/bind file;
- define DWF Topic persistence;
- invent a live-instance digest or Amendment replacement;
- make Git the design-change ledger;
- auto-stale all completed work after every design edit;
- add a general orchestration engine; or
- authorize an existing implementation run migration.

## Compatibility and versioning

Project-instance mode is a material public IRS addition and may require a new tracker state generation. It is therefore not a patch-level clarification.

The final release design must choose one of these explicit compatibility models:

1. one IRS component release supports both PIP-based state 3 and project-instance state 4 with deterministic profile routing; or
2. a new major IRS line/profile owns project-instance runs while the PIP-based line remains supported separately.

The choice must be made from the final schema and migration burden. Do not infer compatibility from nearby SemVer numbers.

## Promotion path

Before this proposal becomes `implementation-ready`:

1. Define profile/run identity and authority-change semantics.
2. Specify the tracker schema delta and whether state version 4 is required.
3. Specify router discovery and profile selection.
4. Specify project-instance versions of initialize, Design Gap resolution, handoff, adoption, and component/state migration.
5. Decide coexistence and migration with PIP-based IRS.
6. Define deterministic structural validation and fresh-agent evaluations.
7. Resolve release/versioning and rollout packaging.

## Acceptance criteria for a later implementation

1. A fresh agent can identify a project-instance IRS run without guessing and without a PIP.
2. The router exposes only playbooks valid for that profile.
3. Implementation and Milestone Review derive authority from current instance design/Delivery truth while IRS remains the sole owner of run state/evidence.
4. Design Gap resolution updates canonical design through DWF and records explicit revalidation consequences in IRS.
5. Machine relocation uses local binding repair and does not masquerade as an authority change.
6. Existing PIP-based runs remain usable or have a deterministic, explicitly authorized migration path.
7. Tracker/schema validation fails closed on mixed or ambiguous profile state.
8. The handoff test succeeds from project instance + IRS state without chat history.

## Open questions

1. What stable identity replaces package identity, if any, for a live mutable project instance?
2. How are design/Delivery changes and required revalidation recorded durably?
3. Is tracker state version 4 required, and what is its exact schema?
4. Can one IRS component safely support both PIP and project-instance profiles?
5. What operation owns component upgrade versus tracker-state migration?
6. What is the deterministic migration path for an existing state-3 PIP run?
7. How does the default router distinguish the profiles before reading profile-specific fields?

## Promotion record

Not implemented.
