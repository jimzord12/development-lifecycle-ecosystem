#!/usr/bin/env python3
from __future__ import annotations

import hashlib
from pathlib import Path, PureWindowsPath
import tempfile

import prepare_package as piptools

def manual_tree_digest(root: Path) -> str:
    h = hashlib.sha256()
    files = [p for p in root.rglob('*') if p.is_file()]
    for path in sorted(files, key=lambda p: p.relative_to(root).as_posix()):
        rel = path.relative_to(root).as_posix()
        h.update(rel.encode('utf-8') + b'\0' + piptools.sha256_file(path).encode('ascii') + b'\n')
    return h.hexdigest()

def main() -> int:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        fixture = {
            'README.md': b'root\n',
            'delivery/.framework/docs/authority.md': b'delivery\n',
            'design/.framework/README.md': b'design\n',
            'alpha/z.txt': b'z\n',
            'Alpha/A.txt': b'a\n',
        }
        for rel, data in fixture.items():
            path = root / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

        paths = [p for p in root.rglob('*') if p.is_file()]
        expected = sorted(fixture)
        actual = [item['path'] for item in piptools.package_inventory(root)]
        if actual != expected:
            raise AssertionError(f'package_inventory is not POSIX-relative ordered: {actual!r} != {expected!r}')

        # Ensure this fixture would catch the original defect: Windows native Path
        # semantics order case-insensitively and therefore differ from canonical
        # POSIX-relative string ordering.
        windows_native = [
            p.relative_to(root).as_posix()
            for p in sorted(paths, key=lambda p: PureWindowsPath(p.relative_to(root).as_posix()))
        ]
        if windows_native == expected:
            raise AssertionError('portability fixture no longer distinguishes Windows native ordering')

        expected_digest = manual_tree_digest(root)
        actual_digest = piptools.tree_payload_digest(root)
        if actual_digest != expected_digest:
            raise AssertionError(f'tree_payload_digest mismatch: {actual_digest} != {expected_digest}')

    print('Cross-platform POSIX-relative ordering regression: PASS')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
