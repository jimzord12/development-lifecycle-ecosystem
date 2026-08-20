# Delivery System Framework (DSF)

DSF is a first-class [Development Lifecycle Ecosystem](../../README.md) component.

It owns reusable Delivery Framework rules, contracts, schemas, documentation, and the generation model for project Delivery Definitions. It is not a mandatory runtime, and it is not the same thing as a project Delivery Definition or the optional Delivery CLI.

## Public Contract

External consumers may rely only on the following surface.

### Identity

- Manifest: [`dle-component.json`](./dle-component.json)
- Component id: `dsf` (immutable)
- Component version: independent SemVer in the manifest (`0.1.0` in this tree)
- Kind: `framework`

### Terminology

Keep these concepts separate:

1. **Delivery Framework / DSF** — reusable generic rules, contracts, schemas, documentation, and generation model
2. **Delivery Definition / Delivery Instance** — one project's declarative Roadmap/Milestone/Phase decomposition and associated project Delivery truth
3. **Delivery CLI** — optional deterministic tooling that validates and, where adopted, operates mutable execution state under DSF/Delivery rules

Use **Delivery System** only as an umbrella when all three are intentionally meant together.

### Current public assets

This component currently publishes:

- this README, including this Public Contract
- `dle-component.json`
- the optional companion CLI relationship `cli.name = "delivery"` / `cli.version` in the manifest
- the Delivery CLI bootstrap under [`cli/`](./cli/), which is **not** a first-class DLE Component

Authoritative DSF Delivery Definition schemas are not published in this repository yet. Do not treat unpublished, inferred, or example-only JSON as a stable DSF schema.

When concrete public schemas or formats are accepted, they will be declared here and may live under `contract/`. Until then, that directory is intentionally absent.

### Compatibility and version axes

Do not conflate:

1. DSF/component version
2. Delivery Definition schema version
3. Delivery CLI version
4. CLI-state schema version

They are independent compatibility axes.

### Consumption model

- DSF output is conceptually consumable without adopting the Delivery CLI.
- A capable coding agent must be able to consume an assigned Phase from a Delivery Definition without personally invoking the CLI.
- Direct consumption without CLI does not imply arbitrary raw JSON mutation is allowed.
- The CLI is a safer operator/validation surface, not a source of design truth.
- Mutable CLI execution state is not Delivery Definition truth.
- Canonical structural validation and operational eligibility are distinct concepts.
- Design Gaps are not resolved by CLI invention; authority remains with the accepted human/design process.

### Companion CLI

The Delivery CLI is subordinate to DSF:

```text
packages/dsf/cli/
```

The CLI has its own technical package, executable (`delivery`), and independent SemVer. Parent component and CLI versions do not need synchronized bumps.

The CLI conforms to [DLE CLI Standard V1](../../docs/standards/dle-cli-standard-v1.md) for the universal surface (`--help`, `--version`, `validate`, `--json`). Delivery domain commands are specified in the CLI PRD/SPEC and are not all implemented in the current bootstrap.

### Deterministic validation

Consumers must be able to determine structural validity of public DSF artifacts without conversational judgment. While Delivery Definition schemas are unpublished, the companion CLI `validate` command exists as the DLE-required read-only entrypoint and fails closed rather than inventing schema semantics.

### Private by default

Everything not listed in this Public Contract is internal. Monorepo co-location does not grant permission to import DSF internals from other components.

## Layout

```text
packages/dsf/
├── dle-component.json
├── README.md
└── cli/                 # subordinate Delivery CLI
```

Do not introduce `packages/delivery-cli/` as a peer first-class component.
