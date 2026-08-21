#!/usr/bin/env python3
from pathlib import Path
import sys, zipfile

if len(sys.argv) != 3:
    print("Usage: python scripts/package-course.py <course-dir> <output.zip>", file=sys.stderr)
    raise SystemExit(2)
root=Path(sys.argv[1]).resolve(); out=Path(sys.argv[2]).resolve()
if not root.is_dir():
    print(f"Course directory not found: {root}", file=sys.stderr); raise SystemExit(2)
exclude_dirs={"node_modules","dist","dist-release",".git","__pycache__",".vite"}
exclude_files={".DS_Store","Thumbs.db"}
files=[]
for p in root.rglob('*'):
    if not p.is_file(): continue
    rel=p.relative_to(root)
    if any(part in exclude_dirs for part in rel.parts) or p.name in exclude_files or p.suffix=='.pyc': continue
    files.append((rel,p))
if not files:
    print("No files to package", file=sys.stderr); raise SystemExit(1)
out.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel,p in sorted(files,key=lambda x:x[0].as_posix()):
        info=zipfile.ZipInfo(rel.as_posix(), date_time=(1980,1,1,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        info.external_attr=0o100644 << 16
        z.writestr(info,p.read_bytes())
print(f"PASS source ZIP: {out} ({len(files)} files)")
