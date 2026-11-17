#!/usr/bin/env python3
"""Check this site's explicit nav and local inline file links using only the standard library.

Anchor validation is performed by `zensical build --strict`, not duplicated here.
Remote historical links are deliberately not fetched in CI.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

NAV_PAGE = re.compile(r"^[ \t]*-[ \t]+[^\n]+:[ \t]+([^\n]+\.md)[ \t]*$", re.MULTILINE)
INLINE_LINK = re.compile(r"!?\[[^\]\n]*\]\(([^\)\n]+)\)")


def check(root: Path) -> list[str]:
    docs = (root / "docs").resolve()
    nav = NAV_PAGE.findall((root / "mkdocs.yml").read_text())
    pages = {p.relative_to(docs).as_posix() for p in docs.rglob("*.md")}
    errors = [f"Not in nav: {p}" for p in sorted(pages - set(nav))]
    errors += [f"Nav target missing: {p}" for p in sorted(set(nav) - pages)]
    if len(nav) != len(set(nav)):
        errors.append("Duplicate page in nav")
    for page in sorted(docs.rglob("*.md")):
        for raw in INLINE_LINK.findall(page.read_text()):
            # Optional quoted Markdown titles are not part of the target URL.
            target = raw.strip().split(' "', 1)[0].strip("<>")
            url = urlsplit(target)
            if url.scheme or url.netloc or not url.path:
                continue
            path = unquote(url.path)
            dest = (docs / path.lstrip("/") if path.startswith("/") else page.parent / path).resolve()
            if not dest.is_relative_to(docs) or not dest.exists():
                errors.append(f"{page.relative_to(docs)}: missing local target {target}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    errors = check(args.root)
    for error in errors:
        print(error)
    if not errors:
        print("Navigation covers every page; local image, PDF and page targets exist.")
    return bool(errors)


if __name__ == "__main__":
    raise SystemExit(main())
