# Packages

Reusable framework packages live under `packages/<package>/`.

A code package should normally contain:

```text
packages/<package>/
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
- Package names/namespaces are selected when the first publishable package is introduced.
- Package scripts should use the root command vocabulary (`lint`, `typecheck`, `test`, `test:coverage`, `build`) where applicable.
