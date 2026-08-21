# Delivery Definition

A Delivery Definition is declarative project truth under delivery/. It is the project-owned DSF output, not CLI-owned execution state.

Supported public artifact types:

| Artifact   | Location                         |
| ---------- | -------------------------------- |
| Roadmap    | `delivery/roadmap.json`          |
| Milestone  | `delivery/milestones/M-*.json`   |
| Phase      | `delivery/phases/P-*.json`       |
| Design Gap | `delivery/design-gaps/DG-*.json` |

Authoritative schema version is **2**. See `definition.roadmap`, `definition.milestone`, `definition.phase`, and `definition.design-gap`.

`delivery validate` and `delivery docs` do not mutate Definition files. Direct consumption without the CLI is allowed and does not imply arbitrary raw JSON mutation. CLI-owned state, when a later release adopts it, lives under `delivery/.cli/` and is not reclassified as Definition truth.
