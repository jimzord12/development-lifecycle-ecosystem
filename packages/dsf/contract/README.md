# DSF public contract

Authoritative Delivery Definition schema **v2** for DSF **1.1.1**.

These JSON Schema documents are copied from the canonical DSF 1.1.1 release without redesign. They are independently consumable without the Delivery CLI.

| Artifact                         | Schema                                                                     |
| -------------------------------- | -------------------------------------------------------------------------- |
| `delivery/roadmap.json`          | [`schemas/v2/roadmap.schema.json`](./schemas/v2/roadmap.schema.json)       |
| `delivery/milestones/M-*.json`   | [`schemas/v2/milestone.schema.json`](./schemas/v2/milestone.schema.json)   |
| `delivery/phases/P-*.json`       | [`schemas/v2/phase.schema.json`](./schemas/v2/phase.schema.json)           |
| `delivery/design-gaps/DG-*.json` | [`schemas/v2/design-gap.schema.json`](./schemas/v2/design-gap.schema.json) |

JSON Schema dialect: Draft 2020-12.

Definition schema version, DSF SemVer, Delivery CLI SemVer, and CLI-state schema version are independent axes. This contract does not publish a CLI-owned execution-state schema.
