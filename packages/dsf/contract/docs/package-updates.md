# Portable Package Updates and Return

A Portable Implementation Package is a self-contained handoff, not a new design authority and not a globally immutable tree. Project-owned packaged design/Delivery truth changes only after explicit human resolution of a genuine Design Gap.

Every material package mutation creates an immutable `AM-*` Amendment with trigger/evidence, decision/rationale, affected paths, predecessor package chaining, exact predecessor bytes when they existed, and before/after digests. The current package already contains the exact after-state, so new Amendments do not need to copy complete after files. Older Amendments that already contain both snapshots remain valid and immutable.

Both `.framework/**` trees and existing `amendments/AM-*/**` records are immutable. Framework upgrades require a rematerialized package lineage.

After amendment, reload changed authority, reconcile affected Phase/Review/Remediation work against the new package identity, then resume. Upstream reconciliation remains semantic; blind last-write-wins is never valid.
