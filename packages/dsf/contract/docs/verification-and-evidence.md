# Acceptance, Verification, and Evidence

Acceptance criteria state **what must be true**. Verification clauses state **how it will be proven**. Completion-evidence clauses state **what durable proof must be retained**.

Prefer deterministic automated proof when practical. Use integration/E2E tests when behavior crosses real subsystems or repositories. Evidence stays proportional to risk; DSF does not impose universal test-count, coverage, or screenshot quotas.

Phase PASS proves the Phase contract. It does not replace Milestone Review.

Milestone Review checks the integrated capability as a whole. It may add missing E2E/integration tests and supporting utilities, then performs a fresh Milestone-wide technical and observable-capability review. It records exact package identity, integrated repository heads, results, and evidence. A Milestone is `CLOSED` only after this contract passes.

Tests created during closure should remain as normal regression protection for later work. A later repair uses proportional revalidation unless its effect is broad or uncertain.
