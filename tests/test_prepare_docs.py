"""Preparation fails closed on corpus drift and reuses only existing canonical sources."""

import hashlib
import json
from pathlib import Path
import runpy
import tempfile
import unittest
import zipfile

prepare = runpy.run_path(str(Path(__file__).resolve().parents[1] / "s/prepare-docs.py"))["prepare"]
sha = lambda data: hashlib.sha256(data).hexdigest()


class PreparationChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.docs = self.root / "docs"
        (self.docs / "guidance/a_assets").mkdir(parents=True)
        (self.docs / "guidance/index.md").write_text("# Collection\n")
        (self.docs / "guidance/a.md").write_text("# A\n")
        (self.docs / "guidance/a_assets/a.png").write_bytes(b"image fixture")
        self.sources = self.root / "nhs-cui-documents"
        self.sources.mkdir()
        (self.sources / "a.pdf").write_bytes(b"source fixture")
        self.rights = [{"file": "a.pdf", "redistributed": True}]
        self.row = {
            "page": "guidance/a.md", "page_sha256": sha(b"# A\n"),
            "images": {"guidance/a_assets/a.png": sha(b"image fixture")},
            "upstream_file": "nhs-cui-documents/a.pdf", "pdf": "pdfs/a.pdf",
            "pdf_sha256": sha(b"source fixture"),
        }
        self.save()

    def save(self):
        (self.sources / "manifest.json").write_text(json.dumps(self.rights))
        (self.docs / "source-manifest.json").write_text(json.dumps({"format_version": 1, "documents": [self.row]}))

    def test_stages_and_can_repeat_without_network(self):
        self.assertEqual(prepare(self.root), 1)
        self.assertEqual((self.docs / "pdfs/a.pdf").read_bytes(), b"source fixture")
        self.assertEqual(prepare(self.root), 1)

    def test_existing_zip_member_is_verified_and_staged(self):
        with zipfile.ZipFile(self.sources / "pack.zip", "w") as z:
            z.writestr("folder/a.pdf", b"source fixture")
        self.row.update(upstream_file="nhs-cui-documents/pack.zip", zip_member="folder/a.pdf")
        self.rights = [{"file": "pack.zip", "redistributed": True}]
        self.save()
        self.assertEqual(prepare(self.root), 1)

    def test_rejects_changed_page_image_or_pdf_before_writing(self):
        for relative in ["docs/guidance/a.md", "docs/guidance/a_assets/a.png", "nhs-cui-documents/a.pdf"]:
            with self.subTest(relative=relative):
                path = self.root / relative
                before = path.read_bytes()
                path.write_bytes(b"changed")
                with self.assertRaisesRegex(ValueError, "checksum|Checksum"):
                    prepare(self.root)
                self.assertFalse((self.docs / "pdfs").exists())
                path.write_bytes(before)

    def test_respects_existing_redistribution_boundary(self):
        self.rights[0]["redistributed"] = False
        self.save()
        with self.assertRaisesRegex(ValueError, "not permitted"):
            prepare(self.root)

    def test_rejects_excluded_document_even_with_a_matching_digest(self):
        self.row["page"] = "guidance/advdrugrisks.md"
        self.save()
        with self.assertRaisesRegex(ValueError, "Excluded"):
            prepare(self.root)

    def test_rejects_unlisted_assets(self):
        (self.docs / "guidance/a_assets/extra.png").write_bytes(b"extra")
        with self.assertRaisesRegex(ValueError, "Unlisted"):
            prepare(self.root)

    def test_rejects_extra_staged_pdf(self):
        (self.docs / "pdfs").mkdir()
        (self.docs / "pdfs/extra.pdf").write_bytes(b"extra")
        with self.assertRaisesRegex(ValueError, "Unexpected staged"):
            prepare(self.root)

    def test_rejects_paths_escaping_source_directory(self):
        self.row["pdf"] = "pdfs/../../escape.pdf"
        self.save()
        with self.assertRaisesRegex(ValueError, "escapes"):
            prepare(self.root)

    def test_rejects_staging_directory_symlink_outside_docs(self):
        with tempfile.TemporaryDirectory() as elsewhere:
            (self.docs / "pdfs").symlink_to(elsewhere, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "escapes"):
                prepare(self.root)


if __name__ == "__main__":
    unittest.main()
