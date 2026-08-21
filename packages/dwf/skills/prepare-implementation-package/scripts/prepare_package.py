#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import posixpath
import re
import shutil
import sys
import tempfile
import uuid
import zipfile

DWF_VERSION = "0.1.0-local.32"
DWF_CONSUMER_CONTRACT_VERSION = 4
PACKAGE_FORMAT_VERSION = 2
DESIGN_PROJECTION_MAPPING_VERSION = 1

TEXT_SUFFIXES = {".md", ".json", ".txt", ".yaml", ".yml", ".toml", ".py", ".js", ".ts", ".tsx", ".jsx", ".sh"}

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())

def posix_relative_path(path: Path, root: Path) -> str:
    """Return the canonical cross-platform path identity used by package hashing/order."""
    return path.relative_to(root).as_posix()

def sorted_relative_paths(root: Path, paths) -> list[Path]:
    """Sort paths by normalized POSIX-relative strings, never native Path ordering."""
    return sorted(paths, key=lambda path: posix_relative_path(path, root))

def package_inventory(root: Path) -> list[dict]:
    inventory = []
    files = (p for p in root.rglob("*") if p.is_file() and p.name != "package-manifest.json")
    for path in sorted_relative_paths(root, files):
        data = path.read_bytes()
        inventory.append({"path": posix_relative_path(path, root), "sha256": sha256_bytes(data), "bytes": len(data)})
    return inventory

def compute_package_digest(package_format_version: int, package_id: str, package_origin: str, inventory: list[dict]) -> str:
    h = hashlib.sha256()
    h.update(f"format={package_format_version}\npackageId={package_id}\npackageOrigin={package_origin}\n".encode())
    for item in inventory:
        h.update(item["path"].encode() + b"\0" + item["sha256"].encode() + b"\n")
    return h.hexdigest()

def tree_payload_digest(root: Path, exclude: set[str] | None = None) -> str:
    exclude = exclude or set()
    h = hashlib.sha256()
    files = (p for p in root.rglob("*") if p.is_file())
    for path in sorted_relative_paths(root, files):
        rel = posix_relative_path(path, root)
        if rel in exclude or path.name in exclude:
            continue
        h.update(rel.encode("utf-8") + b"\0" + sha256_file(path).encode("ascii") + b"\n")
    return h.hexdigest()

def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip().replace("\t", "    ") for line in text.split("\n")]
    text = "\n".join(lines)
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")
    return text.rstrip() + "\n"

def map_workspace_design_path(workspace_path: str) -> str | None:
    exact = {
        "project-context/RULES.md": "project-context/RULES.md",
        "project-context/context.md": "project-context/context.md",
        "project-context/GLOSSARY.md": "project-context/GLOSSARY.md",
        "design/decisions.md": "decisions/product.md",
        "design/technical-decisions.md": "decisions/technical.md",
    }
    if workspace_path in exact:
        return exact[workspace_path]
    for prefix in ("output/", "concepts/"):
        if workspace_path.startswith(prefix):
            return workspace_path
    return None

def rewrite_project_links(text: str, source_rel: str, package_rel: str) -> str:
    """Rebase projected Markdown links through DWF's fixed workspace/package mapping."""
    def replace(match: re.Match[str]) -> str:
        target = match.group(2).strip()
        if not target or target.startswith(("#", "http://", "https://", "mailto:", "/")):
            return match.group(0)
        path_part, marker, fragment = target.partition("#")
        resolved = posixpath.normpath(posixpath.join(posixpath.dirname(source_rel), path_part))
        mapped = map_workspace_design_path(resolved)
        if mapped is None:
            return match.group(0)
        rebased = posixpath.relpath(mapped, posixpath.dirname(package_rel) or ".")
        suffix = f"#{fragment}" if marker else ""
        return f"{match.group(1)}{rebased}{suffix}{match.group(3)}"

    return re.sub(r"(\[[^\]]*\]\()([^)]+)(\))", replace, text)

def rewrite_project_path_text(text: str, source_rel: str, package_rel: str) -> str:
    """Update path-like prose/code references for mapped canonical design owners."""
    for workspace_target, package_target in {
        "project-context/RULES.md": "project-context/RULES.md",
        "project-context/context.md": "project-context/context.md",
        "project-context/GLOSSARY.md": "project-context/GLOSSARY.md",
        "design/decisions.md": "decisions/product.md",
        "design/technical-decisions.md": "decisions/technical.md",
    }.items():
        source_ref = posixpath.relpath(workspace_target, posixpath.dirname(source_rel) or ".")
        if "/" not in source_ref:
            continue
        package_ref = posixpath.relpath(package_target, posixpath.dirname(package_rel) or ".")
        text = text.replace(source_ref, package_ref)
    return text

def scrub_design_history(text: str, rel: str, package_rel: str | None = None) -> str:
    """Remove/normalize Design Workspace process-history references from portable project truth."""
    lines = []
    for line in text.splitlines():
        if re.match(r"^- (Source|Amended by):\s+`?\.\./sessions/", line):
            continue
        lines.append(line)
    text = "\n".join(lines)

    # Remove concrete historical file prerequisites while keeping surrounding semantics readable.
    text = re.sub(r"`(?:\.\./)?sessions/[^`]+`", "omitted historical design provenance", text)
    text = re.sub(r"\[([^\]]+)\]\((?:\.\./)?sessions/[^)]+\)", r"\1", text)
    text = re.sub(r"Design Workspace Session\s+\d{3}(?:\s+Chat Segment\s+\d+)?", "prior design analysis", text)
    text = re.sub(r"Session\s+\d{3}(?:\s+Chat Segment\s+\d+)?", "prior design analysis", text)
    text = re.sub(r"Workspace Revision\s+\d{3}", "the source Design Workspace revision", text)

    if package_rel is not None:
        text = rewrite_project_path_text(text, rel, package_rel)
        text = rewrite_project_links(text, rel, package_rel)

    # Project glossary in the implementation projection should not re-export the Workspace-process glossary.
    if rel == "project-context/GLOSSARY.md" and "## Implementation Delivery Terms" in text:
        body = text.split("## Implementation Delivery Terms", 1)[1]
        text = (
            "# Project Glossary — Portable Projection\n\n"
            "Framework consumer vocabulary is defined by `design/.framework/README.md` and "
            "`delivery/.framework/README.md`. This file retains the project implementation/delivery terminology needed by the handoff.\n\n"
            "## Implementation Delivery Terms" + body
        )

    # The full Workspace Protocol is intentionally not projected; point any residual glossary link at DWF's public contract.
    text = text.replace("../WORKSPACE-PROTOCOL.md", "../.framework/README.md")
    return normalize_text(text)

def copy_projected_file(src: Path, dst: Path, rel: str, package_rel: str | None = None) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix.lower() in TEXT_SUFFIXES:
        text = src.read_text(encoding="utf-8")
        dst.write_text(scrub_design_history(text, rel, package_rel), encoding="utf-8")
    else:
        shutil.copy2(src, dst)

def copy_tree_projected(src_root: Path, dst_root: Path, rel_prefix: str) -> None:
    for src in sorted_relative_paths(src_root, (p for p in src_root.rglob("*") if p.is_file())):
        rel = posix_relative_path(src, src_root)
        package_rel = f"{rel_prefix}/{rel}"
        copy_projected_file(src, dst_root / rel, package_rel, package_rel)

def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(normalize_text(text), encoding="utf-8")

def materialize_dwf_release(workspace: Path, dst: Path) -> dict:
    source = workspace / "skills/prepare-implementation-package/release"
    if not source.exists():
        raise RuntimeError("DWF local release source missing from prepare-implementation-package skill")
    shutil.copytree(source, dst)
    # Install the framework-owned skill itself without recursively copying the release source.
    skill_dst = dst / "skills/prepare-implementation-package"
    skill_dst.mkdir(parents=True, exist_ok=True)
    shutil.copy2(workspace / "skills/prepare-implementation-package/SKILL.md", skill_dst / "SKILL.md")
    (skill_dst / "scripts").mkdir(parents=True, exist_ok=True)
    scripts_root = workspace / "skills/prepare-implementation-package/scripts"
    for script in sorted_relative_paths(scripts_root, scripts_root.glob("*.py")):
        shutil.copy2(script, skill_dst / "scripts" / script.name)

    release = {
        "kind": "design-workspace-framework-release",
        "version": DWF_VERSION,
        "publicConsumerContractVersion": DWF_CONSUMER_CONTRACT_VERSION,
        "sourceProtocolVersion": 31,
        "distribution": "local-materialized-release",
        "docsIndex": "README.md",
        "payloadDigestAlgorithm": "sha256(sorted relative-path\\0file-sha256; release.json excluded)",
    }
    release["payloadDigest"] = tree_payload_digest(dst, {"release.json"})
    write_text(dst / "release.json", json.dumps(release, indent=2, ensure_ascii=False))
    return release

def package_root_readme(workspace_revision: int, project_title: str) -> str:
    return f'''# {project_title} — Portable Implementation Package

This package contains the accepted design truth and delivery plan needed to implement {project_title} safely. Two small installed frameworks help interpret it: **DWF** explains design authority and how design changes are reconciled; **DSF** explains how implementation is decomposed into Milestones and Phases. No prior knowledge of either framework is assumed.

The package was freshly materialized from Design Workspace revision **{workspace_revision:03d}**. `package-manifest.json` records the exact package identity, framework releases, digests, validation status, and current Amendment-chain head.

## Important mutation boundary

**Do not treat this entire package as immutable/read-only.**

Immutable within this package lineage:

- `design/.framework/**`;
- `delivery/.framework/**`; and
- already-committed `amendments/AM-*/**` provenance.

After a genuine Design Gap is explicitly resolved by the responsible human, the Main Agent may amend the actual project-owned `design/**` and affected project-owned `delivery/**` truth outside those framework roots, using the Package-Amendment contract. Ordinary implementation progress must not edit PIP truth merely to record runtime state.

A genuine Design Gap is first an **interactive resolution pause**: stop only affected work, preserve evidence, and ask the responsible human the concrete engineering/product question now. Do not terminally stop merely because a live human decision is pending.

## Recommended first read

Follow this sequence once to build the global mental model:

1. `/README.md`
2. `/design/.framework/README.md`
3. `/delivery/.framework/README.md`
4. `/design/README.md`
5. `/delivery/AGENT-GUIDE.md`
6. `/design/project-context/RULES.md`
7. `/design/output/agent/PRD.md`
8. `/design/output/agent/SPEC.md`
9. `/delivery/REPOSITORY-ORIENTATION.md`
10. `/delivery/roadmap.json`

The two framework READMEs deliberately teach their vocabulary before the project files start using it heavily. Read deeper framework docs only when you need them.

## After orientation

Work Phase-by-Phase. A target Phase tells you which accepted design references govern the work and which supporting Concepts should be read for the intended subsystem/flow mental model. After a Milestone's member Phases pass and integrate, its derived Milestone Review is the strongly recommended next checkpoint before more ordinary Phase work. `delivery/AGENT-GUIDE.md` is the implementation-handoff handbook; the Agent `SPEC.md` is the technical implementation contract.

Production repositories are **outside this package**. Keep them as ordinary Git repositories beside or elsewhere in your implementation workspace and use `delivery/REPOSITORY-ORIENTATION.md` to map the handoff to repository reality.

If repository evidence exposes a real design contradiction or missing authority, do not guess and do not default to terminal `BLOCKED`. Follow the Design-Gap interaction path in `design/.framework/docs/design-gaps-and-amendments.md` and `delivery/.framework/docs/design-gaps.md`. After explicit human resolution, the packaged DWF Amendment helper can author the required deterministic `AM-*`; then reconcile affected implementation against the new package identity and resume.
'''

def dwf_project_readme(project_title: str) -> str:
    return f'''# {project_title} — Project Design Map

This directory is the bounded implementation-facing **project design projection**. `.framework/` is the pinned DWF release; every other file here is project-owned projected design truth or derived project guidance.

## Authority map

- `project-context/RULES.md` — mandatory project engineering/delivery posture (`RULE-*`).
- `project-context/context.md` — durable project/repository facts.
- `project-context/GLOSSARY.md` — project delivery/domain terminology.
- `decisions/product.md` — accepted product decisions (`D-*`).
- `decisions/technical.md` — accepted technical decisions (`TD-*`).
- `output/agent/PRD.md` — consolidated observable/product implementation contract.
- `output/agent/SPEC.md` — consolidated technical implementation contract.
- `output/edge-cases.md` — durable handled scenarios (`EC-*`).
- `output/human/PRD.md` and `output/human/SPEC.md` — derived comprehension projections.
- `concepts/` — derived explanatory deep dives; useful for understanding, never design authority.

Project-specific `D-*`, `TD-*`, and `EC-*` identities are stable local conventions. DWF does not require every project to use these exact formats.

Historical Design Sessions, Workspace process files, and collaboration state are deliberately absent. If you need framework semantics rather than project semantics, return to `.framework/README.md`.
'''

def materialize(workspace: Path, output: Path, archive: Path | None, origin: str, fresh_status: str, fresh_reason: str, package_id: str, project_title: str) -> dict:
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)

    readme = (workspace / "README.md").read_text(encoding="utf-8")
    m = re.search(r"Workspace version:\s*(\d+)", readme)
    pm = re.search(r"Protocol version:\s*(\d+)", readme)
    if not m or not pm:
        raise RuntimeError("Cannot determine workspace/protocol version")
    workspace_revision = int(m.group(1)); protocol_version = int(pm.group(1))

    write_text(output / "README.md", package_root_readme(workspace_revision, project_title))

    # Bounded project design projection using DWF's fixed mapping contract.
    design = output / "design"
    write_text(design / "README.md", dwf_project_readme(project_title))
    fixed_projection = [
        ("project-context/RULES.md", "project-context/RULES.md"),
        ("project-context/context.md", "project-context/context.md"),
        ("project-context/GLOSSARY.md", "project-context/GLOSSARY.md"),
        ("design/decisions.md", "decisions/product.md"),
        ("design/technical-decisions.md", "decisions/technical.md"),
        ("output/agent/PRD.md", "output/agent/PRD.md"),
        ("output/agent/SPEC.md", "output/agent/SPEC.md"),
        ("output/human/PRD.md", "output/human/PRD.md"),
        ("output/human/SPEC.md", "output/human/SPEC.md"),
        ("output/edge-cases.md", "output/edge-cases.md"),
    ]
    for workspace_rel, package_rel in fixed_projection:
        copy_projected_file(workspace / workspace_rel, design / package_rel, workspace_rel, package_rel)
    copy_tree_projected(workspace / "concepts", design / "concepts", "concepts")
    dwf_release = materialize_dwf_release(workspace, design / ".framework")

    # Delivery tree is project-owned plus pinned DSF release. Normalize project-facing historical provenance.
    delivery_src = workspace / "delivery"
    for src in sorted_relative_paths(delivery_src, (p for p in delivery_src.rglob("*") if p.is_file())):
        rel = posix_relative_path(src, delivery_src)
        dst = output / "delivery" / rel
        if rel.startswith(".framework/"):
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
        else:
            copy_projected_file(src, dst, f"delivery/{rel}")

    (output / "amendments").mkdir()

    dsf_release = json.loads((output / "delivery/.framework/release.json").read_text(encoding="utf-8"))
    actual_dsf_digest = tree_payload_digest(output / "delivery/.framework", {"release.json"})
    if actual_dsf_digest != dsf_release.get("payloadDigest"):
        raise RuntimeError("Pinned DSF payload digest does not match release.json")

    # Build manifest inventory excluding the manifest itself.
    inventory = package_inventory(output)
    package_digest = compute_package_digest(PACKAGE_FORMAT_VERSION, package_id, origin, inventory)

    manifest = {
        "kind": "portable-implementation-package",
        "packageFormatVersion": PACKAGE_FORMAT_VERSION,
        "packageId": package_id,
        "packageOrigin": origin,
        "sourceWorkspaceRevision": workspace_revision,
        "sourceProtocolVersion": protocol_version,
        "designRoot": "design",
        "deliveryRoot": "delivery",
        "designProjectionMappingVersion": DESIGN_PROJECTION_MAPPING_VERSION,
        "packageDigestAlgorithm": "sha256(format+packageId+packageOrigin+sorted path\\0file-sha256; package-manifest.json excluded)",
        "packageDigest": package_digest,
        "amendmentChainHead": None,
        "frameworks": {
            "dwf": {
                "releasePath": "design/.framework/release.json",
                "version": dwf_release["version"],
                "publicConsumerContractVersion": dwf_release["publicConsumerContractVersion"],
                "payloadDigest": dwf_release["payloadDigest"],
            },
            "dsf": {
                "releasePath": "delivery/.framework/release.json",
                "version": dsf_release["version"],
                "publicConsumerContractVersion": dsf_release["publicConsumerContractVersion"],
                "deliveryDefinitionSchemaVersion": dsf_release["deliveryDefinitionSchemaVersion"],
                "payloadDigest": dsf_release["payloadDigest"],
            },
        },
        "validation": {
            "integrity": {"status": "PENDING", "layer": 1},
            "freshAgentEvaluation": {"status": fresh_status, "layer": 2, "reason": fresh_reason},
        },
        "inventory": inventory,
    }
    write_text(output / "package-manifest.json", json.dumps(manifest, indent=2, ensure_ascii=False))

    errors = validate(output)
    if errors:
        raise RuntimeError("Layer-1 package validation failed:\n- " + "\n- ".join(errors))
    manifest["validation"]["integrity"] = {"status": "PASS", "layer": 1, "validator": "DWF prepare-implementation-package"}
    write_text(output / "package-manifest.json", json.dumps(manifest, indent=2, ensure_ascii=False))
    errors = validate(output)
    if errors:
        raise RuntimeError("Layer-1 package validation failed after PASS record:\n- " + "\n- ".join(errors))

    if archive:
        deterministic_zip(output, archive)
    return manifest

def parse_markdown_links(text: str):
    return re.findall(r"\[[^\]]*\]\(([^)]+)\)", text)

def validate_amendment_chain(package: Path, manifest: dict, errors: list[str]) -> None:
    amendments_root = package / "amendments"
    if not amendments_root.exists():
        errors.append("missing amendments directory")
        return
    unexpected = [p.name for p in amendments_root.iterdir() if not (p.is_dir() and p.name.startswith("AM-"))]
    if unexpected:
        errors.append(f"unexpected entries under amendments/: {sorted(unexpected)}")

    manifests: dict[str, dict] = {}
    for am_dir in sorted((p for p in amendments_root.iterdir() if p.is_dir() and p.name.startswith("AM-")), key=lambda p: p.name):
        mp = am_dir / "manifest.json"
        rp = am_dir / "README.md"
        if not mp.is_file() or not rp.is_file():
            errors.append(f"amendment {am_dir.name} missing manifest.json or README.md")
            continue
        try:
            am = json.loads(mp.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"invalid amendment manifest {mp}: {exc}")
            continue
        if am.get("amendmentId") != am_dir.name:
            errors.append(f"amendment directory/id mismatch: {am_dir.name}")
        if am.get("packageId") != manifest.get("packageId") or am.get("packageOrigin") != manifest.get("packageOrigin"):
            errors.append(f"amendment {am_dir.name} package identity mismatch")
        schema_version = am.get("schemaVersion")
        if am.get("kind") != "package-amendment" or schema_version not in {1, 2}:
            errors.append(f"amendment {am_dir.name} unsupported kind/schema")
        for ch in am.get("changes", []):
            op = ch.get("operation")
            for key in ["path", "beforePath", "afterPath"]:
                val = ch.get(key)
                if val and (val.startswith("design/.framework/") or val.startswith("delivery/.framework/")):
                    errors.append(f"amendment illegally targets framework payload: {val}")
                if val and val.startswith("amendments/"):
                    errors.append(f"amendment illegally targets existing amendment history: {val}")

            before_snap = ch.get("beforeSnapshot")
            before_digest = ch.get("beforeSha256")
            if before_snap is None:
                if before_digest is not None:
                    errors.append(f"amendment {am_dir.name} before digest present without snapshot")
            else:
                sp = am_dir / before_snap
                if not sp.is_file():
                    errors.append(f"amendment {am_dir.name} missing before snapshot: {before_snap}")
                elif sha256_file(sp) != before_digest:
                    errors.append(f"amendment {am_dir.name} before snapshot digest mismatch: {before_snap}")

            after_snap = ch.get("afterSnapshot")
            after_digest = ch.get("afterSha256")
            if schema_version == 1:
                if after_snap is None:
                    if after_digest is not None:
                        errors.append(f"amendment {am_dir.name} after digest present without snapshot")
                else:
                    sp = am_dir / after_snap
                    if not sp.is_file():
                        errors.append(f"amendment {am_dir.name} missing after snapshot: {after_snap}")
                    elif sha256_file(sp) != after_digest:
                        errors.append(f"amendment {am_dir.name} after snapshot digest mismatch: {after_snap}")
            elif after_snap is not None:
                errors.append(f"amendment {am_dir.name} schema V2 must not duplicate after snapshots")

            if op == "CREATE" and before_digest is not None:
                errors.append(f"amendment {am_dir.name} CREATE has unexpected predecessor content")
            elif op in {"MODIFY", "DELETE", "RENAME"} and before_digest is None:
                errors.append(f"amendment {am_dir.name} {op} missing predecessor content")
            if op == "DELETE" and after_digest is not None:
                errors.append(f"amendment {am_dir.name} DELETE has unexpected after content")
            elif op in {"CREATE", "MODIFY", "RENAME"} and after_digest is None:
                errors.append(f"amendment {am_dir.name} {op} missing after digest")
        manifests[am_dir.name] = am

    head = manifest.get("amendmentChainHead")
    if not manifests:
        if head is not None:
            errors.append("manifest amendmentChainHead is set but no amendments exist")
        return
    if not head or head not in manifests:
        errors.append("manifest amendmentChainHead does not identify an existing Amendment")
        return

    # The chain must include every AM directory exactly once.
    order: list[str] = []
    seen: set[str] = set()
    cursor = head
    while cursor is not None:
        if cursor in seen:
            errors.append(f"amendment chain cycle at {cursor}")
            return
        am = manifests.get(cursor)
        if am is None:
            errors.append(f"amendment chain references missing predecessor {cursor}")
            return
        seen.add(cursor)
        order.append(cursor)
        cursor = am.get("previousAmendmentChainHead")
    if seen != set(manifests):
        errors.append(f"amendment directories not reachable from chain head: {sorted(set(manifests) - seen)}")
        return

    # Reverse replay proves every recorded predecessor package digest without a
    # self-referential resulting digest inside the Amendment itself.
    try:
        with tempfile.TemporaryDirectory(prefix="pip-amend-validate-") as tmp:
            work = Path(tmp) / "package"
            shutil.copytree(package, work)
            cursor = head
            while cursor is not None:
                am = manifests[cursor]
                work_am = work / "amendments" / cursor
                # Verify the current canonical state corresponds to this Amendment's after state.
                for ch in am.get("changes", []):
                    op = ch.get("operation")
                    if op == "RENAME":
                        before_path, after_path = ch.get("beforePath"), ch.get("afterPath")
                        if (work / before_path).exists():
                            errors.append(f"amendment {cursor} replay expected renamed source absent: {before_path}")
                            return
                        if not (work / after_path).is_file() or sha256_file(work / after_path) != ch.get("afterSha256"):
                            errors.append(f"amendment {cursor} replay after-state mismatch: {after_path}")
                            return
                    else:
                        rel = ch.get("path")
                        target = work / rel
                        if op == "DELETE":
                            if target.exists():
                                errors.append(f"amendment {cursor} replay expected deleted path absent: {rel}")
                                return
                        else:
                            if not target.is_file() or sha256_file(target) != ch.get("afterSha256"):
                                errors.append(f"amendment {cursor} replay after-state mismatch: {rel}")
                                return

                # Revert canonical paths from exact snapshots.
                for ch in reversed(am.get("changes", [])):
                    op = ch.get("operation")
                    if op == "RENAME":
                        old, new = ch.get("beforePath"), ch.get("afterPath")
                        new_path = work / new
                        if new_path.exists():
                            new_path.unlink()
                        old_path = work / old
                        snap = work_am / ch["beforeSnapshot"]
                        old_path.parent.mkdir(parents=True, exist_ok=True)
                        old_path.write_bytes(snap.read_bytes())
                    else:
                        rel = ch.get("path")
                        target = work / rel
                        if op == "CREATE":
                            if target.exists():
                                target.unlink()
                        elif op in {"MODIFY", "DELETE"}:
                            snap = work_am / ch["beforeSnapshot"]
                            target.parent.mkdir(parents=True, exist_ok=True)
                            target.write_bytes(snap.read_bytes())
                        else:
                            errors.append(f"amendment {cursor} unsupported operation {op}")
                            return

                shutil.rmtree(work_am)
                inv = package_inventory(work)
                digest = compute_package_digest(
                    manifest.get("packageFormatVersion"), manifest.get("packageId"), manifest.get("packageOrigin"), inv
                )
                if digest != am.get("previousPackageDigest"):
                    errors.append(f"amendment {cursor} predecessor package digest mismatch")
                    return
                cursor = am.get("previousAmendmentChainHead")
    except Exception as exc:
        errors.append(f"amendment reverse-replay validation failed: {exc}")

def validate(package: Path) -> list[str]:
    errors: list[str] = []
    required = [
        "README.md", "package-manifest.json", "design/README.md", "design/.framework/README.md", "design/.framework/release.json",
        "design/project-context/RULES.md", "design/project-context/context.md", "design/project-context/GLOSSARY.md",
        "design/decisions/product.md", "design/decisions/technical.md",
        "design/output/agent/PRD.md", "design/output/agent/SPEC.md", "design/output/human/PRD.md", "design/output/human/SPEC.md", "design/output/edge-cases.md",
        "design/concepts/README.md",
        "delivery/.framework/README.md", "delivery/.framework/release.json", "delivery/AGENT-GUIDE.md", "delivery/REPOSITORY-ORIENTATION.md", "delivery/roadmap.json",
    ]
    for rel in required:
        if not (package / rel).is_file(): errors.append(f"missing required file: {rel}")

    expected_top_level = {"README.md", "package-manifest.json", "design", "delivery", "amendments"}
    actual_top_level = {path.name for path in package.iterdir()}
    if actual_top_level != expected_top_level:
        errors.append(f"unexpected package top-level entries: {sorted(actual_top_level ^ expected_top_level)}")

    try:
        manifest = json.loads((package / "package-manifest.json").read_text())
    except Exception as e:
        return errors + [f"invalid package manifest: {e}"]

    if manifest.get("packageFormatVersion") != PACKAGE_FORMAT_VERSION:
        errors.append(f"package format version is not {PACKAGE_FORMAT_VERSION}")
    if manifest.get("designRoot") != "design" or manifest.get("deliveryRoot") != "delivery":
        errors.append("manifest package roots do not match the v2 contract")
    if manifest.get("designProjectionMappingVersion") != DESIGN_PROJECTION_MAPPING_VERSION:
        errors.append("manifest design projection mapping version mismatch")

    # Inventory/digest.
    actual = package_inventory(package)
    if manifest.get("inventory") != actual:
        errors.append("manifest inventory does not match package files")
    actual_digest = compute_package_digest(
        manifest.get('packageFormatVersion'), manifest.get('packageId'), manifest.get('packageOrigin'), actual
    )
    if manifest.get("packageDigest") != actual_digest:
        errors.append("package digest mismatch")

    # Framework identities/digests.
    for key, base in [("dwf", package/"design/.framework"),("dsf",package/"delivery/.framework")]:
        try: rel=json.loads((base/"release.json").read_text())
        except Exception as e: errors.append(f"invalid {key} release.json: {e}"); continue
        digest=tree_payload_digest(base,{"release.json"})
        if rel.get("payloadDigest") != digest: errors.append(f"{key} payload digest mismatch")
        mf=manifest.get("frameworks",{}).get(key,{})
        for field in ["version","publicConsumerContractVersion","payloadDigest"]:
            if mf.get(field)!=rel.get(field): errors.append(f"manifest/{key} {field} mismatch")

    # Definition structure/IDs/references.
    try:
        roadmap=json.loads((package/"delivery/roadmap.json").read_text())
        if roadmap.get("schemaVersion") != 2: errors.append("roadmap is not Definition schema v2")
        repo_keys=set(roadmap.get("repositories",{}))
    except Exception as e: errors.append(f"invalid roadmap: {e}"); repo_keys=set()
    milestones={}; phases={}
    milestones_root = package / "delivery/milestones"
    for path in sorted_relative_paths(milestones_root, milestones_root.glob("M-*.json")):
        try:
            d=json.loads(path.read_text()); milestones[d['id']]=d
            if d.get('schemaVersion')!=2: errors.append(f"{d.get('id')} schemaVersion != 2")
            if 'governingDesignReferences' not in d: errors.append(f"{d.get('id')} missing governingDesignReferences")
            if 'governingReferences' in d: errors.append(f"{d.get('id')} still uses governingReferences")
        except Exception as e: errors.append(f"invalid milestone {path.name}: {e}")
    phases_root = package / "delivery/phases"
    for path in sorted_relative_paths(phases_root, phases_root.glob("P-*.json")):
        try:
            d=json.loads(path.read_text()); phases[d['id']]=d
            if path.stem != d.get('id'): errors.append(f"phase filename/id mismatch: {path.name}")
            if d.get('schemaVersion')!=2: errors.append(f"{d.get('id')} schemaVersion != 2")
            for f in ['governingDesignReferences','supportingConceptReferences']:
                if f not in d or not isinstance(d[f],list) or not d[f]: errors.append(f"{d.get('id')} missing/nonempty {f}")
            if 'governingReferences' in d: errors.append(f"{d.get('id')} still uses governingReferences")
            if not set(d.get('repositories',[])) <= repo_keys: errors.append(f"{d.get('id')} unknown repository key")
            for cref in d.get('supportingConceptReferences',[]):
                if not (package/'design'/cref).is_file(): errors.append(f"{d.get('id')} missing supporting Concept: {cref}")
        except Exception as e: errors.append(f"invalid phase {path.name}: {e}")
    if len(milestones)!=7: errors.append(f"expected 7 milestones, found {len(milestones)}")
    if len(phases)!=22: errors.append(f"expected 22 phases, found {len(phases)}")

    # Dependency graph acyclic and refs exist.
    visiting=set(); visited=set()
    def dfs(pid):
        if pid in visiting: errors.append(f"phase dependency cycle at {pid}"); return
        if pid in visited: return
        visiting.add(pid)
        for dep in phases.get(pid,{}).get('dependsOn',[]):
            if dep not in phases: errors.append(f"{pid} depends on missing {dep}")
            else: dfs(dep)
        visiting.remove(pid); visited.add(pid)
    for pid in phases: dfs(pid)

    # Governing stable IDs resolve somewhere in projected canonical truth.
    canonical_text="\n".join((package/p).read_text(encoding='utf-8') for p in [
        'design/project-context/RULES.md','design/decisions/product.md','design/decisions/technical.md','design/output/edge-cases.md'])
    for obj in list(milestones.values())+list(phases.values()):
        for ref in obj.get('governingDesignReferences',[]):
            if re.fullmatch(r'(RULE|D|TD|EC)-\d+', ref) and not re.search(rf'\b{re.escape(ref)}\b', canonical_text):
                errors.append(f"{obj.get('id')} unresolved governing design reference {ref}")

    # No historical session/process dependency in handoff text.
    for path in sorted_relative_paths(package, (p for p in package.rglob('*') if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES)):
        try: txt=path.read_text(encoding='utf-8')
        except UnicodeDecodeError: continue
        rel_path=path.relative_to(package).as_posix()
        is_framework = rel_path.startswith('design/.framework/') or rel_path.startswith('delivery/.framework/')
        if not is_framework:
            if re.search(r'(?:^|[./])sessions/', txt): errors.append(f"historical sessions path leaked into {path.relative_to(package)}")
            if re.search(r'\bSession\s+\d{3}\b', txt): errors.append(f"historical Session number leaked into {path.relative_to(package)}")

        # Validate relative markdown file links (ignore anchors, URLs, mailto, absolute package-root links).
        if path.suffix.lower()=='.md':
            for target in parse_markdown_links(txt):
                target=target.strip()
                if not target or target.startswith(('#','http://','https://','mailto:','/')): continue
                target=target.split('#',1)[0]
                if not target: continue
                resolved=(path.parent/target).resolve()
                try: resolved.relative_to(package.resolve())
                except ValueError: errors.append(f"link escapes package in {path.relative_to(package)} -> {target}"); continue
                if not resolved.exists(): errors.append(f"broken package-local link in {path.relative_to(package)} -> {target}")

    # Amendment chain, immutable-target protections, snapshots, and reverse reconstruction.
    validate_amendment_chain(package, manifest, errors)

    # Recommended sequence is explicitly present.
    root_read=(package/'README.md').read_text(encoding='utf-8') if (package/'README.md').exists() else ''
    seq=['/design/.framework/README.md','/delivery/.framework/README.md','/design/README.md','/delivery/AGENT-GUIDE.md','/design/project-context/RULES.md','/design/output/agent/PRD.md','/design/output/agent/SPEC.md','/delivery/REPOSITORY-ORIENTATION.md','/delivery/roadmap.json']
    last=-1
    for item in seq:
        idx=root_read.find(item)
        if idx<0: errors.append(f"root README missing recommended bootstrap entry {item}")
        elif idx<=last: errors.append("root README bootstrap sequence is out of order")
        last=max(last,idx)
    return errors

def deterministic_zip(source: Path, archive: Path) -> None:
    archive.parent.mkdir(parents=True, exist_ok=True)
    if archive.exists(): archive.unlink()
    root_name = source.name
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        # Explicit empty amendments directory plus all other dirs/files, sorted.
        dirs = sorted_relative_paths(source, (p for p in source.rglob('*') if p.is_dir()))
        for d in dirs:
            rel=f"{root_name}/{d.relative_to(source).as_posix()}/"
            zi=zipfile.ZipInfo(rel, date_time=(1980,1,1,0,0,0)); zi.external_attr=0o40755<<16; zi.compress_type=zipfile.ZIP_STORED
            zf.writestr(zi,b'')
        for path in sorted_relative_paths(source, (p for p in source.rglob('*') if p.is_file())):
            rel=f"{root_name}/{path.relative_to(source).as_posix()}"
            zi=zipfile.ZipInfo(rel, date_time=(1980,1,1,0,0,0)); zi.external_attr=0o100644<<16; zi.compress_type=zipfile.ZIP_DEFLATED
            zf.writestr(zi,path.read_bytes())

def main():
    ap=argparse.ArgumentParser(description='DWF internal Portable Implementation Package materializer')
    ap.add_argument('--workspace', required=True, type=Path)
    ap.add_argument('--output', required=True, type=Path)
    ap.add_argument('--package-id', required=True)
    ap.add_argument('--project-title', required=True)
    ap.add_argument('--archive', type=Path)
    ap.add_argument('--origin')
    ap.add_argument('--fresh-agent-status', choices=['PASS','FAIL','NOT_RUN'], default='NOT_RUN')
    ap.add_argument('--fresh-agent-reason', default='genuinely isolated Agent capability unavailable in this runtime')
    ap.add_argument('--validate-only', action='store_true')
    args=ap.parse_args()
    if args.validate_only:
        errs=validate(args.output)
        if errs:
            print('\n'.join(f'ERROR: {e}' for e in errs)); return 1
        print('Layer-1 package integrity: PASS'); return 0
    origin=args.origin or ('PKG'+uuid.uuid4().hex[:10].upper())
    manifest=materialize(args.workspace.resolve(), args.output.resolve(), args.archive.resolve() if args.archive else None, origin, args.fresh_agent_status, args.fresh_agent_reason, args.package_id, args.project_title)
    print(json.dumps({
        'packageOrigin':manifest['packageOrigin'], 'packageDigest':manifest['packageDigest'],
        'integrity':manifest['validation']['integrity']['status'],
        'freshAgentEvaluation':manifest['validation']['freshAgentEvaluation']['status'],
        'dwf':manifest['frameworks']['dwf']['version'], 'dsf':manifest['frameworks']['dsf']['version'],
        'definitionSchema':manifest['frameworks']['dsf']['deliveryDefinitionSchemaVersion']
    },indent=2))
    return 0

if __name__=='__main__':
    raise SystemExit(main())
