# Proposals

Discussion drafts live here so humans and coding agents can read them from the repository.

These files are **not** accepted contracts.

## Authority

Treat as discussion material only:

- `docs/proposals/`

Treat as authoritative for the behavior they explicitly define:

- `docs/standards/`
- checked-in schemas, fixtures, tests, and decision records

A proposal must not be used to invent missing semantic contracts, implement a product, or override a published standard.

Acceptance means the substance is promoted into a standard, schema, fixture, test, or decision record. Leaving a file in this directory does not accept it.

If a proposal conflicts with a published standard, the standard wins until an explicit standard change is accepted.

## Adding a proposal

- Keep the draft framework-generic and public. No private company material.
- Use a descriptive slug: `docs/proposals/<topic>.md`.
- State **Status: discussion draft** at the top.
- Link the published standards that constrain the draft.
- Do not put proposals under `packages/<component-id>/` unless the draft is only about that component's already-owned public contract.

## Current drafts

- [DLE Host CLI](./dle-host-cli.md) — optional umbrella operator vs companion CLIs
- [DLE exclusive distro and composition](./dle-exclusive-distro.md) — curated catalog, pin/install doctrine, OS matrix
