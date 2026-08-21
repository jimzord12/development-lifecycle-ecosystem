# Compatibility

DSF uses four independent version axes:

1. DSF / component SemVer (`1.1.1`)
2. Delivery Definition schema version (`2`)
3. Delivery CLI SemVer (independent; currently `0.1.0`)
4. CLI-state schema version (unpublished)

Do not guess compatibility from nearby numbers. A CLI that cannot safely operate on a target artifact or version fails closed with `COMPATIBILITY_UNSUPPORTED` **before mutation**.

This release implements no write-oriented Delivery commands. Compatibility for unsupported Definition schema versions is enforced on `validate`. There is no universal supported-version-range field in DLE CLI Standard V1.
