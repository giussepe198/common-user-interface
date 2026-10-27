Clinical CUI is a React 18 + TypeScript control library for clinical applications in the UK, Australia and New Zealand. Every control is built from the NHS Common User Interface (CUI) design guidance, with Australian and New Zealand national standards layered on top. It covers patient identification, dates and times, medications, drug administration, decision support, clinical noting, SNOMED CT terminology, lists, timelines and graphs. Guideline IDs (for example PAB-0090, D+Ta-0021, MEDi-051, CNA-0300) are cited in each component's guidelines so a reviewer can trace any behaviour back to its source.

The guidance exists for patient safety. When convenience and the guidance disagree, the guidance wins.

## Content fundamentals

- **Voice.** Plain, neutral, clinical. Say what the data is and what the user can do. No marketing tone, no exclamation marks, no emoji.
- **Case.** Sentence case for labels, buttons, headings and messages ("Add medication", "Previous values"). Exceptions set by the guidance: the patient's family name in upper case (`SMITH, Joan (Mrs)`), brand drug names in capitals (`GLUCOMET SR`), generic drug names in lower case (`amoxicillin`), and fixed labels such as "NHS No.".
- **Unknown, never blank.** A missing value reads "Not Known" in banners and "Unknown" for dates and times. Never show an empty cell, "?", "-" or "N/A".
- **Dates** are `dd-Mmm-yyyy` (`05-Apr-2008`), never numeric months and never locale formats. Long form `05 April 2008` or `5th April 2008` with a lower-case superscript suffix. Partial dates `Aug-2005`, `2005`.
- **Times** are 24-hour `HH:mm` in every region (`09:05`), never am/pm, never `24:00`. A date and a time are separated by one space: `05-Apr-2008 14:30`.
- **Durations** use `y m w d hr min sec` with no space between number and unit and one space between pairs: `2hr 40min`. Ages use only two units: `81y`, `4y 1m`, `13m 8d`.
- **Identifiers.** NHS numbers are grouped 3-3-4 with spaces (`999 000 0018`); NHIs are seven upper-case characters with no spaces (`ZZZ0016`); IHIs are 16 digits grouped 4-4-4-4.
- **Medication text** follows the medication line order: drug name, strength, form, `DOSE` amount, route, frequency, separated by ` – `. Whole numbers have no trailing zero (`1 mg`, not `1.0 mg`); fractions have a leading zero (`0.5 mg`); `micrograms` and `units` are spelt out.
- **Abbreviations.** Never use an abbreviation on the dangerous list (`U`, `IU`, `qd`, `cc`, `µg`, `>`, `<` and the rest in `DANGEROUS_ABBREVIATIONS`). Any other abbreviation is rendered with `Abbreviation` so its meaning is discoverable.
- **Truncation.** Truncate only at word boundaries, never inside a number or between a number and its unit, and always reveal the full text on hover or focus with `TruncatedText`. Patient names and medication lines are never truncated; they wrap.

## Visual foundations

The CUI guidance deliberately does not prescribe colours or fonts ("stylistic choices, such as colours, fonts or icons are not part of the guidance"). The palette here is this system's own, built on the colour meanings the guidance does fix.

- **Colour meanings.** Red (`danger`) means no-go, error, alarm. Yellow (`warning`, `warning-fill`) means caution. Green (`success`) means acceptable or completed. Blue (`info`, `accent`) is advisory only and is never used for high-importance items. Colour is always a secondary cue: every status also carries a word, a shape or an icon.
- **Surfaces.** `surface` for panes and forms, `surface-sunken` for the application background and banding, `surface-muted` for headers and toolbars, `surface-reveal` for the shading shared by a reveal control and its fields.
- **Text.** `ink` for data on any surface, `ink-muted` for labels, `ink-subtle` for prompts and help text (italic, on `surface` and `surface-sunken` only). Data is always more prominent than its label.
- **Patient banner.** `banner` ground with `on-banner` values and `on-banner-muted` labels, so the banner is always set apart from application content. Inside the banner, alert badges use `banner-alert` with `banner` text.
- **Interaction.** `hover` (pale yellow) on clickable rows and editable entries. `accent-surface` for selected rows. Focus is a solid 2px `focus` ring with 2px offset on every focusable element, at least 3:1 on every surface.
- **Terminology.** `encodable` (pale blue) marks text that can be coded in SNOMED CT; `confirmed` (grey) marks a confirmed coded term. Never highlight with green or red.
- **Graphs.** Series take `series-1` (blue), `series-2` (red), `series-3` (amber), `series-4` (green) in that order, each with its own marker shape; the normal range is a `normal-range` band labelled with its population.
- **Type.** One sans family (`--font-sans`: Segoe UI, then Helvetica Neue and Arial). Body 14/20; labels and prompts 12/16; headings 18/24 and 15/20 at 600; patient name 20/26 at 600. Numbers in columns use tabular figures (`numeric`) so decimal points align.
- **Space and shape.** A 4px base: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-6` 24, `space-8` 32. Corners are nearly square: `radius-sm` 2px on inputs and cells, `radius-md` 4px on buttons and popovers, `radius-lg` 8px on dialogs. Shadows only on floating layers (`shadow-popover`, `shadow-dialog`).
- **Density.** Clinical screens are dense by necessity. Keep rows compact, align data in columns, and use borders (`border`, `border-strong`) rather than shadows to separate content.
- **Motion.** None beyond instant state changes. Nothing flashes between 2 and 59 Hz.
- **Themes.** Light and dark. Every text pair meets 4.5:1 and every control border and focus ring meets 3:1 in both themes.

## Iconography

- `Icon` draws line icons in the current text colour on a 24px grid (stroke 1.75, round caps). Sizes: 16 in lists and rows, 24 in menus and toolbars, 32 and 48 on larger surfaces.
- Every icon has a text equivalent: a visible label, or an accessible name that describes the function ("Search", not "Magnifier"). An icon is never the only way to reach a function.
- Alert symbols (`AlertSymbol`) follow the alert symbol guidance: prohibition is a white circle with a red border and a top-left to bottom-right bar; mandatory action is a solid blue circle (`mandatory-symbol`) with a white pictogram; warning is a yellow (`warning-fill`) triangle with a black border; information is a speech bubble. They differ by shape and tone, so they read in greyscale.
- Clinical state icons (administration events, allergy status, handover tasks) differ by shape and fill, always with a text label beside them.
- No emoji. No hands, eyes or faces in pictograms.

## Regions

- Set the jurisdiction once with `ClinicalLocaleProvider` (`region="GB" | "AU" | "NZ"`, optional `timeZone`, and `teReoLabels` for NZ). Any region-aware control also accepts a `region` prop. GB is the default and follows the NHS CUI guidance exactly.
- **Australia** follows ACSQHC (on-screen display of medicines, safe medicines terminology, National Mixed-Case Lettering List, NIMC, patient identification), ADHA identifiers (IHI, HPI-I, HPI-O), Services Australia (Medicare, DVA), ABS 2020 sex and gender, METeOR Indigenous status, Australia Post addresses and ACMA telephone numbering.
- **New Zealand** follows HISO 10046 (NHI, names, gender), HISO 10001 ethnicity, HISO 10094 Māori descent and iwi, HQSC (National Medication Chart, Tall Man lettering, NZEWS), NZ Post addresses and NZ numbering.
- Identifiers are always shown by the region's own control: `NhsNumberDisplay` (999 000 0018), `IhiDisplay` (8003 6012 3456 7894), `NhiDisplay` (ZZZ0016, seven characters, no spaces). Never show one region's identifier with another's format.
- Family names are upper case in GB and AU banners and kept as recorded in NZ. Macrons are always displayed and never stripped (Kāhu and Kahu are different names); search may ignore them.
- An empty allergy list is never shown as "no known" in any region. AU wording is "Nil known" and "Unknown"; NZ records "No", "Unknown" or the list explicitly.
- AU medication lines follow the ACSQHC 16-element order with the active ingredient bold lower case and the brand in Title Case italics after an en dash. AU and NZ apply mixed-case (Tall Man) lettering by default.
- Each region has its own dangerous abbreviation list and drug chart administration codes (AU NIMC A, F, R, V, L, N, W, S; NZ HQSC CP, D, N, R, RV, SM, U, W).
- Observation charts take an early warning preset: NEWS2 (GB), ADDS (AU, scores are placeholders until set locally), NZEWS (NZ, with the mandatory "escalate if worried" text). Bands and responses are data and must be signed off locally.

## Mobile

- Use the mobile controls (`src/touch`, `src/mobile`, `src/voice`) on phones; the desktop controls stay for 4:3 and 16:9 screens. Both share the tokens, formats and safety rules above.
- Touch targets are at least 48px; commit actions are at least 56px high and sit at the bottom of the screen inside `ActionBar`. Body text is 16px.
- `MobilePatientHeader` stays visible on every patient screen and wraps rather than truncating. `PatientSwitchGuard` makes every patient change obvious.
- Nothing depends on hover; long-press is never the only way to reach something; swipe never commits or deletes clinical data.
- High-risk medicines use `SecondCheckField`, `TypedReadBackConfirm` and `HoldToConfirmButton` together.
- Dictation never saves directly: every value is read back, and missing, ambiguous or implausible values must be answered first (`DictationReview`, `DictatedNoteReview`).

## Using the controls

- Start with the Examples group: ten worked screens (patient record, drug round, prescribing, observations, ward list and handover, clinical note, registration, and three phone flows) built only from these components. Their TSX source is in the package's `examples/` folder and is the reference for composing the controls.

- Wrap your application (or each region) in an element with `class="cui-root"` and set `data-theme="light"` or `data-theme="dark"` on `html`.
- Show every date and time through `DateDisplay`, `TimeDisplay`, `DateTimeDisplay` or the `formatShortDate` / `formatTime` / `formatDateTime` utilities. Never call `toLocaleDateString` for clinical data.
- Show the patient through `PatientBanner` on every screen that shows or changes patient data; use `MicroPatientBanner` only where space forbids the full banner and no clinical data is shown.
- Collect dates with `DateInput`, times with `TimeInput`, durations with `DurationInput`, NHS numbers with `NhsNumberInput`. These parse shortcuts, refuse unsafe input and ask when an entry is ambiguous.
- Show medications with `MedicationLine` everywhere they appear (lists, charts, previews, alerts) so they read the same way in every context.
- The controls never fetch data. Search, postcode lookup and terminology services are functions you pass in.
- Controls marked experimental in their guidelines (`ClinicalStatement`, `StatementList`) come from consultation documents rather than baselined guidance.
