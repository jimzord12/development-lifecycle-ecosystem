# Design Workspace Framework

An agent-friendly framework for turning ideas into explicit, versioned design and implementation-ready delivery plans.

## Status

This repository currently provides the public monorepo foundation for reusable Design Workspace Framework tooling and packages. Framework packages will be introduced incrementally as their contracts are finalized.

## Principles

- Explicit design truth over hidden assumptions.
- Stable, reviewable decisions and implementation contracts.
- Deterministic workflows shared by humans and coding agents.
- Small, reversible tooling choices over speculative infrastructure.
- Public, framework-generic content only.

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

## Packages

Reusable packages live under [`packages/`](./packages/). The repository intentionally starts without placeholder packages; package boundaries are added only when a real framework capability is ready.

## License

MIT. See [`LICENSE`](./LICENSE).
