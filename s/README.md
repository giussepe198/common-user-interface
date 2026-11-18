# Source-reference site scripts

These scripts build the new root `docs/` site only. Existing React library scripts under `nhs-cui-react/` are unchanged. Install Python 3.11+ and `requirements.txt` in a virtual environment first.

| Script | Purpose |
| --- | --- |
| `s/docs` | Verify/stage source PDFs, preview on the first free port in 8000-8030 and open the browser. Use `DOCS_OPEN=0` to disable browser opening or `--dev-addr` to choose a port. |
| `s/build-docs` | Verify/stage PDFs and build `site/` with strict link/anchor validation. |
| `s/test-docs` | Run regression tests, checksum/redistribution checks and navigation/local-link validation. |
| `s/check-docs` | Check all pages are navigable and their local file links exist. Run preparation first. |
| `s/prepare-docs.py` | Verify `docs/source-manifest.json`, source pages, PNGs and canonical PDFs; stage generated `docs/pdfs/`. No downloads or optional PDF tooling. |

If a preserved page or image changes intentionally, review it against its original and update its manifest checksum in the same change. Do not regenerate all checksums merely to silence a failing test. An unlisted file or extra staged PDF is an error, not silently published material.

The PR adds a build/check workflow, not a Pages deployment. The maintainer can choose the final publishing URL and enable deployment separately. A generated site can also be served under a different base URL by changing `site_url` in `mkdocs.yml`.
