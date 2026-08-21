# Design Workspace Framework (DWF) 0.1.0-local.32

DWF is a first-class [Development Lifecycle Ecosystem](../../README.md) component.

It owns the reusable methodology for long-running design work: knowledge ownership, Design Sessions, product and technical decisions, PRD/SPEC projections, commands, lifecycle, validation, versioning, workspace snapshots, design packaging, and Portable Implementation Package preparation.

DWF is not product truth, not a Delivery Definition, and not an Implementation Record System run.

## Public Contract

External consumers may rely on:

- [`dle-component.json`](dle-component.json) for component identity and version
- this README, including this Public Contract
- [`WORKSPACE-PROTOCOL.md`](WORKSPACE-PROTOCOL.md) Protocol **031** for commands, operating modes, file ownership, and workspace lifecycle
- [`skills/frontier-wave-traversal.md`](skills/frontier-wave-traversal.md) for FAST Design Pace
- [`templates/starter/`](templates/starter/) as the empty generic Design Workspace starter
- PIP install paths `design/.framework/` (DWF) and `delivery/.framework/` (DSF) from the protocol and accepted DSF/DWF consumption rules
- Amendment schema V2 behavior described by the protocol and the prepare-package skill: predecessor bytes and before/after digests, no full after-state copies in new Amendments

Package-preparation and MiniCourse skills are DWF-owned companion machinery. They are not first-class DLE components.

### Identity

- Component id: `dwf` (immutable)
- Component version: **0.1.0-local.32**
- Kind: `framework`
- Protocol version: **031**

### What DWF is not

- Product or domain requirements (`D-*` live in a project workspace)
- Delivery Definition / DSF (`packages/dsf`)
- IRS run state (`packages/implementation-record-system`)
- A mandatory chat vendor, shared DLE runtime, or this monorepo at runtime

### Deterministic validation

A Design Workspace is valid when Protocol 031 required canonical files are present, README workspace/protocol versions agree with `WORKSPACE-PROTOCOL.md`, and single-owner file rules are intact. This release does not add a separate validator executable.

### Private by default

Everything not listed in this Public Contract is internal.

## Layout

```text
packages/dwf/
├── dle-component.json
├── README.md
├── WORKSPACE-PROTOCOL.md
├── skills/
└── templates/starter/
```
