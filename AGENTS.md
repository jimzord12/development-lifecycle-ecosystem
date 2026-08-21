# Agent Instructions

## Repository purpose

This repository is the public, framework-generic home of the Development Lifecycle Ecosystem (DLE) and reusable tooling built around its independently versioned lifecycle components.

Do not add private company material, credentials, private repository identities, project-specific delivery artifacts, or proprietary implementation details.

## Authority

Treat checked-in specifications, decision records, schemas, fixtures, and tests as authoritative for the behavior they explicitly define. Do not invent missing semantic contracts. When required behavior is underspecified or contradictory, stop that behavior-changing work and surface the gap clearly.

Drafts under [`docs/proposals/`](./docs/proposals/) are discussion material only. They are not accepted contracts. Do not implement from a proposal, and do not treat a proposal as overriding a published standard. Acceptance means the substance is promoted into a standard, schema, fixture, test, or decision record.

## Architecture

- DLE is an umbrella, not a mandatory shared runtime.
- First-class components occupy `packages/<component-id>/` with `dle-component.json` and a README Public Contract. Current hosted components: `packages/dwf`, `packages/dsf`, `packages/implementation-record-system`.
- Cross-component dependencies are directional and contract-only. Monorepo co-location grants no permission to import internals. IRS may consume DSF public Delivery meaning only; DWF may prepare packages that pin DSF/DWF `.framework/` releases. Do not import component internals.
- Companion CLIs are owned by their parent component. Delivery CLI lives at `packages/dsf/cli/` and must not be introduced as `packages/delivery-cli/`.
- Follow [DLE Component Standard V1](./docs/standards/dle-component-standard-v1.md) and [DLE CLI Standard V1](./docs/standards/dle-cli-standard-v1.md).
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
