# Packages

First-class DLE Components live under `packages/<component-id>/`.

The DLE-level minimum for a component is:

```text
packages/<component-id>/
├── dle-component.json
└── README.md
```

A component root is a lifecycle/product ownership boundary. It does not have to be a Node package.

## Implementation packages

When a component needs a Node/TypeScript implementation, follow the repository's package conventions:

```text
packages/<component-id>/.../
├── src/
├── package.json
└── tsconfig.json
```

Package conventions:

- ESM-only (`"type": "module"`).
- Build with plain `tsc` unless a package demonstrates a real bundling need.
- Emit runtime files, declarations, declaration maps, and source maps to `dist/`.
- Publish only intended artifacts, normally `dist/` plus package metadata/documentation.
- Define explicit `exports`; unsupported deep imports are not part of the public API.
- CLI packages may additionally define `bin` entries.
- Package scripts should use the root command vocabulary (`lint`, `typecheck`, `test`, `test:coverage`, `build`) where applicable.

Companion CLIs are implementation packages owned by a component, for example `packages/dsf/cli`. They are not first-class DLE Components.

The pnpm workspace includes `packages/*` and explicitly listed nested implementation packages such as `packages/dsf/cli`.
