# Contributing

Thanks for contributing to the Development Lifecycle Ecosystem.

## Requirements

- Node.js 24 LTS (`>=24.18.0 <25`)
- pnpm 11.17.0

## Workflow

1. Create a short-lived branch from `main`.
2. Install with `pnpm install --frozen-lockfile`.
3. Make a focused change that stays framework-generic.
4. Run `pnpm validate`.
5. Open a pull request describing the change and its rationale.

Normal changes are merged through pull requests. The intended repository policy is squash merge, linear history, resolved review conversations, required `validate` CI, and automatic deletion of merged branches.

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
