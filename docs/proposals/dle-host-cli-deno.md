# Proposal: Deno as the DLE Host CLI compile target

**Status:** discussion draft only. Not an accepted contract. Not an implementation brief.  
**Human decision recorded here:** if a Host CLI is accepted, it is TypeScript compiled with **Deno** to per-OS binaries. Bun and Rust are out. Delivery CLI stays Node.  
**Audience:** design agent + human design authority  
**Date:** 2026-08-21  
**Location:** [`docs/proposals/dle-host-cli-deno.md`](./dle-host-cli-deno.md)  
**Sibling drafts:**

- [`dle-host-cli.md`](./dle-host-cli.md) — whether the Host CLI exists and what it may do
- [`dle-exclusive-distro.md`](./dle-exclusive-distro.md) — exclusive catalog, pins, OS matrix

**Related published authority:**

- [DLE Component Standard V1](../standards/dle-component-standard-v1.md)
- [DLE CLI Standard V1](../standards/dle-cli-standard-v1.md)

If this document conflicts with those standards, the standards win until an explicit in-place V1 refinement or a new standard generation is accepted.

This draft is **dormant** if the Host CLI sibling is rejected (no `dle`). It does not authorize implementing `dle`.

---

## 1. Why this exists

The exclusive-distro draft requires Windows, macOS, and Ubuntu from day one, with no requirement to clone the DLE monorepo. The Host CLI, if it exists, must feel like a **downloaded tool**: one executable, no “install Node first.”

Companion CLI Standard V1 already allows each CLI its own implementation technology. DSF’s `delivery` CLI is Node/TypeScript today. That does not force the Host onto Node-on-PATH, Bun, Go, or Rust.

A human research pass compared Deno `compile` and Bun `compile` for this job. Both are competitive. **Deno is locked as the more stable and conservative compile-to-executable path.** This file records that choice so later agents do not reopen Bun vs Deno vs Rust as a language debate.

---

## 2. Decision to discuss, in one paragraph

If DLE grows a Host CLI, implement it in TypeScript and ship it with **`deno compile`** as a single executable per supported OS/architecture. Users must not need Deno, Bun, or Node on PATH to run `dle`. Do not use Bun as the Host compiler. Do not use Rust. Do not rewrite `@dle/delivery-cli` onto Deno. Do not treat a Deno-compiled binary as an excuse to skip real tests on Windows, macOS, and Ubuntu.

---

## 3. What “binary” means here

Deno compile embeds a Deno runtime with the program. That is a **self-contained executable**, not a tiny Go/Rust machine-code image.

That is acceptable. The user-facing requirement is:

```text
download dle for this OS → run it
```

not:

```text
smallest possible native instruction stream
```

Binaries will be larger than a Go CLI. Document that. Do not chase Bun or Rust on size/speed.

---

## 4. Locked choices

| Choice                    | Lock                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Language                  | TypeScript                                                                                                                   |
| Compiler / ship form      | Deno `compile` to a single executable                                                                                        |
| User runtime on PATH      | none (not Deno, not Bun, not Node)                                                                                           |
| Bun                       | not the Host compiler or Host runtime                                                                                        |
| Rust                      | not used for Host                                                                                                            |
| Go                        | not selected; do not reopen unless Deno compile fails the OS matrix in practice                                              |
| `delivery` CLI            | remains Node/TypeScript at `packages/dsf/cli/`                                                                               |
| Shared JS runtime/library | none. Host and `delivery` must not share a `dle-cli-core` just to share language                                             |
| OS matrix                 | Windows, macOS, Ubuntu Linux, first-class, from the first Host milestone ([exclusive distro](./dle-exclusive-distro.md) §10) |

---

## 5. Why Deno, not the alternatives (short)

- **Bun compile** is competitive and was considered. It is not locked: the research conclusion was that Deno is the more stable/safe compile path for a conservative exclusive distro.
- **Node on PATH** fails the “downloaded tool” UX. Node SEA/`pkg` is a worse compile story than Deno for this.
- **Go** is a strong native-CLI genre default. It was not chosen: agents and this repo are TypeScript-first, and Deno still yields a single executable without a second language.
- **Rust** is rejected for Host: high review cost, weak fit for an owner who verifies by tests rather than reading compiler-level code.

Do not spend design time re-litigating this table unless a locked option **fails** the OS matrix or fail-closed install semantics.

---

## 6. Relationship to published standards

- Component Standard: no mandatory shared DLE runtime. A Deno-compiled Host is optional umbrella tooling, not a runtime every component must import.
- CLI Standard V1 applies to **companion** CLIs. Host process hygiene should still match (non-interactive, `--json`, `docs`, exact errors) if the Host CLI sibling is accepted; that is a conformance choice in [`dle-host-cli.md`](./dle-host-cli.md), not a reason to compile `delivery` with Deno.
- Components remain free to pick Node, Deno, or something else for **their** companion CLIs.

---

## 7. Distribution and CI implications

- Ship **named artifacts per OS/arch** (at least Windows, macOS, Ubuntu; amd64 and arm64 where that OS is actually used). Cross-compilation may _produce_ a Windows binary on Ubuntu; it does not _prove_ Windows.
- The first Host milestone is not done until tests **run** on Windows, macOS, and Ubuntu (atomic replace, paths, no symlink requirement).
- Pin the Deno **version** used to compile, same spirit as exact pins in the distro doctrine. Do not float `latest`.
- Checksums of released `dle` binaries belong in whatever release metadata DLE already uses; do not invent a second registry.

Layout of a Deno project inside this pnpm monorepo is **delegated**. Do not create `packages/dle-cli-core`. Do not put the Host under `packages/dsf/`. If a Host package exists, it is umbrella tooling, not a first-class lifecycle component, unless [`dle-host-cli.md`](./dle-host-cli.md) option B is separately accepted.

---

## 8. Non-goals

- Rewriting `delivery` in Deno
- Compiling companion CLIs with Deno as a universal DLE rule
- Bun as a hidden compile fallback
- A shared TypeScript workspace that both CLIs must import
- Optimizing binary size against Go/Rust
- Implementing `dle` in this draft

---

## 9. Open questions for the design agent

1. Exact Deno major/minor pin and how it is recorded in-repo.
2. Where Host sources live if/when implementation is authorized (umbrella path, not `packages/dsf/cli`).
3. Official compile targets for Windows, macOS, Ubuntu, amd64/arm64 — list the ones v1 **must** ship.
4. How compiled artifacts are attached to a DLE/Host release without becoming a public anyone-can-publish registry.
5. Whether Host TypeScript may use npm specifiers for tiny pure dependencies, or std-only for v1.
6. Confirm: failure of Deno compile on one OS is a **stop**, not a “ship Unix first.”

---

## 10. Human meta-intent (do not water this down)

> Host CLI, if accepted, is TypeScript compiled with Deno into per-OS executables so users do not install a JS runtime. Bun is not the compiler. Rust is not on the table. Delivery stays Node. Language choice is closed unless Deno cannot meet Windows/macOS/Ubuntu. This is not permission to implement `dle`.

---

## 11. Instruction to the design agent

Do not reopen Bun vs Deno vs Go vs Rust unless this lock is explicitly reversed.

- If the Host CLI sibling is rejected, mark this draft inapplicable and stop.
- If both Host CLI and exclusive distro are accepted, fold this compile target into the Host implementation contract (Deno version pin, artifact names, CI matrix).
- Do not migrate `delivery` to Deno as a drive-by.
- Do not write Host production code from this file alone.
