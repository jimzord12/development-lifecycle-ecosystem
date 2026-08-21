# Delivery CLI overview

The Delivery CLI is an optional companion CLI owned by DSF. Its executable name is `delivery`. Package identity is `@dle/delivery-cli`, currently `0.1.0`. Owning component identity is DSF `1.2.0`. DLE CLI Standard identity is integer `1`.

Keep these concepts separate:

1. **Delivery Framework / DSF** — reusable generic rules, contracts, schemas, and generation model.
2. **Delivery Definition** — one project's declarative Roadmap, Milestone, Phase, and Design-Gap truth under `delivery/`.
3. **Delivery CLI** — optional deterministic tooling. It is not a source of design truth.
4. **CLI-owned mutable execution state** — optional, distinct from Definition truth, unpublished in this release.

`--help` explains invocation. `docs` explains the Delivery mental model. Use `delivery docs --index` to discover topics and `delivery docs <topic>` to load one exact body.

Currently executable commands are the DLE universal surface: `--help` / `-h`, `--version`, `validate`, `docs`, and `--json`. Domain families such as `phase`, `baseline`, `blocker`, `design-gap`, `init`, and `status` are specified as future work and are unknown commands today. Do not treat this documentation as evidence that those commands exist.
