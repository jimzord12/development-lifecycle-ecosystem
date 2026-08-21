# Milestone

Milestone identifiers match M-`[0-9]{3,}` and live at `delivery/milestones/M-*.json`. The file basename must equal the Milestone `id`.

Published schema v2 requires `kind` `delivery-milestone`, `schemaVersion` `2`, `id`, `title`, `objective`, `governingDesignReferences`, `dependsOn`, `acceptanceCriteria`, `verification`, and `completionEvidence`.

Graph validation requires:

- `dependsOn` entries to name existing Milestones
- no Milestone dependency cycles
- verification `covers` keys to name acceptance-criteria keys on the same Milestone

Milestone domain commands are not implemented. This topic describes the Definition artifact, not an executable `milestone` command.
