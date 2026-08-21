# Tracking and Execution Freedom

DSF does not prescribe one implementation method. A team may use feature branches, worktrees, external trackers, manual coordination, coding agents, IRS, or the optional Delivery CLI.

Do not mutate Delivery Definition files merely to record progress, assignment, blockers, Review stage, Remediation state, Git heads, or evidence paths. Runtime state belongs in the chosen external record system.

A normal serial scheduler should strongly prefer a ready Milestone Review before starting another ordinary Phase. The user may still choose to continue independent Phase work. Already-active work is not interrupted solely because a Review became ready.

If several independent Reviews are ready, use authored `milestoneOrder`, then stable Milestone ID, as deterministic scheduling order. This order does not create dependency edges.

Reference stable `M-*`, `P-*`, `M-*::REVIEW`, and `M-*::FIX-*` identities in external state. The optional Delivery CLI may add stronger lifecycle/Git governance, but its absence does not make the Definition incomplete.
