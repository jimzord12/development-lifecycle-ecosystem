# DWF Design Projection Mapping

DWF uses one fixed mapping contract when materializing or semantically reintegrating a Portable Implementation Package. This is framework behavior, not package configuration.

| Design Workspace owner          | Package artifact                     |
| ------------------------------- | ------------------------------------ |
| `project-context/RULES.md`      | `design/project-context/RULES.md`    |
| `project-context/context.md`    | `design/project-context/context.md`  |
| `project-context/GLOSSARY.md`   | `design/project-context/GLOSSARY.md` |
| `design/decisions.md`           | `design/decisions/product.md`        |
| `design/technical-decisions.md` | `design/decisions/technical.md`      |
| `output/**`                     | `design/output/**`                   |
| `concepts/**`                   | `design/concepts/**`                 |

The package-preparation capability applies the mapping forward during export. When a returned package contains human-authorized changes, the Main Design Agent uses the same table in reverse to locate the corresponding Workspace owners and performs semantic reconciliation. Reverse lookup is not an automated import, merge, or last-write-wins operation.

The mapping contract version for Portable Implementation Package format v2 is **1**.
