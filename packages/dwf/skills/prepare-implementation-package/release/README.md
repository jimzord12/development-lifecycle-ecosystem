# Design Workspace Framework (DWF) 0.1.0-local.32 — Public Consumer Contract

This directory is the complete locally materialized DWF release installed for Portable Implementation Package consumption. It is framework-owned and project-agnostic. Do not modify it as project truth or through an ordinary Package Amendment.

The **Portable Implementation Package itself is not globally read-only**. The immutable boundary is narrower: this `design/.framework/**` tree, the sibling `delivery/.framework/**` tree, and already-committed `amendments/AM-*/**` provenance. After explicit human resolution of a genuine Design Gap, project-owned package truth outside those framework roots may be amended through the Package-Amendment contract.

You do not need the Design Workspace history or prior chats to use this package. Learn the small public vocabulary below, then follow the project `design/README.md` map.

## Public vocabulary

- **Framework-owned / project-owned** — `.framework/**` is installed DWF machinery; files beside it under `design/` are this project's design projection.
- **Canonical project truth** — project-owned files that actually own the current accepted answer.
- **Derived project guidance** — projections/Concepts that help consumption but do not override canonical owners.
- **Governing Design Reference** — stable project authority referenced by Delivery work.
- **Design Gap** — implementation evidence showing accepted project truth is insufficient/conflicting for safe progress.
- **Interactive Design-Gap resolution** — stop only affected work and ask the responsible human the concrete engineering/product question now; do not terminally stop while that human is available and resolution remains possible.
- **Package Amendment (`AM-*`)** — immutable provenance for a human-authorized project-truth mutation; never the current truth itself.
- **Mutable package lineage** — project-owned package truth may change through Amendments while pinned framework releases remain frozen.
- **Framework release / rematerialization** — changing a framework requires a new rematerialized package lineage.

Project-specific identifiers such as `D-*`, `TD-*`, and `EC-*` are explained by the project `design/README.md`; DWF does not require one universal numbering scheme.

## Progressive discovery

Read only what the current task needs:

- [`docs/authority.md`](docs/authority.md) — project/framework ownership and change boundaries.
- [`docs/project-artifacts.md`](docs/project-artifacts.md) — common project design artifact roles.
- [`docs/design-gaps-and-amendments.md`](docs/design-gaps-and-amendments.md) — implementation-time interaction, authority, deterministic Amendment mechanics, and resume.
- [`docs/design-projection-mapping.md`](docs/design-projection-mapping.md) — fixed projection/reintegration path mapping.
- [`docs/progressive-discovery.md`](docs/progressive-discovery.md) — how to avoid unnecessary rereading.
- [`docs/fresh-agent-evaluation.md`](docs/fresh-agent-evaluation.md) — semantic handoff validation.

The installed internal Agent skill under `skills/prepare-implementation-package/` contains the deterministic materialization/Amendment tooling. Amendment schema V2 stores exact predecessor bytes and before/after digests without copying the full current after-state into the Amendment; schema-V1 records remain valid. It is framework machinery, not project truth.

## Cross-platform identity ordering

All package inventories, package digests, framework payload digests, and deterministic archive traversals are ordered by the **normalized POSIX-relative path string** (`relative_to(root).as_posix()`), never by native `Path` object ordering. This makes one package identity reproducible across Windows and POSIX hosts.
