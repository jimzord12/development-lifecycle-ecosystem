# Progress Tracker V3 — Conceptual Reference

V3 adds small current Milestone Review/Remediation state. Exact field names should follow the installed IRS tracker conventions while preserving these semantics.

```json
{
  "schemaVersion": 3,
  "implementationRunId": "...",
  "authoritativePackage": {
    "current": {},
    "history": []
  },
  "phases": {},
  "milestones": {
    "M-001": {
      "state": "OPEN",
      "currentReview": null,
      "activeRemediations": [],
      "latestClosure": null
    }
  }
}
```

The tracker owns current facts and small pointers. DSF owns Milestone membership, Review readiness, graph edges, ordering, and proof contracts. Detailed Review, Remediation, repair, and revalidation history belongs under relative `evidence/M-XXX/` paths.
