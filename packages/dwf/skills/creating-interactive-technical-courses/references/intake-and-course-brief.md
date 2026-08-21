# Intake and Course Brief

## Goal

Resolve the smallest deterministic preparation set needed to design the course predictably, then permit only a bounded ambiguity pass.

Do not force the user through questions whose answers were already supplied by command arguments, conversation, workspace context, or authoritative source material.

## Preparation contract

Before course generation, these five dimensions must be **resolved**:

1. **Time budget** — hard maximum for the required path.
2. **Audience / prior knowledge** — who will take it and what they already know.
3. **Desired capabilities / depth** — what they should be able to explain, predict, review, debug, or implement afterward.
4. **Scope** — whole subject or bounded area, including important emphasis/exclusions.
5. **Delivery / persistence intent** — ordinary downloadable source ZIP, or caller-specific persistence when the surrounding framework supports it.

A dimension supplied explicitly in the request is already resolved. Do not ask it again merely to follow a questionnaire.

After those five dimensions are resolved, perform one **ambiguity scan**. Ask at most **5 additional targeted questions total**. Ask only when the ambiguity materially changes correctness, scope, prerequisites, course architecture, or learner outcomes. Resolve lesser ambiguity with professional judgment.

## Required Course Brief fields

### `title`

A short human-facing course title. Can be provisional during intake.

### `subject`

What technical system/concept is being taught.

### `audience`

Who will take the course.

Capture:

- role/profile;
- relevant existing technical knowledge;
- relevant domain/product knowledge;
- what is genuinely new to them.

Avoid broad labels such as `advanced` without saying what the learner already knows.

### `desiredCapabilities`

Observable outcomes, preferably phrased as developer reasoning/actions.

Good:

- explain the canonical request lifecycle;
- predict what happens after a duplicate delivery;
- identify which component owns authoritative state;
- review an implementation change against system invariants;
- diagnose a high-impact failure path;
- know where exact protocol details live.

Weak:

- understand synchronization;
- learn the architecture;
- know the feature.

### `timeBudgetMinutes`

Hard maximum for the required learning path.

The skill supports at most 14 days of required learning. Since developer workdays vary, the JSON validator uses a mechanical ceiling of 20,160 wall-clock minutes only to reject obviously incompatible requests; instructional planning should use the actual time budget stated by the user (for example `120 minutes`, `one workday`, or `three afternoons`).

For normal mini-courses, prefer an explicit minute/hour budget.

### `scope`

Define the learning boundary. Include:

- whole subject vs bounded area;
- emphasis;
- exclusions;
- whether exact implementation detail belongs in the main path or optional depth.

### `delivery`

Default:

```json
{
  "format": "source-zip",
  "buildOutput": "single-html",
  "offlineBuildOutput": true,
  "persistence": "caller-default"
}
```

`persistence` describes caller intent only. The generic skill itself does not write to a workspace unless the surrounding command/workflow explicitly owns that persistence step.

## Optional Course Brief fields

### `depth`

Useful values:

- `orientation`
- `implementation-ready`
- `deep-overview`

Do not treat these as rigid enums when the user's wording is clearer.

### `sourceFiles`

Paths or identifiers for the source material used to ground the course.

### `sourceRevision`

When the sources come from a versioned workspace/repository, record the source revision so the generated course can state what truth it represents.

## Deterministic preparation questions

When all five dimensions are missing, a compact preparation turn should resolve them in one batch:

1. What is the hard time budget?
2. Who are the learners, and what relevant technical/domain knowledge can we assume?
3. What should they be able to explain/reason about/do afterward, and how deep should the course go?
4. What is in scope, and what should be emphasized or deliberately excluded?
5. Should the result only be returned as a downloadable source ZIP, or should the surrounding framework also persist it somewhere it supports?

If some answers are already known, ask only the unresolved ones while preserving this order.

Do not ask for visual style, number of chapters, interaction count, framework/library choices, or animation preferences unless they materially affect a stated requirement.

## Example Course Brief

```json
{
  "title": "Reliable Synchronization Architecture",
  "subject": "A mobile/backend synchronization design",
  "audience": {
    "profile": "Professional full-stack developers",
    "alreadyKnow": [
      "the product domain",
      "HTTP and REST",
      "database transactions",
      "queues and retries"
    ],
    "newToThem": [
      "the complete synchronization mental model",
      "the system's authority and recovery rules"
    ]
  },
  "desiredCapabilities": [
    "Explain the normal end-to-end synchronization flow",
    "Predict retry and duplicate-delivery behavior",
    "Reason about the main recovery path",
    "Recognize the major implementation responsibilities"
  ],
  "timeBudgetMinutes": 120,
  "scope": {
    "coverage": "whole design at 80/20 depth",
    "emphasis": ["causal system behavior", "high-impact failures"],
    "exclusions": ["exhaustive API field reference", "rare edge cases"]
  },
  "depth": "implementation-ready",
  "delivery": {
    "format": "source-zip",
    "buildOutput": "single-html",
    "offlineBuildOutput": true,
    "persistence": "caller-default"
  }
}
```
