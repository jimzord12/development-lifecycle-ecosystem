# Milestone Review and Remediation

Every Milestone implies one derived first-class Review node such as `M-001::REVIEW`. These nodes are DSF execution semantics. They are not authored ordinary `P-*` Phases and they do not add JSON files or change Definition schema v2.

A Review is ready when every member Phase is `PASSED` and `INTEGRATED`, no unresolved Design Gap contradicts those facts, no material package reconciliation remains pending, and every prerequisite Milestone in `dependsOn` is `CLOSED`. Readiness is calculated. It is not stored in the Definition.

A ready Review is strongly preferred before starting more ordinary Phase work. It does not automatically block independent Phase execution. Do not start a Review while a Phase is actively being changed.

The Review is a composite quality checkpoint: test adequacy, missing E2E/integration support, integrated verification, senior Milestone-wide code review, observable-capability review, bounded behavior-preserving simplification, reverification, then closure. Mutable Review state stays outside the Delivery Definition.

A change whose purpose is to correct observable behavior becomes the smallest coherent derived Milestone Remediation, for example `M-001::FIX-001`. Remediations have Phase-like execution facts but are not authored Phases. The parent Review stays `IN_PROGRESS` until active Remediations are passed and integrated.

A passed Review makes the Milestone `CLOSED` at exact integrated Git heads. Later human-found defects use proportional repair and may create another Remediation. They do not erase the earlier closure.

This topic describes Definition/execution semantics. Milestone domain commands are not implemented.
