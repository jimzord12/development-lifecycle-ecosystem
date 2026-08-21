# Proposals

`docs/proposals/` contains public, framework-generic design and implementation proposals for DLE itself.

A proposal is not automatically runtime authority. Published standards, component Public Contracts, schemas, fixtures, tests, and released code remain authoritative until the proposal is implemented and promoted into those surfaces.

## Lifecycle

Every proposal declares exactly one status:

| Status                 | Meaning                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `exploration`          | Early investigation. Boundaries or major decisions are still unresolved.                              |
| `design-draft`         | One coherent change is under design. It is reviewable but not yet authorized for implementation.      |
| `implementation-ready` | The human design authority accepted the proposal. A coding agent may implement it as written.         |
| `implemented`          | The accepted substance was promoted into authoritative standards, contracts, schemas, tests, or code. |
| `superseded`           | A newer proposal replaced this one.                                                                   |
| `rejected`             | The proposal was deliberately declined.                                                               |

Only the human design authority may promote a proposal to `implementation-ready`, `rejected`, or `superseded`.

`implementation-ready` authorizes implementation; it does not itself override released behavior. If an implementation-ready proposal conflicts with current authority, the implementer must update the named authority as part of the proposal or stop and report the conflict.

## Required metadata

Each proposal must state near the top:

- **Status**
- **Decision authority**
- **Last reconciled against**
- **Depends on**
- **Supersedes**
- **Affected contracts/components**

Use `none` when a field does not apply. Do not omit it.

## Authoring rules

- Keep proposals public and framework-generic. Do not include private company material, credentials, private repository identities, or project-specific implementation truth.
- Give each file one coherent design or implementation responsibility.
- Link the published standards and Public Contracts that constrain it.
- Preserve accepted decisions, but keep unresolved choices explicit.
- An implementation-ready proposal must include exact target surfaces, normative requirements, non-goals, compatibility/versioning expectations, and verifiable acceptance criteria.
- Do not copy an existing standard into a proposal. State the intended delta and point to the authority that will own the result.
- Do not leave two live proposals claiming ownership of the same behavior. Reconcile them, then supersede or remove the obsolete draft; Git history preserves it.
- Promotion to `implemented` must record where the accepted substance landed.

Use [`TEMPLATE.md`](./TEMPLATE.md) for new proposals.

## Current proposals

| Proposal                                                                      | Status                 | Scope                                                                                |
| ----------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| [Agent UX and harness agnosticism](./dle-agent-ux-and-harness-agnosticism.md) | `implementation-ready` | Minimal provider/harness cleanup, model profiles, and agent-mediated user experience |
| [Project instance consumption profile](./dle-project-instance-consumption.md) | `design-draft`         | Same-team project instance, authority layout, skills, and relationship to PIP        |
| [DWF project-instance mode](./dwf-project-instance-mode.md)                   | `design-draft`         | Topics and direct DWF persistence without Workspace ZIP transport                    |
| [IRS project-instance mode](./irs-project-instance-mode.md)                   | `design-draft`         | IRS operation against live instance design/Delivery truth rather than a PIP          |
| [DLE Host and distribution](./dle-host-and-distribution.md)                   | `design-draft`         | Umbrella CLI, curated distribution, composition, bootstrap, and OS support           |
| [IRS default router invocation](./irs-default-router-invocation.md)           | `design-draft`         | Read-only orientation and next-safe-action recommendation for bare IRS invocation    |
