# DWF Design Gaps and Package Amendments

Implementation must not invent missing project authority. When a genuine Design Gap remains after loading relevant accepted context, **stop only affected work and start the design conversation now**: bring the evidence and concrete decision need to the Main Agent's initializing/responsible human in ordinary engineering language. Independent work may continue when it does not depend on the gap.

A Design Gap is normally an interactive pause, not a terminal result. While that human is available and resolution remains possible, do not end the work merely with `BLOCKED`. Preserve evidence/continuation state, present the facts/constraints/options/consequences and a recommendation when useful, and ask for one explicit semantic decision.

Do not change canonical package truth before explicit human resolution.

After resolution, change the actual project-owned canonical design files that own the answer and reconcile affected project-owned Delivery truth. Every material package-truth change receives one immutable `AM-*` reconstruction envelope with exact predecessor reconstruction material, before/after digests, and package-identity chaining. The Amendment explains why truth changed; the changed canonical files remain current truth.

## Mutation boundary

An ordinary Package Amendment may mutate project-owned:

- `design/**` outside `design/.framework/**`; and
- `delivery/**` outside `delivery/.framework/**`.

It must never mutate:

- `design/.framework/**`;
- `delivery/.framework/**`; or
- an already-committed `amendments/AM-*/**` record.

Framework upgrades require a new package lineage.

## Deterministic authoring

When this DWF release is installed in a PIP, use its internal transactional helper:

```text
design/.framework/skills/prepare-implementation-package/scripts/amend_package.py
```

The helper supports:

```text
begin    # validate predecessor package and capture declared before-state
commit   # verify declared-only edits, write AM-* snapshots/metadata, update manifest/digest/head, validate
abort    # restore captured predecessor state
validate # validate package integrity and reverse-replay the Amendment chain
```

Prepare a small JSON request before `begin`, conceptually:

```json
{
  "trigger": "P-003 repository evidence exposed ...",
  "evidence": ["implementation-record/evidence/P-003/..."],
  "humanDecision": "Use option B: ...",
  "rationale": "...",
  "implementationImpact": "Reconcile Android ... then resume P-003.",
  "changes": [
    { "operation": "MODIFY", "path": "design/decisions/technical.md" },
    { "operation": "MODIFY", "path": "delivery/phases/P-003.json" }
  ]
}
```

Supported declared operations are `CREATE`, `MODIFY`, `DELETE`, and `RENAME`. The helper captures exact bytes before canonical edits, rejects forbidden/out-of-scope mutations, allocates the next `AM-<package-origin>-<sequence>`, and stores exact predecessor bytes plus before/after byte counts and digests. The current package is already the exact after-state, so schema V2 does not copy complete after files into the Amendment.

Each Amendment records the predecessor package digest and predecessor chain head. The root package manifest owns the resulting current package digest/head. Validation proves the chain by reverse-replaying each Amendment and checking the reconstructed predecessor digest, avoiding any self-referential resulting-digest field inside the Amendment itself.

After the Amendment succeeds, reload changed canonical owners and the affected Phase against the new package identity, reconcile already-written implementation, then resume.
