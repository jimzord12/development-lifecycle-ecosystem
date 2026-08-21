# Playbook — Resolve an implementation-time Design Gap

Use when repository/implementation evidence shows that safe progress requires canonical product, technical, or Delivery truth to be added, changed, materially clarified, or reconciled.

A Design Gap is normally an interactive pause, not a terminal result.

## 1. Confirm the gap

Distinguish ordinary engineering freedom, repository drift, an implementation defect, and a genuine authority problem. Do not escalate merely because work is hard or a cleaner design is imaginable.

## 2. Preserve evidence and active-work state

Stop only affected work. Record:

- active work item (`P-*`, `M-*::REVIEW`, or `M-*::FIX-*`);
- repository reality and evidence;
- governing authority;
- why it is missing/conflicting;
- the concrete decision needed;
- current Git/package continuation facts.

Keep active execution `IN_PROGRESS` while the responsible human is available. Use `BLOCKED` only for a durable stopped handoff.

## 3. Ask the human now

Present verified facts, accepted constraints, feasible options, consequences, and a recommendation when useful. Ask for one semantic decision; do not ask the human to manage Amendment metadata.

## 4. Reflect before mutation

Restate the accepted answer briefly. Do not change package truth before explicit resolution. A no-change investigation creates no Amendment; a clarification implementation relies on is material.

## 5. Amend the PIP deterministically

Use the pinned DWF helper when available:

```text
design/.framework/skills/prepare-implementation-package/scripts/amend_package.py
```

Prepare the request, run `begin`, edit only declared project-owned paths, then `commit` or `abort`. Never target either `.framework/**` tree or an existing `AM-*` record.

Current DWF Amendment schema stores exact predecessor bytes and before/after digests without duplicating complete after files; older schema-V1 Amendments remain valid. Do not invent a lossy format when the helper is unavailable.

## 6. Update IRS and resume

Move the prior package identity into history, set the real amended identity/current head, record the resolving `AM-*`, and reconcile the active work item against changed truth. Resolve only affected code and resume. Do not mark work `PASSED` merely because the Design Gap was decided.

Always use `finish-session` before stopping.
