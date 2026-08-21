# Design Gap

Design Gaps remain human/design-authority decisions. The CLI must not invent product or design answers.

Artifacts live at `delivery/design-gaps/DG-*.json` with ids matching `DG-[0-9]{3,}`. Published schema v2 requires `kind` `design-gap`, `schemaVersion` `2`, `id`, `phaseId`, `implementationContext`, `observedReality`, `governingDesignReferences`, `authorityProblem`, `resolutionRequired`, `evidence`, `recommendation` (string or null), and `resolution` (object or null).

Graph validation requires `phaseId` to name an existing Phase. A Design Gap may be recorded as unresolved (`resolution` null). Recording, gating, and resolving Design Gaps as CLI commands is not implemented.
