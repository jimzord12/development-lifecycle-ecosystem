# Prepare Implementation Package

## Purpose

Materialize and validate a Portable Implementation Package from the current committed Design Workspace without introducing a user-facing packaging CLI. This is framework-owned DWF machinery; the Human Designer/Operator should be able to request the handoff in ordinary language such as “prepare the implementation package”.

The same packaged DWF machinery also provides the deterministic internal helper used by an implementation Main Agent to author a human-authorized Package Amendment without treating the entire PIP as read-only.

## Fresh materialization contract

1. Start from one valid committed Workspace Revision.
2. Materialize into an **empty output root**; never patch a previous package in place when creating a new lineage.
3. Export the bounded implementation-facing `design/` projection using DWF's fixed versioned mapping and normalize away historical Design Session/process references that are not implementation prerequisites.
4. Install the local identified DWF release under `design/.framework/` and copy the project's pinned DSF release under `delivery/.framework/`.
5. Copy the current Delivery Definition and project Delivery guidance.
6. Mint/accept one collision-resistant package origin for this independently mutable lineage.
7. Write package identity/inventory/digests and an empty amendment-chain head.
8. Run mandatory deterministic Layer-1 validation. Do not hand off an invalid package.
9. If the runtime exposes a genuinely isolated Agent/context capability, strongly prefer running the Fresh Implementation Agent evaluation from `release/docs/fresh-agent-evaluation.md`. If isolation is unavailable, record `NOT_RUN`; never simulate freshness with the packaging Agent itself.
10. Build the package ZIP from the validated directory. Given identical source bytes and an explicit identical package origin, archive generation must be deterministic.
11. For every identity-affecting or archive-ordering filesystem traversal, sort by normalized POSIX-relative path strings; never rely on native `Path` ordering, which differs across Windows/POSIX flavors.

## Human-authorized Amendment contract

Ordinary implementation progress does not mutate PIP truth merely to mirror runtime state. When a genuine Design Gap is explicitly resolved by the responsible human, project-owned `design/**` / `delivery/**` truth outside `.framework/**` may be amended under the package's accepted Amendment contract.

Use the transactional Amendment helper so exact predecessor/current states remain recoverable without duplicating current after-state files inside every new Amendment. Existing `AM-*` records and both framework trees are immutable.

## Scripts

- `scripts/prepare_package.py` — fresh materialization, manifest/digest construction, Layer-1 validation, Amendment-chain reverse validation, deterministic archive creation. Required Agent inputs: `--workspace`, `--output`, `--package-id`, `--project-title`.
- `scripts/amend_package.py` — transactional `begin` / `commit` / `abort` / `validate` helper for explicit human-authorized project-truth Package Amendments.
- `scripts/test_portability.py` — regression fixture proving identity digests use normalized POSIX-relative ordering rather than platform-native `Path` ordering.

The scripts are internal Agent machinery, not a separately supported human-facing CLI product. DSF-specific Definition semantics remain owned by the pinned DSF release and its schemas/docs.
