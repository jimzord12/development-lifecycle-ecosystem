# Delivery System Framework (DSF)

DSF is a first-class [Development Lifecycle Ecosystem](../../README.md) component.

It owns reusable Delivery Framework rules, contracts, schemas, documentation, and the generation model for project Delivery Definitions. It is not a mandatory runtime, and it is not the same thing as a project Delivery Definition or the optional Delivery CLI.

## Public Contract

External consumers may rely only on the following surface.

### Identity

- Manifest: [`dle-component.json`](./dle-component.json)
- Component id: `dsf` (immutable)
- Component version: **1.1.1**
- Kind: `framework`
- Delivery Definition schema version: **2**
- Delivery CLI version: independent (`cli.version` in the manifest, currently `0.1.0`)
- CLI-state schema version: not published

### Terminology

Keep these concepts separate:

1. **Delivery Framework / DSF** — reusable generic rules, contracts, schemas, documentation, and generation model
2. **Delivery Definition / Delivery Instance** — one project's declarative Roadmap/Milestone/Phase decomposition and associated project Delivery truth
3. **Delivery CLI** — optional deterministic tooling that validates and, where adopted, operates mutable execution state under DSF/Delivery rules
4. **CLI-owned mutable execution state** — optional, distinct from Definition truth, not required to consume DSF output

Use **Delivery System** only as an umbrella when those are intentionally meant together.

### Current public assets

- this README, including this Public Contract
- [`dle-component.json`](./dle-component.json)
- Delivery Definition schema v2:
  - [`contract/schemas/v2/roadmap.schema.json`](./contract/schemas/v2/roadmap.schema.json)
  - [`contract/schemas/v2/milestone.schema.json`](./contract/schemas/v2/milestone.schema.json)
  - [`contract/schemas/v2/phase.schema.json`](./contract/schemas/v2/phase.schema.json)
  - [`contract/schemas/v2/design-gap.schema.json`](./contract/schemas/v2/design-gap.schema.json)
- contract index: [`contract/README.md`](./contract/README.md)
- release metadata: [`contract/release.json`](./contract/release.json)
- the optional companion CLI relationship `cli.name = "delivery"` / `cli.version` in the manifest
- the Delivery CLI under [`cli/`](./cli/), which is **not** a first-class DLE Component

Supported public artifact types:

| Artifact   | Location                         |
| ---------- | -------------------------------- |
| Roadmap    | `delivery/roadmap.json`          |
| Milestone  | `delivery/milestones/M-*.json`   |
| Phase      | `delivery/phases/P-*.json`       |
| Design Gap | `delivery/design-gaps/DG-*.json` |

### Compatibility and version axes

Do not conflate:

1. DSF/component version (`1.1.1`)
2. Delivery Definition schema version (`2`)
3. Delivery CLI version (independent)
4. CLI-state schema version (unpublished)

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

`delivery validate` is the read-only schema and graph/invariant validator for Definition schema v2. It does not answer operational eligibility questions. `delivery docs` is the read-only agent-oriented documentation retrieval command for the installed CLI contract.

### Deterministic validation

Consumers can determine structural validity of public Delivery Definition artifacts against the published v2 schemas without conversational judgment. Graph/reference invariants are enforced by `delivery validate` after schema validation.

### Private by default

Everything not listed in this Public Contract is internal. Monorepo co-location does not grant permission to import DSF internals from other components.

## Layout

```text
packages/dsf/
├── dle-component.json
├── README.md
├── contract/
│   ├── README.md
│   ├── release.json
│   └── schemas/v2/
└── cli/                 # subordinate Delivery CLI
```

Do not introduce `packages/delivery-cli/` as a peer first-class component.
