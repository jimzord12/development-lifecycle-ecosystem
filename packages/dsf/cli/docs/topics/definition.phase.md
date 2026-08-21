# Phase

Phase identifiers match P-`[0-9]{3,}` and live at `delivery/phases/P-*.json`. The file basename must equal the Phase `id`.

Published schema v2 requires `kind` `delivery-phase`, `schemaVersion` `2`, `id`, `title`, `milestoneId`, `type` (`CAPABILITY` or `FOUNDATION`), `objective`, `scope`, `fitness`, design-reference fields, `repositories`, `dependsOn`, architectural-subsystem fields, `externalPrerequisites`, `acceptanceCriteria`, `verification`, and `completionEvidence`.

Graph validation requires:

- `milestoneId` to name an existing Milestone
- `dependsOn` / `consumedBy` to name existing Phases
- no Phase dependency cycles
- `repositories` to name Roadmap registry ids
- consumed architectural subsystems to be established by a Foundation Phase
- verification `covers` keys to name acceptance-criteria keys on the same Phase

`phase prepare`, `phase start`, `phase submit`, and `phase accept` are not executable commands in this release. This topic describes the Definition artifact only.
