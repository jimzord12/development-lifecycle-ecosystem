#!/usr/bin/env python3
"""Small spike validator for the Agent Skills package itself."""
from pathlib import Path
import re
import sys
import yaml

root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]).resolve()
skill = root / "SKILL.md"
errors = []

if not skill.exists():
    errors.append("SKILL.md missing")
else:
    text = skill.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not match:
        errors.append("SKILL.md YAML frontmatter missing/invalid")
    else:
        try:
            fm = yaml.safe_load(match.group(1))
        except Exception as exc:
            errors.append(f"Invalid YAML: {exc}")
            fm = {}
        allowed = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
        unknown = set(fm or {}) - allowed
        if unknown:
            errors.append(f"Unsupported frontmatter keys: {sorted(unknown)}")
        name = (fm or {}).get("name", "")
        desc = (fm or {}).get("description", "")
        if name != root.name:
            errors.append(f"name must match directory: expected {root.name!r}, got {name!r}")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
            errors.append("name must contain lowercase letters/numbers/hyphens only")
        if len(name) > 64:
            errors.append("name exceeds 64 characters")
        if not desc or len(desc) > 1024:
            errors.append("description must be 1-1024 characters")

for expected in ["references", "scripts", "assets/course-template", "evals/evals.json"]:
    if not (root / expected).exists():
        errors.append(f"Missing expected spike resource: {expected}")

if errors:
    print("FAIL skill validation")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print("PASS skill validation")
