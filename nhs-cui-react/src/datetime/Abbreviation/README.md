# Abbreviation

An abbreviation or acronym in screen text with a quick, accessible way to discover its meaning.

## When to use

Labels and column headers where the full form would cause clipping or scrolling, or where the abbreviation is universally understood in the context. Prefer the full form wherever possible.

## What you provide

- `short`, `expansion` (required), `glossaryHref`, `showDiscovery` (default true).
- `region` (optional): chooses the "do not use" list checked in development.

```tsx
<th><Abbreviation short="BMI" expansion="Body mass index" glossaryHref="/help/glossary#bmi" /></th>
```

## Guidance implemented

- abbracs 3.2 avoid abbreviations in labels where possible; use only when needed.
- abbracs 3.2 never use known dangerous abbreviations in labels: a development console error names the problem.
- abbracs 3.2 provide a simple, quick, accessible method of discovering the meaning: an info button reveals the expansion and an optional glossary link; tooltips are not relied on alone.
- abbracs 3.2 the user may opt out of the discovery method (`showDiscovery={false}`).
- abbracs 3.3 present consistently: use `isAcronymWellFormed` ("ENT") and `formatAbbreviation` ("Tib.Ant.") to prepare `short`.
- Uses `<abbr title>` as well [suggested; the guidance must stand without it].

## Do and don't

- Do write acronyms in capitals with no full stops or spaces ("ENT").
- Do write abbreviations as "Tib.Ant." (each truncated word capitalised and followed by a full stop).
- Don't use dangerous abbreviations such as "U", "qd" or "MS" in labels.

## Accessibility

The discovery control is a real button with `aria-expanded` and an accessible name ("What does BMI mean?"). Esc or clicking elsewhere closes the panel.

## Regional behaviour

The development check (console error when a known dangerous abbreviation is used as a label) uses the region's list: GB the abbracs Appendix A, B and C list; AU the ACSQHC 2024 "do not use" terms (G10 9.1); NZ the HQSC "DO NOT USE" list (G11 8.3). AU guidance also says medicines information should be written out in full on screen and abbreviations kept for tight spaces with an expansion available (G10 9.1, digital systems).
