# Preservation and terms

## Provenance and integrity

These transcriptions and extracted images were recovered by Marcus Baw in [pacharanero/nhs-cui](https://github.com/pacharanero/nhs-cui) from the National Archives CUI guidance collection. The checked-in [source manifest](source-manifest.json) records the precise source revision, each page and image checksum, the archive URL, copyright/licence information from the existing document inventory, and the canonical local PDF or ZIP member.

The import preserves source-page bytes from the recorded restoration revision and all 2,302 imported PNG bytes. It includes the restoration project's table-reconstruction work and the later corrections to generated titles and contents links. These are transcription/presentation changes, not a clinical-policy update. Some extraction artefacts remain.

The original PDFs remain canonical in `nhs-cui-documents/`. During build, `s/prepare-docs.py` verifies their SHA-256 values and copies the 45 matching PDFs into ignored `docs/pdfs/`. It verifies the text/image corpus too and refuses excluded, missing, unlisted or unexpected staged material. The generated directory and `site/` must never be committed.

## PDF duplication: follow-up work

PDF duplication still needs addressing: the same originals exist in both the restoration repository and this repository's source archive, and building the site produces additional local/published copies. This contribution does not add a second tracked PDF collection here, but does not consolidate the existing archives either. Future work should agree a canonical source of truth, deduplicate the archives where appropriate and preserve stable download links, provenance and document-specific rights. The checksum/member mapping in the source manifest provides evidence for that consolidation.

## Original document rights

Original documents, illustrations and logos retain their owners' rights. The Apache-2.0 licence for library code and new site infrastructure is not a blanket relicensing of the source corpus. See the repository's [NOTICE](https://github.com/giussepe198/common-user-interface/blob/main/NOTICE.md) and [source-document manifest](https://github.com/giussepe198/common-user-interface/blob/main/nhs-cui-documents/manifest.json).

Where the Open Government Licence applies: contains public sector information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). Logo and third-party exclusions still apply. A document's presence in a public archive is not by itself proof of redistribution permission. This contribution follows the repository's existing inventory; it does not make a new legal determination for documents without an explicit licence statement.

## Documents linked rather than imported

These four Microsoft-co-owned documents, their transcriptions and their extracted assets are not included:

- [Display of adverse drug reactions](https://webarchive.nationalarchives.gov.uk/ukgwa/20160921150545mp_/http://systems.digital.nhs.uk/data/cui/uig/advdrugrisks.pdf).
- [Terminology disambiguation and error correction](https://webarchive.nationalarchives.gov.uk/ukgwa/20160921150545mp_/http://systems.digital.nhs.uk/data/cui/uig/disambig.pdf).
- [Care pathways conceptual modelling](https://webarchive.nationalarchives.gov.uk/ukgwa/20160921150545mp_/http://systems.digital.nhs.uk/data/cui/uig/carepathways.pdf).
- [Handover requirements](https://webarchive.nationalarchives.gov.uk/ukgwa/20160921150545mp_/http://systems.digital.nhs.uk/data/cui/uig/cuidesignguide.pdf).

The byte-identical `patben-2` full-guide download is also omitted, rather than misrepresented as the actual quick implementation guide.

## Clinical interpretation

Original historical safety-process statements are source material, not a safety case for this implementation. Tables and figures should be checked against the PDF when used as evidence. Do not infer current clinical policy, national-standard compliance or approval from the existence of the site or component library.
