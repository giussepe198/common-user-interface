# Notice

Common User Interface
Copyright 2026 Gabe Rijpma

The code and documentation in `nhs-cui-react/` are licensed under the Apache License, Version 2.0 (see `LICENSE`). The source documents in `nhs-cui-documents/` are not covered by that licence; their terms are set out below.

## Attribution

Contains public sector information licensed under the Open Government Licence v3.0.
https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

The control library in `nhs-cui-react/` is an independent work based on the NHS Common User Interface (CUI) design guidance, produced for NHS Connecting for Health and later published by the Health and Social Care Information Centre (HSCIC), in collaboration with Microsoft. The guidance was retrieved from the UK Government Web Archive (The National Archives).

This project is not endorsed by, affiliated with or approved by the NHS, NHS England, the Department of Health and Social Care, the Health and Social Care Information Centre or Microsoft. No official status is claimed. The NHS name and logo are protected marks and are not used to identify this project.

## Source documents and their terms

The copyright line and licence status of every document are recorded in `nhs-cui-documents/manifest.json`.

| Group | Documents | Terms |
| --- | --- | --- |
| Open Government Licence | 42 documents, including patient banner, patient name, NHS number, address, telephone, sex and gender, date and time input and display, time display, medication line, medications list, search and prescribe, drug administration, recording adverse drug risks, decision support, icons and symbols, alert symbols, keyboard shortcuts, abbreviations, display standards, filtering, patient list view, timeline view, displaying graphs, clinical noting, noting with graphics, using templates, terminology matching, post-coordination and elaboration | Each states: "You may re-use this information (excluding logos) free of charge in any format or medium, under the terms of the Open Government Licence." Reused and adapted here with attribution. |
| Crown copyright, no licence statement | Suggestions for implementing SNOMED CT in an EHS (`cd_impsnomd_ehs.pdf`, © Crown Copyright 2011) | Included as Crown copyright material from the UK Government Web Archive, which the National Archives says may generally be reused under the Open Government Licence. |
| HSCIC copyright, no licence statement | Clinical statements, truncation, handover presentation introduction, telephone number QIG, decision support summary slides, and the CUI compliance document and checklist inside `patident.zip` | Included as published on the UK Government Web Archive. They carry no explicit licence line; the same publisher released its other CUI documents under the Open Government Licence. |
| Microsoft and Crown copyright | Display of adverse drug reactions (2009), care pathways conceptual modelling (2007), handover requirements (`cuidesignguide.pdf`, 2007), terminology disambiguation and error correction (2006) | Not covered by the Open Government Licence, which excludes third-party rights. **Not redistributed in this repository.** Read them at the National Archives urls in `manifest.json`. |

The library code implements the rules and behaviours described in the guidance; it does not reproduce the documents. The distilled notes in `nhs-cui-react/docs/guidance-notes/` summarise and quote the guidance to make the implementation traceable. Notes G3 (handover and terminology disambiguation), G5 (adverse drug reaction display) and G7 (care pathways) draw in part on the four Microsoft co-owned documents; anyone redistributing the notes commercially may wish to confirm permission with Microsoft for that material.

## Other sources

The Australian and New Zealand rules in `nhs-cui-react/docs/guidance-notes/G10-australia.md`, `G11-new-zealand.md` and `G12-identity-extensions.md` cite their sources (ACSQHC, Australian Digital Health Agency, Services Australia, ABS and METeOR, HISO, HQSC, Stats NZ and others) item by item. Those organisations' publications keep their own terms; the notes paraphrase and cite them, and value sets and codes are reproduced for interoperability.

SNOMED CT is a registered trademark of SNOMED International. Use of SNOMED CT content requires an appropriate licence (in Australia through the National Clinical Terminology Service, in New Zealand through Te Whatu Ora, in the UK through NHS England). The library ships no SNOMED CT content; the examples use fictional concept identifiers.
