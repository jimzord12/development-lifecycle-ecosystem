# Delivery Definition Semantics

A Delivery Definition is declarative implementation truth organized as **Roadmap → Milestone → Phase**.

- `roadmap.json` owns the project title, repository registry, and Milestone orientation order.
- `milestones/M-*.json` own observable integrated capability objectives, authoritative design references, Milestone dependencies, and Milestone-level proof contracts.
- `phases/P-*.json` own the smallest authored planned implementation contracts: objective, scope, repositories, dependencies, governing/supporting references, acceptance, verification, and evidence.
- `design-gaps/` is reserved for evidence-backed Design Gaps when they exist.

Stable IDs do not change when titles or presentation order change. A Phase owns one `milestoneId`; membership is derived and is not copied into Milestone files. `milestoneOrder` is orientation and deterministic scheduling order, not a hidden dependency graph.

The executable projection contains authored Phase nodes plus two derived node kinds:

- one `M-XXX::REVIEW` for each Milestone; and
- zero or more `M-XXX::FIX-NNN` Milestone Remediations created when real corrective work is needed.

These nodes do not require new authored JSON files. Mutable lifecycle state stays outside the Delivery Definition.
