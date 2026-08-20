# Delivery CLI fixtures

Schema-backed generic Delivery Definition fixtures. They are not ICS/product examples and they do not include CLI-owned execution state.

| Fixture                      | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `valid-minimal`              | smallest schema-valid Definition         |
| `valid-multi-milestone`      | two milestones and a Phase dependency    |
| `invalid-schema`             | structurally invalid Roadmap             |
| `invalid-missing-reference`  | Phase `dependsOn` a missing ID           |
| `invalid-duplicate-id`       | two Phase files declare the same ID      |
| `invalid-dependency-cycle`   | prohibited Phase dependency cycle        |
| `unsupported-schema-version` | `schemaVersion` other than 2             |
| `synthetic-p001-p002`        | operational engine test plan; still TODO |
