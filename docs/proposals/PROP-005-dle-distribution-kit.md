---
id: PROP-005
title: DLE Distribution Kit
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Define the curated DLE Distribution Kit contract for exact component
  requirements, integrity, compatible release sets, immutable installation,
  local binding, project bootstrap and adoption, routing, and skill discovery.
dependsOn:
  - PROP-002
supersedes:
  - removed dle-host-cli.md, dle-exclusive-distro.md, and dle-host-cli-deno.md drafts
  - bootstrap/CLI portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner
lastReconciledAgainst: main@b01da4fb01b94b0d3d626d404197bf0696b7c512
affectedComponents:
  - dle
nextAction: Specify the `dleComponents` artifact, local binding schema, and exact `Continue this project` setup/check contract.
---

# Proposal: DLE Distribution Kit

## Summary

Define the **DLE Distribution Kit**, an optional umbrella-owned distribution and bootstrap product for the [DLE project instance model](./PROP-002-dle-project-instance-model.md). It owns exact readable component requirements, release location and integrity, curated compatible sets, immutable installation, machine-local binding, project bootstrap/adoption, provider-neutral routing and skill discovery, and the setup portion of `Continue this project`.

The Distribution Kit is deterministic plumbing, not a mandatory shared runtime and not the normal component-domain conversation loop. Its umbrella-owned executable is the `dle` CLI. DWF, DSF, and IRS remain independently versioned and directly consumable under their public contracts.

The kit is a small curated distribution, not a public registry or dependency solver. Exact or unverifiable changes fail closed, and the first supported release behaves consistently on Windows, macOS, and Ubuntu.

## Product Boundary

### Distribution Kit responsibilities

The kit owns:

- the exact readable `dleComponents` project record;
- release locators, integrity verification, and curated compatibility rules;
- immutable component installation and store behavior;
- machine-local, non-committed project and repository bindings;
- project-instance bootstrap, adoption/join, and binding repair;
- the setup and validation portion of `Continue this project`;
- provider-neutral router and component-skill discovery;
- umbrella documentation and diagnostic output; and
- later fail-closed component add/update operations after read-only validation is proven.

### Excluded responsibilities

The kit must not:

- perform DWF design operations;
- own or reinterpret DSF Delivery semantics;
- start, review, repair, or close IRS implementation work;
- mutate IRS tracker state or implementation evidence;
- resolve a Design Gap;
- dispatch arbitrary component CLI commands;
- become a runtime imported by first-class components;
- expose a public plugin marketplace or anyone-can-publish registry; or
- substitute a nearby component version when the exact required release is unavailable.

Companion CLIs remain owned by their parent components. Updating installed IRS code is Distribution Kit work; migrating IRS tracker state is IRS work.

## The `dleComponents` Contract

One Git-tracked project record named conceptually `dleComponents` is the readable source of exact DLE release requirements. It is not an opaque digest and does not fingerprint the DLE development repository.

Each required entry must contain enough information to resolve and verify an immutable release, including:

```text
component id
exact component version
release or distribution locator
payload integrity information
owned companion-CLI identity when needed for verification
```

At minimum, DWF and DSF entries identify the exact contracts that interpret canonical design and Delivery files. This proposal must decide whether the complete record also lists IRS, the Distribution Kit, and future components.

Settled principles:

- exact versions only;
- one semantic record rather than a manifest/lockfile pair without a resolution process;
- deterministic UTF-8 and LF serialization for committed text;
- one documented relative path across supported operating systems;
- no absolute machine paths;
- no reuse of DSF-specific `delivery/.framework/` as a DLE-wide composition file;
- release integrity information must be independently verifiable;
- a proposed complete set is validated before mutation; and
- project truth always wins over a user-global cache.

Still to be specified are the exact path, schema/version, locator vocabulary, integrity representation, complete admitted-component shape, and companion-CLI verification rules.

## Curated Compatible Release Sets

Compatibility belongs to the consumer of the exact selected set, not to providers guessing every future integration. The Distribution Kit maintains a small accepted-set or compatibility contract for the curated DLE catalog.

It uses this fail-closed sequence:

```text
construct proposed exact set
→ validate identity, availability, integrity, and accepted compatibility
→ compute the complete install/project mutation
→ persist atomically
```

Unknown components, unavailable exact releases, digest mismatches, unsupported sets, or installed/pinned identity mismatches produce no semantic mutation and return one recommended resolution action.

The kit has no version ranges, dependency solver, transitive package graph, hoisting, dist-tag authority, marketplace, or silent “closest compatible” selection.

## Immutable Installation and Store

Resolved component releases are installed as immutable, integrity-checked payloads. The exact store path and layout remain open, but the contract must ensure:

- an installed payload is addressed by exact identity and integrity;
- mutation never changes an existing release in place;
- a failed install or update leaves the prior usable set intact;
- caches are non-authoritative and safely replaceable;
- project pins select the active set; and
- different projects may use different exact releases without a single global active toolchain.

The store may be outside the project instance. Portability comes from `dleComponents` plus deterministic resolution and local rebinding, not copied framework trees inside canonical design or Delivery.

## Local Binding

Machine-specific state is local and non-committed. It may bind:

- the project instance root;
- the local Distribution Kit/component-store location;
- implementation-repository identities to local paths; and
- optional non-authoritative cache paths.

The exact local path, schema, discovery rules, and repair transitions remain to be defined. They must never place credentials or machine-specific absolute paths in portable project truth.

Safe deterministic discovery may locate a known project root or repository. When it cannot, the setup flow asks for the minimum missing path rather than scanning broadly or guessing identity.

## Project Bootstrap and Adoption

The Distribution Kit creates or joins project instances only after required inputs are explicit and valid.

Bootstrap of a new project must:

- create one randomly generated immutable `projectId`;
- create the accepted project-instance structure in an empty target;
- persist valid `dleComponents` and other umbrella-owned portable metadata;
- establish local bindings separately; and
- emit the project entrypoint and one recommended next action.

Adoption or join of an existing project must preserve its `projectId` and shared truth. It may create or repair local bindings, but it must not re-scaffold or silently rewrite canonical design, Delivery, Topics, or IRS state.

Creating an independent project or fork is a separate explicit operation that generates a new `projectId`; copying or cloning does not do so automatically.

## Continue This Project

The kit owns the first coordinated steps of the user-facing operation equivalent to:

```text
Continue this project
```

Its setup/check contract must:

1. locate and validate the project root and `projectId`;
2. read and validate `dleComponents`;
3. resolve every exact release and verify integrity and set compatibility;
4. locate or request implementation repositories when safe discovery fails;
5. verify repository identities and expose local paths through binding;
6. repair binding only through explicit, validated transitions;
7. recompute or coordinate `designDeliveryManifest` and `designDeliveryDigest` using DWF/DSF membership contracts;
8. invoke required DWF/DSF structural validators without taking ownership of their meaning; and
9. hand control and validated context to IRS for baseline, Git continuation, and next-work checks.

The umbrella router presents one final outcome after bounded component calls return. The Distribution Kit does not absorb component playbooks.

## Router and Skill Discovery

The Distribution Kit provides provider-neutral discovery for the umbrella `dle` router skill and component-owned `dwf`, `dsf`, and `irs` skills.

The router may classify an ordinary-language request, load the bounded owner, and return to coordinate a multi-owner operation such as continuation or upgrade. It owns no component-domain method.

Skill discovery is read-only. It returns canonical packaged skill source locations and enough metadata for a capable agent or harness to map them into its supported scope. The kit must not guess or write provider-specific user directories, and there must be one canonical owner for each skill's content.

## CLI and Implementation Boundary

The executable is the umbrella-owned `dle` CLI. Exact command names remain design details, but the first surface should be read-mostly and cover help, version, docs, validation, component listing, skill discovery, and—when their contracts are complete—bootstrap and adoption.

The CLI validates only Distribution Kit-owned composition, installation, integrity, binding, and project-container structure. It does not hide every component validator behind one facade.

If implemented, the accepted technology boundary remains:

- TypeScript source;
- self-contained per-OS executables produced with a pinned Deno compiler;
- no Node, Deno, or Bun requirement on the user's `PATH`;
- no Rust or Bun implementation;
- Go is not reopened unless Deno cannot satisfy the accepted operating-system contract;
- DSF's `delivery` CLI remains Node/TypeScript under DSF ownership; and
- no shared CLI core until repeated real use justifies a separately owned abstraction.

The exact source directory, Deno version, release assets, and command/error schemas remain open.

## Cross-Platform Contract

The first release supports Windows, macOS, and Ubuntu as first-class targets. It requires:

- the same `dleComponents` and command semantics on every target;
- OS path APIs rather than manual separator handling;
- no mandatory symlink, junction, Developer Mode, chmod, or shebang-only public path;
- atomic replacement and recovery tested on Windows;
- lowercase case-safe component IDs and OS-safe names;
- deterministic LF serialization of committed text; and
- real target-OS execution tests before release.

Generic Linux distributions, mobile systems, and browser runtimes are not first-release commitments.

## Legacy Upgrade Coordination

For `Upgrade this project`, the Distribution Kit owns creation of the new empty target, new project identity, exact component resolution, local bindings, and atomic activation after DWF and IRS migration owners succeed.

It must never convert an active legacy Workspace/PIP/IRS tree in place. Legacy inputs remain untouched migration evidence until cutover is proven. The new compatible set contains no PIP creation or Package Amendment behavior; legacy releases remain resolvable only for validation and projects that have not migrated.

## Compatibility and Release Order

The Distribution Kit is independently versioned umbrella tooling. Its first project-instance contract is defined before DWF and IRS complete their dependent designs so those components can target exact composition and binding boundaries.

The publish order is different from the design order: after DWF and IRS release their breaking project-instance lines and any necessary DSF changes are known, the Distribution Kit publishes the exact tested compatible release set last. It never silently substitutes another version.

Existing components remain directly consumable where their current Public Contracts allow it. The kit does not synchronize component versions or become a required import.

## Promotion Path

Before this proposal becomes `implementation-ready`:

1. Specify the exact `dleComponents` path, schema, serialization, and component coverage.
2. Specify admitted-component, release-locator, payload-integrity, and compatible-set contracts.
3. Specify the immutable install/store layout and atomic replacement/recovery behavior.
4. Specify local binding path/schema, safe project/repository discovery, and repair transitions.
5. Specify bootstrap, adoption, independent-fork, and setup portions of `Continue this project`.
6. Specify provider-neutral router and component-skill discovery.
7. Specify exact CLI commands, JSON envelopes, errors, Deno version, source location, release assets, and CI matrix.
8. Specify coordinated legacy-upgrade activation and rollback boundaries.

## Acceptance Criteria for a Later Implementation

1. `dleComponents` deterministically records readable exact releases and integrity without an opaque composition fingerprint.
2. Validation rejects unknown, unavailable, incompatible, missing, or integrity-mismatched exact releases without mutation.
3. Immutable install/store and atomic replacement behavior preserve every previously usable set after failure.
4. Local bindings contain machine paths but portable project truth contains none.
5. Bootstrap creates one valid project identity; adoption preserves it; an explicit independent-fork operation changes it.
6. `Continue this project` validates setup and hands bounded context to component owners without absorbing their playbooks.
7. Every setup, validation, binding, and component-resolution outcome includes an outcome, reason, and primary recommended next action.
8. Skill discovery remains read-only and provider-neutral.
9. Self-contained binaries pass real Windows, macOS, and Ubuntu tests without an external JavaScript runtime.
10. Coordinated upgrade creates a new target, retains legacy evidence, and activates only after all owners validate successfully.

## Open Questions

1. What is the exact `dleComponents` path, schema, version, and complete component coverage?
2. Where do the admitted-component and compatible-set contracts live?
3. Which release locator and integrity formats are supported first?
4. What is the immutable install/store layout and garbage-collection boundary?
5. What is the local binding path/schema and bounded discovery algorithm?
6. What exact bootstrap, adoption, independent-fork, and continuation commands and JSON results are public?
7. Where do sources and compiled release assets live, and which OS/architecture pairs are mandatory?
8. What atomic activation and recovery record coordinates one-way legacy upgrade?

## Promotion Record

Not implemented.
