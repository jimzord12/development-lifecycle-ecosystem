# Contributing

Thanks for contributing to the Development Lifecycle Ecosystem.

## Requirements

- Node.js 24 LTS (`>=24.18.0 <25`)
- pnpm 11.17.0

## Workflow

1. Work on `main`.
2. Install with `pnpm install --frozen-lockfile`.
3. Make a focused change that stays framework-generic.
4. Run `pnpm validate`.
5. Commit the intended files on `main` and push `main` to the remote.

Do not open pull requests. Completed work must not stay uncommitted or unpushed.

`validate` CI still runs on pushes to `main`.

## Changesets

When a change affects a publishable package's released behavior, add a Changeset with:

```bash
pnpm changeset
```

Do not add empty or speculative changesets for root-only maintenance that does not affect a publishable package.

## Scope and safety

This is a public framework repository. Do not contribute credentials, private company material, private repository information, project-specific delivery artifacts, or proprietary implementation details.

If a required semantic contract is missing, raise the gap instead of guessing behavior.

First-class DLE Components belong under `packages/<component-id>/`. Companion CLIs belong under their parent component. Do not add Delivery CLI as a peer of DSF.
