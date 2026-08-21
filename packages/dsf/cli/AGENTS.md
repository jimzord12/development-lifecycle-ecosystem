# Delivery CLI — agent guidance

Nearest package file wins over the repository root `AGENTS.md`.

## Authoritative files

1. DSF public contract: `packages/dsf/README.md`, `packages/dsf/dle-component.json`
2. DLE standards: `docs/standards/dle-component-standard-v1.md`, `docs/standards/dle-cli-standard-v1.md`
3. This package: `docs/PRD.md`, `docs/SPEC.md`, `contract/error-codes.json`
4. Executable behavior: `src/` plus `tests/`
5. Synthetic flow plan: `fixtures/synthetic-p001-p002/README.md`

If these conflict, stop and surface the contradiction. Do not invent Delivery semantics.

## Ownership

- DSF is the first-class DLE Component.
- This CLI is subordinate: `packages/dsf/cli/`.
- Do not create `packages/delivery-cli/`.
- CLI SemVer and DSF SemVer are independent.
- Cross-component imports may use only declared public contracts.

## DLE CLI conformance

Required surface: `--help` / `-h`, `--version`, read-only `validate`, read-only `docs`, `--json` on every result-producing command.

- Non-interactive by default. No prompts. No implicit stdin reads. No typo guessing.
- Human output default; `--json` is exactly one UTF-8 JSON document plus newline.
- Normal JSON failures go to stdout with non-zero exit.
- Branch on `error.code`, never on `error.message`.
- Help explains invocation; docs explains the Delivery mental model.
- No universal `--quiet`, `--verbose`, `--debug`, `--force`, `--yes`, config file, `status`, or `doctor`.

## Frozen Delivery invariants

- No arbitrary JSON-path mutation API.
- Delivery Definition remains usable without CLI tracking.
- CLI-owned mutable state is distinct from Definition truth.
- Canonical validation is distinct from operational eligibility.
- Unsupported schema/version writes fail closed before mutation.
- Migrations, when supported, are explicit, forward, and atomic.
- Lifecycle, blocker, baseline, and acceptance facts are not conflated.
- Submitted acceptance candidates are immutable snapshots under the accepted model.
- Delivery commands must not create Git branches, commits, pushes, PRs, or merges unless a later accepted design explicitly authorizes a named command.
- Design Gaps are human/design-authority decisions. Do not invent product answers.
- Do not silently weaken validation to make implementation easier.

## Bootstrap boundary

The current release implements the DLE universal surface only.

`validate` is a real read-only Definition schema v2 + graph validator. `docs` is a real read-only packaged documentation retrieval command. Domain commands (`phase`, `baseline`, `blocker`, `design-gap`, `init`, `status`, `schema`) remain unknown commands, not successful stubs. Do not implement the mutable operational engine in this package until an authoritative CLI-state schema exists. Do not invent operational semantics in `docs` topics.

## Escalation

A coding inconvenience is not a design gap. If a required semantic contract is missing or contradictory:

1. stop only the affected part
2. record the repository/design fact
3. distinguish implementation freedom from a true product gap
4. do not invent the behavior in code or documentation
5. report the smallest concrete decision required

## Validation before handoff

From the repository root:

```text
pnpm install --frozen-lockfile
pnpm validate
```

From this package:

```text
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm build
```
