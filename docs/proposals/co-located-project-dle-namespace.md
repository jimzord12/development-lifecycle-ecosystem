# Co-located project DLE instance

**Status:** discussion draft. Working model from the 2026-08-21 design session. Not an accepted contract.

Do not implement from this file. Do not treat it as overriding DLE Component Standard V1, DLE CLI Standard V1, DSF 1.2.0, IRS 1.3.0, or DWF Protocol 031.

---

## Paste this into a new chat

```text
Continue DLE from docs/proposals/co-located-project-dle-namespace.md.

The working same-team consumption model is drafted there. This is still
discussion only. Do not implement from this proposal. Do not run Phase 7.
Do not read workspace-migration/sessions/.

Load AGENTS.md and the Public Contracts named in that draft. Then orient
and wait for NORMAL or FAST unless already specified.
```

---

## What this draft is

A same-team consumption model: a project that already uses DLE hosts design, Delivery, Topics, and IRS **next to the implementation repositories**. A co-worker continues without generating a Portable Implementation Package (PIP).

This is DLE consumption-model design. It may later change DWF, DSF, IRS, or add CLI/skill surface. It is not originating-product domain design and not Delivery CLI domain commands.

Keep it **framework-generic**. Do not copy private repository identities, product domain truth, or delivery JSON into this public repo.

---

## Published contracts that still win

Until this substance is promoted into a standard, schema, fixture, test, or decision record, the published contracts still apply:

| Component              | Version                                         | Path                                          |
| ---------------------- | ----------------------------------------------- | --------------------------------------------- |
| DLE Component Standard | V1                                              | `docs/standards/dle-component-standard-v1.md` |
| DLE CLI Standard       | V1                                              | `docs/standards/dle-cli-standard-v1.md`       |
| DSF                    | 1.2.0, consumer contract 3, Definition schema 2 | `packages/dsf/`                               |
| Delivery CLI           | 0.1.0, read-only `validate` + `docs`            | `packages/dsf/cli/`                           |
| IRS                    | 1.3.0, tracker state 3                          | `packages/implementation-record-system/`      |
| DWF                    | 0.1.0-local.32, Protocol 031                    | `packages/dwf/`                               |

Authoritative current PIP meaning:

- DWF Protocol 031: ordinary implementation handoff is a PIP. DWF is installed under `design/.framework/`, DSF under `delivery/.framework/`. The PIP exports a bounded `design/` projection, not a recoverable Design Workspace. Historical Design Sessions stay out of the PIP.
- DSF `packages/dsf/contract/docs/package-updates.md`: PIP is a self-contained handoff. Project-owned packaged truth changes only after explicit human resolution of a Design Gap. Each material mutation appends immutable `AM-*`. `.framework/**` and existing `AM-*` records are immutable.
- IRS 1.3.0: PIP is implementation authority; IRS is mutable run state. Expected shape today is PIP, `implementation-record/`, and implementation repos as siblings.

`workspace-migration/` is gitignored local empirical material. Do not commit it. Do not read `workspace-migration/sessions/`.

**Phase 7 remains parked.** Pinning today's published DLE releases into the originating Design Workspace under the current PIP / `.framework/` model is the wrong next step while this consumption profile is the intended direction.

---

## Working model (this session)

Same-team continuation does not generate a PIP and does not copy `.framework/` into the project. The public DLE git clone is the install. The project owns an **instance directory** whose layout is the current PIP **project** tree, minus `.framework/`, plus `topics/` and `implementation-record/`.

Daily work is a **router skill** after the agent copies clone skills into the harness user-scope directory. The CLI is plumbing and queries, not the loop. DLE does not write harness paths.

### Bootstrap

A co-worker uses an independently runnable CLI (working name `dle`; see [Relationship to other drafts](#relationship-to-other-drafts)). They do not have to clone DLE by hand first.

```text
dle init <instance-path> --dle-home <dle-clone-path>
```

When no install is bound:

1. Clone this public DLE repository into `--dle-home` (required; no hidden default; no prompt).
2. Write a **local bind** that points at that clone (machine path; not committed). Optionally record the clone SHA in the bind.
3. Scaffold the instance at `<instance-path>`: `design/`, `delivery/`, `topics/`, `implementation-record/`, README.
4. Print the same read-only skills advice as `dle skills` (clone path; tell the agent to copy into user-scope). Do **not** write into any harness directory.

Join is not init: a later co-worker binds their clone into an existing instance rather than re-scaffolding.

The project consumes published DLE component trees from that clone. It does not fork or edit `packages/dsf`, `packages/dwf`, or `packages/implementation-record-system` as product source.

### Daily use

| Actor path                      | Role                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| User-scope DLE **router skill** | Daily driver, after the agent copies clone skills. Dispatch only. User and agent do not need the CLI for ordinary work. |
| `dle operate`                   | Tells the agent to load the router skill. Does not reimplement it.                                                      |
| `dle skills`                    | Read-only: clone skills path + “copy into this harness’s user-scope directory.” No user-scope writes.                   |
| `dle topics`                    | Machine query, e.g. list Topics.                                                                                        |
| `dle docs`                      | Packaged retrieval (DLE CLI Standard V1). Useful for agents; not the daily loop.                                        |
| `dle validate`                  | Read-only instance check (bind present, required dirs). Does not repair.                                                |
| `dle init`                      | Clone / bind / scaffold, and emit the same skills advice as `dle skills`.                                               |

Operate loop (in the **router skill**, not the CLI):

1. Check the local bind.
2. Classify the situation and load **exactly one** component skill (`dwf`, `dsf`, or `irs`).
3. That component skill routes to a playbook. On finish of a design Topic, update that Topic's distillate and harness metadata.

### Instance layout

Working name: project DLE instance. Path is whatever `init` was given.

```text
<instance>/
├── README.md                 # points at the router skill (copy from clone via `dle skills`)
├── design/                   # PIP project projection; no design/.framework/
├── delivery/                 # Delivery Definition; no delivery/.framework/
├── topics/                   # DLE Topics (renamed Design Sessions)
└── implementation-record/    # IRS run; inside the instance, not a sibling of a PIP
```

Local bind (clone path, optional SHA) lives beside this as machine-specific state, same idea as IRS `environment.local.json`. Do not commit `C:\Users\...`.

Canonical implementation-facing truth in this profile is instance `design/` + `delivery/`, in **PIP projection shape** (for example `design/decisions/product.md`, Agent PRD/SPEC, `delivery/roadmap.json`). Live instance also keeps `design/OPEN-QUESTIONS.md` and `design/OPEN-DECISIONS.md`. Topics are not product truth.

Drop from this profile: `design/.framework/`, `delivery/.framework/`, `package-manifest.json`, `amendments/`. No same-team PIP generation. No `AM-*` for in-place Design Gaps. Persist = write the instance files. Git is optional rollback, not the loop.

### Topics

**DLE Topic** replaces **Design Session** in this profile.

- Entry point for starting or planning later agent sessions.
- Not a full chat transcript.
- Distilled body plus harness metadata.
- One Markdown file per Topic: `topics/NNN-slug.md`.
- YAML frontmatter at least: `harness`, `sessionId`, `duration`, `totalTokens`, `status`, `nextAction`, `touches`.
- `status` uses Protocol 031 durable values: `PLANNED` | `CHECKPOINTED` | `PARKED` | `COMPLETE`.
- Body: lossless-enough distillate of decisions and context for a _new_ harness. `sessionId` is only for resuming the original chat.

`touches` lists the `design/` and `delivery/` paths the Topic affects. `totalTokens` is user-owned; do not infer it (same rule as IRS).

### CLI surface

This CLI is a conforming DLE CLI Standard V1 CLI: `--help`, `--version`, `validate`, `docs`, `--json` on every result. Non-interactive by default.

It is **not** Delivery CLI (`delivery`). Help explains invocation. `docs` explains this consumption model.

Minimum `docs` catalog: `init`, `instance`, `topics`, `operate`, `skills`. Topic `operate` is the same instruction as the instance README: load the router skill. The corpus ships in the CLI (Standard V1, offline).

### Agent skills architecture

Superpowers-shaped: a thin **router** for UX, plus **one invocable skill per first-class DLE component**. Direct invoke of a component skill remains legal. The router is the nicer front door.

Invocable surface:

| Skill | Role                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------ |
| `dle` | Router only. Classify the job; load one component skill. No playbooks of its own.                |
| `dwf` | How design works. Protocol 031 method on the instance tree. Playbooks, not nested skills.        |
| `dsf` | Agent method for Delivery Definition. May run `delivery` as a tool. Playbooks, not a second CLI. |
| `irs` | Already this shape: `SKILL.md` + `references/` playbooks.                                        |

Each component skill mimics IRS: one `SKILL.md` that routes to **playbooks under `references/`**. No nested invocable `SKILL.md` inside a component. Today's DWF extras (`prepare-implementation-package`, MiniCourse, frontier-wave-traversal) are **playbooks of `dwf`** in this architecture. Promoting that into the DWF Public Contract is later work.

Canonical agent-facing tree is the **DLE clone**:

```text
<dle-home>/.agents/skills/
├── dle/     # router
├── dwf/
├── dsf/
└── irs/
```

Components still own their skill and playbooks. `.agents/skills/<id>/` is how an agent **finds** them in the clone. DSF gets a skill even though it has `delivery`: skill = agent method; CLI = deterministic tool a playbook may invoke.

User-scope is a **copy the agent makes**. `dle skills` is read-only advice: print the clone skills path and tell the agent to copy those directories into **this harness's** user-scope skills directory. The harness knows that destination; DLE does not. Optional later: `dle skills --json` lists skill ids and source paths. Still no user-scope writes.

Router dispatch (thin; does not reimplement component playbooks):

| Situation                           | Load                                  |
| ----------------------------------- | ------------------------------------- |
| Bind / join / “where is DLE?”       | CLI `init` / local bind; `dle skills` |
| Open / continue a **design** Topic  | `dwf`                                 |
| Implementation Phase / Review / Gap | `irs`                                 |
| Delivery graph / Definition         | `dsf` (may run `delivery validate`)   |
| List / query Topics                 | CLI `topics` and/or read `topics/`    |

**Two design surfaces (do not mix):**

- **Product project** — Topics in the project instance. Router → `dwf` for discuss/finalize into instance `design/` / `delivery/`.
- **DLE itself** — `docs/proposals/` in this repo. Proposal lifecycle (template, open/completed) is a **separate later proposal**, not Topics.

### DWF-on-instance loop

Router loads `dwf`. DWF still owns how design is done. Daily ZIP commands (`Unzip`, `Snapshot`, “return the ZIP”) are **not** this profile’s loop. There is no second Design Workspace tree to sync.

| Playbook            | Does                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orient              | Read instance `design/` + `topics/`. Rank Topics. Do not auto-select.                                                                                    |
| Initialize / Resume | Select Topic, Design Pace (`NORMAL`/`FAST`), start from distillate + canonical `design/`. `ACTIVE` and Pace stay chat-local.                             |
| Checkpoint          | User-asked only. Promote settled `D-*`/`TD-*` into ledgers. Refresh Topic distillate + `CHECKPOINTED`. Do not regenerate PRD/SPEC or complete the Topic. |
| Park                | Same persist as Checkpoint, status `PARKED`.                                                                                                             |
| Finalize            | Settled conclusions only. Ledgers + Agent then Human PRD/SPEC per DWF order. Topic `COMPLETE`.                                                           |

Checkpoint, Park, and Finalize **write the real files**. That is persistence. A later agent reads those files. Git is optional rollback / collaboration, not a DLE command and not a gate.

Two resumes: harness `sessionId` if that chat still exists; otherwise distillate + `design/`. No integer workspace version.

Deferred inside DWF: 9-file Design Package, MiniCourse, Audit/Maintain-on-instance.

### IRS without a PIP

IRS remains the **run recorder**. It does not become the design tree. Authority is the instance’s current `design/` + `delivery/`, reread at the start of each IRS playbook.

Dropping PIP removes the events published IRS 1.3.0 keys off: `authoritativePackage` (id / origin / digest / Amendment head), rematerialized package folders, and `AM-*`. Do **not** invent a digest successor in this draft. `authoritativePackage` is unused in this profile. PASSED/CLOSED results are not auto-staled when a Topic is later Checkpointed; a human says when work must be revalidated.

This profile’s IRS playbooks:

| Playbook             | Keep?  | Change                                                                              |
| -------------------- | ------ | ----------------------------------------------------------------------------------- |
| `initialize`         | Yes    | From a valid instance (`design/`, `delivery/`), not from a PIP.                     |
| `implement-phase`    | Yes    | Load instance Delivery/design, not PIP identity.                                    |
| `review-milestone`   | Yes    | Unchanged method.                                                                   |
| `repair-milestone`   | Yes    | Unchanged method.                                                                   |
| `resolve-design-gap` | Yes    | After the human decides, DWF persist writes instance files. No `amend_package.py`.  |
| `finish-session`     | Yes    | Handoff test is instance + tracker, not PIP + tracker.                              |
| `adopt-run`          | Yes    | Rebind `environment.local.json` (instance root + repos). No PIP digest check.       |
| `reconcile-package`  | **No** | No package lineage to adopt.                                                        |
| `migrate-run`        | **No** | That playbook swaps PIP, archives `DLE Legacy Files/`, and hunts skills. Dead here. |

Upgrading DLE/IRS **code** is: update the clone + `dle skills` (agent recopies). Not an IRS run playbook.

Do not keep a tracker-schema migrator in this profile until a published state bump actually exists. A future IRS v4 that drops `authoritativePackage` is promotion work, not this draft.

`environment.local.json` binds instance root + repo paths. `RUN.md` points at the IRS skill and the instance.

---

## How the original nine questions landed

1. **Physical namespace** — Directory created by `dle init <instance-path>`. Caller chooses where it sits relative to the implementation repos.
2. **What lives in it** — `design/`, `delivery/`, `topics/`, `implementation-record/`, README. Framework install is the DLE clone via local bind, not `.framework/`.
3. **Canonical design truth** — Instance `design/` + `delivery/` (PIP projection shape). Topics do not own product behavior.
4. **PIP** — Not the same-team default. Not generated for continuation. Outsider/zero-context export not designed in this session.
5. **Amendments** — None in this profile. In-place persist writes instance files. Git is optional, not the Amendment substitute.
6. **IRS identity** — No package-id successor in this draft. Unused `authoritativePackage`. IRS lives in the instance and rereads `design/` + `delivery/`.
7. **Pinning** — `--dle-home` clone plus local bind; optional clone SHA. Consume the clone; do not edit component source.
8. **Co-worker kit** — Independently runnable CLI → `init` → `dle skills` advice → agent copies `.agents/skills` into harness user-scope. Daily: router skill. CLI: list Topics, `docs`, `validate`, `skills`.
9. **SemVer** — **Deferred.** Hypothesis: additional consumption profile, not a silent replacement of published PIP contracts.

---

## Deferred

- Whether PIP remains a product for zero-context / external handoff.
- Published SemVer vs additional consumption profile.
- DLE `docs/proposals/` lifecycle (template, statuses). Separate proposal.
- Whether the bootstrap CLI is the Host CLI in [`dle-host-cli.md`](./dle-host-cli.md) or a separate product that happens to use the working name `dle`.
- Exact filesystem identity of `.agents/skills/<id>/` vs `packages/<id>/SKILL.md` (copy, path, or single tree). Implementation, as long as agents find skills at `.agents/skills/` and components still own the playbooks.
- IRS tracker v4 / dropping `authoritativePackage` in a published IRS release. Not this profile’s playbook set.
- 9-file Design Package, MiniCourse, Audit/Maintain-on-instance.

---

## Relationship to other drafts

- [`dle-host-cli.md`](./dle-host-cli.md) — Host CLI as ecosystem composition / pins. This draft's CLI is clone, bind, scaffold, `docs`, `validate`, Topic queries, and `operate` → skill. Those are different jobs. This file does not accept Host CLI composition semantics or Deno/exclusive-distro drafts.
- [`irs-default-router-invocation.md`](./irs-default-router-invocation.md) — IRS router default when invoked with no operation. The DLE router may dispatch _to_ IRS; it does not replace that draft.
- Delivery CLI `phase` / `init` / mutable engine remain out of this draft.

---

## Authority for a later session

Read only materialized contracts, in this order:

1. `AGENTS.md`
2. `docs/standards/dle-component-standard-v1.md`
3. `docs/standards/dle-cli-standard-v1.md`
4. `packages/dwf/README.md` and `packages/dwf/WORKSPACE-PROTOCOL.md` (Implementation Handoff Boundary)
5. `packages/dwf/skills/prepare-implementation-package/SKILL.md`
6. `packages/dsf/README.md` and `packages/dsf/contract/docs/package-updates.md`
7. `packages/implementation-record-system/README.md` and `SKILL.md`
8. this file

Optional empirical context: the gitignored Design Workspace extract, only to remember how PIP/IRS were used. Do not copy product files into this repo. Do not read its `sessions/` directory.

`docs/proposals/` remains discussion only, including this file.

---

## Out of scope until explicitly requested

- Implementing the instance layout, CLI, or router skill
- Phase 7 workspace cutover
- Delivery CLI mutable engine
- Host CLI composition, exclusive distro, Deno
- Inventing missing semantic contracts (including an IRS package-identity successor) to make co-location convenient
