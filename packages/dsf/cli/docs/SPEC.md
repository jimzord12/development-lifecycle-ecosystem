# Delivery CLI Technical Spec

Implementation contract for the DSF-owned Delivery CLI.

This spec is precise enough to implement the DLE CLI Standard V1 universal surface now, and to add Delivery domain commands later **without inventing unpublished DSF schema semantics**.

Where an internal implementation choice is delegated, it is marked **Delegated**.

## 1. Authoritative source hierarchy

When sources conflict, higher wins:

1. Checked-in DSF public contracts and schemas, once published
2. [DLE Component Standard V1](../../../../docs/standards/dle-component-standard-v1.md)
3. [DLE CLI Standard V1](../../../../docs/standards/dle-cli-standard-v1.md)
4. This SPEC
5. [PRD.md](./PRD.md)
6. Package-local [AGENTS.md](../AGENTS.md)
7. Root [AGENTS.md](../../../../AGENTS.md)

Do not invent Delivery Definition or CLI-state schemas. If a required domain decision is missing, stop that behavior-changing work and surface a design gap.

## 2. Package and public API boundary

- Filesystem ownership: `packages/dsf/cli/`
- npm package name: `@dle/delivery-cli` (**Delegated** namespace; rename before first publish if maintainers choose a different scope)
- Module type: ESM
- Executable name: `delivery`
- Entrypoint: `dist/bin.js` via package `bin.delivery`
- Node engines: inherit repository `>=24.18.0 <25`

Public consumption model:

- the `delivery` executable is the supported public interface
- documented flags/commands, JSON envelopes, exit semantics, and error codes are the public contract
- programmatic `runCli` is a test/support runner, not a second public product surface

Unsupported deep imports are not part of the public API.

The packaged CLI must run without a development-monorepo checkout. CLI and DSF identity used by `--version` are compiled into the package; the process must not require `packages/dsf/dle-component.json` at runtime.

## 3. Delivery Definition vs CLI-owned state

| Kind                | Role                                                              | Bootstrap rule                                                   |
| ------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Delivery Definition | Declarative project truth                                         | Do not mutate. Do not invent schema.                             |
| CLI-owned state     | Optional execution/lifecycle/blocker/baseline/acceptance tracking | Absent until `init` exists. Persist only through atomic helpers. |
| Framework install   | Pinned DSF material under `delivery/.framework/`                  | Not CLI-owned project truth.                                     |
| CLI install/runtime | Optional `delivery/.cli/`                                         | Exists only when the project adopts the CLI profile.             |

No generic JSON-path mutation API.

## 4. Compatibility rules

Independent axes: DSF version, Definition schema version, CLI version, CLI-state schema version.

- Read identity from compiled constants, not by guessing nearby numbers.
- Any write path must call compatibility checks **before** mutation.
- Unsupported target versions fail with `COMPATIBILITY_UNSUPPORTED`.
- No universal supported-version-range field in V1.

Bootstrap: no write-oriented Delivery commands are implemented. `assertWriteCompatibility` therefore fails closed. That is intentional, not a fake success path.

## 5. Command families and preconditions

### Implemented now

| Invocation                  | Preconditions                 | Side effects     | Result                                                                                        |
| --------------------------- | ----------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `delivery --help` / `-h`    | none                          | none             | exit 0; help text                                                                             |
| `delivery <command> --help` | command is known              | none             | exit 0; command help                                                                          |
| `delivery --version`        | none                          | none             | identity                                                                                      |
| `delivery validate`         | `delivery/` under process CWD | none (read-only) | schema v2 + graph/invariant validation; `COMPATIBILITY_UNSUPPORTED` for other schema versions |
| `--json` on the above       | none                          | none             | one JSON envelope + newline                                                                   |

No-args `delivery` is a missing-command failure (`MISSING_COMMAND`), not implied help.

### Specified, not implemented

Domain families listed in the PRD (`status`, `init`, `phase *`, `milestone *`, `blocker *`, `design-gap *`, `baseline *`, `schema *`, Delivery `--docs`) are **unknown commands** in this bootstrap. Do not stub them as successful no-ops.

When implemented later, each mutating command must:

1. validate current CLI-owned state if present
2. validate inputs/preconditions
3. compute proposed state
4. validate proposed state, including compatibility
5. commit completely or persist nothing

Lifecycle/readiness/blocker/baseline/acceptance facts must not be conflated. Submitted acceptance candidates remain immutable snapshots under the accepted model.

## 6. Result envelope

Success:

```json
{
  "ok": true,
  "command": "version",
  "result": {},
  "warnings": []
}
```

Failure:

```json
{
  "ok": false,
  "command": "validate",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed"
  },
  "warnings": []
}
```

- `details` is optional structured context and is omitted when empty.
- No envelope `schemaVersion` in V1.
- `warnings` is always an array. A warning alone does not fail the command.
- `error.code` is the automation branch key; `error.message` is human-readable only.

### `--version` result

```json
{
  "ok": true,
  "command": "version",
  "result": {
    "cli": {
      "name": "delivery",
      "version": "<cli-semver>"
    },
    "component": {
      "id": "dsf",
      "version": "<dsf-semver>"
    },
    "dleCliStandard": 1
  },
  "warnings": []
}
```

`dleCliStandard` is integer `1`.

### Human mode

- success primary result → stdout
- normal diagnostics/errors → stderr
- no automatic pager
- no prompt
- terminal decoration suppressed when stdout/stderr are not TTYs; this bootstrap emits no color/spinner at all (**Delegated**: adding decoration later requires an explicit presentation override)

### JSON mode

- normal success **and** normal failure envelopes → stdout
- stderr only for exceptional launcher/runtime diagnostics that cannot produce a valid envelope
- exactly one UTF-8 JSON document plus one newline
- no banner, color, spinner, progress, or explanatory prose

## 7. Error and warning contract

Stable codes are catalogued in [`../contract/error-codes.json`](../contract/error-codes.json).

| Code                              | When                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `MISSING_COMMAND`                 | no command and neither `--help` nor `--version`                                 |
| `UNKNOWN_COMMAND`                 | first positional is not a known command; no typo guessing                       |
| `UNKNOWN_OPTION`                  | unrecognized flag, including `--quiet` / `--verbose` unless later specified     |
| `INVALID_INVOCATION`              | known command with malformed extra arguments or incompatible flag combinations  |
| `DELIVERY_ENGINE_NOT_IMPLEMENTED` | reserved for unimplemented Delivery domain/engine commands                      |
| `VALIDATION_FAILED`               | Definition discovery, JSON, schema, or graph/invariant failure                  |
| `COMPATIBILITY_UNSUPPORTED`       | target artifact/version cannot be operated on safely; must fire before mutation |

Do not create a DLE-wide numeric error taxonomy. Exit is `0` or non-zero only.

## 8. Validation pipeline

`validate` is read-only.

Pipeline:

1. parse argv; fail closed on unknown options/commands
2. never read stdin; never write files
3. discover `<cwd>/delivery/`
4. if any parsed `schemaVersion` number is not `2`, fail with `COMPATIBILITY_UNSUPPORTED`
5. structurally validate against published v2 schemas
6. validate references/graph/invariants from the DSF 1.1.1 contract
7. report sorted findings without repair

JSON success `result` includes `valid`, `definitionSchemaVersion`, and `counts`. JSON failure `error.details.findings` is the finding array.

Finding shape:

```json
{
  "kind": "schema",
  "artifact": "phases/P-002.json",
  "path": "/dependsOn/0",
  "code": "REFERENCE_NOT_FOUND",
  "message": "Referenced Phase P-999 does not exist."
}
```

`validate` must not mean operational eligibility. That belongs to later `status` / phase-start preconditions.

## 9. Atomic persistence

CLI-owned semantic writes use [`persist.ts`](../src/persist.ts):

- validate current/proposed via `commitCliOwnedState`
- write a sibling temporary file then rename onto the target
- on failure, leave the previous semantic file unchanged
- temp files are not semantic state; readers use the target path only

**Delegated:** exact temp-file naming and Windows replace strategy, provided the observable all-or-nothing guarantee holds.

If an operation later coordinates with Git or another external system, do not pretend that external system rolled back. Document retry/idempotency instead. Delivery semantic commands still must not mutate Git in this spec.

## 10. CWD, path, env, config, stdin

- Relative paths resolve against `process.cwd()` via `resolveAgainstCwd`.
- No universal `--root` or `--cwd`.
- This bootstrap recognizes **no** environment variables and **no** config file.
- Precedence when sources are later added: explicit CLI options override environment/config-derived values.
- Stdin is never waited on. Stdin use, if added, must be an explicit documented option.
- Machine JSON is locale-independent. Do not format machine values with `toLocaleString`.
- CLI-generated timestamps, if emitted, use RFC 3339 / ISO-8601 with explicit offset, preferably UTC `Z` (`Date#toISOString`).

## 11. Secret redaction

Before emitting human or JSON output, redact values whose keys match credential/token/password/private-key/secret patterns.

`--json` is not a debug escape hatch. Do not interpolate secrets into `error.message`.

## 12. Git validation vs mutation

Future commands may **read** Git facts when a published DSF/Delivery policy requires it. They must not create branches, commits, pushes, PRs, or merges unless a later accepted design explicitly authorizes a named command to do so.

This bootstrap performs no Git operations.

## 13. Design-Gap and package-amendment boundary

- Design Gaps are human/design-authority decisions.
- The CLI must not invent product/design answers.
- Package amendments/provenance rules, once specified by DSF, remain distinct from ordinary CLI plumbing.
- Bootstrap implements neither command family.

## 14. Packaging

- `pnpm` workspace member: `packages/dsf/cli`
- Build: `tsc -p tsconfig.json` → `dist/`
- Tests: Vitest
- Shebang on `src/bin.ts`: `#!/usr/bin/env node`
- `files`: `dist` plus package documentation needed to consume the binary

**Delegated:** no extra CLI framework (no Commander/Yargs). Argv parsing is a small local parser.

## 15. Test strategy

Executable tests cover DLE CLI Standard V1 universal behavior against `runCli`:

- help/version/validate/`--json`
- unknown command/option
- missing command
- JSON envelope shape and single-document rule
- stderr vs stdout
- locale-independent JSON
- non-TTY undecorated output
- stdin not consumed
- relative path resolution against CWD
- secret redaction
- atomic persist / failed proposed-state leaves previous bytes
- packaged identity does not read the monorepo at runtime
- DSF `dle-component.json` matches compiled component identity in the development tree

The synthetic flow is a fixture + explicit `it.todo` / unknown-command assertions until DSF schemas exist.

## 16. Synthetic end-to-end proof

Preserved scenario:

```text
P-001
→ prepare/start under current baseline
→ DG-001 discovered
→ canonical resolution changes baseline-participating truth
→ current baseline reconciliation/acknowledgement
→ submission candidate frozen
→ acceptance/completion
→ downstream P-002 readiness reconciles
```

Required properties:

- no hidden conversational state
- deterministic failures
- compatibility checks before writes
- no partial mutation
- baseline reconciliation after authoritative design change
- immutable submitted candidate semantics
- downstream readiness recomputation

Bootstrap representation: [`../fixtures/synthetic-p001-p002/README.md`](../fixtures/synthetic-p001-p002/README.md) and [`../tests/synthetic-flow.test.ts`](../tests/synthetic-flow.test.ts). Do not populate invented valid/invalid Definition JSON until authoritative DSF schemas exist.
