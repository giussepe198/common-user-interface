# Common User Interface: a modern take on the NHS CUI

A React and TypeScript set of clinical user interface controls, built from the NHS Common User Interface (CUI) design guidance and extended for Australia and New Zealand, desktop and mobile, touch and dictation.

## Why this project exists

Over many years the NHS, working with Microsoft, put a great deal of careful work into the Common User Interface programme. Clinicians, designers, human factors specialists and engineers studied how people read and enter clinical information, and where screens lead to mistakes. The result was a detailed body of guidance: how to show a patient's name and NHS number so the wrong patient is not selected, how to write dates so 05/04 is never misread, how to lay out a medication line so a dose cannot be confused, how to display allergies, observations, drug charts and clinical notes.

The programme was eventually wound down and its documents were archived with the UK National Archives in 2019. The thinking in them has not dated. Most of the patient safety problems they addressed are still with us, and many clinical systems in use today still get the basics wrong.

I wanted that work to be usable again. Guidance in PDFs is hard to apply; working, tested controls are easy. This project turns the CUI guidance into components a developer can drop into an application, and brings it up to date:

- React 18 and TypeScript, accessible to WCAG 2.2 AA, with light and dark themes.
- Australian and New Zealand standards layered on top of the NHS rules (ACSQHC, ADHA, ABS and METeOR in Australia; HISO, HQSC and Stats NZ in New Zealand), so the same controls are right in the UK, Australia and New Zealand.
- Mobile controls designed for touch, gloves and small screens, and voice dictation that never saves anything until each value has been read back and confirmed.

The original guidance made it possible to build a UI framework and controls that software developers, vibe coders and anyone who cares about doing digital health well can pick up and use with confidence.

## Who it is for

- **Software developers** building clinical systems who want safe defaults rather than reinventing patient banners, date inputs and medication lists.
- **Vibe coders and AI-assisted builders** who need well-documented components with clear rules, so the code they generate starts from good clinical practice.
- **Designers, clinicians and digital health teams** who want a shared reference for what a safe clinical screen looks like.

## What is in this repository

| Folder | What it holds |
| --- | --- |
| `nhs-cui-documents/` | The original NHS CUI guidance documents, as retrieved from the UK National Archives, with `links.json` and `manifest.json` recording where each came from. |
| `nhs-cui-react/` | The control library: source, tests, design tokens, documentation and worked examples. Start with its own `README.md`. |

Inside `nhs-cui-react/`:

- **About 180 documented controls**: patient banner and identifiers, dates and times, medications and prescribing, drug administration and decision support alerts, lists and filtering, observation charts and early warning scores, clinical noting and SNOMED CT terminology, and mobile touch and voice controls.
- **Regional behaviour** for the UK, Australia and New Zealand, set once with `ClinicalLocaleProvider`. Examples include NHS number, IHI, Medicare and NHI identifiers; national allergy wording; drug chart codes; mixed-case (Tall Man) drug name lettering; and early warning presets (NEWS2, ADDS, NZEWS).
- **Traceability**: every control's README cites the guideline IDs it implements. `docs/guidance-notes/` holds the distilled rules from all the source documents, and `docs/DECISIONS.md` records where sources disagree and what was chosen.
- **Worked examples**: ten screens built only from the library, from a ward drug round to a nurse's medication round on a phone. Open `docs/site/index.html` in a browser to explore them with region and theme switches, or read the TSX in `examples/`.

## Getting started

```bash
cd nhs-cui-react
npm install
npm run build        # bundle, styles, type declarations
npm test             # unit and component tests
npm run examples     # rebuild the worked examples
open docs/site/index.html
```

## Status and clinical safety

This is a design and engineering reference, not a certified medical device. The controls implement published guidance as faithfully as possible, but any system that uses them still needs its own clinical safety assessment before going near patients. That means the clinical risk management standards that apply where you work (for example DCB0129 and DCB0160 in England), and local sign-off of anything marked as needing verification in `docs/DECISIONS.md`, such as early warning score bands. All patients and data in the examples are fictional and use test identifiers.

Contributions, corrections and suggestions are welcome, particularly from clinicians and from people who worked on the original programme.

## Acknowledgements

The NHS CUI guidance was produced for NHS Connecting for Health and later maintained by the Health and Social Care Information Centre, in partnership with Microsoft. The original documents remain the copyright of their owners (they carry Crown and HSCIC copyright notices) and are included here as reference material, as published on the UK National Archives. This project is an independent work and is not endorsed by the NHS, NHS England or Microsoft.

## About me

I'm Gabe Rijpma, based in New Zealand. I spent 20 years at Microsoft, 12 of them in healthcare across Asia, and have worked in digital health ever since. I co-founded and sold Aceso Health in New Zealand, was CEO of CardioNexus and currently building a number of digital health solutions in my spare time. I've been programming since I was a child, starting with Basic and 6502 assembly on 8-bit computers.

## Contact

Gabe Rijpma: [gabe.rijpma@outlook.com](mailto:gabe.rijpma@outlook.com)

## Licence

- **Code and documentation in `nhs-cui-react/`:** Apache License 2.0. See [LICENSE](LICENSE).
- **Source documents in `nhs-cui-documents/`:** these keep their own terms. Most are published under the UK Open Government Licence v3.0, which allows reuse and adaptation, including commercial use, with attribution. Four documents co-owned by Microsoft are not included and are linked instead. Full details, including the attribution statement, are in [NOTICE.md](NOTICE.md).
