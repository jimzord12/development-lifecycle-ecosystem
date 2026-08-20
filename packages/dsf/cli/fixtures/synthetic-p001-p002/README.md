# Synthetic acceptance flow: P-001 → P-002

This fixture preserves the high-value Delivery CLI proof scenario.

It is a test plan for the later operational engine. Definition schema v2 fixtures live in sibling directories. Do not treat this folder as a schema-valid Definition.

## Scenario

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

## Required properties

- no hidden conversational state
- deterministic failures
- compatibility checks before writes
- no partial mutation
- baseline reconciliation after authoritative design change
- immutable submitted candidate semantics
- downstream readiness recomputation

## Bootstrap encoding

Executable coverage lives in `tests/synthetic-flow.test.ts`:

- domain commands used by this flow are unknown commands today, not successful stubs
- `validate` is read-only and does not mutate this directory
- later implementation must replace the `it.todo` steps with real engine tests against authoritative DSF schemas

## Later fixture categories

When DSF schemas exist, add representative files here (or siblings) rather than inventing parallel schemas:

- valid Definition for P-001 / P-002
- invalid schema / reference / dependency / compatibility cases
- CLI-owned state before and after each atomic transition
- frozen submission candidate that must remain unchanged by later edits
