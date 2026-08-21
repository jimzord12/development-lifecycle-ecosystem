# Graph validation

After schema validation, the CLI checks DSF graph invariants: reference existence, identifier uniqueness, and dependency cycles.

Current checks include:

- duplicate Milestone, Phase, and Design-Gap ids
- file basename identity (`M-001.json` must declare `id` `M-001`)
- Roadmap `milestoneOrder` and Phase `milestoneId` / `repositories` references
- Milestone and Phase `dependsOn` acyclic graphs
- Foundation Phases establishing architectural subsystems before they are consumed
- verification `covers` pointing at acceptance-criteria keys
- Design-Gap `phaseId` references

Graph findings use `kind` `graph` and codes such as `REFERENCE_NOT_FOUND`, `DUPLICATE_ID`, `FILE_IDENTITY_MISMATCH`, and `DEPENDENCY_CYCLE`. They are reported without repair.
