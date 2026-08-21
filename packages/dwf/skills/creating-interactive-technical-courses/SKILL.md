---
name: creating-interactive-technical-courses
description: Use when turning complex technical designs, architectures, features, libraries, APIs, or programming concepts into short self-guided interactive mini-courses for professional developers, especially when the course must fit a hard time budget and be delivered as a ready-to-build source ZIP whose build produces one offline HTML file.
compatibility: Course generation itself is network-independent. The generated source project requires Node.js 20.19+ or 22.12+ and npm on the recipient/developer machine to install dependencies and build the single-file HTML release.
metadata:
  version: '0.2.0'
  maturity: 'spike'
---

# Creating Interactive Technical Courses

## Core principle

Create a **short operational mental model**, not prettier documentation.

Make the technical reasoning demanding when it needs to be. Make the learning environment cognitively cheap.

This skill is optimized for **professional developers learning complex technical material they partially understand already**. It is not a general K-12 course generator, certification system, LMS, or long-term curriculum framework.

## Non-negotiable boundaries

- The user-supplied **time budget controls scope**. Do not create a larger course and ask the learner to spend more time.
- The required learning path must fit the requested budget with margin for normal learner variance.
- A mini-course may never assume a required learning period longer than **14 days**. If the requested outcome cannot fit, narrow the outcome or split it into multiple mini-courses.
- Prefer happy paths, obvious error handling, and common high-impact edge cases. Do not turn the course into an exhaustive edge-case catalog.
- Ground technical claims in the user's supplied sources. Do not silently invent or reconcile unsupported behavior.
- Interaction is optional. **Delete any interaction that does not materially improve understanding.**
- The default deliverable is a **source ZIP**, not a compiled HTML file. The ZIP must contain a ready-to-build React/Vite project whose `npm run build` command produces and verifies one self-contained offline HTML file.
- Do not require network/package installation inside the agent runtime. `npm install` is a recipient/developer build step.

## Workflow

Follow these stages in order. Each stage has an output contract; do not jump directly from source material to UI code.

All bundled script paths below are relative to the **skill root**. Execute them from the skill root or use an absolute skill-root path.

### Stage 1 — Preparation and Course Brief

Read `references/intake-and-course-brief.md`.

Resolve these five preparation dimensions before generation. Values already supplied by command arguments, conversation, or authoritative context count as resolved; **do not ask them again**.

1. **Time budget** — hard maximum for the required path.
2. **Audience / prior knowledge** — who will take it and what they already know.
3. **Desired capabilities / depth** — what they should be able to explain, predict, review, debug, or implement afterward.
4. **Scope** — whole subject or bounded area, including emphasis and exclusions.
5. **Delivery / persistence intent** — ordinary downloadable source ZIP, or a caller-specific persistence request when the surrounding framework supports one.

The subject/source material is normally implied by the request. Ask for it only when genuinely missing.

After the five dimensions are resolved, perform one **ambiguity scan**. Ask at most **5 additional targeted questions total** and only when the ambiguity materially affects scope, correctness, learner prerequisites, or the requested outcome. Resolve lower-impact ambiguity with professional judgment.

Write the resolved brief to `course-brief.json` in the course working directory, then run:

```bash
node <skill-root>/scripts/validate-course-brief.mjs <course-dir>/course-brief.json
```

**Output:** validated Course Brief.

### Stage 2 — Reduce the knowledge to the time budget

Read:

- `references/scope-and-time-budget.md`
- `references/methodology.md`

Transform the source material into four buckets:

- **MUST** — required for the target operational mental model.
- **SHOULD** — high-value if the time budget permits.
- **OPTIONAL DEPTH** — useful implementation/specification detail available on demand.
- **REFERENCE ONLY** — exact edge cases, historical provenance, exhaustive tables, or details the learner can look up later.

Do not organize the course around source-document headings, decision IDs, or file structure unless those are themselves part of the mental model.

Design the required path to approximately **80–85% of the stated budget**. Use the remaining margin for learner variance, navigation, and short reflection. This is a practical planning buffer, not a scientific timing law.

**Output:** scoped knowledge map with estimated main-path minutes.

### Stage 3 — Design the instructional architecture

Read:

- `references/methodology.md`
- `references/instructional-patterns.md`
- `references/visual-and-interaction-patterns.md`

Create the course around **causal questions and engineering outcomes**.

Default macro-structure:

1. System contract and simplified map
2. Canonical end-to-end behavior
3. Mechanism slices
4. Variations and important decisions
5. High-impact failure/recovery/composition cases
6. Engineering transfer + reference

This is a default, not a quota. Collapse phases when the subject is small.

For each conceptual unit define:

- engineering question;
- minimum runnable representation;
- expected model update/invariant;
- whether the learner should predict, manipulate, inspect a worked trace, compare, debug, or simply read/observe;
- feedback behavior;
- one useful variation/failure only when it strengthens the model;
- optional deeper implementation/spec detail;
- estimated minutes.

Keep a **persistent or repeatedly restored whole-system representation** whenever the subject benefits from architecture/state orientation.

**Output:** course map + unit contracts.

### Stage 4 — Design representations and interactions

Use `references/visual-and-interaction-patterns.md`.

Match the medium to the information:

- topology → stable map;
- state → snapshots/state machine;
- sequence → trace/timeline;
- comparison → aligned views;
- causality → meaningful variable/state manipulation;
- concurrency → lanes/ordered events;
- implementation → focused code/API/config anchor.

For every proposed interaction, state internally:

> Changing/choosing **X** makes relationship **Y** observable.

If that sentence is weak or false, remove the interaction and use a simpler explanation.

Prefer learner-controlled stepping over cinematic autoplay for temporal processes.

**Output:** representation + interaction plan.

### Stage 5 — Generate the source project

Read `references/technical-architecture.md`.

Create a source project with:

```bash
node <skill-root>/scripts/scaffold-course.mjs --target <course-dir> --title "<course title>"
```

Then replace the starter content with the actual course.

Technical defaults:

- React + TypeScript + Vite
- React Router `HashRouter` for chapter-like navigation when routing is useful
- plain CSS/CSS Modules and system fonts
- React-authored SVG for important diagrams
- React state primitives first; no speculative state library
- no runtime fetch of local data
- no CDNs, analytics, Google Fonts, remote images, or external runtime assets
- no required browser persistence; `localStorage` may be best-effort only
- no BrowserRouter
- avoid Web Workers/WASM unless the course genuinely needs them

The generated project must include:

- `README.md` with a short build/run section;
- `package.json` where `npm run build` creates **and verifies** the single-file HTML release;
- `course-brief.json` recording audience, scope, time budget, desired capabilities, source identifiers/revision when available, and generation context;
- no `node_modules/` or compiled output in the deliverable ZIP.

Do not let the starter template dictate the instructional design. It exists only to remove repetitive engineering setup.

**Output:** ready-to-build source project.

### Stage 6 — Validate and package the source ZIP

Do **not** assume npm registry/network access exists in the agent runtime.

Run source validation:

```bash
node <skill-root>/scripts/validate-course-source.mjs <course-dir>
```

Then package the deliverable:

```bash
python <skill-root>/scripts/package-course.py <course-dir> <output-zip>
```

The package script must exclude `node_modules/`, compiled `dist*` directories, caches, OS/editor junk, and VCS metadata.

If the execution environment already has compatible dependencies and network/tooling is available, an optional local `npm install && npm run build` may be used as extra confidence, but **it is not required for successful course generation** and must never block the default ZIP deliverable merely because npm registry access is unavailable.

**Output:** validated ready-to-build source ZIP.

### Stage 7 — Instructional quality gate

Read `references/quality-rubric.md` and review the finished source course.

At minimum verify:

- required path fits the Course Brief's budget;
- desired capabilities are actually practiced, not merely mentioned;
- learner is not retaught prerequisites they already know;
- the first useful mental model arrives early;
- course stays whole → part → whole rather than fragmenting into unrelated pages;
- interactions expose causality/structure rather than decorative activity;
- important feedback explains why;
- main path is not overloaded with edge cases;
- exactness is available through optional depth/reference where needed;
- guidance fades before the final transfer task;
- final task resembles real developer reasoning;
- technical claims remain supported by the source material;
- the generated README/package scripts clearly explain how to build the final single HTML locally.

Do not add content merely to make the course look comprehensive.

**Output:** quality-gated course source package.

### Stage 8 — Return the result

Default user-facing deliverable:

- one ready-to-build **source ZIP**;
- a short note with intended audience, approximate required-path duration, and the local build command.

Do not require the agent runtime itself to install npm dependencies or compile the final HTML.

When the surrounding framework provides an explicit persistence option (for example a `--save` command flag), return the ZIP to that caller for persistence. Do not invent a separate storage location from inside this generic skill.

## Source-grounding rule

When supplied materials define the system being taught, those materials are the authority. Preserve their terminology and settled behavior.

If a claim needed for the course is not supported:

- omit it when nonessential;
- mark it as unknown when useful;
- ask the user only when it blocks a required learning outcome.

Do not silently fill gaps with generic industry assumptions.

## Spike error policy

Handle only:

- missing required preparation fields;
- unresolved high-impact ambiguity after the preparation pass;
- invalid/over-limit time budgets;
- missing source material when the subject cannot be inferred;
- invalid source-project structure;
- source ZIP packaging failures;
- unsupported claims that block the main learning path.

Do not build elaborate recovery systems for rare authoring failures.

## References

Read only the references required by the current stage:

- `references/intake-and-course-brief.md`
- `references/scope-and-time-budget.md`
- `references/methodology.md`
- `references/instructional-patterns.md`
- `references/visual-and-interaction-patterns.md`
- `references/technical-architecture.md`
- `references/quality-rubric.md`

## Bundled tools

- `scripts/validate-course-brief.mjs` — validates required intake fields and 14-day ceiling.
- `scripts/scaffold-course.mjs` — copies the reusable React/Vite course starter.
- `scripts/validate-course-source.mjs` — validates required source-project/build-contract files without npm/network access.
- `scripts/package-course.py` — creates the clean source ZIP while excluding dependencies/build outputs/junk.
- `scripts/validate-skill.py` — lightweight Agent Skills frontmatter/package validation for maintainers.
