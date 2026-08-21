# Authority and sources of truth

docs is a retrieval surface, not a new source of truth. Topic bodies are derived from published DSF and Delivery CLI contracts: the DSF Public Contract, Definition schema v2, DLE CLI Standard V1, and this package's PRD/SPEC.

Design Gaps are human/design-authority decisions. The CLI must not invent product answers.

The CLI is optional. A Delivery Definition remains conceptually consumable without CLI tracking. Delivery commands must not create Git branches, commits, pushes, PRs, or merges unless a later accepted design authorizes a named command.

If a later operational command is still unimplemented, this corpus says so explicitly rather than describing it as executable.
