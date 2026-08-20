# DLE Component Standard V1

This document is the public Development Lifecycle Ecosystem (DLE) Component Standard V1.

It defines how first-class lifecycle components are identified, bounded, versioned, and consumed. It does not define a mandatory shared runtime, SDK, service, or implementation language.

## 1. Ecosystem model

**Development Lifecycle Ecosystem (DLE)** is the umbrella for loosely coupled lifecycle frameworks, systems, and companion tooling.

Examples of first-class DLE Components include:

- DWF — Design Workspace Framework
- DSF — Delivery System/Framework capability
- IRS — Implementation Record System
- future bounded lifecycle components, such as orchestration/dispatch capabilities, if they are later designed as independent products

DLE is not one giant framework and does not imply one mandatory runtime.

A first-class **DLE Component**:

- owns one bounded lifecycle responsibility
- has an explicit stable public contract
- is independently versioned
- is independently distributable
- remains conceptually consumable without requiring a particular companion CLI
- depends on other components only through explicit public/versioned contracts
- exposes deterministic validation appropriate to its public artifacts

Subordinate tooling does not become a first-class component merely because it is separately packaged or executable.

## 2. Minimum component filesystem boundary

A first-class component occupies one root equivalent to:

```text
packages/<component-id>/
├── dle-component.json
└── README.md
```

That is the **minimum DLE-level requirement**.

Do not require at DLE-standard level:

- `src/`
- `tests/`
- `docs/`
- `schemas/`
- `package.json`
- TypeScript
- Node
- pnpm/npm
- any other implementation technology

A concrete component may add those when its implementation actually needs them.

Top-level package roots communicate **lifecycle/product ownership**, not implementation convenience.

## 3. `dle-component.json` V1

Every first-class DLE Component has exactly one technology-neutral root identity manifest.

V1 contains at minimum:

```json
{
  "manifestVersion": 1,
  "id": "dsf",
  "name": "Delivery System Framework",
  "version": "<component-semver>",
  "kind": "framework"
}
```

Semantics:

- `manifestVersion` — manifest format version
- `id` — immutable machine identity
- `name` — human-readable component name
- `version` — independent component SemVer
- `kind` — descriptive category such as `framework` or `system`; the vocabulary is not permanently closed

When a companion CLI exists, the component may expose only this minimal optional relationship metadata:

```json
{
  "cli": {
    "name": "delivery",
    "version": "<cli-semver>"
  }
}
```

Do **not** add speculative CLI path, binary catalogue, package registry, supported-version ranges, dependency graph, or runtime metadata until a concrete automation need justifies it.

The JSON Schema for this manifest is [`schemas/dle-component.v1.schema.json`](./schemas/dle-component.v1.schema.json). The schema is intentionally small.

## 4. Public contract and private-by-default rule

Every component root `README.md` contains a mandatory **Public Contract** section.

That section identifies the stable surface external consumers may rely on, including where applicable:

- inputs and outputs
- public schemas/formats
- stable terminology/invariants
- compatibility/version rules
- supported public files/APIs
- supported deterministic machine operations

When concrete public artifacts exist, they may live under:

```text
packages/<component-id>/contract/
```

Do not create an empty `contract/` directory just to satisfy a pattern.

Everything not explicitly declared public is **internal/private by default** and must not be used as a cross-component dependency.

## 5. Cross-component dependency rules

DLE Component dependencies are directional and contract-only.

Rules:

- a consumer may depend only on a provider's explicit public/versioned contract
- monorepo co-location grants no permission to import another component's internals
- a provider does not need to know consumers exist
- compatibility ownership belongs to the consuming component
- hard circular dependencies between first-class components are prohibited
- components must not require one another merely because they are commonly used together

Do not add speculative machine-readable dependency metadata until an actual consumer such as orchestration requires automated discovery.

## 6. Independent SemVer and immutable releases

Every first-class DLE Component and every owned companion CLI has its **own independent Semantic Version**.

For `1.0.0+`:

- MAJOR — backward-incompatible change to that product's declared public contract
- MINOR — backward-compatible public-contract addition/deprecation
- PATCH — compatible correction, bugfix, or clarification

For pre-1.0 DLE products:

- `0.MINOR.PATCH` is used
- changing MINOR may contain breaking public-contract changes
- changing only PATCH must remain backward-compatible within that minor line

The CLI's public contract includes documented commands, options, machine-readable I/O, exit/error semantics, and other stable automation behavior.

Parent component and CLI versions do not need synchronized bumps.

Released/distributed versions are immutable. Any change requires a new version.

## 7. Distribution, validation, and shared-runtime boundaries

### Independent distribution

A released DLE Component must be consumable outside the development monorepo. Its release includes the manifest, Public Contract documentation, and all public assets needed by its supported consumption model.

The monorepo is the development/release home, not a runtime dependency.

### Deterministic validation

Every component defines a deterministic validation surface appropriate to its public artifacts. Consumers must be able to determine structural validity without conversational judgment.

At component-standard level, DLE does not mandate one implementation language or command.

When a companion CLI exists, [DLE CLI Standard V1](./dle-cli-standard-v1.md) requires the common read-only `validate` command.

### No mandatory shared DLE runtime

DLE itself has no runtime, SDK, service, package, or library that every component must depend on.

Do not introduce a mandatory shared DLE runtime merely to centralize helpers.

### Delay shared implementation extraction

Prefer a small amount of duplication over premature coupling. Create shared implementation infrastructure only after repeated real use demonstrates a stable abstraction with clear ownership and compatibility semantics.
