#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import sys
sys.dont_write_bytecode = True

import prepare_package as piptools

AMENDMENT_SCHEMA_VERSION = 2

def fail(message: str) -> None:
    raise RuntimeError(message)

def normalize_rel(value: str) -> str:
    value = value.replace('\\', '/').strip()
    if not value or value.startswith('/') or re.match(r'^[A-Za-z]:', value):
        fail(f"amendment path must be package-relative: {value!r}")
    parts = [p for p in value.split('/') if p not in ('', '.')]
    if any(p == '..' for p in parts):
        fail(f"amendment path escapes package: {value!r}")
    rel = '/'.join(parts)
    if not (rel.startswith('design/') or rel.startswith('delivery/')):
        fail(f"ordinary Package Amendments may target only project-owned design/** or delivery/**: {rel}")
    if rel.startswith('design/.framework/') or rel.startswith('delivery/.framework/'):
        fail(f"framework payload is immutable within this package lineage: {rel}")
    if rel.startswith('design/.framework') or rel.startswith('delivery/.framework'):
        fail(f"framework payload is immutable within this package lineage: {rel}")
    return rel

def load_request(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except Exception as exc:
        fail(f"invalid amendment request JSON: {exc}")
    if not isinstance(data, dict):
        fail("amendment request must be a JSON object")
    changes = data.get('changes')
    if not isinstance(changes, list) or not changes:
        fail("amendment request must contain a non-empty changes array")
    normalized = []
    seen: set[str] = set()
    for idx, raw in enumerate(changes, 1):
        if not isinstance(raw, dict):
            fail(f"change {idx} must be an object")
        op = str(raw.get('operation', '')).upper()
        if op not in {'CREATE', 'MODIFY', 'DELETE', 'RENAME'}:
            fail(f"change {idx} has unsupported operation {op!r}")
        if op == 'RENAME':
            before_path = normalize_rel(str(raw.get('beforePath', '')))
            after_path = normalize_rel(str(raw.get('afterPath', '')))
            if before_path == after_path:
                fail(f"change {idx} rename paths are identical")
            paths = [before_path, after_path]
            item = {'operation': op, 'beforePath': before_path, 'afterPath': after_path}
        else:
            path_value = normalize_rel(str(raw.get('path', '')))
            paths = [path_value]
            item = {'operation': op, 'path': path_value}
        for rel in paths:
            if rel in seen:
                fail(f"path appears in more than one declared change: {rel}")
            seen.add(rel)
        normalized.append(item)
    data['changes'] = normalized
    return data

def package_file_hashes(package: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for path in piptools.sorted_relative_paths(package, (p for p in package.rglob('*') if p.is_file())):
        rel = piptools.posix_relative_path(path, package)
        result[rel] = piptools.sha256_file(path)
    return result

def staging_root(package: Path) -> Path:
    return package.parent / f".{package.name}.amendment-staging"

def allocate_id(package: Path, origin: str) -> tuple[str, int]:
    pattern = re.compile(rf'^AM-{re.escape(origin)}-(\d{{3,}})$')
    seqs = []
    amendments = package / 'amendments'
    amendments.mkdir(exist_ok=True)
    for child in amendments.iterdir():
        if not child.is_dir():
            continue
        m = pattern.match(child.name)
        if m:
            seqs.append(int(m.group(1)))
    seq = max(seqs, default=0) + 1
    return f"AM-{origin}-{seq:03d}", seq

def snapshot_path(tx_dir: Path, slot: str, rel: str) -> Path:
    safe = rel.replace('/', '__')
    return tx_dir / 'snapshots' / slot / safe

def save_snapshot(package: Path, tx_dir: Path, slot: str, rel: str) -> dict:
    src = package / rel
    meta = {'path': rel, 'exists': src.is_file()}
    if src.exists() and not src.is_file():
        fail(f"declared amendment path is not a regular file: {rel}")
    if src.is_file():
        data = src.read_bytes()
        dst = snapshot_path(tx_dir, slot, rel)
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
        meta.update({'sha256': piptools.sha256_bytes(data), 'bytes': len(data), 'snapshot': dst.relative_to(tx_dir).as_posix()})
    else:
        meta.update({'sha256': None, 'bytes': 0, 'snapshot': None})
    return meta

def restore_snapshot(package: Path, tx_dir: Path, meta: dict) -> None:
    dst = package / meta['path']
    if meta['exists']:
        src = tx_dir / meta['snapshot']
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(src.read_bytes())
    else:
        if dst.exists():
            if dst.is_dir():
                fail(f"cannot restore over directory at declared file path: {meta['path']}")
            dst.unlink()

def declared_paths(request: dict) -> set[str]:
    out: set[str] = set()
    for ch in request['changes']:
        if ch['operation'] == 'RENAME':
            out.update([ch['beforePath'], ch['afterPath']])
        else:
            out.add(ch['path'])
    return out

def begin(package: Path, request_path: Path) -> None:
    package = package.resolve()
    errors = piptools.validate(package)
    if errors:
        fail("cannot begin Amendment on invalid package:\n- " + "\n- ".join(errors))
    request = load_request(request_path.resolve())
    manifest = json.loads((package / 'package-manifest.json').read_text(encoding='utf-8'))
    amendment_id, sequence = allocate_id(package, manifest['packageOrigin'])
    tx_dir = staging_root(package) / amendment_id
    if tx_dir.exists():
        fail(f"staging transaction already exists: {tx_dir}")
    tx_dir.mkdir(parents=True)

    original_manifest = (package / 'package-manifest.json').read_bytes()
    (tx_dir / 'package-manifest.before.json').write_bytes(original_manifest)
    (tx_dir / 'request.json').write_text(json.dumps(request, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    baseline_hashes = package_file_hashes(package)
    (tx_dir / 'baseline-files.json').write_text(json.dumps(baseline_hashes, indent=2, sort_keys=True) + '\n', encoding='utf-8')

    before: dict[str, dict] = {}
    for rel in sorted(declared_paths(request)):
        before[rel] = save_snapshot(package, tx_dir, 'before', rel)
    (tx_dir / 'before.json').write_text(json.dumps(before, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    tx = {
        'amendmentId': amendment_id,
        'sequence': sequence,
        'packageId': manifest['packageId'],
        'packageOrigin': manifest['packageOrigin'],
        'previousPackageDigest': manifest['packageDigest'],
        'previousAmendmentChainHead': manifest.get('amendmentChainHead'),
    }
    (tx_dir / 'transaction.json').write_text(json.dumps(tx, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'status': 'READY', 'transaction': amendment_id, 'staging': str(tx_dir)}, indent=2))

def ensure_operation_outcome(package: Path, ch: dict, before: dict[str, dict]) -> None:
    op = ch['operation']
    if op == 'RENAME':
        old, new = ch['beforePath'], ch['afterPath']
        if not before[old]['exists']:
            fail(f"RENAME source did not exist at begin: {old}")
        if before[new]['exists']:
            fail(f"RENAME destination already existed at begin: {new}")
        if (package / old).exists():
            fail(f"RENAME source still exists at commit: {old}")
        if not (package / new).is_file():
            fail(f"RENAME destination missing at commit: {new}")
        return
    rel = ch['path']
    exists_before = before[rel]['exists']
    exists_after = (package / rel).is_file()
    if op == 'CREATE' and (exists_before or not exists_after):
        fail(f"CREATE outcome invalid for {rel}")
    if op == 'MODIFY':
        if not exists_before or not exists_after:
            fail(f"MODIFY requires existing file before and after: {rel}")
        if piptools.sha256_file(package / rel) == before[rel]['sha256']:
            fail(f"MODIFY produced no content change: {rel}")
    if op == 'DELETE' and (not exists_before or exists_after):
        fail(f"DELETE outcome invalid for {rel}")

def verify_only_declared_changes(package: Path, tx_dir: Path, request: dict) -> None:
    baseline = json.loads((tx_dir / 'baseline-files.json').read_text(encoding='utf-8'))
    current = package_file_hashes(package)
    changed = {p for p in set(baseline) | set(current) if baseline.get(p) != current.get(p)}
    allowed = declared_paths(request)
    # package-manifest must remain untouched until helper commit.
    if 'package-manifest.json' in changed:
        fail("package-manifest.json changed outside the Amendment helper")
    unexpected = sorted(changed - allowed)
    if unexpected:
        fail("files changed outside the declared Amendment scope: " + ', '.join(unexpected))

def copy_snapshot_into_amendment(tx_dir: Path, amendment_dir: Path, idx: int, state: str, meta: dict) -> str | None:
    if not meta['exists']:
        return None
    src = tx_dir / meta['snapshot']
    dst = amendment_dir / 'changes' / f'{idx:04d}' / f'{state}.bin'
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    return dst.relative_to(amendment_dir).as_posix()

def capture_after(package: Path, rel: str) -> dict:
    src = package / rel
    meta = {'path': rel, 'exists': src.is_file()}
    if src.exists() and not src.is_file():
        fail(f"declared amendment path is not a regular file: {rel}")
    if src.is_file():
        data = src.read_bytes()
        meta.update({'sha256': piptools.sha256_bytes(data), 'bytes': len(data)})
    else:
        meta.update({'sha256': None, 'bytes': 0})
    return meta

def amendment_readme(amendment_id: str, request: dict, tx: dict, changes: list[dict]) -> str:
    def scalar(key: str, default: str = 'Not supplied') -> str:
        value = request.get(key)
        if value is None or value == '':
            return default
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False)
        return str(value)
    lines = [
        f"# {amendment_id} — Package Amendment",
        "",
        f"Previous package digest: `{tx['previousPackageDigest']}`",
        f"Previous amendment head: `{tx['previousAmendmentChainHead']}`" if tx['previousAmendmentChainHead'] else "Previous amendment head: baseline",
        "",
        "## Trigger",
        scalar('trigger'),
        "",
        "## Evidence",
        scalar('evidence'),
        "",
        "## Human decision",
        scalar('humanDecision'),
        "",
        "## Rationale",
        scalar('rationale'),
        "",
        "## Implementation impact",
        scalar('implementationImpact'),
        "",
        "## Changed canonical paths",
    ]
    for ch in changes:
        if ch['operation'] == 'RENAME':
            lines.append(f"- `RENAME` `{ch['beforePath']}` -> `{ch['afterPath']}`")
        else:
            lines.append(f"- `{ch['operation']}` `{ch['path']}`")
    lines.extend(["", "Exact predecessor bytes plus before/after digests are recorded in `manifest.json` + `changes/`; the current package is the exact after-state.", ""])
    return '\n'.join(lines)

def recompute_manifest(package: Path, manifest: dict, amendment_id: str) -> dict:
    inventory = piptools.package_inventory(package)
    manifest['inventory'] = inventory
    manifest['packageDigest'] = piptools.compute_package_digest(
        manifest['packageFormatVersion'], manifest['packageId'], manifest['packageOrigin'], inventory
    )
    manifest['amendmentChainHead'] = amendment_id
    manifest['validation']['integrity'] = {'status': 'PENDING', 'layer': 1}
    piptools.write_text(package / 'package-manifest.json', json.dumps(manifest, indent=2, ensure_ascii=False))
    errors = piptools.validate(package)
    if errors:
        fail("package validation failed after Amendment:\n- " + "\n- ".join(errors))
    manifest['validation']['integrity'] = {'status': 'PASS', 'layer': 1, 'validator': 'DWF amend-package'}
    piptools.write_text(package / 'package-manifest.json', json.dumps(manifest, indent=2, ensure_ascii=False))
    errors = piptools.validate(package)
    if errors:
        fail("package validation failed after recording PASS:\n- " + "\n- ".join(errors))
    return manifest

def rollback(package: Path, tx_dir: Path, amendment_id: str) -> None:
    try:
        request = json.loads((tx_dir / 'request.json').read_text(encoding='utf-8'))
        before = json.loads((tx_dir / 'before.json').read_text(encoding='utf-8'))
        # Remove both sides first where needed, then restore original declared states.
        for rel in declared_paths(request):
            path = package / rel
            if path.exists() and path.is_file():
                path.unlink()
        for rel, meta in before.items():
            restore_snapshot(package, tx_dir, meta)
        am_dir = package / 'amendments' / amendment_id
        if am_dir.exists():
            shutil.rmtree(am_dir)
        (package / 'package-manifest.json').write_bytes((tx_dir / 'package-manifest.before.json').read_bytes())
    except Exception as exc:
        print(f"WARNING: automatic rollback encountered an error: {exc}", file=sys.stderr)

def commit(package: Path, transaction: str) -> None:
    package = package.resolve()
    tx_dir = staging_root(package) / transaction
    if not tx_dir.is_dir():
        fail(f"unknown Amendment transaction: {transaction}")
    request = json.loads((tx_dir / 'request.json').read_text(encoding='utf-8'))
    tx = json.loads((tx_dir / 'transaction.json').read_text(encoding='utf-8'))
    before = json.loads((tx_dir / 'before.json').read_text(encoding='utf-8'))
    if tx['amendmentId'] != transaction:
        fail("transaction identity mismatch")
    manifest = json.loads((package / 'package-manifest.json').read_text(encoding='utf-8'))
    if manifest['packageId'] != tx['packageId'] or manifest['packageOrigin'] != tx['packageOrigin']:
        fail("package identity changed during Amendment transaction")
    if manifest['packageDigest'] != tx['previousPackageDigest'] or manifest.get('amendmentChainHead') != tx['previousAmendmentChainHead']:
        fail("package manifest state changed during Amendment transaction")
    verify_only_declared_changes(package, tx_dir, request)
    for ch in request['changes']:
        ensure_operation_outcome(package, ch, before)

    am_dir = package / 'amendments' / transaction
    if am_dir.exists():
        fail(f"Amendment already exists: {transaction}")

    try:
        am_dir.mkdir(parents=True)
        changes_meta: list[dict] = []
        for idx, ch in enumerate(request['changes'], 1):
            if ch['operation'] == 'RENAME':
                old, new = ch['beforePath'], ch['afterPath']
                before_meta = before[old]
                after_meta = capture_after(package, new)
                entry = {
                    'operation': 'RENAME',
                    'beforePath': old,
                    'afterPath': new,
                    'beforeSha256': before_meta['sha256'],
                    'afterSha256': after_meta['sha256'],
                    'beforeBytes': before_meta['bytes'],
                    'afterBytes': after_meta['bytes'],
                    'beforeSnapshot': copy_snapshot_into_amendment(tx_dir, am_dir, idx, 'before', before_meta),
                }
            else:
                rel = ch['path']
                before_meta = before[rel]
                after_meta = capture_after(package, rel)
                entry = {
                    'operation': ch['operation'],
                    'path': rel,
                    'beforeSha256': before_meta['sha256'],
                    'afterSha256': after_meta['sha256'],
                    'beforeBytes': before_meta['bytes'],
                    'afterBytes': after_meta['bytes'],
                    'beforeSnapshot': copy_snapshot_into_amendment(tx_dir, am_dir, idx, 'before', before_meta),
                }
            changes_meta.append(entry)

        am_manifest = {
            'kind': 'package-amendment',
            'schemaVersion': AMENDMENT_SCHEMA_VERSION,
            'amendmentId': transaction,
            'sequence': tx['sequence'],
            'packageId': tx['packageId'],
            'packageOrigin': tx['packageOrigin'],
            'previousPackageDigest': tx['previousPackageDigest'],
            'previousAmendmentChainHead': tx['previousAmendmentChainHead'],
            'trigger': request.get('trigger'),
            'evidence': request.get('evidence'),
            'humanDecision': request.get('humanDecision'),
            'rationale': request.get('rationale'),
            'implementationImpact': request.get('implementationImpact'),
            'changes': changes_meta,
        }
        piptools.write_text(am_dir / 'manifest.json', json.dumps(am_manifest, indent=2, ensure_ascii=False))
        piptools.write_text(am_dir / 'README.md', amendment_readme(transaction, request, tx, changes_meta))
        manifest = recompute_manifest(package, manifest, transaction)
    except Exception:
        rollback(package, tx_dir, transaction)
        raise
    else:
        shutil.rmtree(tx_dir)
        root = staging_root(package)
        if root.exists() and not any(root.iterdir()):
            root.rmdir()
        print(json.dumps({
            'status': 'PASS',
            'amendmentId': transaction,
            'packageDigest': manifest['packageDigest'],
            'amendmentChainHead': manifest['amendmentChainHead'],
        }, indent=2))

def abort(package: Path, transaction: str) -> None:
    package = package.resolve()
    tx_dir = staging_root(package) / transaction
    if not tx_dir.is_dir():
        fail(f"unknown Amendment transaction: {transaction}")
    rollback(package, tx_dir, transaction)
    shutil.rmtree(tx_dir)
    root = staging_root(package)
    if root.exists() and not any(root.iterdir()):
        root.rmdir()
    errors = piptools.validate(package)
    if errors:
        fail("package did not return to a valid predecessor state:\n- " + "\n- ".join(errors))
    print(json.dumps({'status': 'ABORTED', 'transaction': transaction}, indent=2))

def main() -> int:
    ap = argparse.ArgumentParser(description='DWF internal transactional Package Amendment helper')
    sub = ap.add_subparsers(dest='command', required=True)
    p_begin = sub.add_parser('begin')
    p_begin.add_argument('--package', required=True, type=Path)
    p_begin.add_argument('--request', required=True, type=Path)
    p_commit = sub.add_parser('commit')
    p_commit.add_argument('--package', required=True, type=Path)
    p_commit.add_argument('--transaction', required=True)
    p_abort = sub.add_parser('abort')
    p_abort.add_argument('--package', required=True, type=Path)
    p_abort.add_argument('--transaction', required=True)
    p_validate = sub.add_parser('validate')
    p_validate.add_argument('--package', required=True, type=Path)
    args = ap.parse_args()
    try:
        if args.command == 'begin':
            begin(args.package, args.request)
        elif args.command == 'commit':
            commit(args.package, args.transaction)
        elif args.command == 'abort':
            abort(args.package, args.transaction)
        elif args.command == 'validate':
            errors = piptools.validate(args.package.resolve())
            if errors:
                fail("package validation failed:\n- " + "\n- ".join(errors))
            print('Layer-1 package integrity + Amendment chain: PASS')
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    raise SystemExit(main())
