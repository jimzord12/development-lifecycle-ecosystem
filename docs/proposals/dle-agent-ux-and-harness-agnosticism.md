# Proposal: DLE agent UX and harness agnosticism

**Status:** `implementation-ready`  
**Decision authority:** repository owner; accepted in the 2026-08-21 design discussion  
**Last reconciled against:** `main@1924d05f036dfc26bc1435459208ecaf3c2c714e`  
**Depends on:** [`DLE Component Standard V1`](../standards/dle-component-standard-v1.md), [`DLE CLI Standard V1`](../standards/dle-cli-standard-v1.md), current DWF Protocol 031, current IRS 1.3.0  
**Supersedes:** the harness/agent-UX portions of the removed `co-located-project-dle-namespace.md` draft  
**Affected contracts/components:** DLE-wide agent conventions, DWF, IRS, repository release/version summaries

## Summary

Make the current DLE surfaces provider-, model-, and modern-harness-agnostic with the smallest justified refactor. Define three lightweight model capability profiles, make the coding agent the plain-language translation layer between DLE and the user, remove hard dependencies on one harness's instruction filename or orchestration terminology, and add a bounded portability check. Do not create an adapter framework, capability matrix, mandatory user profile, or model configuration subsystem.

This proposal is intentionally narrow. It does not redesign project instances, Portable Implementation Packages, DWF persistence, IRS package identity, component distribution, or the DLE Host CLI.

## Baseline and compatibility target

DLE remains **agent-first**. Harness agnosticism means that reusable DLE contracts must not require one provider, named model, coding-agent product, directory convention, orchestration API, or novel parallel-agency feature. It does not mean DLE must operate without a capable coding agent.

DLE targets modern coding-agent harnesses that can normally:

- read and modify files;
- inspect and edit repositories;
- execute commands and tests;
- reason over substantial project context; and
- delegate bounded work to sub-agents.

Primitive or obsolete harnesses are outside the compatibility target. Deep parallel agency, persistent autonomous workers, provider-specific reasoning controls, and similar newer features are optional and must not become DLE requirements.

Historical records and concrete integration examples may retain the real product, provider, harness, and model names that were used. This proposal changes reusable normative surfaces, not history.

## DLE Agent Conventions V1

Create one small normative document at:

```text
docs/standards/dle-agent-conventions-v1.md
```

It must define the following conventions without introducing runtime machinery.

### Model capability profiles

The stable profile names are:

| Profile         | Meaning                                                                                                                      | Typical use                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Intelligent** | The strongest suitable model available in the current harness.                                                               | Difficult architecture, ambiguous or cross-cutting work, high-risk changes, major Design Gaps, and final senior review. |
| **Balanced**    | A capable general-purpose model with a practical quality/speed balance. It is the conceptual default when a profile matters. | Ordinary implementation, review, analysis, and documentation.                                                           |
| **Fast**        | A faster or cheaper suitable model for bounded work.                                                                         | Mechanical, deterministic, repetitive, or low-risk tasks.                                                               |

These are relative capability labels. They are not fixed benchmark thresholds, providers, model families, reasoning-effort values, worker identities, or permanent agent roles.

Normative interpretation:

> “Use an Intelligent agent” means: use an agent or sub-agent running the strongest suitable model available in the current harness.

Most DLE instructions should not mention a profile. Add a recommendation only when model capability materially affects the expected result. A profile recommendation must not imply that a separate long-lived worker type exists.

Profile mapping precedence is:

1. explicit user instruction;
2. existing user or harness configuration;
3. the Main Agent's best judgment from the models available in the current harness.

DLE must not require a profile-mapping file. Named models and provider-specific controls may appear in user/harness configuration, but not as reusable DLE requirements.

### Agent-mediated user experience

The coding agent is the normal user-facing DLE layer. No separate UX application or adapter layer is introduced.

A conforming DLE-facing agent must:

- accept ordinary goal-oriented language rather than require formal DLE command vocabulary;
- translate the user's request into the appropriate component, playbook, CLI operation, or documented procedure;
- locate and read the relevant entrypoint before acting;
- explain DLE terminology briefly and in context only when it matters to the current decision;
- avoid beginning with a framework lecture or requiring the user to study a glossary;
- use existing harness-level user preferences, standing instructions, or memory when available;
- use project-local collaboration guidance for project-specific preferences;
- use reasonable defaults when neither exists; and
- involve the user when product/architecture authority, destructive authorization, a meaningful trade-off, or genuinely missing information requires a decision.

Formal commands remain legal precision tools. They are not a prerequisite for effective use.

Examples of normal user requests that an agent should translate:

```text
What should I work on next?
Review the completed milestone.
Something in the package design is wrong.
Prepare the next implementation phase.
```

### Harness instruction surfaces

Reusable DLE instructions must describe the semantic destination rather than require one harness filename.

Use wording equivalent to:

> Add or reconcile the required guidance in the parent agent-instruction surface supported by the current harness, such as `AGENTS.md`.

`AGENTS.md` may remain the repository's own coding-agent instruction file and may appear as a concrete example. It must not be described as the only valid instruction surface for DLE consumers.

### Minimal-refactoring rule

Implementation must be audit-driven:

- scan current reusable normative DLE surfaces for actual provider, named-model, harness, directory, command, API, and orchestration coupling;
- change only accidental coupling;
- keep generic concepts such as Main Agent, fresh context, sub-agent, command execution, and filesystem access;
- keep legitimate provider/harness examples clearly labelled as examples or integration notes; and
- leave historical provenance untouched.

Do not add adapters, capability matrices, harness profiles, fallback frameworks, mandatory user profiles, or feature-negotiation metadata. Required-capability metadata may be proposed later if a real need appears.

## Required component changes

### DWF

Update both canonical copies of the DWF protocol together:

```text
packages/dwf/WORKSPACE-PROTOCOL.md
packages/dwf/templates/starter/WORKSPACE-PROTOCOL.md
```

They must remain byte-identical after the change.

The new protocol revision must:

- reference DLE Agent Conventions V1;
- state the plain-language-first, progressive-disclosure, agent-routing behavior in a concise DWF-appropriate section;
- use provider- and harness-neutral normative language;
- preserve existing DWF commands and formal vocabulary as optional precision interfaces; and
- avoid duplicating the complete model-profile definitions.

Release identity updates:

- Workspace Protocol: `031` → `032`;
- DWF component: `0.1.0-local.32` → `0.1.0-local.33`;
- update `packages/dwf/README.md`, `packages/dwf/dle-component.json`, `packages/dwf/templates/starter/README.md`, and every repository-owned version/protocol summary that encodes those values.

Do not change DWF persistence, Workspace ZIP behavior, session lifecycle, PIP semantics, or command semantics in this proposal.

### IRS

Apply the following narrow changes:

1. In `packages/implementation-record-system/references/initialize.md`, replace the hard requirement to update a parent `AGENTS.md` with the harness-supported parent agent-instruction surface wording defined above.
2. In `packages/implementation-record-system/references/review-milestone.md`, annotate the **Main Review Agent** with:

   ```text
   Recommended model profile: Intelligent
   ```

   The recommendation applies to the agent responsible for the final Milestone judgment. Testing, capability, and simplification helpers need no explicit profile unless their bounded assignment independently justifies one.

3. Reference DLE Agent Conventions V1 from the IRS Public Contract or router guidance at the smallest stable surface that makes the recommendation interpretable without copying the standard.
4. Preserve the current Review stages, specialist responsibilities, fresh-context behavior, and lack of a concurrency requirement.

Release identity updates:

- IRS component: `1.3.0` → `1.3.1`;
- Progress Tracker state remains `3`;
- no state migration is introduced;
- update `packages/implementation-record-system/README.md`, `dle-component.json`, and every repository-owned release/version summary that encodes the component version.

The patch release is a compatible correction/clarification plus model-profile guidance. Do not combine the separate default-router proposal into this release unless that proposal is independently promoted to `implementation-ready`.

### DLE repository documentation

- Add DLE Agent Conventions V1 to the root README's Standards section.
- Update the root component-version summary for the DWF and IRS releases above.
- Update repository agent guidance only where needed to keep public reusable material aligned; do not treat the root `AGENTS.md` filename itself as a portability defect.
- Add focused release notes or Changesets only where the repository's existing release machinery actually requires them. Do not invent a package release for Markdown-only components.

## Non-goals

This proposal does not add or change:

- project-instance layout or same-team consumption;
- DWF Topics or direct-on-disk persistence;
- PIP, Amendment, or Design Gap semantics;
- IRS package identity or tracker schema;
- Host CLI, component composition, distribution, or installation;
- a general agent adapter API;
- a harness compatibility certification matrix;
- support for weak/legacy harnesses;
- a mandatory model mapping file;
- a mandatory DLE user profile;
- provider-specific reasoning-effort controls; or
- DSF's Milestone Review contract. DSF remains model-neutral and continues specifying required outcomes.

## Implementation sequence

1. Add DLE Agent Conventions V1 and link it from the repository README.
2. Perform the targeted static audit and record every actual reusable coupling found.
3. Apply the DWF protocol/document/version changes and synchronize the starter copy.
4. Apply the IRS initialization/review/document/version changes.
5. Update repository version summaries and any required release metadata.
6. Run formatting and the full repository validation contract.
7. Perform the portability acceptance checks below.

Do not broaden scope because a historical or clearly example-scoped provider name is found.

## Acceptance criteria

The implementation is complete only when all of the following are true:

1. `pnpm validate` passes.
2. The two DWF protocol copies are byte-identical and both report Protocol 032.
3. DWF README, manifest, starter README, and root summaries consistently report `0.1.0-local.33` / Protocol 032.
4. IRS README, manifest, and root summaries consistently report `1.3.1`; tracker state remains `3` and no migration was added.
5. A repository scan finds no accidental provider, named-model, or harness-specific requirement in reusable normative DLE surfaces. Legitimate historical records, repository-local instructions, and labelled examples are documented as exclusions rather than rewritten.
6. No reusable instruction requires `AGENTS.md` specifically; example usage remains allowed.
7. The three model profiles are defined once, with the semantics and mapping precedence in this proposal.
8. Milestone Review recommends `Intelligent` only for the Main Review Agent and does not require a named model or concurrency feature.
9. A fresh capable agent without relevant chat history can orient from each changed component's documented entrypoint, explain the current state and next action in normal language, and correctly route one representative operation.
10. The same agent can map `Intelligent`, `Balanced`, or `Fast` to models available in its harness without a DLE mapping file.
11. Before public release, one bounded smoke test on a second modern coding-agent harness is recorded as portability evidence. This is evidence, not the start of a compatibility matrix.

## Open questions

None that block implementation. Any newly discovered coupling that would require adapters, capability negotiation, schema changes, or a wider product redesign must be reported as a separate proposal rather than absorbed into this change.

## Promotion record

Not implemented.
