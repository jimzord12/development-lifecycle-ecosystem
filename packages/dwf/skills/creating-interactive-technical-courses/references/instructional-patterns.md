# Instructional Pattern Library

Use these patterns selectively. They are tools, not mandatory lesson components.

## 1. Minimal frame → attempt

**Use when:** the learner already has enough neighboring knowledge to form a reasoned expectation.

**Pattern:** brief context → prediction/choice → visible outcome → explanation.

**Avoid when:** the answer depends on a rule the learner has never been shown.

## 2. Concise worked trace

**Use when:** the mechanism has high interacting complexity or the learner lacks enough basis for productive prediction.

Show:

- initial state;
- event/action;
- intermediate states;
- final state;
- reason for non-obvious transitions.

Then reduce annotations in later traces.

## 3. Scenario → invariant → changed scenario

**Use when:** the learner might overfit to one concrete story.

After the scenario, explicitly state the portable rule. Then change one surface detail and ask whether the rule still applies.

## 4. Aligned comparison

**Use for:** confusable concepts/modes.

Keep the visual coordinate system stable and highlight only semantic differences.

Examples:

- normal vs recovery;
- push vs pull;
- old vs new design;
- transient vs permanent failure;
- authority vs replica.

## 5. One-variable variation

Change one meaningful condition before composing multiple changes.

Good sequence:

```text
normal request
→ same request with lost acknowledgement
→ same request with duplicate retry
→ later combine with another mechanism
```

## 6. Revealing failure

Use a failure when it makes a mechanism's necessity obvious.

Pattern:

```text
canonical behavior
→ perturb one assumption
→ observe failure
→ expose preserving mechanism/invariant
```

Do not teach every error code.

## 7. Guidance fading

Plan removal of assistance.

Example:

```text
annotated trace
→ partially prompted trace
→ unprompted changed case
→ authentic debugging/review task
```

If the final task still tells the learner which mechanism to use, guidance has not faded enough.

## 8. Retrieval through reuse

Prefer reusing a mechanism later inside another task over inserting frequent quiz screens.

Ask for relationships that matter at work:

- who owns this state?
- what happens next?
- why is retry safe?
- which invariant rejects this proposal?

## 9. Optional precision

Keep exact payloads, schemas, rare edge cases, long code, and historical rationale one action away when valuable.

Never hide a core condition in optional depth if the simplified main-path rule would otherwise be false.

## 10. Code anchor

Use code/API/config to connect the mental model to implementation.

Show the smallest real slice that grounds the concept. Suppress unrelated framework boilerplate.

Return visually/conceptually to the system model afterward.

## 11. Debug/repair transfer

A strong end task often presents:

- observed symptom;
- partial system state/log/trace;
- realistic constraints;
- no label saying which concept is being tested.

Ask the learner to identify responsibility, predict behavior, or evaluate a fix.

## 12. Quiet explanation

Sometimes the best interaction is no interaction.

If two sentences plus a diagram communicate a low-complexity fact accurately, do that and move on.

Active cognition matters; physical clicking does not.

## Anti-patterns

### Decorative clicking

If the click only reveals text that could have been visible without harming comprehension, it is probably navigation, not learning.

### Giant production diagram first

Orient with the whole, but simplify it. Do not make the learner decode every implementation component before knowing what matters.

### Passive long animation

Temporal processes should normally be step/pause/replay controlled.

### Incorrect / Try again

Explain the violated assumption/invariant or point to the first divergence.

### Unstructured sandbox too early

Constrain degrees of freedom until the learner has a usable model.

### Edge-case avalanche

Protect the canonical schema. Secondary exceptions belong in deep dives/reference.

### Artificial content locking

Experienced developers should be able to inspect/review material freely while following a recommended path.

### Game mechanics masquerading as learning

Progress is useful. XP, streaks, badges, currencies, and leaderboards are not default instructional requirements.
