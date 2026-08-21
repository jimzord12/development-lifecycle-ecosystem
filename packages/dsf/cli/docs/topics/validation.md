# Validation

`delivery validate` is read-only. It discovers `<cwd>/delivery/`, validates Delivery Definition schema v2, then checks DSF graph invariants. It does not repair files, create `.cli` state, or mutate Git.

Canonical structural validation is distinct from operational eligibility: validate does not mean ready to start. Later `status` / phase-start preconditions, if implemented, are a different question.

Unsupported `schemaVersion` values fail closed with `COMPATIBILITY_UNSUPPORTED` before graph checking. Schema and graph findings are reported together under `VALIDATION_FAILED` without changing files.

See `validation.schema` and `validation.graph`.
