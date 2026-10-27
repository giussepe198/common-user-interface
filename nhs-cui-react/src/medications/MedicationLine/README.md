# MedicationLine

Displays one medication as a single line of text (or a labelled multi-line block) following the CUI Medication Line guidance, for any view that shows a prescribed medication.

## When to use

- Drug Details cells in medication lists, previews, summaries and anywhere a medication is named with its attributes.
- Use `layout="multiline"` only where a view needs hard line breaks (for example a narrow detail panel).
- Do not use it for search results (use DrugSearch) or for ADR causative agents (use AdrRiskList).

## What you provide

Structured data, not a preformatted string. The component and `buildMedicationLineChunks` do all formatting.

```tsx
<MedicationLine
  genericName="diltiazem"
  brandName="Calcicard CR"
  form="modified-release tablet"
  dose={{ value: 120, unit: 'mg' }}
  route="oral"
  frequency="three times a day"
/>

<MedicationLine
  layout="multiline"
  genericName="salbutamol"
  form="metered dose inhaler"
  strength={{ kind: 'perUnit', values: [100], unit: 'micrograms', fluidUnit: 'dose' }}
  dose={{ value: 2, unit: 'puffs' }}
  route="inhaled"
  frequency="every 4 hours as required"
  order={['form', 'strength', 'dose', 'route', 'frequency']}
  lineBreaks={['strength', 'dose', 'route', 'frequency']}
/>
```

Other props: `ingredients` (multi-drug), `doseEquivalent` (`VOLUME`, `RATE`), `rate`, `doseDuration`, `qualifiers`, `scheduleText`, `icons`, `status`, `suspendedOn`, `block`.

## Guidance implemented

- MEDi-001, MEDi-002 [M]: generic name bold and lower case; acronyms, single letters, roman numerals and codes keep their capitals ("amphotericin B", "factor VIII").
- MEDi-003 [M]: brand name in capitals, not bold; brand-only products keep their descriptor as given.
- MEDi-013 [M], MEDi-051 [R]: generic first; order is name, brand, strength, form, dose, rate, dose duration, route, frequency, then qualifiers.
- MEDi-014 to MEDi-017, MEDi-042 to MEDi-044, MEDi-048 to MEDi-050 [M/R]: numbers via `formatClinicalNumber` (no trailing zero, leading zero, comma thousands). Choosing a unit that avoids decimals (MEDi-014) stays with the caller.
- MEDi-018 [M]: attributes separated by a dash with a single space either side. The separator glyph is U+2013, matching every rendered example in the guidance (the text says "em dash"; see the cross-document decisions under Do and don't).
- MEDi-019, MEDi-020 [R]: double space between drug name and strength for multi-drug lines and percentage strengths.
- MEDi-027 [M]: "+" only joins drug names, with spaces, and a double space when next to a "4".
- MEDi-007, MEDi-038, MEDi-039, MEDi-040, MEDi-041 [M]: dose labelled "DOSE"; amount and unit bold; "VOLUME" or other dose-equivalent label when there is no dose; space between amount and unit.
- MEDi-045 to MEDi-047 [M]: strength uses "in" and "per"; combination strengths share one unit with a smaller "and".
- MEDi-008, MEDi-010, MEDi-011, MEDi-021 [M]: each attribute wraps as a unit, label and value never separate, the dash stays at the end of the line, no hyphenation.
- MEDi-012, MEDi-025, MEDi-054 [M]: never truncated (no ellipsis, no overflow clipping).
- MEDi-009, MEDi-031 to MEDi-033 [M/R]: labels upper case, smaller, letter-spaced and in a muted colour; single space, no colon.
- MEDi-029, MEDi-034 [M/R]: in a sentence only the dose is labelled.
- MEDi-030, MEDi-035, MEDi-052, MEDi-053 [M/R]: multi-line layout starts each broken line with a label (STRENGTH, FORM, DOSE, ROUTE, FREQUENCY), no dash at a hard break, drug name always first.
- MEDi-036 [R]: line height 130%.
- MEDv-023 [M]: `icons` appended after the text in the same cell.
- MEDi-022, MEDi-026, MEDi-028 [M]: not enforced at render time; check your data with `validateMedicationText`.

## Do and don't

- Do pass numbers as numbers or decimal strings; the component formats them.
- Do pass full drug names; never abbreviate (MEDi-022).
- Don't pass preformatted strings with "/", "@", "&" or brackets; use words ("per", "at", "in", "and").
- Don't clip the cell that contains the line; let it wrap.
- `status` (shown in bold after the line) is [suggested] for places without a Status column.

Cross-document decisions for the medications area (G5 conflicts, safer option chosen):

- Separator: one constant, `MEDICATION_SEPARATOR` = space, U+2013, space, matching every rendered example in Medication Line and Search and Prescribe.
- "+": joins drug names only in medication text (MEDi-027); AdrRiskList uses " + " only between simultaneous reactions (ADR-0022), through a separate utility.
- Brackets: never in medication text (MEDi-028); allowed in list chrome only (null group "(No Route Specified)", collapsed count "Oral (2)"), as MEDv-194 and MEDv-089 require.
- Black triangles: not used anywhere in this area (ADR-0041). Disclosure uses chevrons; sort direction uses arrow icons, down for descending and up for ascending, with `aria-sort`.
- Duplicate MEDv IDs are cited with their section number, e.g. "MEDv-174 (3.3.17)".

## Accessibility

- Rendered as ordinary inline text in reading order, so screen readers read the full line; separators are characters, not images.
- Labels differ by size, case, weight and colour, not colour alone.
- Line wraps at any width; nothing is hidden.

## Regional behaviour

Region comes from the `region` prop or `ClinicalLocaleProvider` (default GB). GB output is unchanged.

| | GB (NHS CUI Medication Line) | AU (ACSQHC on-screen guideline 2016, terminology recommendations 2024) | NZ (HQSC NMC user guide 2021) |
|---|---|---|---|
| Generic / active ingredient | bold, lower case | bold, lower case (6.1.3) | bold, lower case |
| Brand | CAPITALS after " – " | Title Case, italic, after an en dash (6.1.3); registered mixed case kept ("NovoRapid") | Title Case [suggested]: capitals would defeat Tall Man (G11 8.1) |
| Order | MEDi-051 | 16 elements (6.3.1): ingredient strength, brand, form, route, site, DOSE, duration, frequency, qualifier, indication, instructions, course, SUPPLY | as GB |
| Ingredient to strength | double space (MEDi-019/020) | single space, no separator | double space |
| Strength | "in", "per", small "and" | AMT style "100 units/mL", "250 mg/5 mL"; combination "400 mg/5 mL + 57 mg/5 mL" [suggested] | as GB |
| Mixed-case lettering | off | on: National Mixed-Case Lettering List, April 2024 (6.1.4) | on: HQSC Tall Man list, October 2023 |
| Abbreviations | shown as given (check with `validateMedicationText`) | route, frequency, form, units and qualifiers written in full (2024 Digital systems; 6.2.1) | DO NOT USE list and permitted NMC abbreviations written in full; `permittedAbbreviations` adds "oral (po)" [suggested] |
| Units | as given | "microgram" (never "mcg"), "units", "mL"; whole numbers by smaller mass unit (6.3.6); "half a tablet" in words | "microgram", "unit(s)", "international unit(s)"; whole numbers (NMC section 3) |

- Mixed-case names are drawn `aria-hidden` with the plain name in visually hidden text, so screen readers never spell them out (AU-MD-03). Turn off with `tallManLettering={false}`; add local pairs with `tallManForms` (AU-MD-04).
- AU, 4 or more active ingredients with a brand: brand only, ingredients in the tooltip one per line and in the accessible text (6.1.3).
- AU 6.4.1 non-breaking spaces between label, number and unit are achieved by keeping each labelled value on one line.
- Which medicines show both ingredient and brand in AU (bioavailability issues, high-risk medicines, 2 or 3 ingredient combinations) is a data decision: pass `brandName` only for those.
- New optional fields for all regions: `site`, `indication`, `instructions`, `courseDuration`, `supply` (labelled "SUPPLY"; [suggested] in GB).
- [UNCERTAIN] Casing of list entries was transcribed from the source PDF/XLSX (G10 15.1; the XLSX is authoritative for NZ). The AU list has "Sirolimus" where NZ has "SIrolimus"; kept as transcribed.
- G10 9.2 shows the insulin example with the brand before the strength, while the 16-element table puts strength first; the table was followed.
