# Agent Instructions

## Repository purpose

This repository is the public, framework-generic home of the Development Lifecycle Ecosystem (DLE) and reusable tooling built around its independently versioned lifecycle components.

Do not add private company material, credentials, private repository identities, project-specific delivery artifacts, or proprietary implementation details.

## Authority

Treat checked-in specifications, decision records, schemas, fixtures, and tests as authoritative for the behavior they explicitly define. Do not invent missing semantic contracts. When required behavior is underspecified or contradictory, stop that behavior-changing work and surface the gap clearly.

Proposal records under [`docs/proposals/`](./docs/proposals/) are not authoritative contracts and never override a published standard. Do not implement an unfinished proposal. An `implementation-ready` proposal authorizes its accepted substance to be materialized into authoritative standards, contracts, schemas, fixtures, tests, or code.

Proposal identity, YAML metadata, dependency, scheduling, and derived-index rules are enforced by `pnpm proposals:check`. Edit proposal frontmatter rather than hand-editing the generated proposal rows in `docs/proposals/README.md`.

## Proposal workflow

Follow [DLE Proposal Workflow V1](./docs/standards/dle-proposal-workflow-v1.md). Validate and run `pnpm proposals:orient` before proposal work; an explicitly selected proposal takes precedence over the automatic recommendation. Read only the selected proposal and the authority needed for its next action, keep `ACTIVE` chat-local, and persist exactly one allowed session outcome. After a metadata mutation, regenerate and validate the proposal index. Never infer authority to set `implementation-ready`, `rejected`, or `superseded`.

Keep `exploration`, `design-draft`, and `implementation-ready` proposals directly under `docs/proposals/`. Terminal proposals belong in `docs/proposals/archive/<status>/`, where `<status>` is `implemented`, `superseded`, or `rejected`. Proposal discovery is recursive, proposal IDs remain stable when paths move, and terminal records never return to unfinished status.

A terminal transition is one coherent change: update authorized lifecycle metadata and the body record, remove continuation metadata, use `git mv` to preserve history, update repository links, regenerate the proposal index, and run proposal plus broader validation. Do not create redirect files, duplicate proposal copies, path registries, or placeholder archive directories.

## Architecture

- DLE is an umbrella, not a mandatory shared runtime.
- First-class components occupy `packages/<component-id>/` with `dle-component.json` and a README Public Contract. Current hosted components: `packages/dwf`, `packages/dsf`, `packages/implementation-record-system`.
- Cross-component dependencies are directional and contract-only. Monorepo co-location grants no permission to import internals. IRS may consume DSF public Delivery meaning only; DWF may prepare packages that pin DSF/DWF `.framework/` releases. Do not import component internals.
- Companion CLIs are owned by their parent component. Delivery CLI lives at `packages/dsf/cli/` and must not be introduced as `packages/delivery-cli/`.
- Follow [DLE Component Standard V1](./docs/standards/dle-component-standard-v1.md), [DLE CLI Standard V1](./docs/standards/dle-cli-standard-v1.md), and [DLE Proposal Workflow V1](./docs/standards/dle-proposal-workflow-v1.md).
- Package-local `AGENTS.md` files override this file only for that package. The nearest applicable file wins.

## Standard commands

- Install: `pnpm install --frozen-lockfile`
- Format: `pnpm format`
- Format check: `pnpm format:check`
- Lint: `pnpm lint`
- Type-check: `pnpm typecheck`
- Test: `pnpm test`
- Coverage: `pnpm test:coverage`
- Build: `pnpm build`
- Full validation: `pnpm validate`

Run `pnpm validate` before considering a code/configuration change complete.

## Change discipline

- Keep changes scoped to the requested outcome.
- Preserve existing public contracts unless the task explicitly changes them.
- Prefer small, reversible, dependency-light solutions over speculative infrastructure.
- Do not add packages, build systems, bots, or provider-specific instruction files without a demonstrated need.
- Add package-local `AGENTS.md` files only when a package needs materially different guidance; the nearest applicable file wins.

## Git

After work is complete and `pnpm validate` has passed:

- commit the intended files on `main`
- push `main` to the remote
- do not open pull requests

Do not leave completed work uncommitted or unpushed.
