# Scope and Time Budget

## Governing rule

**Time budget controls scope.**

Never start by trying to teach all available source material and then estimate how long it takes.

Start from the desired capabilities and select the smallest causal model that makes those capabilities possible.

## Practical planning buffer

Target the required path at roughly **80–85%** of the user's hard budget.

Example:

- user budget: 120 minutes;
- planned required path: about 95–100 minutes;
- remaining margin: navigation, slower reading, retries, short reflection.

This is a pragmatic authoring buffer, not a scientific claim about learner speed.

Optional deep dives may extend beyond the required-path estimate, but they must be clearly optional. Do not hide required understanding in optional material.

## Scope buckets

### MUST

Without this, the learner cannot meet a desired capability or will form a materially wrong system model.

### SHOULD

High leverage but removable if the time budget tightens.

### OPTIONAL DEPTH

Implementation/schema/protocol detail valuable to some professionals but not required to hold the main causal model.

### REFERENCE ONLY

Exact enumerations, rare edge cases, historical rationale, exhaustive tables, long code listings, or facts easily looked up later.

## Selection test

For every candidate concept ask:

1. Which desired capability requires this?
2. What misunderstanding occurs if it is absent?
3. Can the learner look it up later without damaging the main mental model?
4. Is there a simpler representative case that teaches the same invariant?

If no desired capability requires it and omission does not corrupt the model, remove it from the required path.

## Edge-case policy

Main path includes only:

- happy path;
- obvious error behavior needed to understand correctness;
- common high-impact edge cases;
- failures that explain why a major mechanism exists.

Rare conditions belong in optional depth/reference.

A failure earns main-path time when it changes the learner's explanatory model. A failure does **not** earn time merely because it exists in the specification.

## Typical operating profiles

These are authoring profiles, not evidence-based duration laws.

### 30–60 minutes — orientation

- one simplified whole-system model;
- one canonical flow;
- only the highest-leverage mechanisms;
- one important contrast/failure if necessary;
- final explain/predict task.

### 1–3 hours — standard mini-course

- system contract/map;
- canonical flow;
- key mechanisms;
- important variations;
- 1–3 high-impact failures;
- implementation anchors;
- authentic transfer task.

### Half day to 2 days — extended

Allows more mechanism composition, code/API anchors, and authentic practice without becoming exhaustive.

### 3–10 days — deep mini-course

Appropriate for a larger technology/library/system. Still design around capabilities and causal models rather than documentation coverage.

### 14 days — hard ceiling

This is the capability boundary, not a recommended target.

If the outcome needs more than this, split the body of knowledge into multiple independently useful mini-courses or use a different curriculum methodology.

## Long-term learning techniques

Do not make multi-week spacing, recurring homework, scheduled review, or long mastery cycles structural requirements.

Short retrieval/reuse inside the requested course is valuable when it fits naturally. The course must remain useful even if the learner never returns after finishing it.
