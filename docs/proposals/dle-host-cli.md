# Proposal: DLE Host CLI

**Status:** discussion draft only. Not an accepted contract. Not an implementation brief.  
**Audience:** design agent + human design authority  
**Date:** 2026-08-21  
**Location:** [`docs/proposals/dle-host-cli.md`](./dle-host-cli.md)  
**Sibling draft:** [`dle-exclusive-distro.md`](./dle-exclusive-distro.md) (curated distro, pins, OS matrix)  
**Related published authority:**

- [DLE Component Standard V1](../standards/dle-component-standard-v1.md)
- [DLE CLI Standard V1](../standards/dle-cli-standard-v1.md)

If this document conflicts with those standards, the standards win until an explicit in-place V1 refinement or a new standard generation is accepted.

---

## 1. Why this exists

DLE is the umbrella for loosely coupled lifecycle components (DSF, later DWF, IRS, and others). It is not one framework and not a mandatory runtime.

Today the only materialized first-class component is DSF, with a subordinate companion CLI (`delivery`) that operates on **Delivery domain artifacts**.

The missing product is an operator for the **ecosystem composition itself**:

- which components are present
- at which versions
- whether that set is a legal combination
- how a project updates a component pin

That work should not live on component CLIs.

This proposal asks the design agent to shape a **DLE Host CLI** (`dle`) as optional umbrella tooling, with a hard split from companion CLIs.

---

## 2. Decision to discuss, in one paragraph

Add an optional DLE Host CLI whose only job is distribution, identity, pin management, and compatibility/validation of the **set of DLE components in a project**. Component companion CLIs remain responsible for their own domain artifacts and never install, upgrade, or compose other components. Do not make `dle` a dispatcher for `delivery`, `dwf`, or any other domain command. Do not implement the Host CLI until the composition contract is designed, and prefer not to ship it until at least two first-class components exist unless a concrete pin/compatibility format is needed first.

---

## 3. The split that must be preserved

There are two products. They share invocation hygiene. They do not share jobs.

| Kind          | Example                  | Operates on                                                           | Does not do                                             |
| ------------- | ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------- |
| Companion CLI | `delivery`, future `dwf` | That component's domain artifacts (Definition, workspace, records, …) | Install/upgrade other components; compose the ecosystem |
| Host CLI      | proposed `dle`           | Component identity, pins, distribution, composition compatibility     | Validate a Roadmap; start a Phase; resolve a Design Gap |

Updating “the DWF version in this project” is Host work.  
Migrating a DWF workspace schema is DWF companion-CLI work.  
`dwf --version` reporting identity is companion-CLI work.  
`dwf upgrade-myself` / `delivery install-dsf` are the overlap to forbid.

Analogy: `pnpm`/`rustup` vs `delivery`/`cargo`. One manages the toolchain. The other does the work.

---

## 4. Constraints from already-published V1

The design agent must not silently reverse these.

1. **DLE is an umbrella, not a runtime.** Component Standard §7: DLE has no runtime, SDK, service, package, or library that every component must depend on.
2. **Companion CLIs are owned by a parent component.** Delivery CLI lives at `packages/dsf/cli/`. There is no `packages/delivery-cli/`.
3. **DLE CLI Standard V1 applies to companion CLIs**, not currently to a host CLI. It requires `--help`, `--version`, `validate`, `docs`, `--json`. `dleCliStandard` is integer `1`.
4. **`validate` on a companion CLI is domain validation.** `delivery validate` means Definition schema + graph, not “this project’s component set is legal.”
5. **No speculative component-manifest metadata.** `dle-component.json` V1 is identity plus optional `{ cli.name, cli.version }`. Do not add dependency graphs, registries, binary catalogues, or supported-version ranges until a real consumer needs them.
6. **Compatibility ownership is directional.** A provider need not know its consumers. Compatibility belongs to the consumer. Hard circular component dependencies are prohibited.
7. **Prefer duplication over premature shared extraction.** A Host CLI is not permission to create `packages/dle-cli-core` or a shared companion-CLI runtime.
8. **Components remain consumable without any CLI.** Direct consumption of a Phase/workspace without invoking `dle` or `delivery` stays valid.
9. **Package-manager reality.** This repo already distributes Node packages with pnpm and Changesets. The Host CLI must not become a second npm unless it has a job pnpm cannot do.

---

## 5. Recommended product shape

### 5.1 What `dle` is

Optional, non-interactive, agent-friendly **ecosystem operator**.

It answers:

- What DLE components are pinned in this project?
- Are those pins internally consistent and currently supported?
- Can I add or move pin X to version Y fail-closed?
- Where did this component release come from, and is the installed copy the one the pin names?

### 5.2 What `dle` is not

- not a mandatory runtime
- not a first-class lifecycle framework (it does not own Design, Delivery, or Implementation as a domain)
- not a command dispatcher (`dle delivery validate` is out)
- not a replacement for pnpm/npm for generic JS package installation
- not a place to re-implement `delivery validate`, future `dwf validate`, etc.
- not a shared library that companion CLIs must import

### 5.3 First useful surface (design target, not an implementation list)

Invocation hygiene should match companion CLIs so agents do not learn two process models:

```text
dle --help / -h
dle --version
dle docs [<topic>] [--index|-i] [--all|-a]
dle validate
dle --json
```

Host-specific verbs, only if the composition contract needs them:

```text
dle list          # or status; pick one name and keep it
dle add <id>@<version>
dle update <id> [@<version>]
```

`dle validate` here means: **the project’s component composition is valid**.  
It must not mean: run every companion `validate` behind one facade.

If a convenience “run all domain validators” is ever wanted, it is a later explicit command with a different name. Do not overload `validate`.

### 5.4 Explicit non-commands

Do not design these in the first generation:

```text
dle delivery ...
dle dwf ...
dle exec <component-cli>
dle phase ...
dle init-delivery
dle --recursive
```

---

## 6. The identity problem the design agent must resolve

Current rule: a companion CLI is owned by a first-class component.

DLE itself is **not** currently a first-class component. It has no `packages/dle/dle-component.json`, and making the umbrella a lifecycle component would contradict “one bounded lifecycle responsibility.”

So `dle` has no legal parent under the letter of today’s standard. The design agent must choose one of these, not invent a fourth silently:

| Option                                       | Meaning                                                                                                                                         | Risk                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **A. Umbrella-owned host CLI**               | Amend Component Standard / CLI Standard to say the DLE umbrella may own a Host CLI that is not a companion CLI and not a first-class component. | Two CLI kinds to document. Cleanest honesty.                       |
| **B. New first-class composition component** | Create a bounded component (name TBD: host, composition, catalog) whose public contract is pins + compatibility, and whose CLI is `dle`.        | Can become a fake component whose only purpose is to own a binary. |
| **C. No DLE CLI**                            | Keep pnpm + `dle-component.json` + each companion CLI. Revisit when a second component exists.                                                  | Least machinery. Defers the user need.                             |

**Recommendation to discuss:** Option A, with Option C as the default until the composition contract exists. Do not create a hollow component (B) just to satisfy “CLIs have parents.”

If A is accepted, the Host CLI should have its own product SemVer, independent of DSF, Delivery CLI, and `dleCliStandard`. Decide whether it reports:

```text
dleHostStandard: 1
```

or reuses companion CLI Standard V1 for process/envelope only, with a documented exception that `validate` is composition-scoped. Do **not** bump `dleCliStandard` to `2` merely to introduce a host CLI.

---

## 7. The missing contract is the composition artifact, not the argv parser

Do not start with flags. The Host CLI is unjustified until there is a project-level composition source of truth.

Today’s nearby facts:

- Component identity lives in `dle-component.json`.
- DSF mentions a project-owned `delivery/.framework/` pin of DSF material. That is DSF-shaped, not a DLE-wide composition document.
- There is no DLE lockfile, pin file, or compatibility catalog.

The design agent should define, before any CLI implementation:

1. **Where pins live** in a consuming project (path, filename, whether Git-tracked).
2. **What a pin names** (component id, component SemVer, optional companion CLI SemVer, artifact/distribution locator).
3. **What `dle validate` checks** (manifest presence, id/version match, digest/immutability, allowed combinations).
4. **Where compatibility rules live.** They must not be stuffed speculatively into every `dle-component.json`. A provider must not have to list its consumers. Prefer a DLE-owned compatibility catalog and/or consumer-declared requirements.
5. **How distribution works.** Wrap pnpm/npm? Fetch published component releases into a project-local pin directory? Support non-Node components?
6. **Failure mode:** unknown component, unsupported pair, pin/install mismatch → fail closed before mutation, analogous to companion `COMPATIBILITY_UNSUPPORTED`.

If that artifact cannot be specified from accepted needs, **do not add `dle`**. Use pnpm.

---

## 8. Compatibility is the hard part

Independent axes already exist inside DSF (component, Definition schema, CLI, CLI-state). A host-level matrix multiplies that.

The Host CLI should treat compatibility as:

```text
fail closed before changing pins
```

not:

```text
guess from nearby version numbers
```

Do not invent a universal supported-version-range field on companion CLIs (CLI Standard V1 already forbids that). If ranges exist, they belong in the **composition/compatibility contract**, not as a new companion-CLI flag.

Because compatibility ownership is directional:

- DSF does not publish “works with DWF x.y” as DSF identity metadata unless DSF actually consumes a DWF public contract.
- A project that uses both is the consumer of both public contracts.
- The Host CLI validates the **project’s declared set**, using published rules, not conversational judgment.

---

## 9. Timing gate

Recommended gate:

```text
Design the composition contract first.
Implement dle only when one of these is true:
  (1) a second first-class component is being published, or
  (2) a real consumer must pin/verify component releases outside the monorepo
      and pnpm cannot express that check.
```

Shipping `dle` while DSF is the only component creates a package manager in a trench coat and will pull domain verbs into the host CLI out of boredom.

Designing the contract **before** DWF lands is allowed and probably useful, so DWF can be born already pinnable. Implementing the binary before that need is not.

---

## 10. Relationship to DLE CLI Standard V1

Keep companion CLI Standard V1 for companion CLIs.

If a Host CLI is accepted, the design agent should say explicitly whether:

- Host CLI **conforms to CLI Standard V1 process rules** (non-interactive, `--json` envelope, `docs`, exact lookup, no typo guessing), and
- Host CLI **is carved out** as a different product class so `validate` / `--version` identity fields can mean composition rather than domain artifacts.

Do not force `delivery` and `dle` to share a codebase. Copy the envelope/docs pattern if that remains the smallest solution.

`docs` on `dle` would explain the ecosystem model (umbrella vs component vs companion CLI vs pins). It would not dump DSF Roadmap semantics; that stays `delivery docs`.

---

## 11. Open questions for the design agent

Answer these. Do not skip them by writing parser code.

1. Option A, B, or C in §6? If A, what exact standard text changes?
2. Is the executable name `dle` reserved now?
3. What is the project-level composition artifact? Path? Schema? Git policy?
4. Does a pin include companion CLI versions, only component versions, or both?
5. Where do compatibility rules live, given providers must not have to know consumers?
6. What does Host `validate` check in v1, and what does it refuse to check?
7. How does distribution interact with pnpm/Changesets? When is `dle add` more than `pnpm add`?
8. Does Host `--version --json` report a `dleHostStandard`, reuse `dleCliStandard: 1`, or both?
9. Is `list` or `status` the discovery command? CLI Standard V1 currently treats `status` as non-universal for companion CLIs.
10. May `dle` ever invoke a companion CLI, even as a documented later extension?
11. What is the first milestone that is **not** a full package manager?
12. What existing public wording must be amended (`packages/README.md`, Component Standard §2/§7, CLI Standard applicability sentence)?

---

## 12. Suggested first milestone (after contract acceptance)

If the design is accepted, a later implementation milestone should be boring:

1. Composition artifact schema + fixtures.
2. Read-only `dle --help`, `--version`, `docs`, `validate`, `list`.
3. Fail-closed pin mismatch / unknown component / illegal combination.
4. No `add`/`update` until read-only validation is real.
5. No domain dispatch.
6. Independent Host CLI SemVer and a focused Changeset. No DSF `1.1.1` bump unless DSF’s public contract actually changes.

---

## 13. Human meta-intent (do not water this down)

> Component CLIs are responsible for themselves and their artifacts. A DLE CLI, if it exists, is responsible only for the set of components: distribution, identity, pins, and compatibility. Updating DWF in a project is Host work, not `dwf` work. Do not build a dispatcher. Do not invent a shared DLE runtime. Do not ship the binary before the composition contract, and preferably not before a second real component.

---

## 14. Instruction to the design agent

Produce an accepted/rejected design, not code.

- If accepted: write the composition contract, the Host vs companion CLI distinction, the standard-amendment list, and a small first CLI surface. Mark delegated implementation details as delegated.
- If rejected: say to keep pnpm + companion CLIs, and record the trigger that would reopen this.
- If the composition artifact cannot be specified without guessing unpublished DWF/IRS semantics, stop and list the missing authority. Do not invent those components in order to justify `dle`.
