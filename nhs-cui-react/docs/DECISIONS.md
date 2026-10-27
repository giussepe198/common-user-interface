# Decisions, conflicts and gaps

Where the source documents disagree or say nothing, the build had to choose. The safer option was taken each time. Component READMEs mark these choices `[suggested]`; items the regional notes mark uncertain are implemented as configurable data with the default stated in the README.

## Regions

Every region-aware control reads `ClinicalLocaleProvider` (GB, AU, NZ) or takes a `region` prop. GB is the default and behaves exactly as the NHS CUI guidance describes. AU follows ACSQHC, ADHA, ABS/METeOR, Australia Post and ACMA (notes: `guidance-notes/G10-australia.md`). NZ follows HISO, HQSC, Stats NZ and NZ Post (notes: `guidance-notes/G11-new-zealand.md`).

### Before production use, verify against the primary sources

- **Lettering lists.** The AU National Mixed-Case Lettering List (Apr 2024) and the NZ HQSC Tall Man list (Oct 2023) casing came from text extraction. Check against the PDF and XLSX.
- **NZEWS.** Bands, colours and escalation thresholds are transcribed from the HQSC chart. Heart rate 120s follows the chart (scores 2), not the user guide. Yellow, orange and red response wording is placeholder for local set-up. Needs clinical sign-off.
- **AU ADDS.** Published bands are captured; every score and colour is a placeholder (ACSQHC itself calls the cut-offs placeholders) and the chart says so on screen.
- **GB NEWS2** values are from the published RCP chart; the response colours are this library's choice.
- **SNOMED CT edition identifiers.** Module, edition URI and refset ids (especially NZ, including te reo) are configurable through `edition` and must be checked against current release notes.
- **Te reo Māori labels** beyond the HISO value sets, and the HISO 10001 "Other" line wording, need checking by the standard owners or a qualified translator.
- **Identifier display grouping.** IHI/HPI 4-4-4-4 and Medicare 4-5-1 groupings have no official rule; NHI is shown as seven unbroken characters. NZ HPI is checked for format only (no published check algorithm).

### Regional choices

- **Dates.** AU and NZ keep `dd-Mmm-yyyy` on screen (the ACSQHC on-screen guideline uses it). Numeric dates are read day first without asking, and month-first entry is refused. AU uses "Thur" in day abbreviations, per ACSQHC 2024. A DD/MM/YYYY option exists on the banner to match wristbands.
- **Time zones.** Daylight saving comes from the platform time zone database for every zone, including Lord Howe (30 minutes) and Chatham (+12:45). "Today" and "now" use the locale's time zone in AU and NZ.
- **Midnight.** ACSQHC 2024 advises against scheduling doses at 00:00. `TimeInput` can warn (`warnAtMidnight`, off by default) and AU drug chart lines at 00:00 or 24:00 carry a note.
- **Names.** Family names are upper case in GB and AU banners and kept as recorded in NZ (HISO 10046). Macrons are normalised to NFC and never stripped; search may ignore them, display never does. AU and NZ support "This person has only one name".
- **Sex and gender.** AU uses the ABS 2020 standard (sex recorded at birth plus gender, METeOR codes). NZ shows gender with the HISO 10046 codes F/M/O/U and te reo labels when `teReoLabels` is on.
- **Allergies.** AU: "Nil known", "Unknown", "Not recorded". NZ: three explicit states, and "Unknown" needs a reason. In every region an empty list is a "Not recorded" warning, never "no known".
- **Medicines.** AU follows the ACSQHC on-screen guideline: 16-element order with strength first, ingredient bold lower case, brand in Title Case italic after an en dash, never truncated, units spelt out. NZ keeps the GB order with HQSC rules. NZ brand names are Title Case, not capitals, so Tall Man lettering stays readable. Mixed-case lettering is on by default for AU and NZ, and screen readers get the plain name.
- **Abbreviations.** GB, AU (ACSQHC 2024) and NZ (HQSC) each have their own do-not-use list and accepted terms. In AU, single-letter terms such as D are flagged only after a number, so "vitamin D" passes.
- **Administration codes.** AU NIMC: A, F, R, V, L, N, W, S, plus circled P on paediatric charts. NZ HQSC: CP, D, N, R, RV, SM, U, W. In AU a late or early dose shows a tick, because L means "On leave". NZ has no Nil by Mouth code, so skipping a dose records D.
- **Addresses.** AU postcode and state mismatches warn but never block. "2/14 Smith St" is split as unit 2. NZ rural delivery is normalised to "RD 2".

## Across the library

- **Colours and fonts.** No source document gives a palette. `design/tokens.json` is this library's own, keeps the fixed colour meanings and passes WCAG contrast in light and dark. The early warning zone colours use the HQSC published fills in light theme (as local CSS custom properties `--ews-zone-*`).
- **Accessibility target** is WCAG 2.2 AA, which meets the NZ Web Accessibility Standard 1.2 and the AU Digital Service Standard.
- **"cuidesignguide.pdf"** is the Release 4 handover requirements spreadsheet. Handover layout and wording are suggestions.
- The deceased patient banner uses a hatch pattern so the state does not rely on colour.

## NHS CUI conflicts (GB)

- Family name maximum 40 characters (QIG and PDS), not 35. Title optional. Banner label "Gender" with a definition.
- The documents' example NHS number 129 728 7652 fails Modulus 11; previews use 999 000 0018, 0026, 0034.
- PAL-0470/0480 captions are swapped in the source; the rule text was followed. FSG-0027 OR-by-default kept as written.
- Medication separator is an en dash as in every rendered example. No black triangles anywhere; chevrons for disclosure, arrows for sort.
- Command bar order Cancel, Preview, Authorise, so Authorise sits bottom right (MSP-2290).
- `ClinicalRadioGroup` has no default selection (Elaboration 2.3.2) against CNA-1930; `defaultSelection="first"` restores CNA-1930.
- Terminology 2007 vs 2011: 10 visible rows, wrap by default, 62-character truncation option, no numbering, minimum 2 characters, semantic tags never shown. "Known absent" (410516002) used for negation.

## Phase 3 additions (identity, observations, finishing items)

- **My Health Record** (`MyHealthRecordStatus`): 11 access states, record and limited document access codes, emergency access with the ADHA declaration, a reason, a ground and an audit acknowledgement. The declaration's last words differ between the ADHA developer guide ("or to public health") and OAIC ("public health or safety"); it is configurable. Wording for "not connected" and "unavailable" is [suggested].
- **Medicare valid to** is MM/YYYY with "Card expired" and "Card expires soon" (1 month, [suggested]).
- **NZ protection flags** (HISO 10046): names show with a "Protected" indicator; addresses are masked by default and reveal only with a reason. No source sets these display rules, so they are [suggested].
- **Dormant NHI** shows the live NHI with a "Use live NHI" action; `NhiInput` warns through a host lookup.
- **Partial dates of birth** are stored as YYYY[MM[DD]]; ages show as a range when ambiguous ("50y or 51y"). Year-only or year-month strings passed to the banner are now partial, not 01-Jan.
- **Ethnicity output** follows HISO 10001 Appendix A (level aggregation, reduce to six or three). Prioritisation exists only as a reporting utility; no "principal" ethnicity is ever displayed.
- **Sensitive questions** (variations of sex characteristics, sexual orientation; AU ABS 2020, NZ Stats NZ) render nothing unless enabled and hide answers until shown. ABS alternative options without published codes are not offered.
- **Indigenous status** interviewer variant uses the METeOR two-step question. The self-completed "both" instruction keeps its earlier wording; the verified METeOR text is available as `bothInstructionMeteor` and should become the default once confirmed.
- **NSW Between the Flags** (`EWS_NSW_BTF`) zone boundaries come from secondary SESLHD sources because the SAGO chart prints zones as colour bands only. Shared boundary values were placed in the red zone. Verify every boundary against the printed chart and local CERS changes.
- **Critical thresholds** (GTAB-177) count the limit itself as critical unless `inclusive: false`, and never change an early warning score.
- **AU long dates** follow the Australian Government Style Manual ("5 March 2026"); short dates stay dd-Mmm-yyyy.
- **Drag handles** (note entries, marquee handles, canvas) are pointer-only; the same actions exist on the keyboard.

## Phase 4: mobile (touch and dictation)

- **Direction.** Task-first worklist (B) as the nursing home screen, patient-first record (A) for review, voice capture (C) as a mode in both; shared patterns P1 to P4. Concepts: `mobile-concepts/`.
- **Speech.** The consumer supplies the engine. The optional `WebSpeechEngine` may send audio to the browser vendor's cloud; check this against Privacy Act obligations (AU and NZ) before enabling it for patient data.
- **Teen/ty confusion** ("fifteen"/"fifty") is flagged only when both readings fall inside a plausible range for that parameter; digits from the engine are treated as possibly misheard too, so "one forty on eighty" asks 140/80 or 114/80. Nothing is inferred that was not heard.
- **Dose plausibility.** A ten-fold or greater difference, or the same number in a different unit, forces "Use prescribed" or "Keep as heard". Smaller differences are listed without blocking.
- **Administration checks** (minimum interval, rolling 24-hour maximum, part tablets) are warnings that need an "I have checked these warnings" tick, not hard blocks (MEDa-0136 says advisory). Wristband and product scans must match before recording.
- **Worklist tolerance** is 30 minutes either side of the due time [suggested]. Similar names are detected across the worklist, ignoring macrons.
- **Hold-to-confirm** defaults to 1.5 seconds; a tap, keyboard or screen reader opens a confirm dialog instead.
- **Sheets** push a browser history entry so Android back closes them; turn off per sheet if it conflicts with your router. Sheets holding unsaved data refuse swipe, backdrop and back dismissal.
- **Dates without a year** typed on mobile ("5/4", "12 Mar") take the most recent past date and the read-back says "year assumed". Future times are blocked by default.
- **Undo window** after a commit is 10 seconds.

## Not built yet

- MicroPatientBanner does not yet show partial dates of birth, protection flags or My Health Record status.
- DateTimeDisplay and CalendarPicker still use the CUI screen-reader date form in AU.
- GTAB-177 target ranges (critical thresholds are built).
- Replacing free text with template values (Theme 6 leaves this to the host) and the icon beside an encoded term (Theme 5).
- **Experimental** (from consultation documents, not baselined guidance): ClinicalStatement, StatementList, template controls, care pathway controls.
