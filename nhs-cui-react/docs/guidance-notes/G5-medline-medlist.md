# Medication line, medications list, adverse drug risks

Source documents (NHS CUI, text in clean/): medline.txt, medlineqig.txt, medlist.txt, medlistqig.txt, advdrugrisks.txt.
Conformance: M = Mandatory, R = Recommended. Evidence rating (Low/Medium/High) given where the doc gives one.

---

## Medications Management – Medication Line, UI Design Guidance v2.0.0.0 (medline.txt)

**Purpose**: Formatting, layout and wording rules for a "medication line": the text description of one prescribed medication (drug name, strength, form, dose, route, frequency) in any view supporting single-patient medications management in a hospital ward (inpatient). Read with Medication Views 2.0.0.0, Drug Administration 3.0.0.0, Patient Banner 3.0.0.0.

**Scope notes**: In scope: oral solids/liquids, inhalers/sprays, eye/ear/nose drops, topical liquids, creams/ointments/gels, enemas, granules/powders, suppositories/pessaries, patches, nebuliser solutions, simple infusions (by example), injections (insulin example), unlicensed meds. Users: doctors/independent prescribers, nurses administering, pharmacists. Out of scope (but principles likely extend): patient-facing views, alerts/warnings, allergies, decision support, sealed envelopes, Nil by Mouth, TPN, combination infusions, titrating/variable doses, TTO, PODs, PGD, etc. Definitions: "generic drug name" approx. dm+d VTM (may be multiple active ingredients prescribed as one drug); "brand name" approx. dm+d TFN / part of AMP.

**Reference example (Figure 1, four notional views of the same medication)**:
- View 1 (single line): `diltiazem – CALCICARD CR – modified-release tablet – DOSE 120 mg – oral – three times a day`
- View 2: `diltiazem – CALCICARD CR –` / `modified-release tablet` / `DOSE 120 mg` / `ROUTE oral – three times a day`
- View 3: `diltiazem – CALCICARD CR – modified-release tablet` / `DOSE 120 mg – oral – three times a day`
- View 4: `diltiazem – CALCICARD CR` / `FORM modified-release tablet` / `DOSE 120 mg` / `ROUTE oral` / `FREQUENCY three times a day`

**Principles (3.2)**: minimise visual clutter so formatting/icons are effective for emphasis; support legibility via font, line spacing, letter spacing; standard display rules with flexibility per task. Rationale summary (3.4): minimise embellishments (bold, colour, fonts, sizes, italics, separators, symbols); minimise instances of each embellishment per reading unit; consistent embellishments within and between views; use words instead of symbols where it removes ambiguity.

### Normative guidance

3.3.1 Formatting drug names
- MEDi-001 (M, Medium): Display generic drug names in **bold**.
- MEDi-002 (M, Medium): Display generic drug names in lowercase (capital letters may still be used for acronyms/abbreviations within some names, e.g. "amphotericin B", "factor VIII", "carbomer 974P"). Do NOT title-case ("Diltiazem" is wrong).
- MEDi-003 (M, Medium): Display drug brand names in UPPERCASE (e.g. "CALCICARD CR", "IMDUR", "OXYCONTIN", "ACTRAPID"). Brand names are NOT bold (examples showing INFANRIX-IPV, DIORALYTE, GAVISCON in bold are marked incorrect). Brand-only products: brand uppercase, non-bold; any following descriptor stays as given (e.g. `INFANRIX-IPV Vaccine`, `DIORALYTE blackcurrant`, `GAVISCON aniseed`).
- MEDi-013 (M, Medium): Where both generic and brand appear, list generic first.
- Rationale: consistent styling lets users recognise generic vs brand (and lists of only-generic or only-brand, e.g. search results) without conscious interpretation; text formatting preferred over icons (less clutter). Tallman lettering is under research (dependency D2) and not mandated here.

3.3.2 Displaying numbers (applies everywhere in the line)
- MEDi-014 (R, High): Where possible avoid decimal points by changing units without breaking convention (e.g. "1 g" not "1,000 mg" is fine; "0.1 mg" should be "100 micrograms"; "500 mg" rather than "0.5 g").
- MEDi-015 (M, High): No trailing zero after a sub-decimal value ("0.5" correct, "0.50" incorrect).
- MEDi-016 (M, High): Leading zero before decimal point for values < 1 ("0.5 mL" not ".5 mL").
- MEDi-017 (M, High): Comma thousands separator for values >= 1,000 ("5,000 units", "1,000 mL", "2,000"; "5000" incorrect).
- Safety: decimal misreading (trailing zero, missing leading zero) is associated with tenfold overdose errors.

3.3.3 Separators
- MEDi-018 (M, Medium): Between attributes in a text string use a long dash (em dash) surrounded by single spaces: `" – "`. Note: the document's own rendered examples show an en dash glyph "–" (U+2013) with spaces; text says "long dash (em dash)". Do NOT use "/" between attributes; do NOT omit the surrounding spaces ("paracetamol–120 mg" wrong).
- MEDi-019 (R, Low): Multiple drug names in one line: use a double space (not dash) between each drug name and its strength: `paracetamol  500 mg + metoclopramide  5 mg – sachet – …` (rendered in source as single-space visually; rule says double space).
- MEDi-020 (R, Low): Strength as a percentage: double space (not dash) between drug name and strength: `sodium chloride  0.9% – infusion – …` ("sodium chloride – 0.9% –" incorrect).
- Rationale: dash has no grammatical meaning that conflicts, unlikely to be mistaken for a letter/digit; spaces chunk the information.

3.3.4 Wrapping
- MEDi-010 (M, Low): Wrap without breaking up a single attribute's contents unless that attribute alone will not fit on one line (e.g. "solution for injection" must stay together).
- MEDi-011 (M, Low): Keep trailing delimiters (the " –") with the preceding attribute: lines END with "–"; a continuation line must never START with "–".
- MEDi-021 (M, Medium): Long drug names that must wrap are wrapped between words only (no hyphenating/splitting words, e.g. never "sub-/cutaneous"), and should preserve phrases ("haemophilus influenzae / type B vaccine –" correct; "…type / B vaccine" incorrect because it splits "type B").
- MEDi-008 (M, Low): Never let wrapping separate a label from its value ("DOSE" and "12 units" stay together: label + value is an atomic unit).
- Safety: wrapped fragments may be ignored or read as separate information.

3.3.5 Abbreviation
- MEDi-022 (M, Medium): Do not abbreviate drug names ("para", "meto", "CPL" wrong; "chloramphenicol" right).
- MEDi-023 (R, Medium): Use long-form names rather than abbreviations or symbols where possible (e.g. "every 6 hours", "three times a day", "intravenous", "subcutaneous").
- MEDi-024 (M, Medium): No full stop after unit abbreviations ("mg", "mL"; "mg." wrong). Unit spellings used throughout: "mg", "g", "mL", "micrograms" (spelled out), "units" (spelled out), "%".

3.3.6 Truncation
- MEDi-025 (M, High): Do not truncate drug names.
- MEDi-012 (M, Low): If necessary wrap, but do not truncate medication line information (no ellipsis/cut-off, e.g. "powder for solution for in" is wrong). Also avoid passive truncation (obscured by dialogs/overlays).
- MEDi-054 (M, High): Do not display a part of the medication line alone if its meaning relies on other parts that are not displayed.
- Safety: hidden info (e.g. second ingredient) is assumed or unanticipated; leads to mis-selection.

3.3.7 Symbols
- MEDi-026 (M, High): Do not use: `@ | < > / \ & °` (at sign, vertical bar, greater than, less than, forward slash, backslash, ampersand, degree). E.g. "1,000 mL @ 40 mL per hour" wrong; write words ("at", "per", "in", "and").
- MEDi-027 (M, High): Use "+" only to join multiple drug names (multi-ingredient medications), surrounded by spaces: `paracetamol 500 mg + metoclopramide 5 mg`. When a "+" is adjacent to a "4", separate with a double space. Do NOT use "+" in a strength ("400 mg + 57 mg in 5 mL" wrong).
- MEDi-028 (M, High): Do not use brackets `( ) [ ] { }` (look like "1"); use a dash or black dot "●" instead.

3.3.8 Text labels
- MEDi-009 (M, Low): Labels use a different font AND colour from values. (QIG: stylistic font choice is illustrative; the difference is the rule.)
- MEDi-029 (M, Low): Single-text-sentence representation: label the dose only (only "DOSE"; adding "ROUTE" etc. in a single sentence is wrong). Exception implied by MEDi-040: "VOLUME" (or other dose-equivalent label) replaces DOSE.
- MEDi-030 (M, Low): Multi-line (hard line breaks) representation: labels appear at the beginning of a new line after a hard line break; every line after a hard break should start with a label (except continuation of a wrapped value, e.g. frequency text).
- MEDi-031 (M, Medium): Single space between label and value ("DOSE 1.2 mL").
- MEDi-032 (M, Medium): No colon after a label ("DOSE:1.2 mL" wrong).
- MEDi-033 (R, Low): Labels in UPPERCASE (rationale text says "mandated" for consistency). Labels seen: DOSE, VOLUME, STRENGTH, FORM, ROUTE, FREQUENCY.
- MEDi-034 (R, Medium): Keep labels in a single-text-sentence to a minimum.

3.3.9 Line breaks
- MEDi-035 (R, Low): When using hard line breaks at set points (e.g. before DOSE), do NOT put a long dash at the end of the previous line. Dash at line end only indicates a soft wrap (more on next line). E.g. `paracetamol – tablet` / `DOSE 1 g – oral – every 6 hours`. Within a wrapped attribute group (e.g. frequency text "every 4 hours as required –" / "maximum 8 puffs in 24 hours") the dash remains.

3.3.10 Line spacing
- MEDi-036 (R, Medium): Line height between 120% and 140% (leading) inclusive. 100% is wrong. Example uses 130%.
- MEDi-037 (R, Medium): In a list of medications, gap between last line of one medication line and first line of the next >= one line height at 100% (i.e. >= 1em).
- Safety: prevents mis-associating a line with the medication above/below.

3.3.11 Displaying dose
- MEDi-007 (M, Low): Text label reading "DOSE" before a dose.
- MEDi-038 (M, Medium): Dose amount AND units in bold ("**2 mg**", "**2 sachets**"; bolding only "2" is wrong).
- MEDi-039 (M, Medium): Dose expressed as a volume: volume amount (and units, per example "**1,000 mL**") in bold, labelled "VOLUME" (e.g. `sodium chloride 0.9% – infusion – VOLUME 1,000 mL – 40 mL per hour – over 12 hours – intravenous – once only`).
- MEDi-040 (M, Medium): No dose or volume: display a dose equivalent in place of the dose, same rules, with an appropriate text label.
- MEDi-041 (M, High): Space between dose amount and units ("2 mg" not "2mg").
- MEDi-042 (M, High) / MEDi-043 (M, High) / MEDi-044 (M, High): no trailing zero, leading zero, thousands comma in dose values.
- Dose ranges written with "to": "DOSE 10 to 20 mL"; frequency ranges "every 4 to 6 hours as required".
- Note: does not preclude qualifiers such as "0.1 mg per kg" (paediatrics).
- Safety: labelling dose prevents confusing strength numbers with dose numbers; dose labelled (not strength) because dose is always present.

3.3.12 Displaying strength
- MEDi-045 (M, Medium): Ingredient in a fluid: use "in" not "/" before fluid quantity: "120 mg in 5 mL".
- MEDi-046 (M, Medium): Ingredient per single unit of fluid: use "per": "100 units per mL" (not "100 units / mL", not "100 units in 1 mL"). Also "100 micrograms per dose", "40 mL per hour".
- MEDi-047 (M, Low): Combination drug whose two strengths share a unit: join with the word "and" in a SMALLER font, units only after the second value: "400 and 57 mg in 5 mL", "co-codamol – 8 and 500 mg – tablet". ("400 mg and 57 mg" with same-size "and" incorrect; listing ingredient names with strengths for a combination generic e.g. "30 mg codeine – 500 mg paracetamol" incorrect.) Smaller font is used nowhere else in the line, so it signals a combination drug.
- MEDi-048 (R, High) / MEDi-049 (R, High) / MEDi-050 (R, High): no trailing zero, leading zero, thousands comma in strength values.

3.3.13 Attribute order
- MEDi-051 (R, Low): Line order: drug name, brand name, strength, form, dose or volume, rate, dose duration, route, frequency (as applicable). Abstract: `generic – BRAND – strength – form – DOSE dose – route – frequency`. Additional qualifiers (e.g. "as required", "after food", "maximum 6 doses in 24 hours") follow frequency.
- MEDi-052 (R, Low): For specific contexts needing extra labels/line breaks, drug name first; other attributes may be reordered.
- MEDi-053 (R, Low): If not a single line and attributes reordered, label as many of: STRENGTH, FORM, ROUTE, FREQUENCY.
- Rationale: generic first; strength next to drug name; separate strength numbers from dose numbers (never place strength adjacent to dose); form next to strength and before dose.

Worked examples (canonical strings for tests):
- `morphine – 10 mg in 2 mL – solution for injection – DOSE 2 mg – intravenous – once only`
- `oxycodone – OXYCONTIN – modified-release tablet – DOSE 10 mg – oral – once only`
- `heparin – 5,000 units per mL – solution for injection – DOSE 5,000 units – subcutaneous injection – once only`
- `co-amoxiclav – 400 and 57 mg in 5 mL – suspension – DOSE 1.2 mL – oral – every 12 hours` (QIG/strength section order) 
- `paracetamol 500 mg + metoclopramide 5 mg – sachet – DOSE 2 sachets – oral – every 4 hours as required – maximum 6 doses in 24 hours`
- Multi-line: `salbutamol – metered dose inhaler` / `STRENGTH 100 micrograms per dose` / `DOSE 2 puffs` / `ROUTE inhaled` / `every 4 hours as required –` / `maximum 8 puffs in 24 hours`

### Accessibility
- Legibility via line height 120-140%, inter-item spacing >= 1 line, minimal embellishment.
- Label differentiation uses font + colour + uppercase (not colour alone).
- Wrapping instead of truncation preserves full content for all users (also screen readers [suggested]: expose full line as accessible text, separators read as pauses).

### Patient safety rationale (key)
- Incorrect dose/strength/frequency, omitted and wrong medicine are the commonest NPSA incident types; consistent format reduces misinterpretation.
- DOSE label + bold dose prevents strength/dose confusion.
- Number rules prevent decimal-point overdose errors.
- No truncation/abbreviation prevents wrong-drug selection.

---

## Medication Line – Quick Implementation Guide, Edition 1 (20 May 2010) (medlineqig.txt)

**Purpose**: Condensed restatement of all Medication Line guidance points (v2.0.0.0) with visuals; not a substitute for the full doc. States visual stylistic choices (e.g. font) are illustrative and not mandatory unless specified.

### Normative guidance
- Identical guidance points and conformance to medline.txt: MEDi-001/002/003/013 (M); 014 (R); 015/016/017 (M); 018 (M); 019/020 (R); 010/008/011/021 (M); 022 (M), 023 (R), 024 (M); 025/012/054 (M); 026/027/028 (M); 009/031/032 (M), 033 (R), 034 (R), 029/030 (M); 035 (R); 036/037 (R); 007/038/039/040/041/042/043/044 (M); 045/046/047 (M); 048/049/050 (R); 051/052/053 (R).
- Attribute order numbered list (MEDi-051): 1 Drug name, 2 Brand name, 3 Strength, 4 Form, 5 Dose or volume, 6 Rate, 7 Dose duration, 8 Route, 9 Frequency.
- MEDi-026 symbol table: "@ At sign", "| Vertical bar", "> Greater than bracket", "< Less than bracket", "/ Forward slash", "\ Backslash", "& Ampersand", "° Degree". MEDi-028: "() Parentheses", "[] Brackets", "{} Braces".
- Visual: "line height from 120% to 140%"; "at least 100% of line height" between medication lines.
- No additional rules beyond the full document.

---

## Medications Management – Medications List, UI Design Guidance v1.0.0.0 Baseline (medlist.txt)

**Purpose**: Layout, content and interaction rules for a Medications List View: a tabular (rows/columns) list of one patient's current or past medications in an inpatient ward, for reviewing medications and checking scripts. Replaces "Medication Views 2.0.0.0". Read with Medication Line 2.0.0.0, Patient Banner 3.0.0.0, Displaying Graphs and Tables 2.0.0.0. Stylistic choices (colours, fonts, icons) in examples are illustrative, not mandatory unless specified.

**Scope notes**: In scope: list structure, current/past filtering, past filters, grouping (headers, expand/collapse, multi-group items), sorting, notifications ("Patient nil by mouth", recent past), look-ahead scroll bars (LASB, generic to any view). Out of scope: all-details-for-one-medication panel (risk: occluding the list), allergies/ADR (separate doc), decision support, reconciliation, administration review. All medications info anywhere (even in non-medication views) must still conform to Medication Line guidance. Context (Fig 1-4): Medications View sits under Patient Banner and Global Navigation, with a Medications Toolbar; key parts: Current/Past menu buttons, Grouping control ("Group by Status"), column headings with sort indicator ("Start ▼"), top and bottom LASB notifications, group headings ("Group A (2)"), recent past notification ("3 past medications were completed...").

**Principles (3.2)**: info for a high-level assessment; restrict unnecessary info; details on demand in context; avoid occlusion and provide clear signposts; describe inclusion criteria with explicit labels (what is shown and how complete it is).

**Note on IDs**: The source reuses some IDs: MEDv-173 (status=past definition in 3.3.13 AND drug details first column in 3.3.16), MEDv-174 (Current/Past one-selected in 3.3.15 AND recent past formatting in 3.3.17), MEDv-175 (status first in past 3.3.18; appendix also lists it against 3.3.17). Appendix renumbers "label the counts" as MEDv-073 and "Past button indicates selected" as both MEDv-069 and MEDv-176; body text labels "clearly label the counts" MEDv-176. Library should reference by section + description, e.g. "MEDv-173 (3.3.16)".

### Normative guidance

3.3.1 Tabular layout
- MEDv-020 (M, Medium): Present medications as lines of text within rows in a table; each row = exactly one medication. Not a card/grid of tiles; not one data point per column.
- MEDv-141 (R, Medium): Use composite columns to minimise blank cells (avoid placing each data point in its own column). Drug Details column holds the full medication line in sentence style (Medication Line rules).
- Example row: `temazepam – tablet – DOSE 20 mg – oral – at night` | `Started` | `26-May-2010`; `oxygen 60% – inhalation gas – RATE 15 L per minute – continuous – with non re-breather bag` (note RATE label used as dose equivalent); `co-amilofruse – 5 mg and 40 mg in 5 mL – solution – DOSE 5 mL – oral – once a day`.
- Rationale: flexible layout = clearer inter-relationships for screen readers; different medication types need different attributes.

3.3.2 Indicating list length
- MEDv-142 (R, Low): When scrolled to the end, show a blank space at the bottom of the list equal to exactly one line of text height (not none, not more).

3.3.3 Gridlines
- MEDv-021 (M, High): Avoid strong grids and strong vertical lines; use subtle row separation. Correct: no vertical gridlines, thin pale horizontal lines.

3.3.4 Row formatting
- MEDv-143 (M, Medium): Use at least alternate row shading OR lines between rows.
- MEDv-022 (R, Low): Use subtle alternate row shading.
- MEDv-144 (M, Medium): Shading colour/brightness must not interfere with foreground text readability (W3C AERT 2.2.1 brightness/colour-difference algorithm cited).
- MEDv-145 (R, Low): Supplement alternate shading with 1 point pale lines between rows.

3.3.5 Icons for drug details
- MEDv-023 (M, Low): Support display of icons appended after the text of the Drug Details column (inside the composite cell; not forced into a separate column).

3.3.6 Empty lists
- MEDv-146 (M, Low): Display a message when the list is empty. Example text: "There are no current medications for this patient" (shown in the list body under the column headings). [suggested past equivalent: "There are no past medications for this patient"].

3.3.7 Mandatory columns
- MEDv-147 (M, High): A Status column, including information defining 'current' or 'past'.
- MEDv-148 (M, Medium): A Drug Details column (per Medication Line guidance).
- MEDv-149 (M, Medium): Current medications: an initiation date column (e.g. date of first planned administration; examples: "Start Date", "First Administration", "Date Prescribed").
- MEDv-150 (M, Medium): Past medications: a stop date column (e.g. last administration or discontinued date; examples: "End Date", "Last Administration").

3.3.8 Date columns
- MEDv-151 (M, Low): When an end date column is displayed, start date column goes before (left of) it.
- MEDv-152 (R, Medium): With end date and no duration column, place start date adjacent to end date.
- MEDv-153 (M, Low): Fixed-width date columns (sized to the date content, not wider).
- MEDv-154 (M, Low): Consistent placement of date columns relative to each other and to Drug Details in both current and past.
- Date display format in all examples: `dd-Mmm-yyyy` (e.g. "26-May-2010").

3.3.9 Column headings
- MEDv-155 (R, Medium): Unambiguous, succinct headings, e.g. "Status", "Date Prescribed", "First Administration". Not "Date" (ambiguous); not long phrases ("Date of the first recorded or scheduled administrative event"). Headings in Title Case in examples.
- MEDv-156 (M, Low): Each column heading unique.
- MEDv-157 (M, Low): When a column combines two same-type attributes (e.g. dates), the heading names both: e.g. "Review and End Dates".

3.3.10 Composite columns
- MEDv-027 (M, Low): Allow a column to contain more than one attribute for a medication.
- MEDv-158 (M, Medium): When combining two same-type attributes in a cell, label BOTH within the cell: "Review 06-Jun-2010" / "End 12-Jun-2010" (unlabelled second date is incorrect).

3.3.11 Constraining dimensions
- MEDv-159 (M, Low): Drug Details column must be the widest (example: wider than all remaining columns collectively; narrower-than-others-collectively is "not recommended").
- MEDv-160 (M, Medium): No horizontal scrolling: limit the number of visible columns instead.
- MEDv-161 (R, Low): Define minimum widths for all columns (avoid columns resized to a few characters; no truncation of date e.g. "26-May-20" shown in incorrect example).

3.3.12 Displaying status
- MEDv-162 (M, High): Every medication has a status; status never blank.
- MEDv-163 (R, Low): Status descriptions short, preferably <= 2 words.
- MEDv-164 (R, Low): Status may be supplemented with extra info on a second line, e.g. "Verified", "Not Verified" (pharmacy verified). The supplement must not replace the primary status (e.g. a row showing only "Not Verified" is wrong).
- MEDv-165 (M, High): Status must differentiate medications with no recorded administration events ("Not Started") from those with ("Started").

3.3.13 Specific status values (all R unless noted)
- MEDv-166 (M, Medium): Support status 'Suspended' and include suspended medications in current medications.
- MEDv-167 (R, Medium): "Started": administration event recorded and further scheduled administrations.
- MEDv-168 (R, Medium): "Not Started": administration scheduled and start date in future.
- MEDv-169 (R, Medium): "Suspended": marked not to be administered but intended to be resumed later.
- MEDv-170 (R, High): "Completed": administration events recorded per schedule (within tolerances) and end date in past. Rationale: at least one administration recorded as successful is required for "Completed".
- MEDv-171 (R, High): "Discontinued": stopped on a date preceding one or more scheduled administrations.
- MEDv-172 (R, Medium): Current = Started, Not Started, Suspended.
- MEDv-173 (R, High): Past = Completed, Discontinued.
- ePrescribing spec sub-statuses that can supplement: Not Started (Not fully specified, Awaiting confirmation, Verified); Started (Authorised for supply or administration, Verified).
- Status cell text in examples: "Started", "Not Started", "Suspended on 28-May-2010" (suspended shows date), "Completed", "Discontinued".

3.3.14 Formatting status
- MEDv-024 (M, Medium): Visual design draws attention to suspended medications (cell-level and/or whole-row treatment; examples shade the status cell and optionally the row).
- MEDv-025 (M, Medium): Visual design distinguishes a current list from a past list (e.g. different formatting of past status values; status column placement; LASB counts only).
- MEDv-042 (M, Low): Status of each medication in bold.

3.3.15 Controls for current and past
- MEDv-063 (M, Medium): Buttons labelled exactly "Current" and "Past" to display current and past medications. Not tabs (tabs ruled out: take more space).
- MEDv-062 (M, High): Current selected by default.
- MEDv-064 (M, High): Visual formatting of the buttons indicates which is selected.
- MEDv-065 (M, Medium): Never both selected.
- MEDv-174 (3.3.15) (M, Medium): Exactly one of Current/Past selected at all times (never neither).
- MEDv-066 (M, Medium): Past button supplemented with a drop-down control (split/menu button) to display, select and apply a filter on past medications.
- MEDv-067 (M, High): Drop-down includes an option to display all past medications. Example options: "Show All Past", "Past week", "Past month", "Past 3 months", "Past 2 years".
- Both buttons remain visible when switching. Current/Past buttons, past filter and grouping control all on one line (toolbar).
- An additional "All" (current+past) view is not ruled out but needs careful risk consideration.

3.3.16 Displaying current medications
- MEDv-099 (M, High): Default sort current medications reverse chronologically by a starting date (most recent at top). Sort indicator "▼" on that column (e.g. "First Administration ▼").
- MEDv-173 (3.3.16) (M, Low): Current: Drug Details is the first (leftmost) column. Typical order: Drug Details | Status | Start date.

3.3.17 Recent past notifications
- MEDv-074 (M, Medium): In current medications, display a notification for medications completed or discontinued within a specified (configurable) interval from now.
- MEDv-075 (M, Medium): Clearly display the time interval in the notification.
- MEDv-077 (M, Medium): Display a count of recently past medications in it.
- MEDv-174 (3.3.17) (R, Low): Format the notification distinctly from medication rows.
- Placement: at the end of the current medications list (as a row after the last medication). Wording example: "2 past medications were completed or discontinued in the last 48 hours". Incorrect: "4 past medications were recently completed or discontinued" (no interval); "Medications were completed or discontinued in the last 48 hours" (no count). Do not list the recent past medications themselves inside the current list (removed guidance).

3.3.18 Displaying past medications
- MEDv-100 (R, Medium): Default sort past medications reverse chronologically by end date (or equivalent), most recent first ("Last Administration ▼").
- MEDv-175 (M, Low): Past: Status column first (leftmost), Drug Details second. Example: `Completed | hydrochlorothiazide – tablet – DOSE 100 mg – oral – 4 times a day`, `Discontinued | methyldopa – tablet – DOSE 250 mg – oral – twice a day`.

3.3.19 Filtering past medications
- MEDv-069 / MEDv-176 (M, High): When a past filter is applied, the Past button shows as selected.
- MEDv-070 (M, Medium): Filter notification displayed at top of list, below column headings and above the (top LASB) scroll area, pushing the list down a line. Not above the column headings.
- MEDv-068 (M, High): Filter notification contains a control to remove the filter: "Remove Filter" (inside the notification, not elsewhere).
- MEDv-071 (M, Medium): Notification describes the filter: "This list is filtered to show: Past 2 months". ("This list is filtered" alone is incorrect.)
- MEDv-072 (R, Low): Include a count of displayed meds and total unfiltered past meds.
- MEDv-176 (3.3.19 body) / MEDv-073 (appendix) (R, Medium): Clearly label the counts. Example: "The total list (54) is filtered to show: Past 2 months (3)". Do NOT use ambiguous "Past month (10 of 24)".
- Filter can be changed via the same drop-down or "all past". Current medications must never be filtered (only grouped/collapsed with clear signposting).

3.3.20 LASB (look-ahead scroll bar): definition: standard scroll bar supplemented with notifications at top and bottom listing items out of view.
- MEDv-177 (M, High): When the list (current or past) is longer than the viewport and scroll bar is active, clearly indicate medications out of view.
- MEDv-178 (R, Medium): For current medications, supplement the scroll bar with notifications showing names of out-of-view drugs (LASB).
- MEDv-179 (M, Medium): Reserve fixed space at top and bottom of the list (below column headings, inside list area) for look-ahead notifications (space is permanent, not dynamic).
- MEDv-180 (R, Medium): Reserved space has a pale solid background colour distinguishable from the list background.
- MEDv-181 (R, Low): With grouping and a collapsed group out of view, still list drug names of every out-of-view drug, whether in collapsed or expanded groups.
- Rejected alternatives (do NOT do): notification overlaying/occluding list rows; forcing scroll so no line is partial; plain white reserved space; dynamically showing space only when needed; "start of the list"/"end of the list" messages.

3.3.21 LASB interactions
- MEDv-058 (M, Low): Update notifications dynamically while scrolling.
- MEDv-059 (M, Medium): Notification width grows/shrinks to fit contents, up to available width (no wider than needed).
- MEDv-182 (M, Medium): Notification is NOT clickable for navigation (drug names/counts not links).

3.3.22 LASB notification display
- MEDv-044 (M, Medium): Each notification is a single line.
- MEDv-043 (M, Medium): Notifications visually joined to the scroll bar's up arrow (top) and down arrow (bottom) respectively; right-aligned against the scroll bar.
- MEDv-045 (M, Medium): Nothing (controls, notifications, column headings) may separate the notification from the medication rows.

3.3.23 LASB contents selection
- MEDv-049 (M, Medium): Order of items in the notification is the same as the list order.
- MEDv-183 (R, Low): If any drug-name text (other than ascenders/descenders) is obscured by the list boundary, include the drug in the notification; if the drug name is fully visible (even if later wrapped lines are hidden) do not include it (avoid apparent duplicate).

3.3.24 LASB contents display
- MEDv-048 (M, Medium): Populate right-to-left so the next drug in the list (the one nearest the viewport) is closest to the scroll bar (rightmost). E.g. bottom: "2 more · ooo · nnn · mmm · lll · kkk" where kkk is next below; top: "6 more · metformin · glicazide · … · aspirin · isosorbide mononitrate" where isosorbide mononitrate is immediately above.
- MEDv-052 (M, Medium): If more items than fit (current meds), show as many as possible then a count of the remainder at the far (left) end: "N more".
- MEDv-053 (M, Medium): If any medication included in the count has decision support alerts, show an alert icon next to the count.
- MEDv-055 (M, Medium): Current medications only: show drug names and decision support alert icons (icon next to the relevant drug name).

3.3.25 LASB contents formatting
- MEDv-056 (M, Medium): Delimiter unlikely to be read as character/number, e.g. black dot "●" (rendered as middle dot "·" in examples) with a space either side, between drug names and between count and drug names. Not "#".
- MEDv-184 (M, Low): No leading or trailing delimiters.
- MEDv-185 (M, Low): No additional text/formatting to indicate grouping in the notification.

3.3.26 Drug names in the LASB
- MEDv-050 (M, High): If an exceptionally long drug name does not fit, include it in the count instead.
- MEDv-051 (M, High): Never truncate or abbreviate drug names in the notification ("brompheniramine + pseudo..." is wrong).
- Display drug name only (generic name per Medication Line, e.g. "paracetamol + metoclopramide").

3.3.27 LASB notification formatting
- MEDv-186 (M, Medium): Drug names bold, black text by default.
- MEDv-187 (M, Medium): Counts and descriptive text ("more") normal weight (black).
- MEDv-188 (R, Medium): Light solid background for the notification, different from the reserved-space colour and from the black text. No gradients; no dark backgrounds.
- MEDv-189 (R, Low): No dark border nor border > 1 point (none, subtle grey or pale blue < 1pt OK).

3.3.28 LASB for past medications
- MEDv-054 (M, Low): Past medications: counts only ("3 more"), no drug names.

3.3.29 Grouping control
- MEDv-084 (M, High): Standard drop-down list (single select) for grouping (not buttons/segmented list).
- MEDv-085 (M, Medium): Label "Group by".
- MEDv-190 (M, High): Include option "None". Example options: None, Drug Name, Route, Frequency, Route and Frequency, Status.

3.3.30 Supporting grouping
- MEDv-083 (R, Medium): No grouping active by default.
- MEDv-087 (M, High): Retain column sort order within groups when grouping is applied.
- MEDv-191 (M, Medium): Groups expanded by default (never collapsed by default).
- MEDv-192 (M, Low): Restart alternate row shading at the start of each group (first row of each group unshaded); not needed if each group has one medication.
- MEDv-193 (M, Low): After selecting a grouping, at least one group heading must be visible.
- Grouping and collapse state independent for Current and Past lists. Current list must not be filtered.

3.3.31 Group headings
- MEDv-086 (M, Medium): Clear and prominent headings (larger and/or bolder than row text).
- MEDv-090 (R, Medium): Do not show headings for empty groups (exception: small fixed task schemes like Regular, As Required, Once Only, Infusions).
- MEDv-091 (M, Medium): Provide 'null' groups for medications with no value for the grouping attribute.
- MEDv-194 (M, Low): Null group label in brackets: e.g. "(No Form Specified)" (note: the guidance's own MEDi-028 avoids brackets in medication lines; this is a heading).
- MEDv-195 (R, Medium): Null groups at the top of the group list.

3.3.32 Collapsing groups
- MEDv-092 (M, High): Expand/collapse control for each group at the beginning (left) of the heading.
- MEDv-089 (M, Medium): Collapsed group heading shows a count: "Oral (2)". Expanded groups show no count.
- MEDv-196 (M, Medium): Group headings selectable; context menu with "Collapse All Groups" and "Expand All Groups".

3.3.33 Combining groups
- MEDv-197 (M, Medium): Medication belonging to several groups goes in a new combined group labelled with combined names.
- MEDv-198 (M, Medium): Each medication appears in exactly one group (no duplication).
- MEDv-199 (M, Medium): Combined names ordered as they would be sorted by that attribute.
- MEDv-200 (R, Low): Separate combined names with a semicolon: "Analgesic; Non-steroidal Anti-inflammatory (1)". (Body text of MEDv-197 shows a comma example; the recommended separator is "; ".)

3.3.34 Sorting
- MEDv-101 (M, High): Click a column heading to sort by it.
- MEDv-102 (M, High): Click the active sort column heading to reverse.
- MEDv-103 (R, Medium): Format the active sort column heading distinctly.
- MEDv-104 (M, Medium): Icon or symbol (e.g. triangle "▼" descending / "▲" ascending) in the heading shows sorted column and direction.
- MEDv-105 (M, Medium): When sort changes from default, retain the default as secondary sort.
- Sorting by hidden attributes is allowed via other mechanisms (MEDv-106 removed).

3.3.35 Levels of detail
- MEDv-201 (R, Medium): Provide a control to change type/quantity of displayed info (rows/columns/layout may change). Mandatory columns (3.3.7) stay.

3.3.36 Selection and action
- MEDv-202 (M, High): No medications selected by default on open.
- MEDv-122 (M, Medium): Click or Spacebar selects a medication.
- MEDv-123 (M, High): Selected rows clearly highlighted (contrast per W3C).
- MEDv-124 (R, Low): Keep selection when switching views (e.g. to Drug Administration).
- MEDv-125 (M, Medium): Keep selection when grouping/sorting changes and keep it visible (scroll into view).
- MEDv-126 (M, High): Ctrl+click discrete multi-select; Shift+click contiguous.
- MEDv-127 (M, High): Keyboard: Shift+Arrow for contiguous; Ctrl+Space toggles selection for non-contiguous.
- MEDv-203 (M, High): Action on >1 medication: show a summary of the selected medications before completing.

3.3.37 Context menus
- MEDv-128 (M, Medium): Context menu for selected medications (e.g. right-click) [suggested: also Shift+F10 / ContextMenu key].
- MEDv-129 (M, Medium): Appropriate actions/options.
- MEDv-130 (R, Medium): Icons on actions where appropriate.
- MEDv-131 (M, Medium): Grey out (disable, still visible) actions unavailable for any of the current selections.
- MEDv-132 (M, Medium): Consistent static order; frequent actions higher.
- MEDv-133 (M, Medium): Group items: direct actions; actions that add information; actions that display more information.

3.3.38 Access to details
- MEDv-135 / MEDv-136 (M, Medium): Context menu includes an option to display all details for the selected medication.

### Accessibility
- Composite sentence-style cells keep relationships clear for screen readers.
- Alternate shading must keep text contrast (W3C AERT brightness/colour difference); selection highlight must meet W3C contrast.
- Full keyboard selection (Space, Ctrl+Space, Shift+Arrow), context menu access.
- Status formatting: bold + visual design; [suggested] do not rely on colour alone for Suspended/past distinction.
- LASB is non-interactive (no focus stops) [suggested: provide aria-live polite or aria-describedby summary of out-of-view counts].

### Patient safety rationale (key)
- Default reverse-chronological sorts, no grouping by default, mandatory columns: prevent inappropriate default settings hiding information.
- Not Started vs Started: prescriber may assume a medication has been given (duplicate/overdose risk).
- Suspended highlighting: frequent users may miss a recent status change.
- Recent past notification: drugs just completed may still be pharmacologically active.
- Past list: status first, different formatting, counts-only LASB: avoid mistaking past for current.
- LASB: out-of-view current medications may be overlooked; no truncation in LASB (hidden second ingredient); obscured-threshold rule avoids appearing prescribed twice.
- No duplicate in groups: duplicates read as separate prescriptions.
- Multi-select summary: off-screen selected items may be forgotten.
- No horizontal scroll: drug name scrolled away, row misassociation.

---

## Medications List – Quick Implementation Guide, Edition 1 (20 May 2010) (medlistqig.txt)

**Purpose**: Condensed, illustrated restatement of all Medications List v1.0.0.0 guidance points (not a substitute; stylistic choices illustrative). Sections: Structure and Layout, Columns, Status, Current and Past Medications, Filtering, Look-Ahead Scroll Bar, Grouping, Sorting, Levels of Detail, Selection.

### Normative guidance (same points/conformance as medlist.txt; additional concrete details only)
- Conformance matches the full doc. QIG numbering: uses MEDv-069 and MEDv-176 for "Past button indicates selected" and "Clearly label the counts" respectively (consistent with full-doc body for 176).
- Illustration column layout, current: `Drug Details | Status | Start Date ▼ | End Date` (start before end, both fixed width). Past: `Status | Drug Details | End Date` (QIG shows "▲" on End Date with rows 26-May, 25-May, 24-May, i.e. most recent first; the full doc uses "▼" for reverse chronological. Treat the indicator glyph as: ▼ = descending/most recent first per full doc).
- Filter notification example (exact): "The total list (54) is filtered to show: Past 2 months (3)" followed by a "Remove Filter" control, positioned directly under the column headings. Labels: "count of unfiltered total" (54) and "count of filtered total" (3).
- Past filter drop-down options example: "Show All Past", "Past week", "Past month", "Past 3 months", "Past 2 years".
- Current/Past buttons: two visual styles allowed (e.g. pressed toggle or segmented); selection must be visually indicated.
- Recent past notification example (exact): "2 past medications were completed or discontinued in the last 48 hours" (shown as last row of current list); annotations "Time interval", "count".
- LASB with grouping (MEDv-181): example top notification "aspirin · paracetamol" when a collapsed group above (containing aspirin and paracetamol) is scrolled out; collapsed groups below show "Rectal (1)", "Intravenous (3)".
- LASB order illustration (MEDv-049/048): list items 6..11 visible; top notification "1 · 2 · 3 · 4 · 5" (item 5 nearest scroll bar, rightmost); bottom notification "16 · 15 · 14 · 13 · 12" (item 12 nearest scroll bar, rightmost). So: top notification = items above in list order left→right; bottom notification = items below in REVERSE order left→right (next item rightmost). Count ("N more") always leftmost.
- MEDv-050 example: a notification containing only "1 more" when the single out-of-view drug name is too long to fit.
- MEDv-183 example: bottom notification "4 more · paracetamol · atenolol · ramipril · clopidogrel · fluticasone · tiotropium · salbutamol" where salbutamol's name is partially obscured at the bottom edge.
- Null group example ordering: "(No Form Specified)" first, then "Tablet", "Solution".
- Collapsed heading "Oral (2)" with expand control at start; expanded "Inhaled" without count. Context menu on heading: "Collapse All Groups", "Expand All Groups".
- Combined group: "Analgesic (2)", "Analgesic; Non-steroidal Anti-inflammatory (1)", "Non-steroidal Anti-inflammatory (1)" (semicolon separator, names in sort order, groups in sort order).
- Sorting: (1) default "Start Date ▼" = most recent first; (2) clicking toggles to "Start Date ▲" = most recent last. MEDv-105 example: sort by "Drug Details ▼" (alphabetical: oxygen, paracetamol, paracetamol, salbutamol, salbutamol) with ties ordered by the default secondary sort (Start Date most recent first: paracetamol 26-May-2010 before 08-Apr-2010). Note the "▼" on an alphabetical A→Z sort here, so the glyph indicates "sorted, default direction"; library should define direction explicitly [suggested: ▲ ascending, ▼ descending, with aria-sort].
- Levels of Detail: example controls shown as "+ –" (expand/reduce detail) or "A B C D" (pick a named level) [illustrative].
- Context menu example items: "Details..." (all details; frequently used, at top), "Suspend", "Edit"; groups separated: information / actions.
- Selection illustration: clicking a row highlights it; selection retained after sort direction change.

### Accessibility / safety
- As for medlist.txt. No additional points.

---

## Display of Adverse Drug Reaction Risks, UI Design Guidance v1.0.0.0 Baseline (13 Jan 2009) (advdrugrisks.txt)

**Purpose**: How to display a patient's list of adverse drug reaction (ADR) risks (propensities), their supporting events/justification, provenance, absence-of-risk states, no-decision-support indication, and risks in narrative text. Read with Date Display 3.0.0.0, Medication Line 2.0.0.0, Displaying Graphs and Tables 2.0.0.0, Terminology – Display Standards for Coded Information 2.0.0.0. Note: the source PDF's usage-example figures (Figs 3-42) are images and their content is NOT in the text; only figure captions are available.

**Key concepts**:
- Risk vs event: a "risk phrase" (future propensity: causative agent + summary of past reactions) is distinct from "event phrases" (past reaction events, "risk identified", "risk confirmed", patient account etc.). One risk may link to many events; events can exist without risks; risks can exist without events.
- NHS CFH categories (allergic drug reaction / adverse drug reaction / drug intolerance) exist in data but must NOT be shown at risk level (user research: inconsistent, misleading).
- Encoding: SNOMED CT and dm+d assumed; causative agent may be encoded or free text; app recognises "allergy to penicillin" and "intolerance to penicillin" as subtypes of "propensity to adverse reaction to penicillin".
- Out of scope: DSS alerts/warnings, long list handling, abbreviated ADR status in patient banner, event detail content/structure.

**Principles (3.2)**: sufficient content to act; minimise ambiguous/irrelevant content; distinguish future risk from past events (distinct content, labelling, location); distinguish individual phrases visually; common unambiguous terminology; appropriate ordering; easy access to justification and easy return to high level; communicate provenance.

### Normative guidance

3.3.1 Structure of ADR risk list (two-level disclosure)
- ADR-0001 (M, High): Multiple levels: an immediate view "Level 1" with the risk phrase (causative agent + any past reactions) and "Level 2" views (not immediately visible) with supporting events data, if such data/linkages exist.
- ADR-0002 (M, High): Mechanism to access relevant Level 2 items from each Level 1 risk (e.g. selecting/clicking the risk reveals its supporting events).
- ADR-0003 (M, High): Mechanism to return to the Level 1 list (clear back navigation).
- ADR-0004 (M, High): Each Level 1 risk phrase links to one or more related Level 2 event phrases (if they exist).
- ADR-0005 (M, Medium): Level 1: causative agent column is the far-left column.
- ADR-0006 (M, Medium): Level 1: past reactions column to the right of causative agent. (Do not put agent in the right-hand column; do not merge data types into one line/cell.)
- ADR-0007 (R, Low): Mechanism to access further details from Level 2 line items ("Level 2: details").
- ADR-0008 (M, High): Consistent default order.
- ADR-0009 (R, Low): Default order: alphabetical by generic medication name (causative agent). Not by date, severity, certainty, type, or random.
- User research: supporting events must be immediately accessible from the risk statement (e.g. not hidden behind a tab).

3.3.2 Content of risk phrases
- ADR-0010 (M, High): Causative agent = a single medication, excipient or drug class.
- ADR-0011 (M, High): Causative agent shown in Level 1.
- ADR-0012 (R, Medium): Display the agent in the same text as recorded (typically VTM or drug class; less commonly Trade Family name e.g. Gaviscon, Dioralyte, or excipient). Do not transform/normalise.
- ADR-0013 (M, High): No two risk phrases with the same causative agent (deduplicate; one row per agent).
- ADR-0014 (M, High): Handle both encoded and unencoded (free text) agents.
- ADR-0015 (R, High): Prefer encoded display where possible (free text never the default at entry).
- ADR-0016 (R, Medium): No form, route or dosage in Level 1 (these belong in Level 2 event details).
- ADR-0017 (M, Medium): Level 1 shows a description of any linked past reactions, if available.
- ADR-0018 (R, Medium): Past reactions as key words, ideally one or two words per reaction (e.g. "anaphylaxis", "rash", "nausea").
- ADR-0019 (R, Low): If past reactions unknown, say so (exact text not specified in the text extract; [suggested] "Not known").
- ADR-0020 (M, Medium): Support multiple past reactions per agent.
- ADR-0021 (R, Medium): Distinguish simultaneous reactions (same event) from reactions on different occasions.
- ADR-0022 (R, Low): Simultaneous reactions joined by "+" or the word "AND" in capitals: "rash + nausea" or "rash AND nausea" (SNOMED CT convention).
- ADR-0023 (R, Medium): Reactions from different events separated by a comma: e.g. "rash + nausea, anaphylaxis".
- ADR-0024 (M, High) / ADR-0025 (R, Medium): Clearly label causative agents; recommended column header "Drug / substance". (User research alternative suggestion: "Medication / Substance".)
- ADR-0026 (M, High) / ADR-0027 (R, High): Clearly label past reactions; recommended label "Past reactions" (makes clear they are past, not predicted future reactions).
- ADR-0028 (M, High) / ADR-0029 (R, Medium): Clearly label the whole list; recommended title "Adverse drug reaction risks".
- Do NOT show categorisation (allergy/intolerance/ADR), severity, certainty or risk grading ("Low risk") in Level 1. Legacy severity/certainty data brought forward unchanged as a Level 2 event (e.g. "Risk identified"), not on the risk phrase. Do not automatically display drug class (e.g. "NSAID") with the risk.

3.3.3 Supporting data (Level 2)
- ADR-0030 (M, High): Level 2 shows at least one event phrase (preferably encoded) if available and linked.
- ADR-0031 (R, Medium): If no reaction event known, show other justification, e.g. reference to patient's assertion (may be free text).
- ADR-0032 (R, Medium): Supporting data may include non-event info, e.g. patient's account of allergy history.
- Example Level 2 entries: risk entry ("Risk identified"), actual reaction event, clinician confirming risk with patient ("Risk confirmed"); each with when, where, by whom. Level 2 details may include brand name, dosage, route of the medication that caused the reaction.

3.3.4 Format of list
- ADR-0033 (M, High): Level 1 medication column must be able to expand to a default width of at least 44 characters, allowing a maximum two-line wrap; wrap only at spaces (never split a word). (Rationale: max VTM/TF label = 88 chars; >98% <= 44 chars; 95% <= 34 chars.)
- ADR-0034 (R, High): Level 1 in tabular format (columns, not sentences).
- ADR-0035 (R, Low): Level 2 in tabular format.
- ADR-0036 (M, High): Follow Medication Line guidance for medication names.
- ADR-0037 (M, High): Level 1: encoded medication names (causative agent) in bold, lowercase.
- ADR-0038 (R, Low): Unencoded (free-text) names in normal weight, lowercase. (Bold vs normal weight thereby signals coded vs uncoded.)
- ADR-0039 (R, High): Light shading on alternate rows (faint banding and lines).
- ADR-0040 (M, High): Highlight colour on hover over rows; selected row shown with a coloured highlight (Fig 27).
- ADR-0041 (M, High): Do NOT use black triangles as navigation controls (e.g. expand/reveal/drop-down arrows), because the inverted black triangle ▼ is the MHRA/CHM "black triangle" new-drug symbol. [suggested: use chevrons or +/- for disclosure in this component.]

3.3.5 Dates and times
- ADR-0042 (M, Medium): Every Level 2 event item has a date, including record-entry events "risk identified", "risk confirmed" (time where appropriate).
- ADR-0043 (M, Medium): NO dates in Level 1.
- ADR-0044 (R, Medium): Default date shown = date of entry, unless a different date (e.g. actual event date) was specified at entry.
- ADR-0045 (R, Medium): Allow partial dates in Level 2 (e.g. year only, month and year) as entered. Date format per CUI Date Display guidance (dd-Mmm-yyyy).
- Labels "Last Confirmed"/"Risk Identified" as Level 1 dates were confusing in research.

3.3.6 Source
- ADR-0046 (M, Medium): For each source description show who first articulated the information: e.g. "Patient", "Doctor", "Carer".
- ADR-0047 (R, Low): Show the encounter/situation: e.g. "Past Medical History", "Admissions Triage".

3.3.7 Authorship
- ADR-0048 (M, High): Each event phrase shows the name of the recording clinician.
- ADR-0049 (M, Medium): ...and their role, e.g. "Nurse", "F2", "Registrar".
- ADR-0050 (R, High): ...and the location recorded, e.g. "Hammersmith Hospital" (may be in "further details").

3.3.8 Absence of risk
- ADR-0051 (M, Medium): If a clinician has checked and found none: display exactly "No known adverse drug reaction risks".
- ADR-0052 (M, Medium): With it, display the date and time it was recorded.
- ADR-0053 (R, Medium): With it, provenance: author name, role, possibly location.
- ADR-0054 (M, Low): If no clinician has checked: display exactly "Risk status unknown".
- Do NOT display a blank box; do NOT display "None"; do NOT use "No recorded adverse drug reactions" (misread as positive absence by 6 of 12).

3.3.9 No decision support
- ADR-0055 (M, Medium): If the agent term will not trigger decision support (unencoded, or not in DSS subset), communicate this.
- ADR-0056 (R, Medium): Show it next to the medication label (in-row), not as a general message outside the list.
- ADR-0057 (R, Low): Use an icon with hover-over message and/or text, depending on space. Icon unspecified. [suggested text: "This entry will not trigger decision support alerts".]

3.3.10 Narrative text (letters, summaries)
- ADR-0058 (R, Medium): Keep a structured format in narrative.
- ADR-0059 (R, Medium): One risk phrase per line (successive lines, e.g. bullets), not a continuous paragraph.
- ADR-0060 (M, High): Include the causative agent.
- ADR-0061 (M, High): Include past reactions.
- ADR-0062 (M, High): Text must indicate it is a risk of adverse drug reaction (e.g. heading/lead-in "Adverse drug reaction risks:").

### Accessibility
- Tabular layout with labelled column headers ("Drug / substance", "Past reactions") and list caption ("Adverse drug reaction risks").
- Coded vs uncoded distinguished by font weight; [suggested] also expose via accessible text since weight alone is not perceivable by screen reader.
- No-decision-support icon must have a text alternative (hover message); [suggested] keyboard-focusable tooltip.
- Hover highlight plus selection highlight; [suggested] keyboard focus equivalent.

### Patient safety rationale (key)
- 6.5% of hospital admissions due to ADRs (NPSA).
- Risk vs event separation: avoids undue confidence (reader assumes a witnessed reaction).
- No categorisation/severity in Level 1: subjective, variable; missing severity misread as mild.
- No dates in Level 1: dates misread as date of last reaction.
- "Risk status unknown" vs "No known…" explicit: unknown mistaken for absence leads to not checking.
- No-DSS flag: clinicians expecting alerts assume no alert = safe.
- Black triangle reserved for new medicines reporting.

---

## Proposed controls

Conventions: React + TypeScript; all text props render exactly as supplied unless a formatting utility is specified. "MEDi" = Medication Line, "MEDv" = Medications List, "ADR" = ADR risks.

### 1. `MedicationLine`
Purpose: render one medication as text per Medication Line rules (single sentence or multi-line labelled). Implements MEDi-001..054.
Props:
```ts
type MedicationLineLayout = 'sentence' | 'multiline'; // sentence = single-text sentence, wraps softly; multiline = hard line breaks with labels
interface Ingredient { name: string; strength?: Quantity } // for multi-drug lines "paracetamol  500 mg + metoclopramide  5 mg"
interface Quantity { value: number | [number, number]; unit: string } // range -> "10 to 20 mL"
interface Strength {
  kind: 'simple' | 'inFluid' | 'perUnit' | 'combination' | 'percentage';
  values: number[];         // 1 value, or 2 for combination
  unit: string;             // mg, units, micrograms, %
  fluidQuantity?: number;   // for inFluid: "in 5 mL"
  fluidUnit?: string;       // mL, dose
}
interface MedicationLineProps {
  genericName?: string;            // bold, lowercase (MEDi-001/002); preserve internal capitals of acronyms e.g. "amphotericin B"
  brandName?: string;              // UPPERCASE, normal weight (MEDi-003); brandDescriptor e.g. "Vaccine", "blackcurrant"
  brandDescriptor?: string;
  ingredients?: Ingredient[];      // multi-drug medications; joined with " + " (MEDi-027), double space name-strength (MEDi-019)
  strength?: Strength;
  form?: string;                   // "modified-release tablet"
  dose?: Quantity;                 // label "DOSE", bold amount+unit (MEDi-007/038/041)
  doseEquivalent?: { label: string; quantity: Quantity }; // e.g. {label:'VOLUME'} or 'RATE' (MEDi-039/040)
  rate?: string;                   // "40 mL per hour"
  doseDuration?: string;           // "over 12 hours"
  route?: string;                  // "oral"
  frequency?: string;              // "three times a day"
  qualifiers?: string[];           // "as required", "after food", "maximum 6 doses in 24 hours" -> appended after frequency
  layout?: MedicationLineLayout;   // default 'sentence'
  lineBreaks?: Array<'strength'|'form'|'dose'|'route'|'frequency'>; // for 'multiline': attributes that start a new labelled line (MEDi-030/052/053)
  order?: AttributeKey[];          // default MEDi-051 order; reordering only allowed with layout 'multiline' (MEDi-052)
  icons?: React.ReactNode;         // appended after text (MEDv-023)
  className?: string;
}
```
Behaviour:
- Build attribute chunks in order (default): name group, brand, strength, form, dose|volume|equivalent, rate, dose duration, route, frequency, qualifiers (MEDi-051).
- Separator between chunks: " – " (space, dash, space) (MEDi-018). Exception: generic name and strength joined by double space (non-collapsing, e.g. `  ` or `white-space: pre`) when multi-ingredient or percentage strength (MEDi-019/020).
- Each chunk is an unbreakable unit unless it alone exceeds the line (render each chunk as inline-block or with internal ` ` where safe), with the trailing separator glued to the preceding chunk (`chunk + " –"` then a normal space) so lines end with "–" and never start with it (MEDi-010/011). Label + value always non-breaking ("DOSE ") (MEDi-008). Drug names break only at spaces, never hyphenate (`hyphens: none; overflow-wrap: normal; word-break: keep-all` [suggested]) (MEDi-021).
- Never truncate: no `text-overflow: ellipsis`, no `overflow: hidden`, no max-lines (MEDi-012/025).
- 'sentence' layout: only the DOSE (or VOLUME/RATE equivalent) label is shown (MEDi-029/034).
- 'multiline' layout: at each hard break, omit the trailing dash on the previous line (MEDi-035); every line after a hard break starts with an uppercase label: STRENGTH, FORM, DOSE, ROUTE, FREQUENCY (MEDi-030/053). Drug name always first line (MEDi-052).
- Labels: uppercase, different font and colour from values (MEDi-009/033), single space, no colon (MEDi-031/032). Expose as CSS tokens `--medline-label-font`, `--medline-label-color`.
- Dose amount AND unit bold (MEDi-038/039). Combination-strength "and" rendered in smaller font (e.g. `font-size: 0.8em`) (MEDi-047); no other smaller text in the line.
- Line height clamped 1.2-1.4 (default 1.3) (MEDi-036).
- Dev-mode validation warnings [suggested]: forbidden symbols in any value (MEDi-026/028), title-case generic, lowercase brand, unit with full stop, numbers failing number rules.
- Accessibility [suggested]: render as a single text node sequence so screen readers read it in order; `aria-label` not needed; avoid visual-only cues.
States/variants: sentence | multiline; with/without brand; multi-ingredient; percentage; combination strength; dose equivalent (VOLUME/RATE).

### 2. `MedicationsList` (Medications List View)
Purpose: tabular current/past medications list with toolbar, grouping, sorting, filtering, LASB, selection and context menu. Implements MEDv-020..203.
Props:
```ts
type MedicationStatus = 'Started' | 'Not Started' | 'Suspended' | 'Completed' | 'Discontinued';
interface MedicationRow {
  id: string;
  line: MedicationLineProps;           // Drug Details (MEDv-148)
  drugNameForLookAhead: string;        // e.g. "paracetamol + metoclopramide" (MEDv-050/051)
  status: MedicationStatus;            // never blank (MEDv-162)
  statusSupplement?: string;           // e.g. "Verified" / "Not Verified" (MEDv-164)
  suspendedOn?: Date;                  // renders "Suspended on dd-Mmm-yyyy"
  startDate?: Date;                    // initiation date (MEDv-149)
  endDate?: Date;                      // stop date (MEDv-150)
  completedOrDiscontinuedAt?: Date;    // for recent past notification
  hasDecisionSupportAlert?: boolean;   // LASB alert icon (MEDv-053/055)
  groupValues?: Record<string, string[]>; // for grouping; empty/undefined -> null group
  icons?: React.ReactNode;
  [extra: string]: unknown;
}
interface ColumnDef {
  id: string; heading: string;          // unique, unambiguous (MEDv-155/156)
  kind: 'drugDetails' | 'status' | 'startDate' | 'endDate' | 'composite' | 'other';
  fixedWidth?: boolean; minWidth: number; // dates fixed width (MEDv-153), all have minWidth (MEDv-161)
  sortKey?: (r: MedicationRow) => string | number | Date;
  render?: (r: MedicationRow) => React.ReactNode;
}
interface GroupingOption { id: string; label: string; nullLabel?: string; order?: (a: string, b: string) => number } // nullLabel e.g. "No Form Specified" -> "(No Form Specified)"
interface PastFilterOption { id: string; label: string; predicate?: (r: MedicationRow) => boolean } // must include {id:'all', label:'Show All Past'}
interface MedicationsListProps {
  medications: MedicationRow[];
  currentColumns: ColumnDef[];      // Drug Details first (MEDv-173)
  pastColumns: ColumnDef[];         // Status first, Drug Details second (MEDv-175)
  initialView?: 'current' | 'past'; // default 'current' (MEDv-062)
  pastFilters: PastFilterOption[];  // default [Show All Past, Past week, Past month, Past 3 months, Past 2 years]
  groupingOptions: GroupingOption[];// always includes None (MEDv-190)
  defaultGrouping?: string;         // default 'none' (MEDv-083)
  recentPastWindowHours?: number;   // default 48 (example value) (MEDv-074)
  lookAhead?: boolean;              // default true
  emptyMessage?: { current: string; past: string }; // default current "There are no current medications for this patient"
  contextMenuActions?: ContextAction[]; // static order, grouped (MEDv-129..133); "Details..." always present (MEDv-135/136)
  onAction?: (actionId: string, rows: MedicationRow[]) => void; // called only after summary confirmation when rows.length > 1 (MEDv-203)
  selectedIds?: string[]; onSelectionChange?: (ids: string[]) => void; // none selected initially (MEDv-202)
  levelOfDetail?: string; levelsOfDetail?: { id: string; label: string; columns: ColumnDef[] }[]; // MEDv-201
}
interface ContextAction { id: string; label: string; group: 'information' | 'direct' | 'addInformation'; icon?: React.ReactNode; isEnabled: (rows: MedicationRow[]) => boolean }
```
Behaviours:
- Toolbar on one line: `CurrentPastToggle`, Past filter drop-down attached to Past, `GroupByControl`.
- Current list = Started, Not Started, Suspended; Past = Completed, Discontinued (MEDv-172/173). Current list is never filtered.
- Default sort: current by startDate desc (MEDv-099); past by endDate desc (MEDv-100). Header click sorts; clicking active header reverses (MEDv-101/102); sort indicator symbol + heading formatting (MEDv-103/104); default sort retained as secondary key (MEDv-105). Sort retained within groups (MEDv-087). Separate sort/group/collapse state per Current and Past.
- Status cell bold (MEDv-042), supplement on next line; Suspended row/cell visually emphasised (MEDv-024) [suggested: tinted background + bold, not colour alone]; past list visually distinct (MEDv-025).
- Rows: no vertical gridlines; thin pale horizontal 1px lines; subtle alternate shading meeting contrast (MEDv-021/022/143/144/145); shading restarts per group (MEDv-192).
- Drug Details column widest (MEDv-159); no horizontal scroll (MEDv-160): hide lower-priority columns when narrow (via levelsOfDetail / responsive config) but never mandatory columns (MEDv-147..150).
- Empty list message row (MEDv-146).
- Bottom spacer exactly one line height when scrolled to end (MEDv-142).
- Recent past notification row at end of current list: "{n} past medication(s) were completed or discontinued in the last {interval}"; distinct formatting; hidden when n = 0 [suggested] (MEDv-074/075/077/174).
- Past filter notification row directly under headings: "The total list ({total}) is filtered to show: {filterLabel} ({shown})" + "Remove Filter" button (MEDv-068..072/176). Past button remains selected (MEDv-069).
- Grouping: headings prominent (MEDv-086); expand/collapse control at heading start (MEDv-092) [use chevron, not black triangle, per ADR-0041 — suggested]; collapsed heading shows "(n)" count, expanded shows none (MEDv-089); groups expanded by default, never collapsed by default (MEDv-191); empty groups hidden by default with option `showEmptyGroups` for task schemes (MEDv-090); null group label in brackets at top (MEDv-091/194/195); multi-value items placed in one combined group "A; B" with names in sort order (MEDv-197..200); after changing grouping scroll so at least one heading is visible (MEDv-193). Heading context menu: "Collapse All Groups", "Expand All Groups" (MEDv-196).
- Selection: none on open; click / Space select; Ctrl+click, Shift+click; Shift+Arrow extend; Ctrl+Space toggle (MEDv-122/126/127); clear highlight (MEDv-123); preserved and scrolled into view on sort/group change (MEDv-125); optional external selection sync between views (MEDv-124). Multi-select action -> confirmation summary dialog listing selected medication lines (MEDv-203).
- Context menu on right-click [suggested: also Shift+F10 / Menu key]; disabled (greyed) items when not valid for any selected row (MEDv-131); static order; "Details..." first in information group (MEDv-135/136).
- Accessibility [suggested]: `role="grid"` with `aria-multiselectable`, `aria-sort` on headers, `aria-expanded` on group headings, roving tabindex.
States: current | past | past-filtered | grouped | empty | loading [suggested].

### 3. `CurrentPastToggle`
Purpose: mutually exclusive "Current" / "Past" buttons with past-filter drop-down. Implements MEDv-062..067, 069, 174.
Props: `{ value: 'current'|'past'; onChange(v): void; pastFilters: PastFilterOption[]; pastFilterId?: string; onPastFilterChange(id): void }`. Labels exactly "Current", "Past". Exactly one always selected (no deselect). Past button has an attached drop-down (split button) including "Show All Past". Keyboard [suggested]: radio-group semantics (Arrow keys), drop-down via Alt+Down.

### 4. `GroupByControl`
Purpose: standard single-select drop-down labelled "Group by" (MEDv-084/085/190). Props: `{ options: GroupingOption[]; value: string; onChange(id) }`; first option "None"; default "None" (MEDv-083). Rendered as native `<select>` or accessible listbox; NOT buttons/segmented control.

### 5. `LookAheadScrollArea` (LASB)
Purpose: scroll container with reserved top/bottom notification strips listing out-of-view items. Generic (usable in any list). Implements MEDv-043..059, 177..189.
Props:
```ts
interface LookAheadItem { id: string; label: string; hasAlert?: boolean }
interface LookAheadScrollAreaProps {
  items: LookAheadItem[];                   // in list order (MEDv-049)
  mode: 'names' | 'countOnly';              // 'names' for current, 'countOnly' for past (MEDv-054/055)
  getItemNameElement: (id: string) => HTMLElement | null; // drug-name element used for obscured test (MEDv-183)
  alertIcon?: React.ReactNode;              // decision support alert icon (MEDv-053)
  children: React.ReactNode;                // the rows
  reservedSpaceColor?: string;              // pale solid (MEDv-180)
  notificationColor?: string;               // light solid, distinct from reserved space and text (MEDv-188)
}
```
Behaviour:
- Reserved strips always present (fixed height = one line) at top and bottom, inside the list below headings, abutting the scroll bar arrows; nothing placed between strip and rows (MEDv-179/043/045).
- Recompute on scroll/resize (MEDv-058). An item is out of view if its drug-name text box (excluding ascenders/descenders: use the text's x-height band [suggested approximation: name element rect inset by 20% of line height top/bottom]) is not fully inside the viewport (MEDv-183).
- Top strip: out-of-view items above, in list order left→right, so nearest item is rightmost. Bottom strip: out-of-view items below, in reverse list order left→right, so nearest is rightmost (MEDv-048, QIG "16 · 15 · 14 · 13 · 12").
- Fit: add names starting from the nearest until the next would not fit (measure); remaining count rendered leftmost as "{n} more"; if a single name is too long it goes into the count (MEDv-050/052). Never truncate/abbreviate names (MEDv-051). If any counted item hasAlert, alert icon next to count (MEDv-053); per-name alert icon next to names (MEDv-055).
- Delimiter " ● " (U+25CF or middle-dot rendering) with spaces, between all tokens including count; no leading/trailing delimiter (MEDv-056/184). No group text (MEDv-185). Names bold black; count and "more" normal weight (MEDv-186/187). Notification width shrink-to-fit, single line, right-aligned to scroll bar (MEDv-044/059); light solid background, border none or <= 1px subtle (MEDv-188/189).
- Not interactive: no click handlers, not focusable (MEDv-182). [suggested: `aria-live="polite"` region off by default; provide `aria-describedby` summary "N medications above, M below".]
- countOnly mode: "{n} more" only.
- Empty strip when nothing out of view (no "start/end of list" message).

### 6. `MedicationStatusCell`
Purpose: bold status with optional supplement and date (MEDv-042/162..171/024). Props `{ status: MedicationStatus; supplement?: string; date?: Date; listKind: 'current'|'past' }`. "Suspended" renders "Suspended on {dd-Mmm-yyyy}" with emphasis styling; past statuses use a distinct style.

### 7. `ListNotificationRow`
Purpose: in-list notification rows: recent past (MEDv-074..077/174) and filter (MEDv-068..072/176). Props `{ variant: 'recentPast' | 'filter'; text: string; action?: { label: 'Remove Filter'; onClick(): void } }`. Distinct formatting from medication rows; spans all columns.

### 8. `GroupHeadingRow`
Props `{ label: string; isNull?: boolean; count: number; collapsed: boolean; onToggle(): void; onContextMenu?(): void }`. Renders `(label)` when isNull; shows "(count)" only when collapsed; toggle control at the start; keyboard: Enter/Space toggles, Left collapses, Right expands [suggested].

### 9. `SelectionSummaryDialog`
Purpose: confirm a multi-medication action (MEDv-203). Props `{ actionLabel: string; rows: MedicationRow[]; onConfirm(); onCancel() }`; lists each selected item as a full `MedicationLine` (no truncation).

### 10. `AdrRiskList`
Purpose: Level 1 table of ADR risks with drill-down to Level 2 events and details; absence states; no-DSS flag. Implements ADR-0001..0057.
Props:
```ts
type ReactionGroup = string[];               // reactions in one event (simultaneous)
interface AdrRisk {
  id: string;
  agent: { text: string; encoded: boolean; triggersDecisionSupport: boolean }; // ADR-0012/14/37/38/55
  pastReactions?: ReactionGroup[] | null;    // null/undefined -> "not known" (ADR-0019)
  events: AdrEvent[];
}
interface AdrEvent {
  id: string;
  description: string;                       // e.g. "Risk identified", "Risk confirmed", reaction diagnosis; encoded preferred
  encoded?: boolean;
  date: PartialDate;                         // ADR-0042/44/45
  time?: string;                             // "HH:mm" when appropriate
  source?: { who: string; encounter?: string }; // "Patient" / "Doctor" / "Carer"; "Admissions Triage" (ADR-0046/47)
  author: { name: string; role: string; location?: string }; // ADR-0048/49/50
  details?: React.ReactNode;                 // Level 2 details: severity, certainty, brand, dose, route, free text (ADR-0007)
}
type PartialDate = { year: number; month?: number; day?: number };
type AdrStatus =
  | { kind: 'risks'; risks: AdrRisk[] }
  | { kind: 'noKnownRisks'; recordedAt: Date; author: { name: string; role: string; location?: string } } // ADR-0051..53
  | { kind: 'unknown' };                                          // ADR-0054
interface AdrRiskListProps {
  status: AdrStatus;
  title?: string;               // default "Adverse drug reaction risks" (ADR-0028/29)
  agentHeading?: string;        // default "Drug / substance" (ADR-0024/25)
  reactionsHeading?: string;    // default "Past reactions" (ADR-0026/27)
  simultaneousJoiner?: ' + ' | ' AND '; // default ' + ' (ADR-0022)
  noDecisionSupportText?: string; // tooltip/text (ADR-0057) [suggested default "Will not trigger decision support alerts"]
  onOpenEvent?: (risk: AdrRisk, ev: AdrEvent) => void;
}
```
Behaviour:
- Level 1 table: columns Agent (far left), Past reactions (right of agent) only; no dates, form, route, dose, category, severity, certainty (ADR-0005/06/16/43).
- Sort: alphabetical by agent text, case-insensitive (ADR-0008/09); dedupe by agent (dev warning if duplicates) (ADR-0013).
- Agent: encoded -> bold lowercase; free text -> normal weight lowercase (ADR-0037/38); column min width 44ch, max two lines, wrap at spaces only (ADR-0033). [Note: lowercase applies to generic/VTM; TF brand names under Medication Line would be uppercase; doc says lowercase for causative agent; follow ADR-0037/38 for this control but preserve recorded text (ADR-0012) — flag: render text as recorded and apply lowercase only to encoded VTM/class names [suggested resolution].]
- No-DSS indicator (icon with tooltip and/or text) inline next to agent when `triggersDecisionSupport === false` (ADR-0055..57). Never a general banner outside the list.
- Past reactions string via `formatPastReactions` (below).
- Row hover highlight and selected-row highlight (ADR-0040); alternate light shading (ADR-0039).
- Activating a row (click/Enter) reveals Level 2 events table for that risk (inline expansion or panel) with a clear "Back to list"-type control (ADR-0002/03/04). Disclosure icon must not be a black triangle (ADR-0041).
- Level 2 table columns [suggested order]: Date | Event | Source | Recorded by (name, role) | (location in details). Each row may open further details (ADR-0007).
- Absence states: "No known adverse drug reaction risks" + date/time + author name/role(/location); "Risk status unknown". Never blank, never "None" (ADR-0051..54).
- Accessibility: `<table>` with `<caption>` = title, `<th scope="col">`; row expansion with `aria-expanded`; no-DSS icon has `aria-label`/tooltip accessible by keyboard focus [suggested].

### 11. `AdrRiskNarrative`
Purpose: risks inside letters/summaries (ADR-0058..62). Props `{ status: AdrStatus; heading?: string /* default "Adverse drug reaction risks" */ }`. Renders heading then one line per risk (`<ul>`): "{agent} – past reactions: {reactions}" [suggested wording]; must include agent, reactions, and the ADR-risk context; never a running paragraph.

### Utility functions

```ts
// MEDi-015/016/017/042-044/048-050
formatClinicalNumber(n: number, opts?: { maxFractionDigits?: number }): string
```
Algorithm: if n is not finite -> throw. Split abs value into integer and fraction using the source's decimal string (prefer string/decimal input to avoid FP artefacts; accept `number | string`). Strip trailing zeros from fraction; drop the decimal point if fraction empty (no "0.50", no "1.0"). Integer part: if < 1 output "0" (leading zero, never ".5"). Insert "," every 3 digits from the right when integer part >= 1000 ("1,000", "5,000", "10,000"). Never use other separators.

```ts
// MEDi-014 (recommended): choose unit to avoid decimals
preferWholeUnit(value: number, unit: 'g'|'mg'|'micrograms'|'nanograms'): { value: number; unit: string }
```
If value < 1 and a smaller conventional unit exists, convert down (g->mg x1000, mg->micrograms x1000) while result is integral; e.g. 0.1 mg -> 100 micrograms, 0.5 g -> 500 mg. Do not convert up merely to shorten unless convention (e.g. 1,000 mg -> keep unless configured) [suggested: leave caller in control]. Never abbreviate "micrograms".

```ts
formatQuantity(q: Quantity): string  // "120 mg", "10 to 20 mL"; space between amount and unit (MEDi-041); no full stop after unit (MEDi-024); range joiner " to "
formatStrength(s: Strength): Array<string | { small: string }>
```
Rules: simple "500 mg"; inFluid "{v} {unit} in {fluidQty} {fluidUnit}" ("120 mg in 5 mL") (MEDi-045); perUnit "{v} {unit} per {fluidUnit}" ("100 units per mL", "100 micrograms per dose") when fluidQuantity is 1 or absent (MEDi-046); combination same-unit "{v1} " + {small:"and"} + " {v2} {unit}" [+ " in {qty} {fluidUnit}"] ("400 and 57 mg in 5 mL") (MEDi-047); percentage "{v}%" with no space (as in "0.9%") and joined to the name by a double space (MEDi-020). Never "/", "+", "&" or brackets in strength.

```ts
validateMedicationText(text: string): Violation[]
```
Flags: any of `@ | < > / \ & °` (MEDi-026); any of `( ) [ ] { }` (MEDi-028); "+" not surrounded by spaces or used outside ingredient joining (MEDi-027); "+" adjacent to "4" without double space; unit followed by "." e.g. /\b(mg|mL|g|micrograms|units)\./ (MEDi-024); /\.\d*0\b/ trailing zeros, /(^|\s)\.\d/ missing leading zero, /\b\d{4,}\b/ without commas (MEDi-015-017); "–" without surrounding spaces (MEDi-018); colon after label /\b(DOSE|ROUTE|STRENGTH|FORM|FREQUENCY|VOLUME|RATE):/ (MEDi-032); ellipsis "..." / "…" (MEDi-012).

```ts
formatGenericName(name: string): string // lowercase except tokens that are acronyms/abbreviations (all-caps tokens, single capital letters, roman numerals, alphanumeric codes like "974P") preserved (MEDi-002). Rendered bold by component.
formatBrandName(name: string): string    // toUpperCase() of brand token(s) only (MEDi-003); descriptor text unchanged.
buildMedicationLineChunks(props: MedicationLineProps): Chunk[] // ordering per MEDi-051 and joiners per MEDi-018/019/020/027
```
Joining: `chunks.join(" – ")`; multi-ingredient: `ingredients.map(i => i.name + "  " + formatStrength(i.strength)).join(" + ")` (double space between name and strength; when the text after "+" begins with "4", use double space after "+"; when text before "+" ends with "4", double space before) (MEDi-019/027).

```ts
// Dates, used in list and ADR Level 2 (CUI Date Display): "26-May-2010"
formatDate(d: Date): string  // dd-Mmm-yyyy, two-digit day with leading zero, English 3-letter month with initial capital, 4-digit year
formatPartialDate(p: PartialDate): string // year only "2008"; month+year "May-2008"; full "26-May-2008" [suggested formats; doc only requires support]
formatDateTime(d: Date): string // "26-May-2010 14:30" [suggested; per Date Display guidance]
```

```ts
// MEDv-166..173
deriveMedicationStatus(m: { scheduledAdministrations: Date[]; recordedAdministrations: { at: Date; given: boolean }[]; suspended: boolean; stoppedAt?: Date; endDate?: Date; now: Date }): MedicationStatus
```
Algorithm: if suspended -> "Suspended". Else if stoppedAt and any scheduled administration > stoppedAt -> "Discontinued". Else if endDate < now and at least one administration recorded as given -> "Completed" (rationale requires >= 1 successful administration). Else if no administration recorded and first scheduled > now (start in future) -> "Not Started". Else if at least one administration recorded and further scheduled administrations exist -> "Started". (Edge cases not specified by doc, e.g. all doses not given and end date passed, [suggested] keep current "Started"/"Not Started" with supplement rather than "Completed".)
`isCurrent(status) = status in {Started, Not Started, Suspended}`; `isPast(status) = status in {Completed, Discontinued}`.

```ts
sortMedications(rows, primary: { key; dir }, defaultSort: { key; dir }): rows // stable; ties broken by default sort (MEDv-105). Current default: startDate desc (MEDv-099); past default: endDate desc (MEDv-100).
groupMedications(rows, option: GroupingOption): Group[]
```
Algorithm (MEDv-091/195/197-200): for each row get values (dedupe); if none -> null group "(<nullLabel>)"; if one -> that group; if several -> sort values by option.order (default alphabetical, case-insensitive) and join with "; " to form combined group key. Each row in exactly one group. Groups ordered: null group first (configurable), then by attribute sort order; combined groups placed in sort position by their joined label (QIG: "Analgesic", "Analgesic; Non-steroidal Anti-inflammatory", "Non-steroidal Anti-inflammatory"). Within each group retain current sort. Omit empty groups unless `showEmptyGroups`.

```ts
recentPastNotification(rows, now, windowHours): string | null
```
n = rows with status Completed/Discontinued and completedOrDiscontinuedAt within [now - window, now]; if n = 0 null [suggested]; else `${n} past medication${n===1?'':'s'} ${n===1?'was':'were'} completed or discontinued in the last ${formatInterval(windowHours)}` (example "in the last 48 hours").

```ts
filterNotification(total: number, shown: number, filterLabel: string): string
// "The total list (54) is filtered to show: Past 2 months (3)"  — counts each attached to its label (MEDv-072/176); never "x of y".
```

```ts
computeLookAhead(itemsInOrder: LookAheadItem[], isAbove: (id) => boolean, isBelow: (id) => boolean, availableWidthPx: number, measure: (text: string, bold: boolean) => number, mode): { top: Token[]; bottom: Token[] }
```
Algorithm (MEDv-048/049/050/052/054/056/184): above = items with isAbove in list order; candidates = reverse(above) (nearest first). below = items with isBelow in list order (nearest first). For each side: if mode countOnly -> tokens = [`${n} more`] if n>0. Else: place names nearest-first while total width (names + " ● " delimiters + reserve for "{remaining} more" + alert icon) <= available; a name that does not fit is not truncated: it and all further ones go to the count (MEDv-050). Display order left→right: [count?] then placed names from farthest to nearest (so nearest is rightmost, adjacent to scroll bar). Join with " ● "; no leading/trailing delimiter. Count token gets alert icon if any counted item hasAlert.
`isObscured(nameRect, viewportRect)`: true if nameRect's core text band (excluding ascender/descender) is not fully within the viewport (MEDv-183).

```ts
formatPastReactions(groups: ReactionGroup[] | null | undefined, joiner = ' + '): string
```
(ADR-0017..0023) null/empty -> not-known text [suggested "Not known"]; else `groups.map(g => g.join(joiner)).join(', ')` e.g. [["rash","nausea"],["anaphylaxis"]] -> "rash + nausea, anaphylaxis" (or "rash AND nausea, anaphylaxis").

```ts
sortAdrRisks(risks): AdrRisk[]  // alphabetical by agent.text, locale 'en-GB', case-insensitive (ADR-0009)
assertUniqueAgents(risks): void // dev warning on duplicate agent text/code (ADR-0013)
adrAbsenceText(status): "No known adverse drug reaction risks" | "Risk status unknown" (ADR-0051/0054)
```

### Cross-document conflicts / notes for implementers
- Separator glyph: MEDi-018 text says "long dash (em dash)" but all rendered examples use "–" (en dash, U+2013) with spaces. Choose one constant `MED_SEPARATOR` (default U+2013 " – " to match examples) [decision needed].
- "+" usage differs: Medication Line restricts "+" to multi-drug names (MEDi-027); ADR guidance uses "+" (or "AND") to join simultaneous reactions (ADR-0022). Both are context-specific; keep separate utilities.
- Brackets: MEDi-028 bans brackets in medication lines, but MEDv-194 requires null group labels in brackets and MEDv-089 uses "(2)" counts in group headings; these are list chrome, not medication lines.
- Black triangle: ADR-0041 bans black triangles as navigation controls; Medications List uses "▼/▲" as sort indicators (not navigation) and leaves expand/collapse glyph unspecified. Recommend chevrons for disclosure throughout.
- Sort glyph direction is inconsistent in QIG examples (▲ shown on a reverse-chronological past list; ▼ on an A→Z sort). Library should define: ▼ = descending, ▲ = ascending, and expose `aria-sort`.
- Duplicate guideline IDs in medlist (MEDv-173/174/175/176, 069/073) – cite with section numbers.
- ADR figures (Figs 3-42) are images not present in the text extract; any visual specifics (exact layout of Level 2 tables, icon, colours) are unavailable.
