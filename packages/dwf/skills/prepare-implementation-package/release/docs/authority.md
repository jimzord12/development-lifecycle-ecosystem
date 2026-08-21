# DWF Authority and Change Boundaries

Project-owned design truth lives outside `design/.framework/`. Framework material teaches how to interpret and safely reconcile that truth; it is not feature authority.

A Portable Implementation Package is not globally immutable. Within one mutable package lineage:

- both `.framework/**` trees are immutable installed dependencies;
- already-committed `amendments/AM-*/**` records are immutable provenance; and
- project-owned `design/**` / `delivery/**` truth may change only after explicit human Design-Gap resolution through the Package-Amendment contract.

A framework file is never an ordinary Package-Amendment target. If a project artifact appears to require a framework change, treat that as a framework-upgrade/rematerialization concern rather than mutating `.framework/**` in place.

Ordinary implementation progress/history belongs outside package design truth (for example in an Implementation Record System when the project uses one). Never change canonical package truth merely to record runtime progress.
