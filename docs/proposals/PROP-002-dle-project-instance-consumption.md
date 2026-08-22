---
id: PROP-002
title: DLE project instance consumption profile
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Define an additional same-team DLE consumption profile in which a durable project instance owns live design, Delivery, Topics, and implementation records near its implementation repositories. Team members continue from that instance without exchanging a Portable Implementation Package for ordinary same-team work.
dependsOn: []
supersedes:
  - project-layout, authority, bootstrap-boundary, and agent-skills portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner
lastReconciledAgainst: main@b14120ec965a0a46c845bfddd9bab167062703d9
affectedComponents:
  - dle
  - dwf
  - dsf
  - implementation-record-system
nextAction: Decide the PIP relationship for external and zero-context handoff.
---

# Proposal: DLE project instance consumption profile

## Summary

Define an additional same-team DLE consumption profile in which a project keeps live design, Delivery, design-work Topics, and implementation records in one durable project instance located near its implementation repositories. Team members continue from that instance instead of exchanging a Portable Implementation Package for ordinary same-team work.

This is not yet an implementation brief. Current published PIP, DWF, DSF, and IRS contracts remain authoritative until this profile is accepted and promoted through downstream component-specific proposals that depend on this blueprint.

## Problem

The current published flow is optimized for a zero-context implementation handoff:

- DWF produces a Portable Implementation Package;
- framework material is pinned under `design/.framework/` and `delivery/.framework/`;
- IRS records exact PIP identity and Amendment lineage; and
- a fresh implementation executor can continue from the package and tracker.

That is valuable for external or bounded handoff, but cumbersome when the same team owns design and implementation continuously. Same-team work needs one live project namespace that coding agents can orient from directly without repeatedly packaging, rematerializing, and reconciling the same design truth.

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

The implementation repositories remain separate paths bound to the instance. Their exact physical placement is not prescribed.

### Same-team work does not require a PIP

Ordinary continuation inside this profile reads live `design/` and `delivery/` truth. It does not generate a PIP merely to move between design and implementation work owned by the same team.

The live instance omits PIP-only transport material:

```text
design/.framework/
delivery/.framework/
package-manifest.json
amendments/
```

This does **not** reject PIP as a product. Whether PIP remains the external/zero-context handoff format is an explicit open decision below.

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
- external/zero-context handoff behavior;
- automatic synchronization between a PIP and a live instance;
- a public registry, plugin marketplace, or shared DLE runtime;
- provider-specific skill installation paths; or
- a cutover of any existing product workspace.

## Compatibility and versioning

This profile cannot be shipped as an undocumented directory convention. Materialization requires independently versioned public-contract additions in DWF and IRS plus downstream distribution/bootstrap contracts, but acceptance of this blueprint requires only clear abstract boundaries that those consumers must satisfy.

The likely compatibility shape is an **additional consumption profile**, not a silent replacement of the published PIP flow. Final SemVer decisions must be made from the actual component diffs after the open questions below are resolved.

## Promotion path

Before this proposal can become `implementation-ready`:

1. Decide the PIP relationship for external and zero-context handoff.
2. Define the abstract DWF and IRS integration requirements that downstream project-instance-mode contracts must satisfy; their detailed contracts remain owned by those proposals.
3. Define the abstract composition, installation, binding, and bootstrap requirements that downstream distribution work must satisfy; exact artifact paths, schemas, storage, and CLI details remain owned downstream.
4. Define canonical ownership and provider-neutral discovery requirements for router and component skills; the concrete packaging/distribution path remains owned downstream.
5. Define migration/cutover behavior for an existing DWF/PIP/IRS project.
6. Resolve coordinated component versioning and release order.

## Acceptance criteria for a later implementation

A future implementation-ready version must prove at least:

1. A fresh modern coding agent can enter an existing project instance with no chat history, discover the router, and explain the current project state and next safe action.
2. Design, Delivery, Topic, and implementation-record authority are unambiguous and contain no duplicate canonical owner.
3. Machine-specific paths are local-only and the committed instance is portable across machines.
4. DWF design work and IRS implementation work can continue without generating a PIP for same-team handoff.
5. A PIP/external-handoff path, if retained, remains deterministic and does not silently diverge from live instance truth.
6. Component contracts remain independently consumable and no shared implementation runtime becomes mandatory.
7. Windows, macOS, and Ubuntu path behavior is covered by the accepted Host/distribution contract.

## Open questions

1. Does PIP remain the required external/zero-context export, and what exact command/project state produces it from a live instance?
2. Is the project instance itself Git-tracked as one repository, embedded in another repository, or neutral to repository layout?
3. What minimum information and portability guarantees must downstream local-binding and composition contracts provide to locate the DLE installation, component versions, instance root, and implementation repositories?
4. What canonical ownership and discovery requirements must packaged skills satisfy while leaving the concrete packaging path to downstream distribution design?
5. What migration converts an existing Workspace ZIP + PIP + IRS run into this profile without losing authority or evidence?
6. What coordinated releases introduce the profile without invalidating current PIP consumers?

## Promotion record

Not implemented.
