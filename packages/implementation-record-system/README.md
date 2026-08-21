# Implementation Record System 1.3.0

The Implementation Record System (IRS) keeps the small mutable record of one implementation run. It works beside a Portable Implementation Package (PIP) and the implementation repositories without becoming design or Delivery authority.

IRS is a first-class [Development Lifecycle Ecosystem](../../README.md) component. Machine id `implementation-record-system` is immutable.

## Public Contract

External users may rely on:

- [`dle-component.json`](dle-component.json) for IRS component identity and version
- [`SKILL.md`](SKILL.md) as the operation router and shared run-state rules
- the nine routed playbooks under [`references/`](references/) for initialization, Phase work, Milestone Review/repair, Design Gaps, session finish, package reconciliation, run adoption, and migration
- Progress Tracker state version **3**, as described by the installed router and [`migrations/state-2-to-3.md`](migrations/state-2-to-3.md)
- [`rollout.json`](rollout.json) for migration discovery and stored-state compatibility only; it does not replace the component manifest as identity/version authority
- [`PROGRESS-TRACKER-V3-REFERENCE.md`](PROGRESS-TRACKER-V3-REFERENCE.md) as a compact conceptual reference; the router and current PIP remain authoritative
- relative shared evidence/state paths, with machine-specific absolute paths kept in local binding files

The PIP/Delivery Definition remains authoritative for what must be implemented and verified. IRS owns current run state, continuation, evidence/history references, package history, and exact Git anchors. Files not listed above are private unless a later public contract says otherwise.

## Compatibility

IRS uses independent semantic versioning. A rollout that changes stored Progress Tracker shape declares its target state version and supported migration paths in migration-only `rollout.json`.

IRS consumes [DSF](../dsf/README.md) public Delivery meaning (including derived Milestone Review and Remediation identities) by contract only. It does not import Delivery CLI internals.

This package is not a Node implementation. There is no Progress Tracker JSON Schema in this release. Deterministic validation is: follow `SKILL.md`, `rollout.json`, and the named playbooks. Do not invent a tracker schema from a live run.

## Layout

```text
packages/implementation-record-system/
├── dle-component.json
├── README.md
├── SKILL.md
├── references/
├── rollout.json
├── migrations/state-2-to-3.md
└── PROGRESS-TRACKER-V3-REFERENCE.md
```
