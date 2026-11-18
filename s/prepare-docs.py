#!/usr/bin/env python3
"""Verify the imported corpus and stage existing canonical PDFs for Zensical.

No network or PDF extraction dependency is needed. Nothing in nhs-cui-documents/
is modified. Generated docs/pdfs/ is ignored and must never be committed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import zipfile

EXCLUDED = {"advdrugrisks", "disambig", "carepathways", "cuidesignguide", "patben-2"}


def inside(base: Path, relative: str) -> Path:
    path = (base / relative).resolve()
    if not path.is_relative_to(base.resolve()):
        raise ValueError(f"Path escapes its source directory: {relative}")
    return path


def verify(path: Path, expected: str) -> None:
    with path.open("rb") as stream:
        actual = hashlib.file_digest(stream, "sha256").hexdigest()
    if actual != expected:
        raise ValueError(f"Checksum mismatch: {path}")


def prepare(root: Path) -> int:
    root = root.resolve()
    docs = inside(root, "docs")
    source_directory = inside(root, "nhs-cui-documents")
    staged = inside(docs, "pdfs")
    manifest = json.loads((docs / "source-manifest.json").read_text())
    if manifest.get("format_version") != 1:
        raise ValueError("Unsupported source manifest version")
    rights = {row["file"]: row for row in json.loads((root / "nhs-cui-documents/manifest.json").read_text())}
    expected_files = {"guidance/index.md"}
    payloads: dict[Path, bytes] = {}
    for row in manifest["documents"]:
        page = inside(docs, row["page"])
        if page.stem in EXCLUDED:
            raise ValueError(f"Excluded document in site manifest: {row['page']}")
        if row["page"] in expected_files:
            raise ValueError(f"Duplicate page: {row['page']}")
        expected_files.add(row["page"])
        verify(page, row["page_sha256"])
        for name, checksum in row["images"].items():
            if not name.startswith(page.with_suffix("").relative_to(docs).as_posix() + "_assets/"):
                raise ValueError(f"Image is not scoped to its source document: {name}")
            expected_files.add(name)
            verify(inside(docs, name), checksum)
        source = inside(source_directory, row["upstream_file"].removeprefix("nhs-cui-documents/"))
        entry = rights.get(source.name)
        if not entry or entry.get("redistributed") is not True:
            raise ValueError(f"Source is not permitted by the existing document manifest: {source.name}")
        if "zip_member" in row:
            with zipfile.ZipFile(source) as archive:
                # Read a named member; never extract an archive path to the filesystem.
                data = archive.read(row["zip_member"])
        else:
            data = source.read_bytes()
        if hashlib.sha256(data).hexdigest() != row["pdf_sha256"]:
            raise ValueError(f"Canonical PDF checksum mismatch: {row['page']}")
        destination = inside(staged, row["pdf"].removeprefix("pdfs/"))
        if destination in payloads:
            raise ValueError(f"Duplicate staged PDF: {row['pdf']}")
        payloads[destination] = data
    actual_files = {p.relative_to(docs).as_posix() for p in (docs / "guidance").rglob("*") if p.is_file()}
    if actual_files != expected_files:
        raise ValueError(f"Unlisted or missing guidance files: {sorted(actual_files ^ expected_files)}")
    if staged.exists():
        extra = {p.resolve() for p in staged.rglob("*") if p.is_file()} - set(payloads)
        if extra:
            raise ValueError(f"Unexpected staged files; inspect before removing them: {sorted(map(str, extra))}")
    # Validate everything before writing any generated files.
    for destination, data in payloads.items():
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    return len(payloads)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    try:
        count = prepare(args.root)
    except (ValueError, KeyError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Cannot prepare source documentation: {error}\n")
    print(f"Verified corpus and staged {count} canonical PDFs into ignored docs/pdfs/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
