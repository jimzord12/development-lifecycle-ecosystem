# Interactive Technical Learning Methodology

## Objective

Transform complex technical source material into a **short operational mental model** for professional developers.

The learner should leave able to reason about the system, not merely remember what pages they visited.

## Core philosophy

> Make the model intellectually demanding when necessary; make the interface cognitively cheap.

Spend learner effort on:

- causality;
- ownership;
- state;
- invariants;
- failure/recovery;
- tradeoffs;
- implementation consequences.

Do not spend it on:

- finding which paragraph explains an arrow;
- decoding a new diagram style every screen;
- remembering vanished animation state;
- reading prerequisites they already know;
- navigating artificial game mechanics;
- reconstructing fragments that were never reconnected.

## Professional learner model

Assume standard developer knowledge unless the Course Brief says otherwise.

The learner's usual bottleneck is **integration**:

> I know queues, transactions, APIs, retries, state, databases, and caches. How are they combined in _this_ system and why?

Treat expertise as local. A senior developer may know retries but not this system's retry contract.

## Governing principles

1. **Teach the system model, not the source documents.**
2. **Organize around causal questions and observable engineering outcomes.**
3. **Whole → part → whole** is the default rhythm for architecture/system learning.
4. Keep one stable conceptual/visual grammar whenever possible.
5. Expose only the minimum representation needed for the next productive reasoning step.
6. Explanation should enable an action/reasoning step or explain a consequence already observed.
7. Interaction is useful only when it exposes a meaningful relationship.
8. Use animation/stepping when temporal change matters; keep topology stable.
9. Use prediction only when the learner has enough information to reason rather than guess.
10. Wrong answers are model hypotheses. Feedback should show where the hypothesis diverged and why.
11. Move explicitly from **scenario → invariant → changed case** when generalization matters.
12. Vary one meaningful dimension before composing several mechanisms.
13. Use failure to explain architectural necessity, not to enumerate exceptions.
14. Every major mechanism should eventually be used without the course naming it for the learner.
15. Main path teaches the mental model; optional depth preserves exactness.
16. Finish with authentic developer reasoning: trace, debug, review, predict, or evaluate a change.

## Persistent system model

For complex systems, prefer one **home representation** that becomes richer over time.

The learner should increasingly become fluent in the representation rather than repeatedly decoding new diagrams.

Conceptually:

```text
whole system (low detail)
        ↓
focus/highlight one slice
        ↓
trace/manipulate/understand
        ↓
return to same whole system
        ↓
model now carries more meaning
```

A persistent model may be:

- architecture map;
- state machine;
- runtime trace surface;
- dependency graph;
- code + runtime view;
- another stable representation appropriate to the subject.

Do not preserve a giant diagram just for continuity. The initial whole must be deliberately simplified.

## Default micro-loop

For one conceptual unit:

```text
Frame the engineering question in the whole system
        ↓
Expose the minimum runnable representation
        ↓
Can the learner reason productively?
      /   \
    yes    no
     ↓      ↓
predict/   concise
manipulate worked trace
      \    /
        ↓
Make the consequence visible on the same model
        ↓
Explain mechanism + name invariant
        ↓
Change one meaningful condition / compare case
        ↓
Reintegrate into whole system
        ↓
Optional implementation/spec depth
```

Do not force every unit through every box.

For an obvious mechanism, concise explanation may be enough.

For a difficult unfamiliar mechanism, a worked trace may be better than unsupported discovery.

## Default macro-course

### 1. System contract and map

Establish:

- purpose/problem;
- boundaries;
- principal actors/state;
- sources of truth/authority where relevant;
- global invariants;
- what is new versus already familiar.

Keep detail intentionally low.

### 2. Canonical end-to-end behavior

Give the learner one coherent happy-path trace before decomposing the system into mechanisms.

### 3. Mechanism slices

Explain the few mechanisms that make the canonical behavior work.

Each mechanism should answer:

- what problem does this solve?
- what does it guarantee?
- where does it live?
- what changes because it exists?

### 4. Variations and important decisions

Use aligned comparisons and one-variable changes for modes/authorities/strategies that are easy to confuse.

### 5. Failure, recovery, composition

Introduce only failures with high explanatory leverage or high operational impact.

Show how multiple mechanisms compose under pressure.

### 6. Engineering transfer + reference

Fade instructional cues.

Ask the learner to reason about a realistic new situation without naming which concept they should apply.

Then leave the whole-system model usable as a reference surface.

## Progress

Prefer progress that represents growing capability or model coverage.

Good:

- can trace canonical flow;
- can explain authority;
- can predict retry behavior;
- can diagnose common failure;
- can evaluate recovery change.

Avoid XP/points/streaks/leaderboards unless the user explicitly needs a motivational product rather than a focused developer mini-course.

## Success criterion

At the end of the allocated time, the learner should be able to:

- explain the main system behavior;
- predict important consequences;
- recognize the purpose of major mechanisms;
- reason about common high-impact failures;
- map the mental model to implementation responsibilities;
- know where to look for exact detail.

Do not promise long-term memorization of every rule.
