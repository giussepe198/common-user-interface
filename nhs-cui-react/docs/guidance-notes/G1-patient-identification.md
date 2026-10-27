# Patient identification

Sources: NHS CUI full design guides (v-numbers below) plus their Quick Implementation Guides (QIGs, Edition 1, 22-Apr-2010) and the CUI CAPS compliance pack/checklist. Where a QIG or checklist differs from the full guide, the full guide is definitive (each QIG says so) and the difference is flagged as **[DISCREPANCY]**. "M" = Mandatory, "R" = Recommended. All figures in the source PDFs were lost in text conversion; only figure captions and inline example strings survive.

Cross-cutting conventions (apply to every control in this group):
- Stylistic choices (fonts, colours, icons) in illustrations are NOT part of the guidance unless stated. No hex colours, font sizes or pixel dimensions are given anywhere in this group.
- Every guide requires conformance to "Accessibility Checkpoints for NHS Applications" and "Accessibility for Clinical Applications" (not in this group).
- Scope is desktop/laptop, minimum 1024 x 768, keyboard + pointing device (except Micro Patient Banner: PDA, >= 240 x 320 and < 1024 x 768, stylus).
- Out of scope everywhere: data storage format, RTL/Cyrillic/ideographic languages, display styles (font size/colour), form-level layout.

---

## Design Guide Entry – Patient Banner, v4.0.0.0 (patben)

- Purpose: defines the desktop Patient Banner (PAB): the fixed header area that shows the minimum data set for identifying the patient whose record is open and matching it to the person and artefacts (samples, letters, wristbands, X-rays).

### Normative guidance

Structure and composition (2.1)
- PAB-0001 (R): Banner consists of two zones, Zone 1 and Zone 2.
- PAB-0073 (M): Banner must include Zone 1.
- PAB-0002 (M): Zone 1 holds information that facilitates patient identification.
- PAB-0074 (R): Banner should include Zone 2.
- PAB-0003 (M): Zone 2 holds supplementary information that supports identification or assists care.
- PAB-0004 (M): If Zone 2 is used, default display = Zone 1 + Zone 2 **collapsed**.
- PAB-0005 (M): Zone 2 consists of **five sections**.
- PAB-0075 (M): Zone 2 must have expand and collapse capability.
- PAB-0006 (M): All five Zone 2 sections expand and collapse **together** (single toggle, not per section).
- PAB-0007 (M): When mouse is over collapsed Zone 2, show a tooltip stating Zone 2 can be expanded. QIG example text: "Click to expand for more detail".
- PAB-0008 (M): Role-based access control: e.g. do not show clinical information such as allergy propensities to non-clinical users.

Application context and positioning (2.2)
- Banner is used only when a single patient record has been selected and opened.
- PAB-0009 (M): at the top of the application window (QIG figure: below Title Bar and Global Navigation).
- PAB-0010 (M): horizontal across the screen, not vertical.
- PAB-0011 (M): fixed position, unmovable by the user.
- PAB-0012 (M): occupies the full width of the application window.
- PAB-0013 (R): not obscured by other screen elements.
- PAB-0014 (M): distinct visual styling, e.g. thick border or distinguishing background colour, contrasting with the rest of the UI.
- PAB-0015 (R): do not show the banner on screens containing information about more than one patient.
- Note 2.2.3: NHS Data Dictionary family/last name field up to 35 characters; banner must be horizontal to avoid wrapping.

Minimum data set (2.3)
- PAB-0016 (M): Always display name (family name, given name, title), date of birth, gender, NHS number **in this order**.
- PAB-0076 (M): Tab order between identification data matches display order: name, date of birth, gender, NHS number.
- PAB-0017 (M): Living patient: also contact details (address and phone numbers) and age.
- PAB-0018 (M): Deceased patient: also last known contact details (address, phone numbers), date of death, age at death.
- PAB-0019 (M): Unknown/unavailable item: show a blank string or self-explanatory text (e.g. "Not Known") immediately after its label; **never "?"**. User research: "?" or "-" for missing data confused users. QIG example: "Phone and email Not Known".
- PAB-0020 (R): Display preferred name if available. Only the **given name portion** of the PDS preferred name is shown.
- PAB-0021 (R): Do not display a photograph.
- Rationale note: alternative IDs (e.g. hospital number) may be needed where NHS number unsupported; guidance deferred.

Information groupings (2.4)
- PAB-0022 (M): Name elements, date of birth, gender, NHS number in Zone 1.
- PAB-0023 (M): Age of a living patient in Zone 1.
- PAB-0024 (M): Deceased: date of death and age at death in Zone 1.
- PAB-0025 (M): Zone 2 section 1 title: as much of the address as fits on one line, with an ellipsis if incomplete (example "Address 340 Gloucester R...").
- PAB-0026 (M): Expanded section 1: full address including postcode.
- PAB-0027 (M): Precede full address with label "Usual address", "Temporary address", or one of the PDS temporary-address types.
- PAB-0028 (M): Zone 2 section 2 title: as much of a single phone number as fits on one line, ellipsis if incomplete (example "Phone and email 020 8123...").
- PAB-0029 (M): Expanded section 2: contact numbers and email in order **Home, Work, Mobile, Email**.
- PAB-0030 (M): Labels "Home", "Work", "Mobile", "Email".
- PAB-0031 (R): Optionally show allergy propensity info in Zone 2.
- PAB-0032 (M): **Section 5** of Zone 2 is reserved for allergy information. Sections 3 and 4 are left free for other information (e.g. "Risks").
- QIG examples of expanded content: section 1 "Usual address / 340 Gloucester Road / Walton / Tewkesbury / GL20 4RT / View all addresses"; section 2 "Home 020 8123 4567 / Work 0118 496 0823 / Mobile 07700 900555 / Email rama@abc.xyz.com / View all contact details"; section 5 "Latex 14-Nov-1961 / Peanuts 15-Aug-1997 / Penicillin 02-Oct-2003 / View all allergies".

Data labels and values (2.5)
- PAB-0033 (M): DoB label "Born".
- PAB-0034 (M): Living patient age in **parentheses** immediately after DoB, **no label**: "Born 14-Jul-1945 (61y)".
- PAB-0035 (M): label "Gender" (not "Sex": current gender is what matters for identification).
- PAB-0036 (M): label "NHS No."
- PAB-0037 (R): label "Preferred name".
- PAB-0038 (M): label "Died".
- PAB-0039 (M): label "Age at Death".
- PAB-0040 (R): section 1 title label "Address".
- PAB-0041 (R): section 2 title label "Phone and email".
- PAB-0042 (M): no colon after label text.
- PAB-0043 (R): no unnecessary punctuation in labels.
- PAB-0044 (M): labels in "label text" style; PAB-0045 (M): values in "data text" style.
- PAB-0046 (M): value style more emphasised than label style (e.g. larger size or heavier weight; exact styles left to designer).
- PAB-0047 (R): each Zone 1 label has a definition accessible e.g. via tooltip. Definitions must be provided for all labels (2.5.3). Suggested texts:
  - Gender: "Gender: a person's current Gender. This may be different from a person's Sex which is a person's Gender defined at the point of birth registration"
  - NHS No.: "A ten-digit number used to identify a person uniquely within the NHS in England and Wales"
- PAB-0048 (R): means to open the relevant part of the record for every Zone 1 data item (QIG tooltip example: "Click here to open this section of the record.").
- "DoB"/"DoD" rejected: hard to distinguish; screen readers read "DoB" as "dob".

Age display (2.5.3, Tables 7–8): only two abbreviated units, no intermediate units. Unit abbreviations per Time Display guide. (Table headers read "Lower Unit / Higher Unit" but the first unit column is actually the larger unit.)

| Age band | Units shown | Examples |
|---|---|---|
| < 2 hours | minutes only | 1h30m → `90min` |
| < 2 days | hours only | 1d 2h 5m → `26hrs` |
| < 4 weeks | days only | 3d 17h 7m → `3d`; 27d 5h 2m → `27d` |
| < 1 year | weeks + days | 28d 5h → `4w`; 29d 5h → `4w 1d` |
| < 2 years | months + days | 1y 1d 5h → `12m 1d`; 1y 8d → `12m 8d`; 1y 39d → `13m 8d` |
| < 18 years | years + months | 4y 39d → `4y 1m` |
| >= 18 years | years only | `61y` |

Patient name (2.6)
- PAB-0049 (M): order family name, given name, title.
- PAB-0050 (M): no labels on name elements or title.
- PAB-0051 (M): comma after family name.
- PAB-0052 (M): title in parentheses.
- PAB-0053 (M): family name UPPER CASE; given name and title Title Case. Example "CHANDRASEKHAR, Subramanyan (Mr)".
- PAB-0054 (M): preferred name, if available, immediately below the family name.
- Family and given name must be displayed **without truncation**; app must be able to show all PDS name elements in full.

Deceased patient (2.7)
- PAB-0055 (M): Zone 1 background with **both colour and pattern** substantially different from a living patient.
- PAB-0056 (M): must differentiate on all display devices, including desktop monitors and projected images.
- PAB-0057 (M): show date of death with its label; PAB-0058 (M): below date of birth.
- PAB-0059 (M): age at death with label immediately after date of death; PAB-0060 (M): **no parentheses**. Example rows: "Born 14-Jul-1945 Gender Male NHS No. 129 728 7652" / "Died 06-Dec-2006 Age at Death 61y". Living age "(61y)" is NOT shown for a deceased patient.

Alignment (2.8)
- PAB-0061 (M): preferred name immediately below given name, both left-aligned (row 2: "Preferred name Rama").
- PAB-0062 (M): no preferred name: name block vertically centred and left-aligned in Zone 1.
- PAB-0063 (M): deceased: "Died" and "Age at Death" labels/values in that order immediately below the "Born" label, date labels left-aligned with each other.

Allergies (2.9), section 5 title is exactly one of four labels:
- PAB-0064 (M): "Known allergies", "No known allergies", "Allergies not recorded", "Allergies unavailable" (no abbreviations).
- PAB-0065 (M): expanded: each allergy with the date its record was last updated (dd-Mmm-yyyy).
- PAB-0066 (M): link to the allergy section of the record when title is "Known allergies", "No known allergies" or "Allergies not recorded" (example link text "View all allergies"). Not required for "Allergies unavailable".
- PAB-0067 (M): "Known allergies" emphasised relative to the others.
- PAB-0068 (M): "Known allergies" and "No known allergies" in data text style.
- PAB-0069 (M): "Known allergies" preceded by a unique icon giving greater emphasis.
- PAB-0070 (M): "No known allergies" and "Allergies not recorded" preceded by a unique icon giving reduced emphasis.
- PAB-0071 (M): "Allergies not recorded" and "Allergies unavailable" in label text style.
- PAB-0072 (M): "Allergies unavailable" preceded by a unique icon giving reduced emphasis and indicating unavailability.
- Semantics: "Allergies unavailable" = app cannot show allergy info or has no access to that part of the record; "Allergies not recorded" = record holds no allergy data; "No known allergies" = record contains a definitive clinician statement of none; "Known allergies" = allergy data present and listed.

### Accessibility
- Labels "Born"/"Died" chosen over "DoB"/"DoD" partly for screen readers.
- Deceased pattern + colour supports colour-blind users.
- PAB-0076 tab order; PAB-0047 definitions.

### Patient-safety rationale
- Fixed, top, full-width, distinctively styled banner: identification is frequent and critical; users read top-to-bottom, left-to-right.
- Banner only for single-patient screens: avoids associating a banner with another patient's data.
- Deceased styling: users must notice a deceased record without reading it; supports sensitive handling of relatives.
- No "?" for missing data: users must be able to see that minimum data is missing.

---

## Patient Banner – Quick Implementation Guide (zip_Patient_Banner_QIG)

- Purpose: illustrated summary of all PAB-xxxx points; not a substitute for the full guide.
- Contents match the full guide. Additional concrete details: canonical example banner "CHANDRASEKHAR, Subramanyan (Mr) Born 14-Jul-1945 (61y) Gender Male NHS No. 129 728 7652" and Zone 2 title row "Address 340 Gloucester R... Phone and email 020 8123 4567 [A] Known allergies"; Zone 1/Zone 2 separated by a line (illustration: "orange line"; colour not normative); tooltip "Click to expand for more detail"; record-link tooltip "Click here to open this section of the record."; expanded-section link texts "View all addresses", "View all contact details", "View all allergies"; allergy icons drawn as an "A" glyph (illustrative only). QIG note 1.0.0.1 "Corrected drop-down icons for expanded PBs" implies a chevron toggle icon (not specified).
- Appendix repeats age table and examples.

---

## Micro Patient Banner – UI Design Guidance, v2.0.0.0 (micropatban)

- Purpose: patient banner for small hand-held devices (PDAs, ~4 inch, 240 x 320 to < 1024 x 768, stylus); identification only, display only.

### Normative guidance (status, evidence rating)
Structure (3.3.1)
- MPB-0001 (M): always Zone 1; optional Zone 2. MPB-0002 (M): Zone 2 display optional.
- MPB-0003 (M): identification info in Zone 1. MPB-0004 (M): supplementary info in Zone 2.
- MPB-0005 (M): **no clinical information at all** (no allergies, risks; incorrect example shows menu items for risks/allergies).
- MPB-0006 (M): default shows Zone 1; if Zone 2 shown by default it is collapsed.
- MPB-0007 (R): when Zone 2 expanded, give visual indication that underlying content is occluded (e.g. transparent Zone 2 background).
- MPB-0008 (M): display only, no data input.
Positioning (3.3.2)
- MPB-0009 (M) top of screen; MPB-0010 (M) horizontal; MPB-0011 (M) fixed; MPB-0012 (M) full width; MPB-0013 (M) not obscured; MPB-0014 (M) distinctive styling (thick border or background colour); MPB-0015 (M) not on multi-patient screens; MPB-0016 (M) **not in or alongside a Patient List**.
Minimum data set (3.3.3)
- MPB-0017 (M): always family name, given name, date of birth, NHS number.
- MPB-0018 (M): title optional. MPB-0019 (M): age optional.
- MPB-0020 (R): do not display location (ward, bed).
- MPB-0021 (M): deceased: also date of death and age at death.
- MPB-0022 (M): unknown items: self-explanatory text or blank, never "?" (incorrect example: NHS number shown as "?").
- MPB-0023 (R): preferred name if available. MPB-0024 (R): no photograph.
- Phone numbers/email excluded. No local patient IDs (assumption A5).
Grouping (3.3.4)
- MPB-0025 (M): name, DoB, NHS number in Zone 1. MPB-0026 (M): age (if shown) in Zone 1. MPB-0027 (M): deceased: date of death + age at death in Zone 1.
- MPB-0028 (M): full address (incl. postcode) **and gender** in expanded Zone 2 (gender in Zone 1 is incorrect).
- MPB-0029 (M): address label "Usual address", "Temporary address" or PDS temporary type.
- MPB-0030 (M): means to access all addresses in the record.
Labels and values (3.3.5)
- MPB-0031 (M) "Born"; MPB-0033 (M) "Gender"; MPB-0035 (M) "NHS No."; MPB-0036 (R) "Preferred name"; MPB-0037 (M) "Died"; MPB-0038 (M) "Age at Death".
- MPB-0032 (R): age uses two abbreviated units (same table as PAB).
- MPB-0034 (M): gender value in full: no symbol, icon, pictogram (e.g. ♂/♀) or abbreviation ("M"/"F").
- MPB-0039 (M) no colon; MPB-0040 (R) no unnecessary punctuation; MPB-0041/0042 (M) label/data text styles; MPB-0043 (M) value more emphasised than label.
- MPB-0044 (R): definition for each Zone 1 label. Suggested: Patient name "The patient's family name, followed by their given name"; Date of birth "The patient's date of birth"; Gender "Gender: a person's current gender. This may be different from a person's sex, which is a person's gender defined at the point of birth registration."; NHS number "A ten-digit number used to identify a person uniquely within the NHS in England and Wales". On touch devices, a tooltip-like display on touch is acceptable; mechanism platform-agnostic.
- MPB-0045 (M): inform the user that gender should only be used to identify and address the patient, **not for clinical judgements**.
- MPB-0046 (R): access to record for all items in Zone 1 **and Zone 2**.
- MPB-0047 (R): user can adjust font family, size and colour for all banner text.
Name (3.3.6)
- MPB-0048 (M) family, given, title order; MPB-0049 (M) no labels; MPB-0050 (M) comma after family name; MPB-0051 (M) title in parentheses, **omit parentheses when title not shown**; MPB-0052 (M) family UPPER, given/title Title Case; MPB-0053 (R) preferred name below family name; MPB-0054 (M) family and given names in full, no truncation, **split across lines if absolutely necessary**.
Deceased (3.3.7)
- MPB-0055/0056 (M): background colour and pattern substantially different (vary brightness, saturation and hue, plus a pattern; ~1 in 10 population colour-blind). MPB-0057 (M) date of death with label; MPB-0058 (M) below DoB; MPB-0059 (M) age at death with label immediately after; MPB-0060 (M) no parentheses.
Alignment (3.3.8)
- MPB-0061 (M), MPB-0062 (M), MPB-0063 (M): as PAB-0061..0063 (incorrect: preferred name right-justified; age at death aligned with NHS number).

### Accessibility
- MPB-0047 font customisation; no gender pictograms; occlusion indicator.

### Patient-safety rationale
- "Born" label mandatory because a newborn's DoB can be mistaken for today's date.
- Occlusion indicator: expanded Zone 2 can hide clinically critical content.
- Gender not for clinical judgement (sex is used for prescribing).

---

## Patient Name Input and Display – UI Design Guidance, v3.0.0.0 (patnamedisp)

- Purpose: display format and input control (InForm/InLine) for patient names.
- Note (section 2): field label wording is Recommended only; alternative descriptors e.g. "Last Name"/"First Name" (NPSA wristband terms from 18-Jul-2008) are permitted.

### Normative guidance
Display (2.1.1)
- NID-0001 (M): Family Name all UPPERCASE.
- NID-0002 (M): comma separates Family Name and Given Name.
- NID-0003 (M): parentheses around Title. NID-0008 (M): a single pair, e.g. "(Mr)".
- NID-0004 (M): order strictly Family Name, Given Name (Title): `FAMILY, Given (Title)`.
- NID-0005 (M): all data of each element in full; avoid truncation where possible.
- NID-0006 (M): single space between Given Name and Title.
- NID-0007 (M): Title in title case ("Sir" not "SIR", "Mr" not "MR").
- NID-0009 (M): Title can show any free text up to 35 characters.
- NID-0010 (M): no trailing full stop on Title ("Mr" not "Mr.").
- NID-0011 (M): display at least PDS max field sizes (PDS: Title 35, Given 40, Family 40; UK GDSC: 35/35/35. PDS takes priority).
- NID-0012 (M): multi-component names: Family components UPPERCASE alphabetic only, separated by hyphen or single space (LIDMAN-SUN-DEWAR, EVANS WEST); Given components title case (Nadejda), separated by hyphen or single space (Anne-Jorun, Nis Bank).
- NID-0013 (R): word-wrap only at the end of a whole element or component.
- Correct examples: "TREETAWTCHAIWONG, Lertchai (Sir)", "OLIVER, James (Mr)", "RUTH, Anne (Mrs)".
- Incorrect: "Duke James Earl Oliver Sir"; "Ruth Jacob"; "James Oliver Jones (Sir)"; "Mr Oliver"/"Oliver (Mr)" (no given name); "Mrs Ruth"; "JAMES, OLIVER (SIR)" (all same case); "OLIVER, James Earl, E, MBE MSc BSc (Sir)" (too many elements); "CHARLIE, Oliver" (no title); "TREETAWTCHAIWONG, Lertchai Sir" (no parentheses); "RUTH, JACOB (MRS)" (all caps).
- Suffix not normally displayed; when needed (e.g. "Jnr", "III") a checkbox "show on screen" / "use on letterhead" is suggested. Middle names not normally displayed. A nickname may be attached as an optional field (e.g. "Johnny-Boy").

Prompts (general)
- NID-0062 (R): prompt in input boxes by default. NID-0063 (R): prompt visually "occluded" (dimmed) so not confused with data. NID-0064 (M): remove prompt when user begins input.

Input fields (2.2): up to six fields. Minimum data set for input: Family Name + Given Name (2.2.10; section 2.2 also says Title, Family, Given is the minimum "to make the name useful" [DISCREPANCY]); Title, Middle name(s), Suffix, Preferred name optional.

| Field | Control | Max chars (M) | Min visible (R) | Optimal visible (R) | Prompt (R) | Display case |
|---|---|---|---|---|---|---|
| Title | drop-down combo box (R, NID-0019) | 35 (NID-0014) | 4 (M, NID-0015) | widest preset | "e.g. Mr" | Title case |
| Family Name | free text (M, NID-0020) | 35 (NID-0021) | 8 (NID-0022) | 14 (NID-0023) | "e.g. SMITH" (NID-0024) | UPPERCASE on blur (NID-0025) |
| Given Name | free text (M, NID-0026) | 35 (NID-0027) | 8 (NID-0028) | 14 (NID-0029) | "e.g. John" (NID-0030) | first char upper (NID-0031) |
| Middle name(s) | free text (M, NID-0032) | 100 (NID-0033) | 8 (NID-0034) | 7 (NID-0035) [sic, smaller than min] | "e.g. David James" (NID-0036) | as entered |
| Suffix | free text (M, NID-0037) | 35 (NID-0038) | 8 (NID-0039) | 14 (NID-0040) | "e.g. Junior" (NID-0041) | as entered |
| Preferred name ("Known as") | free text (M, NID-0042) | 35 (NID-0043) | 8 (NID-0044) | 14 (NID-0045) | "e.g. Johnny-Boy" (NID-0046) | as entered |

- NID-0016 (R) Title presets in order: Mr, Mrs, Ms, Dr, Rev, Sir, Lady, Lord, Dame, Other... (note: "Miss" absent from list although min width justified by "Miss").
- NID-0017 (R): one value ("Other...", last in list) switches to free-text entry; on selection focus returns to the text box for typing a non-preset value.
- Family name: user types in any case; reformatted to UPPERCASE when focus leaves the field.

Layout
- NID-0047 (M) InForm: fields left-aligned on input-box left edge. NID-0048 (M): stacked order Title, Family Name, Given Name, Middle name(s), Suffix, Known as. InForm is default/preferred.
- NID-0049 (M) InLine: wrap only at whole fields; subsequent rows left-align with first field. NID-0050 (M): same order. NID-0051 (R): InLine only when InForm undesirable (vertical space constrained).
- Labels: NID-0052 (M) every field labelled; NID-0053 (M) programmatically linked (`<label for>`); NID-0054 (R) "Title", "Family Name", "Given Name", "Middle name(s)", "Suffix", "Known as". (QIG illustrations show "FAMILY name", "Given name" capitalisation.)
- Prompts: NID-0055 (R) every field; NID-0056 (R) Family Name prompt capitalised; NID-0057 (R) others sentence case; NID-0058 (R) values as table; NID-0059 (R) prompt lighter weight and colour than input text, and *italic*. Prompts visible until data placed (by user or system).
- Tooltips: NID-0060 (R) each field; NID-0061 (R): Title "Select a Title from the list or simply type in a different Title"; Family Name "Enter the person's Family Name (surname)"; Given Name "Enter the person's Given Name (forename or Christian name)"; Middle name(s) "Enter the person's middle name(s)"; Suffix "Enter the person's suffix name (e.g. 'Junior' or 'The Third')"; Known as "Enter the name a person likes to referred to as" [sic].

### Accessibility
- Consistent format makes elements identifiable when read out of context by a screen reader; users can spell letter by letter. Uppercase family name acceptable (short, unfamiliar words). NID-0053 label association mandatory.

### Patient-safety rationale
- Uppercase + comma + parenthesised title make element boundaries unambiguous; misreading names causes misidentification. Truncation (PDS 40 vs GDSC 35) is a cross-system risk.

---

## Patient Name Input and Display – QIG (patnamedispqig)

- Same NID points. **[DISCREPANCY]** QIG NID-0021 states Family Name max **40** characters ("Up to 40 characters input"); full guide and checklist say 35. Recommend accepting 40 (PDS max, satisfies NID-0011) [suggested].
- Illustrations: "SMITH, John (Mr)", "COOPER, Catherine (Dr)", "CORDERO, Thelma (Ms)", "SUBRAMANYAN, Chandrasekhar (Mr)", "JOHNSON, Brian (Mr)", "EVANS WEST, Jonathan (Sir)" or "EVANS-WEST, Jonathan (Sir)", "SMITH, Mary Jane (Mrs)", "SMITH, Nis Bank (Mr)", "SMITH, Anne-Jorun (Mrs)". NID-0013 example wraps "SUBRAMANYAN," / "Chandrasekhar (Mr)". NID-0064 sequence: prompt "e.g. John" disappears once user types "Jos".
- InLine layout illustration: row 1 Title, FAMILY name, Given name, Middle name(s); row 2 Suffix, Known as; labels above inputs.

---

## NHS Number Input and Display – UI Design Guidance, v4.0.0.0 (inputdisplay)

- Purpose: display format and single-box input control for the 10-digit NHS Number (first 9 digits identifier, 10th check digit).

### Normative guidance
Display
- NUM-0001 (M): in full, on a single line, never truncated or split over lines (no wrapping, `white-space: nowrap`).
- NUM-0002 (M): three groups 3-3-4 separated by single spaces: `999 999 9999` e.g. "123 456 7890".
- NUM-0003 (R): support copy and paste.
- Incorrect: "1234567890" (Patient Safety Critical), "123456-/7890" split across lines (Patient Safety Critical), "12345 67890", "12 34 56 78 90", "123/456/7890", "123.456.7890".
Input
- NUM-0010 (R): single text input box (multi-box design explicitly rejected: breaks paste).
- NUM-0011 (M): only one NHS Number per box.
- NUM-0012 (R): box length shows full number (no longer; long box implies more data). Correct: box "no bigger and no smaller".
- NUM-0013 (R): height = largest character height of current font incl. user settings (single line; multi-line box incorrect).
- NUM-0014 (R): accept keyboard, paste, stylus handwriting.
- NUM-0015 (R): reformat during input to `123 456 7890` (QIG: typing "1234" shows "123 4").
- NUM-0016 (M): value consists only of 10 digits and two spaces.
- NUM-0017 (M): only single space allowed as separator; discard all other non-numeric input incl. hyphens, dashes (– —), forward slashes, back slashes, full stop, comma, colon.
- NUM-0018 (M): do not permit old-format or temporary numbers (old: >20 formats of uppercase letters, digits and "/"; temporary: three letters + digits, e.g. "BIR1234567").
- Hints/prompts/tooltips optional; wording left to designers. Suggested prompt/hint "e.g. 123 456 7890"; tooltip "Enter the NHS Number e.g. 123 456 7890. This is a ten-digit number used to identify a person uniquely within the NHS in England and Wales".
- Label "NHS Number" in figures is illustrative only (no label guidance; banner uses "NHS No.").
- Out of scope: validation of format/checksum (defined in UK GDSC) and person match.

### Accessibility
- Grouping makes JAWS read e.g. "one hundred and twenty three four hundred and fifty six seventy eight ninety" rather than "one billion ...". Variability of read-out accepted.

### Patient-safety rationale
- 10 ungrouped digits exceed short-term memory; space separators distinguish NHS numbers from dates and phone numbers; wrapping may insert a hyphen read as part of the number.

## NHS Number – QIG (inputdisplayqig)
- Same NUM points; NUM-0002 phrased "three groups of three, three and four digits". Refers to full doc as "Patient Identification Number Input and Display v4.0.0.0". Illustrations show hint, prompt (watermark "e.g. 123 456 7890") and tooltip variants.

---

## Sex and Current Gender Input and Display – UI Design Guidance, v4.0.0.0 (sex)

- Purpose: valid values, labels, definitions and input controls for "Current Gender" (Person Gender Current, self-assigned) and "Sex" (Person Gender at Registration, phenotypic). The bare term "Gender" is considered ambiguous and unsafe.

### Normative guidance
Current Gender
- CGS-0001 (M): input label "Current Gender". CGS-0007 (R): display label "Current Gender".
- CGS-0002/0003 (M): values exactly Male, Female, Other Specific, Not Known, Not Specified (note: "Other Specific", not "Other Specified").
- CGS-0004 (M): value definitions accessible.
- CGS-0005 (M): never abbreviate (no "M", "F", "NK", "NS").
- CGS-0006 (M): never display underlying codes (e.g. 0, 1, 2, 9), nor code + text ("1 Male").
- CGS-0008 (R): default value "Not Known".
Sex
- CGS-0009 (M): input label "Sex". CGS-0016 (R): display label "Sex".
- CGS-0010/0011 (M): values exactly Male, Female, Not Known, Indeterminate.
- CGS-0012 (M): never abbreviate. CGS-0014 (M): never display codes.
- CGS-0013 (M): default state null (blank).
- CGS-0015 (M): value definitions accessible.
Instructional text
- CGS-0017 (M): definitions for input controls. CGS-0018 (M): definitions of valid values. CGS-0019 (R): shortened definitions.
- Short definitions (for label tooltips): "Current Gender, as assigned by the individual to themselves"; "Sex, as recorded at birth or on issue of a full gender recognition certificate".
- Full Current Gender text: "Current Gender is a statement by the individual about the gender they currently identify themselves to be (that is, self-assigned). The valid values are: Male; Female; Other Specific – when the person has a clear idea of what their gender is, but it is neither discretely male nor female, for example, 'Intersex', 'transgender', 'third gender'; Not Known – used when no information on this subject is known; Not Specified – when the person is unable to specify their current gender or does not have a clear idea of their current gender".
- Full Sex text: "Sex is the phenotypic sex of the person as recorded by the Registrar on the Register of Births, or other initial registration, or on issue of a full gender recognition certificate under the Gender Recognition Act. Valid values are: Male; Female; Not Known – used when no information on this subject is known; Indeterminate – used when the person is unable to be classified as either male or female".
- Tooltips ideally brief (< ~90 chars; Firefox truncates ~90; max ~150).
Option button (radio) groups (preferred when space allows; safest and most accessible)
- CGS-0020 (M): Current Gender radio group has exactly 5 buttons. CGS-0021 (M): order Male, Female, Other Specific, Not Known, Not Specified (top-to-bottom, then left-to-right for inline layout). CGS-0022 (R): tab order the same. Default "Not Known" selected.
- CGS-0023 (M): Sex radio group exactly 4 buttons. CGS-0024 (R): order Male, Female, Not Known, Indeterminate. Default nothing selected.
- Incorrect: checkboxes, multi-select, wrong/extra/missing values, label that could be confused with the other concept.
Drop-down list boxes (space-saving alternative)
- CGS-0025 (M): Current Gender options order as above. CGS-0026 (M): single drop-down. CGS-0027 (M): no prompt (default "Not Known" shown). Default "Male" is incorrect.
- CGS-0028 (M): Sex controls: no value by default **and no way to return to null** once set. CGS-0029 (M): single control. CGS-0030 (R): Sex drop-down blank by default, no prompt. Default "Not Known" is incorrect.

### Accessibility
- Standard radio/select controls recognised by assistive tech; tooltips for instructional text.

### Patient-safety rationale
- Sex default null so users must actively choose; a pre-filled default could be mistaken for real input or tabbed past.
- Codes/abbreviations cause recognition errors ("Patient-Safety-Critical").

**[DISCREPANCY]** Patient Banner uses label "Gender" (PAB-0035/MPB-0033) while this guide recommends "Current Gender" (CGS-0007) for displays. Keep "Gender" inside banners (banner-specific mandatory rule) and "Current Gender"/"Sex" elsewhere.

## Sex and Current Gender – QIG (sexqig)
- Same CGS points; display example "Current Gender Not Known" / "Sex Female". Value tooltip examples: Other Specific "When the person has a clear idea of what their gender is, but is neither discretely male nor female, for example, 'intersex', 'transgender', 'third gender'"; Indeterminate "Unable to be classified as either male or female". Notes that tooltip styling/definition wording in illustrations is not part of guidance.

---

## Address Input and Display – UI Design Guidance, v3.0.0.0 (address)

- Purpose: display (vertical/horizontal) and three input controls: UK address input, UK address finder, non-UK address input.

### Normative guidance
Display (2.1.1)
- ADR-0001 (M): horizontal (in-line): delimit fields with exactly ", " (one comma, one space). Example "18 Orchard Cottage, King's Road, Ipswich, Northshire, NS33 8KR".
- ADR-0002 (R): vertical: no comma at line ends.
- ADR-0003 (R): vertical: left-aligned.
- ADR-0004 (R): truncation: ellipsis ("18 Orchard Cottage, King's Road...") and, where appropriate, a means to see the full address.
- ADR-0005 (R): never split an element when wrapping (wrap only between elements).
- ADR-0006 (R): omit missing elements entirely (no empty strings, no ", ," sequences).
- ADR-0007 (M): postcode ALL CAPS with one space between outcode and incode ("NS33 8KR").
- ADR-0008 (R): no labels for individual elements on display.
- Printed-letter addresses may be shown as printed; on-screen otherwise left-aligned.
Input elements (2.2)
- Address lines labelled "Line 1", "Line 2", "Line 3" (must not require a house number; support names like "The Old Mill House" and multiple numbers e.g. flat + building). Town/City below Line 3, County below Town/City, both free text. Postcode 5–7 alphanumerics, outcode + space + incode. Partial postcodes should be permitted. Label "Postcode" (not "Post code"). Field lengths per NHS Data Dictionary/PDS.
UK address input (2.3.2)
- ADR-0011 (R): boxes in order: 3 x street lines, Town/City, County, Postcode.
- ADR-0012 (M): labels "Line 1", "Line 2", "Line 3", "Town/City", "County", "Postcode".
- ADR-0013 (R): provide postcode finder. ADR-0014 (R): only show it if service supported; place after postcode box; label "Find Postcode". Enable only after street name (a Line) and Town/City entered.
- ADR-0015 (M): postcode box length 8 characters (exactly; GDSC max).
- ADR-0016 (R): County box 18 characters ("Kirkcudbrightshire").
- ADR-0017 (R): box height = largest character height of current font.
- ADR-0018 (R): boxes vertical, left-aligned. ADR-0019 (R): labels immediately left of boxes, labels right-aligned to each other.
- ADR-0020 (R): accept keyboard, paste, stylus.
- ADR-0021 (R): allowed characters: A–Z a–z 0–9 . / , : ' space - (no diacritics needed for UK).
- Incorrect: equal-size boxes; left-aligned labels; Postcode before County; no Postcode box. Horizontal, unstructured and semi-structured input rejected.
UK address finder (2.4.2), only if postcode lookup service supported
- ADR-0031 (R): boxes in order House/Building Number, House/Building Name, Postcode.
- ADR-0032 (M): labels "House/Building Number", "House/Building Name", "Postcode".
- ADR-0033 (R): "Find Address" button after postcode box, only if service supported; enabled only once postcode entered.
- ADR-0034 (M): postcode box 8 characters. House number box minimum 5 characters.
- ADR-0035..0038 (R): height, vertical left-aligned boxes, right-aligned labels, all input mechanisms. Address picker out of scope. Incorrect: merged number/name field; Find button at top.
Non-UK address input (2.5.1)
- ADR-0050 (R): order: Country (editable combo, first), Line 1–4, Town/City, Postal Code.
- ADR-0051 (M): labels "Country", "Line 1", "Line 2", "Line 3", "Line 4", "Town/City", "Postal Code".
- ADR-0052..0055 (R): height, vertical left-aligned, right-aligned labels, all input mechanisms.
- ADR-0056 (R): editable drop-down combo for country (type or pick). ADR-0057 (M): country list = ISO 3166-1 names. ADR-0058 (R): alphabetical. ADR-0059 (R): left-aligned.
- Incorrect: Country last; missing postal code box.

### Accessibility
- No element labels on display (screen readers would speak each label). Empty elements cause screen readers to read stray punctuation. Editable country combo for keyboard/screen-reader users.

### Patient-safety rationale
- Address is secondary identifier for resolving multiple name matches; misread/misdirected addresses risk confidentiality and missed communication.

## Address – QIG (addressqig)
- Same points; vertical example "18 Orchard Cottage / King's Road / Ipswich / Northshire / NS33 8KR". Labels drawn as "Town / City" and "House / Building Number" (with spaces) **[DISCREPANCY]** vs full guide "Town/City"; QIG notes labels guidance applies to text, not formatting; use full-guide spelling [suggested]. Non-UK illustration also shows a "Find Postcode" button next to Postal Code (not in full guide). Example prompts "e.g. Ipswich", "e.g. Northshire"; tooltip "Enter the first line of the address". ISO list starts "Afghanistan, Aland Islands, Albania, Algeria, American Samoa, Andorra, Angola, Anguilla, Antarctica, Antigua and Barbuda".

---

## Telephone Number Input and Display – UI Design Guidance, v4.0.0.0 (tele)

- Purpose: display format, single free-text input with reformatting, and country-selector-assisted input for non-UK numbers. Fax numbers and field labels/types (Home/Work) out of scope (control has no built-in label so it can be reused).

### Normative guidance
Structure: `[+CountryCode ]AreaCode LocalNumber[ xExtension]`, elements separated by spaces. Country code 2–4 digits, optional; area code 3–6 digits mandatory, **never in brackets** (v4 change); local number 4–8 digits; extension typically 4 digits. Max ~20 digits.
Display (2.1.1)
- TID-0001 (M): UK country code ("+44" or "0044") never displayed.
- TID-0002 (M): displayed country code always prefixed "+". TID-0003 (M): no leading zeros in country code. TID-0004 (M): single space after country code.
- TID-0005 (M): UK area code never in brackets. TID-0006 (M): area code followed by a space.
- TID-0007 (R): extension shown as "x" immediately before digits ("x1234").
- TID-0008 (M): single-box extension: one space before the "x" ("020 7946 0472 x1234").
- TID-0026 (R): separate extension box: label above it (example label "Extension").
- TID-0009 (M): UK local number > 6 digits: space before final four digits.
- TID-0010 (R): format per Appendix A rules.
- Where international code is shown, optional area-code digits (leading 0) are omitted.
- Correct: "029 2018 0928", "0151 496 0947", "01632 960326", "01632 96029", "016329 60541", "016329 6054", "020 7946 0472 x1234", "+1 555 323 1020", "+356 8437 4667", "+91 645623 4576 7898"; banner examples "Home 0118 496 0123", "Work 020 7946 0472", "Next of Kin +1 212 555 2368".
- Incorrect: "(029) 2018 0928"; "+44 029 2018 0928"; "+44 29 2018 0928"; "+442920180928"; "02920180928".
Unassisted input (2.2.1)
- TID-0011 (M): free-text box. TID-0027 (M): separate extension box (if used) is also free text.
- TID-0012 (M): accept formatted and unformatted entry.
- TID-0013 (M): if identifiable as valid (Appendix A), on **blur** strip formatting and replace with reformatted value. TID-0014 (M): spaces in logical places.
- TID-0015 (M): if not identifiable, leave and display exactly as entered (e.g. "+888 12.34.56.78").
- TID-0016 (M): UK country code removed from display after commit ("+44 118 123 4567" → "0118 123 4567"). TID-0018 (M): never display UK numbers with international prefix. TID-0017 (M): retain other country codes. TID-0019 (M): non-UK displayed with "+" before country code.
- Sizing: default width fits "020 1234 5678 x1234"; minimum width fits "01234 567890"; no maximum length constraint. Must show >95% of expected values.
- Suggested prompts: Home "e.g. 01234 567890"; Work "e.g. 020 1234 5678 x1234"; Work with separate box "e.g. 020 1234 5678" + extension prompt "1234" (QIG: "e.g. 1234").
- Suggested tooltips: "Enter the 'home' telephone number"; "Enter the 'work' telephone number. To include an extension number, add an 'x' to the front of the extension number"; "Enter the 'work' telephone number. To include an extension number, enter the number into the extension number box".
- Incorrect: separate area code box (users guess area code); brackets around area code.
Assisted input with country selector (2.2.2), secondary use after user indicates a non-UK number
- TID-0020 (M): default "+44 (UK)".
- TID-0021 (M): columns: ISO 3166 country name | Ofcom dialling code | ISO 3166 two-letter code; use "UK" not "GB".
- TID-0022 (M): alphabetical; United Kingdom once at top and again in alphabetical position.
- TID-0023 (R): editable drop-down. TID-0024 (R): type-ahead navigation by free text (e.g. "Af").
- TID-0025 (R): row = name (left-aligned, vertically aligned), "+NN" code (right-aligned), "(XX)" abbreviation (right-aligned, in brackets, vertically aligned). Example rows "United Kingdom +44 (UK)", "Afghanistan +93 (AF)", "Albania +355 (AL)", "Algeria +213 (DZ)", "Andorra +376 (AD)", "Angola +244 (AO)", "Argentina +54 (AR)".
- Selector width default and minimum fit "+376 (AD)". Closed state shows "+44 (UK)". Labels in figure: "Country Code", "Telephone Number". Selector must show numeric code (button-only selector incorrect).

Appendix A Part I – CSA element identification rules (display only):
1. Starts with "+" or "00" → International Prefix Rules (step 3). 2. Else UK Rules (step 11).
3. "+44" followed by non-"0": replace "+44" with "0", go to 11. 4. "0044" followed by non-"0": replace with "0", go to 11. 5. Starts "+": International Representation (8). 6. Starts "00": replace "00" with "+", go to 8. 7. "+44"/"0044" followed by "0": invalid, display as received.
8. Add space after the international dialling code (ITU-T code list). 9. Remove any immediately following separator. 10a. Remainder has non-numeric chars other than valid separators: display remainder as received. 10b-i. Has valid separators: replace each with a space. 10b-ii. Else insert spaces before every four characters from the right, never > 6 chars without a break, never < 3 chars in a group.
11a. UK value with non-numeric chars other than valid separators: display untransformed. 11b. Else strip separators and continue.
12. Begins "01"/"02" (apply first matching only): a. "02" → space after 3rd digit; b. "1" in 3rd or 4th position → space after 4th digit; c. first 6 digits in {013873 Langholm, 015242 Hornby, 015394 Hawkshead, 015395 Grange-Over-Sands, 015396 Sedbergh, 016973 Wigton, 016974 Raughton Head, 017683 Appleby, 017684 Pooley Bridge, 017687 Keswick, 019467 Gosforth} → space after 6th digit; d. else space after 5th digit.
13. If remainder after that space has > 6 digits, space before final four digits.
14. Begins "03","04","05","06","07": space after first 5 digits; remainder > 6 digits → space before final four.
15. Begins "08","09": space after first 4 digits; remainder > 6 digits → space before final four.
16. Doesn't begin with "0": display untransformed.
Note: rule 12c should logically be tested before 12b for codes like 015242 (3rd digit 5, 4th 2, so no conflict in practice; 017683 etc. also have no "1" in positions 3–4, so order is safe). "Valid separator characters" are not defined in the docs.

Part II – extension handling (applied before Part I): find "x", "ex", "ext", "extn", "extension", "extension number", optionally followed by ".", ":", "=", "-", then digits; replace marker with "x"; detach "x"+digits, format the rest, re-append as " x1234". Example: "0118 9098765 ex1234" → "0118 909 8765 x1234".

### Accessibility
- "+" clearly marks international numbers; screen reader readout variance accepted.

### Patient-safety rationale
- Phone numbers near the NHS number could be confused; formats must differ (NHS 3-3-4 vs phone area-code grouping, "+" prefix). Separate area-code boxes cause guessed area codes.

## Telephone – QIG (teleqig)
- Same TID points. Illustrations: TID-0012 typing sequences "01181234" → "01181234567" → "0118 123 4567"; "01181-2" → "01181-23-45" → "0118 123 4567". TID-0015 "+888 12.3" stays as entered. TID-0017 "+1 212 555 2368". Work prompt shown as "e.g. 020 1234 5678" (no extension) and separate box "e.g. 050 1234 5678" / "e.g. 1234". Appendix attributed to "NHS CFH – NPfIT SCG – SCG Guidance on Telecommunication Standards".

---

## CUI CAPS Compliance Pack (zip_cuicompliance)

- Purpose: introduces compliance process for suppliers/Trusts. Hazard themes: incorrect identification of the patient; wrong record, wrong patient; delayed, missed or inappropriate healthcare.
- ISB (Information Standards Board for Health and Social Care) mandated the CUI CAPS standards as DSCNs (now Information Standards Notices): Address Input and Display; Date and Time Input; Date Display; NHS Number Input and Display; Patient Banner; Patient Name Input and Display; Sex and Current Gender Input and Display; Telephone Number Input and Display; Time Display. **IT systems must conform by 1 December 2015.** Related: DSCN 14/2009 (manufacture of health software) and 18/2009 (deployment and use).
- Process: supplier assesses with full guidance, QIGs and Excel checklists; reports to CUI team. No UI rules.

## CUI Compliance Checklist (zip_compliance_checklist)

- Purpose: per-guideline Yes / No / Not applicable compliance record (v0.1, 2010-11-09). Repeats ADR, NUM, PAB, NID, CGS, TID points verbatim (with statuses) and also Date Display, Time Display, Date and Time Input (owned by another group; key items relevant here listed below).
- **[DISCREPANCY]** Checklist PAB rows use "Last Name, First Name" instead of "family name, given name" (consistent with the permitted wording note). NUM-0016 text truncated. ADR-0012 status lowercase "mandatory". Date Display rows have no status values.
- Relevant cross-references used by banner rendering:
  - Date short format (D+Ta-0006: for all clinical use incl. identification): day 2 digits zero-padded (D+Ta-0018); month 3-letter "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec" first letter capital, no punctuation (D+Ta-0003/0007/0008); year 4 digits (D+Ta-0004); single hyphens (D+Ta-0009): `dd-Mmm-yyyy`, e.g. "14-Jul-1945"; ignore regional settings (D+Ta-0010); null dates as "Unknown"/"Not recorded" (D+Ta-0022).
  - Durations (time display): whole numbers only (D+Tb-0018); minimal unit set y, m, w, d, hr, min, sec (D+Tb-0033), extensible e.g. "hrs" (D+Tb-0034); omit zero-valued units (D+Tb-0026); value+unit with no space (D+Tb-0027); units separated by a space (D+Tb-0028); decreasing significance (D+Tb-0029). These govern the age format ("4w 1d", "26hrs").

---

## Proposed controls

General [suggested] implementation notes: all components accept `className`, forward refs where they render inputs, expose `id`/`aria-*` passthrough, and use CSS custom properties for label vs data text styles (`--cui-label-*`, `--cui-data-*`) with data visibly more emphasised (PAB-0046).

### 1. `PatientBanner`
Purpose: desktop banner (PAB-0001..0076).
```ts
type CurrentGenderValue = 'Male'|'Female'|'Other Specific'|'Not Known'|'Not Specified';
interface PatientName { familyName: string; givenName: string; title?: string; }
interface AllergyItem { name: string; lastUpdated: Date; }
type AllergyStatus = 'known'|'none-known'|'not-recorded'|'unavailable';
type AddressType = 'Usual address'|'Temporary address'|string; // PDS temp-address types
interface ContactDetails { home?: string; work?: string; mobile?: string; email?: string; }
interface PatientBannerProps {
  name: PatientName;
  preferredName?: string;              // given-name portion only (PAB-0020/0037)
  dateOfBirth?: Date | null;
  dateOfDeath?: Date | null;           // presence => deceased variant
  gender?: CurrentGenderValue | null;  // label "Gender" (PAB-0035)
  nhsNumber?: string | null;
  address?: { type: AddressType; lines: string[]; postcode?: string } | null;
  contacts?: ContactDetails;
  allergies?: { status: AllergyStatus; items?: AllergyItem[] };
  showZone2?: boolean;                 // default true (PAB-0074)
  zone2Expanded?: boolean; defaultZone2Expanded?: boolean; // default false (PAB-0004)
  onZone2ExpandedChange?: (expanded: boolean) => void;
  section3?: React.ReactNode; section4?: React.ReactNode; // reserved free sections
  userIsClinical?: boolean;            // false => hide allergy section (PAB-0008), default false [suggested safe default]
  unknownText?: string;                // default "Not Known" (PAB-0019)
  now?: Date;                          // for age calc; default new Date()
  labelDefinitions?: Partial<Record<'name'|'born'|'gender'|'nhsNo'|'preferredName'|'died'|'ageAtDeath', string>>; // PAB-0047 defaults per doc
  onOpenRecord?: (item: 'name'|'dateOfBirth'|'gender'|'nhsNumber'|'dateOfDeath'|'address'|'contacts'|'allergies') => void; // PAB-0048/0066
  zone2Tooltip?: string;               // default "Click to expand for more detail" (PAB-0007)
}
```
Behaviour/layout:
- Root `<header role="banner">` [suggested], sticky/fixed top, full width, thick border/distinct background (PAB-0009..0014). Not rendered by consumers on multi-patient screens (document; optional dev warning).
- Zone 1 row: name block left (name; "Preferred name X" on row 2 if present else vertically centred, PAB-0061/0062), then "Born dd-Mmm-yyyy (age)" | "Gender value" | "NHS No. 999 999 9999" in that order (PAB-0016). Deceased: "Born dd-Mmm-yyyy" with "Died dd-Mmm-yyyy Age at Death 61y" directly beneath, labels left-aligned (PAB-0057..0060, 0063); no "(age)" after Born.
- Deceased: Zone 1 gets `data-deceased` with distinct colour AND pattern (e.g. diagonal-hatch `repeating-linear-gradient`) [suggested values]; must remain distinct in forced-colours/projection.
- Labels without colons; missing values => `unknownText` or blank, never "?" or "-".
- Each Zone 1 label wrapped in a definition trigger (tooltip, keyboard focusable); each value optionally a link/button to the record. DOM/tab order = name, DoB, gender, NHS number (PAB-0076).
- Zone 2: single disclosure button (`aria-expanded`, `aria-controls`) toggling all five sections together; collapsed title row: "Address <truncated with …>", "Phone and email <first number truncated with …>", [sec 3], [sec 4], allergy icon + status label. Expanded: section 1 address type label + vertical address + "View all addresses"; section 2 Home/Work/Mobile/Email in order with labels + "View all contact details"; section 5 allergy list "Name dd-Mmm-yyyy" + "View all allergies" (not for 'unavailable').
- Allergy status variants: known => label "Known allergies", data style, emphasis icon; none-known => "No known allergies", data style, reduced icon; not-recorded => "Allergies not recorded", label style, reduced icon; unavailable => "Allergies unavailable", label style, unique "unavailable" icon. Icons need text alternatives [suggested].
- No photograph prop (PAB-0021).
Guidelines: PAB-0001..0076.

### 2. `MicroPatientBanner`
Purpose: compact banner for small screens (MPB-0001..0063).
```ts
interface MicroPatientBannerProps {
  name: PatientName; showTitle?: boolean /* default true */; preferredName?: string;
  dateOfBirth?: Date|null; showAge?: boolean /* default true */; dateOfDeath?: Date|null;
  nhsNumber?: string|null; gender?: CurrentGenderValue|null; // Zone 2 only
  address?: { type: AddressType; lines: string[]; postcode?: string } | null;
  onViewAllAddresses?: () => void; onOpenRecord?: (item: string) => void;
  showZone2?: boolean /* default true */; defaultZone2Expanded?: false;
  genderCaution?: string; // default "Gender should only be used to identify and address the patient correctly, not for clinical judgements" [suggested wording of MPB-0045]
  now?: Date; unknownText?: string;
}
```
Behaviour: no clinical data props (MPB-0005); display-only (MPB-0008); name never truncated, wraps only between components (MPB-0054); title parentheses omitted when title hidden (MPB-0051); gender always full text in Zone 2 with label "Gender" (MPB-0028/0034); expanded Zone 2 overlays content with a visibly translucent background or "content hidden below" indicator (MPB-0007); respects user font preferences (rem units; MPB-0047). Never render inside patient lists (MPB-0016).

### 3. `PatientNameDisplay`
```ts
interface PatientNameDisplayProps { familyName: string; givenName: string; title?: string|null; showTitle?: boolean /* true */; as?: 'span'|'div'; }
```
Renders `formatPatientName()`; wrapping allowed only at component boundaries (NID-0013): each component in `white-space: nowrap` spans. Never truncates (NID-0005). Optional `aria-label` with full expanded wording [suggested].
Guidelines: NID-0001..0013, PAB-0049..0053, MPB-0048..0054.

### 4. `PatientNameInput`
```ts
type NameField = 'title'|'familyName'|'givenName'|'middleNames'|'suffix'|'preferredName';
interface PatientNameValue { title?: string; familyName: string; givenName: string; middleNames?: string; suffix?: string; preferredName?: string; }
interface PatientNameInputProps {
  value: PatientNameValue; onChange: (v: PatientNameValue) => void;
  layout?: 'inform'|'inline';           // default 'inform' (NID-0051)
  fields?: NameField[];                 // default all six; order always fixed (NID-0048/0050)
  labels?: Partial<Record<NameField,string>>;   // defaults "Title","Family Name","Given Name","Middle name(s)","Suffix","Known as"
  prompts?: Partial<Record<NameField,string>>;  // defaults "e.g. Mr","e.g. SMITH","e.g. John","e.g. David James","e.g. Junior","e.g. Johnny-Boy"
  tooltips?: Partial<Record<NameField,string>>; // defaults per NID-0061
  titleOptions?: string[];              // default ['Mr','Mrs','Ms','Dr','Rev','Sir','Lady','Lord','Dame'] + 'Other...'
  familyNameMaxLength?: number;         // default 35 (NID-0021) [QIG says 40]
  disabled?: boolean; required?: NameField[]; // default ['familyName','givenName']
}
```
Behaviour: Title = editable combobox (ARIA 1.2 combobox) max 35, min width 4ch; "Other..." clears and focuses free-text entry. Family Name max 35, width min 8ch / default 14ch, uppercased on blur (display) while typing preserves case. Given Name max 35, first char uppercased on blur. Middle max 100 (width 8ch). Suffix/Known as max 35, 8–14ch. Placeholders italic, lighter weight/colour, removed on first input (native placeholder semantics). Every input has `<label htmlFor>`. InForm: labels left of left-aligned stacked inputs [suggested label position]; InLine: labels above, flex-wrap at whole fields.
Guidelines: NID-0014..0064.

### 5. `NhsNumberDisplay`
```ts
interface NhsNumberDisplayProps { value: string|null|undefined; label?: string /* none by default; banner passes "NHS No." */; unknownText?: string; copyable?: boolean /* true */; }
```
Renders `formatNhsNumber()` in a `nowrap` span, selectable text (copy yields digits with spaces; [suggested] copy handler may offer digits-only). Invalid/unformattable input shown as-is? [suggested: show raw with warning style, never partially grouped]. NUM-0001..0003.

### 6. `NhsNumberInput`
```ts
interface NhsNumberInputProps {
  value: string; onChange: (formatted: string, digits: string) => void;
  hint?: string; placeholder?: string /* "e.g. 123 456 7890" */; tooltip?: string /* doc text */;
  validateChecksum?: boolean /* [suggested] default true */; onValidityChange?: (valid: boolean) => void;
  id?: string; 'aria-describedby'?: string; disabled?: boolean;
}
```
Behaviour: single-line `<input inputmode="numeric" autocomplete="off">`, width ~12ch so full value visible and no wider (NUM-0012), height = 1 line (NUM-0013). On every keystroke/paste/drop: `sanitiseNhsNumberInput` (keep digits, discard all else), cap at 10 digits, re-group 3-3-4 while preserving caret position (NUM-0015..0017). Reject letters so old/temporary formats cannot be entered (NUM-0018). Paste of "123-456-7890" → "123 456 7890". Only one number (extra digits beyond 10 dropped [suggested: or flagged]).

### 7. `GenderDisplay` / `SexDisplay`
```ts
interface CodedValueDisplayProps<T extends string> { value: T|null; label?: string; showDefinition?: boolean; }
```
CurrentGender label default "Current Gender" (CGS-0007); Sex label "Sex" (CGS-0016); full text only, never codes (CGS-0005/0006/0012/0014); definition tooltip on label and value (CGS-0004/0015/0017/0018).

### 8. `CurrentGenderInput`
```ts
interface CurrentGenderInputProps { value: CurrentGenderValue; onChange: (v: CurrentGenderValue)=>void; variant?: 'radio'|'select' /* default 'radio' */; orientation?: 'vertical'|'horizontal'; label?: 'Current Gender'; showDefinitions?: boolean /* true */; }
```
Default value 'Not Known' (CGS-0008); exactly 5 options in fixed order (CGS-0020/0021/0025); tab/arrow order same (CGS-0022); select has no placeholder (CGS-0027); `<fieldset><legend>Current Gender</legend>` [suggested]; horizontal layout fills top-to-bottom then left-to-right. Uses native radio semantics (single selection).

### 9. `SexInput`
```ts
type SexValue = 'Male'|'Female'|'Not Known'|'Indeterminate';
interface SexInputProps { value: SexValue|null; onChange: (v: SexValue)=>void; variant?: 'radio'|'select'; orientation?: 'vertical'|'horizontal'; label?: 'Sex'; }
```
Initial null, nothing selected, select blank with no prompt and no empty option once a value is chosen (cannot return to null, CGS-0013/0028/0030); exactly 4 options in order (CGS-0023/0024).

### 10. `AddressDisplay`
```ts
interface AddressValue { lines: string[]; town?: string; county?: string; postcode?: string; country?: string; }
interface AddressDisplayProps { address: AddressValue; orientation?: 'vertical'|'horizontal'; maxLength?: number; singleLine?: boolean; onShowFull?: () => void; typeLabel?: string; }
```
Omits empty elements (ADR-0006); horizontal joins with ", " (ADR-0001); vertical one element per line, no trailing commas, left-aligned (ADR-0002/0003); postcode via `formatPostcode` (ADR-0007); no element labels (ADR-0008); each element `nowrap` so wrapping occurs between elements (ADR-0005); truncation with "..." / CSS ellipsis plus full text in tooltip or `onShowFull` (ADR-0004).

### 11. `UkAddressInput`
```ts
interface UkAddressInputProps { value: {line1:string;line2:string;line3:string;town:string;county:string;postcode:string}; onChange: (...)=>void; onFindPostcode?: (v)=>void /* button rendered only if provided (ADR-0014) */; hints?/placeholders?/tooltips?: Partial<Record<field,string>>; }
```
Fields in order Line 1, Line 2, Line 3, Town/City, County, Postcode with exact labels (ADR-0011/0012); labels right-aligned in a left column, inputs left-aligned (ADR-0018/0019) via CSS grid; postcode `size=8`/width 8ch, maxlength 8 (ADR-0015); County width 18ch (ADR-0016); character filter `[A-Za-z0-9./,:' \-]` (ADR-0021) [suggested: filter vs warn]; "Find Postcode" button after postcode, disabled until a street line and Town/City are non-empty; postcode uppercased and spaced on blur [suggested].

### 12. `UkAddressFinder`
Props: `value: {buildingNumber, buildingName, postcode}`, `onFindAddress` (required; control only rendered when service exists, ADR-0033). Labels "House/Building Number" (width >= 5ch), "House/Building Name", "Postcode" (8ch); "Find Address" button after postcode, enabled when postcode non-empty.

### 13. `NonUkAddressInput` + `CountryCombobox`
Fields: Country (editable combobox, first, ISO 3166-1 names alphabetical, left-aligned, type-ahead), Line 1–4, Town/City, Postal Code with exact labels (ADR-0050..0059). `countries?: string[]` prop defaulting to bundled ISO 3166-1 list.

### 14. `TelephoneNumberDisplay`
```ts
interface TelephoneNumberDisplayProps { value: string; extension?: string; label?: string; separateExtension?: boolean; }
```
Renders `formatTelephoneNumber(value)` (+ " x" + ext). `nowrap`. Unparseable shown verbatim (TID-0015). Use `<a href="tel:">` optional [suggested].

### 15. `TelephoneNumberInput`
```ts
interface TelephoneNumberInputProps {
  value: string; onChange: (raw: string)=>void; onCommit?: (formatted: string, valid: boolean)=>void;
  extensionMode?: 'inline'|'separate' /* default 'inline' */; extension?: string; onExtensionChange?: (v:string)=>void; extensionLabel?: string /* "Extension" */;
  assisted?: boolean /* show country selector, default false */; countryCode?: string /* default '+44' */; onCountryCodeChange?: (c:string)=>void;
  placeholder?: string /* "e.g. 01234 567890" */; tooltip?: string; id?: string;
}
```
Behaviour: free text accepting any formatting while focused (TID-0011/0012); on blur run `formatTelephoneNumber`; if recognised replace value, else leave as typed (TID-0013..0019). Width default fits "020 1234 5678 x1234", min "01234 567890" (ch units). Separate extension box is free text with label above (TID-0026/0027). No area-code box. Assisted mode prepends `DiallingCodeSelector`.

### 16. `DiallingCodeSelector`
Editable combobox; closed value "+44 (UK)"; list rows `[Name (left) | +code (right) | (XX) (right)]` in a 3-column grid; "United Kingdom +44 (UK)" first then all ISO 3166 countries alphabetical including UK again; "UK" replaces "GB"; type-ahead on name or code (TID-0020..0025). Width min/default fits "+376 (AD)". Data prop `countries: {name, dialCode, iso2}[]`.

### 17. `LabelledValue` (shared primitive)
`{ label: string; definition?: string; value?: ReactNode; unknownText?: string; onOpenRecord?: () => void }` renders label (label style, no colon) + value (data style, emphasised); empty value → unknownText; never "?". Used by banners. PAB-0019/0042..0048.

### 18. `AllergyStatusLabel`
`{ status: AllergyStatus }` → icon + exact label + style per PAB-0064..0072; icons have `aria-hidden` plus text label carrying meaning [suggested].

## Utility functions

```ts
// Name
formatPatientName({familyName, givenName, title}, {showTitle=true}): string
```
- family = trim, collapse internal whitespace to single spaces, `toUpperCase()` (preserve hyphens/spaces as component separators; NID-0012).
- given = per component (split on space and hyphen, keep separators) first letter upper, rest lower → "Anne-Jorun", "Mary Jane". [Caution: rest-lowercasing can damage names like "McDonald"; doc only mandates first char uppercase (NID-0031), so [suggested] only uppercase the first letter of each component and leave the rest as stored.]
- title = trim, strip one trailing ".", title case (first letter upper, rest lower: "Sir", "Mr", "Dr") [same caution]; max 35 chars.
- result: `${FAMILY}, ${Given}` + (title && showTitle ? ` (${Title})` : '').
- Missing given/family: show unknown text rather than drop the comma [suggested].

```ts
formatNhsNumber(input: string): string | null
```
- digits = input.replace(/\D/g,''); if digits.length !== 10 return null; return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6)}`.
```ts
sanitiseNhsNumberInput(raw: string): { digits: string; display: string }
```
- digits = raw.replace(/\D/g,'').slice(0,10); display groups progressively: len<=3 → d; <=6 → d[0..3]+' '+rest; else 3+' '+3+' '+rest (QIG: "1234" → "123 4").
```ts
isValidNhsNumber(digits: string): boolean  // [suggested]: checksum is out of scope of the guide (UK GDSC)
```
- [suggested, standard Modulus 11]: 10 digits; sum = Σ d[i]*(10-i) for i=0..8; check = 11 - (sum % 11); if check===11 → 0; if check===10 → invalid; valid iff check === d[9].

```ts
formatAge(dob: Date, at: Date = new Date()): string     // PAB 2.5.3 / MPB-0032
```
- Compute elapsed = at - dob.
- < 2 hours: `${floor(minutes)}min`.
- < 2 days: `${floor(hours)}hrs` (doc example "26hrs"; time-display minimal abbreviation is "hr", "hrs" permitted extension) .
- < 4 weeks (28 days): `${floor(days)}d`.
- < 1 year: w = floor(days/7), d = days%7 → `${w}w` + (d ? ` ${d}d` : '').
- < 2 years: m = whole calendar months elapsed, d = remaining whole days → `${m}m` + (d ? ` ${d}d` : '') ("1y 39d" → "13m 8d").
- < 18 years: y = whole years, m = remaining whole months → `${y}y` + (m ? ` ${m}m` : '').
- >= 18 years: `${y}y`.
- Rules: floor, whole numbers only, omit zero-valued lower unit, no space between number and unit, single space between pairs. Calendar month arithmetic is [suggested] (doc gives examples only). Age at death = formatAge(dob, dateOfDeath).

```ts
formatShortDate(d: Date): string  // dd-Mmm-yyyy, e.g. "06-Dec-2006"; months Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec; ignore locale
```

```ts
formatPostcode(raw: string): string
```
- s = raw.toUpperCase().replace(/\s+/g,''); if 5 <= s.length <= 7 return `${s.slice(0,-3)} ${s.slice(-3)}` (incode = last 3 chars [suggested derivation]); else return raw.toUpperCase().trim() (partial postcodes permitted).

```ts
formatAddress(addr: AddressValue, orientation: 'vertical'|'horizontal'): string | string[]
```
- elements = [...lines, town, county, formatPostcode(postcode), country].map(trim).filter(Boolean); horizontal → join(', '); vertical → array (no trailing commas).
```ts
truncateWithEllipsis(text: string, maxChars: number): string  // text.length<=max ? text : text.slice(0,max-3).trimEnd()+'...' (examples use "..."); prefer CSS text-overflow for pixel fit
```

```ts
formatTelephoneNumber(raw: string): { display: string; recognised: boolean }
```
1. Extension pre-pass (Part II): regex `/\s*(?:extension number|extension|extn|ext|ex|x)\s*[.:=\-]?\s*(\d+)\s*$/i` → ext; strip from raw.
2. VALID_SEPARATORS [suggested, not defined in doc] = space, hyphen, full stop, parentheses, slash.
3. If starts with '+' or '00': if /^(\+44|0044)(?!0)/ → replace prefix with '0', go UK; if /^(\+44|0044)0/ → return raw unchanged (invalid). If '00' → replace with '+'. International: match longest ITU country code (needs a code table; 1–4 digits after '+') → `+CC`; remove a following separator; remainder: if contains chars other than digits/valid separators → display `+CC ` + remainder as received; else if contains separators → replace each separator with single space (collapse); else group from the right in fours: split so no group > 6 digits and none < 3 (e.g. remainder of 7 → "123 4567", 10 → "21 2555 2368" would violate min 3, so use 3-3-4 style: [suggested algorithm: repeatedly take 4 from the right while remaining > 6; if remaining after taking would be < 3, take 3 instead]).
4. UK: if contains non-digit chars other than valid separators → return as received (recognised=false). Strip separators. If not starting '0' → as received. 
   - '01'/'02': a) starts '02' → split after 3; else b) digit[2]==='1' or digit[3]==='1' → after 4; else c) first 6 in SIX_DIGIT_CODES → after 6; else d) after 5. Then remainder > 6 digits → space before last 4.
   - '03'..'07' (03,04,05,06,07): split after 5; remainder > 6 → space before last 4.
   - '08','09': split after 4; remainder > 6 → space before last 4.
   - '00' at this point shouldn't occur.
5. Append ` x${ext}` if ext.
Examples to unit-test: "02920180928" → "029 2018 0928"; "01514960947" → "0151 496 0947"; "01632960326" → "01632 960326"; "0163296029" → "01632 96029"; "01632960541"? → rule d gives "01632 960541" (doc's "016329 60541" uses a fictional 6-digit code not in list; do not test against it); "01184960123" → "0118 496 0123"; "+44 118 123 4567" → "0118 123 4567"; "0118 9098765 ex1234" → "0118 909 8765 x1234"; "07700900555" → "07700 900555"; "+888 12.34.56.78" (unknown CC) → per rules or as entered.

```ts
SIX_DIGIT_AREA_CODES = ['013873','015242','015394','015395','015396','016973','016974','017683','017684','017687','019467']
CURRENT_GENDER_VALUES = ['Male','Female','Other Specific','Not Known','Not Specified'] as const
SEX_VALUES = ['Male','Female','Not Known','Indeterminate'] as const
CURRENT_GENDER_DEFINITIONS / SEX_DEFINITIONS (short + full + per-value texts as quoted above)
TITLE_PRESETS = ['Mr','Mrs','Ms','Dr','Rev','Sir','Lady','Lord','Dame','Other...']
ALLERGY_LABELS = { known:'Known allergies', 'none-known':'No known allergies', 'not-recorded':'Allergies not recorded', unavailable:'Allergies unavailable' }
BANNER_LABELS = { born:'Born', gender:'Gender', nhsNo:'NHS No.', preferredName:'Preferred name', died:'Died', ageAtDeath:'Age at Death', address:'Address', phoneAndEmail:'Phone and email', home:'Home', work:'Work', mobile:'Mobile', email:'Email' }
```

Open issues to resolve in the library (flagged, not invented):
1. Family name max length 35 (full guide/checklist) vs 40 (QIG, PDS).
2. Name input minimum data set: Family + Given (2.2.10) vs Title + Family + Given (2.2).
3. Banner label "Gender" vs CGS "Current Gender".
4. Telephone "valid separator characters" and international grouping algorithm under-specified; ITU code table needed.
5. Age month/day arithmetic algorithm not specified beyond examples; "hrs" vs "hr".
6. Colours, patterns, icons, font sizes for banner/deceased/allergy are designer choice; none specified.
