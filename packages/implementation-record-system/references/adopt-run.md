# Playbook — Adopt an existing run on this machine

Use when receiving/moving a PIP + IRS to another machine, checkout root, or repository layout. This is path rebinding, not package reconciliation.

## Steps

1. Read the tracker without changing history.
2. Validate the accompanying PIP against `authoritativePackage.current`.
3. Locate every logical repository and verify important recorded commits/branches/heads, including Phase, Review, Remediation, repair, and Milestone closure Git anchors when present.
4. Create/replace only `environment.local.json` with this machine's absolute paths.
5. Do not rewrite tracker history, evidence, `RUN.md`, package state, branches/commits, closure results, or token values merely because paths changed.
6. If commits/branches are missing, report the exact Git environment problem; never falsify tracker history.
7. Continue through `RUN.md` and the router after binding is valid.

`environment.local.json` is disposable during handoff. Portable state remains PIP + shared IRS.
