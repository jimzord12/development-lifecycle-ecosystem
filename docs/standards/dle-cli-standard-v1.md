# DLE CLI Standard V1

This document is the public Development Lifecycle Ecosystem (DLE) CLI Standard V1.

It applies to companion CLIs owned by first-class DLE Components. It does not replace a component's domain contract, introduce a shared CLI runtime, or require every component to have a CLI.

Component-specific commands, options, and result fields are allowed. They may not redefine reserved DLE semantics for `--json`, `--help` / `-h`, `--version`, or `validate`.

## 1. Non-interactive by default

A conforming DLE companion CLI is **non-interactive by default**.

Automation-critical commands receive semantic inputs explicitly through documented:

- arguments/options
- files
- or explicitly selected stdin

The CLI must not unexpectedly:

- stop to prompt for a required value
- select a semantic default through a question
- require a human TTY to complete deterministic work
- silently repair an invalid invocation through interactive correction

Missing or invalid required input fails deterministically.

Interactive UX may exist only as an explicitly requested convenience, for example a documented `--interactive` mode, and the same underlying operation must remain available non-interactively.

## 2. Human output by default; universal `--json`

Human-readable output is the default.

Every result-producing command supports universal:

```text
--json
```

`--json` means **JSON only** for the machine result. Never mix in:

- banners
- color/control sequences
- spinner frames
- progress prose
- explanatory prose
- unrelated logs

The documented JSON shape is part of the CLI public contract and follows the CLI's independent SemVer.

## 3. stdout/stderr and universal JSON envelope

### Human mode

- primary successful result → **stdout**
- normal human diagnostics/errors → **stderr**

### JSON mode

- normal success envelope → **stdout**
- normal command/domain/validation failure envelope → **stdout**
- **stderr** is reserved for exceptional launcher/runtime diagnostics where the CLI cannot construct a valid standard envelope

A JSON invocation emits exactly **one UTF-8 JSON document plus one newline**.

Failure shape:

```json
{
  "ok": false,
  "command": "validate",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {}
  },
  "warnings": []
}
```

Success shape:

```json
{
  "ok": true,
  "command": "validate",
  "result": {},
  "warnings": []
}
```

Rules:

- `error.code` is the stable machine branch key
- `error.message` is human-readable and must not be used by automation as the branch identity
- `details` is optional structured context
- warnings remain separate from errors
- a warning alone does not turn success into failure
- no universal envelope `schemaVersion` exists in V1
- exit `0` means success
- non-zero means failure
- there is no DLE-wide numeric error taxonomy; portable automation should prefer JSON `error.code`

## 4. Atomic mutation and interruption safety

For state the CLI owns and can transactionally control, a state-changing command must behave conceptually as:

```text
validate current state
→ validate inputs/preconditions
→ compute proposed state
→ validate proposed state
→ commit complete mutation
```

or persist **no semantic mutation**.

Normal validation failure, domain failure, cancellation, or process interruption must not leave a partially applied CLI-owned semantic transition.

Implementation technique is delegated to the component: transactions, temporary-write-plus-rename, transactional stores, and similar approaches are valid if the observable guarantee is correct.

If an operation coordinates with an external system that cannot participate in the same transaction, do not pretend it was atomically rolled back. Document deterministic retry, idempotency, revalidation, or recovery behavior instead.

## 5. Required universal discovery surface

Every conforming CLI exposes:

- top-level `--help`
- top-level `-h` alias
- `--help` / `-h` for every command
- top-level `--version`
- read-only `validate`

Help:

- exits successfully when explicitly requested
- never requires a prompt
- never requires an automatic pager
- documents required arguments/options
- documents deterministic defaults
- explains side effects
- includes enough examples for safe deterministic invocation

DLE CLI Standard V1 does **not** universally mandate `status`, `info`, `docs`, `doctor`, or similar convenience commands.

## 6. `--version --json` conformance identity

Machine-readable version output uses the standard result envelope and exposes at minimum:

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

`dleCliStandard` is integer `1`, not another SemVer axis.

Unsupported target versions fail deterministically with a stable compatibility error **before semantic mutation**.

Do not invent a universal supported-version-range field in V1.

## 7. CLI-wide conformance boundary

Conformance applies to the **entire documented public CLI**, not selected convenient commands.

Minimum universal surface:

- top-level `--help` / `-h`
- top-level `--version`
- read-only `validate`
- `--help` / `-h` on every command
- `--json` on every result-producing command

Unknown commands/options, malformed arguments, and missing required semantic inputs fail deterministically and non-zero.

No typo guessing, silent fallback, or surprise interactive correction.

## 8. Intentionally non-universal switches and commands

V1 deliberately does **not** mandate universal:

- `--quiet`
- `--verbose`
- `--debug`
- `--force`
- `--yes`
- config-file convention
- logging level
- telemetry switch
- `status`
- `docs`
- `doctor`

A component may define these only where its domain needs them.

## 9. Portable process behavior

Conforming CLIs follow these deterministic process rules:

- machine-readable text is UTF-8 without BOM
- JSON machine values are locale-independent
- emitted machine timestamps use RFC 3339 / ISO-8601 with explicit offset, preferably UTC (`Z`) for CLI-generated timestamps
- explicit relative filesystem paths resolve against the **process working directory**
- deterministic component-specific root discovery is allowed only when documented
- no universal `--root` or `--cwd` is required
- stdin is never waited on implicitly
- stdin use must be explicit/documented
- recognized environment variables/config sources are documented
- precedence among input/config sources is deterministic/documented
- explicit CLI args/options override environment/config-derived values
- deterministic defaults are allowed
- genuinely required semantic inputs are never guessed
- colors/spinners/progress/control sequences never appear in `--json`
- terminal decoration should be suppressed for non-interactive output unless an explicit presentation override is documented

## 10. Distribution, runtime, and sensitive-output safety

Every released conforming CLI:

- exposes at least one stable documented executable/entrypoint
- can run from its supported distribution without depending on a development-monorepo checkout
- may use whatever implementation/runtime/package technology the owning component chooses
- does not imply a mandatory shared DLE runtime

Sensitive values such as:

- credentials
- API tokens
- private keys
- passwords/secrets
- equivalent protected configuration

must never appear in normal human output, JSON result/error/warning payloads, routine diagnostics, normal exposed stack traces, or echoed resolved configuration.

`--json` is not a secret-leaking debug escape hatch.

## 11. Conformance checklist

A conforming CLI must satisfy:

| Case                                   | Expected result                                                  |
| -------------------------------------- | ---------------------------------------------------------------- |
| `--help`                               | exit 0; deterministic help; no prompt/pager requirement          |
| command `--help`                       | exit 0; documents inputs/defaults/side effects/examples          |
| missing required semantic input        | deterministic non-zero failure; no prompt                        |
| human success                          | primary result on stdout                                         |
| human normal error                     | diagnostic on stderr                                             |
| `--json` success                       | exactly one JSON document on stdout + newline                    |
| `--json` normal failure                | exactly one failed JSON envelope on stdout + non-zero exit       |
| `--json` presentation                  | no banner/color/spinner/prose/control sequence                   |
| stable error identity                  | automation branches on `error.code`, not message text            |
| warning                                | structured separately; does not alone make command fail          |
| `validate`                             | read-only; detects invalidity without repair/mutation            |
| `--version --json`                     | CLI name/version + component id/version + `dleCliStandard: 1`    |
| unsupported target version             | stable compatibility failure before mutation                     |
| unknown command/option                 | deterministic non-zero; no typo guessing                         |
| relative path                          | resolves against process CWD                                     |
| stdin                                  | never implicitly blocks waiting for input                        |
| env/config/CLI precedence              | deterministic/documented; explicit CLI options win               |
| locale                                 | JSON machine values are locale-independent                       |
| timestamp                              | RFC 3339 with explicit offset when emitted                       |
| non-TTY output                         | terminal decoration suppressed unless explicitly forced          |
| interruption during CLI-owned mutation | no partial semantic state persists                               |
| secret in failing input/config         | never leaked via normal output/JSON/diagnostics                  |
| packaged execution                     | stable documented entrypoint works without dev-monorepo checkout |
