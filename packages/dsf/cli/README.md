# Delivery CLI

Optional companion CLI for the [Delivery System Framework](../README.md).

Executable name: `delivery`  
Package: `@dle/delivery-cli`  
DLE CLI Standard: `1`

This package lives at `packages/dsf/cli/` because the CLI is owned by DSF. It is not a first-class DLE Component.

## Public Contract

Consumers may rely on:

- the `delivery` binary published via package `bin`
- [DLE CLI Standard V1](../../../docs/standards/dle-cli-standard-v1.md) universal surface: `--help` / `-h`, `--version`, `validate`, `--json`
- the JSON envelope and error codes in [`contract/`](./contract/)
- independent CLI SemVer in `package.json` (currently `0.1.0`)

`--version --json` reports CLI identity, owning DSF component id/version, and `dleCliStandard: 1`.

`validate` is read-only. In this bootstrap it fails closed with `DELIVERY_ENGINE_NOT_IMPLEMENTED` because authoritative DSF Delivery Definition schemas are not published yet.

Everything else in `src/` is internal.

## Usage

```bash
delivery --help
delivery --version --json
delivery validate --json
```

The CLI is non-interactive by default. It does not prompt, guess missing inputs, or read stdin unless a later documented option explicitly says so.

## Documentation

- [PRD](./docs/PRD.md)
- [Technical Spec](./docs/SPEC.md)
- [Agent guidance](./AGENTS.md)

## Development

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm validate
```
