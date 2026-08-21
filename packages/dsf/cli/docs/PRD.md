# Delivery CLI PRD

User- and agent-facing product requirements for the optional Delivery CLI owned by DSF.

This document defines behavior, not parser or library implementation.

## Problem statement

Project Delivery Definitions are declarative DSF output: Roadmap, Milestone, and Phase decomposition plus associated project Delivery truth. Humans, coding agents, and automation need a safer operator surface than ad-hoc JSON editing.

Without a dedicated CLI:

- validation is easy to skip or apply inconsistently
- mutable execution facts can be silently mixed into declarative Definition truth
- lifecycle, blocker, baseline, and acceptance transitions can be applied partially
- scripts cannot rely on a stable machine-readable result contract

The Delivery CLI is the optional deterministic tool that validates Definitions and, when a project adopts the CLI profile, operates CLI-owned execution state under DSF/Delivery rules.

## Actors

- **Human operator** — inspects help/version, runs validation, and later performs explicit domain operations.
- **Coding agent** — invokes documented non-interactive commands; never depends on prompts or hidden conversational state.
- **Scripts/CI** — use `--json`, exit codes, and stable `error.code` values.
- **Future orchestration** — a later consumer of the public CLI contract; not implemented here and not a reason to invent dispatcher semantics.

## Optionality

The CLI is optional.

A project Delivery Definition remains conceptually consumable without adopting CLI tracking. A capable coding agent must be able to consume an assigned Phase and implement it without personally invoking the CLI.

Direct consumption without CLI does **not** mean arbitrary raw JSON mutation is allowed.

The CLI is a safer operator/validation surface. It is not a competing source of design truth.

## Mental model

Keep these separate:

1. **DSF / Delivery Framework** — reusable generic rules and public contracts.
2. **Delivery Definition** — declarative project truth under `delivery/`.
3. **Delivery CLI** — optional tooling. CLI-owned mutable state, when adopted, lives under `delivery/.cli/` and is not silently reclassified as Definition truth.

Preferred project layout (project-owned, not this package's tree):

```text
delivery/
├── .framework/          # complete pinned DSF/framework install
├── .cli/                # optional CLI-owned install/runtime/state
├── AGENT-GUIDE.md
├── README.md
├── roadmap.json
├── milestones/
├── phases/
└── design-gaps/
```

Canonical structural validation and operational eligibility are distinct. `validate` does not mean "ready to start."

## Command families

DLE CLI Standard V1 requires:

| Command / flag  | Purpose                                                         |
| --------------- | --------------------------------------------------------------- |
| `--help` / `-h` | Deterministic help; exit 0; no prompt/pager                     |
| `--version`     | CLI + owning component identity                                 |
| `validate`      | Read-only schema/graph/invariant validation. No repair/mutation |
| `docs`          | Read-only documentation retrieval. Compact index by default     |
| `--json`        | JSON-only machine result for every result-producing command     |

Delivery domain families remain component-owned. This table is semantic orientation, not permission to invent missing DSF schema details:

| Command family                  | Semantic purpose                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `delivery status`               | Read-only readiness/blockers/baseline/execution-eligibility explanation                          |
| `delivery init`                 | Initialize optional CLI operational state from canonical definitions when CLI profile is adopted |
| `phase prepare P-*`             | Recompute governing references/current baseline and reconcile supported readiness                |
| `phase start P-*`               | Enforce readiness/blocker/baseline/preconditions and enter execution under CLI profile           |
| `phase submit P-*`              | Freeze the acceptance candidate                                                                  |
| `phase rework P-*`              | Explicit acceptance-to-rework transition                                                         |
| `phase accept P-*`              | Enforce candidate/baseline/evidence/integration requirements and complete the Phase              |
| `milestone accept M-*`          | Enforce constituent/prerequisite/evidence gates where CLI tracking is adopted                    |
| `blocker open/resolve`          | Manage ordinary identified blockers without conflating blocker with lifecycle state              |
| `design-gap open/resolve/clear` | Enforce accepted Design-Gap authority boundaries; CLI must not invent product/design answers     |
| `baseline inspect`              | Read-only current baseline computation/explanation                                               |
| `baseline acknowledge`          | Acknowledge the exact current baseline with reconciliation disposition                           |
| `phase assign/prioritize`       | Operational assignment/priority                                                                  |
| `phase dependency`              | Semantic dependency mutation with stable IDs and cycle rejection where permitted                 |
| `schema status`                 | Read-only compatibility report                                                                   |
| `schema migrate`                | Explicit supported forward atomic migration; refuse unknown write semantics                      |

`docs` is part of the DLE universal surface and is implemented. It is read-only: it does not mutate Definition or `.cli` state, resolve Design Gaps, or imply that the mutable operational engine is implemented. Topics may describe accepted public-contract concepts even where a future mutating command is still unimplemented, and they must distinguish those concepts from currently executable commands.

Do not use docs to fake successful implementation of `phase`, `baseline`, `design-gap`, or similar domain families. The retired Delivery-specific `--docs` flag is not part of the public interface; use `delivery docs`.

**Bootstrap scope:** the DLE universal surface (`--help`, `--version`, `validate`, `docs`, `--json`) is implemented as executable behavior. Domain families remain specified so a later implementation agent can add them from authoritative DSF contracts without inventing semantics.

## Non-interactive behavior

The CLI is non-interactive by default.

- Required inputs come from arguments/options, files, or explicitly selected stdin.
- Missing/invalid required input fails deterministically and non-zero.
- The CLI does not prompt, guess, typo-correct, or wait on stdin implicitly.
- Interactive UX, if added later, must be an explicit opt-in such as `--interactive`, and the same operation must remain available non-interactively.

## JSON automation behavior

Human-readable output is the default. `--json` is JSON only: one UTF-8 document plus one newline on stdout for both normal success and normal failure.

Automation branches on `error.code`, not on `error.message` or a DLE-wide numeric taxonomy.

Exit `0` means success. Non-zero means failure.

## Help vs semantic docs

- `--help` / `-h` document invocation: arguments, defaults, side effects, examples.
- `docs` explains the Delivery mental model. It is not a substitute for `--help`.

## Compatibility expectations

Four independent axes:

1. DSF/component version
2. Delivery Definition schema version
3. Delivery CLI version
4. CLI-state schema version

A CLI that cannot safely operate on a target artifact/version fails closed **before mutation**. Nearby version numbers are not a compatibility guess.

Parent component and CLI versions do not need synchronized bumps.

## Mutation safety

For CLI-owned state the CLI can transactionally control:

```text
validate current → validate inputs/preconditions → compute proposed → validate proposed → commit complete mutation
```

or persist no semantic mutation.

There is no generic arbitrary JSON-path mutation API. Semantic state changes are domain operations and must be atomic for CLI-owned state.

Delivery commands may inspect/validate Git facts where policy requires them. They must not create branches, commits, pushes, PRs, or merges merely because Git state participates in validation.

## Design-Gap authority

Design Gaps remain human/design-authority decisions. The CLI must not invent product or design answers. It may record, gate, and fail closed around Design-Gap state once those domain commands exist.

## Acceptance outcomes for V1 bootstrap

The bootstrap is accepted when:

- DLE CLI Standard V1 universal surface is executable (`--help`, `--version`, `validate`, `docs`, `--json`)
- JSON success/failure envelopes parse as specified
- `validate` is read-only
- `--version --json` exposes CLI name/version, DSF id/version, and `dleCliStandard: 1`
- unknown commands/options fail deterministically
- secret-bearing details are redacted from output
- CLI-owned persistence helper commits completely or not at all
- domain command families are specified, not faked as successful engines
- the synthetic `P-001 → DG-001 → baseline reconciliation → submit → accept → P-002` flow is preserved as a test plan

The bootstrap is **not** the completed Delivery semantic engine.

## Non-goals

- Git mutation (branch/commit/push/PR/merge) by Delivery semantic commands
- Trello or other external projection
- a shared DLE runtime/SDK
- generic orchestration/dispatch
- making the CLI mandatory for DSF consumption
- introducing `packages/delivery-cli/` as a peer component
- redesigning published Delivery Definition schemas
- a generic JSON-path mutation API
- hidden conversational state required for correctness
