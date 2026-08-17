# Agent Instructions

## Repository purpose

This repository is the public, framework-generic home of the Design Workspace Framework and reusable tooling built around it.

Do not add private company material, credentials, private repository identities, project-specific delivery artifacts, or proprietary implementation details.

## Authority

Treat checked-in specifications, decision records, schemas, fixtures, and tests as authoritative for the behavior they explicitly define. Do not invent missing semantic contracts. When required behavior is underspecified or contradictory, stop that behavior-changing work and surface the gap clearly.

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
- Use normal pull-request workflows. Do not bypass required validation or branch protections.
