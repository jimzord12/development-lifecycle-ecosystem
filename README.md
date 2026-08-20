# Development Lifecycle Ecosystem

The Development Lifecycle Ecosystem (DLE) is the public, framework-generic umbrella for loosely coupled lifecycle frameworks, systems, and companion tooling.

DLE is not one giant framework and does not imply one mandatory runtime. First-class components own one bounded lifecycle responsibility, publish an explicit public contract, and are independently versioned and distributable.

## Status

This repository currently provides:

- the DLE Component Standard V1
- the DLE CLI Standard V1
- the DSF first-class component (1.1.1) with Delivery Definition schema v2
- a DSF-owned Delivery CLI with read-only `delivery validate`

Additional first-class components such as DWF (Design Workspace Framework) and IRS (Implementation Record System) are part of the ecosystem model. Their packages are added only when their contracts are ready. Do not treat co-location in this monorepo as a runtime coupling.

## Principles

- Explicit design truth over hidden assumptions.
- Stable, reviewable decisions and implementation contracts.
- Deterministic workflows shared by humans and coding agents.
- Small, reversible tooling choices over speculative infrastructure.
- Public, framework-generic content only.
- Contract-only cross-component dependencies.
- No mandatory shared DLE runtime.

## Standards

- [DLE Component Standard V1](./docs/standards/dle-component-standard-v1.md)
- [DLE CLI Standard V1](./docs/standards/dle-cli-standard-v1.md)

## Components

First-class DLE Components live under [`packages/<component-id>/`](./packages/). Each component root has `dle-component.json` and a README with a **Public Contract** section.

Currently materialized:

- [`packages/dsf`](./packages/dsf/) — Delivery System Framework. Owns the optional [Delivery CLI](./packages/dsf/cli/) under `packages/dsf/cli/`.

Delivery CLI is not a peer component. Do not add `packages/delivery-cli/`.

## Development

Requirements:

- Node.js 24 LTS (`>=24.18.0 <25`)
- pnpm 11.17.0

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Run the complete validation pipeline:

```bash
pnpm validate
```

The root validation contract is:

```text
format:check → lint → typecheck → test:coverage → build
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution workflow and [`AGENTS.md`](./AGENTS.md) for coding-agent guidance.

## License

MIT. See [`LICENSE`](./LICENSE).
