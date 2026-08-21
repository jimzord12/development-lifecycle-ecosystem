# Authority and Change Rules

The Delivery Definition translates accepted product/technical truth into implementation boundaries and proof contracts; it does not override that truth. Governing Design References are authoritative; Supporting Concept References are derived explanatory aids.

When repository evidence contradicts a Delivery assumption, first determine whether the issue is ordinary implementation freedom, repository drift, or a genuine Design Gap. Preserve incumbent mechanisms when they can satisfy the requirement correctly. Do not broaden scope for unrelated cleanup, modernization, or abstraction.

If a genuine Design Gap remains, stop only affected work and start the human resolution conversation rather than guessing or terminally stopping while responsible human authority is available.

Project-owned Definition changes must be complete and internally coherent: preserve stable IDs, validate repository keys/references, validate the whole dependency graph, and update affected acceptance/verification/evidence contracts together. During an independently mutable implementation package, human-authorized project-truth changes must also follow the Package-Amendment contract.

Framework-owned `.framework/**` files are not project truth and are never ordinary amendment targets. Existing immutable `AM-*` provenance is also not a mutation target.
