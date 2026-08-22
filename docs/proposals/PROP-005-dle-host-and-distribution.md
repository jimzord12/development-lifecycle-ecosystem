---
id: PROP-005
title: DLE Host and distribution
status: design-draft
workState: PLANNED
priority: 3
summary: >-
  Define an optional umbrella-owned DLE Host CLI and curated distribution contract for exact component pins, integrity, compatibility, local binding, bootstrap, and skill discovery. The Host remains deterministic plumbing and never performs component-domain work.
dependsOn:
  - PROP-002
supersedes:
  - removed dle-host-cli.md, dle-exclusive-distro.md, and dle-host-cli-deno.md drafts
  - bootstrap/CLI portions of the removed co-located-project-dle-namespace.md draft
decisionAuthority: repository owner
lastReconciledAgainst: main@b14120ec965a0a46c845bfddd9bab167062703d9
affectedComponents:
  - dle
nextAction: null
---

# Proposal: DLE Host and distribution

## Summary

Define one optional umbrella-owned `dle` Host CLI and distribution contract. The Host manages the installed set of DLE components and the project-level container that consumes them: distribution, exact pins, integrity, compatibility, local binding, project bootstrap, and packaged skill discovery. It never performs component-domain work and is not the normal daily conversation loop.

DLE distribution is a small curated distro, not a public registry or dependency-solver ecosystem. Projects pin exact immutable component releases with digests, illegal or unverifiable changes fail before mutation, and the first supported Host release must behave consistently on Windows, macOS, and Ubuntu.

If implemented, the Host is TypeScript compiled with Deno into per-OS executables. Users do not need Node, Deno, or Bun on `PATH`. The DSF-owned `delivery` CLI remains Node/TypeScript.

This proposal consolidates the earlier overlapping Host, distro, Deno, and bootstrap drafts. It is not yet implementation-ready because the composition and local-binding artifacts are still unresolved.

## Product boundary

### What `dle` owns

The Host owns umbrella-level concerns:

- install or locate a DLE distribution;
- report Host identity and version;
- read and validate the project's exact DLE component composition;
- verify installed component identity and payload integrity against pins;
- evaluate curated compatibility rules for the selected component set;
- initialize or join/bind a DLE project instance;
- expose packaged DLE documentation;
- report packaged router/component skill source locations; and
- later, mutate exact component pins through fail-closed add/update operations.

### What `dle` does not own

The Host must not:

- perform DWF design operations;
- validate or mutate a DSF Delivery Definition;
- start, review, repair, or close implementation work;
- mutate IRS run state;
- resolve a Design Gap;
- dispatch arbitrary component CLI commands;
- become a shared runtime imported by DLE components;
- expose a plugin marketplace or anyone-can-publish registry; or
- replace generic language/package managers for unrelated dependencies.

Examples of forbidden command shapes:

```text
dle delivery ...
dle dwf ...
dle irs ...
dle exec <component-cli>
dle phase ...
```

Companion CLIs remain owned by their parent components. Updating the installed DWF release is Host work; migrating a DWF-owned persisted artifact is DWF work. The same boundary applies to every component.

### Daily UX

The normal daily user interaction is the `dle` **router skill** described by the project-instance proposal and agent UX standard. The Host CLI is deterministic plumbing and bootstrap.

Do not add `dle operate`. A CLI command whose only effect is to tell a coding agent to load the router skill adds indirection without capability. The project entrypoint and skill discovery output should point to the router directly.

## Host identity

`dle` is umbrella-owned tooling. It is not a first-class lifecycle component and must not create a hollow component merely to satisfy the current companion-CLI ownership rule.

Acceptance therefore requires an explicit standards amendment that defines:

- **companion CLI** — owned by one first-class component and operating that component's domain artifacts;
- **DLE Host CLI** — optional umbrella-owned tooling operating distribution, composition, binding, and project-container concerns.

The Host has independent SemVer. It may adopt the stable process conventions of DLE CLI Standard V1—non-interactive behavior, universal `--json`, exact errors, help, version, docs, and atomic CLI-owned mutation—but must not pretend to be a companion CLI or report a parent component identity.

The final design must decide whether to publish a small Host Standard V1 or amend the existing CLI Standard with a clearly separated Host profile. Do not bump `dleCliStandard` merely because a different CLI product class exists.

## Curated distribution model

DLE is a small, intentional catalog of first-class lifecycle components. Design for roughly fifteen components; twenty is an extreme ceiling, not a scaling target.

### Adopt

- exact Git-tracked project pins;
- immutable released component payloads;
- cryptographic digests/checksums;
- fail-closed validation before mutation;
- isolated component boundaries;
- a curated compatibility picture owned at the DLE/project-composition level;
- deterministic, reproducible CI; and
- project-local truth taking precedence over a user-global cache.

### Reject

- version ranges and a dependency solver;
- transitive package graphs and hoisting;
- public self-service publication;
- dist-tags such as `latest` as project authority;
- postinstall scripts as a distribution contract;
- plugins or marketplace semantics;
- one global active DLE toolchain overriding project pins; and
- speculative dependency metadata in every `dle-component.json`.

Package registries or release assets may be transport mechanisms. They are not the semantic DLE catalog.

## Composition artifact

One Git-tracked project composition artifact is the intended source of truth. It should contain, at minimum, exact component identity and integrity information:

```text
component id
component version
payload digest
release/distribution locator or catalog key
optional owned companion-CLI identity when needed for verification
```

Principles already settled:

- exact versions only;
- one semantic file, not manifest + lockfile while no resolution process exists;
- UTF-8 without BOM and deterministic LF serialization;
- one documented relative path across supported OSs;
- no absolute machine paths;
- no reuse of DSF-specific `delivery/.framework/` as the DLE-wide composition file;
- component providers do not list all consumers in their manifests; and
- a proposed pin set is validated before any project mutation.

Still unresolved:

- exact path and filename;
- JSON schema and schema version;
- distribution locator vocabulary;
- whether companion-CLI versions are independently pinned or derived/verified from the component release;
- catalog and compatibility file locations; and
- whether the installed payload lives inside the project instance, beside it, or in a Host-managed immutable store referenced by the project.

No Host implementation may begin until those are specified.

## Compatibility ownership

Compatibility belongs to the consumer of the selected set, not to providers guessing every future integration.

For the small curated catalog, prefer a DLE-owned compatibility table or accepted-set contract over a general-purpose solver and `dependsOn` fields spread across component manifests.

Host behavior must be:

```text
construct proposed exact set
→ validate identity, availability, integrity, and accepted compatibility
→ compute complete mutation
→ atomically persist the composition/install change
```

or persist no semantic change.

Unknown component, unavailable release, digest mismatch, illegal set, or pin/install mismatch fails closed with stable machine-readable errors.

## Project bootstrap and binding

The Host may provide:

```text
dle init <instance-path> ...
dle join <instance-path> ...
dle skills
dle validate
dle list
dle docs ...
```

Names are design targets; exact arguments remain open.

### `init`

Creates a new project instance only after DLE installation/composition inputs are explicit and valid. It may scaffold the accepted instance directories and a project entrypoint, then emit skill discovery guidance.

It must not silently choose a hidden DLE home, clone mutable `main` as project authority, write into provider-specific agent directories, or start component-domain work.

### `join`

Binds one machine to an existing project instance. It must not re-scaffold or rewrite shared project truth.

### Local binding

Machine-specific state may bind:

- project instance root;
- installed DLE distribution or immutable store;
- exact composition/pin artifact;
- implementation repository paths; and
- optional local cache paths.

The bind is local and non-committed. Its exact path and schema remain open. The committed composition artifact—not the bind or cache—is project authority.

### Skill discovery

`dle skills` is read-only. It returns the canonical packaged skill source locations and enough metadata for a capable agent to install/copy/link them into the current harness's supported user or project scope.

The Host must not guess or write provider-specific skill directories. The consuming agent/harness owns that mapping.

## CLI surface and sequencing

### First read-only surface

The first useful Host release should be boring and read-mostly:

```text
dle --help / -h
dle --version
dle docs [<topic>] [--index|-i] [--all|-a]
dle validate
dle list
dle skills
```

If project bootstrap is required for the first real consumer, `init` and `join` may be included after their artifacts are specified.

`dle validate` validates only Host-owned composition, install integrity, binding, and project-container structure. It must not run every companion validator behind one facade.

Mutation commands such as `add` and `update` come only after read-only validation and atomic install/pin replacement are proven on all supported OSs.

## Cross-platform contract

The first Host milestone supports:

| OS           | Requirement                                           |
| ------------ | ----------------------------------------------------- |
| Windows      | First-class native support; WSL-only is insufficient. |
| macOS        | First-class support.                                  |
| Ubuntu Linux | First-class Linux representative.                     |

Not promised in v1: every Linux distribution, mobile, browser runtimes, or generic POSIX compatibility.

Requirements:

- same composition file and command semantics on all three;
- OS path APIs rather than manual slash concatenation;
- no mandatory symlink/junction or Developer Mode requirement;
- no chmod/shebang-only public entrypoint;
- atomic replace/recovery behavior that is tested on Windows;
- lowercase, case-safe component ids;
- OS-safe path lengths and names;
- deterministic LF serialization of committed artifacts;
- project pins remain authority over any global cache; and
- CI executes the Host tests on Windows, macOS, and Ubuntu before release.

## Implementation technology lock

If the Host is accepted:

- language: TypeScript;
- ship form: `deno compile` to self-contained per-OS executables;
- user runtime requirement: none of Node, Deno, or Bun on `PATH`;
- Bun: not the compiler/runtime;
- Rust: not used;
- Go: not selected and not reopened unless Deno cannot meet the supported OS contract;
- Delivery CLI: remains Node/TypeScript under `packages/dsf/cli/`;
- shared `dle-cli-core`: prohibited unless repeated real use later justifies a separately owned abstraction.

Pin the Deno version used for release. Cross-compilation may produce an artifact, but only execution on the target OS proves support.

The exact Host source directory and release-asset layout remain open.

## Non-goals

- public registry or third-party plugin marketplace;
- SemVer range solving;
- arbitrary domain command dispatch;
- shared mandatory DLE runtime;
- rewriting companion CLIs in Deno;
- automatic writes into harness-specific directories;
- supporting every Linux distribution;
- implementing before the composition/bind contracts are accepted; or
- silently replacing current PIP/framework pin behavior in existing consumers.

## Compatibility and versioning

The Host is a new independently versioned umbrella product. Its introduction requires explicit standard text because current CLI Standard V1 applies only to companion CLIs.

The composition schema, Host CLI, catalog/compatibility data, and released component payloads must each have unambiguous version ownership. Do not synchronize component versions merely because the Host distributes them.

Existing components must remain consumable without invoking the Host where their current Public Contracts support direct consumption.

## Promotion path

Before this proposal becomes `implementation-ready`:

1. Specify the composition artifact path, schema, and canonical serialization.
2. Specify the admitted-component catalog and compatibility contract.
3. Specify release locator and digest verification semantics.
4. Specify install/store layout and atomic replacement behavior.
5. Specify local bind path/schema and deterministic project discovery.
6. Decide Host Standard V1 versus a separated Host profile in CLI Standard V1.
7. Specify exact first-release commands, JSON envelopes, and stable error codes.
8. Specify Deno version, source location, build targets, release asset names, and CI matrix.
9. Decide whether `init`/`join` ship in milestone one or after read-only composition validation.

## Acceptance criteria for a later implementation

1. A project composition file deterministically pins exact component releases and digests.
2. `dle validate --json` detects unknown components, unsupported sets, missing payloads, identity/version mismatch, digest mismatch, invalid local bind, and malformed project-container structure without invoking domain validators.
3. No failed mutation leaves a partially changed pin or install set.
4. `dle` never performs component-domain work or arbitrary dispatch.
5. `dle skills` is read-only and provider-neutral.
6. Host binaries run without an external JS runtime on Windows, macOS, and Ubuntu.
7. CI executes real target-OS tests, including path and atomic-replacement cases.
8. Existing companion CLIs and direct component consumption remain valid.
9. A fresh capable agent can use Host docs and project entrypoint to locate the router skill and project instance without learning Host internals.

## Open questions

1. What is the exact composition artifact path and JSON schema?
2. Where do admitted-component catalog and compatibility data live?
3. What payloads and release channels does the first Host actually fetch?
4. Does each pin include companion-CLI version or only verify it from component metadata?
5. What is the immutable install/store layout?
6. What is the local bind path/schema?
7. Is Host process conformance a new Host Standard V1 or an explicit profile in CLI Standard V1?
8. Which `init`/`join` inputs are mandatory, and which deterministic defaults are safe?
9. Where do Host sources and compiled release assets live?
10. Which OS/architecture pairs are mandatory in the first release?

## Promotion record

Not implemented.
