# Visual and Interaction Patterns

## Governing test

Every interaction must have a sentence like:

> Changing/choosing **X** makes relationship **Y** observable.

If the relationship is vague, use a static/stepwise explanation instead.

## Representation taxonomy

| Information            | Default representation                       | Notes                                                          |
| ---------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| Topology               | stable node-edge map                         | Keep spatial positions stable while highlighting active paths. |
| State                  | state panels, snapshots, state machine       | Preserve before/after when comparison matters.                 |
| Sequence               | timeline/swimlanes/trace                     | Completed events stay visible.                                 |
| Causality              | dependency arrows + meaningful control       | Manipulate cause and expose consequence immediately.           |
| Comparison             | same-surface toggle or aligned side-by-side  | Preserve geometry; change semantics only.                      |
| Failure propagation    | canonical representation + fault marker/path | Inject one fault, then step through propagation/recovery.      |
| Concurrency            | lanes + shared state + event ordering        | Let learner step between meaningful interleavings.             |
| Implementation mapping | diagram + focused code/API/config            | Bidirectional highlight when useful.                           |

## Interaction taxonomy

### Predict/select

Mental operation: commit to expected result.

Best for:

- ownership;
- route;
- retry consequence;
- state transition;
- legal/illegal operation.

Feedback: actual result + causal explanation.

### Parameter manipulation

Mental operation: map cause X to consequence Y.

Best for:

- retry count;
- timeout/TTL;
- concurrency;
- thresholds;
- topology choices.

Do not add knobs that do not change the conceptual model.

### Toggle condition/state

Best for aligned comparisons such as online/offline or active/revoked.

Keep the same diagram so only the changed condition draws attention.

### Trace/step

Best for request lifecycle, queues, sync, transactions, recovery, concurrency.

Provide forward/back/replay where practical. Avoid cinematic autoplay as the sole control.

### Construct/order

Best when ordering/dependency is the concept itself.

Do not disguise a trivial multiple-choice question as drag-and-drop.

### Compare

Use for close alternatives. Align layouts and labels.

### Debug/repair

Use after guidance has faded. Give evidence and let the learner locate the broken assumption.

### Failure injection

Use only when the learner understands the canonical path or when the failure itself is a comprehensible motivating problem.

### Edit implementation

Use when code is part of the desired capability. Keep boilerplate hidden.

### Open exploration

Reserve for later mastery. Supply reset/replay/inspectable state.

## Feedback ladder

Use the least amount of help that restores productive reasoning:

1. visible consequence;
2. diagnostic pointer to first divergence;
3. invariant/rule cue;
4. focused hint;
5. partial trace;
6. concise worked resolution.

Do not punish guessing. Treat wrong answers as hypotheses to compare with system behavior.

## Visual grammar

Keep semantics stable across the course.

Examples:

- same entity uses same label/icon/color family;
- arrows retain the same directional meaning;
- active/current state has one consistent emphasis treatment;
- destructive/error state has one consistent treatment;
- optional/reference detail uses a visually subordinate layer.

Do not invent a complex notation system. The learner should understand the software, not study the course's visual language.

## Animation rules

Use animation when time/order/change is part of the idea.

Prefer:

- state transition emphasis;
- request/data movement when it clarifies causality;
- progressive highlighting;
- learner-controlled step/replay.

Avoid:

- looping arrows with no state meaning;
- entrance animations on every card;
- motion that removes earlier state before the learner can inspect it.

Respect `prefers-reduced-motion`.

## Responsive behavior

Primary target is desktop/laptop.

For diagrams:

- use SVG `viewBox`;
- preserve readable labels;
- allow horizontal overflow rather than shrinking to illegibility;
- keep controls keyboard accessible;
- avoid color-only meaning.
