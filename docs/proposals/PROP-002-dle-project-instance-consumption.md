---
id: PROP-002
title: DLE project instance consumption profile
status: design-draft
workState: CHECKPOINTED
priority: 3
summary: >-
  Define an additional DLE consumption profile in which a durable project instance owns live design, Delivery, Topics, and implementation records near its implementation repositories. The instance is the default portable handoff unit for same-team, external, and zero-context continuation; a Portable Implementation Package is an optional bounded implementation export.
dependsOn: []
supersedes:
  - project-layout, authority, bootstrap-boundary, and agent-skills portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner
lastReconciledAgainst: main@7d85054f86409e2c3b9b1108e3e01c3ce43c2e1e
affectedComponents:
  - dle
  - dwf
  - dsf
  - implementation-record-system
nextAction: Define the abstract DWF and IRS integration requirements that downstream project-instance-mode contracts must satisfy.
---

# Proposal: DLE project instance consumption profile

## Summary

Define an additional DLE consumption profile in which a project keeps live design, Delivery, design-work Topics, and implementation records in one durable project instance located near its implementation repositories. Team members and external recipients continue from that instance when the complete instance can be shared; a Portable Implementation Package remains available as an optional bounded implementation export.

This is not yet an implementation brief. Current published PIP, DWF, DSF, and IRS contracts remain authoritative until this profile is accepted and promoted through downstream component-specific proposals that depend on this blueprint.

## Problem

The current published flow is optimized for a zero-context implementation handoff:

- DWF produces a Portable Implementation Package;
- framework material is pinned under `design/.framework/` and `delivery/.framework/`;
- IRS records exact PIP identity and Amendment lineage; and
- a fresh implementation executor can continue from the package and tracker.

That remains valuable for a bounded, package-only handoff, but the proposed instance already contains the canonical project truth and continuation state needed by a fresh agent. When the recipient can receive that instance and resolve its exact public DLE component versions, requiring a PIP merely because the recipient is external duplicates truth and packaging work.

## Working decisions

The following decisions are the coherent working model preserved from the earlier exploration. They are not yet released contracts.

### One project instance

The caller chooses an instance path near the implementation repositories:

```text
<project-instance>/
├── README.md
├── design/
├── delivery/
├── topics/
└── implementation-record/
```

Responsibilities:

- `design/` owns current product and technical design truth in the implementation-facing projection shape;
- `delivery/` owns the current Delivery Definition;
- `topics/` owns resumable design-work distillates and lifecycle metadata, not product truth;
- `implementation-record/` owns the mutable record of implementation progress and evidence;
- `README.md` is the human/agent entrypoint and points to the DLE router skill.

The implementation repositories remain separate paths bound to the instance. Their exact physical placement is not prescribed, and the instance may be shared as its own Git repository, an embedded directory, a copied directory, or an archive.

### Project-instance continuation does not require a PIP

Ordinary continuation inside this profile reads live `design/` and `delivery/` truth. It does not generate a PIP merely because work moves between people, teams, machines, design and implementation activity, or chat contexts while the recipient receives the project instance.

The live instance omits PIP-only transport material:

```text
design/.framework/
delivery/.framework/
package-manifest.json
amendments/
```

This does **not** reject PIP as a product. It removes PIP as the mandatory gateway between a portable project instance and a recipient.

### The project instance is the default portable handoff

The project instance is the default handoff unit for same-team, external, and zero-context continuation. Transport does not change its authority: a recipient may clone it, receive its directory, or unpack an archive and still treat its `design/`, `delivery/`, `topics/`, and `implementation-record/` owners according to this profile.

Shared project truth must contain no machine-specific absolute paths. The recipient re-establishes local bindings to the DLE installation and implementation repositories. Portable composition state identifies the exact component releases and repository identities that those bindings must resolve, while IRS owns current Git continuation anchors. Publicly available released components are resolved from their recorded versions, commits, and integrity data instead of being copied into project truth merely for transport.

A zero-context instance handoff must pass the same semantic test regardless of transport: the instance entrypoint, canonical design and Delivery truth, IRS state, and portable identities must expose the current authority, active work, evidence location, repository continuation facts, and next safe action without prior chat. Topics may help resume design work but never override canonical truth.

### PIP is an optional bounded implementation export

A human may still request the existing DWF-owned PIP operation when the handoff needs one or more properties that the complete live instance should not provide:

- a reduced implementation-facing projection that omits Topics and design-process history;
- a frozen contractual or audit boundary;
- an offline or hermetic package with exact DWF and DSF releases installed inside it; or
- an independently mutable external lineage governed by Package Amendments.

PIP materialization remains a deterministic point-in-time export into a new empty output root under the current DWF validation, identity, archive, and Amendment contracts. It is not a live mirror of the instance.

Every implementation run must select exactly one active design and Delivery authority mode. In project-instance mode, live `design/` and `delivery/` are authoritative and IRS records the corresponding instance state. In PIP mode, the exported PIP is authoritative and IRS records its exact package identity and Amendment head. If both are physically available, the unselected one is reference material only; the run must not infer authority from proximity.

For a new PIP-mode run, IRS initializes beside the exported package. Moving an active project-instance run into PIP mode additionally requires a truthful checkpoint and an explicit identity conversion that preserves current work, Git continuation facts, evidence, and next safe action. Switching modes, replacing a package, or returning an amended PIP lineage to the live instance requires explicit reconciliation, and conflicting project truth retains the existing human-resolution gate. No direction silently synchronizes the instance and PIP.

The exact portable instance identity, IRS authority-mode marker, conversion record, and reconciliation mechanics remain downstream DWF and IRS design work.

### Topics are not canonical design truth

A Topic is a bounded continuation record for design work. It may preserve decisions under discussion, context, next action, and harness metadata, but accepted product and technical truth must be promoted into `design/` and `delivery/`.

A stale Topic must never override current canonical files.

### Framework install is external to the project truth

The project consumes released DLE component material from a locally bound DLE installation or distribution. It does not fork component source into the project instance and does not treat the development monorepo as runtime project truth.

Machine-specific install and repository paths belong in local, non-committed binding state. No absolute machine path belongs in portable project truth.

The exact composition artifact, distribution source, and bind format are owned by [DLE Host and distribution](./PROP-005-dle-host-and-distribution.md), not invented here.

### Agent-first daily use

The normal user path is a DLE router skill, not memorized framework commands and not a CLI command that merely tells an agent to load a skill.

The intended invocable skill surface is:

| Skill | Responsibility                                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------------- |
| `dle` | Thin router. Classify the request and load one component skill. It owns no component playbooks.             |
| `dwf` | Design method and project-instance design lifecycle.                                                        |
| `dsf` | Agent method for Delivery Definition work; it may use the DSF-owned `delivery` CLI as a deterministic tool. |
| `irs` | Implementation-run routing and playbooks.                                                                   |

Each component owns its own skill and playbooks. A packaged discovery tree such as `.agents/skills/<id>/` may expose those skills to modern harnesses, but DLE must not write directly into a provider-specific user directory. The Host may print or return skill source locations; the consuming agent maps them into the current harness.

The exact source-of-truth relationship between packaged skill discovery paths and component-owned skill files remains an implementation decision, provided there is one canonical content owner and no drift-prone duplicate contract.

### Router boundary

The router skill may:

- identify the current project instance;
- classify the user's ordinary-language request;
- load exactly one component skill initially;
- explain the selected path briefly; and
- return to routing after the component operation completes.

It must not reimplement DWF, DSF, or IRS playbooks.

Conceptual dispatch:

| Situation                                                                                           | Initial route    |
| --------------------------------------------------------------------------------------------------- | ---------------- |
| Start, continue, checkpoint, park, or finalize design work                                          | `dwf`            |
| Delivery Definition structure, validation, or graph meaning                                         | `dsf`            |
| Implementation Phase, Milestone Review, remediation, run state, or Design Gap during implementation | `irs`            |
| Installation, binding, project bootstrap, component pins, or skill discovery                        | DLE Host tooling |

Formal component invocation remains legal. The router is a better default UX, not a mandatory runtime dependency between components.

## Authority boundaries

This profile must preserve the existing DLE architecture:

- DLE remains an umbrella, not one mandatory shared runtime.
- DWF, DSF, and IRS remain independently versioned first-class components.
- Component dependencies remain directional and contract-only.
- A project instance is a consumption container, not a new lifecycle component.
- The `dle` router skill is not a component and does not own domain truth.
- The DLE Host, if accepted, manages installation/composition/bootstrap; it does not perform component-domain work.
- Companion CLIs remain owned by their components.

## Relationship to component-specific drafts

This proposal owns only the overall consumption shape. It deliberately delegates detailed behavior:

- [DWF project-instance mode](./PROP-003-dwf-project-instance-mode.md) owns Topics, orientation, direct persistence, and design lifecycle.
- [IRS project-instance mode](./PROP-004-irs-project-instance-mode.md) owns IRS authority, identity, playbook, and tracker consequences when no PIP is present.
- [DLE Host and distribution](./PROP-005-dle-host-and-distribution.md) owns installation, composition, exact pins, binding, bootstrap commands, and skill discovery.
- [Agent UX and harness agnosticism](./PROP-001-dle-agent-ux-and-harness-agnosticism.md) owns provider-neutral interaction and model profiles; this draft must conform to it when implemented.

DSF's Delivery Definition semantics do not change merely because the containing project layout changes.

## Non-goals

This draft does not yet specify:

- a final composition JSON schema or bind-file path;
- Host CLI implementation;
- DWF Topic schema and migration;
- IRS tracker state v4;
- a replacement for PIP identity inside IRS;
- an export-receipt schema, source-state identity format, or IRS conversion shape;
- automatic synchronization between a PIP and a live instance;
- a mandatory repository topology or transfer container for the project instance;
- a public registry, plugin marketplace, or shared DLE runtime;
- provider-specific skill installation paths; or
- a cutover of any existing product workspace.

## Compatibility and versioning

This profile cannot be shipped as an undocumented directory convention. Materialization requires independently versioned public-contract additions in DWF and IRS plus downstream distribution/bootstrap contracts, but acceptance of this blueprint requires only clear abstract boundaries that those consumers must satisfy.

The likely compatibility shape is an **additional consumption profile**, not a silent replacement of the published PIP flow. PIP remains a supported optional product rather than the required gateway to every external recipient. Final SemVer decisions must be made from the actual component diffs after the open questions below are resolved.

## Promotion path

Before this proposal can become `implementation-ready`:

1. Define the abstract DWF and IRS integration requirements that downstream project-instance-mode contracts must satisfy; their detailed contracts remain owned by those proposals.
2. Define the abstract composition, installation, binding, and bootstrap requirements that downstream distribution work must satisfy; exact artifact paths, schemas, storage, and CLI details remain owned downstream.
3. Define canonical ownership and provider-neutral discovery requirements for router and component skills; the concrete packaging/distribution path remains owned downstream.
4. Define migration, external-lineage return, and cutover behavior for an existing DWF/PIP/IRS project.
5. Resolve coordinated component versioning and release order.

## Acceptance criteria for a later implementation

A future implementation-ready version must prove at least:

1. A fresh modern coding agent can enter an existing project instance with no chat history, discover the router, and explain the current project state and next safe action.
2. Design, Delivery, Topic, and implementation-record authority are unambiguous and contain no duplicate canonical owner.
3. Machine-specific paths are local-only and the project instance is portable across machines whether shared through Git, a copied directory, or an archive.
4. DWF design work and IRS implementation work can continue from a transferred project instance without generating a PIP merely because the recipient, machine, team, or chat context changed.
5. An optional PIP export remains deterministic, identifies its frozen live-instance source state, and never silently synchronizes or changes authority after export.
6. Component contracts remain independently consumable and no shared implementation runtime becomes mandatory.
7. Windows, macOS, and Ubuntu path behavior is covered by the accepted Host/distribution contract.
8. Every run records project-instance mode or PIP mode as its sole active design and Delivery authority, and every mode transition is explicit and lossless.

## Open questions

1. What repository-neutral instance identity, snapshot/integrity evidence, and IRS authority-mode marker make Git, directory, and archive handoffs unambiguous and resumable?
2. What minimum information and portability guarantees must downstream local-binding and composition contracts provide to locate the DLE installation, component versions, instance root, and implementation repositories?
3. What canonical ownership and discovery requirements must packaged skills satisfy while leaving the concrete packaging path to downstream distribution design?
4. What migration and explicit reconciliation flow converts an existing Workspace ZIP + PIP + IRS run into this profile, switches an active run between authority modes, or returns an amended PIP lineage without losing authority or evidence?
5. What coordinated releases introduce the profile without invalidating current PIP consumers?

## Promotion record

Not implemented.
