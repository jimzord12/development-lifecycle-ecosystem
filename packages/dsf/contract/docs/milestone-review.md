# Milestone Review, Remediation, and Closure

Every Milestone implies one derived first-class Review node such as `M-001::REVIEW`.

## Readiness

A Review is ready when:

- every member Phase is `PASSED` and `INTEGRATED`;
- no unresolved Design Gap contradicts those facts;
- no material package reconciliation remains pending; and
- every prerequisite Milestone in `dependsOn` is `CLOSED`.

Readiness is calculated from the Delivery Definition and external run state. It is not copied into the Definition or stored as a separate ready status.

A ready Review is strongly preferred before starting more ordinary Phase work. It does not automatically block independent Phase execution. Do not start a Review while a Phase is actively being changed; finish or safely stabilize that Phase first.

A delayed Review checks the **current integrated repository heads** at Review start and records those exact heads. It does not rebuild an older Milestone-only code snapshot.

## Review contract

One Review node runs an ordered quality process:

1. check whether existing tests prove the Milestone;
2. add missing E2E, integration, fixture, or test-utility support;
3. run integrated verification;
4. perform senior Milestone-wide code review;
5. check whether the real user-observable capability works as intended;
6. perform bounded behavior-preserving simplification/refactoring;
7. reverify; and
8. close the Milestone only after PASS.

DSF requires these outcomes but does not require one vendor's parallel-agent or sub-agent API. Execution guidance may use fresh specialist context to reduce bias.

## Remediation

A Review may directly own tests and behavior-preserving Milestone-scoped cleanup. A change whose purpose is to correct observable behavior becomes the smallest coherent derived **Milestone Remediation**, for example `M-001::FIX-001`.

A Remediation has Phase-like execution, verification, integration, evidence, and Git facts, but it is not an authored Phase. The parent Review stays `IN_PROGRESS` and cannot pass until its active Remediations are passed and integrated. If accepted authority does not clearly determine the correction, use the normal Design-Gap path.

## Strong closure and later repair

A passed Review makes the Milestone `CLOSED` and creates a high-confidence checkpoint at exact integrated Git heads. Later repository commits do not by themselves make that closure stale.

A human-discovered post-closure problem uses a simple repair path and may create another Milestone Remediation. Preserve the earlier closure as history. Revalidate proportionally and repeat the full Review only when the change has broad or unclear effect. Do not automatically reopen later closed Milestones; revalidate only those materially affected.
