"""Tests exercise observable nav/link failures without network access or the real corpus."""

from pathlib import Path
import runpy
import tempfile
import unittest

check = runpy.run_path(str(Path(__file__).resolve().parents[1] / "s/check-docs.py"))["check"]


class DocumentationChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.docs = self.root / "docs"
        self.docs.mkdir()
        (self.root / "mkdocs.yml").write_text("nav:\n  - Home: index.md\n")
        (self.docs / "index.md").write_text("# Home\n")

    def test_minimal_site(self):
        self.assertEqual(check(self.root), [])

    def test_orphan_is_not_silently_built(self):
        (self.docs / "orphan.md").write_text("# Orphan\n")
        self.assertIn("Not in nav: orphan.md", check(self.root))

    def test_nav_missing_page(self):
        (self.root / "mkdocs.yml").write_text("nav:\n  - Missing: missing.md\n")
        self.assertIn("Nav target missing: missing.md", check(self.root))

    def test_image_and_pdf_links(self):
        (self.docs / "index.md").write_text("![Figure](missing.png)\n[Source](missing.pdf)\n")
        self.assertEqual(len(check(self.root)), 2)
        (self.docs / "missing.png").write_bytes(b"image")
        (self.docs / "missing.pdf").write_bytes(b"pdf")
        self.assertEqual(check(self.root), [])

    def test_relative_paths_encoded_names_and_external_urls(self):
        (self.docs / "images").mkdir()
        (self.docs / "images/a b.png").write_bytes(b"image")
        (self.docs / "index.md").write_text('![Figure](images/a%20b.png "Figure")\n[Archive](https://example.org/missing.pdf)\n[Section](#home)\n')
        self.assertEqual(check(self.root), [])

    def test_paths_cannot_escape_docs(self):
        (self.root / "private.txt").write_text("not part of the site")
        (self.docs / "index.md").write_text("[Outside](../private.txt)\n")
        self.assertEqual(len(check(self.root)), 1)

    def test_duplicate_nav_entry(self):
        (self.root / "mkdocs.yml").write_text("nav:\n  - Home: index.md\n  - Again: index.md\n")
        self.assertIn("Duplicate page in nav", check(self.root))

    def test_group_heading_is_not_a_page_target(self):
        (self.root / "mkdocs.yml").write_text("nav:\n  - A group:\n      - Home: index.md\n")
        self.assertEqual(check(self.root), [])

    def test_logo_and_favicon_must_exist(self):
        (self.root / "mkdocs.yml").write_text("theme:\n  logo: logo.svg\n  favicon: favicon.svg\nnav:\n  - Home: index.md\n")
        self.assertEqual(len(check(self.root)), 2)
        (self.docs / "logo.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
        (self.docs / "favicon.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
        self.assertEqual(check(self.root), [])


if __name__ == "__main__":
    unittest.main()
