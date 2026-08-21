# Proposal: DLE exclusive distro and composition

**Status:** discussion draft only. Not an accepted contract. Not an implementation brief.  
**Audience:** design agent + human design authority  
**Date:** 2026-08-21  
**Location:** [`docs/proposals/dle-exclusive-distro.md`](./dle-exclusive-distro.md)  
**Sibling draft:** [`dle-host-cli.md`](./dle-host-cli.md) (whether/how a Host CLI exists)  
**Related published authority:**

- [DLE Component Standard V1](../standards/dle-component-standard-v1.md)
- [DLE CLI Standard V1](../standards/dle-cli-standard-v1.md)

If this document conflicts with those standards, the standards win until an explicit in-place V1 refinement or a new standard generation is accepted.

---

## 1. Why this exists

DLE is a named umbrella for a **small, exclusive set of first-class components**. It is not a public package registry and not a library ecosystem.

The user-facing problem is management of that set in a consuming project:

- what is installed
- how to get it without the DLE monorepo
- whether a change is allowed
- whether the bits on disk are the bits that were pinned

Mature package managers (Cargo, pnpm, npm, Go modules, rustup, Debian-style distros) have already paid for this knowledge. DLE should steal their **discipline** and refuse their **bazaar physics**.

This draft is the composition/distribution doctrine. The Host CLI draft is the operator surface for that doctrine. They are siblings. Do not merge them, and do not implement either until both are accepted or explicitly deferred.

---

## 2. Decision to discuss, in one paragraph

Treat DLE as a **curated distro**, not a tiny npm. Admit at most on the order of fifteen components (twenty as a hard extreme). Projects pin **exact** component versions with checksums; install is fetch-and-verify, not range-solving; illegal sets fail closed before mutation; co-location is not a dependency. Take lockfiles, hashes, isolation, immutability, and fail-closed from Cargo/pnpm/Go; take a gate from Debian; take host-vs-product from rustup; take almost nothing from npm except SemVer as a language. From day one this must work the same way on **Windows, macOS, and Ubuntu Linux**.

---

## 3. Why the OS matrix lives here (not a third proposal)

Cross-platform support is in **this** draft because it constrains the manager: fetch, pin files, path layout, atomic replace, executable entrypoints, and CI.

It is not a separate “make every future GUI work everywhere” proposal.

Already published, and not duplicated here:

- CLI Standard V1 portable process (UTF-8, CWD, locale-independent JSON, no implicit stdin)
- Component Standard: independently distributable; no mandatory shared runtime

This draft adds a **supported OS matrix for DLE composition/distribution**. Companion CLIs that DLE distributes must meet that matrix too, or they are not part of the Host-managed install. Domain artifacts that are UTF-8 JSON/Markdown are OS-neutral; the _container_ still has to place them with OS-safe paths.

Linux means **Ubuntu** as the supported representative, not “every distro.” That is an opinionated choice, consistent with staying small.

---

## 4. Users and jobs

Users stand in a **project**, not in `development-lifecycle-ecosystem`.

They need to:

1. see what set the project has
2. add or change one **exact** component version
3. hear **no** before anything mutates if that set is illegal or unverifiable
4. never clone the DLE monorepo to do that
5. never ask a companion CLI (`delivery`, future `dwf`) to install another component
6. do all of the above on Windows, macOS, and Ubuntu with the same commands and the same pin file

Component authors need a gated admission path, not an upload form.

---

## 5. Exclusive catalog

- DLE lists the components that exist. That list is intentional.
- Adding a component is a DLE design/standards event, not `publish`.
- “Supports new components” means a path exists, not that strangers can join.
- Design for ≤15; treat 20 as the extreme ceiling. Do not genericize the Host or the pin format for 20,000 plugins.

This is the local superpower: **at this scale, curated truth is cheaper than a solver.**

---

## 6. Distill package-manager knowledge

### Steal

| Practice                    | From                                                 | DLE form                                                                             |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Exact, Git-tracked pins     | Cargo.lock, pnpm-lock, go.mod                        | One project composition file. Exact versions. No ranges.                             |
| Checksums                   | Cargo.lock, go.sum, pnpm                             | Pin names id + version + digest. Fetch is verify.                                    |
| Immutable releases          | Cargo/npm/pnpm in theory; Component Standard in fact | A released version never changes. New bits ⇒ new version.                            |
| Fail closed before mutation | pnpm `--frozen-lockfile`, Cargo                      | Illegal set or pin/install mismatch refuses the change.                              |
| Strict isolation            | pnpm, not npm hoisting                               | Co-location is not a dependency. No phantom access to another component's internals. |
| Tool vs product             | rustup vs Cargo                                      | Host manages the set. Companion CLIs work artifacts.                                 |
| Small identity manifest     | package.json / Cargo.toml                            | `dle-component.json` stays identity, not a consumer graph.                           |
| Curated admission           | Debian, Homebrew core                                | New component = DLE decision, not a marketplace.                                     |
| Reproducible CI             | pnpm `--frozen-lockfile`                             | `validate` fails if pin ≠ install ≠ allowed set.                                     |

### Refuse

- A public registry anyone can publish to
- Version ranges and a dependency solver
- Two files (manifest vs lock) **until** there is something to resolve; ranges are what made Cargo need both
- Transitive library graphs (`node_modules` physics)
- Hoisting, optional peers, dist-tags, `latest`, postinstall scripts
- Global toolchains as the source of truth (project pin wins)
- Plugins, marketplace UI, `npx`-style “run whatever”

npm’s hardest problems exist because everything is a library and anyone may publish. DLE components are few, coarse, independently versioned **products** with directional contract-only edges. Install is not resolve. Compatibility is not “the solver found a tree.”

---

## 7. Opinionated model

1. **Admission.** DLE-owned catalog of components. Short. Intentional.
2. **Composition.** The project declares the exact set. That file is the container’s user-facing product. The Host CLI (if accepted) is how you read and change it.
3. **Install.** Fetch those exact artifacts from DLE-controlled distribution. Verify digest. Write nothing if verify fails.
4. **Compatibility.** A DLE-owned picture of allowed sets / known-broken combinations. Providers do not have to list consumers. DLE, as exclusive distro, is the consumer-of-record for “does this set exist.”
5. **Change.** Propose a new exact pin → check the set → mutate or persist nothing.
6. **CI.** Pin, install, and allowed set must match. Frozen.

pnpm/npm/Cargo may be a **transport** for Node bits. They are not the ecosystem. Do not become a second npm for generic JavaScript.

---

## 8. Composition artifact

Do not start with flags. Without this object, no Host CLI makes the experience decent.

Recommended doctrine (schema still delegated to design):

- **One** Git-tracked project file (no range file + lock file unless ranges are later accepted — they should not be).
- Exact component id + component SemVer.
- Checksum / digest for the installed payload.
- Optional companion CLI identity if the component has one, as relationship metadata, not as a second ecosystem.
- Path and filename are conventions, not per-component invention. Same relative path on all three OSs (forward-slash in the documented form; OS APIs at runtime).
- UTF-8, no BOM, LF newlines in the committed file.

Open: exact path, filename, and JSON vs other format. Do not steal `delivery/.framework/` as the DLE-wide file; that is DSF-shaped.

---

## 9. Compatibility

Independent SemVer axes already exist inside DSF (component, Definition schema, CLI, CLI-state). A host-level set multiplies that. Still do **not** invent companion-CLI version ranges (CLI Standard V1).

With ≤20 components, keep compatibility as a **curated table**, not as `dependsOn` spam inside every `dle-component.json`. That honors Component Standard: no speculative machine-readable dependency metadata until a real consumer needs it; the consumer here is DLE composition, not each provider.

Fail closed before pin change. Nearby numbers are not a guess.

---

## 10. Cross-platform from day one

### Matrix

Supported from the first composition/Host milestone:

| OS           | Role                                                |
| ------------ | --------------------------------------------------- |
| Windows      | First-class. Not “works in WSL so Windows is done.” |
| macOS        | First-class.                                        |
| Ubuntu Linux | First-class Linux representative.                   |

Not in the v1 matrix: other Linux distros as promised platforms, mobile, browsers, “POSIX in general.”

Same pin file, same commands, same exit/JSON behavior on all three. No Unix-first implementation with Windows “later.”

### Constraints the manager must take as design, not as bugs

- **No symlink requirement.** pnpm’s Windows pain is the lesson. Junctions/symlinks must not be the only install strategy. Prefer copy or documented hardlink fallback so a stock Windows machine without Developer Mode is valid.
- **No chmod-only executables.** Public entrypoints must run through a documented mechanism on Windows (`node` bin shim, `.cmd`/`.exe`, or equivalent). Shebang-only Unix scripts are not a public interface.
- **Paths.** Use OS path APIs. Do not concatenate `'/'`. Documented relative paths in contracts use `/` and resolve against process CWD, as CLI Standard V1 already says.
- **Atomic replace.** Install and pin updates must be all-or-nothing on Windows too (rename/`EPERM` is a known Windows reality). A crashed install must not leave a half-applied set.
- **Case.** Component ids stay lowercase. Do not ship two artifacts that differ only by case.
- **Line endings.** Committed composition files are LF. Tools must not rewrite them to CRLF as a semantic change.
- **Path length and reserved names.** Windows `MAX_PATH` and names like `aux`/`con` must not be required by the layout convention.
- **Caches/stores.** If a content-addressable cache exists, its location follows OS convention (`LOCALAPPDATA` / `Library` / XDG) and is documented. The **project pin** remains the source of truth, not a user-global toolchain.
- **CI.** The first Host/composition implementation is not done until tests run on Windows, macOS, and Ubuntu. A green Ubuntu-only pipeline is not evidence.
- **Native artifacts.** If a distributed executable is native, all three OSs ship or that executable is not DLE-distributed. Prefer portable runtimes (as Delivery CLI already does with Node) over three native ports unless a component truly needs them.

### What this does not change

Companion CLI Standard V1 process rules stay. This matrix does not require a shared DLE runtime. A component may still choose its implementation technology — but if DLE _distributes_ that companion CLI as part of a pin, the OS matrix applies to the distributed entrypoint.

---

## 11. Non-goals

- Public registry / anyone-can-publish
- SemVer ranges and a solver
- `dle delivery validate` or any domain dispatcher
- Shared `dle-cli-core` merely to share path helpers
- Global “active toolchain” that overrides the project pin
- Supporting every Linux distribution in v1
- Marketplace, plugins, postinstall scripts
- Inventing DWF/IRS internals in order to finish the manager
- Implementing the Host CLI in this draft

---

## 12. Open questions for the design agent

1. Confirm: exclusive catalog, exact pins, checksums, no ranges, DLE-owned compatibility picture?
2. One composition file: path, name, format?
3. Does a pin include companion CLI versions, only component versions, or both?
4. What is the first payload DLE actually fetches (npm package, file tree, both)?
5. Where does the compatibility table live, and who may change it?
6. Confirm OS matrix: Windows, macOS, Ubuntu, all three in CI before Host v1 is “done”?
7. Install strategy without required symlinks: copy-only for v1?
8. Is Node an acceptable Host runtime on all three (matching Delivery CLI), or must Host be native?
9. How does this interact with the repo’s existing pnpm/Changesets publish path without becoming a second npm?
10. What published standard sentences must change if this is accepted (Component Standard §5/§7, CLI Standard applicability)?

---

## 13. Suggested first milestone (after acceptance)

Boring, OS-complete, read-mostly:

1. Composition schema + fixtures, including a Windows path case and a checksum mismatch case.
2. Catalog of admitted components (DSF only is allowed as the first real row).
3. Read-only validate/list against a pin file on Windows, macOS, and Ubuntu.
4. No `add`/`update` until that is real.
5. No domain dispatch.
6. Independent Host SemVer if/when the sibling Host CLI draft is also accepted.

---

## 14. Human meta-intent (do not water this down)

> DLE is an exclusive distro of a handful of components, not a registry. Distill Cargo/pnpm/Go/rustup/Debian discipline: exact pins, hashes, isolation, immutability, fail-closed, host-vs-product. Do not import npm’s solver, ranges, hoisting, or anyone-can-publish. One composition file is the product. From day one the same pin/install/validate story must work on Windows, macOS, and Ubuntu — not Unix-first. The Host CLI, if any, only operates this story.

---

## 15. Instruction to the design agent

Produce an accepted/rejected design for this doctrine, not code.

- Keep [`dle-host-cli.md`](./dle-host-cli.md) as the CLI-identity sibling. This file owns distro physics and the OS matrix.
- If accepted: specify the composition artifact, admission/compatibility ownership, install/verify rules, and the OS matrix as normative for the container.
- If the OS matrix is rejected or narrowed, say so explicitly; do not silently become Ubuntu-only.
- If this conflicts with published V1 text, list the exact amendments. Do not implement around the conflict.
- Do not invent unpublished DWF/IRS contracts to make distribution look complete.
