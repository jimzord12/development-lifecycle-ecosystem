# Phases, Foundations, and Dependencies

A **CAPABILITY** Phase is the default: one coherent independently verifiable observable outcome. A **FOUNDATION** Phase is justified only when a reusable Architectural Subsystem core must be established before several capabilities can consume it.

Every Phase must pass four Fitness checks: coherent outcome, coherent verification, bounded context, and manageable decomposition. Do not split work only to make tracking look smaller.

## Two dependency dimensions

Phase `dependsOn` edges control **implementation order**. They are real prerequisites and should preserve parallelism when work is independent.

Milestone `dependsOn` edges control **Review and closure order only**. They do not block the implementation of later Phases. A team may complete all Phases before running any Milestone Review, although DSF strongly recommends reviewing each ready Milestone near its natural boundary.

Each `M-XXX::REVIEW` has hard incoming edges from all Phases whose `milestoneId` equals that Milestone. It also waits for every prerequisite Milestone named by the Milestone's `dependsOn` to be `CLOSED`.

Do not invent a soft dependency type. A ready Review is a strong scheduling preference, not a fake Phase dependency.

Architectural Subsystems remain derived planning identities, not source-tree mandates. Governing design references are authority; supporting Concepts are explanatory only.
