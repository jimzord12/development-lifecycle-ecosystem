# Proposal: IRS Default Router Invocation

**Status:** discussion draft only. Not an accepted contract. Not an implementation brief.

**Audience:** design agent + human design authority

**Date:** 2026-08-21

**Location:** [`docs/proposals/irs-default-router-invocation.md`](./irs-default-router-invocation.md)

**Related published authority:**

- [DLE Component Standard V1](../standards/dle-component-standard-v1.md)

If this proposal conflicts with a published standard, the published standard wins until an explicit refinement or new standard generation is accepted.

---

## 1. Why this exists

The Implementation Record System (IRS) is intended to let a capable agent resume an implementation run from durable workspace state without relying on prior chat history. Its main skill is a router: a specific implementation situation selects a small operation-specific playbook.

That model is clear when the user names an operation such as `implement-phase`, `review-milestone`, or `migrate-run`. It is less deterministic when a fresh agent is started inside an implementation workspace and the user invokes only the IRS skill, with no operation or additional request.

Loading the router gives the agent the available operations, but it does not necessarily tell the agent whether it should:

- inspect the current run and recommend the next action;
- ask the user to choose a playbook;
- resume active work;
- begin mutating run state; or
- search for a different run.

A capable agent may infer the right answer from `implementation-record/RUN.md`, the Progress Tracker, the local environment binding, and the Portable Implementation Package (PIP). That inference should not depend on agent personality or hidden chat context.

## 2. Decision to discuss

Add a small **default invocation contract** to the IRS router. When IRS is invoked without a specific operation or execution request, it performs bounded, read-only orientation of the current workspace and returns the single next safe action supported by durable run state. It does not start implementation, mutate IRS state, change the PIP, or perform Git operations.

The default belongs in the IRS router rather than in a separate “next-action advisor” skill because selecting the correct IRS operation is routing responsibility. The operation-specific playbooks remain the owners of execution behavior.

## 3. Invocation boundary

The default contract applies when all of the following are true:

1. IRS was explicitly invoked, or the user clearly asked IRS to inspect a run and determine what should happen next.
2. The user did not name an IRS operation.
3. The user did not explicitly request execution, mutation, migration, review, initialization, or session shutdown.

Examples that should use the default:

```text
$implementation-record-system
```

```text
Use IRS and tell me what should happen next.
```

Examples that are not default invocations:

```text
Use IRS migrate-run with this rollout.
```

```text
Use IRS to continue P-004.
```

```text
Finish this IRS session and make the handoff durable.
```

Specific user intent always takes precedence over default routing.

## 4. Proposed read-only orientation

The default invocation should perform the smallest bounded orientation needed to identify the run and its next safe action:

1. Locate the implementation workspace's `implementation-record/RUN.md` using path-independent workspace discovery.
2. Read `RUN.md`, the latest Progress Tracker, and the machine-local environment binding it identifies.
3. Read the installed IRS component identity and the minimum PIP/Delivery metadata needed to validate the recorded package identity and derive work readiness.
4. Detect incomplete IRS migration before considering normal run work.
5. Validate that recorded paths, package identity, stored-state version, active work, and referenced durable artifacts are sufficiently coherent for a recommendation.
6. Consult only the smallest operation-specific playbook needed to derive the recommendation.
7. Report the result without mutating any file or external system.

The orientation must not recursively audit repositories, load every design artifact, run tests, inspect unrelated worktrees, or reconstruct detailed implementation history merely to answer “what next?”. Deeper context belongs to the selected operation after the user requests execution.

## 5. Proposed routing precedence

The router should use durable state and accepted component contracts, not conversational preference. The first applicable condition wins:

1. **Incomplete IRS migration:** recommend resuming `migrate-run`. Normal IRS mutations remain unavailable until migration is resolved.
2. **Run cannot be identified safely:** if zero or multiple plausible runs are found, report the candidates or absence and ask the user to select or initialize; do not guess.
3. **Invalid or relocated local binding:** recommend the minimum adoption/binding repair path, normally `adopt-run`, when the shared run is coherent but machine-local paths are not.
4. **Unreconciled PIP identity:** recommend `reconcile-package` when the recorded run and supplied/current PIP differ semantically. A simple machine-path change is not package reconciliation.
5. **Active Design Gap:** recommend `resolve-design-gap` for the affected active work item.
6. **Active Milestone Review or Remediation:** recommend `review-milestone` and identify the active Review/Remediation.
7. **Active Phase:** recommend `implement-phase` and identify the Phase to resume.
8. **Ready Milestone Review:** recommend `review-milestone` before starting a later dependency-ready Phase when the accepted IRS/Delivery contract gives that Review precedence.
9. **Dependency-ready Phase work:** recommend `implement-phase` and identify the next Phase derivable from accepted dependency/scheduling truth.
10. **Delivery complete:** report that no implementation or Review work remains under the current package state.

If accepted authority permits several equally ready choices and does not define priority, the router must present the bounded alternatives and ask the user. It must not invent product priority, graph edges, scheduler order, or Design/Delivery authority.

## 6. Output contract

The default response should be short, inspectable, and sufficient for a user to authorize the next operation. A conceptual shape is:

```text
IRS orientation
Run: <run-id or unresolved>
IRS: <component version / stored-state version>
Package: <recorded identity and validation result>
Current work: <active item or none>

Recommended next action: <playbook> — <work item if applicable>
Why: <durable-state basis for the recommendation>
Ready alternatives: <none or bounded list>
Needs user decision: <none or exact question>
Mutation performed: no
```

Exact presentation is delegated, but these semantic facts should remain visible:

- which run and package were inspected;
- whether orientation found a safety/compatibility problem;
- the recommended IRS operation and work item;
- why that action follows from durable authority;
- any equally valid alternatives or missing decision; and
- an explicit statement that default orientation performed no mutation.

Do not bury ambiguity behind a confidence score. Report the concrete missing or conflicting fact.

## 7. Safety and authority boundaries

Default invocation is advisory and read-only.

It must not:

- create or initialize a run;
- change the Progress Tracker, Evidence Store, environment binding, PIP, or repositories;
- start a Phase, Review, Remediation, migration, adoption, or reconciliation;
- resolve a Design Gap;
- run `finish-session` merely because the current prompt is ending;
- create commits, branches, worktrees, or remote changes;
- select among genuinely equal work items without accepted priority; or
- reinterpret an invalid run into a plausible one.

The user may authorize execution in a follow-up request. That request routes to the selected playbook, which re-reads and revalidates current state before any mutation under its normal contract.

## 8. Skill discovery wording

If this behavior is accepted, the IRS skill description should explicitly include language equivalent to:

> Inspect an implementation run and determine, choose, or recommend the next safe IRS work item.

This makes natural requests such as “what should happen next in this implementation run?” eligible for IRS discovery. Explicit bare invocation must still work even when automatic skill selection is not involved.

The description should remain concise and should not imply that default invocation executes the recommendation.

## 9. Non-goals

This proposal does not add:

- a new first-class DLE Component;
- a second IRS advisory skill;
- a general project manager or product-priority engine;
- a replacement for operation-specific IRS playbooks;
- a mandatory DLE runtime or dispatcher;
- a new Progress Tracker field or stored-state schema version;
- automatic recovery from corrupted or ambiguous state;
- repository-wide implementation reconnaissance; or
- authority to begin work from a bare skill invocation.

The change is deliberately a router default, not an orchestration subsystem.

## 10. Evaluation cases

Before acceptance as released IRS behavior, evaluate at least these fresh-agent cases without prior chat context:

1. **One valid run, no active work, one ready Milestone Review** — recommend that Review and make no mutation.
2. **One valid run with an active Phase** — recommend resuming that Phase through `implement-phase`.
3. **One valid run with an active Review/Remediation** — recommend `review-milestone` with the active item.
4. **Incomplete migration** — recommend `migrate-run` before normal work.
5. **Recorded PIP differs from the current PIP** — recommend reconciliation and identify the mismatch without changing either package.
6. **Relocated run with invalid local paths** — recommend the adoption/binding path without rewriting shared state.
7. **No run** — explain that no run was found and ask whether the user wants initialization; do not create one.
8. **Multiple plausible runs** — list bounded candidates and ask the user to select one.
9. **Several equally ready Phases with no accepted priority** — present the alternatives instead of choosing arbitrarily.
10. **Completed Delivery** — report completion and no next IRS work.
11. **Explicit operation supplied** — bypass the default and route directly to the requested playbook.

Structural validation should also confirm that a released IRS distribution contains the router, every referenced playbook, component identity, Public Contract documentation, and any evaluation fixtures declared public by the component.

## 11. Compatibility and versioning

The proposal changes router behavior visible to users and agents but does not require a Progress Tracker schema change. If IRS `1.3.0` is established as the accepted upstream baseline, the accepted default-invocation contract would normally be a backward-compatible public-contract addition and therefore an IRS `1.4.0` change under DLE Component Standard V1.

An IRS `1.4.0` rollout could retain stored-state version `3` if no separate accepted change alters the tracker schema. Consumers would still upgrade the installed IRS component through the component's rollout/migration path so component identity and distributed files remain coherent; no state transformation is implied solely by this proposal.

## 12. Bootstrap and acceptance path

IRS is not yet materialized in this repository as a first-class package. Therefore this proposal must not be implemented by patching a consumer-installed skill and later treating that copy as upstream truth.

Recommended acceptance sequence:

1. Reconcile and materialize the accepted framework-generic IRS baseline under `packages/implementation-record-system/` with its `dle-component.json`, README Public Contract, router, playbooks, and deterministic validation surface.
2. Review this proposal against that imported baseline and resolve any conflicts with newer accepted IRS contracts.
3. If accepted, promote the substance into the IRS Public Contract, router instructions, and evaluation/validation material.
4. Assign the resulting IRS component version according to the final public-contract diff.
5. Produce a self-contained rollout from the canonical component source.
6. Upgrade installed consumer copies through the supported IRS rollout path.

The proposal remains discussion history. Released behavior is owned by the promoted component contract and release, not by this file.

## 13. Open questions for design acceptance

1. What exact bounded search rule should locate `implementation-record/RUN.md` without scanning unrelated directories?
2. Should a natural-language request such as “continue the implementation” authorize execution, or should IRS first return the advisory result unless an operation/work item is explicit?
3. Which accepted IRS or Delivery rule establishes ready Milestone Review precedence over a later ready Phase, and how should equal ready items be presented?
4. What minimum validation distinguishes a relocated local binding from an unreconciled PIP identity?
5. Which fresh-agent evaluations are release gates versus informative assurance checks?

These questions should be answered from the reconciled IRS/DSF contracts. Do not invent answers merely to close the proposal.

## 14. Human meta-intent

> A user should be able to start a fresh capable agent inside one implementation workspace, invoke IRS with no arguments, and receive the next safe, authority-backed action without re-explaining the run. That convenience must remain read-only, must expose ambiguity honestly, and must not turn the router into an execution engine.
