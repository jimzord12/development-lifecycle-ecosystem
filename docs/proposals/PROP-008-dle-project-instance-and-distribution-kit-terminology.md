---
id: PROP-008
title: DLE project instance model and Distribution Kit terminology
status: implementation-ready
priority: 3
summary: >-
  Adopt DLE project instance model and DLE Distribution Kit as the simple,
  responsibility-aligned names for the umbrella project model and its curated
  distribution and bootstrap concept.
dependsOn:
  - PROP-007
supersedes: []
decisionAuthority: repository owner; accepted in the 2026-08-22 design discussion
lastReconciledAgainst: main@b01da4fb01b94b0d3d626d404197bf0696b7c512
affectedComponents:
  - dle
---

# Proposal: DLE Project Instance Model and Distribution Kit Terminology

## Summary

Adopt **DLE project instance model** and **DLE Distribution Kit** as the names for two related umbrella-level DLE concepts. The names describe their responsibilities directly without changing proposal identities or making the umbrella a shared runtime.

The project instance model defines the durable project authority and the boundaries by which DWF, DSF, IRS, and future components cooperate. The Distribution Kit curates compatible component releases and provides distribution, installation, integrity, local binding, bootstrap, validation, routing, and skill-discovery support.

## Accepted Decisions

- The umbrella project model is named **DLE project instance model**.
- The curated distribution and bootstrap concept is named **DLE Distribution Kit**.
- The umbrella-owned executable is described as the `dle` CLI and is one surface of the Distribution Kit, not the kit's whole identity.
- Proposal IDs remain unchanged when titles and paths change.
- Existing released terminology may remain when it truthfully describes current or historical behavior.

The earlier requirement that the project-model name contain **Blueprint** is deliberately replaced by the repository owner's later decision in the 2026-08-22 design discussion. **DLE Project Blueprint** is therefore not the accepted name.

## Authorized Repository Renames

Materialization is authorized to make these Git-aware proposal moves while preserving stable proposal IDs:

```text
PROP-002-dle-project-instance-consumption.md
→ PROP-002-dle-project-instance-model.md

PROP-003-dwf-project-instance-mode.md
→ PROP-003-dwf-project-instance-workflow.md

PROP-004-irs-project-instance-mode.md
→ PROP-004-irs-project-instance-runs.md

PROP-005-dle-host-and-distribution.md
→ PROP-005-dle-distribution-kit.md

PROP-006-irs-default-router-invocation.md
→ PROP-006-irs-next-action-orientation.md

PROP-008-dle-blueprint-and-distribution-kit-terminology.md
→ PROP-008-dle-project-instance-and-distribution-kit-terminology.md
```

Materialization may update proposal titles, summaries, bodies, cross-links, the generated proposal index, and the proposal-workflow orientation example so the accepted terminology is coherent across the active proposal set.

## Terminology Boundaries

This proposal chooses names. It does not make detailed project-instance behavior authoritative, implement the Distribution Kit, change a released component contract, or introduce a mandatory shared DLE runtime.

The terms are used as follows:

| Term | Meaning |
| --- | --- |
| **DLE project instance model** | The umbrella-level model for durable project authority, portability, component boundaries, and continuation. |
| **DLE Distribution Kit** | The curated distribution, bootstrap, integrity, binding, routing, and discovery concept that supports DLE project instances. |
| `dle` CLI | An umbrella-owned executable surface provided through the Distribution Kit. |

## Compatibility

These proposal and documentation renames do not by themselves change a released runtime contract or require a component version bump. Later component proposals must apply the accepted terminology when they define and release new public contracts. Historical records may retain superseded terms when needed to explain provenance accurately.

## Acceptance Criteria

1. Active target-design proposals consistently use **DLE project instance model** and **DLE Distribution Kit**.
2. The old proposal filenames and normative titles are replaced while proposal IDs remain stable.
3. The generated proposal index and every local proposal link resolve after the moves.
4. **Blueprint** and **Host and Distribution** remain only where historical explanation requires them.
5. No released component behavior changes merely to complete the terminology update.
6. Proposal validation and full repository validation pass.

## Promotion Record

Not implemented.
