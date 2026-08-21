# Schema validation

Schema validation is structural JSON Schema Draft 2020-12 checking of Roadmap, Milestone, Phase, and Design-Gap artifacts against the published DSF 1.2.0 v2 schemas.

The CLI compiles those schemas with Ajv 8.17.1. Packaged installs use bundled copies under `dist/schemas/v2`; they do not require the development monorepo `packages/dsf/contract` tree.

Structural failure produces `VALIDATION_FAILED` findings with `kind` `schema`. This step does not answer operational eligibility and does not repair documents.
