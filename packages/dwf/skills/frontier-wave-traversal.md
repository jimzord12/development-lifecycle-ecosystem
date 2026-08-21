# Skill — Frontier Wave Traversal

Skill version: 001

## Purpose

Use this skill whenever a Design Session is running with Design Pace `FAST`.

**Frontier Wave Traversal** is the accelerated decision-processing mechanism for one current conceptual branch. It reduces human round trips by processing the branch breadth-first in bounded waves while preserving the same canonical truth, decision classification, factual-unknown, lifecycle, and integrity rules as NORMAL pace.

FAST changes interaction throughput, not design authority in general. Its only additional authority is the bounded `AUTO` delegation explicitly granted when the user selects FAST.

## Core Model

Treat the current Design Session as owning one conceptual branch boundary.

- **Visible leaves** — immediately noticeable decision/question candidates exposed by the branch's current settled state.
- **Actionable frontier** — visible leaves whose prerequisites are sufficiently settled and that remain inside the current conceptual branch.
- **Wave** — one breadth-first layer of the current branch. Descendants exposed by settling leaves belong to a later wave.
- **Fast Decision Packet** — one user-facing batch from the current wave containing at most **5 leaves**.

If one wave requires more than 5 leaves to be surfaced or processed, split that same wave into multiple packets of at most 5. The hard cap applies to the leaves assigned to each packet, regardless of classification. Do **not** advance to descendant leaves until every leaf in the current wave has a disposition.

## Leaf Classifications

Every visible leaf receives one of these handling classifications.

### `AUTO`

The agent settles the leaf under FAST's bounded delegated authority and surfaces the decision plus a concise reason.

Use `AUTO` only when all of the following are true:

- the answer is strongly implied by accepted context/decisions or is the clearly standard/simple option;
- no credible competing choice creates a meaningful product or architectural tradeoff;
- the choice is local, low-risk, and reasonably reversible;
- it does not reopen, weaken, or contradict accepted `D-*`, `TD-*`, PRD, or SPEC truth;
- it does not depend on an unresolved factual `OQ-*`, guessed repository fact, or unclear external authority;
- it does not cross into a genuinely different conceptual branch;
- its downstream blast radius is limited enough that an incorrect choice can be corrected without invalidating a large decision subtree.

A surfaced AUTO conclusion counts as settled unless the user overrides it before `Checkpoint` / `Park` / `Finalize`. AUTO is never silent. When AUTO would create a stable `D-*` or `TD-*`, the eventual ledger write still happens only through the normal persistence/finalization lifecycle.

If any AUTO criterion is doubtful, use `PACKET`, `DEFER`, or `BRAKE` instead.

### `PACKET`

A meaningful decision that is safe to evaluate in the current wave and has a strong enough recommendation to batch with sibling leaves.

For each PACKET leaf:

- state the decision question compactly;
- give the recommended choice;
- give the main tradeoff or reason;
- let one user response accept, reject, or modify several PACKET leaves together.

A PACKET leaf does **not** become settled merely because it was presented. It requires user disposition.

### `DEFER`

A visible leaf that should not be decided in the current packet/wave.

Use `DEFER` when, for example:

- a prerequisite decision is not settled yet;
- an authoritative external/domain fact is required (`OQ-*`); do not guess it;
- the leaf belongs to a genuinely different conceptual branch or future Design Session;
- the leaf is important but not yet actionable from the current branch state.

Record the defer reason briefly. Continue unaffected siblings when safe. A DEFER leaf never counts as settled.

### `BRAKE`

A decision that is inside the current branch and actionable enough to discuss, but unsafe to accelerate.

Use `BRAKE` when one or more of these apply:

- the decision would reopen or materially reinterpret accepted truth;
- credible competing directions have materially different product/architecture consequences;
- the choice is high-blast-radius, difficult to reverse, or would constrain many downstream leaves;
- the available context is contradictory or product/technical authority is unclear;
- the decision is cross-cutting enough that batching would hide important reasoning;
- uncertainty at this leaf contaminates the branch root or several sibling/descendant decisions.

Handle an isolated BRAKE leaf with NORMAL-style one-question discussion while unaffected siblings may continue when independence is clear. If the BRAKE affects the branch root or multiple downstream leaves, pause frontier advancement until it is resolved. After resolution, FAST remains selected unless the user turns it off.

## Traversal Algorithm

1. **Establish the branch boundary.**
   Reconstruct the selected Design Session's goal, accepted constraints, settled decisions, continuation state, and relevant factual unknowns. Do not broaden the session simply because FAST is enabled.

2. **Discover the immediate visible leaves.**
   Look only far enough ahead to identify questions directly exposed by the current settled state. Do not recursively pre-solve descendants whose premises depend on unsettled leaves.

3. **Classify the leaves.**
   Assign `AUTO`, `PACKET`, `DEFER`, or `BRAKE` using the rules above. When unsure, choose the more conservative classification.

4. **Apply brakes/deferments safely.**
   Capture DEFER reasons. Determine whether any BRAKE is isolated or blocks the branch frontier.

5. **Build the current wave packets.**
   Group the current-wave leaves coherently, with a hard maximum of **5 leaves per Fast Decision Packet** regardless of classification. Prefer semantic coherence over filling every packet to five. Isolated BRAKE handling may occur outside the packet flow when it must be discussed NORMAL-style.

6. **Surface the wave.**
   - Announce AUTO decisions concisely with their reasons.
   - Present PACKET leaves with recommendations/tradeoffs.
   - Mention relevant DEFER/BRAKE disposition without burying the actionable packet.
   - Make leaf labels stable within the current wave when useful (`L1`, `L2`, etc.) so the user can say things such as `accept all except L3` or `deep dive L2`.

7. **Apply the user's disposition.**
   Accept/reject/modify PACKET leaves exactly as instructed. Treat corrections to AUTO as overrides, not resistance to FAST. If the user requests a deep dive on one leaf, use NORMAL-style discussion for that leaf while retaining FAST for the session unless explicitly disabled.

8. **Finish the whole current wave.**
   When a frontier required multiple packets because it exceeded five leaves, process all of those same-wave packets before deriving descendants.

9. **Recompute the frontier.**
   Only after the current wave has dispositions, identify newly exposed descendant leaves that remain within the branch and begin the next wave.

10. **Stop at the conceptual branch boundary.**
    Capture genuinely different branches as future work under the normal session/branching rules. FAST is not permission to recursively solve the whole project tree.

## Quality and Integrity Invariants

FAST must preserve all NORMAL guarantees unless this skill explicitly defines the bounded AUTO exception:

- canonical file ownership and source-of-truth priority;
- `D-*` versus `TD-*` classification;
- Technical Decisions remain subordinate to product truth;
- stable decision IDs, reopening, and supersession rules;
- unresolved factual `OQ-*` values are never guessed;
- Activation Gates and Design Session boundaries;
- checkpoint, park, and finalize semantics;
- canonical PRD/SPEC correctness;
- normalization, integrity validation, versioning, and packaging rules.

FAST never applies to Workspace Orientation, Maintenance / Audit Mode, checkpoint/park mechanics, finalization mechanics, normalization, integrity validation, versioning, or packaging.

## Preferred User-Facing Shape

Keep a Fast wave compact. A useful shape is:

```text
Fast Wave N

AUTO
- L1 — <settled choice>. Reason: <why it safely qualifies>.

PACKET
- L2 — Recommend <choice>. Tradeoff: <main tradeoff>.
- L3 — Recommend <choice>. Tradeoff: <main tradeoff>.

DEFER
- L4 — <reason it cannot/should not be decided now>.

BRAKE
- L5 — Needs a focused discussion because <reason>.

Recommendation: accept L2-L3 / modify any leaf by label.
```

Use only the sections that actually occur in that wave. Do not add ceremony merely to display the classification system.
