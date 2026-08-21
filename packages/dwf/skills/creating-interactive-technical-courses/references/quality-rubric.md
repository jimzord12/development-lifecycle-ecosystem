# Quality Rubric

Use this as a release gate. The spike does not require numerical perfection; failures in the **Critical** section must be fixed.

## Critical — must pass

### Grounding

- Every important system claim is supported by supplied source material or explicitly labeled as inference/unknown.
- The course does not silently resolve contradictions or invent missing behavior.

### Time budget

- Required-path estimate is within the Course Brief's hard limit.
- Main-path content was reduced to fit the budget instead of extending the budget.
- Required learning does not assume delayed/multi-week follow-up beyond the requested duration.

### Outcomes

- Every `desiredCapability` appears in at least one learner task/trace/reasoning moment.
- Final transfer task requires independent reasoning rather than recognition of a named concept.

### Delivery/build contract

- The generated source project validates structurally and packages cleanly as one source ZIP.
- The ZIP excludes `node_modules/`, compiled output, caches, and VCS/editor junk.
- `README.md` gives the short `npm install` + `npm run build` path.
- `package.json` makes `npm run build` produce and verify the single-file HTML release.
- The course source contains no required runtime CDN/network dependencies.

## High-value — normally pass

### Mental model

- Simplified whole-system orientation appears early.
- Major units reconnect to the whole rather than becoming isolated pages.
- Canonical happy path is coherent before edge-case accumulation.
- Major mechanisms have named invariants/guarantees.

### Audience fit

- Generic developer prerequisites already known to this audience are skipped/shortened.
- Important system-specific details remain technically accurate.
- Tone is peer-like and matter-of-fact.

### Cognitive economy

- Explanations are adjacent to the representation they explain.
- Visual grammar is stable.
- Dense production detail is optional unless essential.
- No main-path section exists only for completeness/provenance.

### Interaction

For every interaction, the designer can answer:

> What relationship becomes easier to understand because the learner acted?

- decorative interactions are removed;
- temporal flows are step/replay controlled when needed;
- wrong-answer feedback explains the cause/invariant;
- interactions do not require undisclosed knowledge.

### Failure/edge cases

- happy path receives priority;
- only obvious/common/high-impact failures appear in the required path;
- rare edge cases are optional/reference;
- a failure is taught because it reveals a mechanism or materially affects operational reasoning.

### Guidance fading

- at least one important concept is later reused without re-teaching;
- final task does not tell the learner which mechanism to apply.

## Nice-to-have — do not delay the spike

- best-effort progress persistence;
- polished responsive behavior on small mobile screens;
- multiple transfer exercises;
- custom animation framework;
- advanced analytics;
- adaptive learner modeling;
- authoring CMS;
- automatic timing telemetry;
- elaborate theme system.

## Interaction deletion test

Before release, inspect each custom interaction and ask:

> If this became a static or stepwise explanation, would the learner lose meaningful causal/structural understanding?

If no, simplify it.

## Content deletion test

Inspect each required-path section and ask:

> Which desired capability becomes materially worse if this section is removed?

If none, remove it or move it to optional/reference depth.
